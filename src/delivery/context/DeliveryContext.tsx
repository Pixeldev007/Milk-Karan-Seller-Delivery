import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  toggleDelivered: (assignmentId: string, shift: Shift, delivered?: boolean) => void;
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
  // Local overrides to keep UI state stable across refreshes (per day)
  const [overrideDate, setOverrideDate] = React.useState<string>('');
  const [localDeliveryOverrides, setLocalDeliveryOverrides] = React.useState<Record<string, boolean>>({});

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
      fromD.setDate(fromD.getDate() - 120);
      const toD = new Date(now);
      toD.setDate(toD.getDate() + 40);
      const toISO = (d: Date) => new Date(d).toISOString().slice(0, 10);
      const today = toISO(now);
      // Reset overrides if day changed
      if (overrideDate && overrideDate !== today) {
        setLocalDeliveryOverrides({});
        // Clear persisted overrides for previous day
        if (agent?.id) {
          const key = `deliveryOverrides:${agent.id}:${overrideDate}`;
          await AsyncStorage.removeItem(key).catch(() => {});
        }
      }
      // Load persisted overrides for today (do not setState; just use to apply below)
      let persistedOverrides: Record<string, boolean> = {};
      if (agent?.id) {
        const key = `deliveryOverrides:${agent.id}:${today}`;
        try {
          const raw = await AsyncStorage.getItem(key);
          if (raw) persistedOverrides = JSON.parse(raw);
        } catch {}
      }
      const [cs, ags, asg] = await Promise.all([
        fetchCustomers(agent?.id),
        fetchDeliveryAgents(agent?.id),
        fetchAssignments({ agentId: agent?.id, from: toISO(fromD), to: toISO(toD) }),
      ]);
      setCustomers(cs);
      setDeliveryAgents(ags);
      // Apply local or persisted overrides so manual toggle persists until explicitly changed
      const applied = asg.map((a) => {
        const key = `${a.id}|${a.shift}`;
        const local = key in localDeliveryOverrides ? localDeliveryOverrides[key] : undefined;
        const stored = key in persistedOverrides ? persistedOverrides[key] : undefined;
        const val = typeof local === 'boolean' ? local : stored;
        return typeof val === 'boolean' ? { ...a, delivered: !!val } : a;
      });
      setAssignments(applied);
      setOverrideDate(today);
      setConnected(true);
    } catch (_e) {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [agent?.id, localDeliveryOverrides, overrideDate]);

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

  const toggleDelivered = React.useCallback(async (assignmentId: string, shift: Shift, delivered?: boolean) => {
    const current = assignments.find((a) => a.id === assignmentId && a.shift === shift);
    const nextVal = delivered ?? !current?.delivered;
    // Optimistic UI update + store local override for today
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId && a.shift === shift ? { ...a, delivered: !!nextVal } : a)));
    setLocalDeliveryOverrides((prev) => {
      const updated = { ...prev, [`${assignmentId}|${shift}`]: !!nextVal };
      // Persist immediately for current agent + day to survive logout/login
      const persist = async () => {
        try {
          const today = new Date();
          today.setHours(0,0,0,0);
          const date = new Date(today).toISOString().slice(0,10);
          if (agent?.id) {
            const key = `deliveryOverrides:${agent.id}:${date}`;
            await AsyncStorage.setItem(key, JSON.stringify(updated));
          }
        } catch {}
      };
      persist();
      return updated;
    });

    if (
      SUPABASE_CONFIGURED &&
      supabase &&
      current?.date &&
      current?.shift &&
      Number.isFinite((current?.liters as unknown) as number)
    ) {
      await setDeliveryStatus(assignmentId, current.date, current.shift, !!nextVal, (current!.liters as number));
    }
  }, [assignments, agent?.id]);

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
