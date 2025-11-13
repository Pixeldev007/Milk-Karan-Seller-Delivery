import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { supabase } from '../lib/supabase';
import { requireUser } from '../lib/session';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { listDeliveryAgents } from '../lib/delivery';
import { listDailyDeliveries, toggleDeliveryStatus } from '../lib/dailyDeliveries';

function toYMD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DailySellScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDBoy, setSelectedDBoy] = useState('all');
  const [agents, setAgents] = useState([{ id: 'all', name: 'All Delivery Boys' }]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sales, setSales] = useState([]);
  const todayKey = toYMD(selectedDate);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingAgents(true);
        const list = await listDeliveryAgents();
        if (!mounted) return;
        const mapped = [{ id: 'all', name: 'All Delivery Boys' }].concat(
          (list || []).map((a) => ({ id: a.id, name: a.name }))
        );
        setAgents(mapped);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e.message || 'Failed to load delivery agents');
      } finally {
        if (mounted) setLoadingAgents(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const loadSales = useMemo(() => async () => {
    try {
      setLoadingSales(true);
      setErrorMsg('');
      const data = await listDailyDeliveries({ date: todayKey, deliveryAgentId: selectedDBoy });
      setSales(
        (data || []).map((row) => ({
          id: row.id,
          date: row.date,
          customerName: row.customer?.name || '—',
          qty: `${Number(row.quantity).toFixed(1)} L`,
          status: row.status,
          deliveryBoyId: row.deliveryAgent?.id || null,
          deliveryBoyName: row.deliveryAgent?.name || null,
        }))
      );
    } catch (e) {
      setErrorMsg(e.message || 'Failed to load daily deliveries');
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  }, [todayKey, selectedDBoy]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Realtime: refresh when any daily_deliveries row changes for this seller (owner)
  useEffect(() => {
    let sub;
    (async () => {
      try {
        const user = await requireUser();
        sub = supabase
          .channel(`dd-owner-${user.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'daily_deliveries',
            filter: `owner_id=eq.${user.id}`,
          }, () => {
            loadSales();
          })
          .subscribe();
      } catch {}
    })();
    return () => {
      if (sub) supabase.removeChannel(sub);
    };
  }, [loadSales]);

  const filtered = useMemo(() => sales, [sales]);

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const toggleStatus = (id) => {
    setSales((prev) => {
      const current = prev.find((s) => s.id === id);
      const next = current?.status === 'Delivered' ? 'Pending' : 'Delivered';
      (async () => {
        try {
          await toggleDeliveryStatus(id, next);
        } catch (_) {
          // revert on failure
          loadSales();
        }
      })();
      return prev.map((s) => (s.id === id ? { ...s, status: next } : s));
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.customerName}</Text>
        <Text style={styles.sub}>Qty: {item.qty}</Text>
        {item.deliveryBoyName ? (
          <Text style={[styles.sub, { color: '#555' }]}>Agent: {item.deliveryBoyName}</Text>
        ) : null}
      </View>
      <View style={styles.statusWrap}>
        <View style={[styles.statusPill, item.status === 'Delivered' ? styles.okPill : styles.pendingPill]}>
          <Ionicons
            name={item.status === 'Delivered' ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={item.status === 'Delivered' ? '#1B5E20' : '#B26A00'}
          />
          <Text style={[styles.statusText, item.status === 'Delivered' ? styles.okText : styles.pendingText]}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => toggleStatus(item.id)}>
          <Text style={styles.toggleText}>Toggle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Sell</Text>
      </View>

      {/* Filters: Date and Delivery Boy */}
      <ScreenContainer>
      <View style={styles.filters}>
        <View style={styles.dateBox}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => shiftDate(-1)}>
            <Ionicons name="chevron-back" size={18} color="#2e7d32" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{todayKey}</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => shiftDate(1)}>
            <Ionicons name="chevron-forward" size={18} color="#2e7d32" />
          </TouchableOpacity>
        </View>

        <View style={styles.dboyBox}>
          <Ionicons name="person" size={16} color="#777" />
          <Text style={styles.dboyLabel}>Delivery Boy:</Text>
          <View style={styles.dboyPicker}>
            {agents.map((db) => (
              <TouchableOpacity
                key={db.id}
                onPress={() => setSelectedDBoy(db.id)}
                style={[styles.dboyChip, selectedDBoy === db.id && styles.dboyChipActive]}
              >
                <Text style={[styles.dboyChipText, selectedDBoy === db.id && styles.dboyChipTextActive]}>
                  {db.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* List */}
      {loadingSales ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#66BB6A" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={() => (
            <View style={styles.empty}> 
              <Ionicons name="water-outline" size={48} color="#bbb" />
              <Text style={styles.emptyText}>{errorMsg || 'No sales for this date/filter'}</Text>
            </View>
          )}
        />
      )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#90EE90',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  filters: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  dateBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  dateText: {
    fontWeight: '700',
    color: '#333',
  },
  dboyBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 10,
  },
  dboyLabel: {
    marginLeft: 6,
    color: '#666',
    fontWeight: '600',
  },
  dboyPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dboyChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  dboyChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#66BB6A',
  },
  dboyChipText: {
    color: '#555',
    fontWeight: '600',
  },
  dboyChipTextActive: {
    color: '#2e7d32',
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sub: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  statusWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  okPill: {
    backgroundColor: '#E8F5E9',
    borderColor: '#66BB6A',
  },
  pendingPill: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFECB3',
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },
  okText: {
    color: '#1B5E20',
  },
  pendingText: {
    color: '#B26A00',
  },
  toggleBtn: {
    backgroundColor: '#66BB6A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  toggleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 8,
  },
});
