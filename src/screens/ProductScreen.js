import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Platform, Alert, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import HeaderBar from '../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';
import { listProducts, createProduct, updateProduct, removeProduct } from '../lib/products';

// Layout constants for web modal sizing
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH_WEB = 280;
const PAGE_GUTTER = 16;
const CONTENT_WIDTH_WEB = Math.max(360, WINDOW_WIDTH - DRAWER_WIDTH_WEB - PAGE_GUTTER * 2);
const MODAL_MAX_WIDTH = 640; // smaller modal width on large screens

export default function ProductScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', unit: '', price: '' });
  const [connState, setConnState] = useState({ checked: false, ok: false, msg: '' });
  const [loading, setLoading] = useState(false);

  const milkVarieties = [
    { name: 'Buffalo Milk', unit: 'Litre', price: 0 },
    { name: 'Cow Milk', unit: 'Litre', price: 0 },
    { name: 'Goat Milk', unit: 'Litre', price: 0 },
    { name: 'Donkey Milk', unit: 'Litre', price: 0 },
    { name: 'Camel Milk', unit: 'Litre', price: 0 },
  ];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q) || String(p.price).includes(q)
    );
  }, [products, query]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const records = await listProducts();
      const mapped = records.map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        price: Number(p.price) || 0,
      }));
      setProducts(mapped);
      setConnState({ checked: true, ok: true, msg: 'Connected' });
    } catch (e) {
      console.log('[products fetch error]', e?.message);
      setConnState({ checked: true, ok: false, msg: e?.message || 'Unable to load products' });
      Alert.alert('Error', e?.message || 'Failed to fetch products from Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', unit: '', price: '' });
    setModalVisible(true);
  };

  // Supabase connection check (runs once when screen mounts)
  useEffect(() => {
    (async () => {
      try {
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
          setConnState({ checked: true, ok: false, msg: 'Missing EXPO_PUBLIC_SUPABASE_* env vars' });
          return;
        }
        await fetchProducts();
      } catch (e) {
        setConnState({ checked: true, ok: false, msg: e?.message || 'Unknown error' });
      }
    })();
  }, [fetchProducts]);

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, unit: item.unit, price: String(item.price) });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await removeProduct(id);
            await fetchProducts();
          } catch (e) {
            console.log('[delete product error]', e?.message);
          }
        } },
    ]);
  };

  const saveForm = () => {
    const priceNum = Number.parseFloat(form.price);
    if (!form.name.trim() || !form.unit.trim() || !Number.isFinite(priceNum)) {
      Alert.alert('Invalid input', 'Please enter name, unit and numeric price.');
      return;
    }
    (async () => {
      try {
        if (editingId) {
          await updateProduct(editingId, { name: form.name, unit: form.unit, price: priceNum });
        } else {
          await createProduct({ name: form.name, unit: form.unit, price: priceNum });
        }
        setModalVisible(false);
        await fetchProducts();
      } catch (e) {
        Alert.alert('Save failed', e?.message || 'Unknown error');
      }
    })();
  };

  const quickAddVariety = (v) => {
    // Avoid duplicates by case-insensitive name match
    const exists = products.some((p) => p.name.toLowerCase() === v.name.toLowerCase());
    if (exists) return Alert.alert('Already added', `${v.name} is already in your list.`);
    (async () => {
      try {
        await createProduct({ name: v.name, unit: v.unit, price: v.price ?? 0 });
        await fetchProducts();
      } catch (e) {
        Alert.alert('Add failed', e?.message || 'Unknown error');
      }
    })();
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>Unit: {item.unit}</Text>
      </View>
      <Text style={styles.price}>₹ {item.price}</Text>
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
      <HeaderBar title="Products" navigation={navigation} />

      {connState.checked && (
        <View style={[styles.connBanner, { backgroundColor: connState.ok ? '#FFFFFF' : '#FFEBEE', borderColor: connState.ok ? '#A5D6A7' : '#FFCDD2' }]}>
          <Text style={{ color: connState.ok ? '#2E7D32' : '#C62828', fontWeight: '700' }}>
            {connState.ok ? 'Supabase: Connected' : 'Supabase: Not Connected'}
          </Text>
          {!!connState.msg && !connState.ok && (
            <Text style={{ color: '#C62828', marginTop: 4 }} numberOfLines={2}>
              {connState.msg}
            </Text>
          )}
        </View>
      )}

      <ScreenContainer>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#01559d" />
        </View>
      )}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Search products" value={query} onChangeText={setQuery} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.addText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Quick add milk varieties */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.varietyChips}
      >
        {milkVarieties.map((v) => (
          <TouchableOpacity key={v.name} style={styles.chip} onPress={() => quickAddVariety(v)}>
            <Ionicons name="add" size={14} color="#1976D2" />
            <Text style={styles.chipText}>{v.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</Text>

            <TextInput style={styles.input} placeholder="Product Name" value={form.name} onChangeText={(t) => setForm((s) => ({ ...s, name: t }))} />
            <TextInput style={styles.input} placeholder="Unit (e.g., Litre, Kg)" value={form.unit} onChangeText={(t) => setForm((s) => ({ ...s, unit: t }))} />
            <TextInput style={styles.input} placeholder="Price" keyboardType="decimal-pad" value={form.price} onChangeText={(t) => setForm((s) => ({ ...s, price: t }))} />

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
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#01559d', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  addText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  varietyChips: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#E3F2FD', borderRadius: 16, borderWidth: 1, borderColor: '#D6EAF8', marginRight: 8 },
  chipText: { color: '#1976D2', fontWeight: '700', fontSize: 12 },
  row: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginTop: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  sub: { fontSize: 13, color: '#666', marginTop: 4 },
  price: { fontWeight: '800', color: '#2e7d32' },
  actions: { flexDirection: 'row', gap: 8 },
  actBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  actText: { fontWeight: '700', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignSelf: Platform.select({ web: 'center', default: 'center' }), width: Platform.select({ web: Math.min(CONTENT_WIDTH_WEB, MODAL_MAX_WIDTH), default: undefined }) },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginTop: 10 },
  modalActions: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#f1f1f1' },
  saveBtn: { backgroundColor: '#01559d' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingVertical: 8, zIndex: 1 },
});
