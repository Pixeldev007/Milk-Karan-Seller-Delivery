-- ============================================
-- Milk Wala - Database Schema for Authenticated Users
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This creates tables for user profiles and business profiles
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
-- Extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile TEXT,
  category TEXT, -- Business category (e.g., Dairy, Grocery)
  address TEXT,
  avatar_url TEXT, -- Profile picture URL
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. BUSINESS PROFILES TABLE
-- ============================================
-- Stores business information for each user
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN ('Proprietorship', 'Partnership', 'Private Ltd', 'LLP')),
  gst_number TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT, -- Business logo URL
  qr_code_url TEXT, -- QR code URL for payments
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id) -- One business profile per user
);

-- ============================================
-- 3. INDEXES for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);

-- ============================================
-- 4. FUNCTIONS for automatic timestamp updates
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. FUNCTION to automatically create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for manual creation if needed)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Enable RLS on business_profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own business profile
CREATE POLICY "Users can view own business profile"
  ON public.business_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own business profile
CREATE POLICY "Users can update own business profile"
  ON public.business_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own business profile
CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own business profile
CREATE POLICY "Users can delete own business profile"
  ON public.business_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. HELPER VIEWS (Optional but useful)
-- ============================================
-- View to get complete user information
CREATE OR REPLACE VIEW public.user_complete_profile AS
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  up.full_name,
  up.mobile,
  up.category,
  up.address,
  up.avatar_url,
  up.created_at as profile_created_at,
  up.updated_at as profile_updated_at,
  bp.business_name,
  bp.business_type,
  bp.gst_number,
  bp.website,
  bp.logo_url,
  bp.qr_code_url
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.business_profiles bp ON u.id = bp.user_id;

-- Grant access to the view
GRANT SELECT ON public.user_complete_profile TO authenticated;

-- ============================================
-- 8. SAMPLE QUERIES (for reference)
-- ============================================
/*
-- Get current user's profile
SELECT * FROM public.user_profiles WHERE id = auth.uid();

-- Get current user's business profile
SELECT * FROM public.business_profiles WHERE user_id = auth.uid();

-- Get complete profile
SELECT * FROM public.user_complete_profile WHERE id = auth.uid();

-- Update user profile
UPDATE public.user_profiles
SET 
  full_name = 'John Doe',
  mobile = '+1234567890',
  category = 'Dairy',
  address = '123 Main St'
WHERE id = auth.uid();

-- Insert/Update business profile
INSERT INTO public.business_profiles (user_id, business_name, business_type, gst_number, address, website)
VALUES (auth.uid(), 'My Dairy Business', 'Proprietorship', 'GST123456', '123 Main St', 'https://example.com')
ON CONFLICT (user_id) 
DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_type = EXCLUDED.business_type,
  gst_number = EXCLUDED.gst_number,
  address = EXCLUDED.address,
  website = EXCLUDED.website,
  updated_at = NOW();
*/

