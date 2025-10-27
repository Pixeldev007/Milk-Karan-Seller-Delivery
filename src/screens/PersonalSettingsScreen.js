import React from 'react';
import { View, Text, StyleSheet, Platform, Switch, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function PersonalSettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [language, setLanguage] = React.useState('English');
  const [autoBackup, setAutoBackup] = React.useState(false);
  const [notifSound, setNotifSound] = React.useState(true);

  const onSave = () => Alert.alert('Saved', 'Preferences saved.');

  return (
    <View style={styles.container}>
      <HeaderBar title="Personal Settings" navigation={navigation} />
      <View style={styles.body}>
        <View style={styles.rowBetween}><Text style={styles.label}>Dark Mode</Text><Switch value={darkMode} onValueChange={setDarkMode} /></View>

        <Text style={[styles.label,{marginTop:12}]}>Language</Text>
        <View style={styles.chipsRow}>
          {['English','Hindi','Tamil'].map((l)=> (
            <TouchableOpacity key={l} style={[styles.chip, language===l && styles.chipActive]} onPress={()=>setLanguage(l)}>
              <Text style={[styles.chipText, language===l && styles.chipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rowBetween}><Text style={styles.label}>Auto Backup</Text><Switch value={autoBackup} onValueChange={setAutoBackup} /></View>
        <View style={styles.rowBetween}><Text style={styles.label}>Notification Sound</Text><Switch value={notifSound} onValueChange={setNotifSound} /></View>

        <TouchableOpacity style={styles.saveBtn} onPress={onSave}><Text style={styles.saveText}>Save Preferences</Text></TouchableOpacity>
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
  label: { fontSize: 16, color: '#333', fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, backgroundColor:'#fff', borderWidth:1, borderColor:'#eee', borderRadius:10, paddingHorizontal:12, paddingVertical:10 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' },
  chipText: { color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#2e7d32' },
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
