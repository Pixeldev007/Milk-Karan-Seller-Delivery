import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderBar title="Privacy Policy" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.paragraph}>This is the privacy policy placeholder text. Add your real policy here.</Text>
        <Text style={styles.paragraph}>We respect your privacy and handle your data responsibly...</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={()=>navigation.navigate('Settings')}><Text style={styles.secondaryText}>Back to Settings</Text></TouchableOpacity>
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
  secondaryBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#01559d', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#2e7d32', fontWeight: '700' },
});
