-- ============================================
-- Milk Karan - Authentication Schema
-- ============================================
-- Database schema for Login and Register pages
-- Matches exactly with the app UI forms
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
-- Stores user data from Register form:
-- - fullName → full_name
-- - email → email (also stored in auth.users automatically)
-- - password → stored in auth.users automatically (hashed)
-- 
-- Note: confirmPassword is only for validation, not stored
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, -- From Register form: fullName field
  email TEXT, -- From Register/Login form: email field
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. INDEXES for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ============================================
-- 3. FUNCTION to automatically create user profile on signup
-- ============================================
-- This function extracts full_name from Register form and creates a profile
-- Called automatically when user registers via RegisterScreen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. TRIGGER to create profile when user signs up
-- ============================================
-- Automatically creates a user_profiles record when a new user registers
-- This happens when RegisterScreen calls signUp()
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

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

-- ============================================
-- 6. FUNCTION to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. HELPER VIEW (Optional but useful)
-- ============================================
-- View to get complete user information including auth data
CREATE OR REPLACE VIEW public.user_auth_profile AS
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  u.last_sign_in_at,
  up.full_name,
  up.created_at as profile_created_at,
  up.updated_at as profile_updated_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id;

-- Grant access to the view
GRANT SELECT ON public.user_auth_profile TO authenticated;

-- ============================================
-- DATA FLOW EXPLANATION
-- ============================================
-- 
-- REGISTER SCREEN (RegisterScreen.js):
--   User enters: fullName, email, password, confirmPassword
--   → signUp({ email, password, fullName }) is called
--   → Supabase Auth stores: email, password in auth.users
--   → Trigger fires: extracts full_name from metadata
--   → Profile created: full_name, email in user_profiles
--
-- LOGIN SCREEN (LoginScreen.js):
--   User enters: email, password
--   → signIn({ email, password }) is called
--   → Supabase Auth validates against auth.users
--   → Session created, user can access their profile
--
-- ============================================
