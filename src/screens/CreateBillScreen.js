import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Linking } from 'react-native';
import { getCustomers } from '../lib/customers';
import { listCustomerDeliveriesRange } from '../lib/dailyDeliveries';
import { nextInvoiceNumber, createInvoice, addInvoiceItem } from '../lib/invoices';
import { supabase } from '../lib/supabase';

function toYMD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

export default function CreateBillScreen() {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0); // last day of current month
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [perDayL, setPerDayL] = useState('');
  const [amount, setAmount] = useState('');

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyRows, setHistoryRows] = useState([]);
  const [historyTotalL, setHistoryTotalL] = useState('0.00');
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  const daysCount = useMemo(() => {
    const a = new Date(fromDate.setHours(0,0,0,0));
    const b = new Date(toDate.setHours(0,0,0,0));
    const diff = Math.floor((b - a) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 0; // inclusive range
  }, [fromDate, toDate]);

  const estimatedTotalMilkL = useMemo(() => {
    const per = parseFloat(perDayL || '0');
    return Number.isFinite(per) ? (per * daysCount).toFixed(2) : '0.00';
  }, [perDayL, daysCount]);

  const onPickCustomer = (c) => {
    setSelectedCustomer(c);
    setPerDayL(String(c.planPerDayL ?? ''));
    setCustomerPickerVisible(false);
  };

  const onCreateInvoice = async () => {
    if (!selectedCustomer) {
      Alert.alert('Select Customer', 'Please select a customer first.');
      return;
    }
    if (!historyRows.length) {
      Alert.alert('No history', 'No deliveries found for the selected range.');
      return;
    }
    const amountNum = parseFloat(amount || '0');
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      Alert.alert('Amount required', 'Enter a valid invoice amount.');
      return;
    }
    try {
      setCreatingInvoice(true);
      const monthBase = new Date(toDate);
      const monthStartDate = new Date(monthBase.getFullYear(), monthBase.getMonth(), 1);
      const monthEndDate = new Date(monthBase.getFullYear(), monthBase.getMonth() + 1, 0);
      const monthStart = toYMD(monthStartDate);
      const monthEnd = toYMD(monthEndDate);

      const { data: existing, error: existingError } = await supabase
        .from('invoices')
        .select('id')
        .eq('customer_id', selectedCustomer.id)
        .gte('issue_date', monthStart)
        .lte('issue_date', monthEnd)
        .limit(1)
        .maybeSingle();
      if (existingError) {
        throw existingError;
      }
      if (existing) {
        Alert.alert('Invoice exists', 'A monthly invoice already exists for this customer and month.');
        return;
      }

      const invoiceNumber = await nextInvoiceNumber();
      const issueDate = monthEnd;
      const notes = `Milk deliveries from ${monthStart} to ${monthEnd}`;
      const invoice = await createInvoice({
        invoiceNumber,
        customerId: selectedCustomer.id,
        issueDate,
        status: 'Draft',
        notes,
      });
      await addInvoiceItem(invoice.id, {
        description: `Milk delivery (${monthStart} to ${monthEnd})`,
        quantity: 1,
        unit: 'Total',
        unitPrice: amountNum,
        lineTotal: amountNum,
        productId: null,
      });
      const totalL = historyRows.length > 0 ? historyTotalL : estimatedTotalMilkL;
      setLastInvoice({
        id: invoice.id,
        invoiceNumber,
        amount: amountNum,
        from: monthStart,
        to: monthEnd,
        totalL,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
      });
      Alert.alert('Invoice created', `Invoice ${invoiceNumber} created for ${selectedCustomer.name}.`);
    } catch (e) {
      Alert.alert('Create invoice failed', e.message || 'Unable to create invoice.');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const onGeneratePdf = () => {
    if (!lastInvoice) {
      Alert.alert('Create Invoice', 'Please create an invoice first.');
      return;
    }
    const summary = [
      `Invoice: ${lastInvoice.invoiceNumber}`,
      `Customer: ${lastInvoice.customerName} (${lastInvoice.customerPhone || ''})`,
      `Period: ${lastInvoice.from} to ${lastInvoice.to}`,
      `Total Milk: ${lastInvoice.totalL} L`,
      `Amount: ₹${lastInvoice.amount.toFixed ? lastInvoice.amount.toFixed(2) : lastInvoice.amount}`,
    ].join('\n');
    Alert.alert('Invoice summary', summary);
  };

  const onSendWhatsApp = () => {
    if (!lastInvoice) {
      Alert.alert('Create Invoice', 'Please create an invoice first.');
      return;
    }
    const reminder = `Bill / Invoice ${lastInvoice.invoiceNumber} is created and sent to you in the app Transaction page.\nPlease check and pay this month bill and any due amount. Thank you.`;
    const phone = (lastInvoice.customerPhone || '').replace(/\D+/g, '');
    const url = phone
      ? `whatsapp://send?phone=${phone}&text=${encodeURIComponent(reminder)}`
      : `whatsapp://send?text=${encodeURIComponent(reminder)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp not available', 'Could not open WhatsApp. Please ensure it is installed.');
    });
  };

  const onSendInvoiceShare = () => {
    (async () => {
      try {
        let invoiceToSend = lastInvoice;

        if (!invoiceToSend) {
          if (!selectedCustomer) {
            Alert.alert('Select Customer', 'Please select a customer first.');
            return;
          }

          const monthBase = new Date(toDate);
          const monthStartDate = new Date(monthBase.getFullYear(), monthBase.getMonth(), 1);
          const monthEndDate = new Date(monthBase.getFullYear(), monthBase.getMonth() + 1, 0);
          const monthStart = toYMD(monthStartDate);
          const monthEnd = toYMD(monthEndDate);

          const { data: existing, error: existingError } = await supabase
            .from('invoices')
            .select('id, invoice_number')
            .eq('customer_id', selectedCustomer.id)
            .gte('issue_date', monthStart)
            .lte('issue_date', monthEnd)
            .order('issue_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingError) {
            throw existingError;
          }

          if (!existing) {
            Alert.alert('Create Invoice', 'Please create an invoice first.');
            return;
          }

          invoiceToSend = {
            id: existing.id,
            invoiceNumber: existing.invoice_number,
          };
          setLastInvoice((prev) => prev || invoiceToSend);
        }

        const { error } = await supabase
          .from('invoices')
          .update({ status: 'Issued' })
          .eq('id', invoiceToSend.id);
        if (error) throw error;
        Alert.alert(
          'Invoice sent',
          'Invoice is now available in the customer app Payment screen for this month.',
        );
      } catch (e) {
        Alert.alert('Send failed', e.message || 'Unable to mark invoice as sent.');
      }
    })();
  };

  const decFrom = () => setFromDate((d) => addDays(d, -1));
  const incFrom = () => setFromDate((d) => addDays(d, 1));
  const decTo = () => setToDate((d) => addDays(d, -1));
  const incTo = () => setToDate((d) => addDays(d, 1));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCustomers(true);
        setCustomerError('');
        const { data, error } = await getCustomers();
        if (error) throw error;
        const mapped = (data || []).map((c) => {
          // Try to derive perDay liters from c.plan if available (e.g., "1L/day").
          let planPerDayL = undefined;
          if (typeof c.plan === 'string') {
            const m = c.plan.match(/([0-9]+(?:\.[0-9]+)?)\s*[lL]/);
            if (m) planPerDayL = parseFloat(m[1]);
          }
          return {
            id: c.id,
            name: c.name,
            phone: c.phone || '',
            planPerDayL,
          };
        });
        if (!mounted) return;
        setCustomers(mapped);
        // Optionally pre-select the first customer
        if (mapped.length) {
          setSelectedCustomer(mapped[0]);
          setPerDayL(String(mapped[0].planPerDayL ?? ''));
        }
      } catch (e) {
        if (!mounted) return;
        setCustomerError(e.message || 'Failed to load customers');
      } finally {
        if (mounted) setLoadingCustomers(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      setHistoryRows([]);
      setHistoryTotalL('0.00');
      setHistoryError('');
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setHistoryLoading(true);
        setHistoryError('');
        const from = toYMD(new Date(fromDate));
        const to = toYMD(new Date(toDate));
        const rows = await listCustomerDeliveriesRange({
          customerId: selectedCustomer.id,
          from,
          to,
        });
        if (!mounted) return;
        setHistoryRows(rows);
        const totalQty = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
        setHistoryTotalL(totalQty.toFixed(2));
      } catch (e) {
        if (!mounted) return;
        setHistoryRows([]);
        setHistoryTotalL('0.00');
        setHistoryError(e.message || 'Failed to load delivery history');
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedCustomer, fromDate, toDate]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Bill</Text>
      </View>

      <View style={styles.body}>
        {/* Select Customer */}
        <Text style={styles.label}>Select Customer</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setCustomerPickerVisible(true)} disabled={loadingCustomers}>
          <Ionicons name="person" size={18} color="#666" />
          {loadingCustomers ? (
            <Text style={styles.selectText}>Loading customers...</Text>
          ) : selectedCustomer ? (
            <Text style={styles.selectText}>{selectedCustomer.name} ({selectedCustomer.phone})</Text>
          ) : (
            <Text style={styles.selectText}>Select customer</Text>
          )}
          <Ionicons name="chevron-down" size={18} color="#666" />
        </TouchableOpacity>
        {!!customerError && (
          <Text style={{ color: '#c62828', marginTop: 4 }}>{customerError}</Text>
        )}

        {/* From Date / To Date */}
        <Text style={[styles.label, { marginTop: 14 }]}>From Date / To Date</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.smallLabel}>From</Text>
            <View style={styles.dateControls}>
              <TouchableOpacity style={styles.dateBtn} onPress={decFrom}>
                <Ionicons name="chevron-back" size={18} color="#01559d" />
              </TouchableOpacity>
              <Text style={styles.dateText}>{toYMD(new Date(fromDate))}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={incFrom}>
                <Ionicons name="chevron-forward" size={18} color="#01559d" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.smallLabel}>To</Text>
            <View style={styles.dateControls}>
              <TouchableOpacity style={styles.dateBtn} onPress={decTo}>
                <Ionicons name="chevron-back" size={18} color="#01559d" />
              </TouchableOpacity>
              <Text style={styles.dateText}>{toYMD(new Date(toDate))}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={incTo}>
                <Ionicons name="chevron-forward" size={18} color="#01559d" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Per Day and Total Milk */}
        <View style={styles.inlineRow}>
          <View style={[styles.flexItem, { marginRight: 8 }]}> 
            <Text style={styles.label}>Per Day (L)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={perDayL}
              onChangeText={setPerDayL}
              placeholder="e.g., 1.0"
            />
          </View>
          <View style={[styles.flexItem, { marginLeft: 8 }]}> 
            <Text style={styles.label}>Total Milk (L)</Text>
            <View style={[styles.input, { justifyContent: 'center' }]}> 
              {historyLoading ? (
                <Text style={{ fontWeight: '700', color: '#01559d' }}>Loading...</Text>
              ) : historyRows.length > 0 ? (
                <Text style={{ fontWeight: '700', color: '#01559d' }}>{historyTotalL} (from history)</Text>
              ) : (
                <Text style={{ fontWeight: '700', color: '#01559d' }}>{estimatedTotalMilkL}</Text>
              )}
            </View>
          </View>
        </View>

        {!!historyError && (
          <Text style={{ color: '#c62828', marginTop: 4 }}>{historyError}</Text>
        )}

        {/* Amount */}
        <Text style={[styles.label, { marginTop: 6 }]}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
        />

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.pdfBtn]} onPress={onCreateInvoice} disabled={creatingInvoice}>
            {creatingInvoice ? (
              <ActivityIndicator size="small" color="#01559d" />
            ) : (
              <Ionicons name="receipt-outline" size={18} color="#01559d" />
            )}
            <Text style={[styles.actionText, { color: '#01559d' }]}>Create Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.pdfBtn]} onPress={onSendInvoiceShare}>
            <Ionicons name="send-outline" size={18} color="#01559d" />
            <Text style={[styles.actionText, { color: '#01559d' }]}>Send Invoice</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.actions, { marginTop: 8 }]}>
          <TouchableOpacity style={[styles.actionBtn, styles.pdfBtn]} onPress={onGeneratePdf}>
            <Ionicons name="document-outline" size={18} color="#01559d" />
            <Text style={[styles.actionText, { color: '#01559d' }]}>Preview Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.whatsBtn]} onPress={onSendWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Send WhatsApp Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Picker Modal */}
      <Modal visible={customerPickerVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            {loadingCustomers ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color="#01559d" />
              </View>
            ) : (
              customers.map((c) => (
                <TouchableOpacity key={c.id} style={styles.modalItem} onPress={() => onPickCustomer(c)}>
                  <Ionicons name="person-circle-outline" size={22} color="#01559d" />
                  <Text style={styles.modalItemText}>{c.name} ({c.phone})</Text>
                </TouchableOpacity>
              ))
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setCustomerPickerVisible(false)}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#01559d',
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
  body: {
    padding: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 900,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  smallLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 12,
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontWeight: '700',
    color: '#333',
  },
  inlineRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  flexItem: {
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  pdfBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#01559d',
    flex: 1,
  },
  whatsBtn: {
    backgroundColor: '#25D366',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  modalItemText: {
    color: '#333',
    fontWeight: '600',
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#f1f1f1',
  },
});
