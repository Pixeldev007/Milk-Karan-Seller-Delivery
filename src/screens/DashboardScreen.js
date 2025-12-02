import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, FlatList, Alert } from 'react-native';
// Removed ScreenContainer/ScrollView to avoid nesting a FlatList inside ScrollView
import HeaderBar from '../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';
import MenuCard from '../components/MenuCard';
import CalendarStrip from '../components/CalendarStrip';
import { supabase } from '../lib/supabase';
import { requireUser } from '../lib/session';

export default function DashboardScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalLiters, setTotalLiters] = useState(0);

  const toYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await requireUser();
        const dateKey = toYMD(selectedDate);

        const { data, error } = await supabase
          .from('daily_deliveries')
          .select('status, quantity')
          .eq('owner_id', user.id)
          .eq('delivery_date', dateKey);

        if (!active) return;
        if (error) {
          throw error;
        }

        const rows = data || [];
        let completed = 0;
        let pending = 0;
        let liters = 0;

        for (const row of rows) {
          const status = row.status;
          const qty = Number(row.quantity || 0);
          if (status === 'Delivered') {
            completed += 1;
            liters += qty;
          } else if (status === 'Pending') {
            pending += 1;
          }
        }

        setCompletedCount(completed);
        setPendingCount(pending);
        setTotalLiters(liters);
      } catch (e) {
        if (active) {
          Alert.alert('Error', e.message || 'Failed to load dashboard stats.');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedDate]);
  const menuItems = [
    { id: 1, title: 'My Customer', icon: 'people', color: '#01559d' },
    { id: 2, title: 'Delivery Boy', icon: 'car', color: '#01559d' },
    { id: 3, title: 'Daily Sell', icon: 'water', color: '#01559d' },
    { id: 5, title: 'Create Bill', icon: 'receipt', color: '#01559d' },
    { id: 6, title: 'Report', icon: 'document-text', color: '#01559d' },
    { id: 7, title: 'Products', icon: 'cube', color: '#01559d' },
    { id: 8, title: 'Message', icon: 'send', color: '#01559d' },
    { id: 9, title: 'Received Payment', icon: 'cash', color: '#01559d' },
  ];

  const ListHeader = (
    <View>
      <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <View style={styles.statsContainer}>
        <View style={styles.statCardCompact}>
          <Text style={[styles.statNumberCompact, { color: '#01559d' }]}>{completedCount}</Text>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(1,85,157,0.15)' }]}>
            <Ionicons name="checkmark" size={20} color="#01559d" />
          </View>
        </View>
        <View style={styles.statCardCompact}>
          <Text style={[styles.statNumberCompact, { color: '#01559d' }]}>{pendingCount}</Text>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(1,85,157,0.15)' }]}>
            <Ionicons name="close" size={20} color="#01559d" />
          </View>
        </View>
        <View style={[styles.statCardCompact, styles.statCardEmphasis]}>
          <Text style={[styles.statNumberCompact, styles.statNumberEmphasis, { color: '#01559d' }]}>
            {totalLiters.toFixed(2)} L
          </Text>
          <View style={[styles.statIconCircle, styles.statIconCircleLarge, { backgroundColor: 'rgba(1,85,157,0.15)' }]}>
            <Ionicons name="water" size={22} color="#01559d" />
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
      <HeaderBar title="Milk Karan" navigation={navigation} />
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
    backgroundColor: '#FFFFFF',
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
    borderColor: '#01559d',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: '#01559d',
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
    borderColor: '#01559d',
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
    color: '#4F5B62',
  },
  footerSubtitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#4F5B62',
  },
});
