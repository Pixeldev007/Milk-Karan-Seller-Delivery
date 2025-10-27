import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';

function toYMD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DailySellScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDBoy, setSelectedDBoy] = useState('all');
  const todayKey = toYMD(selectedDate);

  // Demo delivery boys
  const deliveryBoys = [
    { id: 'all', name: 'All Delivery Boys' },
    { id: '1', name: 'Suresh' },
    { id: '2', name: 'Mahesh' },
  ];

  // Demo data for daily sells
  const [sales, setSales] = useState([
    { id: '1', date: toYMD(new Date()), customerName: 'Ravi Kumar', qty: '1.0 L', status: 'Delivered', deliveryBoyId: '1' },
    { id: '2', date: toYMD(new Date()), customerName: 'Anita Sharma', qty: '0.5 L', status: 'Pending', deliveryBoyId: '2' },
    { id: '3', date: toYMD(new Date(Date.now() - 86400000)), customerName: 'Karthik', qty: '1.0 L', status: 'Delivered', deliveryBoyId: '1' },
  ]);

  const filtered = useMemo(() => {
    return sales.filter((s) => s.date === todayKey && (selectedDBoy === 'all' || s.deliveryBoyId === selectedDBoy));
  }, [sales, todayKey, selectedDBoy]);

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const toggleStatus = (id) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Delivered' ? 'Pending' : 'Delivered' } : s
      )
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.customerName}</Text>
        <Text style={styles.sub}>Qty: {item.qty}</Text>
      </View>
      <View style={styles.statusWrap}>
        <View style={[styles.statusPill, item.status === 'Delivered' ? styles.okPill : styles.pendingPill]}>
          <Ionicons
            name={item.status === 'Delivered' ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={item.status === 'Delivered' ? '#1B5E20' : '#B26A00'}
          />
          <Text style={[styles.statusText, item.status === 'Delivered' ? styles.okText : styles.pendingText]}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => toggleStatus(item.id)}>
          <Text style={styles.toggleText}>Toggle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Sell</Text>
      </View>

      {/* Filters: Date and Delivery Boy */}
      <ScreenContainer>
      <View style={styles.filters}>
        <View style={styles.dateBox}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => shiftDate(-1)}>
            <Ionicons name="chevron-back" size={18} color="#2e7d32" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{todayKey}</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => shiftDate(1)}>
            <Ionicons name="chevron-forward" size={18} color="#2e7d32" />
          </TouchableOpacity>
        </View>

        <View style={styles.dboyBox}>
          <Ionicons name="person" size={16} color="#777" />
          <Text style={styles.dboyLabel}>Delivery Boy:</Text>
          <View style={styles.dboyPicker}>
            {deliveryBoys.map((db) => (
              <TouchableOpacity
                key={db.id}
                onPress={() => setSelectedDBoy(db.id)}
                style={[styles.dboyChip, selectedDBoy === db.id && styles.dboyChipActive]}
              >
                <Text style={[styles.dboyChipText, selectedDBoy === db.id && styles.dboyChipTextActive]}>
                  {db.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}> 
            <Ionicons name="water-outline" size={48} color="#bbb" />
            <Text style={styles.emptyText}>No sales for this date/filter</Text>
          </View>
        )}
      />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#90EE90',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  filters: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  dateBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  dateText: {
    fontWeight: '700',
    color: '#333',
  },
  dboyBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 10,
  },
  dboyLabel: {
    marginLeft: 6,
    color: '#666',
    fontWeight: '600',
  },
  dboyPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dboyChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  dboyChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#66BB6A',
  },
  dboyChipText: {
    color: '#555',
    fontWeight: '600',
  },
  dboyChipTextActive: {
    color: '#2e7d32',
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sub: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  statusWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  okPill: {
    backgroundColor: '#E8F5E9',
    borderColor: '#66BB6A',
  },
  pendingPill: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFECB3',
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },
  okText: {
    color: '#1B5E20',
  },
  pendingText: {
    color: '#B26A00',
  },
  toggleBtn: {
    backgroundColor: '#66BB6A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  toggleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 8,
  },
});
