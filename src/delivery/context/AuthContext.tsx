import React from 'react';
import type { Customer, DeliveryAgent } from '../data/mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthRole = 'customer' | 'delivery_boy';

type AuthState = {
  role: AuthRole | null;
  scanned: boolean;
  customer: Customer | null;
  agent: DeliveryAgent | null;
};

type AuthContextValue = {
  role: AuthRole | null;
  scanned: boolean;
  customer: Customer | null;
  agent: DeliveryAgent | null;
  setScanned: (val: boolean) => void;
  loginAs: (role: AuthRole, entity: Customer | DeliveryAgent) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = React.useState<AuthState>({ role: null, scanned: false, customer: null, agent: null });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('delivery_auth_state');
        if (!mounted || !raw) return;
        const parsed: AuthState = JSON.parse(raw);
        setState(parsed);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setScanned = React.useCallback((val: boolean) => {
    setState((s) => ({ ...s, scanned: val }));
  }, []);

  const loginAs = React.useCallback((role: AuthRole, entity: Customer | DeliveryAgent) => {
    if (role === 'customer') {
      const next = { role, scanned: true, customer: entity as Customer, agent: null } as AuthState;
      setState(next);
      AsyncStorage.setItem('delivery_auth_state', JSON.stringify(next)).catch(() => {});
    } else {
      const next = { role, scanned: true, customer: null, agent: entity as DeliveryAgent } as AuthState;
      setState(next);
      AsyncStorage.setItem('delivery_auth_state', JSON.stringify(next)).catch(() => {});
    }
  }, []);

  const logout = React.useCallback(() => {
    const next = { role: null, scanned: false, customer: null, agent: null } as AuthState;
    setState(next);
    AsyncStorage.removeItem('delivery_auth_state').catch(() => {});
  }, []);

  const value = React.useMemo<AuthContextValue>(() => ({
    role: state.role,
    scanned: state.scanned,
    customer: state.customer,
    agent: state.agent,
    setScanned,
    loginAs,
    logout,
  }), [state, setScanned, loginAs, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
