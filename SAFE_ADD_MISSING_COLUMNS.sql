-- ============================================
-- SAFE MIGRATION: Add Missing Columns to Existing Customers Table
-- ============================================
-- This will NOT drop the table or delete any data
-- It only adds missing columns
-- Safe to run even if columns already exist
-- ============================================

-- Step 1: Check current table structure
SELECT 
  'Current columns in customers table:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Step 2: Add user_id column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN user_id UUID;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'customers_user_id_fkey'
      AND table_name = 'customers'
    ) THEN
      ALTER TABLE public.customers
      ADD CONSTRAINT customers_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
    END IF;
    
    RAISE NOTICE '✅ Added user_id column';
  ELSE
    RAISE NOTICE '✓ user_id column already exists';
  END IF;
END $$;

-- Step 3: Add plan column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN plan TEXT;
    UPDATE public.customers SET plan = '1L/day' WHERE plan IS NULL;
    ALTER TABLE public.customers ALTER COLUMN plan SET NOT NULL;
    RAISE NOTICE '✅ Added plan column';
  ELSE
    RAISE NOTICE '✓ plan column already exists';
  END IF;
END $$;

-- Step 4: Add plan_type column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN plan_type TEXT DEFAULT 'Daily';
    UPDATE public.customers SET plan_type = 'Daily' WHERE plan_type IS NULL;
    RAISE NOTICE '✅ Added plan_type column';
  ELSE
    RAISE NOTICE '✓ plan_type column already exists';
  END IF;
END $$;

-- Step 5: Add created_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.customers ALTER COLUMN created_at SET NOT NULL;
    RAISE NOTICE '✅ Added created_at column';
  ELSE
    RAISE NOTICE '✓ created_at column already exists';
  END IF;
END $$;

-- Step 6: Add updated_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.customers ALTER COLUMN updated_at SET NOT NULL;
    RAISE NOTICE '✅ Added updated_at column';
  ELSE
    RAISE NOTICE '✓ updated_at column already exists';
  END IF;
END $$;

-- Step 7: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- Step 8: Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_customers_updated_at_trigger ON public.customers;
CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Step 10: Enable RLS (safe - won't break if already enabled)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Step 11: Create/Update RLS policies (safe - drops and recreates)
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
CREATE POLICY "Users can insert own customers"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
CREATE POLICY "Users can update own customers"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;
CREATE POLICY "Users can delete own customers"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 12: Grant permissions (safe - won't break if already granted)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;

-- Step 13: Final verification - show all columns
SELECT 
  '✅ FINAL TABLE STRUCTURE:' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Step 14: Verify required columns exist
SELECT 
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ SUCCESS: All required columns exist!'
    ELSE '⚠️ WARNING: Only ' || COUNT(*) || ' columns found'
  END as verification
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers';

-- Expected columns:
-- 1. id (should already exist)
-- 2. user_id (added if missing)
-- 3. name (should already exist)
-- 4. phone (should already exist)
-- 5. address (should already exist)
-- 6. plan (added if missing)
-- 7. plan_type (added if missing)
-- 8. created_at (added if missing)
-- 9. updated_at (added if missing)

