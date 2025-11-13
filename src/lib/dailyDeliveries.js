import { supabase } from './supabase';
import { requireUser } from './session';

export async function listDailyDeliveries({ date, deliveryAgentId }) {
  const user = await requireUser();
  // Join daily_deliveries -> delivery_assignments to get agent and customer
  // and embed agent/customer details for UI
  let query = supabase
    .from('daily_deliveries')
    .select(`
      id, date, shift, liters, delivered,
      delivery_assignments:delivery_assignments!inner(
        id, delivery_agent_id, customer_id,
        delivery_agents:delivery_agents(id, name, phone),
        customers:customers(id, name, phone)
      )
    `)
    .eq('owner_id', user.id)
    .eq('date', date)
    .order('updated_at', { ascending: false });

  if (deliveryAgentId && deliveryAgentId !== 'all') {
    query = query.eq('delivery_assignments.delivery_agent_id', deliveryAgentId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    quantity: Number(row.liters ?? 0),
    status: row.delivered ? 'Delivered' : 'Pending',
    deliveryAgent: row.delivery_assignments?.delivery_agents
      ? {
          id: row.delivery_assignments.delivery_agents.id,
          name: row.delivery_assignments.delivery_agents.name,
          phone: row.delivery_assignments.delivery_agents.phone,
        }
      : null,
    customer: row.delivery_assignments?.customers
      ? {
          id: row.delivery_assignments.customers.id,
          name: row.delivery_assignments.customers.name,
          phone: row.delivery_assignments.customers.phone,
        }
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
