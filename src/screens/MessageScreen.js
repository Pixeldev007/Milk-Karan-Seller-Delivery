import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

export default function MessageScreen() {
  const [message, setMessage] = useState('');

  const sendWhatsApp = () => {
    const text = message.trim();
    if (!text) return Alert.alert('Empty', 'Please enter a message first.');

    const encoded = encodeURIComponent(text);
    const url = `whatsapp://send?text=${encoded}`;

    (async () => {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          Alert.alert('WhatsApp not available', 'WhatsApp is not installed or cannot be opened on this device.');
          return;
        }
        await Linking.openURL(url);
      } catch (e) {
        Alert.alert('Error', e?.message || 'Unable to open WhatsApp.');
      }
    })();
  };

  const sendNotification = async () => {
    const text = message.trim();
    if (!text) {
      Alert.alert('Empty', 'Please enter a message first.');
      return;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error('You must be logged in to send notifications.');
      }

      const extra = (Constants.expoConfig?.extra || {});
      const baseUrl =
        process.env.EXPO_PUBLIC_SUPABASE_URL ||
        extra.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        extra.NEXT_PUBLIC_SUPABASE_URL ||
        '';

      if (!baseUrl) {
        throw new Error('Supabase URL not configured for push notifications.');
      }

      const res = await fetch(`${baseUrl}/functions/v1/broadcast_notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role: 'customer',
          title: 'Milk Karan Update',
          body: text,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to send notification.');
      }

      Alert.alert('Sent', 'Notification sent request submitted for all customer apps.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to send notification.');
    }
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
            <Ionicons name="notifications-outline" size={18} color="#01559d" />
            <Text style={[styles.btnText, { color: '#01559d' }]}>Send Notification</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {
    backgroundColor: '#01559d',
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
  body: { padding: 16, alignSelf: 'center', width: '100%', maxWidth: 900 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  textAreaWrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10 },
  textArea: { minHeight: 140, padding: 12, color: '#333' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', borderRadius: 10, paddingVertical: 12 },
  waBtn: { backgroundColor: '#25D366' },
  notifBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#01559d' },
  btnText: { fontWeight: '700' },
});
