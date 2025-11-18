import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  onPressMenu?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
};

export const HeaderBar: React.FC<Props> = ({ title, onPressMenu, showBack, onPressBack }) => {
  return (
    <SafeAreaView style={styles.safe} edges={['top','left','right']}>
      <View style={styles.container}>
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity onPress={onPressBack} accessibilityRole="button" style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onPressMenu} accessibilityRole="button" style={styles.iconBtn}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.brand} numberOfLines={1} ellipsizeMode="tail">Milk Karan</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.primary,
  },
  container: {
    height: 72,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  brand: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'left',
    maxWidth: '80%',
    marginLeft: 8,
  },
  iconBtn: { padding: 6 },
});
