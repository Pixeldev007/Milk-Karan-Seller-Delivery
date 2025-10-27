import React from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function GSTScreen({ navigation }) {
  const [gst, setGst] = React.useState('');
  const [enabled, setEnabled] = React.useState(true);

  const onSave = () => Alert.alert('Saved', 'GST settings saved.');

  return (
    <View style={styles.container}>
      <HeaderBar title="GST Details" navigation={navigation} backTo="Settings" />
      <View style={styles.body}>
        <Text style={styles.label}>GST Number</Text>
        <TextInput style={styles.input} placeholder="Enter GST number" value={gst} onChangeText={setGst} />

        <Text style={styles.label}>Upload GST Certificate</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={()=>Alert.alert('Upload','File upload coming soon')}>
          <Text style={{ color: '#777' }}>Tap to upload certificate</Text>
        </TouchableOpacity>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Enable GST Billing</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={onSave}><Text style={styles.saveText}>Save Settings</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  body: { padding: 16, alignSelf: 'center', width: '100%', maxWidth: 900 },
  label: { fontSize: 13, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  uploadBox: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 20, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
