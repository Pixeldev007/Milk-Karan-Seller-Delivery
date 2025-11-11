import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [deliveryAgent, setDeliveryAgent] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;
        if (error) {
          setAuthError(error.message);
        }
        setSession(currentSession ?? null);
      } catch (err) {
        if (!mounted) return;
        setAuthError(err.message);
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    fetchSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authError) {
      Alert.alert('Authentication Error', authError);
      setAuthError(null);
    }
  }, [authError]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      // role is derived from Supabase user metadata if present, otherwise from deliveryAgent local login
      role: session?.user?.user_metadata?.role ?? (deliveryAgent ? 'delivery' : null),
      deliveryAgent,
      initializing,
      signIn: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw new Error(error.message);
        }
      },
      // Delivery login by login_id OR name + phone. Tries RPC first to bypass RLS for anon.
      deliverySignInByNamePhone: async ({ name, phone }) => {
        const normalizedName = (name || '').trim();
        const normalizedPhone = (phone || '').replace(/\s+/g, '');
        if (!normalizedName || !normalizedPhone) {
          throw new Error('Name and phone are required');
        }
        // Try SECURITY DEFINER RPC (accepts login_id OR name in first arg)
        const { data: rpcData, error: rpcError } = await supabase.rpc('login_delivery_agent', {
          p_identifier: normalizedName,
          p_phone: normalizedPhone,
        });
        if (!rpcError && rpcData) {
          const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
          if (row) {
            setDeliveryAgent(row);
            return;
          }
        }
        // Fallback: direct select (will work only if policies allow)
        const { data, error } = await supabase
          .from('delivery_agents')
          .select('*')
          .or(`login_id.eq.${normalizedName},name.eq.${normalizedName}`)
          .eq('phone', normalizedPhone)
          .limit(1)
          .maybeSingle();
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('Invalid name or phone number');
        }
        setDeliveryAgent(data);
      },
      signUp: async ({ email, password, fullName }) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: fullName ? { full_name: fullName } : undefined,
          },
        });
        if (error) {
          throw new Error(error.message);
        }
      },
      signOut: async () => {
        // Clear both Supabase session (if any) and deliveryAgent local session
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            // ignore if user was not signed in via Supabase email/password
            // still proceed to clear local state
          }
        } finally {
          setDeliveryAgent(null);
        }
      },
    }),
    [session, initializing, deliveryAgent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
