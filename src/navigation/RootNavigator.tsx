import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DailySellScreen } from '../screens/DailySellScreen';
import { MyPickupScreen } from '../screens/MyPickupScreen';
import { DrawerContent } from '../screens/DrawerContent';
import { BillScreen } from '../screens/BillScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors } from '../theme/colors';
import { MyDeliveryScreen } from '../screens/MyDeliveryScreen';
import { QRScanScreen } from '../screens/auth/QRScanScreen';
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen';
import { NamePhoneLoginScreen } from '../screens/auth/NamePhoneLoginScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const AppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: '#fff',
    text: '#111827',
    border: Colors.border,
    notification: Colors.primary,
  },
};

function DrawerRoot() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }} drawerContent={(p) => <DrawerContent {...p} /> }>
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="DailySell" component={DailySellScreen} />
      <Drawer.Screen name="MyPickup" component={MyPickupScreen} />
      <Drawer.Screen name="MyDelivery" component={MyDeliveryScreen} />
      <Drawer.Screen name="Bill" component={BillScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export function RootNavigator() {
  const { role } = useAuth();
  const isLoggedIn = !!role;
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="QRScan" component={QRScanScreen} />
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="NamePhoneLogin" component={NamePhoneLoginScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={DrawerRoot} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
