import { SUPABASE_CONFIGURED, supabase } from '../lib/supabaseClient';
import type { Assignment, Customer, DeliveryAgent } from '../data/mock';

export async function fetchCustomers(agentId?: string): Promise<Customer[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id,user_id,name,phone,address,plan,plan_type,created_at,updated_at')
      .order('name', { ascending: true });
    if (error) throw error;
    if (!data?.length && agentId) {
      const { data: rpc } = await supabase.rpc('get_agent_customers', { p_agent_id: agentId });
      return (rpc || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        phone: r.phone,
        address: r.address ?? undefined,
        product: (r.product as any) ?? 'Buffalo Milk',
        rate: Number((r.rate as any) ?? 0),
        plan: r.plan ?? '',
        planType: r.plan_type ?? 'Daily',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      phone: r.phone,
      address: r.address ?? undefined,
      product: (r.product as any) ?? 'Buffalo Milk',
      rate: Number((r.rate as any) ?? 0),
      plan: r.plan ?? '',
      planType: r.plan_type ?? 'Daily',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } catch (e) {
    if (agentId) {
      const { data: rpc } = await supabase.rpc('get_agent_customers', { p_agent_id: agentId });
      return (rpc || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        phone: r.phone,
        address: r.address ?? undefined,
        product: (r.product as any) ?? 'Buffalo Milk',
        rate: Number((r.rate as any) ?? 0),
        plan: r.plan ?? '',
        planType: r.plan_type ?? 'Daily',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    throw e;
  }
}

export async function fetchDeliveryAgents(agentId?: string): Promise<DeliveryAgent[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('delivery_agents')
      .select('id,owner_id,name,phone,area,login_id,created_at,updated_at')
      .order('name', { ascending: true });
    if (error) throw error;
    if (!data?.length && agentId) {
      const { data: rpc } = await supabase.rpc('get_agent_delivery_agents', { p_agent_id: agentId });
      return (rpc || []).map((r: any) => ({
        id: r.id,
        ownerId: r.owner_id,
        name: r.name,
        phone: r.phone,
        area: r.area ?? undefined,
        loginId: r.login_id ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      ownerId: r.owner_id,
      name: r.name,
      phone: r.phone,
      area: r.area ?? undefined,
      loginId: r.login_id ?? undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } catch (e) {
    if (agentId) {
      const { data: rpc } = await supabase.rpc('get_agent_delivery_agents', { p_agent_id: agentId });
      return (rpc || []).map((r: any) => ({
        id: r.id,
        ownerId: r.owner_id,
        name: r.name,
        phone: r.phone,
        area: r.area ?? undefined,
        loginId: r.login_id ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    throw e;
  }
}

export async function fetchAssignments(params?: { from?: string; to?: string; agentIds?: string[] }): Promise<Assignment[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  const range = { from: params?.from ?? null, to: params?.to ?? null };
  const agentIds = params?.agentIds ?? [];
  // Prefer view first (reads from daily_deliveries)
  try {
    let query = supabase
      .from('delivery_assignments_view')
      .select('id,owner_id,delivery_agent_id,customer_id,date,shift,liters,delivered,assigned_at,unassigned_at');
    if (range.from) query = query.gte('date', range.from);
    if (range.to) query = query.lte('date', range.to);
    const { data, error } = await query.order('date', { ascending: true }).order('shift', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('empty');
    return (data || []).map((r: any) => ({
      id: r.id,
      ownerId: r.owner_id,
      customerId: r.customer_id,
      deliveryAgentId: r.delivery_agent_id,
      date: r.date,
      shift: r.shift,
      liters: Number(r.liters ?? 0),
      delivered: Boolean(r.delivered),
      assignedAt: r.assigned_at,
      unassignedAt: r.unassigned_at ?? null,
    }));
  } catch (_e) {
    // Fallback: call RPC per agent and merge
    const results: Assignment[] = [];
    const ids = agentIds.length ? agentIds : [];
    for (const aid of ids) {
      const { data: rpc } = await supabase.rpc('get_agent_assignments', {
        p_agent_id: aid,
        p_from: range.from,
        p_to: range.to,
      });
      (rpc || []).forEach((r: any) => {
        results.push({
          id: r.id,
          ownerId: r.owner_id,
          customerId: r.customer_id,
          deliveryAgentId: r.delivery_agent_id,
          date: r.date,
          shift: (r.shift as any) ?? 'morning',
          liters: Number(r.liters ?? 0),
          delivered: Boolean(r.delivered),
          assignedAt: r.assigned_at,
          unassignedAt: r.unassigned_at ?? null,
        });
      });
    }
    return results;
  }
}

// Seller side creates mappings; delivery app doesn't insert assignments.
export async function insertAssignment(): Promise<Assignment | null> {
  return null;
}

export async function updateAssignment(): Promise<void> {
  return;
}

export async function setDeliveryStatus(
  assignmentId: string,
  date: string,
  shift: Assignment['shift'],
  delivered: boolean,
  liters?: number,
): Promise<void> {
  if (!SUPABASE_CONFIGURED || !supabase) return;
  const { error } = await supabase.rpc('set_delivery_status', {
    p_assignment_id: assignmentId,
    p_date: date,
    p_shift: shift,
    p_delivered: delivered,
    p_liters: liters ?? null,
  });
  if (error) throw error;
}

export async function findCustomerByNamePhone(name: string, phone: string): Promise<Customer | null> {
  if (!SUPABASE_CONFIGURED || !supabase) return null;
  const n = name.trim();
  const p = phone.trim();
  const { data, error } = await supabase
    .from('customers')
    .select('id,user_id,name,phone,address,plan,plan_type,created_at,updated_at')
    .eq('name', n)
    .eq('phone', p)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    phone: data.phone,
    address: data.address ?? undefined,
    // Using safe defaults here because product/rate may not exist in the provided schema
    product: 'Buffalo Milk',
    rate: 0,
    plan: data.plan ?? '',
    planType: data.plan_type ?? 'Daily',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function findAgentByNamePhone(name: string, phone: string): Promise<DeliveryAgent | null> {
  if (!SUPABASE_CONFIGURED || !supabase) return null;
  const n = name.trim();
  const p = phone.trim();
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('id,owner_id,name,phone,area,login_id,created_at,updated_at')
    .eq('name', n)
    .eq('phone', p)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    ownerId: data.owner_id,
    name: data.name,
    phone: data.phone,
    area: data.area ?? undefined,
    loginId: data.login_id ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
