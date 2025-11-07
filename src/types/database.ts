/**
 * Database Types for Milk Wala
 * These types match the Supabase schema
 */

export interface UserProfile {
  id: string;
  full_name: string | null;
  mobile: string | null;
  category: string | null;
  address: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'Proprietorship' | 'Partnership' | 'Private Ltd' | 'LLP' | null;
  gst_number: string | null;
  address: string | null;
  website: string | null;
  logo_url: string | null;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCompleteProfile {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_created_at: string;
  full_name: string | null;
  mobile: string | null;
  category: string | null;
  address: string | null;
  avatar_url: string | null;
  profile_created_at: string | null;
  profile_updated_at: string | null;
  business_name: string | null;
  business_type: 'Proprietorship' | 'Partnership' | 'Private Ltd' | 'LLP' | null;
  gst_number: string | null;
  website: string | null;
  logo_url: string | null;
  qr_code_url: string | null;
}

export interface UpdateUserProfileInput {
  full_name?: string;
  mobile?: string;
  category?: string;
  address?: string;
  avatar_url?: string;
}

export interface UpdateBusinessProfileInput {
  business_name?: string;
  business_type?: 'Proprietorship' | 'Partnership' | 'Private Ltd' | 'LLP';
  gst_number?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  qr_code_url?: string;
}

