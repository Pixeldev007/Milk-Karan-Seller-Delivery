import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase, SUPABASE_CONFIGURED } from './src/lib/supabaseClient';
import type { Session, AuthError } from '@supabase/supabase-js';
import { DeliveryProvider } from './src/context/DeliveryContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) {
      console.warn('Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data, error }: { data: { session: Session | null }; error: AuthError | null }) => {
        if (error) {
          console.warn('Supabase auth getSession error', error);
        } else {
          console.log('Supabase session', data.session);
        }
      });
  }, []);
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <DeliveryProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </DeliveryProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
