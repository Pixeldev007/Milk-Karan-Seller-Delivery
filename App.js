import 'react-native-gesture-handler';
import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
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

const Drawer = createDrawerNavigator();

export default function App() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const usePermanentDrawer = isWeb && width >= 1024; // only keep sidebar fixed on wide web
  const drawerWidth = Math.min(280, Math.max(240, Math.floor(width * 0.8)));
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Drawer.Navigator
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
    </NavigationContainer>
  );
}
