import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const [language, setLanguage] = React.useState('en');
  const [open, setOpen] = React.useState(false);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingBottom: 24 }}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>PG</Text></View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>Paresh Gami (Delivery)</Text>
          <Text style={styles.muted}>9726502930</Text>
          <Text style={styles.muted}>Samvaad sonnet</Text>
        </View>
      </View>

      <DrawerItem icon="home" label="Dashboard" onPress={() => props.navigation.navigate('Dashboard' as never)} />
      <DrawerItem icon="car" label="My Pickup" onPress={() => props.navigation.navigate('MyPickup' as never)} />
      <DrawerItem icon="cart" label="Daily Sell" onPress={() => props.navigation.navigate('DailySell' as never)} />
      <DrawerItem icon="bus" label="My Delivery" onPress={() => props.navigation.navigate('MyDelivery' as never)} />
      <DrawerItem icon="star" label="Rate Us" onPress={() => {}} />
      <DrawerItem icon="log-out" label="Logout" onPress={() => {}} />

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
