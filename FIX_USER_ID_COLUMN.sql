-- ============================================
-- FIX: Add Missing user_id Column
-- ============================================
-- Run this if user_id column is missing
-- ============================================

-- Check if table exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'customers'
  ) THEN
    RAISE EXCEPTION 'Table customers does not exist. Please run COMPLETE_FIX_CUSTOMERS_TABLE.sql first.';
  END IF;
END $$;

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'user_id'
  ) THEN
    -- Add the column
    ALTER TABLE public.customers 
    ADD COLUMN user_id UUID;
    
    -- Add foreign key constraint
    ALTER TABLE public.customers
    ADD CONSTRAINT customers_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
    
    -- Make it NOT NULL (after setting values)
    -- First, we need to set values for existing rows
    -- But we can't do that without knowing which user owns them
    -- So we'll make it nullable for now, or you need to set values manually
    
    RAISE NOTICE 'Added user_id column';
  ELSE
    RAISE NOTICE 'user_id column already exists';
  END IF;
END $$;

-- Verify user_id column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'customers'
      AND column_name = 'user_id'
    ) THEN '✅ user_id column EXISTS'
    ELSE '❌ user_id column MISSING'
  END as verification;

