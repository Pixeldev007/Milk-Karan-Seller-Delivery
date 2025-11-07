# Fix: "column customers.plan does not exist" Error

## 🔍 Problem

You're getting an error: **"column customers.plan does not exist"**

This means the `plan` column is missing from your `customers` table.

## ✅ Solution Options

### Option 1: Add Missing Column (Recommended - Keeps Your Data)

**Use this if you already have customer data you want to keep.**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `FIX_PLAN_COLUMN.sql`
3. Copy **ALL** the SQL code
4. Paste and **Run**

This will:
- ✅ Add the `plan` column if missing
- ✅ Add the `plan_type` column if missing
- ✅ Keep all your existing data
- ✅ Set default values for existing rows

### Option 2: Recreate Table (Only if No Important Data)

**Use this ONLY if you don't have important customer data yet.**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `RECREATE_CUSTOMERS_TABLE.sql`
3. **⚠️ WARNING: This deletes all customer data!**
4. Copy and **Run**

This will:
- ✅ Delete the table and recreate it
- ✅ Add all columns correctly
- ✅ Set up RLS policies
- ✅ Grant permissions

## 🔍 Check Current Table Structure

Run this query to see what columns you currently have:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;
```

You should see these columns:
- `id`
- `user_id`
- `name`
- `phone`
- `address`
- `plan` ← This is missing!
- `plan_type` ← This might also be missing
- `created_at`
- `updated_at`

## ✅ After Running the Fix

1. **Verify columns exist:**
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('plan', 'plan_type');
```

2. **Test in your app:**
   - Restart the app
   - Go to My Customers screen
   - Try adding a customer
   - Should work now!

## 🐛 Troubleshooting

### Still Getting Error?

1. **Check if column was added:**
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'customers' 
AND column_name = 'plan';
```

2. **If column still doesn't exist, manually add it:**
```sql
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT '1L/day';

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'Daily';
```

3. **Check table exists:**
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'customers';
```

## 📝 What the Fix Does

### Option 1 (Add Column):
- Checks if `plan` column exists
- Adds it if missing
- Sets default values for existing rows
- Makes it NOT NULL

### Option 2 (Recreate):
- Drops entire table
- Recreates with all columns
- Sets up all policies and permissions

## ✅ Recommended Action

**If you have customer data:** Use `FIX_PLAN_COLUMN.sql` (Option 1)

**If you have no data yet:** Use `RECREATE_CUSTOMERS_TABLE.sql` (Option 2)

---

**Summary:** The `plan` column is missing. Run `FIX_PLAN_COLUMN.sql` to add it without losing data! 🚀

