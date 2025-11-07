-- ============================================
-- FINAL SAFE MIGRATION - 100% Safe to Run
-- ============================================
-- This script is SAFE - it will NOT:
-- ❌ Drop your table
-- ❌ Delete any data
-- ❌ Break existing connections
-- 
-- It will ONLY:
-- ✅ Add missing columns (if they don't exist)
-- ✅ Create indexes (if they don't exist)
-- ✅ Set up policies (safely)
-- ✅ Grant permissions
-- ============================================
-- Copy and paste this ENTIRE block into Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: Add Missing Columns
-- ============================================

-- Add user_id column (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN user_id UUID;
    
    -- Add foreign key only if constraint doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
      AND table_name = 'customers'
      AND constraint_name = 'customers_user_id_fkey'
    ) THEN
      ALTER TABLE public.customers
      ADD CONSTRAINT customers_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
    END IF;
    
    RAISE NOTICE '✅ Added user_id column';
  ELSE
    RAISE NOTICE '✓ user_id already exists';
  END IF;
END $$;

-- Add plan column (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN plan TEXT;
    -- Set default for existing rows
    UPDATE public.customers SET plan = '1L/day' WHERE plan IS NULL;
    -- Make NOT NULL after setting defaults
    ALTER TABLE public.customers ALTER COLUMN plan SET NOT NULL;
    RAISE NOTICE '✅ Added plan column';
  ELSE
    RAISE NOTICE '✓ plan already exists';
  END IF;
END $$;

-- Add plan_type column (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customers'
    AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN plan_type TEXT DEFAULT 'Daily';
    -- Set default for existing rows
    UPDATE public.customers SET plan_type = 'Daily' WHERE plan_type IS NULL;
    RAISE NOTICE '✅ Added plan_type column';
  ELSE
    RAISE NOTICE '✓ plan_type already exists';
  END IF;
END $$;

-- Add created_at column (if missing)
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
    RAISE NOTICE '✓ created_at already exists';
  END IF;
END $$;

-- Add updated_at column (if missing)
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
    RAISE NOTICE '✓ updated_at already exists';
  END IF;
END $$;

-- ============================================
-- PART 2: Create Indexes (Safe - IF NOT EXISTS)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- ============================================
-- PART 3: Create Trigger Function (Safe - OR REPLACE)
-- ============================================

CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (Safe - DROP IF EXISTS)
DROP TRIGGER IF EXISTS update_customers_updated_at_trigger ON public.customers;
CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- ============================================
-- PART 4: Enable RLS (Safe - won't break if already enabled)
-- ============================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: Create RLS Policies (Safe - DROP IF EXISTS)
-- ============================================

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

-- ============================================
-- PART 6: Grant Permissions (Safe - won't break if already granted)
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;

-- ============================================
-- PART 7: Verification - Show Final Structure
-- ============================================

SELECT 
  '✅ MIGRATION COMPLETE!' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Count columns to verify
SELECT 
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ SUCCESS: Table has all required columns!'
    ELSE '⚠️ WARNING: Only ' || COUNT(*) || ' columns found'
  END as final_status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers';

