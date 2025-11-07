/**
 * Customer Helper Functions
 * Functions to interact with customers table in Supabase
 */

import { supabase } from './supabase';

/**
 * Get all customers for the current user
 * @returns {Promise<{data: Customer[] | null, error: Error | null}>}
 */
export async function getCustomers() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, address, plan, plan_type, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { data: null, error };
  }
}

/**
 * Add a new customer
 * @param {Object} customerData - Customer data
 * @param {string} customerData.name - Customer name
 * @param {string} customerData.phone - Customer phone
 * @param {string} customerData.address - Customer address
 * @param {string} customerData.plan - Milk plan (e.g., "1L/day")
 * @param {string} customerData.planType - Plan type: "Daily" or "Seasonal"
 * @returns {Promise<{data: Customer | null, error: Error | null}>}
 */
export async function addCustomer(customerData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        name: customerData.name.trim(),
        phone: customerData.phone.trim(),
        address: customerData.address.trim(),
        plan: customerData.plan.trim(),
        plan_type: customerData.planType || 'Daily',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding customer:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing customer
 * @param {string} customerId - Customer ID
 * @param {Object} updates - Customer data to update
 * @returns {Promise<{data: Customer | null, error: Error | null}>}
 */
export async function updateCustomer(customerId, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('customers')
      .update({
        name: updates.name?.trim(),
        phone: updates.phone?.trim(),
        address: updates.address?.trim(),
        plan: updates.plan?.trim(),
        plan_type: updates.planType || 'Daily',
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
      .eq('user_id', user.id) // Ensure user owns this customer
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating customer:', error);
    return { data: null, error };
  }
}

/**
 * Delete a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<{error: Error | null}>}
 */
export async function deleteCustomer(customerId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)
      .eq('user_id', user.id); // Ensure user owns this customer

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return { error };
  }
}

/**
 * Search customers by query
 * @param {string} searchQuery - Search query
 * @returns {Promise<{data: Customer[] | null, error: Error | null}>}
 */
export async function searchCustomers(searchQuery) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const query = searchQuery.toLowerCase();
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, address, plan, plan_type, created_at, updated_at')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,address.ilike.%${query}%,plan.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching customers:', error);
    return { data: null, error };
  }
}

