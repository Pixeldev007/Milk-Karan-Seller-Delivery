import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, FlatList } from 'react-native';
// Removed ScreenContainer/ScrollView to avoid nesting a FlatList inside ScrollView
import HeaderBar from '../components/HeaderBar';
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
  ];

  const ListHeader = (
    <View>
      <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
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
        <View style={[styles.statCardCompact, styles.statCardEmphasis]}>
          <Text style={[styles.statNumberCompact, styles.statNumberEmphasis, { color: '#66BB6A' }]}>0.00 L</Text>
          <View style={[styles.statIconCircle, styles.statIconCircleLarge, { backgroundColor: 'rgba(102,187,106,0.15)' }]}>
            <Ionicons name="water" size={22} color="#66BB6A" />
          </View>
        </View>
      </View>
    </View>
  );

  const ListFooter = (
    <View style={styles.footer}>
      <Text style={styles.footerTitle}>India's</Text>
      <Text style={styles.footerSubtitle}>milk app ❤️</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBar title="Milk Wala" navigation={navigation} />
      <FlatList
        data={menuItems}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width: '49%', paddingHorizontal: 4, marginBottom: 12 }}>
            <MenuCard
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
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    
  },
  headerTitle: {},
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
  statNumberEmphasis: {
    fontSize: 20,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircleLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  statCardEmphasis: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5f5ea',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
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
