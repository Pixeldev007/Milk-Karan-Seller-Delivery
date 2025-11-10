import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../theme/colors';

type Props = {
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
};

export const SearchInput: React.FC<Props> = ({ placeholder = 'Search', value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.muted} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor={Colors.muted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
    marginHorizontal: 12,
  },
  input: { marginLeft: 8, flex: 1, color: Colors.text },
});
