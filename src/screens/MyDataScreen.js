import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function MyDataScreen({ navigation }) {
  const backup = () => Alert.alert('Backup', 'Data backup started.');
  const download = () => Alert.alert('Download', 'Your data will be prepared for download.');
  const del = () => Alert.alert('Delete Data', 'Make sure you have a backup before deleting.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive' },
  ]);
  return (
    <View style={styles.container}>
      <HeaderBar title="My Data" navigation={navigation} />
      <View style={styles.body}>
        <TouchableOpacity style={styles.primaryBtn} onPress={backup}><Text style={styles.primaryText}>Backup Data</Text></TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={download}><Text style={styles.primaryText}>Download Data</Text></TouchableOpacity>
        <TouchableOpacity style={styles.dangerBtn} onPress={del}><Text style={styles.dangerText}>Delete Data</Text></TouchableOpacity>
        <Text style={styles.note}>Make sure to backup before deleting.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  body: { padding: 16, alignSelf: 'center', width: '100%', maxWidth: 900 },
  text: { color: '#666' },
  primaryBtn: { backgroundColor: '#01559d', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  primaryText: { color: '#fff', fontWeight: '700' },
  dangerBtn: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  dangerText: { color: '#D32F2F', fontWeight: '700' },
  note: { color: '#666', marginTop: 10 },
});
