import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Platform, Alert, Dimensions } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { Ionicons } from '@expo/vector-icons';

// Layout constants for web modal sizing
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH_WEB = 280;
const PAGE_GUTTER = 16;
const CONTENT_WIDTH_WEB = Math.max(360, WINDOW_WIDTH - DRAWER_WIDTH_WEB - PAGE_GUTTER * 2);
const MODAL_MAX_WIDTH = 640; // smaller modal width on large screens

export default function ReceivedPaymentScreen() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([
    { id: '1', customer: 'Ravi Kumar', amount: 300, date: '2025-10-15', mode: 'Cash' },
    { id: '2', customer: 'Anita Sharma', amount: 150, date: '2025-10-16', mode: 'Online' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ customer: '', amount: '', date: '', mode: 'Cash' });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.customer.toLowerCase().includes(q) ||
        String(r.amount).includes(q) ||
        r.date.includes(q) ||
        r.mode.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const openAdd = () => {
    setForm({ customer: '', amount: '', date: '', mode: 'Cash' });
    setModalVisible(true);
  };

  const saveForm = () => {
    const amountNum = parseFloat(form.amount);
    if (!form.customer.trim() || !Number.isFinite(amountNum) || !form.date.trim()) {
      Alert.alert('Invalid', 'Enter customer, amount and date.');
      return;
    }
    const newId = (Math.max(0, ...rows.map((r) => parseInt(r.id, 10))) + 1).toString();
    setRows((prev) => [...prev, { id: newId, customer: form.customer, amount: amountNum, date: form.date, mode: form.mode }]);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 2 }]}>{item.customer}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>₹ {item.amount}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.date}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.mode}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Received Payment</Text>
      </View>

      <ScreenContainer>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Search by name, date, mode" value={query} onChangeText={setQuery} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.addText}>Add Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Table header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.hcell, { flex: 2 }]}>Customer</Text>
        <Text style={[styles.hcell, { flex: 1 }]}>Amount</Text>
        <Text style={[styles.hcell, { flex: 1 }]}>Date</Text>
        <Text style={[styles.hcell, { flex: 1 }]}>Mode</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      </ScreenContainer>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Payment</Text>

            <TextInput style={styles.input} placeholder="Customer name" value={form.customer} onChangeText={(t) => setForm((s) => ({ ...s, customer: t }))} />
            <TextInput style={styles.input} placeholder="Amount" keyboardType="decimal-pad" value={form.amount} onChangeText={(t) => setForm((s) => ({ ...s, amount: t }))} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={form.date} onChangeText={(t) => setForm((s) => ({ ...s, date: t }))} />

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Mode</Text>
              <View style={styles.toggleGroup}>
                {['Cash', 'Online'].map((m) => (
                  <TouchableOpacity key={m} style={[styles.toggleBtn, form.mode === m && styles.toggleBtnActive]} onPress={() => setForm((s) => ({ ...s, mode: m }))}>
                    <Text style={[styles.toggleText, form.mode === m && styles.toggleTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveForm}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#66BB6A', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  addText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginHorizontal: 16, marginTop: 12, borderRadius: 8, padding: 10 },
  headerRow: { backgroundColor: '#f3f3f3', borderColor: '#e1e1e1' },
  hcell: { fontWeight: '800', color: '#555' },
  cell: { color: '#333' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignSelf: Platform.select({ web: 'center', default: 'center' }), width: Platform.select({ web: Math.min(CONTENT_WIDTH_WEB, MODAL_MAX_WIDTH), default: undefined }) },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginTop: 10 },
  modalActions: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#f1f1f1' },
  saveBtn: { backgroundColor: '#66BB6A' },
  toggleRow: { marginTop: 10 },
  toggleLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  toggleGroup: { flexDirection: 'row', gap: 8 },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  toggleBtnActive: { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' },
  toggleText: { color: '#555', fontWeight: '600' },
  toggleTextActive: { color: '#2e7d32' },
});
