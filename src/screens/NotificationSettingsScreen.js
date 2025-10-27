import React from 'react';
import { View, Text, StyleSheet, Platform, Switch, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function NotificationSettingsScreen({ navigation }) {
  const [newOrders, setNewOrders] = React.useState(true);
  const [paymentAlerts, setPaymentAlerts] = React.useState(true);
  const [expiry, setExpiry] = React.useState(true);
  const [offers, setOffers] = React.useState(false);
  const onSave = () => Alert.alert('Saved', 'Notification settings saved.');
  return (
    <View style={styles.container}>
      <HeaderBar title="Notification Settings" navigation={navigation} />
      <View style={styles.body}>
        <View style={styles.rowBetween}><Text style={styles.label}>New Orders</Text><Switch value={newOrders} onValueChange={setNewOrders} /></View>
        <View style={styles.rowBetween}><Text style={styles.label}>Payment Alerts</Text><Switch value={paymentAlerts} onValueChange={setPaymentAlerts} /></View>
        <View style={styles.rowBetween}><Text style={styles.label}>Subscription Expiry</Text><Switch value={expiry} onValueChange={setExpiry} /></View>
        <View style={styles.rowBetween}><Text style={styles.label}>Offers & Updates</Text><Switch value={offers} onValueChange={setOffers} /></View>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}><Text style={styles.saveText}>Save Settings</Text></TouchableOpacity>
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
  saveBtn: { backgroundColor: '#66BB6A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '700' },
});
