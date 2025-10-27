import React from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, FlatList, Modal, Pressable, Alert } from 'react-native';

export default function PaymentSettingScreen() {
  const [payments, setPayments] = React.useState([
    { id: 'PMT-1001', invoiceId: 'INV-0001', amount: 500, mode: 'Cash', date: '2025-10-01' },
    { id: 'PMT-1002', invoiceId: 'INV-0002', amount: 750, mode: 'Online', date: '2025-10-10' },
  ]);
  const [invoices] = React.useState([
    { id: 'INV-0001', total: 500 },
    { id: 'INV-0002', total: 750 },
    { id: 'INV-0003', total: 1200 },
  ]);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ invoiceId: '', amount: '', mode: 'Cash', date: '' });
  const [showInvoiceList, setShowInvoiceList] = React.useState(false);

  const resetForm = () => setForm({ invoiceId: '', amount: '', mode: 'Cash', date: '' });

  const createPayment = () => {
    if (!form.invoiceId) return Alert.alert('Missing Invoice', 'Please select an invoice.');
    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) return Alert.alert('Invalid Amount', 'Please enter a valid amount.');
    const id = `PMT-${(1000 + payments.length + 1).toString()}`;
    const date = form.date || new Date().toISOString().slice(0, 10);
    setPayments(prev => [{ id, invoiceId: form.invoiceId, amount: amountNum, mode: form.mode, date }, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const renderPayment = ({ item }) => (
    <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.invoiceId}</Text>
        <Text style={styles.cardSub}>ID: {item.id} • {item.mode}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.cardSub}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.createBtnText}>Create Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <FlatList
          data={payments}
          keyExtractor={(it) => it.id}
          renderItem={renderPayment}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Payment</Text>
              <Pressable onPress={() => { setShowForm(false); resetForm(); }}><Text style={styles.modalClose}>Close</Text></Pressable>
            </View>

            <Text style={styles.label}>Invoice Number</Text>
            <TouchableOpacity style={styles.select} onPress={() => setShowInvoiceList((s) => !s)}>
              <Text style={styles.selectText}>{form.invoiceId || 'Select Invoice'}</Text>
            </TouchableOpacity>
            {showInvoiceList && (
              <View style={styles.selectList}>
                {invoices.map(inv => (
                  <Pressable key={inv.id} style={styles.selectItem} onPress={() => { setForm(f => ({ ...f, invoiceId: inv.id, amount: String(inv.total) })); setShowInvoiceList(false); }}>
                    <Text style={styles.selectItemText}>{inv.id} • ₹{inv.total}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="Enter amount" value={form.amount} onChangeText={(t)=>setForm(s=>({...s, amount:t}))} />

            <Text style={styles.label}>Mode</Text>
            <View style={styles.chipsRow}>
              {['Cash','Online'].map((m)=> (
                <TouchableOpacity key={m} style={[styles.chip, form.mode===m && styles.chipActive]} onPress={()=>setForm(s=>({...s, mode:m}))}>
                  <Text style={[styles.chipText, form.mode===m && styles.chipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD (optional)" value={form.date} onChangeText={(t)=>setForm(s=>({...s, date:t}))} />

            <TouchableOpacity style={styles.saveBtn} onPress={createPayment}><Text style={styles.saveText}>Add Payment</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: '#90EE90', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  createBtn: { backgroundColor: '#66BB6A', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  body: { padding: 16, alignSelf: 'center', width: '100%', maxWidth: 900 },
  label: { fontSize: 13, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' },
  chipText: { color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#2e7d32' },
  cardRow: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  cardSub: { fontSize: 12, color: '#777', marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '700', color: '#2e7d32' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  modalClose: { color: '#2e7d32', fontWeight: '700' },
  select: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  selectText: { color: '#333' },
  selectList: { marginTop: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, overflow: 'hidden' },
  selectItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectItemText: { color: '#333' },
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
