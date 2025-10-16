import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Demo sales data; in a real app this would come from your store/DB
const demoSales = [
  // date, qty in liters, amount, paid boolean
  { id: 'd1', date: '2025-10-15', qtyL: 3.0, amount: 150, paid: true },
  { id: 'd2', date: '2025-10-16', qtyL: 2.5, amount: 130, paid: false },
  { id: 'd3', date: '2025-10-14', qtyL: 1.0, amount: 50, paid: true },
  { id: 'd4', date: '2025-10-10', qtyL: 5.0, amount: 250, paid: true },
  { id: 'd5', date: '2025-10-01', qtyL: 2.0, amount: 100, paid: false },
];

function toYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export default function ReportScreen() {
  const [activeTab, setActiveTab] = useState('Daily'); // Daily | Weekly | Monthly
  const [anchorDate, setAnchorDate] = useState(new Date());

  const range = useMemo(() => {
    const base = new Date(anchorDate);
    base.setHours(0, 0, 0, 0);

    if (activeTab === 'Daily') {
      const from = base;
      const to = base;
      return { from, to };
    }
    if (activeTab === 'Weekly') {
      // start on Monday
      const day = base.getDay(); // 0..6 (Sun..Sat)
      const diffToMonday = (day + 6) % 7; // days since Monday
      const from = addDays(base, -diffToMonday);
      const to = addDays(from, 6);
      return { from, to };
    }
    // Monthly
    const from = new Date(base.getFullYear(), base.getMonth(), 1);
    const to = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { from, to };
  }, [activeTab, anchorDate]);

  const { totalMilk, income, pending } = useMemo(() => {
    const fromKey = toYMD(range.from);
    const toKey = toYMD(range.to);

    const inRange = demoSales.filter((s) => s.date >= fromKey && s.date <= toKey);
    const totalMilk = inRange.reduce((sum, s) => sum + s.qtyL, 0);
    const income = inRange.reduce((sum, s) => sum + s.amount, 0);
    const paidSum = inRange.reduce((sum, s) => sum + (s.paid ? s.amount : 0), 0);
    const pending = income - paidSum;
    return { totalMilk, income, pending };
  }, [range]);

  const shiftAnchor = (delta) => {
    if (activeTab === 'Daily') setAnchorDate((d) => addDays(d, delta));
    else if (activeTab === 'Weekly') setAnchorDate((d) => addDays(d, delta * 7));
    else setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, d.getDate()));
  };

  const onExportPDF = () => {
    Alert.alert('Export PDF', `Exporting ${activeTab} report to PDF...`);
  };

  const onExportExcel = () => {
    Alert.alert('Export Excel', `Exporting ${activeTab} report to Excel...`);
  };

  const tabButton = (tab) => (
    <TouchableOpacity
      key={tab}
      onPress={() => setActiveTab(tab)}
      style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>{['Daily', 'Weekly', 'Monthly'].map(tabButton)}</View>

      {/* Anchor date controls */}
      <View style={styles.anchorRow}>
        <TouchableOpacity style={styles.anchorBtn} onPress={() => shiftAnchor(-1)}>
          <Ionicons name="chevron-back" size={18} color="#2e7d32" />
        </TouchableOpacity>
        <Text style={styles.anchorText}>
          {activeTab}: {toYMD(range.from)}
          {range.to > range.from ? ` → ${toYMD(range.to)}` : ''}
        </Text>
        <TouchableOpacity style={styles.anchorBtn} onPress={() => shiftAnchor(1)}>
          <Ionicons name="chevron-forward" size={18} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* Totals */}
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Milk Sold</Text>
          <Text style={[styles.cardValue, { color: '#2e7d32' }]}>{totalMilk.toFixed(2)} L</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={[styles.cardValue, { color: '#2e7d32' }]}>₹ {income.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pending Amount</Text>
          <Text style={[styles.cardValue, { color: '#B26A00' }]}>₹ {pending.toFixed(2)}</Text>
        </View>
      </View>

      {/* Export Buttons */}
      <View style={styles.exportRow}>
        <TouchableOpacity style={[styles.exportBtn, styles.pdfBtn]} onPress={onExportPDF}>
          <Ionicons name="document-outline" size={18} color="#2e7d32" />
          <Text style={[styles.exportText, { color: '#2e7d32' }]}>Export PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.exportBtn, styles.xlsBtn]} onPress={onExportExcel}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={[styles.exportText, { color: '#fff' }]}>Export Excel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <Text style={styles.note}>Note: Values are based on demo data. Wire to real data as needed.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tabBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  tabBtnActive: { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' },
  tabText: { color: '#555', fontWeight: '700' },
  tabTextActive: { color: '#2e7d32' },
  anchorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  anchorBtn: { padding: 8, borderRadius: 8, backgroundColor: '#E8F5E9' },
  anchorText: { fontWeight: '700', color: '#333' },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
  },
  cardLabel: { color: '#666', fontWeight: '600' },
  cardValue: { marginTop: 8, fontSize: 18, fontWeight: '800' },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  pdfBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#66BB6A' },
  xlsBtn: { backgroundColor: '#25D366' },
  exportText: { fontWeight: '700' },
  note: { color: '#888', marginTop: 16 },
});
