import React from 'react';
import { View, Text, StyleSheet, Platform, FlatList, TextInput, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import HeaderBar from '../components/HeaderBar';

export default function MyAppCustomersScreen({ navigation }) {
  const [query, setQuery] = React.useState('');
  const [data, setData] = React.useState([
    { id: '1', name: 'Ravi Kumar', mobile: '9876543210', last: '2025-10-15' },
    { id: '2', name: 'Anita Sharma', mobile: '9876501234', last: '2025-10-16' },
    { id: '3', name: 'Karthik', mobile: '9876509876', last: '2025-10-14' },
  ]);

  const filtered = data.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.mobile.includes(query));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex:1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>📞 {item.mobile}</Text>
        <Text style={styles.sub}>Last Order: {item.last}</Text>
      </View>
      <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewText}>View Details</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBar title="My App Customers" navigation={navigation} />
      <ScreenContainer>
      <View style={styles.toolbar}>
        <TextInput placeholder="Search customers" value={query} onChangeText={setQuery} style={styles.search} />
      </View>
      <FlatList data={filtered} keyExtractor={i=>i.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 40 }} />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  body: { padding: 16 },
  text: { color: '#666' },
  toolbar: { paddingHorizontal: 16, paddingTop: 12 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 12, marginTop: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  sub: { fontSize: 13, color: '#666', marginTop: 2 },
  viewBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#66BB6A', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  viewText: { color: '#2e7d32', fontWeight: '700' },
});
