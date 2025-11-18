import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomAppScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="phone-portrait-outline" size={56} color="#01559d" />
      <Text style={styles.title}>Get Your Custom App</Text>
      <Text style={styles.subtitle}>
        Need features tailored for your dairy business? Let's build a custom app for you.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What you get</Text>
        <Text style={styles.item}>• Branding with your business name</Text>
        <Text style={styles.item}>• Features tailored to your workflow</Text>
        <Text style={styles.item}>• Priority support</Text>
      </View>

      <TouchableOpacity
        style={styles.cta}
        onPress={() => Linking.openURL('mailto:hello@example.com?subject=Custom App Inquiry')}
      >
        <Ionicons name="mail-outline" size={20} color="#fff" />
        <Text style={styles.ctaText}>Contact Us</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  item: {
    fontSize: 14,
    color: '#444',
    marginVertical: 2,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#01559d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
