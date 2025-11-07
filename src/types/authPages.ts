/**
 * TypeScript Interfaces for Login and Register Pages
 * Based on the authentication pages schema
 */

// ============================================
// LOGIN PAGE TYPES
// ============================================

export interface LoginFormState {
  email: string;
  password: string;
  loading: boolean;
  error: string;
}

export interface LoginFormField {
  name: 'email' | 'password';
  type: 'email' | 'password';
  required: true;
  placeholder: string;
  secureTextEntry: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences';
  autoCorrect?: boolean;
}

export interface LoginValidationRule {
  field: string;
  rule: string;
  message: string;
}

export interface LoginPageConfig {
  component: 'LoginScreen';
  title: string;
  subtitle: string;
  formFields: LoginFormField[];
  validation: {
    rules: LoginValidationRule[];
    errorMessages: {
      emptyFields: string;
    };
  };
  actions: {
    primary: {
      label: string;
      handler: string;
    };
    secondary: {
      label: string;
      destination: string;
    };
  };
}

// ============================================
// REGISTER PAGE TYPES
// ============================================

export interface RegisterFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  message: string;
}

export interface RegisterFormField {
  name: 'fullName' | 'email' | 'password' | 'confirmPassword';
  type: 'text' | 'email' | 'password';
  required: true;
  placeholder: string;
  secureTextEntry: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoCorrect?: boolean;
}

export interface RegisterValidationRule {
  field: string;
  rule: string;
  message: string;
}

export interface RegisterPageConfig {
  component: 'RegisterScreen';
  title: string;
  subtitle: string;
  formFields: RegisterFormField[];
  validation: {
    rules: RegisterValidationRule[];
    errorMessages: {
      emptyFields: string;
      passwordMismatch: string;
    };
  };
  actions: {
    primary: {
      label: string;
      handler: string;
    };
    secondary: {
      label: string;
      destination: string;
    };
  };
}

// ============================================
// SHARED TYPES
// ============================================

export interface ColorScheme {
  background: '#E8F5E9';
  cardBackground: '#fff';
  primaryGreen: '#66BB6A';
  darkGreen: '#1B5E20';
  mediumGreen: '#2E7D32';
  lightGreenBorder: '#C8E6C9';
  gray: '#4F5B62';
  error: '#D32F2F';
  success: '#2E7D32';
  white: '#fff';
}

export interface AuthPageStyling {
  container: {
    backgroundColor: string;
    paddingHorizontal: number;
    alignItems: 'center';
    justifyContent: 'center';
  };
  card: {
    width: string;
    maxWidth: number;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
    elevation: number;
  };
  input: {
    height: number;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    paddingHorizontal: number;
    fontSize: number;
    backgroundColor: string;
  };
  button: {
    backgroundColor: string;
    borderRadius: number;
    paddingVertical: number;
    alignItems: 'center';
  };
}

// ============================================
// API TYPES
// ============================================

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthNavigationProp = {
  navigate: (screen: 'Login' | 'Register') => void;
};

