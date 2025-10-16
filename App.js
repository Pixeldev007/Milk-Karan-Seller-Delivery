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

const Drawer = createDrawerNavigator();

export default function App() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: isWeb ? 'permanent' : 'front',
          drawerStyle: {
            width: 280,
          },
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
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
