import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function DeliveryDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Dashboard</Text>
      <Text style={styles.subtitle}>Today’s assignments and actions.</Text>

      {/* Example quick links – wire these to your actual delivery screens later */}
      <View style={styles.links}>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Assignments')}>
          <Text style={styles.linkText}>View Assignments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Collections')}>
          <Text style={styles.linkText}>Collections</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 16,
    color: '#4F5B62',
    marginTop: 6,
  },
  links: {
    marginTop: 24,
  },
  link: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
