import React from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function UpdateProfileScreen({ navigation }) {
  const [form, setForm] = React.useState({
    fullName: '',
    email: '',
    mobile: '',
    category: '',
    address: '',
  });

  const onSave = () => {
    Alert.alert('Saved', 'Profile changes have been saved.');
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Update Profile" navigation={navigation} backTo="Settings" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Enter full name" value={form.fullName} onChangeText={(t)=>setForm(s=>({...s, fullName:t}))} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(t)=>setForm(s=>({...s, email:t}))} />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput style={styles.input} placeholder="Enter mobile number" keyboardType="phone-pad" value={form.mobile} onChangeText={(t)=>setForm(s=>({...s, mobile:t}))} />

        <Text style={styles.label}>Business Category</Text>
        <TextInput style={styles.input} placeholder="e.g., Dairy, Grocery" value={form.category} onChangeText={(t)=>setForm(s=>({...s, category:t}))} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={[styles.input, { height: 90 }]} placeholder="Enter address" multiline value={form.address} onChangeText={(t)=>setForm(s=>({...s, address:t}))} />

        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
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
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
