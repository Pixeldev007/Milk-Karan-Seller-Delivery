import React from 'react';
import { Assignment, Customer, DeliveryAgent, Product } from '../data/mock';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabaseClient';
import {
  fetchAssignments,
  fetchCustomers,
  fetchDeliveryAgents,
  insertAssignment,
  updateAssignment,
} from '../services/deliveryApi';

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
};

const DeliveryContext = React.createContext<DeliveryContextValue | undefined>(undefined);

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const DeliveryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
      const [cs, ags, asg] = await Promise.all([
        fetchCustomers(),
        fetchDeliveryAgents(),
        fetchAssignments(),
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
  }, []);

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
    if (SUPABASE_CONFIGURED && supabase) {
      await updateAssignment(assignmentId, { delivered: nextVal });
    }
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, delivered: !!nextVal } : a)));
  }, [assignments]);

  const updateAssignmentLiters = React.useCallback(async (assignmentId: string, liters: number) => {
    if (SUPABASE_CONFIGURED && supabase) {
      await updateAssignment(assignmentId, { liters });
    }
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, liters } : a)));
  }, []);

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
    }),
    [ownerId, userId, customers, deliveryAgents, assignments, loading, refresh, connected, addCustomer, assignWork, toggleDelivered, updateAssignmentLiters, getCustomerById, getDeliveryAgentById],
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
