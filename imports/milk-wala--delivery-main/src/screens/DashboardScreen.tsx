import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDelivery } from '../context/DeliveryContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const Card: React.FC<{ icon: IconName; title: string; subtitle: string; onPress?: () => void }>
  = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardIconWrap}>
      <Ionicons name={icon} size={24} color={Colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
  </TouchableOpacity>
);

export const DashboardScreen: React.FC = () => {
  const nav = useNavigation();
  const { configured, connected, refresh, loading } = useDelivery();
  const status = React.useMemo(() => {
    if (!configured) return { label: 'Supabase: Not configured', color: '#dc2626', icon: 'close-circle' as const };
    if (connected) return { label: 'Supabase: Connected', color: '#16a34a', icon: 'checkmark-circle' as const };
    return { label: 'Supabase: Disconnected', color: '#f59e0b', icon: 'alert-circle' as const };
  }, [configured, connected]);
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Dashboard" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <View style={styles.statusBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={status.icon} size={16} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <TouchableOpacity onPress={refresh} disabled={loading} accessibilityRole="button" style={styles.refreshBtn}>
          <Ionicons name="refresh" size={16} color={loading ? Colors.muted : Colors.text} />
          <Text style={[styles.refreshText, loading && { color: Colors.muted }]}>{loading ? 'Refreshing...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card icon="car" title="My Pickup" subtitle="Pickup, delivery, analysis" onPress={() => nav.navigate('MyPickup' as never)} />
        <Card icon="cart" title="My Sell" subtitle="View your daily sell" onPress={() => nav.navigate('DailySell' as never)} />
        <Card icon="pricetags" title="Daily Sell" subtitle="Make daily sell" onPress={() => nav.navigate('DailySell' as never)} />
        <Card icon="receipt" title="Create Bill" subtitle="Make customers bill, credit" onPress={() => nav.navigate('Bill' as never)} />
        <Card icon="bus" title="My Delivery" subtitle="View delivery details" onPress={() => nav.navigate('MyDelivery' as never)} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: { marginLeft: 8, fontWeight: '700' },
  refreshBtn: { flexDirection: 'row', alignItems: 'center' },
  refreshText: { marginLeft: 6, color: Colors.text, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  cardTitle: { fontWeight: '700', color: Colors.text },
  cardSub: { color: Colors.muted, marginTop: 2 },
});
