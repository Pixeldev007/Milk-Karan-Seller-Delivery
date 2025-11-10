import { supabase } from './supabase';
import { requireUser } from './session';

export async function listProducts() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, unit, price, created_at, updated_at')
    .eq('owner_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createProduct(payload) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('products')
    .insert({
      owner_id: user.id,
      name: payload.name.trim(),
      unit: payload.unit.trim(),
      price: payload.price,
    })
    .select('id, name, unit, price, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProduct(id, payload) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('products')
    .update({
      name: payload.name?.trim(),
      unit: payload.unit?.trim(),
      price: payload.price,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('id, name, unit, price, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeProduct(id) {
  const user = await requireUser();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) {
    throw error;
  }
}
