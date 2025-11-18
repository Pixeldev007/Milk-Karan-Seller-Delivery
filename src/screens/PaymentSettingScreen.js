import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, FlatList, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import { listPayments, createPayment as recordPayment } from '../lib/payments';
import { listInvoiceSummaries } from '../lib/invoices';
import { getCustomers } from '../lib/customers';

export default function PaymentSettingScreen() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ invoiceId: '', customerId: '', amount: '', mode: 'Cash', date: '' });
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);

  const resetForm = () => setForm({ invoiceId: '', customerId: '', amount: '', mode: 'Cash', date: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentRows, invoiceRows, customerResult] = await Promise.all([
        listPayments(),
        listInvoiceSummaries(),
        getCustomers(),
      ]);

      if (customerResult.error) {
        throw customerResult.error;
      }

      const customerMap = new Map((customerResult.data || []).map((c) => [c.id, c.name]));

      const formatted = paymentRows.map((p) => ({
        id: p.id,
        invoiceId: p.invoice?.id ? p.invoice.invoice_number ?? p.invoice.id : null,
        invoiceDbId: p.invoice_id,
        customerId: p.customer?.id ?? null,
        customerName: p.customer?.name ?? (p.customer_id ? customerMap.get(p.customer_id) : ''),
        amount: Number(p.amount),
        mode: p.mode,
        date: p.payment_date,
      }));

      setPayments(formatted);
      setInvoices(invoiceRows);
      setCustomers(customerResult.data || []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = () => {
    if (!form.invoiceId && !form.customerId) {
      Alert.alert('Missing fields', 'Select an invoice or customer.');
      return;
    }
    const amountNum = Number.parseFloat(form.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    (async () => {
      try {
        const payload = {
          invoiceId: form.invoiceId || null,
          customerId: form.customerId,
          amount: amountNum,
          date: form.date || new Date().toISOString().slice(0, 10),
          mode: form.mode,
        };
        await recordPayment(payload);
        setShowForm(false);
        resetForm();
        await loadData();
      } catch (error) {
        Alert.alert('Save failed', error.message || 'Unable to record payment.');
      }
    })();
  };

  const renderPayment = ({ item }) => (
    <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.invoiceId || 'Direct Payment'}</Text>
        <Text style={styles.cardSub}>{item.customerName ? `${item.customerName} • ` : ''}ID: {item.id} • {item.mode}</Text>
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
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#01559d" />
          </View>
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(it) => it.id}
            renderItem={renderPayment}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#999' }}>No payments found.</Text>
              </View>
            )}
          />
        )}
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
                  <Pressable key={inv.id} style={styles.selectItem} onPress={() => {
                    setForm(f => ({ ...f, invoiceId: inv.id, customerId: inv.customer_id || f.customerId, amount: f.amount || '' }));
                    setShowInvoiceList(false);
                  }}>
                    <Text style={styles.selectItemText}>{inv.invoice_number || inv.id}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={styles.label}>Customer (optional)</Text>
            <TouchableOpacity style={styles.select} onPress={() => setShowCustomerList((s) => !s)}>
              <Text style={styles.selectText}>{customers.find((c) => c.id === form.customerId)?.name || 'Select Customer'}</Text>
            </TouchableOpacity>
            {showCustomerList && (
              <View style={styles.selectList}>
                {customers.map((customer) => (
                  <Pressable
                    key={customer.id}
                    style={styles.selectItem}
                    onPress={() => {
                      setForm((f) => ({ ...f, customerId: customer.id }));
                      setShowCustomerList(false);
                    }}
                  >
                    <Text style={styles.selectItemText}>{customer.name}</Text>
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

            <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}><Text style={styles.saveText}>Add Payment</Text></TouchableOpacity>
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
  createBtn: { backgroundColor: '#01559d', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  body: { padding: 16, alignSelf: 'center', width: '100%', maxWidth: 900 },
  label: { fontSize: 13, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#FFFFFF', borderColor: '#01559d' },
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
  saveBtn: { backgroundColor: '#01559d', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
