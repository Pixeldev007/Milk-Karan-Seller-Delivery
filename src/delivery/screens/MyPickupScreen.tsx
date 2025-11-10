import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { DayTabs, Day } from '../components/DayTabs';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDelivery, Product } from '../context/DeliveryContext';
import { Picker } from '@react-native-picker/picker';

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
    customers,
    deliveryAgents,
    assignments,
    assignWork,
    toggleDelivered,
    getCustomerById,
    getDeliveryAgentById,
  } = useDelivery();

  const days = React.useMemo(() => buildDays(), []);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(3);
  const [selectedShift, setSelectedShift] = React.useState<Shift>('morning');
  const [notes, setNotes] = React.useState('');
  const [assignCustomerId, setAssignCustomerId] = React.useState<string>('');
  const [assignAgentId, setAssignAgentId] = React.useState<string>('');
  const [assignLiters, setAssignLiters] = React.useState<string>('1');
  const [selectedAgentFilter, setSelectedAgentFilter] = React.useState<string>('all');

  React.useEffect(() => {
    if (!assignCustomerId && customers.length) {
      setAssignCustomerId(customers[0].id);
    }
  }, [assignCustomerId, customers]);

  React.useEffect(() => {
    if (!assignAgentId && deliveryAgents.length) {
      setAssignAgentId(deliveryAgents[0].id);
    }
  }, [assignAgentId, deliveryAgents]);

  const selectedDay = days[selectedDayIndex] ?? days[Math.floor(days.length / 2)];

  const shiftAssignments = React.useMemo(() => {
    if (!selectedDay) return [];
    return assignments
      .filter((assignment) => {
        if (assignment.date !== selectedDay.value) return false;
        if (assignment.shift !== selectedShift) return false;
        if (selectedAgentFilter !== 'all' && assignment.deliveryAgentId !== selectedAgentFilter) return false;
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
  }, [assignments, selectedDay, selectedShift, selectedAgentFilter, getCustomerById]);

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

  const handleAssignWork = React.useCallback(() => {
    if (!assignCustomerId || !selectedDay) {
      Alert.alert('Assign work', 'Please choose a customer and day.');
      return;
    }
    if (!assignAgentId) {
      Alert.alert('Assign work', 'Please choose a delivery agent.');
      return;
    }
    const liters = parseFloat(assignLiters);
    if (!Number.isFinite(liters) || liters <= 0) {
      Alert.alert('Assign work', 'Enter a valid number of liters.');
      return;
    }
    assignWork({
      customerId: assignCustomerId,
      deliveryAgentId: assignAgentId,
      date: selectedDay.value,
      shift: selectedShift,
      liters,
    });
    setAssignLiters('1');
  }, [assignCustomerId, assignAgentId, assignLiters, assignWork, selectedDay, selectedShift]);

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

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Delivery Agent</Text>
          <View style={styles.filterPicker}>
            <Picker selectedValue={selectedAgentFilter} onValueChange={(val) => setSelectedAgentFilter(String(val))}>
              <Picker.Item label="All Agents" value="all" />
              {deliveryAgents.map((agent) => (
                <Picker.Item key={agent.id} label={agent.name} value={agent.id} />
              ))}
            </Picker>
          </View>
        </View>

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

        <Text style={styles.sectionTitle}>Assign Work</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Customer</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={assignCustomerId} onValueChange={(val) => setAssignCustomerId(String(val))}>
              {customers.map((customer) => (
                <Picker.Item key={customer.id} label={`${customer.name} • ${customer.product}`} value={customer.id} />
              ))}
            </Picker>
          </View>
          <Text style={styles.inputLabel}>Delivery Agent</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={assignAgentId} onValueChange={(val) => setAssignAgentId(String(val))}>
              {deliveryAgents.map((agent) => (
                <Picker.Item key={agent.id} label={agent.name} value={agent.id} />
              ))}
            </Picker>
          </View>
          <Text style={styles.inputLabel}>Liters</Text>
          <TextInput
            value={assignLiters}
            onChangeText={setAssignLiters}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="Ex: 2.5"
            placeholderTextColor={Colors.muted}
          />
          <TouchableOpacity style={styles.cta} onPress={handleAssignWork}>
            <Text style={styles.ctaText}>Assign for {selectedShift === 'morning' ? 'Morning' : 'Evening'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Assignments</Text>
        {shiftAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No assignments yet</Text>
            <Text style={styles.emptySub}>Assign a customer above to start the shift.</Text>
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
                  <Text style={styles.assignmentMeta}>Shift: {selectedShift === 'morning' ? 'Morning' : 'Evening'}</Text>
                </View>
                <View style={styles.switchWrap}>
                  <Text style={styles.switchLabel}>Delivered</Text>
                  <Switch value={assignment.delivered} onValueChange={(value) => toggleDelivered(assignment.id, value)} />
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
