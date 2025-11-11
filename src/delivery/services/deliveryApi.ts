import { SUPABASE_CONFIGURED, supabase } from '../lib/supabaseClient';
import type { Assignment, Customer, DeliveryAgent } from '../data/mock';

export async function fetchCustomers(): Promise<Customer[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  const { data: u } = await supabase.auth.getUser();
  const ownerId = u?.user?.id;
  let query = supabase
    .from('customers')
    // Only select columns we are sure exist per provided schema to avoid errors
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
    // Fallbacks if product/rate not present in schema
    product: (r.product as any) ?? 'Buffalo Milk',
    rate: Number((r.rate as any) ?? 0),
    plan: r.plan ?? '',
    planType: r.plan_type ?? 'Daily',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

// RPC-assisted login that works even when RLS blocks anon selects
export async function loginDeliveryAgent(identifier: string, phone: string): Promise<DeliveryAgent | null> {
  if (!SUPABASE_CONFIGURED || !supabase) return null;
  const idf = identifier.trim();
  const p = phone.trim();
  // Try RPC if available
  const { data, error } = await supabase.rpc('login_delivery_agent', {
    p_identifier: idf,
    p_phone: p,
  });
  if (error) {
    // Fallback: try client-side queries (will work if policies permit)
    try {
      let ag = await findAgentByLoginIdPhone(idf, p);
      if (!ag) ag = await findAgentByNamePhone(idf, p);
      return ag;
    } catch (_e) {
      throw error;
    }
  }
  if (!data) return null;
  const r: any = Array.isArray(data) ? data[0] : data;
  if (!r) return null;
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    phone: r.phone,
    area: r.area ?? undefined,
    loginId: r.login_id ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? new Date().toISOString(),
  };
}

// Minimal update helper to modify assignment fields (e.g., liters, delivered)
export async function updateAssignment(
  assignmentId: string,
  patch: Partial<Pick<Assignment, 'liters' | 'delivered' | 'date' | 'shift'>>,
): Promise<void> {
  if (!SUPABASE_CONFIGURED || !supabase) return;
  const updates: Record<string, any> = {};
  if (typeof patch.liters === 'number') updates.liters = patch.liters;
  if (typeof patch.delivered === 'boolean') updates.delivered = patch.delivered;
  if (typeof patch.date === 'string') updates.date = patch.date;
  if (typeof patch.shift === 'string') updates.shift = patch.shift;
  if (Object.keys(updates).length === 0) return;
  const { error } = await supabase
    .from('delivery_assignments')
    .update(updates)
    .eq('id', assignmentId);
  if (error) throw error;
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
  // Try selecting full schema first
  try {
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
    // If no daily rows exist yet, fallback to base table to show raw assignments
    if (!data || data.length === 0) {
      let q2 = supabase
        .from('delivery_assignments')
        .select('id,owner_id,delivery_agent_id,customer_id,assigned_at,unassigned_at');
      if (ownerId) q2 = q2.eq('owner_id', ownerId);
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
    const { data: u2 } = await supabase.auth.getUser();
    const ownerId2 = u2?.user?.id;
    let query = supabase
      .from('delivery_assignments')
      .select('id,owner_id,delivery_agent_id,customer_id,assigned_at,unassigned_at');
    if (ownerId2) query = query.eq('owner_id', ownerId2);
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

// New workflow RPCs
export async function startDeliveryTrip(
  assignmentId: string,
  date: string,
  shift: Assignment['shift'],
): Promise<string | null> {
  if (!SUPABASE_CONFIGURED || !supabase) return null;
  const { data, error } = await supabase.rpc('start_delivery_trip', {
    p_assignment_id: assignmentId,
    p_date: date,
    p_shift: shift,
  });
  if (error) throw error;
  return (data as string) ?? null;
}

export async function recordDeliveryCall(tripId: string): Promise<void> {
  if (!SUPABASE_CONFIGURED || !supabase) return;
  const { error } = await supabase.rpc('record_delivery_call', { p_trip_id: tripId });
  if (error) throw error;
}

export async function completeDelivery(
  tripId: string,
  params: { delivered: boolean; liters: number; rate: number; product: string; failureReason?: string | null },
): Promise<void> {
  if (!SUPABASE_CONFIGURED || !supabase) return;
  const { error } = await supabase.rpc('complete_delivery', {
    p_trip_id: tripId,
    p_delivered: params.delivered,
    p_liters: params.liters,
    p_rate: params.rate,
    p_product: params.product,
    p_failure_reason: params.failureReason ?? null,
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

export async function findAgentByLoginIdPhone(loginId: string, phone: string): Promise<DeliveryAgent | null> {
  if (!SUPABASE_CONFIGURED || !supabase) return null;
  const l = loginId.trim();
  const p = phone.trim();
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('id,owner_id,name,phone,area,login_id,created_at,updated_at')
    .eq('login_id', l)
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
