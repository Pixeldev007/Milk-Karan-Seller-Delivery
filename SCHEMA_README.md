# Database Schema for Milk Wala

This document describes the database schema for authenticated users in the Milk Wala application.

## 📋 Overview

The schema consists of two main tables:
1. **user_profiles** - Stores personal user information
2. **business_profiles** - Stores business information for each user

## 🗄️ Tables

### 1. user_profiles

Extends the `auth.users` table with additional profile information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK, FK) | References `auth.users(id)` |
| `full_name` | TEXT | User's full name |
| `mobile` | TEXT | Mobile phone number |
| `category` | TEXT | Business category (e.g., Dairy, Grocery) |
| `address` | TEXT | User's address |
| `avatar_url` | TEXT | Profile picture URL |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### 2. business_profiles

Stores business information for each user (one-to-one relationship).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK) | References `auth.users(id)` |
| `business_name` | TEXT | Business name |
| `business_type` | TEXT | Type: Proprietorship, Partnership, Private Ltd, or LLP |
| `gst_number` | TEXT | GST registration number |
| `address` | TEXT | Business address |
| `website` | TEXT | Business website URL |
| `logo_url` | TEXT | Business logo URL |
| `qr_code_url` | TEXT | QR code URL for payments |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## 🔒 Security (RLS Policies)

Row Level Security (RLS) is enabled on both tables. Users can only:
- **View** their own profiles
- **Update** their own profiles
- **Insert** their own profiles
- **Delete** their own business profiles (if needed)

## 🚀 Setup Instructions

### Step 1: Run the SQL Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the schema

### Step 2: Verify Tables

After running the schema, verify that the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'business_profiles');
```

### Step 3: Test RLS Policies

Test that RLS is working correctly:

```sql
-- This should only return the current user's profile
SELECT * FROM public.user_profiles WHERE id = auth.uid();
```

## 📝 Usage Examples

### Using the Helper Functions

```javascript
import { 
  getUserProfile, 
  updateUserProfile, 
  getBusinessProfile,
  upsertBusinessProfile 
} from './src/lib/userProfile';

// Get user profile
const { data: profile, error } = await getUserProfile();
if (error) console.error(error);
else console.log(profile);

// Update user profile
const { data: updated, error } = await updateUserProfile({
  full_name: 'John Doe',
  mobile: '+1234567890',
  category: 'Dairy',
  address: '123 Main St'
});

// Get business profile
const { data: business, error } = await getBusinessProfile();

// Create or update business profile
const { data: business, error } = await upsertBusinessProfile({
  business_name: 'My Dairy Business',
  business_type: 'Proprietorship',
  gst_number: 'GST123456',
  address: '123 Main St',
  website: 'https://example.com'
});
```

### Direct Supabase Queries

```javascript
import { supabase } from './src/lib/supabase';

// Get current user's profile
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', (await supabase.auth.getUser()).data.user.id)
  .single();

// Update profile
const { data, error } = await supabase
  .from('user_profiles')
  .update({ full_name: 'New Name' })
  .eq('id', (await supabase.auth.getUser()).data.user.id);
```

## 🔄 Automatic Profile Creation

When a user signs up, a profile is automatically created in `user_profiles` via a database trigger. The `full_name` is extracted from the user's metadata during signup.

## 📊 View: user_complete_profile

A convenient view that joins user, profile, and business data:

```sql
SELECT * FROM public.user_complete_profile WHERE id = auth.uid();
```

This view includes:
- User email and authentication info
- Personal profile information
- Business profile information

## 🛠️ Maintenance

### Update Timestamps

The `updated_at` column is automatically updated via database triggers whenever a row is modified.

### Manual Profile Creation

If a profile wasn't created automatically, you can create it manually:

```javascript
import { createUserProfile } from './src/lib/userProfile';

const { data, error } = await createUserProfile({
  full_name: 'John Doe',
  mobile: '+1234567890'
});
```

## 🔍 Troubleshooting

### Profile Not Created on Signup

If the trigger didn't fire, check:
1. The trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. The function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`

### RLS Policy Issues

If you can't access your profile:
1. Verify you're authenticated: `SELECT auth.uid();`
2. Check RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
3. Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'user_profiles';`

## 📚 Related Files

- `supabase-schema.sql` - Complete SQL schema
- `src/lib/userProfile.js` - Helper functions for profile operations
- `src/types/database.ts` - TypeScript type definitions


