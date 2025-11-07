# Customers Table Schema - Complete Reference

This document describes the complete schema for the `customers` table that works with all modules.

## 📊 Table Structure

### Table Name: `public.customers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique customer ID |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → auth.users(id) | Owner of this customer record |
| `name` | TEXT | NOT NULL | Customer full name |
| `phone` | TEXT | NOT NULL | Customer phone number |
| `address` | TEXT | NOT NULL | Customer address |
| `plan` | TEXT | NOT NULL | Milk plan (e.g., "1L/day", "500ml/day") |
| `plan_type` | TEXT | DEFAULT 'Daily', CHECK IN ('Daily', 'Seasonal') | Plan type |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

## 🔑 Primary Key

- `id` (UUID) - Auto-generated

## 🔗 Foreign Keys

- `user_id` → `auth.users(id)` ON DELETE CASCADE

## 📍 Indexes

```sql
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_name ON public.customers(name);
```

## 🔒 Row Level Security (RLS)

RLS is **ENABLED** on this table.

### Policies

1. **SELECT Policy**: Users can view their own customers
   ```sql
   USING (auth.uid() = user_id)
   ```

2. **INSERT Policy**: Users can insert their own customers
   ```sql
   WITH CHECK (auth.uid() = user_id)
   ```

3. **UPDATE Policy**: Users can update their own customers
   ```sql
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id)
   ```

4. **DELETE Policy**: Users can delete their own customers
   ```sql
   USING (auth.uid() = user_id)
   ```

## 🔧 Triggers

### Auto-update `updated_at` timestamp

```sql
CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();
```

## 📝 Complete CREATE TABLE Statement

```sql
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
```

## 🔄 Safe Migration Script

If your table already exists but is missing columns, use:
- `SAFE_ADD_MISSING_COLUMNS.sql` - Adds missing columns without dropping table

## ✅ Verification Queries

### Check if table exists:
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'customers'
);
```

### List all columns:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;
```

### Check for specific column:
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'customers'
  AND column_name = 'user_id'
);
```

### Count columns:
```sql
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers';
```

## 🔗 Related Modules

This table is used by:
- MyCustomerScreen - Main customer management
- DeliveryBoyScreen - Customer assignments
- CreateBillScreen - Customer selection
- DailySellScreen - Customer sales tracking
- InvoiceScreen - Customer invoices
- ReceivedPaymentScreen - Customer payments

## 🚀 Setup Instructions

### For New Installation:
1. Run `supabase-customers-schema.sql` to create the table

### For Existing Installation (Missing Columns):
1. Run `SAFE_ADD_MISSING_COLUMNS.sql` to add missing columns
2. This preserves all existing data and connections

## ⚠️ Important Notes

- **DO NOT DROP** the table if it's connected to other modules
- Use `SAFE_ADD_MISSING_COLUMNS.sql` instead
- All columns are required for the app to work properly
- `user_id` is critical for RLS policies to work


