import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';

export default function BulkPriceUpdateScreen() {
  const upload = () => Alert.alert('Upload', 'CSV/Excel upload coming soon');
  const update = () => Alert.alert('Update', 'Prices updated from uploaded file.');
  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Bulk Price Update</Text></View>
      <View style={styles.body}>
        <TouchableOpacity style={styles.uploadBox} onPress={upload}>
          <Text style={{ color: '#777' }}>Tap to upload CSV/Excel</Text>
        </TouchableOpacity>
        <Text style={styles.link}>Download sample file</Text>
        <Text style={styles.note}>Upload a file with product names and updated prices.</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={update}><Text style={styles.saveText}>Upload & Update</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: '#90EE90', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  body: { padding: 16 },
  text: { color: '#666' },
  uploadBox: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 20, alignItems: 'center' },
  link: { color: '#2e7d32', marginTop: 10, fontWeight: '700' },
  note: { color: '#666', marginTop: 6 },
  saveBtn: { backgroundColor: '#01559d', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
