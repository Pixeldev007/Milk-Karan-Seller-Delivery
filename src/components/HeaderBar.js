import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderBar({ title, navigation, right = null, backTo }) {
  const canGoBack = navigation?.canGoBack?.() || false;
  const onLeftPress = () => {
    if (canGoBack) {
      if (backTo) return navigation.navigate(backTo);
      return navigation.goBack();
    }
    return navigation?.openDrawer?.();
  };
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onLeftPress} accessibilityRole="button" accessibilityLabel={canGoBack ? 'Go back' : 'Open menu'}>
        <Ionicons name={canGoBack ? 'chevron-back' : 'menu'} size={26} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 26 }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: {
    flex: 1,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
});
