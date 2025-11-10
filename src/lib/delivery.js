import { supabase } from './supabase';
import { requireUser } from './session';

export async function listDeliveryAgents() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('id, name, phone, area, login_id, created_at, updated_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveDeliveryAgent(agent) {
  const user = await requireUser();
  const payload = {
    owner_id: user.id,
    name: agent.name.trim(),
    phone: agent.phone.trim(),
    area: agent.area?.trim() ?? '',
    login_id: agent.loginId?.trim() || null,
  };

  if (agent.id) {
    const { data, error } = await supabase
      .from('delivery_agents')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', agent.id)
      .eq('owner_id', user.id)
      .select('id, name, phone, area, login_id, created_at, updated_at')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from('delivery_agents')
    .insert(payload)
    .select('id, name, phone, area, login_id, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAgentCredentials(id, credentials) {
  const user = await requireUser();
  const updates = {
    login_id: credentials.loginId?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('delivery_agents')
    .update(updates)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('id, name, phone, area, login_id, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteDeliveryAgent(id) {
  const user = await requireUser();
  const { error } = await supabase
    .from('delivery_agents')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) {
    throw error;
  }
}

export async function listAssignments(ownerAgentId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('delivery_assignments')
    .select('id, customer_id, delivery_agent_id, assigned_at, unassigned_at')
    .eq('owner_id', user.id)
    .eq('delivery_agent_id', ownerAgentId)
    .is('unassigned_at', null);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function replaceAssignments(agentId, customerIds) {
  const user = await requireUser();
  const client = supabase;

  const { error: updError } = await client
    .from('delivery_assignments')
    .update({ unassigned_at: new Date().toISOString() })
    .eq('owner_id', user.id)
    .eq('delivery_agent_id', agentId)
    .is('unassigned_at', null);

  if (updError) {
    throw updError;
  }

  if (!customerIds.length) {
    return [];
  }

  const inserts = customerIds.map((customerId) => ({
    owner_id: user.id,
    delivery_agent_id: agentId,
    customer_id: customerId,
  }));

  const { data, error } = await client
    .from('delivery_assignments')
    .insert(inserts)
    .select('id, customer_id, delivery_agent_id, assigned_at');

  if (error) {
    throw error;
  }

  return data ?? [];
}
