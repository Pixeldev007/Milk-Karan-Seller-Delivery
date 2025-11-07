-- ============================================
-- COMPLETE FIX: Customers user_id Column Error
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- This will fix all RLS and permission issues
-- ============================================

-- Step 1: Verify table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'customers'
  ) THEN
    RAISE EXCEPTION 'Table customers does not exist. Please run supabase-customers-schema.sql first.';
  END IF;
END $$;

-- Step 2: Verify user_id column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'Column user_id does not exist in customers table.';
  END IF;
END $$;

-- Step 3: Disable RLS temporarily to fix policies
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;

-- Step 5: Re-enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies with proper permissions
-- SELECT policy - allows reading all columns including user_id
CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own customers"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own customers"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own customers"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 7: Grant explicit permissions on table and columns
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT (id, user_id, name, phone, address, plan, plan_type, created_at, updated_at) ON public.customers TO authenticated;

-- Step 8: Verify policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'customers';
  
  IF policy_count < 4 THEN
    RAISE WARNING 'Expected 4 policies but found %', policy_count;
  ELSE
    RAISE NOTICE 'Successfully created % policies for customers table', policy_count;
  END IF;
END $$;

-- Step 9: Test query (will only work if you're authenticated)
-- Uncomment to test:
-- SELECT id, user_id, name FROM public.customers WHERE user_id = auth.uid() LIMIT 1;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check table exists
SELECT 'Table exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'customers'
) as table_check;

-- Check user_id column exists
SELECT 'user_id column exists: ' || EXISTS(
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'customers'
  AND column_name = 'user_id'
) as column_check;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'customers';

-- List all policies
SELECT 
  policyname,
  cmd as operation,
  roles,
  qual as using_expression,
  with_check
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY cmd;

-- Check permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'customers'
AND grantee = 'authenticated';

