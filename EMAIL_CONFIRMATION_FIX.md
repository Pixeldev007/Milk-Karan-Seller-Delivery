# Email Not Confirmed - Fix Guide

## Why This Error Occurs

The "Email not confirmed" error appears because **Supabase requires email verification by default** before users can log in. This is a security feature.

## 🔧 Solution 1: Disable Email Confirmation (For Development)

**Best for:** Development and testing

### Steps:

1. Go to your **Supabase Dashboard**
2. Click on **Authentication** in the left sidebar
3. Click on **Settings** (or **Providers**)
4. Scroll down to **Email Auth** section
5. Find **"Confirm email"** toggle
6. **Turn OFF** the "Confirm email" option
7. Click **Save**

Now users can login immediately after registration without email confirmation.

---

## 🔧 Solution 2: Keep Email Confirmation (Production Ready)

**Best for:** Production apps

### Option A: Resend Confirmation Email (Already Added to App)

The app now has a "Resend Confirmation Email" button that appears when you get the "Email not confirmed" error.

1. Enter your email in the login form
2. Try to login (you'll get the error)
3. Click "Resend Confirmation Email"
4. Check your email inbox
5. Click the confirmation link in the email
6. Try logging in again

### Option B: Manually Confirm Email in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user with email `nandhini@gmail.com`
3. Click on the user
4. Click **"Confirm email"** button
5. User can now login

---

## 🔧 Solution 3: Add Email Confirmation Screen

You can also add a dedicated screen that shows after registration to remind users to check their email.

---

## 📧 Email Configuration

If confirmation emails aren't being sent, check:

1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Verify email templates are configured
3. Check **SMTP settings** (for custom email providers)
4. Check spam/junk folder

---

## ✅ Quick Fix for Testing

**Fastest way to test without email confirmation:**

1. Supabase Dashboard → Authentication → Settings
2. Turn OFF "Confirm email"
3. Save
4. Try logging in again

**Note:** Remember to turn it back ON for production!

---

## 🔍 Verify Email Status

Check if email is confirmed in Supabase:

```sql
-- Check user's email confirmation status
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'nandhini@gmail.com';
```

If `email_confirmed_at` is `NULL`, the email is not confirmed.

---

## 💡 Best Practice

- **Development:** Disable email confirmation for faster testing
- **Production:** Keep email confirmation enabled for security
- **Testing:** Use the resend confirmation feature or manually confirm in dashboard

---

The app code has been updated to show a "Resend Confirmation Email" button when this error occurs!


