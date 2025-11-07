import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { ActivityIndicator, Platform, useWindowDimensions, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DashboardScreen from './src/screens/DashboardScreen';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import MyCustomerScreen from './src/screens/MyCustomerScreen';
import DeliveryBoyScreen from './src/screens/DeliveryBoyScreen';
import DailySellScreen from './src/screens/DailySellScreen';
import CreateBillScreen from './src/screens/CreateBillScreen';
import ReportScreen from './src/screens/ReportScreen';
import ProductScreen from './src/screens/ProductScreen';
import MessageScreen from './src/screens/MessageScreen';
import ReceivedPaymentScreen from './src/screens/ReceivedPaymentScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import UpdateProfileScreen from './src/screens/UpdateProfileScreen';
import BusinessProfileScreen from './src/screens/BusinessProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import GSTScreen from './src/screens/GSTScreen';
import PersonalSettingsScreen from './src/screens/PersonalSettingsScreen';
import UseAppOnWebScreen from './src/screens/UseAppOnWebScreen';
import UploadQRScreen from './src/screens/UploadQRScreen';
import PaymentSettingScreen from './src/screens/PaymentSettingScreen';
import UploadLogoScreen from './src/screens/UploadLogoScreen';
import BulkPriceUpdateScreen from './src/screens/BulkPriceUpdateScreen';
import BatchConfigurationScreen from './src/screens/BatchConfigurationScreen';
import TermsAndConditionsScreen from './src/screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import MyAppCustomersScreen from './src/screens/MyAppCustomersScreen';
import ActiveDeviceScreen from './src/screens/ActiveDeviceScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import MyDataScreen from './src/screens/MyDataScreen';
import BillSettingScreen from './src/screens/BillSettingScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

if (__DEV__) {
  try {
    const reanimatedVersion = require('react-native-reanimated/package.json').version;
    const drawerVersion = require('@react-navigation/drawer/package.json').version;
    const workletsVersion = require('react-native-worklets/package.json').version;
    // eslint-disable-next-line no-console
    console.log('[Versions]', { reanimatedVersion, drawerVersion, workletsVersion });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[Versions] lookup failed', e?.message);
  }
}

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function DrawerNavigator() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const usePermanentDrawer = isWeb && width >= 1024; // only keep sidebar fixed on wide web
  const drawerWidth = Math.min(280, Math.max(240, Math.floor(width * 0.8)));

  return (
    <Drawer.Navigator
      useLegacyImplementation={false}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: usePermanentDrawer ? 'permanent' : 'front',
        drawerStyle: {
          width: drawerWidth,
        },
        overlayColor: usePermanentDrawer ? 'transparent' : 'rgba(0,0,0,0.3)',
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Subscription" component={SubscriptionScreen} />
      <Drawer.Screen name="MyCustomer" component={MyCustomerScreen} options={{ title: 'My Customers' }} />
      <Drawer.Screen name="DeliveryBoy" component={DeliveryBoyScreen} options={{ title: 'Delivery Boy' }} />
      <Drawer.Screen name="DailySell" component={DailySellScreen} options={{ title: 'Daily Sell' }} />
      <Drawer.Screen name="CreateBill" component={CreateBillScreen} options={{ title: 'Create Bill' }} />
      <Drawer.Screen name="Report" component={ReportScreen} options={{ title: 'Report' }} />
      <Drawer.Screen name="Product" component={ProductScreen} options={{ title: 'Products' }} />
      <Drawer.Screen name="Message" component={MessageScreen} options={{ title: 'Message' }} />
      <Drawer.Screen name="ReceivedPayment" component={ReceivedPaymentScreen} options={{ title: 'Received Payment' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      {/* Settings sub-routes (not shown in drawer menu) */}
      <Drawer.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ title: 'Update Profile' }} />
      <Drawer.Screen name="BusinessProfile" component={BusinessProfileScreen} options={{ title: 'Business Profile' }} />
      <Drawer.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Drawer.Screen name="GST" component={GSTScreen} options={{ title: 'GST' }} />
      <Drawer.Screen name="PersonalSettings" component={PersonalSettingsScreen} options={{ title: 'Personal Settings' }} />
      <Drawer.Screen name="UseAppOnWeb" component={UseAppOnWebScreen} options={{ title: 'Use App on Web' }} />
      <Drawer.Screen name="UploadQR" component={UploadQRScreen} options={{ title: 'Upload QR' }} />
      <Drawer.Screen name="PaymentSetting" component={PaymentSettingScreen} options={{ title: 'Payment Setting' }} />
      <Drawer.Screen name="UploadLogo" component={UploadLogoScreen} options={{ title: 'Upload Logo' }} />
      <Drawer.Screen name="BulkPriceUpdate" component={BulkPriceUpdateScreen} options={{ title: 'Bulk Price Update' }} />
      <Drawer.Screen name="BatchConfiguration" component={BatchConfigurationScreen} options={{ title: 'Batch Configuration' }} />
      <Drawer.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ title: 'Terms and Conditions' }} />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <Drawer.Screen name="MyAppCustomers" component={MyAppCustomersScreen} options={{ title: 'My App Customers' }} />
      <Drawer.Screen name="ActiveDevice" component={ActiveDeviceScreen} options={{ title: 'Active Device' }} />
      <Drawer.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notification Settings' }} />
      <Drawer.Screen name="MyData" component={MyDataScreen} options={{ title: 'My Data' }} />
      <Drawer.Screen name="BillSetting" component={BillSettingScreen} options={{ title: 'Bill Setting' }} />
      <Drawer.Screen name="Invoice" component={InvoiceScreen} options={{ title: 'Invoice' }} />
    </Drawer.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9' }}>
        <ActivityIndicator size="large" color="#66BB6A" />
      </View>
    );
  }

  return session ? <DrawerNavigator /> : <AuthStackNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
