# Authentication Schema Setup Guide

This guide will help you set up the database schema in Supabase to store login and register data.

## 📋 What This Schema Does

This schema automatically stores user data when they register:

### From Register Form:
- ✅ **fullName** → Stored in `user_profiles.full_name`
- ✅ **email** → Stored in `auth.users.email` (automatic by Supabase)
- ✅ **password** → Stored in `auth.users` (hashed, automatic by Supabase)

### From Login:
- ✅ Email/password authentication is handled by Supabase Auth automatically
- ✅ Login data is stored in `auth.users` table (managed by Supabase)

## 🚀 Setup Steps

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema

1. Open the file `supabase-auth-schema.sql`
2. Copy **ALL** the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl/Cmd + Enter`)

### Step 3: Verify Setup

Run these verification queries in the SQL Editor:

```sql
-- Check if table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- Check if trigger exists
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT * FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'user_profiles';
```

All queries should return results if the schema was created successfully.

## 📊 Database Structure

### Tables Created

#### 1. `user_profiles`
Stores additional user information from registration.

| Column | Type | Description | Source |
|--------|------|-------------|--------|
| `id` | UUID | User ID (links to auth.users) | Auto from auth |
| `full_name` | TEXT | User's full name | Register form |
| `email` | TEXT | User's email | From auth.users |
| `mobile` | TEXT | Phone number | (Optional, for later) |
| `category` | TEXT | Business category | (Optional, for later) |
| `address` | TEXT | User address | (Optional, for later) |
| `avatar_url` | TEXT | Profile picture URL | (Optional, for later) |
| `created_at` | TIMESTAMPTZ | Account creation time | Auto |
| `updated_at` | TIMESTAMPTZ | Last update time | Auto |

#### 2. `auth.users` (Managed by Supabase)
Automatically stores:
- Email
- Password (hashed)
- User ID
- Email verification status
- Last sign in time

## 🔄 How It Works

### Registration Flow

```
User fills Register form
    ↓
signUp({ email, password, fullName })
    ↓
Supabase Auth creates user in auth.users
    ↓
Trigger fires: on_auth_user_created
    ↓
Function extracts full_name from metadata
    ↓
Creates record in user_profiles table
    ↓
Profile data is now stored! ✅
```

### Login Flow

```
User fills Login form
    ↓
signIn({ email, password })
    ↓
Supabase Auth validates credentials
    ↓
Session created in auth.users
    ↓
User can access their profile data ✅
```

## 🔒 Security (RLS Policies)

Row Level Security is enabled. Users can only:
- ✅ View their own profile
- ✅ Update their own profile
- ✅ Insert their own profile (if needed manually)

Users **cannot**:
- ❌ View other users' profiles
- ❌ Update other users' profiles
- ❌ Delete profiles (only via cascade when user is deleted)

## 📝 Testing the Schema

### Test Registration

1. Register a new user in your app
2. Check if profile was created:

```sql
-- Get the latest user profile
SELECT * FROM public.user_profiles 
ORDER BY created_at DESC 
LIMIT 1;
```

### Test Login

1. Login with registered credentials
2. Verify you can access your profile:

```sql
-- Get current user's profile (must be logged in)
SELECT * FROM public.user_profiles 
WHERE id = auth.uid();
```

## 🔍 Viewing Data

### View All User Profiles (Admin)

```sql
SELECT 
  up.id,
  up.full_name,
  up.email,
  u.email_confirmed_at,
  up.created_at
FROM public.user_profiles up
JOIN auth.users u ON up.id = u.id
ORDER BY up.created_at DESC;
```

### View Complete Auth Profile

```sql
-- Get current user's complete profile
SELECT * FROM public.user_auth_profile 
WHERE id = auth.uid();
```

## 🛠️ Troubleshooting

### Profile Not Created on Signup

**Problem**: User registers but no profile is created.

**Solution**:
1. Check if trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Check if function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

3. Manually create profile if needed:
```sql
INSERT INTO public.user_profiles (id, full_name, email)
VALUES (
  'USER_ID_HERE',
  'User Name',
  'user@example.com'
);
```

### Can't Access Profile Data

**Problem**: Getting permission denied errors.

**Solution**:
1. Verify RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';
```

2. Check policies exist:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'user_profiles';
```

3. Verify you're authenticated:
```sql
SELECT auth.uid(); -- Should return your user ID
```

### Full Name Not Stored

**Problem**: Profile created but full_name is empty.

**Solution**: Check if full_name is being sent in signup:
- In `AuthContext.js`, the signUp function should include:
```javascript
options: {
  data: fullName ? { full_name: fullName } : undefined,
}
```

## 📚 Related Files

- `supabase-auth-schema.sql` - The SQL schema file
- `src/context/AuthContext.js` - Authentication context
- `src/screens/RegisterScreen.js` - Register form
- `src/screens/LoginScreen.js` - Login form

## ✅ Checklist

After running the schema, verify:

- [ ] `user_profiles` table exists
- [ ] Trigger `on_auth_user_created` exists
- [ ] Function `handle_new_user` exists
- [ ] RLS is enabled on `user_profiles`
- [ ] RLS policies are created
- [ ] Test registration creates a profile
- [ ] Test login allows access to profile

## 🎯 Next Steps

After setting up the schema:

1. **Test Registration**: Register a new user and verify profile is created
2. **Test Login**: Login and verify you can access profile data
3. **Update Profile**: Use the UpdateProfileScreen to modify user data
4. **Add More Fields**: Add additional fields to `user_profiles` as needed

## 💡 Usage in Code

After setup, you can query user profiles in your app:

```javascript
import { supabase } from './src/lib/supabase';

// Get current user's profile
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', (await supabase.auth.getUser()).data.user.id)
  .single();
```

Or use the helper functions from `src/lib/userProfile.js`:

```javascript
import { getUserProfile } from './src/lib/userProfile';

const { data, error } = await getUserProfile();
```

---

**Note**: The `auth.users` table is automatically managed by Supabase. You don't need to create it manually. Email and password are stored there automatically when users register/login.

