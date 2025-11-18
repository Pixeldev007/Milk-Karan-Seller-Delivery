import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function UploadLogoScreen({ navigation }) {
  const [uri, setUri] = React.useState(null);
  const pick = () => Alert.alert('Upload', 'File picker coming soon');
  const remove = () => setUri(null);
  const save = () => Alert.alert('Saved', 'Logo saved successfully.');
  return (
    <View style={styles.container}>
      <HeaderBar title="Upload Logo" navigation={navigation} />
      <View style={styles.body}>
        <TouchableOpacity style={styles.circle} onPress={pick}>
          {uri ? (
            <Image source={{ uri }} style={{ width: 140, height: 140, borderRadius: 70 }} />
          ) : (
            <Text style={{ color: '#777' }}>Tap to upload logo</Text>
          )}
        </TouchableOpacity>
        <View style={styles.rowBtns}>
          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#f1f1f1' }]} onPress={remove}><Text>Remove</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#FFFFFF', borderColor: '#01559d', borderWidth: 1 }]} onPress={pick}><Text style={{ color:'#2e7d32', fontWeight:'700' }}>Replace</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Save Logo</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  body: { padding: 16, alignItems: 'center', alignSelf: 'center', width: '100%', maxWidth: 900 },
  text: { color: '#666' },
  circle: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  saveBtn: { backgroundColor: '#01559d', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18, alignSelf: 'stretch' },
  saveText: { color: '#fff', fontWeight: '700' },
});
