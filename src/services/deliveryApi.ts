import { supabase, SUPABASE_CONFIGURED } from '../lib/supabaseClient';

// Minimal shared types for Seller app usage
export type Shift = 'morning' | 'evening';
export type Assignment = {
  id: string;
  ownerId: string;
  deliveryAgentId: string;
  customerId: string;
  date: string;
  shift: Shift;
  liters: number;
  delivered: boolean;
  assignedAt: string;
  unassignedAt: string | null;
};
export type Customer = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address?: string;
  plan?: string;
  planType?: string;
  createdAt: string;
  updatedAt: string;
};
export type DeliveryAgent = {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  area?: string;
  loginId?: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchCustomers(): Promise<Customer[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  const { data: u } = await supabase.auth.getUser();
  const ownerId = u?.user?.id;
  let query = supabase
    .from('customers')
    .select('id,user_id,name,phone,address,plan,plan_type,created_at,updated_at');
  if (ownerId) query = query.eq('user_id', ownerId);
  const { data, error } = await query.order('name', { ascending: true });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    phone: r.phone,
    address: r.address ?? undefined,
    plan: r.plan ?? undefined,
    planType: r.plan_type ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function fetchDeliveryAgents(): Promise<DeliveryAgent[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  const { data: u } = await supabase.auth.getUser();
  const ownerId = u?.user?.id;
  let query = supabase
    .from('delivery_agents')
    .select('id,owner_id,name,phone,area,login_id,created_at,updated_at');
  if (ownerId) query = query.eq('owner_id', ownerId);
  const { data, error } = await query.order('name', { ascending: true });
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
  const { data: u } = await supabase.auth.getUser();
  const ownerId = u?.user?.id;
  let query = supabase
    .from('delivery_assignments_view')
    .select('id,owner_id,delivery_agent_id,customer_id,date,shift,liters,delivered,assigned_at,unassigned_at');
  if (ownerId) query = query.eq('owner_id', ownerId);
  if (params?.from) query = query.gte('date', params.from);
  if (params?.to) query = query.lte('date', params.to);
  if (params?.agentId) query = query.eq('delivery_agent_id', params.agentId);
  const { data, error } = await query.order('date', { ascending: true }).order('shift', { ascending: true });
  if (error) throw error;
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
}

export async function insertAssignment(input: { customerId: string; deliveryAgentId: string }): Promise<void> {
  if (!SUPABASE_CONFIGURED || !supabase) return;
  const { data: u } = await supabase.auth.getUser();
  const ownerId = u?.user?.id;
  if (!ownerId) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('delivery_assignments')
    .insert({
      owner_id: ownerId,
      delivery_agent_id: input.deliveryAgentId,
      customer_id: input.customerId,
    });
  if (error) throw error;
}

export async function setDeliveryStatus(
  assignmentId: string,
  date: string,
  shift: Shift,
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
