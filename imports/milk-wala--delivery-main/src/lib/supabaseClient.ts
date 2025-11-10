import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra || {}) as Record<string, any>;

const supabaseUrl =
  (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ||
  (extra.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
  (extra.NEXT_PUBLIC_SUPABASE_URL as string | undefined);

const supabaseAnonKey =
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  (extra.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  (extra.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = SUPABASE_CONFIGURED
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        detectSessionInUrl: false,
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null;
