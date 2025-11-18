import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { listDeliveryAgents, saveDeliveryAgent, deleteDeliveryAgent, replaceAssignments, listAssignments } from '../lib/delivery';
import { getCustomers } from '../lib/customers';

// Layout constants for web modal sizing
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH_WEB = 280;
const PAGE_GUTTER = 16;
const CONTENT_WIDTH_WEB = Math.max(360, WINDOW_WIDTH - DRAWER_WIDTH_WEB - PAGE_GUTTER * 2);
const MODAL_MAX_WIDTH = 640; // smaller modal width on large screens

export default function DeliveryBoyScreen() {
  const [query, setQuery] = useState('');
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [customerMaster, setCustomerMaster] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', area: '' });
  const [assignSelection, setAssignSelection] = useState({});
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return deliveryBoys.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.area.toLowerCase().includes(q)
        || (d.loginId ?? '').toLowerCase().includes(q)
    );
  }, [deliveryBoys, query]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [agents, customersResult] = await Promise.all([listDeliveryAgents(), getCustomers()]);
      if (customersResult.error) {
        throw customersResult.error;
      }
      const customerRecords = customersResult.data || [];
      const customerList = customerRecords.map((c) => ({ id: c.id, name: c.name }));

      const agentsWithAssignments = await Promise.all(
        agents.map(async (agent) => {
          const assignments = await listAssignments(agent.id);
          return {
            id: agent.id,
            name: agent.name,
            phone: agent.phone,
            area: agent.area ?? '',
            loginId: agent.login_id ?? agent.phone ?? '',
            customers: assignments.map((a) => a.customer_id),
          };
        })
      );

      agentsWithAssignments.sort((a, b) => a.name.localeCompare(b.name));
      setDeliveryBoys(agentsWithAssignments);
      setCustomerMaster(customerList);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load delivery agents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', area: '' });
    setAssignSelection({});
    setShowCustomerDropdown(false);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    const selected = {};
    (item.customers || []).forEach((cid) => (selected[cid] = true));
    setEditingId(item.id);
    setForm({
      name: item.name,
      phone: item.phone,
      area: item.area,
    });
    setAssignSelection(selected);
    setShowCustomerDropdown(false);
    setModalVisible(true);
  };

  const saveForm = () => {
    const { name, phone, area } = form;
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Please fill name and phone.');
      return;
    }
    const loginId = phone.trim();
    const selectedCustomerIds = Object.keys(assignSelection).filter((cid) => assignSelection[cid]);
    (async () => {
      try {
        const agent = await saveDeliveryAgent({ id: editingId, name, phone, area, loginId });
        await replaceAssignments(agent.id, selectedCustomerIds);
        setModalVisible(false);
        setForm({ name: '', phone: '', area: '' });
        setAssignSelection({});
        await loadData();
      } catch (error) {
        Alert.alert('Save failed', error.message || 'Unable to save delivery agent.');
      }
    })();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Delivery Boy', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDeliveryAgent(id);
            await loadData();
          } catch (error) {
            Alert.alert('Delete failed', error.message || 'Unable to delete delivery agent.');
          }
        } },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>📞 {item.phone}</Text>
        <Text style={styles.sub}>🗺️ {item.area}</Text>
        {!!item.loginId && <Text style={styles.sub}>🆔 User ID: {item.loginId}</Text>}
        <Text style={styles.subSmall}>
          Assigned customers: {item.customers?.length || 0}
          {item.customers?.length
            ? ` • ${item.customers
                .map((cid) => customerMaster.find((c) => c.id === cid)?.name)
                .filter(Boolean)
                .slice(0, 2)
                .join(', ')}${item.customers.length > 2 ? '…' : ''}`
            : ''}
        </Text>
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
        <Text style={styles.headerTitle}>Delivery Boy</Text>
      </View>

      {/* Toolbar */}
      <ScreenContainer>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or area"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.addText}>Add Delivery Boy</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          loading ? (
            <View style={styles.empty}>
              <ActivityIndicator size="small" color="#01559d" />
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={48} color="#bbb" />
              <Text style={styles.emptyText}>No delivery boys found</Text>
            </View>
          )
        )}
      />
      </ScreenContainer>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Delivery Boy' : 'Add Delivery Boy'}</Text>

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
              placeholder="Assigned Area"
              value={form.area}
              onChangeText={(t) => setForm((s) => ({ ...s, area: t }))}
            />
            <Text style={styles.label}>Assigned customers</Text>

            <TouchableOpacity
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => setShowCustomerDropdown((prev) => !prev)}
            >
              <Text style={{ color: '#333' }}>
                {Object.keys(assignSelection).some((cid) => assignSelection[cid])
                  ? `${Object.keys(assignSelection).filter((cid) => assignSelection[cid]).length} customer(s) selected`
                  : 'Assign customers'}
              </Text>
              <Ionicons name={showCustomerDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
            </TouchableOpacity>
            {showCustomerDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {customerMaster.map((customer) => {
                    const checked = !!assignSelection[customer.id];
                    return (
                      <TouchableOpacity
                        key={customer.id}
                        style={styles.dropdownRow}
                        onPress={() =>
                          setAssignSelection((prev) => ({
                            ...prev,
                            [customer.id]: !prev[customer.id],
                          }))
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={checked ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={checked ? '#01559d' : '#777'}
                        />
                        <Text style={styles.dropdownText}>{customer.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveForm}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{editingId ? 'Save' : 'Add'}</Text>
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
    minWidth: 0, // allow flex to shrink on web so text stays inside the box
    fontSize: 14,
    color: '#333',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#01559d',
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
  subSmall: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
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
    width: Platform.select({ web: Math.min(CONTENT_WIDTH_WEB, MODAL_MAX_WIDTH), default: undefined }),
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
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#f1f1f1',
  },
  saveBtn: {
    backgroundColor: '#01559d',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
});
