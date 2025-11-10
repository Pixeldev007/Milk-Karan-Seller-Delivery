import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { DayTabs, Day } from '../components/DayTabs';
import { SearchInput } from '../components/SearchInput';
import { OrderRow } from '../components/OrderRow';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDelivery } from '../context/DeliveryContext';
import { litersToAmount, formatINR } from '../data/mock';

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

const toDate = (iso: string | undefined) => {
  if (!iso) return new Date();
  const [year, month, day] = iso.split('-').map((v) => Number(v));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return new Date();
  return new Date(year, month - 1, day);
};

export const DailySellScreen: React.FC = () => {
  const nav = useNavigation();
  const { assignments, getCustomerById } = useDelivery();
  const days = React.useMemo(() => buildDays(), []);
  const [selected, setSelected] = React.useState(3);
  const [search, setSearch] = React.useState('');

  const selectedDay = days[selected] ?? days[Math.floor(days.length / 2)];
  const selectedDate = React.useMemo(() => toDate(selectedDay?.value), [selectedDay]);

  const deliveries = React.useMemo(() => {
    if (!selectedDay) return [] as {
      customerId: string;
      liters: number;
      name: string;
      product: string;
      rate: number;
    }[];

    const map = new Map<
      string,
      {
        liters: number;
        name: string;
        product: string;
        rate: number;
      }
    >();

    assignments.forEach((assignment) => {
      if (assignment.date !== selectedDay.value || !assignment.delivered) return;
      const customer = getCustomerById(assignment.customerId);
      if (!customer) return;
      const prev = map.get(customer.id) ?? { liters: 0, name: customer.name, product: customer.product, rate: customer.rate };
      map.set(customer.id, {
        ...prev,
        liters: prev.liters + assignment.liters,
      });
    });

    return Array.from(map.entries())
      .map(([customerId, value]) => ({ customerId, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [assignments, selectedDay, getCustomerById]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return deliveries;
    return deliveries.filter((item) => item.name.toLowerCase().includes(term));
  }, [deliveries, search]);

  const totals = React.useMemo(() => {
    let liters = 0;
    let amount = 0;
    filtered.forEach((item) => {
      liters += item.liters;
      amount += litersToAmount(item.product as any, item.liters);
    });
    return { liters, amount };
  }, [filtered]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Daily Sell" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border }}>
        <DayTabs days={days} selectedIndex={selected} onChange={setSelected} />
        <Text style={styles.dateText}>{selectedDate.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
      </View>
      <View style={{ height: 12 }} />
      <SearchInput value={search} onChangeText={setSearch} placeholder="Search Customer" />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Deliveries</Text>
          <Text style={styles.summaryValue}>{filtered.length}</Text>
          <Text style={styles.summaryLabel}>Liters</Text>
          <Text style={styles.summaryValue}>{totals.liters.toFixed(1)} L</Text>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>{formatINR(totals.amount)}</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No deliveries recorded</Text>
            <Text style={styles.emptySub}>Complete assignments in My Pickup to log daily sell.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.customerId} style={{ marginBottom: 12 }}>
              <Text style={styles.sectionHeader}>{item.name}</Text>
              <View style={styles.card}>
                <OrderRow
                  title={item.product}
                  subtitle="Delivered"
                  meta={`${item.liters.toFixed(1)} Liter • ${formatINR(item.rate)}`}
                  price={formatINR(litersToAmount(item.product as any, item.liters))}
                />
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  summaryLabel: { color: Colors.muted, fontWeight: '600' },
  summaryValue: { color: Colors.text, fontWeight: '700' },
  sectionHeader: { color: Colors.text, fontWeight: '700', marginHorizontal: 12, marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 12,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: { color: Colors.text, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: Colors.muted, textAlign: 'center' },
});
