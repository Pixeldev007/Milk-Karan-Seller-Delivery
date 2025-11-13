import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Switch, Alert } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDelivery } from '../context/DeliveryContext';
import { setDeliveryStatus } from '../services/deliveryApi';
import { useAuth } from '../context/AuthContext';

// No date/shift UI; only show assigned customers.

export const MyPickupScreen: React.FC = () => {
  const nav = useNavigation();
  const { assignments, loading, refresh, getCustomerById, configured, connected, toggleDelivered } = useDelivery();
  const { agent: deliveryAgent } = useAuth();

  if (!deliveryAgent) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <HeaderBar title="My Pickup" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      {!configured || !connected ? (
        <View style={{ backgroundColor: '#fff3cd', borderColor: '#ffeeba', borderWidth: 1, padding: 10 }}>
          <Text style={{ color: '#856404', fontWeight: '600' }}>
            Backend not connected. Check Supabase URL/Key and pull to refresh.
          </Text>
        </View>
      ) : null}
        <View style={{ padding: 16 }}>
          <Text style={{ color: Colors.text, fontWeight: '700', marginBottom: 6 }}>No delivery profile</Text>
          <Text style={{ color: Colors.muted }}>Login as a delivery boy to view your assigned pickups.</Text>
        </View>
      </View>
    );
  }

  // No local state for date/shift/actions

  // No assign form; assignments are created by seller. This page only shows and updates delivery status.

  // Refresh when screen gains focus to fetch latest server data
  useFocusEffect(
    React.useCallback(() => {
      refresh();
      return () => {};
    }, [refresh])
  );

  const agentAssignments = React.useMemo(() => {
    const filtered = assignments.filter((a) => (deliveryAgent?.id ? a.deliveryAgentId === deliveryAgent.id : true));
    const pickByCustomer = new Map<string, typeof assignments[number]>();
    for (const a of filtered) {
      const cust = getCustomerById(a.customerId);
      const preferred = cust?.preferredShift as ('morning' | 'evening' | undefined);
      const existing = pickByCustomer.get(a.customerId);
      if (!existing) {
        pickByCustomer.set(a.customerId, a);
        continue;
      }
      // If seller set a preferred shift, keep the one matching it
      if (preferred) {
        if (a.shift === preferred && existing.shift !== preferred) {
          pickByCustomer.set(a.customerId, a);
          continue;
        }
        if (existing.shift === preferred && a.shift !== preferred) {
          continue;
        }
      }
      // Otherwise prefer morning over evening
      if (a.shift === 'morning' && existing.shift === 'evening') {
        pickByCustomer.set(a.customerId, a);
      }
    }
    const arr = Array.from(pickByCustomer.values());
    arr.sort((a, b) => {
      const customerA = getCustomerById(a.customerId);
      const customerB = getCustomerById(b.customerId);
      return (customerA?.name || '').localeCompare(customerB?.name || '');
    });
    return arr;
  }, [assignments, deliveryAgent?.id, getCustomerById]);
  
  // Only display customer details.

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="My Pickup" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      {!configured || !connected ? (
        <View style={{ backgroundColor: '#fff3cd', borderColor: '#ffeeba', borderWidth: 1, padding: 10 }}>
          <Text style={{ color: '#856404', fontWeight: '600' }}>
            Backend not connected. Check Supabase URL/Key and pull to refresh.
          </Text>
        </View>
      ) : null}
      <View style={{ height: 8 }} />
      <ScrollView
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={!!loading} onRefresh={refresh} />}
      >
        {loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading assignments...</Text>
            <Text style={styles.emptySub}>Fetching from server</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Customers</Text>
        {agentAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No assignments</Text>
            <Text style={styles.emptySub}>No customers have been assigned to you.</Text>
          </View>
        ) : (
          agentAssignments.map((assignment) => {
            const customer = getCustomerById(assignment.customerId);
            const planLiters = (() => {
              const planText = String(customer?.plan || '');
              // Accept '1', '1 L', '1L', '1.0 litre', etc.
              const m = planText.match(/([0-9]+(?:\.[0-9]+)?)/);
              return m ? Number(m[1]) : 0;
            })();
            const litersToUse = assignment.liters && assignment.liters > 0 ? assignment.liters : planLiters;
            const todayLocal = (() => {
              const d = new Date();
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const da = String(d.getDate()).padStart(2, '0');
              return `${y}-${m}-${da}`;
            })();
            return (
              <View key={`${assignment.id}-${assignment.shift || 'morning'}`} style={styles.assignmentCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignmentName}>{customer?.name ?? 'Unknown Customer'}</Text>
                  {!!customer?.phone && <Text style={styles.assignmentMeta}>{customer.phone}</Text>}
                  {!!customer?.address && <Text style={styles.assignmentMeta}>{customer.address}</Text>}
                  {!!customer?.product && <Text style={styles.assignmentMeta}>Product: {customer.product}</Text>}
                  <Text style={styles.assignmentMeta}>
                    Shift: {(assignment.shift || 'morning') === 'evening' ? 'Evening' : 'Morning'}
                  </Text>
                  {!!customer?.plan && <Text style={styles.assignmentMeta}>Plan: {customer.plan}</Text>}
                </View>
                <View style={styles.switchWrap}>
                  <Text style={styles.switchLabel}>Delivered</Text>
                  <Switch
                    value={assignment.delivered}
                    onValueChange={async (value) => {
                      try {
                        // Always provide a non-null, numeric liters value
                        const qty = value
                          ? (Number.isFinite(litersToUse) && litersToUse > 0 ? litersToUse : 0)
                          : (Number.isFinite(assignment.liters) && (assignment.liters as number) > 0
                              ? (assignment.liters as number)
                              : (Number.isFinite(litersToUse) ? litersToUse : 0));
                        // Optimistic update first so the UI switch stays in sync immediately
                        toggleDelivered(assignment.id, assignment.shift || 'morning', value);
                        await setDeliveryStatus(
                          assignment.id,
                          todayLocal,
                          assignment.shift || 'morning',
                          value,
                          qty,
                        );
                        Alert.alert(
                          value ? 'Marked Delivered' : 'Marked Pending',
                          `${customer?.name || 'Customer'} • ${assignment.shift || 'morning'} • ${qty} L`
                        );
                        // Light refresh after confirmation to pick up any server-side changes
                        await refresh();
                      } catch (e: any) {
                        Alert.alert('Update failed', e?.message || 'Could not update delivery status.');
                      }
                    }}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dateText: { textAlign: 'center', paddingBottom: 12, color: Colors.text, fontWeight: '600' },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: Colors.primary },
  segmentText: { color: Colors.text, fontWeight: '600' },
  segmentTextActive: { color: Colors.primaryText },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  filterRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  filterLabel: { color: Colors.muted, fontWeight: '600', marginBottom: 6 },
  filterPicker: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#f9fafb',
  },
  summaryFooterText: { color: Colors.text, fontWeight: '600' },
  sectionTitle: { color: Colors.text, fontWeight: '700', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  inputLabel: { color: Colors.muted, fontWeight: '600', marginBottom: 4 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  cta: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  ctaText: { color: Colors.primaryText, fontWeight: '700' },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
  },
  emptyTitle: { fontWeight: '700', color: Colors.text, marginBottom: 4 },
  emptySub: { color: Colors.muted, textAlign: 'center' },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentName: { color: Colors.text, fontWeight: '700' },
  assignmentMeta: { color: Colors.muted, marginTop: 2 },
  switchWrap: { alignItems: 'center' },
  switchLabel: { color: Colors.muted, fontSize: 12, marginBottom: 4 },
  tableRow: { flexDirection: 'row' },
  tableHead: { backgroundColor: '#f3f4f6' },
  cell: { flex: 1, padding: 10, borderRightWidth: 1, borderColor: Colors.border, color: Colors.text },
  cellHead: { fontWeight: '700' },
  notes: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 10,
    minHeight: 120,
    textAlignVertical: 'top',
    color: Colors.text,
    marginBottom: 16,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  modalTitle: { color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  modalLabel: { color: Colors.muted, fontWeight: '600', marginTop: 8, marginBottom: 4 },
});
