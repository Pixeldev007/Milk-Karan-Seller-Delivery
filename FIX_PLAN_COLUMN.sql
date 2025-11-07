-- ============================================
-- FIX: Add Missing 'plan' Column to Customers
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Step 1: Check if table exists
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

-- Step 2: Add 'plan' column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN plan TEXT;
    RAISE NOTICE 'Added plan column';
  ELSE
    RAISE NOTICE 'plan column already exists';
  END IF;
END $$;

-- Step 3: Add 'plan_type' column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN plan_type TEXT DEFAULT 'Daily';
    RAISE NOTICE 'Added plan_type column';
  ELSE
    RAISE NOTICE 'plan_type column already exists';
  END IF;
END $$;

-- Step 4: Update existing rows to have default values if NULL
UPDATE public.customers 
SET plan = '1L/day' 
WHERE plan IS NULL;

UPDATE public.customers 
SET plan_type = 'Daily' 
WHERE plan_type IS NULL;

-- Step 5: Make plan NOT NULL if it's currently nullable
DO $$
BEGIN
  -- Check if plan is nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'plan'
    AND is_nullable = 'YES'
  ) THEN
    -- First ensure no NULL values
    UPDATE public.customers SET plan = '1L/day' WHERE plan IS NULL;
    -- Then make it NOT NULL
    ALTER TABLE public.customers ALTER COLUMN plan SET NOT NULL;
    RAISE NOTICE 'Made plan column NOT NULL';
  END IF;
END $$;

-- Step 6: Verify all columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Step 7: Test query
-- SELECT id, name, phone, address, plan, plan_type FROM public.customers LIMIT 1;

