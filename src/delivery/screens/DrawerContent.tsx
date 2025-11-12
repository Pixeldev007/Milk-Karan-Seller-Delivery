import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { useAuth as useSellerAuth } from '../../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const [language, setLanguage] = React.useState('en');
  const [open, setOpen] = React.useState(false);
  // Delivery app auth (from seller's schema: delivery_agents/customers)
  let auth: ReturnType<typeof useAuth> | null = null;
  try {
    auth = useAuth();
  } catch {
    auth = null;
  }
  // Seller app auth (to clear deliveryAgent in Bridge on logout)
  let sellerAuth: ReturnType<typeof useSellerAuth> | null = null;
  try {
    sellerAuth = useSellerAuth();
  } catch {
    sellerAuth = null;
  }
  const [supabaseName, setSupabaseName] = React.useState<string>('');
  const [supabasePhone, setSupabasePhone] = React.useState<string>('');
  const [supabaseSubtitle, setSupabaseSubtitle] = React.useState<string>('');

  // Fallback: if delivery auth not available, read Supabase session user metadata
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!mounted || !user) return;
        const fullName = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || (user.email as string) || 'User';
        setSupabaseName(fullName);
        // best-effort phone/address from metadata if provided by backend
        const phone = (user.user_metadata?.phone as string) || '';
        const address = (user.user_metadata?.address as string) || '';
        setSupabasePhone(phone);
        setSupabaseSubtitle(address);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Prefer delivery AuthContext values first; fallback to Supabase user metadata
  const displayName = React.useMemo(() => {
    if (auth?.role === 'delivery_boy' && auth?.agent?.name) return `${auth.agent.name} (Delivery)`;
    if (auth?.role === 'customer' && auth?.customer?.name) return auth.customer.name;
    return supabaseName || 'User';
  }, [auth?.role, auth?.agent?.name, auth?.customer?.name, supabaseName]);

  const phone = auth?.role === 'delivery_boy' ? auth?.agent?.phone : auth?.role === 'customer' ? auth?.customer?.phone : supabasePhone;
  const subtitle = auth?.role === 'delivery_boy' ? auth?.agent?.area : auth?.role === 'customer' ? auth?.customer?.address : supabaseSubtitle;
  const initials = (displayName || '')
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingBottom: 24 }}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{displayName}</Text>
          {!!phone && <Text style={styles.muted}>{phone}</Text>}
          {!!subtitle && <Text style={styles.muted}>{subtitle}</Text>}
        </View>
      </View>

      <DrawerItem icon="home" label="Dashboard" onPress={() => props.navigation.navigate('Dashboard' as never)} />
      <DrawerItem icon="car" label="My Pickup" onPress={() => props.navigation.navigate('MyPickup' as never)} />
      <DrawerItem icon="receipt" label="Create Bill" onPress={() => props.navigation.navigate('Bill' as never)} />
      <DrawerItem icon="bus" label="My Delivery" onPress={() => props.navigation.navigate('MyDelivery' as never)} />
      <DrawerItem icon="document-text" label="Report" onPress={() => props.navigation.navigate('Report' as never)} />
      <DrawerItem icon="settings" label="Settings" onPress={() => props.navigation.navigate('Settings' as never)} />
      <DrawerItem icon="star" label="Rate Us" onPress={async () => {
        try {
          const url = 'https://play.google.com/store/apps/details?id=com.milkwala';
          const supported = await Linking.canOpenURL(url);
          if (!supported) {
            Alert.alert('Unavailable', 'Unable to open the store link on this device');
            return;
          }
          await Linking.openURL(url);
        } catch (e: any) {
          Alert.alert('Error', e?.message || 'Failed to open store');
        }
      }} />
      <DrawerItem icon="log-out" label="Logout" onPress={async () => {
        try {
          // Clear delivery app state
          auth?.logout?.();
          // Clear seller auth deliveryAgent so Bridge does not re-seed
          await sellerAuth?.signOut?.();
          // Clear Supabase session if any
          await supabase.auth.signOut();
        } catch {}
        // Close drawer after logout
        try { props.navigation.closeDrawer(); } catch {}
      }} />

      <View style={{ flex: 1 }} />

      <TouchableOpacity style={styles.langBtn} onPress={() => setOpen(true)}>
        <Ionicons name="language" size={18} color={Colors.text} />
        <Text style={{ marginLeft: 8, color: Colors.text }}>Language: {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'ગુજરાતી'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Picker selectedValue={language} onValueChange={(v) => setLanguage(v)}>
              <Picker.Item label="English" value="en" />
              <Picker.Item label="हिंदी" value="hi" />
              <Picker.Item label="ગુજરાતી" value="gu" />
            </Picker>
            <TouchableOpacity style={styles.modalClose} onPress={() => setOpen(false)}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
};

const DrawerItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Ionicons name={icon} size={20} color={Colors.text} />
    <Text style={styles.itemText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: { backgroundColor: Colors.primary, padding: 16, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.primaryText, fontWeight: '800' },
  name: { color: '#fff', fontWeight: '700' },
  muted: { color: '#e6ffe6' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: '#fff' },
  itemText: { marginLeft: 12, color: Colors.text },
  langBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: Colors.border },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '85%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  modalClose: { backgroundColor: Colors.primary, alignItems: 'center', padding: 12 },
});
