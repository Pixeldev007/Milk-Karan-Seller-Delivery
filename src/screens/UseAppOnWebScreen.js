import React from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function UseAppOnWebScreen({ navigation }) {
  const webUrl = 'https://app.milkwala.example';
  const copy = async () => {
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(webUrl);
        Alert.alert('Copied', 'Link copied to clipboard');
      } else {
        Alert.alert('Copy', webUrl);
      }
    } catch {
      Alert.alert('Copy failed', 'Please copy the link manually.');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Use App on Web" navigation={navigation} />
      <View style={styles.body}>
        <View style={styles.qrBox}><Text style={{color:'#999'}}>QR Preview</Text></View>
        <Text style={styles.url} onPress={()=>Linking.openURL(webUrl)}>{webUrl}</Text>
        <Text style={styles.instruction}>Scan the QR using mobile app to continue on desktop.</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={copy}><Text style={styles.copyText}>Copy Link</Text></TouchableOpacity>
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
  qrBox: { width: 180, height: 180, borderRadius: 12, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  url: { marginTop: 12, color: '#2e7d32', fontWeight: '700' },
  instruction: { marginTop: 6, color: '#666' },
  copyBtn: { backgroundColor: '#66BB6A', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginTop: 14 },
  copyText: { color: '#fff', fontWeight: '700' },
});
