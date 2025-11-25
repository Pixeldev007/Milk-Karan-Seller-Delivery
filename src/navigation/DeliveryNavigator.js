import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MyDeliveryScreen } from '../delivery/screens/MyDeliveryScreen';
import { DeliveryProvider } from '../delivery/context/DeliveryContext';
import { AuthProvider as DeliveryAuthProvider } from '../delivery/context/AuthContext';
import { useAuth as useSellerAuth } from '../context/AuthContext';
import { useAuth as useDeliveryAuth } from '../delivery/context/AuthContext';
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
function ReportScreenLazy(props) {
  const { ReportScreen } = require('../delivery/screens/ReportScreen');
  return <ReportScreen {...props} />;
}

// Lazy wrapper for SettingsScreen so delivery drawer has a Settings route
function SettingsScreenLazy(props) {
  const { SettingsScreen } = require('../delivery/screens/SettingsScreen');
  return <SettingsScreen {...props} />;
}

export default function DeliveryNavigator() {
  // Bridge: if seller AuthContext already has deliveryAgent, seed delivery AuthContext
  function Bridge({ children }) {
    const { deliveryAgent } = useSellerAuth();
    const dAuth = useDeliveryAuth();
    React.useEffect(() => {
      if (deliveryAgent && !dAuth.agent) {
        dAuth.loginAs('delivery_boy', {
          id: deliveryAgent.id,
          ownerId: deliveryAgent.owner_id || deliveryAgent.ownerId || '',
          name: deliveryAgent.name,
          phone: deliveryAgent.phone,
          area: deliveryAgent.area || undefined,
          loginId: deliveryAgent.login_id || deliveryAgent.loginId || undefined,
          createdAt: deliveryAgent.created_at || deliveryAgent.createdAt || new Date().toISOString(),
          updatedAt: deliveryAgent.updated_at || deliveryAgent.updatedAt || new Date().toISOString(),
        });
      }
    }, [deliveryAgent, dAuth.agent]);
    return children;
  }

  return (
    <DeliveryAuthProvider>
      <DeliveryProvider>
        <Bridge>
          <Drawer.Navigator
            initialRouteName="Dashboard"
            screenOptions={{ headerShown: false }}
            drawerContent={(props) => <DrawerContentLazy {...props} />}
          >
            <Drawer.Screen name="Dashboard" component={DashboardScreenLazy} />
            <Drawer.Screen name="MyPickup" component={MyPickupScreenLazy} />
            <Drawer.Screen name="Bill" component={BillScreenLazy} />
            <Drawer.Screen name="MyDelivery" component={MyDeliveryScreen} />
            <Drawer.Screen name="Report" component={ReportScreenLazy} />
            <Drawer.Screen name="Settings" component={SettingsScreenLazy} />
          </Drawer.Navigator>
        </Bridge>
      </DeliveryProvider>
    </DeliveryAuthProvider>
  );
}
