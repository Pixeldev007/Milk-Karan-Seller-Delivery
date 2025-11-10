import { supabase } from './supabase';
import { requireUser } from './session';

export async function listDailyDeliveries({ date, deliveryAgentId }) {
  const user = await requireUser();
  let query = supabase
    .from('daily_deliveries')
    .select(
      `id, delivery_date, quantity, status, delivery_agent_id, customer_id,
       delivery_agents:delivery_agents(id, name, phone),
       customers:customers(id, name, phone)`
    )
    .eq('owner_id', user.id)
    .eq('delivery_date', date)
    .order('created_at', { ascending: false });

  if (deliveryAgentId && deliveryAgentId !== 'all') {
    query = query.eq('delivery_agent_id', deliveryAgentId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.delivery_date,
    quantity: Number(row.quantity),
    status: row.status,
    deliveryAgent: row.delivery_agents ? {
      id: row.delivery_agents.id,
      name: row.delivery_agents.name,
      phone: row.delivery_agents.phone,
    } : null,
    customer: row.customers ? {
      id: row.customers.id,
      name: row.customers.name,
      phone: row.customers.phone,
    } : null,
  }));
}

export async function toggleDeliveryStatus(id, nextStatus) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('daily_deliveries')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('id, status')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureDailyDelivery(payload) {
  const user = await requireUser();
  const insertPayload = {
    owner_id: user.id,
    delivery_date: payload.date,
    delivery_agent_id: payload.deliveryAgentId ?? null,
    customer_id: payload.customerId,
    quantity: payload.quantity,
    status: payload.status ?? 'Pending',
  };

  const { data, error } = await supabase
    .from('daily_deliveries')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
