import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MenuCard from '../components/MenuCard';
import CalendarStrip from '../components/CalendarStrip';

export default function DashboardScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const menuItems = [
    { id: 1, title: 'My Customer', icon: 'people', color: '#66BB6A' },
    { id: 2, title: 'Delivery Boy', icon: 'car', color: '#66BB6A' },
    { id: 3, title: 'Daily Sell', icon: 'water', color: '#66BB6A' },
    { id: 5, title: 'Create Bill', icon: 'receipt', color: '#66BB6A' },
    { id: 6, title: 'Report', icon: 'document-text', color: '#66BB6A' },
    { id: 7, title: 'Products', icon: 'cube', color: '#66BB6A' },
    { id: 8, title: 'Message', icon: 'send', color: '#66BB6A' },
    { id: 9, title: 'Received Payment', icon: 'cash', color: '#66BB6A' },
    { id: 12, title: "What's App", icon: 'logo-whatsapp', color: '#66BB6A' },
    { id: 13, title: 'Milk Report', icon: 'flask', color: '#66BB6A' },
    { id: 15, title: 'Group Management', icon: 'people-circle', color: '#66BB6A' },
    { id: 16, title: 'Settings', icon: 'settings', color: '#66BB6A' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Milk Wala</Text>
        <TouchableOpacity>
          <Ionicons name="grid" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Strip */}
        <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        {/* Stats Boxes (3) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCardCompact}>
            <Text style={[styles.statNumberCompact, { color: '#66BB6A' }]}>0</Text>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(102,187,106,0.15)' }]}>
              <Ionicons name="checkmark" size={20} color="#66BB6A" />
            </View>
          </View>
          <View style={styles.statCardCompact}>
            <Text style={[styles.statNumberCompact, { color: '#66BB6A' }]}>0</Text>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(102,187,106,0.15)' }]}>
              <Ionicons name="close" size={20} color="#66BB6A" />
            </View>
          </View>
          <View style={styles.statCardCompact}>
            <Text style={[styles.statNumberCompact, { color: '#66BB6A' }]}>0.00 L</Text>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(102,187,106,0.15)' }]}>
              <Ionicons name="water" size={20} color="#66BB6A" />
            </View>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              title={item.title}
              icon={item.icon}
              color={item.color}
              badge={item.badge}
              onPress={() => {
                if (item.title === 'My Customer') {
                  navigation.navigate('MyCustomer');
                } else if (item.title === 'Delivery Boy') {
                  navigation.navigate('DeliveryBoy');
                } else if (item.title === 'Daily Sell') {
                  navigation.navigate('DailySell');
                } else if (item.title === 'Create Bill') {
                  navigation.navigate('CreateBill');
                } else if (item.title === 'Report') {
                  navigation.navigate('Report');
                } else if (item.title === 'Products') {
                  navigation.navigate('Product');
                } else if (item.title === 'Message') {
                  navigation.navigate('Message');
                } else if (item.title === 'Received Payment') {
                  navigation.navigate('ReceivedPayment');
                }
              }}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>India's</Text>
          <Text style={styles.footerSubtitle}>milk app ❤️</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#90EE90',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCardCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  footerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ccc',
  },
  footerSubtitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ccc',
  },
});
