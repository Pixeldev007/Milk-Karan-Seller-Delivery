import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';

export type Day = { label: string; sub?: string; value: string };

type Props = {
  days: Day[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export const DayTabs: React.FC<Props> = ({ days, selectedIndex, onChange }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((d, i) => {
        const active = i === selectedIndex;
        return (
          <TouchableOpacity key={i} onPress={() => onChange(i)} style={[styles.tab, active && styles.activeTab]}
            accessibilityRole="button" accessibilityState={{ selected: active }}>
            <Text style={[styles.day, active && styles.activeDay]}>{d.label}</Text>
            {!!d.sub && <Text style={[styles.sub, active && styles.activeSub]}>{d.sub}</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 8 },
  tab: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  activeTab: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  day: { fontWeight: '600', color: Colors.text },
  sub: { fontSize: 12, color: Colors.muted },
  activeDay: { color: '#fff' },
  activeSub: { color: '#f0fdf4' },
});
