import React from 'react';
import { View, Text, StyleSheet, Platform, TextInput, Switch, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function BillSettingScreen({ navigation }) {
  const [header, setHeader] = React.useState('Milk Karan Invoice');
  const [footer, setFooter] = React.useState('Thanks for your business!');
  const [logo, setLogo] = React.useState(true);
  const onSave = () => Alert.alert('Saved', 'Bill settings saved.');
  return (
    <View style={styles.container}>
      <HeaderBar title="Bill Setting" navigation={navigation} />
      <View style={styles.body}>
        <Text style={styles.label}>Custom Invoice Header</Text>
        <TextInput style={styles.input} value={header} onChangeText={setHeader} />
        <Text style={styles.label}>Footer Note</Text>
        <TextInput style={[styles.input,{height:90}]} multiline value={footer} onChangeText={setFooter} />
        <View style={styles.rowBetween}><Text style={styles.label}>Enable logo on invoice</Text><Switch value={logo} onValueChange={setLogo} /></View>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}><Text style={styles.saveText}>Save Bill Settings</Text></TouchableOpacity>
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
  label: { fontSize: 13, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  rowBetween: { flexDirection: 'row', alignItems:'center', justifyContent:'space-between', marginTop:12, backgroundColor:'#fff', borderWidth:1, borderColor:'#eee', borderRadius:10, paddingHorizontal:12, paddingVertical:10 },
  saveBtn: { backgroundColor: '#01559d', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
