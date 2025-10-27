import React from 'react';
import { View, Text, StyleSheet, Platform, FlatList, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import HeaderBar from '../components/HeaderBar';

export default function ActiveDeviceScreen({ navigation }) {
  const [devices, setDevices] = React.useState([
    { id: '1', name: 'Chrome on Windows', last: '2025-10-17 12:00' },
    { id: '2', name: 'Android Phone', last: '2025-10-16 20:22' },
  ]);
  const logout = (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    Alert.alert('Logged out', 'Device session ended.');
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>Last login: {item.last}</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={() => logout(item.id)}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <HeaderBar title="Active Device" navigation={navigation} />
      <ScreenContainer>
        <FlatList data={devices} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 40 }} />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: '#90EE90', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  body: { padding: 16 },
  text: { color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 12, marginTop: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  sub: { fontSize: 13, color: '#666', marginTop: 2 },
  logoutBtn: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  logoutText: { color: '#D32F2F', fontWeight: '700' },
});
