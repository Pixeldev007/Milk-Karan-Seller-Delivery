import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import CalendarStrip from '../../components/CalendarStrip';
import { fetchAgentDailyDeliveries, AgentDailyDeliveryRow } from '../services/deliveryApi';

export const MyDeliveryScreen: React.FC = () => {
  const nav = useNavigation();
  const { agent } = useAuth();

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const selectedIso = React.useMemo(() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);
  const [rows, setRows] = React.useState<AgentDailyDeliveryRow[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchAgentDailyDeliveries({ date: selectedIso, agentId: agent?.id });
      if (!cancelled) setRows(data);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedIso, agent?.id]);

  const totals = React.useMemo(() => {
    let deliveredQty = 0;
    rows.forEach((r) => {
      if (r.delivered) deliveredQty += r.quantity;
    });
    return { deliveredQty };
  }, [rows]);

  const hasAssignments = rows.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="My Delivery" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border }}>
        <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        <Text style={styles.dateText}>{selectedDate.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 32 }}>
        {!hasAssignments ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No deliveries scheduled</Text>
            <Text style={styles.emptySub}>Assign work from the My Pickup screen to see agent schedules.</Text>
          </View>
        ) : (
          rows.map((row) => (
            <View key={`${row.id}-${row.shift}`} style={styles.agentCard}>
              <View style={styles.agentHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agentName}>{row.customerName || 'Customer'}</Text>
                  {!!row.customerPhone && <Text style={styles.agentMeta}>{row.customerPhone}</Text>}
                </View>
                <View>
                  <Text style={styles.agentStatLabel}>Quantity</Text>
                  <Text style={styles.agentStatValue}>{row.quantity.toFixed(1)} L</Text>
                  <Text style={styles.agentStatLabel}>Status</Text>
                  <Text style={styles.agentStatValue}>{row.status}</Text>
                </View>
              </View>

              <View style={styles.assignmentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignmentCustomer}>{`${row.date} • ${row.shift || 'Morning'}`}</Text>
                </View>
                <View style={styles.assignmentTag}>
                  <Text style={styles.assignmentTagText}>{row.shift === 'evening' ? 'Evening' : 'Morning'}</Text>
                </View>
                <Text style={[styles.assignmentStatus, row.delivered ? styles.assignmentDone : styles.assignmentPending]}>
                  {row.delivered ? 'Delivered' : 'Pending'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dateText: {
    textAlign: 'center',
    paddingBottom: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: { color: Colors.text, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: Colors.muted, textAlign: 'center' },
  agentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 16,
  },
  agentName: { color: Colors.text, fontWeight: '700', fontSize: 16 },
  agentMeta: { color: Colors.muted, marginTop: 2 },
  agentStatLabel: { color: Colors.muted, fontSize: 12, textAlign: 'right' },
  agentStatValue: { color: Colors.text, fontWeight: '700', textAlign: 'right' },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: 10,
    marginTop: 10,
    gap: 12,
  },
  assignmentCustomer: { color: Colors.text, fontWeight: '600' },
  assignmentMeta: { color: Colors.muted },
  assignmentTag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.primary,
  },
  assignmentTagText: { color: Colors.primaryText, fontWeight: '700' },
  assignmentStatus: { fontWeight: '700' },
  assignmentDone: { color: '#16a34a' },
  assignmentPending: { color: '#dc2626' },
});
