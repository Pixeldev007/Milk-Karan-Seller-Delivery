import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { HeaderBar } from '../../components/HeaderBar';
import { Colors } from '../../theme/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth, AuthRole } from '../../context/AuthContext';
import { loginDeliveryAgent, findAgentByNamePhone, findAgentByLoginIdPhone, findCustomerByNamePhone } from '../../services/deliveryApi';

export const NamePhoneLoginScreen: React.FC = () => {
  const nav = useNavigation();
  const route = useRoute() as any;
  const role: AuthRole = route?.params?.role || 'customer';
  const { loginAs } = useAuth();

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onLogin = React.useCallback(async () => {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) {
      setError('Enter name and phone');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (role === 'customer') {
        const cust = await findCustomerByNamePhone(n, p);
        if (!cust) {
          setError('No customer found with given details');
        } else {
          loginAs('customer', cust);
          (nav as any).reset({ index: 0, routes: [{ name: 'Main' }] });
        }
      } else {
        // Prefer RPC (works under RLS for anon), fallback to client queries
        let ag = await loginDeliveryAgent(n, p);
        if (!ag) ag = await findAgentByLoginIdPhone(n, p);
        if (!ag) ag = await findAgentByNamePhone(n, p);
        if (!ag) {
          setError('No delivery boy found. Use Login ID + Phone or Name + Phone');
        } else {
          loginAs('delivery_boy', ag);
          (nav as any).reset({ index: 0, routes: [{ name: 'Main' }] });
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed. Please try again');
    } finally {
      setLoading(false);
    }
  }, [name, phone, role, loginAs, nav]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <HeaderBar title={role === 'customer' ? 'Customer Login' : 'Delivery Boy Login'} showBack onPressBack={() => nav.goBack()} />
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>{role === 'customer' ? 'Name' : 'Login ID or Name'}</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder={role === 'customer' ? 'Enter name' : 'Enter login id or name'} placeholderTextColor="#9ca3af" />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="Enter phone" placeholderTextColor="#9ca3af" keyboardType="phone-pad" />
          </View>
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity onPress={onLogin} accessibilityRole="button" style={[styles.btn, loading && { opacity: 0.7 }]} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  label: { color: Colors.text, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text },
  btn: { marginTop: 16, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  error: { color: '#dc2626', marginTop: 10 },
});
