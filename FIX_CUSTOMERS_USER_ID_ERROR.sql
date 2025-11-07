-- ============================================
-- Fix: Customers user_id Column Error
-- ============================================
-- Run this SQL to fix the RLS policy issue
-- ============================================

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;

-- Recreate the SELECT policy with explicit column access
CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers' 
AND policyname = 'Users can view own customers';

-- Grant explicit permissions on the table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;

-- Verify table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

