import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { supabase } from '../lib/supabase';
import { requireUser } from '../lib/session';

function toYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const DELIVERY_SALARY_PERCENT = 0.1; // 10% of monthly income as example app-related cost

export default function ReportScreen() {
  const [activeTab, setActiveTab] = useState('Daily'); // Daily | Monthly
  const [anchorDate, setAnchorDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [dailyMilk, setDailyMilk] = useState(0);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [monthlyMilk, setMonthlyMilk] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  const range = useMemo(() => {
    const base = new Date(anchorDate);
    base.setHours(0, 0, 0, 0);

    if (activeTab === 'Daily') {
      const from = base;
      const to = base;
      return { from, to };
    }

    const from = new Date(base.getFullYear(), base.getMonth(), 1);
    const to = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { from, to };
  }, [activeTab, anchorDate]);

  const monthlySalary = useMemo(() => {
    return monthlyIncome * DELIVERY_SALARY_PERCENT;
  }, [monthlyIncome]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const user = await requireUser();

        const dayKey = toYMD(range.from);
        const monthFromKey = toYMD(new Date(range.from.getFullYear(), range.from.getMonth(), 1));
        const monthToKey = toYMD(new Date(range.from.getFullYear(), range.from.getMonth() + 1, 0));

        const [dailyDeliveriesRes, monthlyDeliveriesRes, dailyPaymentsRes, monthlyPaymentsRes] = await Promise.all([
          supabase
            .from('daily_deliveries')
            .select('quantity, status, delivery_date')
            .eq('owner_id', user.id)
            .eq('status', 'Delivered')
            .eq('delivery_date', dayKey),
          supabase
            .from('daily_deliveries')
            .select('quantity, status, delivery_date')
            .eq('owner_id', user.id)
            .eq('status', 'Delivered')
            .gte('delivery_date', monthFromKey)
            .lte('delivery_date', monthToKey),
          supabase
            .from('payments')
            .select('amount, payment_date')
            .eq('owner_id', user.id)
            .eq('payment_date', dayKey),
          supabase
            .from('payments')
            .select('amount, payment_date')
            .eq('owner_id', user.id)
            .gte('payment_date', monthFromKey)
            .lte('payment_date', monthToKey),
        ]);

        if (!active) return;

        if (dailyDeliveriesRes.error) throw dailyDeliveriesRes.error;
        if (monthlyDeliveriesRes.error) throw monthlyDeliveriesRes.error;
        if (dailyPaymentsRes.error) throw dailyPaymentsRes.error;
        if (monthlyPaymentsRes.error) throw monthlyPaymentsRes.error;

        const dailyMilkSum = (dailyDeliveriesRes.data || []).reduce(
          (sum, row) => sum + Number(row.quantity || 0),
          0,
        );
        const monthlyMilkSum = (monthlyDeliveriesRes.data || []).reduce(
          (sum, row) => sum + Number(row.quantity || 0),
          0,
        );

        const dailyIncomeSum = (dailyPaymentsRes.data || []).reduce(
          (sum, row) => sum + Number(row.amount || 0),
          0,
        );
        const monthlyIncomeSum = (monthlyPaymentsRes.data || []).reduce(
          (sum, row) => sum + Number(row.amount || 0),
          0,
        );

        setDailyMilk(dailyMilkSum);
        setMonthlyMilk(monthlyMilkSum);
        setDailyIncome(dailyIncomeSum);
        setMonthlyIncome(monthlyIncomeSum);
      } catch (e) {
        Alert.alert('Error', e.message || 'Failed to load report data.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [range.from]);

  const shiftAnchor = (delta) => {
    if (activeTab === 'Daily') setAnchorDate((d) => addDays(d, delta));
    else setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, d.getDate()));
  };

  const onExportPDF = async () => {
    try {
      const dayLabel = toYMD(range.from);
      const monthLabel = `${range.from.getFullYear()}-${String(
        range.from.getMonth() + 1,
      ).padStart(2, '0')}`;

      const html = `
        <html>
          <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px;">
            <h1>Milk Karan - Report</h1>
            <h2>Daily (${dayLabel})</h2>
            <p>Total Milk: <strong>${dailyMilk.toFixed(2)} L</strong></p>
            <p>Income: <strong>₹ ${dailyIncome.toFixed(2)}</strong></p>
            <h2>Monthly (${monthLabel})</h2>
            <p>Total Milk: <strong>${monthlyMilk.toFixed(2)} L</strong></p>
            <p>Total Income: <strong>₹ ${monthlyIncome.toFixed(2)}</strong></p>
            <p>Delivery Salary (estimate): <strong>₹ ${monthlySalary.toFixed(2)}</strong></p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert('PDF generated', `Saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Export PDF failed', e.message || 'Unable to export PDF.');
    }
  };

  const onExportExcel = async () => {
    try {
      const dayLabel = toYMD(range.from);
      const monthLabel = `${range.from.getFullYear()}-${String(
        range.from.getMonth() + 1,
      ).padStart(2, '0')}`;

      const rows = [
        ['Type', 'Period', 'TotalMilkL', 'Income', 'Salary'],
        ['Daily', dayLabel, dailyMilk.toFixed(2), dailyIncome.toFixed(2), ''],
        [
          'Monthly',
          monthLabel,
          monthlyMilk.toFixed(2),
          monthlyIncome.toFixed(2),
          monthlySalary.toFixed(2),
        ],
      ];

      const csv = rows
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const fileUri = `${FileSystem.cacheDirectory}milk-report.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share Excel Report',
        });
      } else {
        Alert.alert('CSV generated', `Saved to: ${fileUri}`);
      }
    } catch (e) {
      Alert.alert('Export Excel failed', e.message || 'Unable to export Excel.');
    }
  };

  const tabButton = (tab) => (
    <TouchableOpacity
      key={tab}
      onPress={() => setActiveTab(tab)}
      style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
    </TouchableOpacity>
  );

  const anchorLabel = useMemo(() => {
    if (activeTab === 'Daily') {
      return `Daily: ${toYMD(range.from)}`;
    }
    const from = new Date(range.from.getFullYear(), range.from.getMonth(), 1);
    const to = new Date(range.from.getFullYear(), range.from.getMonth() + 1, 0);
    return `Monthly: ${toYMD(from)} → ${toYMD(to)}`;
  }, [activeTab, range.from]);

  const cardValues = useMemo(() => {
    if (activeTab === 'Daily') {
      return {
        primary: {
          label: 'Total Milk Sold (Today)',
          value: `${dailyMilk.toFixed(2)} L`,
          color: '#01559d',
        },
        secondary: {
          label: 'Income (Today)',
          value: `₹ ${dailyIncome.toFixed(2)}`,
          color: '#01559d',
        },
        tertiary: null,
      };
    }
    return {
      primary: {
        label: 'Total Milk Sold (Month)',
        value: `${monthlyMilk.toFixed(2)} L`,
        color: '#01559d',
      },
      secondary: {
        label: 'Total Income (Month)',
        value: `₹ ${monthlyIncome.toFixed(2)}`,
        color: '#01559d',
      },
      tertiary: {
        label: 'Delivery Salary (Month)',
        value: `₹ ${monthlySalary.toFixed(2)}`,
        color: '#B26A00',
      },
    };
  }, [activeTab, dailyMilk, dailyIncome, monthlyMilk, monthlyIncome, monthlySalary]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScreenContainer scroll contentStyle={{ paddingBottom: 40 }}>
        <View style={styles.tabs}>{['Daily', 'Monthly'].map(tabButton)}</View>

        <View style={styles.anchorRow}>
          <TouchableOpacity
            style={styles.anchorBtn}
            onPress={() => shiftAnchor(-1)}
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={18} color="#01559d" />
          </TouchableOpacity>
          <Text style={styles.anchorText}>{anchorLabel}</Text>
          <TouchableOpacity
            style={styles.anchorBtn}
            onPress={() => shiftAnchor(1)}
            disabled={loading}
          >
            <Ionicons name="chevron-forward" size={18} color="#01559d" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{cardValues.primary.label}</Text>
            <Text style={[styles.cardValue, { color: cardValues.primary.color }]}>
              {cardValues.primary.value}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{cardValues.secondary.label}</Text>
            <Text style={[styles.cardValue, { color: cardValues.secondary.color }]}>
              {cardValues.secondary.value}
            </Text>
          </View>
          {cardValues.tertiary && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>{cardValues.tertiary.label}</Text>
              <Text style={[styles.cardValue, { color: cardValues.tertiary.color }]}>
                {cardValues.tertiary.value}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.exportRow}>
          <TouchableOpacity
            style={[styles.exportBtn, styles.pdfBtn]}
            onPress={onExportPDF}
            disabled={loading}
          >
            <Ionicons name="document-outline" size={18} color="#01559d" />
            <Text style={[styles.exportText, { color: '#01559d' }]}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, styles.xlsBtn]}
            onPress={onExportExcel}
            disabled={loading}
          >
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={[styles.exportText, { color: '#fff' }]}>Export Excel</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {
    backgroundColor: '#01559d',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  tabBtnActive: { backgroundColor: '#FFFFFF', borderColor: '#01559d' },
  tabText: { color: '#555', fontWeight: '700' },
  tabTextActive: { color: '#01559d' },
  anchorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  anchorBtn: { padding: 8, borderRadius: 8, backgroundColor: '#FFFFFF' },
  anchorText: { fontWeight: '700', color: '#333' },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
  },
  cardLabel: { color: '#666', fontWeight: '600' },
  cardValue: { marginTop: 8, fontSize: 18, fontWeight: '800' },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  pdfBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#01559d' },
  xlsBtn: { backgroundColor: '#25D366' },
  exportText: { fontWeight: '700' },
  note: { color: '#888', marginTop: 16 },
});
