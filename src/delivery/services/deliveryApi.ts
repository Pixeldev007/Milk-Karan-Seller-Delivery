import { SUPABASE_CONFIGURED, supabase } from '../lib/supabaseClient';
import type { Assignment, Customer, DeliveryAgent } from '../data/mock';

export type AgentDailyDeliveryRow = {
	id: string;
	date: string;
	shift: string;
	quantity: number;
	status: string;
	delivered: boolean;
	customerId?: string;
	customerName?: string;
	customerPhone?: string;
};

export async function fetchCustomers(agentId?: string): Promise<Customer[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];

  if (agentId) {
    const { data: rpc, error: rpcError } = await supabase.rpc('get_agent_customers', { p_agent_id: agentId });
    if (!rpcError && rpc && rpc.length > 0) {
      return rpc.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        phone: r.phone,
        address: r.address ?? undefined,
        product: (r.product as any) ?? 'Buffalo Milk',
        rate: Number((r.rate as any) ?? 0),
        plan: r.plan ?? '',
        planType: r.plan_type ?? 'Daily',
        preferredShift: (r.preferred_shift as any) ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }

    try {
      const { data: asg } = await supabase
        .from('delivery_assignments_view')
        .select('customer_id')
        .eq('delivery_agent_id', agentId);
      const ids = Array.from(
        new Set(
          (asg || [])
            .map((r: any) => r.customer_id)
            .filter((id: any) => typeof id === 'string' && id.length > 0),
        ),
      );
      if (ids.length > 0) {
        const { data, error } = await supabase
          .from('customers')
          .select('id,user_id,name,phone,address,plan,plan_type,preferred_shift,created_at,updated_at')
          .in('id', ids)
          .order('name', { ascending: true });
        if (error) throw error;
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
          preferredShift: (r.preferred_shift as any) ?? undefined,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch {}
  }

  const { data, error } = await supabase
    .from('customers')
    .select('id,user_id,name,phone,address,plan,plan_type,preferred_shift,created_at,updated_at')
    .order('name', { ascending: true });
  if (error) throw error;
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
    preferredShift: (r.preferred_shift as any) ?? undefined,
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

export async function fetchDeliveryAgents(agentId?: string): Promise<DeliveryAgent[]> {
  if (!SUPABASE_CONFIGURED || !supabase) return [];
  // If agentId provided, prefer RPC to bypass RLS constraints
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
  // Otherwise, attempt direct select (when authenticated)
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

  const from = params?.from;
  const to = params?.to;

  // Prefer RPC first (ensures id = delivery_assignments.id). View is fallback only.
  if (params?.agentId) {
    try {
      const { data: rpc } = await supabase.rpc('get_agent_assignments', {
        p_agent_id: params.agentId,
        p_from: from ?? to ?? null,
        p_to: to ?? from ?? null,
      });
      // Include both shifts; dedupe by customer+shift in case of duplicates
      const seen = new Map<string, any>();
      for (const r of rpc || []) {
        const key = `${r.customer_id}-${r.shift || 'morning'}`;
        if (!seen.has(key)) seen.set(key, r);
      }
      const rows = Array.from(seen.values());
      if (rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id, // assignment id
          ownerId: r.owner_id,
          customerId: r.customer_id,
          deliveryAgentId: r.delivery_agent_id,
          date: r.date,
          shift: (r.shift as any) ?? 'morning',
          liters: Number(r.liters ?? 0),
          delivered: Boolean(r.delivered),
          assignedAt: r.assigned_at,
          unassignedAt: r.unassigned_at ?? null,
        }));
      }
    } catch (_e) {
      // fall through to view
    }
  }

  // Fallback: use view (id may be daily_deliveries.id, so toggling may be limited)
  try {
    let query = supabase
      .from('delivery_assignments_view')
      .select('id,owner_id,delivery_agent_id,customer_id,date,shift,liters,delivered,assigned_at,unassigned_at');
    if (params?.agentId) query = query.eq('delivery_agent_id', params.agentId);
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    const { data, error } = await query.order('date', { ascending: true }).order('shift', { ascending: true });
    if (error) throw error;
    const uniqueByCustomerShift = new Map<string, any>();
    for (const r of data || []) {
      const key = `${r.customer_id}-${r.shift || 'morning'}`;
      if (!uniqueByCustomerShift.has(key)) uniqueByCustomerShift.set(key, r);
    }
    const filteredData = Array.from(uniqueByCustomerShift.values());
    return filteredData.map((r: any) => ({
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
  } catch {
    return [];
  }
}

export async function fetchAgentDailyDeliveries(params: { date: string; agentId?: string }): Promise<AgentDailyDeliveryRow[]> {
	if (!SUPABASE_CONFIGURED || !supabase) return [];
	const { date, agentId } = params;
	try {
		let query = supabase
			.from('daily_deliveries')
			.select(
				'id, delivery_date, shift, quantity, status, customer_id, customer:customers!daily_deliveries_customer_id_fkey(id, name, phone)',
			);
		query = query.eq('delivery_date', date);
		if (agentId) {
			query = query.eq('delivery_agent_id', agentId);
		}
		const { data, error } = await query.order('updated_at', { ascending: false });
		if (error) throw error;
		return (data || []).map((row: any) => ({
			id: row.id,
			date: row.delivery_date,
			shift: row.shift,
			quantity: Number(row.quantity ?? 0),
			status: row.status,
			delivered: row.status === 'Delivered',
			customerId: row.customer?.id,
			customerName: row.customer?.name,
			customerPhone: row.customer?.phone,
		}));
	} catch {
		return [];
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
    p_liters: (Number.isFinite(liters as number) ? (liters as number) : 0),
  });
  if (error) {
    const msg = String((error as any).message || '');
    const code = (error as any).code;
    if (
      code === '23505' ||
      msg.includes('duplicate key value') ||
      msg.includes('dd_owner_date_customer_unique')
    ) {
      return;
    }
    throw error;
  }
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
  const p = phone.replace(/\D+/g, '').trim();
  // Try SECURITY DEFINER RPC (bypasses RLS for anon users)
  try {
    const { data: rpc } = await supabase.rpc('login_customer_by_name_phone', {
      p_name: n,
      p_phone: p,
    });
    const row: any = Array.isArray(rpc) ? rpc?.[0] : rpc;
    if (row) {
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        phone: row.phone,
        address: row.address ?? undefined,
        product: (row.product as any) ?? 'Buffalo Milk',
        rate: Number((row.rate as any) ?? 0),
        plan: row.plan ?? '',
        planType: row.plan_type ?? 'Daily',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
  } catch {}
  // Fallback: direct select (only if RLS allows)
  const { data, error } = await supabase
    .from('customers')
    .select('id,user_id,name,phone,address,plan,plan_type,product,rate,created_at,updated_at')
    .ilike('name', n)
    .or(`phone.eq.${p},phone.eq.+91${p}`)
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
    product: (data.product as any) ?? 'Buffalo Milk',
    rate: Number((data.rate as any) ?? 0),
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
