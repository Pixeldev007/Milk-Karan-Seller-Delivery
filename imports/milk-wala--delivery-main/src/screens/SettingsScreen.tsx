import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const Item: React.FC<{ icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress?: () => void }>
  = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={20} color={Colors.text} />
      <Text style={styles.itemText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <HeaderBar title="Settings" onPressMenu={() => nav.dispatch(DrawerActions.openDrawer())} />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={styles.card}>
          <Item icon="person" label="Update Profile" onPress={() => {}} />
          <View style={styles.divider} />
          <Item icon="lock-closed" label="Change Password" onPress={() => {}} />
          <View style={styles.divider} />
          <Item icon="document-text" label="Terms And Conditions" onPress={() => {}} />
          <View style={styles.divider} />
          <Item icon="log-out" label="Logout" onPress={() => {}} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 14 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemText: { marginLeft: 10, color: Colors.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border },
});
