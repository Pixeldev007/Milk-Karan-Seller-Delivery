import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import Checkbox from 'expo-checkbox';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { formatINR, litersToAmount } from '../data/mock';
import { useDelivery } from '../context/DeliveryContext';

const QtyStepper: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <View style={styles.stepper}>
    <TouchableOpacity onPress={() => onChange((Math.max(0, parseFloat(value||'0') - 0.5)).toString())}><Text style={styles.stepBtn}>-</Text></TouchableOpacity>
    <TextInput value={value} onChangeText={onChange} keyboardType="numeric" style={styles.stepInput} />
    <TouchableOpacity onPress={() => onChange((parseFloat(value||'0') + 0.5).toString())}><Text style={styles.stepBtn}>+</Text></TouchableOpacity>
  </View>
);

export const BulkSellScreen: React.FC = () => {
  const nav = useNavigation();
  const { customers } = useDelivery();
  const [autoNext, setAutoNext] = React.useState(true);
  const [morning, setMorning] = React.useState(true);
  const [selectAll, setSelectAll] = React.useState(false);
  const [qtyMap, setQtyMap] = React.useState<Record<string, string>>({}); // customerId -> liters string
  const [selectedIds, setSelectedIds] = React.useState<Record<string, boolean>>({});

  // Initialize quantities from daily entries for current time (morning/evening)
  React.useEffect(() => {
    const next: Record<string, string> = {};
    const sel: Record<string, boolean> = {};
    for (const c of customers) {
      // No default daily entries from mock; initialize to 0 liters
      next[c.id] = '0';
      sel[c.id] = selectAll; // keep select-all state consistent
    }
    setQtyMap(next);
    setSelectedIds(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morning, customers]);

  const toggleSelectAll = (val: boolean) => {
    setSelectAll(val);
    setSelectedIds((prev) => {
      const out: Record<string, boolean> = {};
      for (const c of customers) out[c.id] = val;
      return out;
    });
  };

  const setQty = (id: string, value: string) => {
    // sanitize numeric input
    const v = value.replace(/[^0-9.]/g, '');
    setQtyMap((m) => ({ ...m, [id]: v }));
  };

  const calcTotals = React.useMemo(() => {
    let liters = 0;
    let amount = 0;
    for (const c of customers) {
      if (!selectedIds[c.id]) continue;
      const l = parseFloat(qtyMap[c.id] || '0') || 0;
      liters += l;
      amount += litersToAmount(c.product, l);
    }
    return { liters, amount };
  }, [qtyMap, selectedIds, customers]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Bulk Sell" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Bulk Sell</Text>
        <View style={styles.autoNext}><Text style={{ marginRight: 8, color: Colors.text }}>Auto Next?</Text><Switch value={autoNext} onValueChange={setAutoNext} /></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={styles.rowGaps}>
          <PickerPill label="01" />
          <PickerPill label="January" />
          <PickerPill label="2023" />
        </View>
        <View style={styles.segment}>
          <SegmentButton label="Morning" active={morning} onPress={() => setMorning(true)} />
          <SegmentButton label="Evening" active={!morning} onPress={() => setMorning(false)} />
        </View>
        <View style={[styles.card, { padding: 12 }] }>
          <View style={styles.selectAllRow}>
            <Checkbox value={selectAll} onValueChange={toggleSelectAll} color={selectAll ? Colors.primary : undefined} />
            <Text style={{ marginLeft: 8, fontWeight: '600', color: Colors.text }}>Select all customer</Text>
          </View>
          {customers.map((c, idx) => {
            const liters = qtyMap[c.id] ?? '0';
            const amount = litersToAmount(c.product, parseFloat(liters || '0') || 0);
            const checked = !!selectedIds[c.id];
            return (
              <View key={c.id}>
                {!!idx && <View style={styles.divider} />}
                <View style={styles.sellRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox value={checked} onValueChange={(v) => setSelectedIds(s => ({ ...s, [c.id]: v }))} color={checked ? Colors.primary : undefined} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.link}>{c.name}</Text>
                      <Text style={styles.muted}>{c.product}: {formatINR(c.rate)}</Text>
                    </View>
                  </View>
                  <QtyStepper value={liters} onChange={(v) => setQty(c.id, v)} />
                  <Text style={styles.price}>{formatINR(amount)}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.totalBar}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Final Total</Text>
          <Text style={{ color: '#fff' }}>{calcTotals.liters.toFixed(1)} Liter</Text>
          <Text style={{ color: '#fff', fontWeight: '800' }}>{formatINR(calcTotals.amount)}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const SegmentButton: React.FC<{ label: string; active?: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const PickerPill: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.pill}><Text style={{ color: Colors.text }}>{label}</Text></View>
);

const styles = StyleSheet.create({
  topBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontWeight: '700', color: Colors.text },
  autoNext: { flexDirection: 'row', alignItems: 'center' },
  rowGaps: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  pill: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  segment: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: Colors.primary },
  segmentText: { color: Colors.text, fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 12 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sellRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  link: { color: Colors.primaryText, fontWeight: '600' },
  muted: { color: Colors.muted },
  price: { fontWeight: '700', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 8, overflow: 'hidden' },
  stepBtn: { width: 32, textAlign: 'center', fontWeight: '700', color: Colors.text },
  stepInput: { width: 48, textAlign: 'center', paddingVertical: 6, color: Colors.text },
  totalBar: { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
