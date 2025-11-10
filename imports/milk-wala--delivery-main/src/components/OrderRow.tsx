import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  price: string;
};

export const OrderRow: React.FC<Props> = ({ title, subtitle, meta, price }) => {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Ionicons name="ellipse" size={8} color={Colors.primary} style={{ marginTop: 7 }} />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
          {meta && <Text style={styles.meta}>{meta}</Text>}
        </View>
      </View>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  left: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, paddingRight: 12 },
  title: { fontWeight: '600', color: Colors.text },
  sub: { color: Colors.muted },
  meta: { color: Colors.muted, fontSize: 12 },
  price: { fontWeight: '700', color: Colors.text },
});
