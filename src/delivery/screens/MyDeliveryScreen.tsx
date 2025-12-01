import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { DayTabs, Day } from '../components/DayTabs';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';

const buildDays = (): Day[] => {
  const now = new Date();
  const labels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const arr: Day[] = [];
  // Show the last 7 days including today (no future dates)
  for (let i = -6; i <= 0; i++) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    arr.push({
      label: labels[d.getDay()],
      sub: d.getDate().toString().padStart(2, '0'),
      value: `${y}-${m}-${day}`,
    });
  }
  return arr;
};

export const MyDeliveryScreen: React.FC = () => {
  const nav = useNavigation();
  const { deliveryAgents, assignments, getCustomerById } = useDelivery();
  const { agent } = useAuth();

  const days = React.useMemo(() => buildDays(), []);
  const [selected, setSelected] = React.useState(3);

  const selectedDay = days[selected] ?? days[Math.floor(days.length / 2)];
  const selectedDate = React.useMemo(() => {
    if (!selectedDay) return new Date();
    const [year, month, day] = selectedDay.value.split('-').map((v) => Number(v));
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return new Date();
    return new Date(year, month - 1, day);
  }, [selectedDay]);

  const agentSummaries = React.useMemo(() => {
    if (!selectedDay) return [];
    const list = agent ? deliveryAgents.filter((a) => a.id === agent.id) : [];
    return list.map((agent) => {
      const agentAssignments = assignments.filter((assignment) => {
        if (assignment.deliveryAgentId !== agent.id) return false;
        const effectiveDate = assignment.date || (assignment.assignedAt ? assignment.assignedAt.slice(0, 10) : undefined);
        return effectiveDate === selectedDay.value;
      });
      const totals = agentAssignments.reduce(
        (acc, assignment) => {
          acc.assigned += assignment.liters;
          if (assignment.delivered) acc.delivered += assignment.liters;
          return acc;
        },
        { assigned: 0, delivered: 0 },
      );
      const pending = Math.max(totals.assigned - totals.delivered, 0);
      return {
        agentId: agent.id,
        name: agent.name,
        phone: agent.phone,
        area: agent.area,
        assigned: totals.assigned,
        delivered: totals.delivered,
        pending,
        // Only include delivered rows in the list
        assignments: agentAssignments.filter((a) => a.delivered).map((assignment) => ({
          id: assignment.id,
          customer: getCustomerById(assignment.customerId),
          shift: assignment.shift,
          liters: assignment.liters,
          delivered: assignment.delivered,
        })),
      };
    });
  }, [assignments, deliveryAgents, getCustomerById, selectedDay, agent?.id]);

  const hasAssignments = agentSummaries.some((summary) => summary.assignments.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="My Delivery" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border }}>
        <DayTabs days={days} selectedIndex={selected} onChange={setSelected} />
        <Text style={styles.dateText}>{selectedDate.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 32 }}>
        {!hasAssignments ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No deliveries scheduled</Text>
            <Text style={styles.emptySub}>Assign work from the My Pickup screen to see agent schedules.</Text>
          </View>
        ) : (
          agentSummaries.map((summary) => (
            <View key={summary.agentId} style={styles.agentCard}>
              <View style={styles.agentHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agentName}>{summary.name}</Text>
                  <Text style={styles.agentMeta}>{summary.phone}</Text>
                  {!!summary.area && <Text style={styles.agentMeta}>{summary.area}</Text>}
                </View>
                <View>
                  <Text style={styles.agentStatLabel}>Assigned</Text>
                  <Text style={styles.agentStatValue}>{summary.assigned.toFixed(1)} L</Text>
                  <Text style={styles.agentStatLabel}>Delivered</Text>
                  <Text style={styles.agentStatValue}>{summary.delivered.toFixed(1)} L</Text>
                  <Text style={styles.agentStatLabel}>Pending</Text>
                  <Text style={[styles.agentStatValue, summary.pending > 0 && { color: '#dc2626' }]}>{summary.pending.toFixed(1)} L</Text>
                </View>
              </View>

              {summary.assignments.map((assignment) => (
                <View key={`${assignment.id}-${assignment.shift}`} style={styles.assignmentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assignmentCustomer}>{assignment.customer?.name ?? 'Unknown Customer'}</Text>
                    <Text style={styles.assignmentMeta}>
                      {assignment.customer?.product} • {assignment.liters.toFixed(1)} L
                    </Text>
                  </View>
                  <View style={styles.assignmentTag}>
                    <Text style={styles.assignmentTagText}>{assignment.shift === 'morning' ? 'Morning' : 'Evening'}</Text>
                  </View>
                  <Text style={[styles.assignmentStatus, assignment.delivered ? styles.assignmentDone : styles.assignmentPending]}>
                    {assignment.delivered ? 'Delivered' : 'Pending'}
                  </Text>
                </View>
              ))}
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
