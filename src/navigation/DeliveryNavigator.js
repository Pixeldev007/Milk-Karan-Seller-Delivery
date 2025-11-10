import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeliveryBoyScreen from '../screens/DeliveryBoyScreen';

const Stack = createNativeStackNavigator();

export default function DeliveryNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DeliveryHome" component={DeliveryBoyScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
