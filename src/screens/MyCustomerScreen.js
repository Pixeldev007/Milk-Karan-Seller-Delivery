import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../lib/customers';

// Layout constants (module scope) so StyleSheet can reference them
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH_WEB = 280;
const PAGE_GUTTER = 16;
const CONTENT_WIDTH_WEB = Math.max(360, WINDOW_WIDTH - DRAWER_WIDTH_WEB - PAGE_GUTTER * 2);
const MODAL_MAX_WIDTH = 720; // cap modal width on large screens

export default function MyCustomerScreen() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', plan: '', planType: 'Daily', preferredShift: 'morning' });

  // Load customers from Supabase on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const { data, error } = await getCustomers();
    if (error) {
      Alert.alert('Error', 'Failed to load customers: ' + error.message);
      setCustomers([]);
    } else {
      // Map database fields to component format
      const mappedCustomers = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        address: c.address,
        plan: c.plan,
        planType: c.plan_type || 'Daily',
        preferredShift: c.preferred_shift || 'morning',
      }));
      setCustomers(mappedCustomers);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.plan.toLowerCase().includes(q) ||
        (c.planType || '').toLowerCase().includes(q)
    );
  }, [customers, query]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', address: '', plan: '', planType: 'Daily', preferredShift: 'morning' });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, phone: item.phone, address: item.address, plan: item.plan, planType: item.planType || 'Daily', preferredShift: item.preferredShift || 'morning' });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Customer', 'Are you sure you want to delete this customer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteCustomer(id);
          if (error) {
            Alert.alert('Error', 'Failed to delete customer: ' + error.message);
          } else {
            // Remove from local state
            setCustomers((prev) => prev.filter((c) => c.id !== id));
          }
        },
      },
    ]);
  };

  const saveForm = async () => {
    const { name, phone, address, plan, planType, preferredShift } = form;
    if (!name.trim() || !phone.trim() || !address.trim() || !plan.trim()) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing customer
        const { data, error } = await updateCustomer(editingId, {
          name,
          phone,
          address,
          plan,
          planType,
          preferredShift,
        });
        if (error) {
          Alert.alert('Error', 'Failed to update customer: ' + error.message);
        } else {
          // Update local state
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === editingId
                ? {
                    id: data.id,
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                    plan: data.plan,
                    planType: data.plan_type || 'Daily',
                    preferredShift: data.preferred_shift || 'morning',
                  }
                : c
            )
          );
          setModalVisible(false);
        }
      } else {
        // Add new customer
        const { data, error } = await addCustomer({
          name,
          phone,
          address,
          plan,
          planType,
          preferredShift,
        });
        if (error) {
          Alert.alert('Error', 'Failed to add customer: ' + error.message);
        } else {
          // Add to local state
          setCustomers((prev) => [
            {
              id: data.id,
              name: data.name,
              phone: data.phone,
              address: data.address,
              plan: data.plan,
              planType: data.plan_type || 'Daily',
              preferredShift: data.preferred_shift || 'morning',
            },
            ...prev,
          ]);
          setModalVisible(false);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>📞 {item.phone}</Text>
        <Text style={styles.sub}>📍 {item.address}</Text>
        <Text style={styles.plan}>Plan: {item.plan} • {item.planType || 'Daily'}</Text>
        <Text style={styles.sub}>Shift: {item.preferredShift === 'evening' ? 'Evening' : 'Morning'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actBtn, { backgroundColor: '#E3F2FD' }]} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={18} color="#1976D2" />
          <Text style={[styles.actText, { color: '#1976D2' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actBtn, { backgroundColor: '#FFEBEE' }]} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#D32F2F" />
          <Text style={[styles.actText, { color: '#D32F2F' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Customers</Text>
      </View>

      {/* Search + Add */}
      <ScreenContainer>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, address or plan"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.addText}>Add New Customer</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#66BB6A" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#bbb" />
              <Text style={styles.emptyText}>No customers found</Text>
            </View>
          )}
        />
      )}
      </ScreenContainer>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Customer' : 'Add Customer'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={form.name}
              onChangeText={(t) => setForm((s) => ({ ...s, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(t) => setForm((s) => ({ ...s, phone: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={form.address}
              onChangeText={(t) => setForm((s) => ({ ...s, address: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Milk Plan (e.g., 1L/day)"
              value={form.plan}
              onChangeText={(t) => setForm((s) => ({ ...s, plan: t }))}
            />

            {/* Plan Type Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Plan Type</Text>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.planType === 'Daily' && styles.toggleBtnActive]}
                  onPress={() => setForm((s) => ({ ...s, planType: 'Daily' }))}
                >
                  <Text style={[styles.toggleText, form.planType === 'Daily' && styles.toggleTextActive]}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.planType === 'Seasonal' && styles.toggleBtnActive]}
                  onPress={() => setForm((s) => ({ ...s, planType: 'Seasonal' }))}
                >
                  <Text style={[styles.toggleText, form.planType === 'Seasonal' && styles.toggleTextActive]}>Seasonal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preferred Shift Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Preferred Shift</Text>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.preferredShift === 'morning' && styles.toggleBtnActive]}
                  onPress={() => setForm((s) => ({ ...s, preferredShift: 'morning' }))}
                >
                  <Text style={[styles.toggleText, form.preferredShift === 'morning' && styles.toggleTextActive]}>Morning</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.preferredShift === 'evening' && styles.toggleBtnActive]}
                  onPress={() => setForm((s) => ({ ...s, preferredShift: 'evening' }))}
                >
                  <Text style={[styles.toggleText, form.preferredShift === 'evening' && styles.toggleTextActive]}>Evening</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, saving && styles.modalBtnDisabled]}
                onPress={saveForm}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>{editingId ? 'Save' : 'Add'}</Text>
                )}
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#66BB6A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
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
    gap: 12,
  },
  rowMain: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  plan: {
    marginTop: 6,
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '700',
  },
  actions: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  actBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actText: {
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  modalBtnDisabled: {
    opacity: 0.6,
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
    alignSelf: Platform.select({ web: 'center', default: 'center' }),
    // On web, keep the modal within the page content width and center it
    width: Platform.select({ web: Math.min(CONTENT_WIDTH_WEB, MODAL_MAX_WIDTH), default: undefined }),
    marginRight: Platform.select({ web: PAGE_GUTTER, default: 0 }),
    marginLeft: Platform.select({ web: PAGE_GUTTER, default: PAGE_GUTTER }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  toggleRow: {
    marginTop: 10,
  },
  toggleLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  toggleBtnActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#66BB6A',
  },
  toggleText: {
    color: '#555',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#2e7d32',
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#f1f1f1',
  },
  saveBtn: {
    backgroundColor: '#66BB6A',
  },
  modalBtnText: {
    fontWeight: '700',
  },
});
