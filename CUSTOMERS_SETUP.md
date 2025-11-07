# Customers Not Saving - Fix Guide

## 🔍 Problem Identified

**Why customers weren't being saved:**

The `MyCustomerScreen` was storing customers only in **local state** (React `useState`), not in Supabase database. This means:
- ❌ Customers were lost when app restarted
- ❌ Customers weren't synced across devices
- ❌ No persistent storage

## ✅ Solution Implemented

I've updated the code to:
1. ✅ Create `customers` table in Supabase
2. ✅ Save customers to database when added
3. ✅ Load customers from database on app start
4. ✅ Update/delete customers in database

## 🚀 Setup Steps

### Step 1: Create Customers Table in Supabase

1. Go to your **Supabase Dashboard**
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase-customers-schema.sql`
5. Copy **ALL** the SQL code
6. Paste it into Supabase SQL Editor
7. Click **Run** (or press `Ctrl/Cmd + Enter`)

### Step 2: Verify Table Created

Run this query to verify:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'customers';
```

### Step 3: Test in App

1. Open your app
2. Go to **My Customers** screen
3. Click **Add New Customer**
4. Fill in the form and click **Add**
5. Customer should be saved to Supabase!

## 📊 Database Structure

### Customers Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique customer ID |
| `user_id` | UUID | Links to auth.users (which user owns this customer) |
| `name` | TEXT | Customer name |
| `phone` | TEXT | Customer phone number |
| `address` | TEXT | Customer address |
| `plan` | TEXT | Milk plan (e.g., "1L/day") |
| `plan_type` | TEXT | "Daily" or "Seasonal" |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## 🔒 Security (RLS Policies)

Row Level Security is enabled. Users can only:
- ✅ View their own customers
- ✅ Add their own customers
- ✅ Update their own customers
- ✅ Delete their own customers

Users **cannot**:
- ❌ See other users' customers
- ❌ Modify other users' customers

## 📝 What Changed in Code

### Files Created:
1. `supabase-customers-schema.sql` - Database schema
2. `src/lib/customers.js` - Helper functions for database operations

### Files Updated:
1. `src/screens/MyCustomerScreen.js` - Now uses Supabase instead of local state

### Key Changes:
- ✅ Added `useEffect` to load customers on mount
- ✅ `saveForm()` now saves to Supabase
- ✅ `handleDelete()` now deletes from Supabase
- ✅ Added loading states
- ✅ Added error handling

## 🔍 Verify It's Working

### Check in Supabase Dashboard:

1. Go to **Table Editor** → **customers**
2. Add a customer in your app
3. Refresh the table - you should see the new customer!

### Check via SQL:

```sql
-- Get all customers for current user
SELECT * FROM public.customers 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

## 🐛 Troubleshooting

### Customers Still Not Saving?

1. **Check if table exists:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'customers';
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'customers';
   ```

3. **Check if user is authenticated:**
   - Make sure you're logged in
   - Check Supabase Dashboard → Authentication → Users

4. **Check browser console for errors:**
   - Look for any error messages
   - Check network tab for failed requests

### Getting Permission Errors?

- Verify RLS policies are created
- Make sure you're logged in
- Check that `user_id` matches your auth user ID

### Data Not Loading?

- Check internet connection
- Verify Supabase URL and keys are correct
- Check browser console for errors

## ✅ Checklist

After setup, verify:

- [ ] `customers` table exists in Supabase
- [ ] RLS policies are enabled
- [ ] Can add new customers in app
- [ ] Customers appear in Supabase table
- [ ] Can edit customers
- [ ] Can delete customers
- [ ] Customers persist after app restart
- [ ] Loading indicator shows while fetching

## 🎯 Next Steps

Now that customers are saving:
- ✅ Customers persist across app restarts
- ✅ Customers are synced to Supabase
- ✅ Each user only sees their own customers
- ✅ Data is secure with RLS policies

You can now:
- Add more customers
- Edit existing customers
- Delete customers
- All data is saved to Supabase!

---

**Summary:** The issue was that customers were only stored in local state. Now they're saved to Supabase database and persist across app restarts! 🚀

