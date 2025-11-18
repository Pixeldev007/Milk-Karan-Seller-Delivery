import React from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen({ navigation }) {
  const [form, setForm] = React.useState({ current: '', next: '', confirm: '' });
  const currentRef = React.useRef(null);
  const nextRef = React.useRef(null);
  const confirmRef = React.useRef(null);
  const isValidNew = form.next.length >= 6;
  const canSubmit = !!form.current && !!form.next && !!form.confirm && form.next === form.confirm && isValidNew;
  const update = () => {
    if (!form.next || !form.confirm) {
      return Alert.alert('Error', 'Please enter both New Password and Confirm Password.');
    }
    if (!isValidNew) {
      return Alert.alert('Error', 'New Password must be at least 6 characters.');
    }
    if (form.next !== form.confirm) {
      return Alert.alert('Error', 'New Password and Confirm Password must match.');
    }
    if (!form.current) {
      return Alert.alert('Error', 'Please enter your Current Password.');
    }
    Alert.alert('Success', 'Password updated.');
  };
  return (
    <View style={styles.container}>
      <HeaderBar title="Change Password" navigation={navigation} />
      <View style={styles.body}>
        <TouchableOpacity onPress={() => currentRef.current?.focus()} activeOpacity={0.7}>
          <Text style={styles.label}>Current Password</Text>
        </TouchableOpacity>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color="#777" />
          <TextInput ref={currentRef} style={styles.input} placeholder="Current Password" secureTextEntry value={form.current} onChangeText={(t)=>setForm(s=>({...s, current:t}))} />
        </View>
        <TouchableOpacity onPress={() => nextRef.current?.focus()} activeOpacity={0.7}>
          <Text style={styles.label}>New Password</Text>
        </TouchableOpacity>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color="#777" />
          <TextInput ref={nextRef} style={styles.input} placeholder="New Password" secureTextEntry value={form.next} onChangeText={(t)=>setForm(s=>({...s, next:t}))} />
        </View>
        <TouchableOpacity onPress={() => confirmRef.current?.focus()} activeOpacity={0.7}>
          <Text style={styles.label}>Confirm Password</Text>
        </TouchableOpacity>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color="#777" />
          <TextInput ref={confirmRef} style={styles.input} placeholder="Confirm Password" secureTextEntry value={form.confirm} onChangeText={(t)=>setForm(s=>({...s, confirm:t}))} />
        </View>
        {!!form.next && !isValidNew && (
          <Text style={styles.helperText}>Use at least 6 characters.</Text>
        )}
        {!!form.confirm && form.next !== form.confirm && (
          <Text style={styles.errorText}>Passwords do not match.</Text>
        )}
        <TouchableOpacity disabled={!canSubmit} style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]} onPress={update}><Text style={styles.saveText}>Update Password</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: '#90EE90', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  body: { padding: 16, alignSelf: 'center', width: '100%', maxWidth: 900 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 },
  input: { flex: 1 },
  label: { marginTop: 14, marginBottom: 6, color: '#445', fontWeight: '600' },
  helperText: { marginTop: 6, color: '#666' },
  errorText: { marginTop: 6, color: '#d32f2f', fontWeight: '500' },
  saveBtn: { backgroundColor: '#01559d', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveBtnDisabled: { backgroundColor: '#a5d6a7' },
  saveText: { color: '#fff', fontWeight: '700' },
});
