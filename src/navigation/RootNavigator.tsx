import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import DailySellScreen from '../screens/DailySellScreen';
import DeliveryBoyScreen from '../screens/DeliveryBoyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import CreateBillScreen from '../screens/CreateBillScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DeliveryLoginScreen from '../screens/DeliveryLoginScreen';
import { useAuth } from '../context/AuthContext';
import DeliveryNavigator from './DeliveryNavigator';

const Stack = createNativeStackNavigator<any>();
const SellerStack = createNativeStackNavigator<any>();

const AppTheme = DefaultTheme;

function SellerRoot() {
  return (
    <SellerStack.Navigator screenOptions={{ headerShown: false }}>
      <SellerStack.Screen name="Dashboard" component={DashboardScreen} />
      <SellerStack.Screen name="DailySell" component={DailySellScreen} />
      <SellerStack.Screen name="Delivery" component={DeliveryBoyScreen} />
      <SellerStack.Screen name="Invoice" component={InvoiceScreen} />
      <SellerStack.Screen name="CreateBill" component={CreateBillScreen} />
      <SellerStack.Screen name="Settings" component={SettingsScreen} />
    </SellerStack.Navigator>
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
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="DeliveryLogin" component={DeliveryLoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen
            name="Main"
            component={role === 'delivery' ? DeliveryNavigator : SellerRoot}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
