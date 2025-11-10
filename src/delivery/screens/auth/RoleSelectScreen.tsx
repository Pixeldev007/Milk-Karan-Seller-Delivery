import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../../components/HeaderBar';
import { Colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';

export const RoleSelectScreen: React.FC = () => {
  const nav = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Choose role" showBack onPressBack={() => nav.goBack()} />
      <View style={styles.container}>
        <Text style={styles.title}>Login as</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.card} accessibilityRole="button" onPress={() => (nav as any).navigate('NamePhoneLogin', { role: 'customer' })}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.cardSub}>Access your deliveries</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} accessibilityRole="button" onPress={() => (nav as any).navigate('NamePhoneLogin', { role: 'delivery_boy' })}>
            <Text style={styles.cardTitle}>Delivery Boy</Text>
            <Text style={styles.cardSub}>Manage assigned routes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  cardSub: { color: '#4b5563', marginTop: 4 },
});
