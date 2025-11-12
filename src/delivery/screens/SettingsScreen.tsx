import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useAuth as useSellerAuth } from '../../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Item: React.FC<{ icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress?: () => void }>
  = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={20} color={Colors.text} />
      <Text style={styles.itemText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation();
  const auth = useAuth();
  let sellerAuth: ReturnType<typeof useSellerAuth> | null = null;
  try {
    sellerAuth = useSellerAuth();
  } catch {
    sellerAuth = null;
  }
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Settings" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={styles.card}>
          <Item icon="person" label="Update Profile" onPress={() => Alert.alert('Coming soon', 'Profile editing will be available in a future update.')} />
          <View style={styles.divider} />
          <Item icon="lock-closed" label="Change Password" onPress={() => Alert.alert('Coming soon', 'Ask your seller to update your login details.')} />
          <View style={styles.divider} />
          <Item icon="document-text" label="Terms And Conditions" onPress={async () => {
            const url = 'https://milkwala.example.com/terms';
            try {
              const can = await Linking.canOpenURL(url);
              if (!can) return;
              await Linking.openURL(url);
            } catch {}
          }} />
          <View style={styles.divider} />
          <Item icon="log-out" label="Logout" onPress={async () => {
            try {
              auth.logout();
              await sellerAuth?.signOut?.();
              await supabase.auth.signOut();
            } finally {
              try { (nav as any).reset({ index: 0, routes: [{ name: 'Dashboard' }] }); } catch {}
            }
          }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 14 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemText: { marginLeft: 10, color: Colors.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border },
});
