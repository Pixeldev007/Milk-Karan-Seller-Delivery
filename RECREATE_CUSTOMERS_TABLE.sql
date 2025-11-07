-- ============================================
-- RECREATE CUSTOMERS TABLE (If columns are missing)
-- ============================================
-- WARNING: This will DELETE all existing customer data!
-- Only run this if you don't have important data yet
-- ============================================

-- Step 1: Drop the table (THIS DELETES ALL DATA!)
DROP TABLE IF EXISTS public.customers CASCADE;

-- Step 2: Recreate the table with all columns
CREATE TABLE public.customers (
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

-- Step 3: Create indexes
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_name ON public.customers(name);

-- Step 4: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Step 5: Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
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

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.customers TO authenticated;

-- Step 8: Verify
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Done! Table is recreated with all columns.


