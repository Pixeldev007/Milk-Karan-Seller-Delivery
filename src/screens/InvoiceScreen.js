import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, FlatList, Modal, Pressable, TextInput, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function InvoiceScreen({ navigation }) {
  const [invoices, setInvoices] = React.useState([
    { id: 'INV-0001', customer: 'Pooja Suresh', amount: 500, date: '2025-10-01', status: 'Unpaid' },
    { id: 'INV-0002', customer: 'Ravi Kumar', amount: 750, date: '2025-10-10', status: 'Paid' },
  ]);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ customer: '', amount: '', date: '', status: 'Unpaid' });

  const createInvoice = () => {
    if (!form.customer) return Alert.alert('Missing Customer', 'Please enter a customer name.');
    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) return Alert.alert('Invalid Amount', 'Please enter a valid amount.');
    const id = `INV-${(Number(invoices[invoices.length-1]?.id?.split('-')[1] || '0') + 1).toString().padStart(4,'0')}`;
    const date = form.date || new Date().toISOString().slice(0,10);
    setInvoices(prev => [{ id, customer: form.customer, amount: amountNum, date, status: form.status }, ...prev]);
    setShowForm(false);
    setForm({ customer: '', amount: '', date: '', status: 'Unpaid' });
  };

  const renderInvoice = ({ item }) => (
    <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.id}</Text>
        <Text style={styles.cardSub}>{item.customer} • {item.status}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.cardSub}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBar title="Invoices" navigation={navigation} />

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.createBtnText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <FlatList
          data={invoices}
          keyExtractor={(it) => it.id}
          renderItem={renderInvoice}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Invoice</Text>
              <Pressable onPress={() => { setShowForm(false); setForm({ customer: '', amount: '', date: '', status: 'Unpaid' }); }}><Text style={styles.modalClose}>Close</Text></Pressable>
            </View>

            <Text style={styles.label}>Customer</Text>
            <TextInput style={styles.input} placeholder="Enter customer name" value={form.customer} onChangeText={(t)=>setForm(s=>({...s, customer:t}))} />

            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="Enter amount" value={form.amount} onChangeText={(t)=>setForm(s=>({...s, amount:t}))} />

            <Text style={styles.label}>Status</Text>
            <View style={styles.chipsRow}>
              {['Unpaid','Paid','Partial'].map((m)=> (
                <TouchableOpacity key={m} style={[styles.chip, form.status===m && styles.chipActive]} onPress={()=>setForm(s=>({...s, status:m}))}>
                  <Text style={[styles.chipText, form.status===m && styles.chipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD (optional)" value={form.date} onChangeText={(t)=>setForm(s=>({...s, date:t}))} />

            <TouchableOpacity style={styles.saveBtn} onPress={createInvoice}><Text style={styles.saveText}>Add Invoice</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  headerActions: { paddingHorizontal: 16, paddingTop: 12, alignSelf: 'center', width: '100%', maxWidth: 900 },
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
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
