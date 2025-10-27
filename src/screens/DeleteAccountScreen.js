import React from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function DeleteAccountScreen({ navigation }) {
  const [password, setPassword] = React.useState('');
  const onDelete = () => {
    if (!password.trim()) return Alert.alert('Error', 'Please enter your password.');
    Alert.alert('Confirm Delete', 'Deleting your account will remove all your data permanently.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deleted', 'Your account deletion request has been submitted.') },
    ]);
  };
  return (
    <View style={styles.container}>
      <HeaderBar title="Delete My Account" navigation={navigation} />
      <View style={styles.body}>
        <Text style={styles.warning}>Deleting your account will remove all your data permanently.</Text>
        <Text style={styles.label}>Enter Password</Text>
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}><Text style={styles.deleteText}>Delete Account</Text></TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={()=>navigation.navigate('Settings')}><Text style={styles.secondaryText}>Back to Settings</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  body: { padding: 16, alignSelf: 'center', width: '100%', maxWidth: 900 },
  warning: { color: '#D32F2F', backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2', padding: 12, borderRadius: 10 },
  label: { fontSize: 13, color: '#666', marginTop: 14, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  deleteBtn: { backgroundColor: '#D32F2F', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  deleteText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#66BB6A', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#2e7d32', fontWeight: '700' },
});
