# Authentication Data Storage Reference

Quick reference for where login and register data is stored in Supabase.

## 📊 Data Storage Map

### Register Form Data → Database

| Form Field | Stored In | Table Column | Auto Created? |
|------------|-----------|--------------|---------------|
| **fullName** | `user_profiles` | `full_name` | ✅ Yes (via trigger) |
| **email** | `auth.users` | `email` | ✅ Yes (Supabase Auth) |
| **password** | `auth.users` | `encrypted_password` | ✅ Yes (Supabase Auth) |

### Login Form Data → Database

| Form Field | Stored In | Table Column | Notes |
|------------|-----------|--------------|-------|
| **email** | `auth.users` | `email` | Used for authentication |
| **password** | `auth.users` | `encrypted_password` | Validated against stored hash |

## 🗄️ Database Tables

### 1. `auth.users` (Managed by Supabase)

**Automatically created and managed by Supabase Auth**

Stores:
- ✅ Email address
- ✅ Password (hashed/encrypted)
- ✅ User ID (UUID)
- ✅ Email verification status
- ✅ Account creation timestamp
- ✅ Last sign-in timestamp
- ✅ User metadata (including `full_name` from registration)

**You don't need to create this table** - it exists automatically.

### 2. `user_profiles` (Created by our schema)

**Created by running `supabase-auth-schema.sql`**

Stores:
- ✅ Full name (from registration)
- ✅ Email (synced from auth.users)
- ✅ Mobile (optional, for future use)
- ✅ Category (optional, for future use)
- ✅ Address (optional, for future use)
- ✅ Avatar URL (optional, for future use)
- ✅ Timestamps

**You need to create this table** by running the SQL schema.

## 🔄 Data Flow

### Registration

```
Register Form
├── fullName → user_profiles.full_name (via trigger)
├── email → auth.users.email (Supabase Auth)
└── password → auth.users.encrypted_password (Supabase Auth)
```

### Login

```
Login Form
├── email → Validated against auth.users.email
└── password → Validated against auth.users.encrypted_password
```

## 📝 Example Data

### After Registration

**auth.users** (automatic):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "encrypted_password": "$2a$10$...",
  "email_confirmed_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "raw_user_meta_data": {
    "full_name": "John Doe"
  }
}
```

**user_profiles** (created by trigger):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "John Doe",
  "email": "user@example.com",
  "mobile": null,
  "category": null,
  "address": null,
  "avatar_url": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## ✅ Setup Checklist

1. **Supabase Auth** (Automatic)
   - ✅ `auth.users` table exists automatically
   - ✅ Email/password storage works automatically
   - ✅ Authentication works automatically

2. **User Profiles** (Manual Setup Required)
   - [ ] Run `supabase-auth-schema.sql` in Supabase SQL Editor
   - [ ] Verify `user_profiles` table was created
   - [ ] Verify trigger `on_auth_user_created` exists
   - [ ] Test registration creates a profile

## 🔍 Quick Verification

After setup, test with these queries:

```sql
-- Check if user_profiles table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- Check latest registered user
SELECT 
  u.email,
  u.created_at as registered_at,
  up.full_name,
  up.created_at as profile_created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC
LIMIT 5;
```

## 🎯 Summary

- **Email & Password**: Stored automatically in `auth.users` (no setup needed)
- **Full Name**: Stored in `user_profiles.full_name` (requires schema setup)
- **Registration**: Creates records in both tables automatically
- **Login**: Uses `auth.users` for authentication

Run `supabase-auth-schema.sql` to enable profile storage! 🚀

