import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawerContent({ navigation }) {
  const { user, signOut } = useAuth();

  const profile = useMemo(() => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';
    const email = user?.email ?? '';
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'MW';

    return {
      fullName,
      email,
      initials,
    };
  }, [user]);

  const menuItems = [
    { id: 1, title: 'Dashboard', icon: 'home-outline', route: 'Dashboard' },
    { id: 3, title: 'My Subscription', icon: 'ribbon-outline', route: 'Subscription' },
    { id: 8, title: 'Milk Report', icon: 'document-text-outline', route: 'Report' },
    { id: 9, title: 'Settings', icon: 'settings-outline', route: 'Settings' },
    { id: 7, title: 'Logout', icon: 'log-out-outline', route: 'Logout' },
  ];

  const socialIcons = [
    { id: 1, icon: 'logo-instagram', color: '#E1306C' },
    { id: 2, icon: 'logo-youtube', color: '#FF0000' },
    { id: 3, icon: 'share-social', color: '#4DD0E1' },
    { id: 4, icon: 'moon', color: '#4DD0E1' },
    { id: 5, icon: 'logo-whatsapp', color: '#25D366' },
  ];

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.fullName}</Text>
          {!!profile.email && <Text style={styles.profileEmail}>{profile.email}</Text>}
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={async () => {
              if (item.route === 'Logout') {
                await signOut();
                return;
              }

              if (['Dashboard', 'Subscription', 'Report', 'Settings'].includes(item.route)) {
                navigation.navigate(item.route);
              }
            }}
          >
            <Ionicons name={item.icon} size={24} color="#66BB6A" />
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#66BB6A" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Free account limited to 30 customers</Text>
        
        {/* Language Selector */}
        <View style={styles.languageSelector}>
          <Ionicons name="language" size={24} color="#66BB6A" />
          <View style={styles.languageButton}>
            <Text style={styles.languageText}>English</Text>
            <Ionicons name="chevron-down" size={20} color="#66BB6A" />
          </View>
        </View>

        {/* Social Icons */}
        <View style={styles.socialContainer}>
          {socialIcons.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.socialIcon, { backgroundColor: '#66BB6A' }]}>
              <Ionicons name={item.icon} size={24} color="#fff" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    backgroundColor: '#66BB6A',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#66BB6A',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#E8F5E9',
    marginBottom: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
