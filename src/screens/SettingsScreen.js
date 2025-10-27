import React from 'react';
import { View, Text, StyleSheet, Platform, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const items = [
    { id: 'updateProfile', label: 'Update Profile ✏️', icon: 'person-circle-outline', navigate: 'UpdateProfile' },
    { id: 'businessProfile', label: 'Business Profile 💼', icon: 'briefcase-outline', navigate: 'BusinessProfile' },
    { id: 'changePassword', label: 'Change Password 🔒', icon: 'lock-closed-outline', navigate: 'ChangePassword' },
    { id: 'gst', label: 'GST 💳', icon: 'card-outline', navigate: 'GST' },
    { id: 'personalSettings', label: 'Personal Settings ⚙️', icon: 'settings-outline', navigate: 'PersonalSettings' },
    { id: 'paymentSetting', label: 'Payment Setting 🔗', icon: 'link-outline', navigate: 'PaymentSetting' },
    { id: 'uploadLogo', label: 'Upload Logo 🖼️', icon: 'image-outline', navigate: 'UploadLogo' },
    { id: 'terms', label: 'Terms and Conditions 📜', icon: 'document-text-outline', navigate: 'TermsAndConditions' },
    { id: 'privacy', label: 'Privacy Policy 🔒', icon: 'shield-checkmark-outline', navigate: 'PrivacyPolicy' },
    { id: 'deleteAccount', label: 'Delete My Account 🧍‍♂️', icon: 'person-remove-outline', danger: true, navigate: 'DeleteAccount' },
    { id: 'notificationSettings', label: 'Notification Settings 🔔', icon: 'notifications-outline', navigate: 'NotificationSettings' },
    { id: 'invoice', label: 'Invoice 📄', icon: 'receipt-outline', navigate: 'Invoice' },
  ];

  const onPressItem = (item) => {
    if (item.navigate) return navigation.navigate(item.navigate);
    Alert.alert('Coming Soon', `${item.label}`);
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Settings" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.section}>
        <View style={styles.row}> 
          <Text style={styles.label}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        {items.map((it) => (
          <TouchableOpacity key={it.id} style={[styles.optionRow, it.danger && { borderColor: '#ffdddd' }]} onPress={() => onPressItem(it)}>
            <View style={styles.optionLeft}>
              <Ionicons name={it.icon} size={20} color={it.danger ? '#D32F2F' : '#66BB6A'} />
              <Text style={[styles.optionLabel, it.danger && { color: '#D32F2F' }]}>{it.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {},
  headerTitle: {},
  section: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30, alignSelf: 'center', width: '100%', maxWidth: 900 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 16, color: '#333', fontWeight: '600' },
  optionRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionLabel: { fontSize: 16, color: '#333', fontWeight: '600' },
});
