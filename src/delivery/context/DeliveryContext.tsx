import React from 'react';
import { Assignment, Customer, DeliveryAgent, Product } from '../data/mock';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabaseClient';
import {
  fetchAssignments,
  fetchCustomers,
  fetchDeliveryAgents,
  insertAssignment,
  updateAssignment,
  setDeliveryStatus,
  startDeliveryTrip,
  recordDeliveryCall,
  completeDelivery,
} from '../services/deliveryApi';
import { useAuth } from '../context/AuthContext';

type Shift = Assignment['shift'];

type NewCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
type AssignmentInput = {
  customerId: string;
  deliveryAgentId: string;
  date: string;
  shift: Shift;
  liters: number;
  delivered?: boolean;
};

type DeliveryContextValue = {
  ownerId: string;
  userId: string;
  customers: Customer[];
  deliveryAgents: DeliveryAgent[];
  assignments: Assignment[];
  loading: boolean;
  refresh: () => Promise<void>;
  configured: boolean;
  connected: boolean;
  addCustomer: (input: NewCustomerInput) => void;
  assignWork: (input: AssignmentInput) => void;
  toggleDelivered: (assignmentId: string, delivered?: boolean) => void;
  updateAssignmentLiters: (assignmentId: string, liters: number) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getDeliveryAgentById: (id: string) => DeliveryAgent | undefined;
  startTrip: (assignmentId: string, date: string, shift: Shift) => Promise<string | null>;
  recordCall: (tripId: string) => Promise<void>;
  completeTrip: (
    tripId: string,
    params: { delivered: boolean; liters: number; rate: number; product: string; failureReason?: string | null },
  ) => Promise<void>;
};

const DeliveryContext = React.createContext<DeliveryContextValue | undefined>(undefined);

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const DeliveryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { agent } = useAuth();
  const [ownerId, setOwnerId] = React.useState<string>('');
  const [userId, setUserId] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [deliveryAgents, setDeliveryAgents] = React.useState<DeliveryAgent[]>([]);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [connected, setConnected] = React.useState<boolean>(SUPABASE_CONFIGURED && !!supabase);

  // Initialize session context
  React.useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id || '';
      setOwnerId(uid); // If seller logs in, ownerId = uid
      setUserId(uid);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || '';
      setOwnerId(uid);
      setUserId(uid);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const refresh = React.useCallback(async () => {
    if (!SUPABASE_CONFIGURED || !supabase) {
      setCustomers([]);
      setDeliveryAgents([]);
      setAssignments([]);
      setConnected(false);
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const fromD = new Date(now);
      fromD.setDate(fromD.getDate() - 7);
      const toD = new Date(now);
      toD.setDate(toD.getDate() + 7);
      const toISO = (d: Date) => new Date(d).toISOString().slice(0, 10);
      const [cs, ags, asg] = await Promise.all([
        fetchCustomers(agent?.id),
        fetchDeliveryAgents(agent?.id),
        fetchAssignments({ agentId: agent?.id, from: toISO(fromD), to: toISO(toD) }),
      ]);
      setCustomers(cs);
      setDeliveryAgents(ags);
      setAssignments(asg);
      setConnected(true);
    } catch (_e) {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [agent?.id]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const addCustomer = React.useCallback((input: NewCustomerInput) => {
    // Seller adds customers in Seller app; no-op here (kept for API compatibility)
    setCustomers((prev) => prev);
  }, []);

  const assignWork = React.useCallback(async (input: AssignmentInput) => {
    const payload = {
      ownerId: ownerId,
      customerId: input.customerId,
      deliveryAgentId: input.deliveryAgentId,
      date: input.date,
      shift: input.shift,
      liters: input.liters,
      delivered: input.delivered ?? false,
    } as Omit<Assignment, 'id' | 'assignedAt' | 'unassignedAt'>;
    if (!SUPABASE_CONFIGURED || !supabase) return;
    const created = await insertAssignment(payload);
    if (created) setAssignments((prev) => [...prev, created]);
  }, [ownerId]);

  const toggleDelivered = React.useCallback(async (assignmentId: string, delivered?: boolean) => {
    const current = assignments.find((a) => a.id === assignmentId);
    const nextVal = delivered ?? !current?.delivered;
    // Persist via RPC to daily_deliveries using date/shift
    if (SUPABASE_CONFIGURED && supabase && current?.date && current?.shift) {
      await setDeliveryStatus(assignmentId, current.date, current.shift, !!nextVal, current.liters);
    }
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, delivered: !!nextVal } : a)));
  }, [assignments]);

  const updateAssignmentLiters = React.useCallback(async (assignmentId: string, liters: number) => {
    if (SUPABASE_CONFIGURED && supabase) {
      await updateAssignment(assignmentId, { liters });
    }
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, liters } : a)));
  }, []);

  const startTrip = React.useCallback(async (assignmentId: string, date: string, shift: Shift) => {
    const tripId = await startDeliveryTrip(assignmentId, date, shift);
    await refresh();
    return tripId;
  }, [refresh]);

  const recordCall = React.useCallback(async (tripId: string) => {
    await recordDeliveryCall(tripId);
    await refresh();
  }, [refresh]);

  const completeTrip = React.useCallback(async (
    tripId: string,
    params: { delivered: boolean; liters: number; rate: number; product: string; failureReason?: string | null },
  ) => {
    await completeDelivery(tripId, params);
    await refresh();
  }, [refresh]);

  const getCustomerById = React.useCallback(
    (id: string) => customers.find((customer) => customer.id === id),
    [customers],
  );

  const getDeliveryAgentById = React.useCallback(
    (id: string) => deliveryAgents.find((agent) => agent.id === id),
    [deliveryAgents],
  );

  const value = React.useMemo<DeliveryContextValue>(
    () => ({
      ownerId,
      userId,
      customers,
      deliveryAgents,
      assignments,
      loading,
      refresh,
      configured: SUPABASE_CONFIGURED,
      connected,
      addCustomer,
      assignWork,
      toggleDelivered,
      updateAssignmentLiters,
      getCustomerById,
      getDeliveryAgentById,
      startTrip,
      recordCall,
      completeTrip,
    }),
    [ownerId, userId, customers, deliveryAgents, assignments, loading, refresh, connected, addCustomer, assignWork, toggleDelivered, updateAssignmentLiters, getCustomerById, getDeliveryAgentById, startTrip, recordCall, completeTrip],
  );

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
};

export const useDelivery = () => {
  const context = React.useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

export type { Assignment, Product, DeliveryAgent };
