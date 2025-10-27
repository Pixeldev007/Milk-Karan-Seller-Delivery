import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';

// A shared container that centers content with a max width so screens look
// aligned on phones, tablets, and web. Use with `scroll` prop to enable ScrollView.
export default function ScreenContainer({ children, scroll = false, contentStyle, style, ...props }) {
  if (scroll) {
    return (
      <ScrollView contentContainerStyle={[styles.centered, contentStyle]} style={style} {...props}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    );
  }
  return (
    <View style={[styles.centered, style]} {...props}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    padding: 16,
    alignSelf: 'center',
    width: '100%',
  },
  inner: {
    width: '100%',
    maxWidth: 760,
  },
});
