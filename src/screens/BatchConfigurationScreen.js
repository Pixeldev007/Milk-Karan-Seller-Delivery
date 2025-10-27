import React from 'react';
import { View, Text, StyleSheet, Platform, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function BatchConfigurationScreen() {
  const [enabled, setEnabled] = React.useState(false);
  const [prefix, setPrefix] = React.useState('BATCH');
  const [autoGen, setAutoGen] = React.useState(true);
  const onSave = () => Alert.alert('Saved', 'Batch configuration saved.');
  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Batch Configuration</Text></View>
      <View style={styles.body}>
        <View style={styles.rowBetween}><Text style={styles.label}>Enable Batch System</Text><Switch value={enabled} onValueChange={setEnabled} /></View>
        <Text style={[styles.label,{marginTop:12}]}>Default Batch Prefix</Text>
        <TextInput style={styles.input} value={prefix} onChangeText={setPrefix} />
        <View style={styles.rowBetween}><Text style={styles.label}>Auto Batch Generation</Text><Switch value={autoGen} onValueChange={setAutoGen} /></View>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}><Text style={styles.saveText}>Save Configuration</Text></TouchableOpacity>
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
  label: { fontSize: 16, color: '#333', fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, backgroundColor:'#fff', borderWidth:1, borderColor:'#eee', borderRadius:10, paddingHorizontal:12, paddingVertical:10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
