import React from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function BusinessProfileScreen({ navigation }) {
  const [editable, setEditable] = React.useState(true);
  const [type, setType] = React.useState('Proprietorship');
  const [form, setForm] = React.useState({ name: '', gst: '', address: '', website: '' });

  const onSave = () => Alert.alert('Saved', 'Business profile saved.');

  return (
    <View style={styles.container}>
      <HeaderBar title="Business Profile" navigation={navigation} backTo="Settings" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={()=>setEditable((e)=>!e)}>
            <Text style={[styles.btnText, { color: '#2e7d32' }]}>{editable ? 'View Mode' : 'Edit Profile'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={onSave}><Text style={[styles.btnText, { color: '#fff' }]}>Save</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={()=>setForm({ name:'', gst:'', address:'', website:'' })}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
        </View>

        <Text style={styles.label}>Business Name</Text>
        <TextInput style={styles.input} editable={editable} placeholder="Enter business name" value={form.name} onChangeText={(t)=>setForm(s=>({...s, name:t}))} />

        <Text style={styles.label}>Business Type</Text>
        <View style={styles.chipsRow}>
          {['Proprietorship','Partnership','Private Ltd','LLP'].map((t)=> (
            <TouchableOpacity key={t} style={[styles.chip, type===t && styles.chipActive]} onPress={()=>setType(t)}>
              <Text style={[styles.chipText, type===t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>GST Number</Text>
        <TextInput style={styles.input} editable={editable} placeholder="Enter GST number" value={form.gst} onChangeText={(t)=>setForm(s=>({...s, gst:t}))} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={[styles.input,{height:90}]} editable={editable} multiline placeholder="Business address" value={form.address} onChangeText={(t)=>setForm(s=>({...s, address:t}))} />

        <Text style={styles.label}>Website Link</Text>
        <TextInput style={styles.input} editable={editable} placeholder="https://example.com" autoCapitalize="none" value={form.website} onChangeText={(t)=>setForm(s=>({...s, website:t}))} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  body: { padding: 16, paddingBottom: 40, alignSelf: 'center', width: '100%', maxWidth: 900 },
  label: { fontSize: 13, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#66BB6A' },
  editBtn: { backgroundColor: '#E8F5E9' },
  saveBtn: { backgroundColor: '#66BB6A', borderColor: '#66BB6A' },
  cancelBtn: { backgroundColor: '#f1f1f1', borderColor: '#ddd' },
  btnText: { fontWeight: '700', color: '#333' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' },
  chipText: { color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#2e7d32' },
});
