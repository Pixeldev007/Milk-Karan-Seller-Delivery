import { supabase } from './supabase';
import { requireUser } from './session';

export async function listDailyDeliveries({ date, deliveryAgentId }) {
  const user = await requireUser();
  // Query daily_deliveries with current schema fields and join FKs explicitly
  let query = supabase
    .from('daily_deliveries')
    .select(`
      id, delivery_date, shift, quantity, status, delivery_agent_id, customer_id,
      agent:delivery_agents!daily_deliveries_delivery_agent_id_fkey(id, name, phone),
      customer:customers!daily_deliveries_customer_id_fkey(id, name, phone)
    `)
    .eq('owner_id', user.id)
    .eq('delivery_date', date)
    .order('updated_at', { ascending: false });

  if (deliveryAgentId && deliveryAgentId !== 'all') {
    query = query.eq('delivery_agent_id', deliveryAgentId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.delivery_date,
    quantity: Number(row.quantity ?? 0),
    status: row.status,
    delivered: row.status === 'Delivered',
    deliveryAgent: row.agent
      ? { id: row.agent.id, name: row.agent.name, phone: row.agent.phone }
      : null,
    customer: row.customer
      ? { id: row.customer.id, name: row.customer.name, phone: row.customer.phone }
      : null,
  }));
}

export async function listCustomerDeliveries({ date }) {
  // Customer app: get the current customer's id
  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('id, product')
    .eq('user_id', supabase.auth.user()?.id)
    .single();
  if (custError || !customer) throw new Error('Customer not found');

  // Fetch delivered rows for that date; only expose minimal fields
  const { data, error } = await supabase
    .from('daily_deliveries')
    .select('id, delivery_date, shift, quantity, status')
    .eq('customer_id', customer.id)
    .eq('status', 'Delivered')
    .eq('delivery_date', date)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    date: row.delivery_date,
    shift: row.shift,
    quantity: Number(row.quantity),
    product: customer.product || 'Milk',
    status: row.status,
  }));
}

export async function listCustomerDeliveriesRange({ customerId, from, to }) {
  const user = await requireUser();

  let query = supabase
    .from('daily_deliveries')
    .select('id, delivery_date, quantity, status')
    .eq('owner_id', user.id)
    .eq('customer_id', customerId);

  if (from) {
    query = query.gte('delivery_date', from);
  }
  if (to) {
    query = query.lte('delivery_date', to);
  }

  const { data, error } = await query.order('delivery_date', { ascending: true });
  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    date: row.delivery_date,
    quantity: Number(row.quantity ?? 0),
    status: row.status,
  }));
}

export async function ensureDailyDelivery(payload) {
  // Deprecated in new flow, kept as no-op helper mapping if still used elsewhere
  const user = await requireUser();
  const insertPayload = {
    owner_id: user.id,
    date: payload.date,
    // shift, assignment_id should be set via server RPC in the delivery app; this path is rarely used.
    liters: payload.quantity ?? 0,
    delivered: payload.status === 'Delivered',
  };
  const { data, error } = await supabase
    .from('daily_deliveries')
    .insert(insertPayload)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}
