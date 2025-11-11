import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { DayTabs, Day } from '../components/DayTabs';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDelivery, Product } from '../context/DeliveryContext';
import { setDeliveryStatus } from '../services/deliveryApi';
import { useAuth } from '../../context/AuthContext';

type Shift = 'morning' | 'evening';

const SHIFT_OPTIONS: { label: string; value: Shift }[] = [
  { label: 'Morning', value: 'morning' },
  { label: 'Evening', value: 'evening' },
];

const buildDays = (): Day[] => {
  const now = new Date();
  const labels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const arr: Day[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() + i);
    arr.push({
      label: labels[d.getDay()],
      sub: d.getDate().toString().padStart(2, '0'),
      value: d.toISOString().slice(0, 10),
    });
  }
  return arr;
};

const TableRow: React.FC<{ name: string; assigned: string; delivered: string; pending: string; head?: boolean }> = ({ name, assigned, delivered, pending, head }) => (
  <View style={[styles.tableRow, head && styles.tableHead]}>
    <Text style={[styles.cell, head && styles.cellHead]}>{name}</Text>
    <Text style={[styles.cell, head && styles.cellHead]}>{assigned}</Text>
    <Text style={[styles.cell, head && styles.cellHead]}>{delivered}</Text>
    <Text style={[styles.cell, head && styles.cellHead]}>{pending}</Text>
  </View>
);

export const MyPickupScreen: React.FC = () => {
  const nav = useNavigation();
  const {
    assignments,
    toggleDelivered,
    getCustomerById,
    getDeliveryAgentById,
  } = useDelivery();
  const { deliveryAgent } = useAuth();

  if (!deliveryAgent) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <HeaderBar title="My Pickup" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
        <View style={{ padding: 16 }}>
          <Text style={{ color: Colors.text, fontWeight: '700', marginBottom: 6 }}>No delivery profile</Text>
          <Text style={{ color: Colors.muted }}>Login as a delivery boy to view your assigned pickups.</Text>
        </View>
      </View>
    );
  }

  const days = React.useMemo(() => buildDays(), []);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(3);
  const [selectedShift, setSelectedShift] = React.useState<Shift>('morning');
  const [notes, setNotes] = React.useState('');

  // No assign form; assignments are created by seller. This page only shows and updates delivery status.

  const selectedDay = days[selectedDayIndex] ?? days[Math.floor(days.length / 2)];

  const shiftAssignments = React.useMemo(() => {
    if (!selectedDay) return [];
    return assignments
      .filter((assignment) => {
        // If backend has date/shift, filter normally; if missing, let UI selection include it
        if (assignment.date && assignment.date !== selectedDay.value) return false;
        if (assignment.shift && assignment.shift !== selectedShift) return false;
        // Only show assignments for the logged-in delivery agent
        if (deliveryAgent?.id && assignment.deliveryAgentId !== deliveryAgent.id) return false;
        return true;
      })
      .sort((a, b) => {
        const customerA = getCustomerById(a.customerId);
        const customerB = getCustomerById(b.customerId);
        if (a.delivered !== b.delivered) {
          return Number(a.delivered) - Number(b.delivered);
        }
        return (customerA?.name || '').localeCompare(customerB?.name || '');
      });
  }, [assignments, selectedDay, selectedShift, deliveryAgent?.id, getCustomerById]);

  const summary = React.useMemo(() => {
    const base: Record<Product, { assigned: number; delivered: number }> = {
      'Buffalo Milk': { assigned: 0, delivered: 0 },
      'Cow Milk': { assigned: 0, delivered: 0 },
    };
    shiftAssignments.forEach((assignment) => {
      const customer = getCustomerById(assignment.customerId);
      if (!customer) return;
      const productBucket = base[customer.product];
      productBucket.assigned += assignment.liters;
      if (assignment.delivered) {
        productBucket.delivered += assignment.liters;
      }
    });
    return base;
  }, [shiftAssignments, getCustomerById]);

  // Assign form removed; only display and update delivery status.

  const totalAssigned = summary['Buffalo Milk'].assigned + summary['Cow Milk'].assigned;
  const totalDelivered = summary['Buffalo Milk'].delivered + summary['Cow Milk'].delivered;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="My Pickup" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border }}>
        <DayTabs days={days} selectedIndex={selectedDayIndex} onChange={setSelectedDayIndex} />
        <Text style={styles.dateText}>{new Date(selectedDay?.value ?? '').toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={styles.segment}>
          {SHIFT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.segmentBtn, selectedShift === option.value && styles.segmentBtnActive]}
              onPress={() => setSelectedShift(option.value)}
            >
              <Text style={[styles.segmentText, selectedShift === option.value && styles.segmentTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Showing assignments only for the logged-in delivery agent */}

        <View style={styles.summaryCard}>
          <TableRow name="PRODUCT" assigned="ASSIGNED" delivered="DELIVERED" pending="PENDING" head />
          {([['Buffalo Milk', summary['Buffalo Milk']], ['Cow Milk', summary['Cow Milk']]] as const).map(([label, item]) => (
            <TableRow
              key={label}
              name={label.toUpperCase()}
              assigned={`${item.assigned.toFixed(1)} L`}
              delivered={`${item.delivered.toFixed(1)} L`}
              pending={`${Math.max(item.assigned - item.delivered, 0).toFixed(1)} L`}
            />
          ))}
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryFooterText}>Total Assigned: {totalAssigned.toFixed(1)} L</Text>
            <Text style={styles.summaryFooterText}>Delivered: {totalDelivered.toFixed(1)} L</Text>
          </View>
        </View>

        {/* Assign form removed per requirement */}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Assignments</Text>
        {shiftAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No assignments</Text>
            <Text style={styles.emptySub}>You have no assignments for this shift/day.</Text>
          </View>
        ) : (
          shiftAssignments.map((assignment) => {
            const customer = getCustomerById(assignment.customerId);
            const agent = getDeliveryAgentById(assignment.deliveryAgentId);
            return (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignmentName}>{customer?.name ?? 'Unknown Customer'}</Text>
                  <Text style={styles.assignmentMeta}>
                    {customer?.product} • {assignment.liters.toFixed(1)} L
                  </Text>
                  <Text style={styles.assignmentMeta}>
                    Agent: {agent?.name ?? 'Unassigned'}
                  </Text>
                  <Text style={styles.assignmentMeta}>Shift: {(assignment.shift ?? selectedShift) === 'morning' ? 'Morning' : 'Evening'}</Text>
                </View>
                <View style={styles.switchWrap}>
                  <Text style={styles.switchLabel}>Delivered</Text>
                  <Switch
                    value={assignment.delivered}
                    onValueChange={async (value) => {
                      // Persist via RPC using currently selected day/shift (creates row if needed)
                      try {
                        await setDeliveryStatus(
                          assignment.id,
                          selectedDay.value,
                          selectedShift,
                          value,
                          assignment.liters,
                        );
                      } catch (e) {
                        // ignore; UI still updates via local state
                      }
                      toggleDelivered(assignment.id, value);
                    }}
                  />
                </View>
              </View>
            );
          })
        )}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={styles.notes}
          multiline
          placeholder="Notes for the shift"
          placeholderTextColor={Colors.muted}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dateText: { textAlign: 'center', paddingBottom: 12, color: Colors.text, fontWeight: '600' },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: Colors.primary },
  segmentText: { color: Colors.text, fontWeight: '600' },
  segmentTextActive: { color: Colors.primaryText },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  filterRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  filterLabel: { color: Colors.muted, fontWeight: '600', marginBottom: 6 },
  filterPicker: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#f9fafb',
  },
  summaryFooterText: { color: Colors.text, fontWeight: '600' },
  sectionTitle: { color: Colors.text, fontWeight: '700', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  inputLabel: { color: Colors.muted, fontWeight: '600', marginBottom: 4 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  cta: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  ctaText: { color: Colors.primaryText, fontWeight: '700' },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
  },
  emptyTitle: { fontWeight: '700', color: Colors.text, marginBottom: 4 },
  emptySub: { color: Colors.muted, textAlign: 'center' },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentName: { color: Colors.text, fontWeight: '700' },
  assignmentMeta: { color: Colors.muted, marginTop: 2 },
  switchWrap: { alignItems: 'center' },
  switchLabel: { color: Colors.muted, fontSize: 12, marginBottom: 4 },
  tableRow: { flexDirection: 'row' },
  tableHead: { backgroundColor: '#f3f4f6' },
  cell: { flex: 1, padding: 10, borderRightWidth: 1, borderColor: Colors.border, color: Colors.text },
  cellHead: { fontWeight: '700' },
  notes: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 10,
    minHeight: 120,
    textAlignVertical: 'top',
    color: Colors.text,
    marginBottom: 16,
  },
});
