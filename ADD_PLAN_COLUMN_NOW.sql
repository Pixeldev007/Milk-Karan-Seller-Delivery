-- ============================================
-- IMMEDIATE FIX: Add plan and plan_type columns
-- ============================================
-- Copy and paste this ENTIRE block into Supabase SQL Editor and RUN
-- ============================================

-- Add plan column (if it doesn't exist)
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
  END IF;
END $$;

-- Add plan_type column (if it doesn't exist)
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
  END IF;
END $$;

-- Set default values for any NULL values
UPDATE public.customers SET plan = '1L/day' WHERE plan IS NULL;
UPDATE public.customers SET plan_type = 'Daily' WHERE plan_type IS NULL;

-- Make plan NOT NULL (after setting defaults)
DO $$
BEGIN
  -- Check if there are any NULL values
  IF EXISTS (SELECT 1 FROM public.customers WHERE plan IS NULL) THEN
    UPDATE public.customers SET plan = '1L/day' WHERE plan IS NULL;
  END IF;
  
  -- Make it NOT NULL
  ALTER TABLE public.customers ALTER COLUMN plan SET NOT NULL;
  RAISE NOTICE 'Made plan column NOT NULL';
END $$;

-- Verify the columns were added
SELECT 
  'SUCCESS: Columns added!' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
AND column_name IN ('plan', 'plan_type')
ORDER BY column_name;

