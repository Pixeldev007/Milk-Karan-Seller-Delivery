/**
 * User Profile Helper Functions
 * Functions to interact with user_profiles and business_profiles tables
 */

import { supabase } from './supabase';

/**
 * Get current user's profile
 * @returns {Promise<{data: UserProfile | null, error: Error | null}>}
 */
export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

/**
 * Update current user's profile
 * @param {Object} updates - Profile fields to update
 * @returns {Promise<{data: UserProfile | null, error: Error | null}>}
 */
export async function updateUserProfile(updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

/**
 * Get current user's business profile
 * @returns {Promise<{data: BusinessProfile | null, error: Error | null}>}
 */
export async function getBusinessProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return { data: null, error };
  }
}

/**
 * Create or update business profile
 * @param {Object} profileData - Business profile data
 * @returns {Promise<{data: BusinessProfile | null, error: Error | null}>}
 */
export async function upsertBusinessProfile(profileData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('business_profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error upserting business profile:', error);
    return { data: null, error };
  }
}

/**
 * Get complete user profile (user + business)
 * @returns {Promise<{data: UserCompleteProfile | null, error: Error | null}>}
 */
export async function getCompleteProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_complete_profile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching complete profile:', error);
    return { data: null, error };
  }
}

/**
 * Create user profile if it doesn't exist
 * This is useful if the trigger didn't fire or for manual creation
 * @param {Object} profileData - Initial profile data
 * @returns {Promise<{data: UserProfile | null, error: Error | null}>}
 */
export async function createUserProfile(profileData = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        ...profileData,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { data: null, error };
  }
}


