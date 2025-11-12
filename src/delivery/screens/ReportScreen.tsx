import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Linking } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';

export const ReportScreen: React.FC = () => {
  const nav = useNavigation();
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const normalizePhone = (v: string) => v.replace(/\D+/g, '');

  const openUrl = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert('Unavailable', 'No app available to handle this action.');
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Unable to open app');
    }
  };

  const onWhatsApp = async () => {
    const p = normalizePhone(phone);
    if (!p || !message.trim()) {
      Alert.alert('Required', 'Enter phone and message');
      return;
    }
    const url = `whatsapp://send?phone=${p}&text=${encodeURIComponent(message)}`;
    await openUrl(url);
  };

  const onSMS = async () => {
    const p = normalizePhone(phone);
    if (!p || !message.trim()) {
      Alert.alert('Required', 'Enter phone and message');
      return;
    }
    const url = `sms:${p}?body=${encodeURIComponent(message)}`;
    await openUrl(url);
  };

  const onCall = async () => {
    const p = normalizePhone(phone);
    if (!p) {
      Alert.alert('Required', 'Enter phone');
      return;
    }
    const url = `tel:${p}`;
    await openUrl(url);
  };

  const onEmail = async () => {
    if (!email.trim() || !message.trim()) {
      Alert.alert('Required', 'Enter email and message');
      return;
    }
    const subject = name ? `Enquiry from ${name}` : 'Enquiry';
    const url = `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    await openUrl(url);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <HeaderBar title="Report" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Send Enquiry / Message</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Recipient Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Seller or Customer" placeholderTextColor="#9ca3af" style={styles.input} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Enter phone" placeholderTextColor="#9ca3af" style={styles.input} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="Optional" placeholderTextColor="#9ca3af" style={styles.input} autoCapitalize="none" keyboardType="email-address" />
          </View>
        </View>
        <Text style={styles.label}>Message</Text>
        <TextInput value={message} onChangeText={setMessage} placeholder="Type your message" placeholderTextColor="#9ca3af" style={[styles.input, { height: 120, textAlignVertical: 'top' }]} multiline />

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#22c55e' }]} onPress={onWhatsApp} disabled={loading}>
            <Text style={styles.btnText}>Send via WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#0284c7' }]} onPress={onSMS} disabled={loading}>
            <Text style={styles.btnText}>Send via SMS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#10b981' }]} onPress={onCall} disabled={loading}>
            <Text style={styles.btnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#6366f1' }]} onPress={onEmail} disabled={loading}>
            <Text style={styles.btnText}>Send Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { color: Colors.text, fontWeight: '700', marginBottom: 10, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  col: { flex: 1 },
  label: { color: Colors.muted, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
