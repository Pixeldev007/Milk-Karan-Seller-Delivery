import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function UploadQRScreen({ navigation }) {
  const [uri, setUri] = React.useState(null);
  const pick = () => Alert.alert('Upload', 'File picker coming soon');
  const save = () => Alert.alert('Saved', 'QR saved successfully.');
  return (
    <View style={styles.container}>
      <HeaderBar title="Upload QR" navigation={navigation} />
      <View style={styles.body}>
        <TouchableOpacity style={styles.uploadBox} onPress={pick}>
          {uri ? (
            <Image source={{ uri }} style={{ width: 180, height: 180 }} resizeMode="contain" />
          ) : (
            <Text style={{ color: '#777' }}>Tap to upload QR</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Save QR</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: '#90EE90', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  body: { padding: 16, alignItems: 'center', alignSelf: 'center', width: '100%', maxWidth: 900 },
  text: { color: '#666' },
  uploadBox: { width: 200, height: 200, borderRadius: 12, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18, alignSelf: 'stretch' },
  saveText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
