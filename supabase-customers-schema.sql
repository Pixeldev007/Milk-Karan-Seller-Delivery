-- ============================================
-- Milk Wala - Customers Table Schema
-- ============================================
-- Database schema for storing customers
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CUSTOMERS TABLE
-- ============================================
-- Stores customer information
-- Each customer belongs to a user (business owner)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  plan TEXT NOT NULL, -- e.g., "1L/day", "500ml/day"
  plan_type TEXT DEFAULT 'Daily' CHECK (plan_type IN ('Daily', 'Seasonal')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. INDEXES for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- ============================================
-- 3. FUNCTION to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at_trigger ON public.customers;
CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;

-- Users can view their own customers
-- Allow SELECT on all columns including user_id
CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own customers
CREATE POLICY "Users can insert own customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own customers
CREATE POLICY "Users can update own customers"
  ON public.customers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own customers
CREATE POLICY "Users can delete own customers"
  ON public.customers
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================
-- Run these after creating the schema to verify everything works:

-- Check if table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'customers';

-- Check if policies exist
-- SELECT * FROM pg_policies WHERE tablename = 'customers';

-- ============================================
-- 6. TEST QUERIES (for reference)
-- ============================================
/*
-- Get all customers for current user
SELECT * FROM public.customers 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Insert a test customer (will be linked to current user automatically)
INSERT INTO public.customers (user_id, name, phone, address, plan, plan_type)
VALUES (auth.uid(), 'Test Customer', '9876543210', 'Test Address', '1L/day', 'Daily');

-- Update a customer
UPDATE public.customers
SET name = 'Updated Name', phone = '9876543211'
WHERE id = 'customer-id-here' AND user_id = auth.uid();

-- Delete a customer
DELETE FROM public.customers
WHERE id = 'customer-id-here' AND user_id = auth.uid();
*/

