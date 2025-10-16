import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DeliveryBoyScreen() {
  const [query, setQuery] = useState('');
  const [deliveryBoys, setDeliveryBoys] = useState([
    { id: '1', name: 'Suresh', phone: '9876100001', area: 'Ganapathy', customers: ['1'] },
    { id: '2', name: 'Mahesh', phone: '9876100002', area: 'RS Puram', customers: [] },
  ]);

  // For demo assignment, a local customer master list (IDs should match MyCustomerScreen seed where possible)
  const customerMaster = [
    { id: '1', name: 'Ravi Kumar' },
    { id: '2', name: 'Anita Sharma' },
    { id: '3', name: 'Karthik' },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', area: '' });
  const [assignState, setAssignState] = useState({ targetId: null, selected: {} });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return deliveryBoys.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.area.toLowerCase().includes(q)
    );
  }, [deliveryBoys, query]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', area: '' });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, phone: item.phone, area: item.area });
    setModalVisible(true);
  };

  const saveForm = () => {
    const { name, phone, area } = form;
    if (!name.trim() || !phone.trim() || !area.trim()) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    if (editingId) {
      setDeliveryBoys((prev) => prev.map((d) => (d.id === editingId ? { ...d, name, phone, area } : d)));
    } else {
      const newId = (Math.max(0, ...deliveryBoys.map((d) => parseInt(d.id, 10))) + 1).toString();
      setDeliveryBoys((prev) => [...prev, { id: newId, name, phone, area, customers: [] }]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Delivery Boy', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setDeliveryBoys((prev) => prev.filter((d) => d.id !== id)) },
    ]);
  };

  const openAssign = (item) => {
    const selected = {};
    (item.customers || []).forEach((cid) => (selected[cid] = true));
    setAssignState({ targetId: item.id, selected });
    setAssignVisible(true);
  };

  const toggleAssign = (cid) => {
    setAssignState((s) => ({ ...s, selected: { ...s.selected, [cid]: !s.selected[cid] } }));
  };

  const saveAssign = () => {
    const assigned = Object.keys(assignState.selected).filter((cid) => assignState.selected[cid]);
    setDeliveryBoys((prev) => prev.map((d) => (d.id === assignState.targetId ? { ...d, customers: assigned } : d)));
    setAssignVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>📞 {item.phone}</Text>
        <Text style={styles.sub}>🗺️ {item.area}</Text>
        <Text style={styles.subSmall}>Assigned customers: {item.customers?.length || 0}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actBtn, { backgroundColor: '#E3F2FD' }]} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={18} color="#1976D2" />
          <Text style={[styles.actText, { color: '#1976D2' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actBtn, { backgroundColor: '#FFF3E0' }]} onPress={() => openAssign(item)}>
          <Ionicons name="people-outline" size={18} color="#EF6C00" />
          <Text style={[styles.actText, { color: '#EF6C00' }]}>Assign</Text>
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
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={48} color="#bbb" />
            <Text style={styles.emptyText}>No delivery boys found</Text>
          </View>
        )}
      />

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

      {/* Assign Customers Modal */}
      <Modal visible={assignVisible} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Assign Customers</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {customerMaster.map((c) => {
                const checked = !!assignState.selected[c.id];
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.assignRow}
                    onPress={() => toggleAssign(c.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={checked ? '#2e7d32' : '#777'}
                    />
                    <Text style={styles.assignText}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setAssignVisible(false)}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveAssign}>
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
    paddingHorizontal: 12,
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
    backgroundColor: '#66BB6A',
  },
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  assignText: {
    fontSize: 14,
    color: '#333',
  },
});
