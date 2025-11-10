import { supabase } from './supabase';
import { requireUser } from './session';

export async function listPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, code, name, price, customer_limit, features, is_active')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getCurrentSubscription() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id, status, starts_at, ends_at, plan:subscription_plans(id, name, code, price, features)')
    .eq('owner_id', user.id)
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
