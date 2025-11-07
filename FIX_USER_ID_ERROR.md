# Fix: "Failed to load column customer.user_id" Error

## 🔍 Problem

You're getting an error: **"failed to load the column customer.user_id which does exist"**

This is typically caused by:
1. **RLS (Row Level Security) policy blocking column access**
2. **Missing GRANT permissions on the table**
3. **RLS policy not properly configured**

## ✅ Solution

### Step 1: Run the Fix SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `FIX_CUSTOMERS_USER_ID_ERROR.sql`
3. Copy **ALL** the SQL code
4. Paste it into Supabase SQL Editor
5. Click **Run**

This will:
- Fix the RLS policy
- Grant proper permissions
- Verify the table structure

### Step 2: Verify It's Fixed

Run this query to check:

```sql
-- Check if policies exist and are correct
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers';
```

You should see 4 policies:
- Users can view own customers (SELECT)
- Users can insert own customers (INSERT)
- Users can update own customers (UPDATE)
- Users can delete own customers (DELETE)

### Step 3: Test in App

1. Restart your app
2. Go to **My Customers** screen
3. It should load without errors now!

## 🔧 Alternative: Manual Fix

If the SQL file doesn't work, run these commands manually:

```sql
-- 1. Drop and recreate the SELECT policy
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;

CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;

-- 3. Verify table exists and has user_id column
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name = 'user_id';
```

## 🐛 Troubleshooting

### Still Getting Error?

1. **Check if table exists:**
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'customers';
```

2. **Check if user_id column exists:**
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name = 'user_id';
```

3. **Check RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'customers';
```

4. **Check if you're authenticated:**
```sql
SELECT auth.uid(); -- Should return your user ID
```

5. **Test query directly:**
```sql
-- This should work if you're logged in
SELECT * FROM public.customers 
WHERE user_id = auth.uid();
```

### Permission Denied Errors?

Make sure:
- You're logged in to the app
- Your user exists in `auth.users`
- RLS policies are created correctly
- GRANT permissions are set

## 📝 What Was Changed

### Code Updates:
1. ✅ Updated `getCustomers()` to explicitly select columns
2. ✅ Updated `searchCustomers()` to explicitly select columns
3. ✅ Fixed RLS policy in schema

### Why This Fixes It:

The error occurred because:
- RLS was blocking access to `user_id` column
- The policy needed explicit `WITH CHECK` clause
- Permissions weren't granted to `authenticated` role

Now:
- ✅ RLS policy allows SELECT on all columns
- ✅ Permissions are granted properly
- ✅ Queries explicitly list columns (more reliable)

## ✅ Verification Checklist

After running the fix:

- [ ] SQL fix executed successfully
- [ ] RLS policies exist (4 policies)
- [ ] GRANT permissions set
- [ ] App loads customers without error
- [ ] Can add new customers
- [ ] Can edit customers
- [ ] Can delete customers

---

**Summary:** The issue was RLS policy blocking column access. Run `FIX_CUSTOMERS_USER_ID_ERROR.sql` to fix it! 🚀

