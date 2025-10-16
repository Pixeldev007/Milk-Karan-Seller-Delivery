import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MessageScreen() {
  const [message, setMessage] = useState('');

  const sendWhatsApp = () => {
    if (!message.trim()) return Alert.alert('Empty', 'Please enter a message first.');
    Alert.alert('WhatsApp', 'This will open WhatsApp with your broadcast (to be implemented).');
  };

  const sendNotification = () => {
    if (!message.trim()) return Alert.alert('Empty', 'Please enter a message first.');
    Alert.alert('Notification', 'This will send a push notification to all customers (to be implemented).');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Broadcast Message</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Your Message</Text>
        <View style={styles.textAreaWrap}>
          <TextInput
            style={styles.textArea}
            placeholder="Type your message here..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.waBtn]} onPress={sendWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={[styles.btnText, { color: '#fff' }]}>Send via WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.notifBtn]} onPress={sendNotification}>
            <Ionicons name="notifications-outline" size={18} color="#2e7d32" />
            <Text style={[styles.btnText, { color: '#2e7d32' }]}>Send Notification</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {
    backgroundColor: '#90EE90',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  body: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  textAreaWrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10 },
  textArea: { minHeight: 140, padding: 12, color: '#333' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', borderRadius: 10, paddingVertical: 12 },
  waBtn: { backgroundColor: '#25D366' },
  notifBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#66BB6A' },
  btnText: { fontWeight: '700' },
});
