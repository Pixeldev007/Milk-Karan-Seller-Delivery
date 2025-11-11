import { SUPABASE_CONFIGURED, supabase } from '../lib/supabaseClient';
import type { Assignment, Customer, DeliveryAgent } from '../data/mock';

export async function fetchCustomers(): Promise<Customer[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  const { data, error } = await supabase
    .from('customers')
    // Only select columns we are sure exist per provided schema to avoid errors
    .select('id,user_id,name,phone,address,plan,plan_type,created_at,updated_at')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    phone: r.phone,
    address: r.address ?? undefined,
    // Fallbacks if product/rate not present in schema
    product: (r.product as any) ?? 'Buffalo Milk',
    rate: Number((r.rate as any) ?? 0),
    plan: r.plan ?? '',
    planType: r.plan_type ?? 'Daily',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function fetchDeliveryAgents(): Promise<DeliveryAgent[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('id,owner_id,name,phone,area,login_id,created_at,updated_at')
    .order('name', { ascending: true });
  if (error) throw error;
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
}

export async function fetchAssignments(params?: { from?: string; to?: string; agentId?: string }): Promise<Assignment[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  // Try selecting full schema first
  try {
    let query = supabase
      .from('delivery_assignments_view')
      .select('id,owner_id,delivery_agent_id,customer_id,date,shift,liters,delivered,assigned_at,unassigned_at');
    if (params?.from) query = query.gte('date', params.from);
    if (params?.to) query = query.lte('date', params.to);
    if (params?.agentId) query = query.eq('delivery_agent_id', params.agentId);
    const { data, error } = await query.order('date', { ascending: true }).order('shift', { ascending: true });
    if (error) throw error;
    // If no daily rows exist yet, fallback to base table to show raw assignments
    if (!data || data.length === 0) {
      let q2 = supabase
        .from('delivery_assignments')
        .select('id,owner_id,delivery_agent_id,customer_id,assigned_at,unassigned_at');
      const { data: base, error: e2 } = await q2.order('assigned_at', { ascending: false });
      if (e2) throw e2;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const iso = today.toISOString().slice(0, 10);
      return (base || []).map((r: any) => ({
        id: r.id,
        ownerId: r.owner_id,
        customerId: r.customer_id,
        deliveryAgentId: r.delivery_agent_id,
        date: iso,
        shift: 'morning',
        liters: 0,
        delivered: false,
        assignedAt: r.assigned_at,
        unassignedAt: r.unassigned_at ?? null,
      }));
    }
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
  } catch (_err) {
    // Fallback to minimal columns if some don't exist yet; synthesize defaults for UI
    let query = supabase
      .from('delivery_assignments')
      .select('id,owner_id,delivery_agent_id,customer_id,assigned_at,unassigned_at');
    const { data, error } = await query.order('assigned_at', { ascending: false });
    if (error) throw error;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const iso = today.toISOString().slice(0, 10);
    return (data || []).map((r: any) => ({
      id: r.id,
      ownerId: r.owner_id,
      customerId: r.customer_id,
      deliveryAgentId: r.delivery_agent_id,
      date: iso,
      shift: 'morning',
      liters: 0,
      delivered: false,
      assignedAt: r.assigned_at,
      unassignedAt: r.unassigned_at ?? null,
    }));
  }
}

export async function insertAssignment(payload: Omit<Assignment, 'id' | 'assignedAt' | 'unassignedAt'>): Promise<Assignment | null> {
  if (!SUPABASE_CONFIGURED || !supabase) return null;
  const { data, error } = await supabase
    .from('delivery_assignments')
    .insert({
      owner_id: payload.ownerId,
      delivery_agent_id: payload.deliveryAgentId,
      customer_id: payload.customerId,
      date: payload.date,
      shift: payload.shift,
      liters: payload.liters,
      delivered: payload.delivered,
    })
    .select('id,owner_id,delivery_agent_id,customer_id,date,shift,liters,delivered,assigned_at,unassigned_at')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    ownerId: data.owner_id,
    deliveryAgentId: data.delivery_agent_id,
    customerId: data.customer_id,
    date: data.date,
    shift: data.shift,
    liters: Number(data.liters ?? 0),
    delivered: Boolean(data.delivered),
    assignedAt: data.assigned_at,
    unassignedAt: data.unassigned_at ?? null,
  };
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
