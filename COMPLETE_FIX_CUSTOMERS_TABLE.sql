-- ============================================
-- COMPLETE FIX: Recreate Customers Table with ALL Columns
-- ============================================
-- This will fix ALL missing column errors
-- WARNING: This deletes existing customer data!
-- ============================================

-- Step 1: Drop existing table (deletes all data)
DROP TABLE IF EXISTS public.customers CASCADE;

-- Step 2: Recreate table with ALL required columns
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  plan TEXT NOT NULL,
  plan_type TEXT DEFAULT 'Daily' CHECK (plan_type IN ('Daily', 'Seasonal')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 3: Create indexes
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_name ON public.customers(name);

-- Step 4: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger
DROP TRIGGER IF EXISTS update_customers_updated_at_trigger ON public.customers;
CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Step 6: Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;

-- Step 8: Create RLS policies
CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 9: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.customers TO authenticated;

-- Step 10: Verify table structure
SELECT 
  'Table created successfully!' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Step 11: Verify all required columns exist
SELECT 
  CASE 
    WHEN COUNT(*) = 8 THEN 'SUCCESS: All 8 columns exist!'
    ELSE 'WARNING: Only ' || COUNT(*) || ' columns found (expected 8)'
  END as verification
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers';

-- Expected columns:
-- 1. id
-- 2. user_id
-- 3. name
-- 4. phone
-- 5. address
-- 6. plan
-- 7. plan_type
-- 8. created_at
-- 9. updated_at


