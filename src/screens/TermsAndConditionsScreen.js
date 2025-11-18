import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function TermsAndConditionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderBar title="Terms and Conditions" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.paragraph}>
          Welcome to Milk Karan. By using this app, you agree to the following terms and conditions. This is placeholder text. Add your legal copy here...
        </Text>
        <Text style={styles.paragraph}>
          1. Usage terms...{"\n"}2. Subscription terms...{"\n"}3. Privacy and security...{"\n"}4. Cancellation and refunds...
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={()=>navigation.navigate('Settings')}>
          <Text style={styles.backText}>Back to Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  body: { padding: 16, paddingBottom: 40, alignSelf: 'center', width: '100%', maxWidth: 900 },
  text: { color: '#666' },
  paragraph: { color: '#444', lineHeight: 20, marginBottom: 12 },
  backBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#01559d', paddingVertical: 12, borderRadius: 10, alignItems:'center', marginTop: 10 },
  backText: { color: '#2e7d32', fontWeight: '700' },
});
