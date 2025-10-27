import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// On web, the drawer is permanent with width ~280, so the content area is narrower than the window
const DRAWER_WIDTH_WEB = 280;
const GRID_GUTTER = 16; // matches paddingHorizontal in DashboardScreen.menuGrid
const CARD_MARGIN = 8;  // matches styles.card margin

const availableWidth = Platform.OS === 'web' ? Math.max(320, width - DRAWER_WIDTH_WEB) : width;
const isDesktop = availableWidth >= 768;
const cols = isDesktop ? 4 : 2;

// Total horizontal non-card width = left/right grid padding + outer card margins + gaps between cards
// grid padding: 2 * GRID_GUTTER
// outer margins: CARD_MARGIN * 2 (leftmost + rightmost)
// gaps between cards: (cols - 1) * (CARD_MARGIN * 2) because each adjacent card contributes its margin
const totalNonCard = (GRID_GUTTER * 2) + (CARD_MARGIN * 2) + ((cols - 1) * (CARD_MARGIN * 2));
const cardWidth = (availableWidth - totalNonCard) / cols;

export default function MenuCard({ title, icon, color, badge, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={40} color="#fff" />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 150,
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#D2691E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
