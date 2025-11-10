import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { listInvoices, nextInvoiceNumber, createInvoice, addInvoiceItem } from '../lib/invoices';
import { getCustomers } from '../lib/customers';
import { listProducts } from '../lib/products';

export default function InvoiceScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customerId: '', date: '', status: 'Draft', notes: '' });
  const [lineItems, setLineItems] = useState([{ productId: '', description: '', quantity: '1', unitPrice: '', lineTotal: '' }]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showProductListIndex, setShowProductListIndex] = useState(null);
  const statusOptions = ['Draft', 'Sent', 'Paid', 'Overdue'];

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const [invoiceRows, customerResult] = await Promise.all([listInvoices(), getCustomers()]);
      if (customerResult.error) {
        throw customerResult.error;
      }
      const customerMap = new Map((customerResult.data || []).map((c) => [c.id, c]));
      const formatted = invoiceRows.map((inv) => {
        const customer = customerMap.get(inv.customer_id);
        const totalPaid = (inv.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          customerName: customer?.name || 'Unknown',
          amountDue: (inv.invoice_items || []).reduce((sum, item) => sum + Number(item.line_total || 0), 0),
          amountPaid: totalPaid,
          date: inv.issue_date,
          status: inv.status,
        };
      });
      setInvoices(formatted);
      setCustomers(customerResult.data || []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  const prepareNewInvoice = useCallback(async () => {
    try {
      setInvoiceNumber(await nextInvoiceNumber());
    } catch (error) {
      setInvoiceNumber('INV-0001');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadInvoices();
      try {
        setProducts(await listProducts());
      } catch (error) {
        // Products optional
      }
    })();
  }, [loadInvoices]);

  const onOpenForm = async () => {
    await prepareNewInvoice();
    setForm({ customerId: '', date: '', status: 'Draft', notes: '' });
    setLineItems([{ productId: '', description: '', quantity: '1', unitPrice: '', lineTotal: '' }]);
    setShowForm(true);
  };

  const computeLineTotal = (quantity, unitPrice, fallback) => {
    const qty = Number.parseFloat(quantity || '0');
    const price = Number.parseFloat(unitPrice || '0');
    if (Number.isFinite(qty) && Number.isFinite(price)) {
      return (qty * price).toFixed(2);
    }
    return fallback ?? '';
  };

  const updateLineItem = (index, patch) => {
    setLineItems((prev) => {
      const next = [...prev];
      const current = { ...next[index], ...patch };
      if ('quantity' in patch || 'unitPrice' in patch) {
        current.lineTotal = computeLineTotal(current.quantity, current.unitPrice, current.lineTotal);
      }
      next[index] = current;
      return next;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { productId: '', description: '', quantity: '1', unitPrice: '', lineTotal: '' }]);
  };

  const removeLineItem = (index) => {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const validateLineItems = () => {
    const hasValid = lineItems.some((item) => {
      const total = Number.parseFloat(item.lineTotal || item.unitPrice || '0');
      return (item.description || item.productId) && Number.isFinite(total) && total > 0;
    });
    if (!hasValid) {
      Alert.alert('Line items', 'Add at least one line item with amount.');
      return false;
    }
    return true;
  };

  const aggregateTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + Number.parseFloat(item.lineTotal || 0), 0).toFixed(2);
  }, [lineItems]);

  const handleSelectCustomer = (id) => {
    setForm((prev) => ({ ...prev, customerId: id }));
    setShowCustomerList(false);
  };

  const handleSelectProduct = (index, productId) => {
    const product = products.find((p) => p.id === productId);
    updateLineItem(index, {
      productId,
      description: product?.name ?? '',
      unitPrice: product?.price ? String(product.price) : '',
    });
    setShowProductListIndex(null);
  };

  const validLineItems = useMemo(() => {
    return lineItems
      .map((item) => {
        const quantity = Number.parseFloat(item.quantity || '0');
        const unitPrice = Number.parseFloat(item.unitPrice || '0');
        const lineTotal = Number.parseFloat(item.lineTotal || String(quantity * unitPrice));
        if (!Number.isFinite(lineTotal) || lineTotal <= 0) {
          return null;
        }
        return {
          productId: item.productId || null,
          description: item.description || products.find((p) => p.id === item.productId)?.name || 'Item',
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          unit: 'qty',
          unitPrice: Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : lineTotal,
          lineTotal,
        };
      })
      .filter(Boolean);
  }, [lineItems, products]);

  const handleCreateInvoice = () => {
    if (!form.customerId) {
      Alert.alert('Missing Customer', 'Please select a customer.');
      return;
    }
    if (!validateLineItems()) return;
    (async () => {
      try {
        setCreating(true);
        const invoicePayload = {
          invoiceNumber,
          customerId: form.customerId,
          issueDate: form.date || new Date().toISOString().slice(0, 10),
          status: form.status,
          notes: form.notes,
        };
        const invoice = await createInvoice(invoicePayload);
        if (validLineItems.length) {
          await Promise.all(
            validLineItems.map((item) =>
              addInvoiceItem(invoice.id, {
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
              })
            )
          );
        }
        await loadInvoices();
        setShowForm(false);
        setForm({ customerId: '', date: '', status: 'Draft', notes: '' });
        setLineItems([{ productId: '', description: '', quantity: '1', unitPrice: '', lineTotal: '' }]);
      } catch (error) {
        Alert.alert('Create invoice failed', error.message || 'Unable to create invoice.');
      } finally {
        setCreating(false);
      }
    })();
  };

  const renderInvoice = ({ item }) => (
    <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.invoiceNumber || item.id}</Text>
        <Text style={styles.cardSub}>{item.customerName} • {item.status}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>₹{Number(item.amountDue || 0).toFixed(2)}</Text>
        <Text style={[styles.cardSub, { color: '#2e7d32' }]}>Paid: ₹{Number(item.amountPaid || 0).toFixed(2)}</Text>
        <Text style={styles.cardSub}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBar title="Invoices" navigation={navigation} />

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.createBtn} onPress={onOpenForm}>
          <Text style={styles.createBtnText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#66BB6A" />
          </View>
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(it) => it.id}
            renderItem={renderInvoice}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={() => (
              <View style={{ marginTop: 32, alignItems: 'center' }}>
                <Text style={{ color: '#777' }}>No invoices yet.</Text>
              </View>
            )}
          />
        )}
      </View>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Invoice</Text>
              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setForm({ customerId: '', date: '', status: 'Draft', notes: '' });
                  setLineItems([{ productId: '', description: '', quantity: '1', unitPrice: '', lineTotal: '' }]);
                }}
              >
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
              <Text style={styles.label}>Invoice Number</Text>
              <TextInput style={[styles.input, { backgroundColor: '#f1f1f1' }]} value={invoiceNumber} editable={false} />

              <Text style={styles.label}>Customer</Text>
              <TouchableOpacity style={styles.select} onPress={() => setShowCustomerList((s) => !s)}>
                <Text style={styles.selectText}>
                  {customers.find((c) => c.id === form.customerId)?.name || 'Select customer'}
                </Text>
              </TouchableOpacity>
              {showCustomerList && (
                <View style={styles.selectList}>
                  {customers.map((customer) => (
                    <Pressable
                      key={customer.id}
                      style={styles.selectItem}
                      onPress={() => handleSelectCustomer(customer.id)}
                    >
                      <Text style={styles.selectItemText}>{customer.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Status</Text>
              <View style={styles.chipsRow}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.chip, form.status === status && styles.chipActive]}
                    onPress={() => setForm((prev) => ({ ...prev, status }))}
                  >
                    <Text style={[styles.chipText, form.status === status && styles.chipTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Issue Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (optional)"
                value={form.date}
                onChangeText={(t) => setForm((prev) => ({ ...prev, date: t }))}
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                multiline
                placeholder="Optional notes"
                value={form.notes}
                onChangeText={(t) => setForm((prev) => ({ ...prev, notes: t }))}
              />

              <View style={styles.lineItemsHeader}>
                <Text style={styles.lineItemsTitle}>Line Items</Text>
                <TouchableOpacity onPress={addLineItem}>
                  <Text style={styles.addLineBtn}>+ Add item</Text>
                </TouchableOpacity>
              </View>

              {lineItems.map((item, index) => (
                <View key={index} style={styles.lineItemCard}>
                  <View style={styles.lineItemHeader}>
                    <Text style={styles.lineItemTitle}>Item {index + 1}</Text>
                    {lineItems.length > 1 && (
                      <Pressable onPress={() => removeLineItem(index)}>
                        <Text style={styles.removeLine}>Remove</Text>
                      </Pressable>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.select}
                    onPress={() => setShowProductListIndex((prev) => (prev === index ? null : index))}
                  >
                    <Text style={styles.selectText}>
                      {item.productId ? products.find((p) => p.id === item.productId)?.name || 'Select product' : 'Select product'}
                    </Text>
                  </TouchableOpacity>
                  {showProductListIndex === index && (
                    <View style={styles.selectList}>
                      {products.map((product) => (
                        <Pressable
                          key={product.id}
                          style={styles.selectItem}
                          onPress={() => handleSelectProduct(index, product.id)}
                        >
                          <Text style={styles.selectItemText}>{product.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={item.description}
                    onChangeText={(t) => updateLineItem(index, { description: t })}
                  />

                  <View style={styles.lineRow}>
                    <TextInput
                      style={[styles.input, styles.lineInput]}
                      placeholder="Qty"
                      keyboardType="numeric"
                      value={item.quantity}
                      onChangeText={(t) => updateLineItem(index, { quantity: t })}
                    />
                    <TextInput
                      style={[styles.input, styles.lineInput]}
                      placeholder="Unit Price"
                      keyboardType="numeric"
                      value={item.unitPrice}
                      onChangeText={(t) => updateLineItem(index, { unitPrice: t })}
                    />
                    <TextInput
                      style={[styles.input, styles.lineInput]}
                      placeholder="Line Total"
                      keyboardType="numeric"
                      value={item.lineTotal}
                      onChangeText={(t) => updateLineItem(index, { lineTotal: t })}
                    />
                  </View>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{aggregateTotal}</Text>
              </View>

              <TouchableOpacity style={[styles.saveBtn, creating && { opacity: 0.6 }]} onPress={handleCreateInvoice} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Add Invoice</Text>}
              </TouchableOpacity>
            </ScrollView>
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
  select: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: '#fff' },
  selectText: { color: '#333', fontWeight: '600' },
  selectList: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, marginTop: 6, backgroundColor: '#fff', maxHeight: 200 },
  selectItem: { paddingVertical: 10, paddingHorizontal: 12 },
  selectItemText: { color: '#333' },
  lineItemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  lineItemsTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  addLineBtn: { color: '#1976D2', fontWeight: '700' },
  lineItemCard: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, padding: 12, marginTop: 12, backgroundColor: '#fff' },
  lineItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lineItemTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  removeLine: { color: '#C62828', fontWeight: '700' },
  lineRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  lineInput: { flex: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#2e7d32' },
});
