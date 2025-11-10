import { supabase } from './supabase';

export async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('User not authenticated');
  }

  return user;
}
