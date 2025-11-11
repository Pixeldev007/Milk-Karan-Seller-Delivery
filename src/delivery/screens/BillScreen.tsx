import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { formatINR } from '../data/mock';
import { SearchInput } from '../components/SearchInput';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDelivery } from '../context/DeliveryContext';

function daysInMonth(year: number, monthIndex: number) { // monthIndex 0..11
  return new Date(year, monthIndex + 1, 0).getDate();
}

export const BillScreen: React.FC = () => {
  const nav = useNavigation();
  const { customers, assignments } = useDelivery();
  const now = new Date();
  const [month, setMonth] = React.useState<number>(now.getMonth());
  const [year, setYear] = React.useState<number>(now.getFullYear());
  const [search, setSearch] = React.useState<string>('');

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const list = React.useMemo((): { id: string; name: string; amount: number }[] => {
    const term = search.trim().toLowerCase();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const startIso = start.toISOString().slice(0, 10);
    const endIso = end.toISOString().slice(0, 10);

    // Aggregate delivered liters per customer for selected month
    const litersByCustomer = new Map<string, number>();
    assignments.forEach((a) => {
      if (!a.delivered) return;
      if (a.date < startIso || a.date > endIso) return;
      litersByCustomer.set(a.customerId, (litersByCustomer.get(a.customerId) || 0) + (a.liters || 0));
    });

    return customers
      .filter((c) => c.name.toLowerCase().includes(term))
      .map((c) => {
        const liters = litersByCustomer.get(c.id) || 0;
        const amount = liters * c.rate;
        return { id: c.id, name: c.name, amount };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [month, year, search, customers, assignments]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Bill" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search" />
        <View style={styles.filters}>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={month} onValueChange={(v) => setMonth(Number(v))}>
              {monthNames.map((m, i) => (
                <Picker.Item key={m} label={m} value={i} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={year} onValueChange={(v) => setYear(Number(v))}>
              {[year-1, year, year+1].map((y) => (
                <Picker.Item key={y} label={String(y)} value={y} />
              ))}
            </Picker>
          </View>
        </View>

        {list.map((item) => (
          <TouchableOpacity key={item.id} style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.amountPill}>
              <Text style={styles.amountText}>{formatINR(item.amount)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 12 },
  pickerWrap: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 10 },
  name: { flex: 1, color: Colors.text, fontWeight: '600' },
  amountPill: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 10 },
  amountText: { color: '#fff', fontWeight: '700' },
});
