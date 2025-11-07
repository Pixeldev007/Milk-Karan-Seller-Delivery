# Login & Register Pages Schema

Complete schema and structure documentation for the authentication pages in Milk Wala.

## 📋 Table of Contents

1. [Login Page Schema](#login-page-schema)
2. [Register Page Schema](#register-page-schema)
3. [Shared Components & Styling](#shared-components--styling)
4. [Validation Rules](#validation-rules)
5. [Navigation Flow](#navigation-flow)
6. [Color Scheme](#color-scheme)

---

## 🔐 Login Page Schema

### Component Structure

```
LoginScreen
├── KeyboardAvoidingView (container)
│   └── View (card)
│       ├── Text (title: "Welcome Back")
│       ├── Text (subtitle)
│       ├── Text (error message - conditional)
│       ├── View (fieldGroup: Email)
│       │   ├── Text (label: "Email")
│       │   └── TextInput (email input)
│       ├── View (fieldGroup: Password)
│       │   ├── Text (label: "Password")
│       │   └── TextInput (password input - secure)
│       ├── TouchableOpacity (Sign In button)
│       │   └── ActivityIndicator | Text ("Sign In")
│       └── View (footerRow)
│           ├── Text ("New to Milk Wala?")
│           └── TouchableOpacity (navigate to Register)
│               └── Text ("Create an account")
```

### Form Fields

| Field | Type | Required | Placeholder | Validation |
|-------|------|----------|-------------|------------|
| `email` | TextInput | ✅ Yes | "you@example.com" | Must be non-empty (trimmed) |
| `password` | TextInput (secure) | ✅ Yes | "Enter your password" | Must be non-empty |

### State Management

```javascript
{
  email: string,           // User email input
  password: string,        // User password input
  loading: boolean,        // Loading state during authentication
  error: string           // Error message to display
}
```

### Validation Rules

1. **Email**: 
   - Must not be empty after trimming
   - Uses `keyboardType="email-address"` for better UX
   - `autoCapitalize="none"` to prevent capitalization

2. **Password**:
   - Must not be empty
   - Uses `secureTextEntry` to hide input

3. **Form Validation**:
   - Both fields must be filled
   - Error message: "Please enter both email and password."

### User Actions

| Action | Handler | Behavior |
|--------|---------|----------|
| **Sign In** | `handleLogin()` | Validates → Calls `signIn()` → Redirects to Dashboard on success |
| **Navigate to Register** | `navigation.navigate('Register')` | Opens Register screen |
| **Input Change** | `setEmail()` / `setPassword()` | Updates state, clears error |

### API Integration

```javascript
// Uses AuthContext
const { signIn } = useAuth();

// Sign in call
await signIn({ 
  email: email.trim(), 
  password 
});

// On success: Automatic redirect to Dashboard (via RootNavigator)
// On error: Display error message
```

---

## 📝 Register Page Schema

### Component Structure

```
RegisterScreen
├── KeyboardAvoidingView (container)
│   └── View (card)
│       ├── Text (title: "Create Account")
│       ├── Text (subtitle)
│       ├── Text (error message - conditional)
│       ├── Text (success message - conditional)
│       ├── View (fieldGroup: Full Name)
│       │   ├── Text (label: "Full Name")
│       │   └── TextInput (fullName input)
│       ├── View (fieldGroup: Email)
│       │   ├── Text (label: "Email")
│       │   └── TextInput (email input)
│       ├── View (fieldGroup: Password)
│       │   ├── Text (label: "Password")
│       │   └── TextInput (password input - secure)
│       ├── View (fieldGroup: Confirm Password)
│       │   ├── Text (label: "Confirm Password")
│       │   └── TextInput (confirmPassword input - secure)
│       ├── TouchableOpacity (Sign Up button)
│       │   └── ActivityIndicator | Text ("Sign Up")
│       └── View (footerRow)
│           ├── Text ("Already have an account?")
│           └── TouchableOpacity (navigate to Login)
│               └── Text ("Sign in")
```

### Form Fields

| Field | Type | Required | Placeholder | Validation |
|-------|------|----------|-------------|------------|
| `fullName` | TextInput | ✅ Yes | "Pooja Suresh" | Must be non-empty (trimmed) |
| `email` | TextInput | ✅ Yes | "you@example.com" | Must be non-empty (trimmed) |
| `password` | TextInput (secure) | ✅ Yes | "Create a password" | Must be non-empty |
| `confirmPassword` | TextInput (secure) | ✅ Yes | "Re-enter your password" | Must match password |

### State Management

```javascript
{
  fullName: string,        // User's full name
  email: string,          // User email
  password: string,        // User password
  confirmPassword: string, // Password confirmation
  loading: boolean,        // Loading state during registration
  error: string,          // Error message to display
  message: string         // Success message to display
}
```

### Validation Rules

1. **Full Name**:
   - Must not be empty after trimming
   - Example: "Pooja Suresh"

2. **Email**:
   - Must not be empty after trimming
   - Uses `keyboardType="email-address"`
   - `autoCapitalize="none"`

3. **Password**:
   - Must not be empty
   - Uses `secureTextEntry`

4. **Confirm Password**:
   - Must not be empty
   - Must match `password` exactly
   - Uses `secureTextEntry`

5. **Form Validation**:
   - All fields must be filled
   - Passwords must match
   - Error messages:
     - "All fields are required." (if any field empty)
     - "Passwords do not match." (if passwords don't match)

### User Actions

| Action | Handler | Behavior |
|--------|---------|----------|
| **Sign Up** | `handleRegister()` | Validates → Calls `signUp()` → Shows success message → Clears form |
| **Navigate to Login** | `navigation.navigate('Login')` | Opens Login screen |
| **Input Change** | `setFullName()` / `setEmail()` / etc. | Updates state, clears error/message |

### API Integration

```javascript
// Uses AuthContext
const { signUp } = useAuth();

// Sign up call
await signUp({ 
  email: email.trim(), 
  password, 
  fullName: fullName.trim() 
});

// On success: 
// - Shows message: "Account created! Please check your email to verify your account."
// - Clears all form fields
// - User may need to verify email before accessing Dashboard

// On error: Display error message
```

### Success Flow

After successful registration:
1. Success message displayed
2. Form fields cleared
3. User receives email verification (if enabled in Supabase)
4. After email verification, user can login and access Dashboard

---

## 🎨 Shared Components & Styling

### Common Layout Structure

Both pages share the same layout pattern:

```javascript
<KeyboardAvoidingView 
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  style={styles.container}
>
  <View style={styles.card}>
    {/* Content */}
  </View>
</KeyboardAvoidingView>
```

### Shared Style Properties

| Style Property | Value | Description |
|----------------|-------|-------------|
| `container.backgroundColor` | `#E8F5E9` | Light green background |
| `container.paddingHorizontal` | `24` | Horizontal padding |
| `card.maxWidth` | `420` | Maximum card width |
| `card.backgroundColor` | `#fff` | White card background |
| `card.borderRadius` | `16` | Rounded corners |
| `card.padding` | `28` | Card padding |
| `card.shadowOpacity` | `0.1` | Card shadow |
| `card.elevation` | `6` | Android shadow |

### Input Field Styling

```javascript
{
  height: 48,
  borderWidth: 1,
  borderColor: '#C8E6C9',    // Light green border
  borderRadius: 10,
  paddingHorizontal: 14,
  fontSize: 16,
  backgroundColor: '#FAFAFA'  // Light gray background
}
```

### Button Styling

```javascript
{
  backgroundColor: '#66BB6A',  // Primary green
  borderRadius: 10,
  paddingVertical: 16,
  alignItems: 'center',
  marginTop: 12
}
```

### Typography

| Element | Font Size | Font Weight | Color |
|---------|-----------|-------------|-------|
| Title | `28` | `700` | `#1B5E20` (Dark green) |
| Subtitle | `16` | `400` | `#4F5B62` (Gray) |
| Label | `15` | `400` | `#2E7D32` (Medium green) |
| Button Text | `17` | `600` | `#fff` (White) |
| Footer Text | `15` | `400` | `#4F5B62` (Gray) |
| Footer Link | `15` | `600` | `#1B5E20` (Dark green) |
| Error | `15` | `400` | `#D32F2F` (Red) |
| Success Message | `15` | `400` | `#2E7D32` (Green) |

---

## ✅ Validation Rules Summary

### Login Page

```javascript
// Validation Logic
if (!email.trim() || !password) {
  setError('Please enter both email and password.');
  return;
}

// API Call
await signIn({ email: email.trim(), password });
```

### Register Page

```javascript
// Validation Logic
if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
  setError('All fields are required.');
  return;
}

if (password !== confirmPassword) {
  setError('Passwords do not match.');
  return;
}

// API Call
await signUp({ 
  email: email.trim(), 
  password, 
  fullName: fullName.trim() 
});
```

---

## 🔄 Navigation Flow

```
┌─────────────────┐
│   App Launch    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RootNavigator   │
└────────┬────────┘
         │
         ├─── No Session ────► AuthStackNavigator
         │                         │
         │                         ├──► LoginScreen
         │                         │
         │                         └──► RegisterScreen
         │
         └─── Has Session ────► DrawerNavigator
                                      │
                                      └──► DashboardScreen (default)
```

### Navigation Routes

| From | Action | To | Route Name |
|------|--------|----|-----------| 
| Login | Tap "Create an account" | Register | `'Register'` |
| Register | Tap "Sign in" | Login | `'Login'` |
| Login (success) | Auto redirect | Dashboard | Via `RootNavigator` |
| Register (success) | Email verification → Login | Dashboard | Via `RootNavigator` |

---

## 🎨 Color Scheme

### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Background | `#E8F5E9` | Page background |
| Card Background | `#fff` | Card container |
| Primary Green | `#66BB6A` | Buttons, accents |
| Dark Green | `#1B5E20` | Titles, links |
| Medium Green | `#2E7D32` | Labels, success messages |
| Light Green Border | `#C8E6C9` | Input borders |

### Text Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Dark Green | `#1B5E20` | Titles, footer links |
| Medium Green | `#2E7D32` | Labels |
| Gray | `#4F5B62` | Subtitles, footer text |
| White | `#fff` | Button text |
| Red | `#D32F2F` | Error messages |

### Input Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Light Gray | `#FAFAFA` | Input background |
| Light Green | `#C8E6C9` | Input border |

---

## 📱 Platform-Specific Behavior

### iOS
- `KeyboardAvoidingView` uses `'padding'` behavior
- Status bar style: Light (configured in App.js)

### Android
- `KeyboardAvoidingView` behavior: `undefined` (default)
- Uses `elevation` for shadows instead of `shadowColor`

---

## 🔧 Dependencies

### Required Imports

```javascript
// React Native Components
import { 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Navigation
import { useNavigation } from '@react-navigation/native';

// Context
import { useAuth } from '../context/AuthContext';
```

### Context Methods Used

- **Login**: `signIn({ email, password })`
- **Register**: `signUp({ email, password, fullName })`

---

## 📝 Form Data Structure

### Login Form Data

```typescript
interface LoginFormData {
  email: string;
  password: string;
}
```

### Register Form Data

```typescript
interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

### API Payload

**Login:**
```javascript
{
  email: string,    // Trimmed
  password: string
}
```

**Register:**
```javascript
{
  email: string,        // Trimmed
  password: string,
  fullName: string      // Trimmed, stored in user metadata
}
```

---

## 🚀 Usage Example

### Accessing Login Screen

```javascript
// From Register Screen
navigation.navigate('Login');
```

### Accessing Register Screen

```javascript
// From Login Screen
navigation.navigate('Register');
```

### After Authentication

Both screens automatically redirect to Dashboard via `RootNavigator` when:
- Login: Session is created successfully
- Register: Session is created (may require email verification first)

---

## 📋 Checklist for Implementation

### Login Page
- [x] Email input field
- [x] Password input field (secure)
- [x] Sign In button
- [x] Link to Register page
- [x] Error handling
- [x] Loading state
- [x] Form validation
- [x] Keyboard handling

### Register Page
- [x] Full Name input field
- [x] Email input field
- [x] Password input field (secure)
- [x] Confirm Password input field (secure)
- [x] Sign Up button
- [x] Link to Login page
- [x] Error handling
- [x] Success message
- [x] Loading state
- [x] Form validation
- [x] Password matching validation
- [x] Keyboard handling

---

## 🔍 Error Handling

### Login Errors
- Empty fields: "Please enter both email and password."
- Invalid credentials: Supabase error message
- Network errors: "Unable to sign in. Please try again."

### Register Errors
- Empty fields: "All fields are required."
- Password mismatch: "Passwords do not match."
- Email already exists: Supabase error message
- Network errors: "Unable to sign up. Please try again."

---

## 📄 File Locations

- **Login Screen**: `src/screens/LoginScreen.js`
- **Register Screen**: `src/screens/RegisterScreen.js`
- **Auth Context**: `src/context/AuthContext.js`
- **Navigation Setup**: `App.js`

