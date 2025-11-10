import React from 'react';
import type { Customer, DeliveryAgent } from '../data/mock';

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

  const setScanned = React.useCallback((val: boolean) => {
    setState((s) => ({ ...s, scanned: val }));
  }, []);

  const loginAs = React.useCallback((role: AuthRole, entity: Customer | DeliveryAgent) => {
    if (role === 'customer') {
      setState({ role, scanned: true, customer: entity as Customer, agent: null });
    } else {
      setState({ role, scanned: true, customer: null, agent: entity as DeliveryAgent });
    }
  }, []);

  const logout = React.useCallback(() => {
    setState({ role: null, scanned: false, customer: null, agent: null });
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
