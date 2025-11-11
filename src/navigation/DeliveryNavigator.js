import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DailySellScreen } from '../delivery/screens/DailySellScreen';
import { MyDeliveryScreen } from '../delivery/screens/MyDeliveryScreen';
import { SettingsScreen } from '../delivery/screens/SettingsScreen';
import { DeliveryProvider } from '../delivery/context/DeliveryContext';
// Lazy-loaded modules to avoid bundling optional deps before needed
function MyPickupScreenLazy(props) {
  const { MyPickupScreen } = require('../delivery/screens/MyPickupScreen');
  return <MyPickupScreen {...props} />;
}
function DrawerContentLazy(props) {
  const { DrawerContent } = require('../delivery/screens/DrawerContent');
  return <DrawerContent {...props} />;
}

const Drawer = createDrawerNavigator();

// Lazy wrapper to defer requiring BillScreen (which depends on optional packages)
function BillScreenLazy(props) {
  // require only when this screen is actually rendered
  const { BillScreen } = require('../delivery/screens/BillScreen');
  return <BillScreen {...props} />;
}

// Lazy wrapper to defer requiring DashboardScreen (loads DeliveryContext and supabase client)
function DashboardScreenLazy(props) {
  const { DashboardScreen } = require('../delivery/screens/DashboardScreen');
  return <DashboardScreen {...props} />;
}

export default function DeliveryNavigator() {
  return (
    <DeliveryProvider>
      <Drawer.Navigator
        screenOptions={{ headerShown: false }}
        drawerContent={(props) => <DrawerContentLazy {...props} />}
      >
        <Drawer.Screen name="Dashboard" component={DashboardScreenLazy} />
        <Drawer.Screen name="MyPickup" component={MyPickupScreenLazy} />
        <Drawer.Screen name="DailySell" component={DailySellScreen} />
        <Drawer.Screen name="Bill" component={BillScreenLazy} />
        <Drawer.Screen name="MyDelivery" component={MyDeliveryScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </DeliveryProvider>
  );
}
