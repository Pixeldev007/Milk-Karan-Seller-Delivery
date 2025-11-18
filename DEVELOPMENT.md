# Development Guide - Milk Karan App

## 🏗️ Project Architecture

### Folder Structure

```
milk-karan/
├── App.js                          # Root component
├── src/
│   ├── screens/                    # Screen components
│   │   └── DashboardScreen.js
│   ├── components/                 # Reusable components
│   │   ├── MenuCard.js
│   │   ├── CalendarStrip.js
│   │   └── CustomDrawerContent.js
│   └── constants/                  # Constants and theme
│       ├── colors.js
│       ├── theme.js
│       └── index.js
├── assets/                         # Images, fonts, etc.
├── web/                           # Web-specific files
└── package.json                   # Dependencies
```

## 🎨 Design System

### Color Palette

The app uses a **Light Green Theme**:

```javascript
import { COLORS } from './src/constants';

// Primary
COLORS.primary        // #90EE90 - Light Green
COLORS.secondary      // #4DD0E1 - Cyan
COLORS.accent         // #66BB6A - Green

// Usage
<View style={{ backgroundColor: COLORS.primary }} />
```

### Typography

```javascript
import { FONTS } from './src/constants';

// Headings
FONTS.h1  // 32px, bold
FONTS.h2  // 24px, bold
FONTS.h3  // 20px, bold

// Body
FONTS.body    // 14px, normal
FONTS.caption // 12px, normal
```

### Spacing

```javascript
import { SIZES } from './src/constants';

SIZES.padding  // 16
SIZES.margin   // 16
SIZES.radius   // 12
```

### Shadows

```javascript
import { SHADOWS } from './src/constants';

// Apply shadows
style={[styles.card, SHADOWS.medium]}
```

## 🔧 Component Development

### Creating a New Screen

1. Create file in `src/screens/`:

```javascript
// src/screens/CustomerScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants';

export default function CustomerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Customers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
  },
});
```

2. Add to navigation in `App.js`:

```javascript
import CustomerScreen from './src/screens/CustomerScreen';

<Drawer.Screen name="Customers" component={CustomerScreen} />
```

### Creating a Reusable Component

```javascript
// src/components/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants';

export default function Button({ title, onPress, variant = 'primary' }) {
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant]]} 
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  text: {
    ...FONTS.h5,
    color: COLORS.white,
  },
});
```

## 📱 Adding Navigation

### Stack Navigation

```bash
npm install @react-navigation/stack
```

```javascript
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function CustomerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    </Stack.Navigator>
  );
}
```

### Bottom Tab Navigation

```bash
npm install @react-navigation/bottom-tabs
```

```javascript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}
```

## 🔌 API Integration

### Setup Axios

```bash
npm install axios
```

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://your-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCustomers = async () => {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export default api;
```

### Using in Components

```javascript
import { useState, useEffect } from 'react';
import { getCustomers } from '../services/api';

export default function CustomerScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Render component...
}
```

## 💾 State Management

### Using Context API

```javascript
// src/context/AppContext.js
import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);

  return (
    <AppContext.Provider value={{ user, setUser, customers, setCustomers }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
```

Wrap App.js:

```javascript
import { AppProvider } from './src/context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
    </AppProvider>
  );
}
```

Use in components:

```javascript
import { useApp } from '../context/AppContext';

export default function CustomerScreen() {
  const { customers, setCustomers } = useApp();
  // Use state...
}
```

## 💿 Local Storage

### Using AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
const saveData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Load data
const loadData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

// Remove data
const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
};
```

## 📝 Forms

### Using React Hook Form

```bash
npm install react-hook-form
```

```javascript
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button } from 'react-native';

export default function CustomerForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Customer Name"
          />
        )}
      />
      {errors.name && <Text>{errors.name.message}</Text>}
      
      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

## 🎯 Best Practices

### 1. Component Organization

- Keep components small and focused
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Separate business logic from UI

### 2. Performance

```javascript
// Use React.memo for expensive components
export default React.memo(MenuCard);

// Use useCallback for functions
const handlePress = useCallback(() => {
  // Handle press
}, [dependencies]);

// Use useMemo for expensive calculations
const sortedCustomers = useMemo(() => {
  return customers.sort((a, b) => a.name.localeCompare(b.name));
}, [customers]);
```

### 3. Error Handling

```javascript
const [error, setError] = useState(null);

try {
  const data = await fetchData();
  setData(data);
} catch (err) {
  setError(err.message);
  // Show error to user
}
```

### 4. Loading States

```javascript
const [loading, setLoading] = useState(false);

if (loading) {
  return <ActivityIndicator size="large" color={COLORS.primary} />;
}
```

## 🧪 Testing

### Unit Testing with Jest

```bash
npm install --save-dev jest @testing-library/react-native
```

```javascript
// MenuCard.test.js
import { render } from '@testing-library/react-native';
import MenuCard from './MenuCard';

test('renders menu card with title', () => {
  const { getByText } = render(
    <MenuCard title="My Customer" icon="people" />
  );
  expect(getByText('My Customer')).toBeTruthy();
});
```

## 📦 Building for Production

### Web Build

```bash
npx expo export:web
```

Output in `web-build/` directory.

### Android APK

```bash
eas build --platform android
```

### iOS IPA

```bash
eas build --platform ios
```

## 🐛 Debugging

### React Native Debugger

1. Install React Native Debugger
2. Open debugger before starting app
3. Shake device and select "Debug"

### Console Logs

```javascript
console.log('Debug:', data);
console.warn('Warning:', warning);
console.error('Error:', error);
```

### React DevTools

```bash
npm install -g react-devtools
react-devtools
```

## 📚 Useful Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Directory](https://reactnative.directory/)

---

Happy Coding! 🚀
