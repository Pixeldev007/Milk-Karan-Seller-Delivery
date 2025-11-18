import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDelivery } from '../context/DeliveryContext';
import CalendarStrip from '../../components/CalendarStrip';

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

  const [selectedDate, setSelectedDate] = useState(new Date());

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
      <View style={styles.container}>
        {/* Date strip similar to Seller dashboard */}
        <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        {/* Compact stats row (three small boxes) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCardCompact}>
            <Text style={[styles.statNumberCompact, { color: '#01559d' }]}>0</Text>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(1,85,157,0.15)' }]}>
              <Ionicons name="checkmark" size={18} color="#01559d" />
            </View>
          </View>
          <View style={styles.statCardCompact}>
            <Text style={[styles.statNumberCompact, { color: '#01559d' }]}>0</Text>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(1,85,157,0.15)' }]}>
              <Ionicons name="close" size={18} color="#01559d" />
            </View>
          </View>
          <View style={[styles.statCardCompact, styles.statCardEmphasis]}>
            <Text style={[styles.statNumberCompact, styles.statNumberEmphasis, { color: '#01559d' }]}>0.00 L</Text>
            <View style={[styles.statIconCircle, styles.statIconCircleLarge, { backgroundColor: 'rgba(1,85,157,0.15)' }]}>
              <Ionicons name="water" size={18} color="#01559d" />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 12 }}>
          <Card icon="car" title="My Pickup" subtitle="Pickup, delivery, analysis" onPress={() => nav.navigate('MyPickup' as never)} />
          <Card icon="receipt" title="Create Bill" subtitle="Make customers bill, credit" onPress={() => nav.navigate('Bill' as never)} />
          <Card icon="bus" title="My Delivery" subtitle="View delivery details" onPress={() => nav.navigate('MyDelivery' as never)} />
          <Card icon="document-text" title="Report" subtitle="Enquiry / Message" onPress={() => nav.navigate('Report' as never)} />

          {/* Footer similar to Seller dashboard */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>India's</Text>
            <Text style={styles.footerSubtitle}>milk app ❤️</Text>
          </View>
        </ScrollView>
      </View>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#01559d',
  },
  subtitle: {
    fontSize: 14,
    color: '#4F5B62',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCardCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#01559d',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: '#01559d',
  },
  statNumberEmphasis: {
    fontSize: 20,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircleLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  statCardEmphasis: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#01559d',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  footerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#4F5B62',
  },
  footerSubtitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#4F5B62',
  },
});
