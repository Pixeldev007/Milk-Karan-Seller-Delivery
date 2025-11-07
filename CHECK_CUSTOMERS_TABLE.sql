-- ============================================
-- CHECK: Verify Customers Table Structure
-- ============================================
-- Run this FIRST to see what's wrong
-- ============================================

-- Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'customers'
    ) THEN '✅ Table EXISTS'
    ELSE '❌ Table DOES NOT EXIST'
  END as table_status;

-- List all columns in customers table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Check for specific columns
SELECT 
  column_name,
  CASE 
    WHEN column_name = 'user_id' THEN '✅ user_id EXISTS'
    WHEN column_name = 'plan' THEN '✅ plan EXISTS'
    WHEN column_name = 'plan_type' THEN '✅ plan_type EXISTS'
    ELSE ''
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
AND column_name IN ('user_id', 'plan', 'plan_type');

-- Check RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'customers';

-- Check policies
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ Policy EXISTS'
    ELSE '❌ Policy MISSING'
  END as policy_status
FROM pg_policies 
WHERE tablename = 'customers';

