import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, Alert } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900; // horizontal layout on desktop/tablets

  const handleSubscribe = (plan) => {
    Alert.alert('Subscribe', `Proceed to subscribe: ${plan}`);
  };

  const Card = ({ title, price, limit, features, icon, buttonText, onPress, onSupport }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={26} color="#01559d" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {price ? (
        <Text style={styles.price}>{price}</Text>
      ) : null}
      {limit ? (
        <Text style={styles.limit}>{limit}</Text>
      ) : null}
      {features?.length ? (
        <View style={styles.features}>
          {features.map((f, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#01559d" />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {buttonText ? (
        <>
          <TouchableOpacity style={styles.cta} onPress={onPress}>
            <Text style={styles.ctaText}>{buttonText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cta, styles.ctaSecondary]} onPress={onSupport}>
            <Text style={[styles.ctaText, { color: '#fff' }]}>Contact Support</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderBar title="Subscription" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Current Plan Card */}
        <Text style={styles.sectionTitle}>Current Plan</Text>
        <Card
          title="Free"
          price={null}
          limit="Limit: 30 Customers"
          features={[
            'Plan: Free',
            'Expiry: Lifetime',
            'Status: Active',
          ]}
          icon="ribbon-outline"
          buttonText="Upgrade Now"
          onPress={() => handleSubscribe('Upgrade')}
        />

        {/* Section 2: Subscription Options */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Choose a plan</Text>

        <View style={[styles.pricingRow, isWide ? styles.pricingRowWide : styles.pricingRowStacked]}>
          {/* Silver */}
          <View style={[styles.pricingCol, isWide ? styles.pricingColWide : styles.pricingColStacked]}>
            <Card
              title="🥈 Silver"
              price="₹599 / month"
              limit="Limit: 100 Customers"
              features={[
                'Manage customer list',
                'Daily sales entry',
                'Order reports',
                'Manual billing',
              ]}
              icon="medal-outline"
              buttonText="Subscribe Now"
              onPress={() => handleSubscribe('Silver')}
              onSupport={() => Alert.alert('Support', 'We will contact you shortly.')}
            />
          </View>

          {/* Gold */}
          <View style={[styles.pricingCol, isWide ? styles.pricingColWide : styles.pricingColStacked]}>
            <Card
              title="🥇 Gold"
              price="₹699 / month"
              limit="Limit: 300 Customers"
              features={[
                'Everything in Silver',
                'WhatsApp notification integration',
                'Export daily sales to Excel',
                'Priority support',
              ]}
              icon="trophy-outline"
              buttonText="Subscribe Now"
              onPress={() => handleSubscribe('Gold')}
              onSupport={() => Alert.alert('Support', 'We will contact you shortly.')}
            />
          </View>

          {/* Platinum */}
          <View style={[styles.pricingCol, isWide ? styles.pricingColWide : styles.pricingColStacked]}>
            <Card
              title="💎 Platinum"
              price="₹799 / month"
              limit="Unlimited Customers"
              features={[
                'All Gold features',
                'Auto-billing',
                'Delivery boy management',
                'Custom reports',
              ]}
              icon="diamond-outline"
              buttonText="Subscribe Now"
              onPress={() => handleSubscribe('Platinum')}
              onSupport={() => Alert.alert('Support', 'We will contact you shortly.')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {},
  headerTitle: {},
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 900,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    color: '#333',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginTop: 10,
  },
  limit: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  features: {
    marginTop: 12,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  cta: {
    backgroundColor: '#01559d',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  pricingRow: {
    width: '100%',
    marginTop: 8,
  },
  pricingRowWide: {
    flexDirection: 'row',
    gap: 12,
  },
  pricingRowStacked: {
    flexDirection: 'column',
  },
  pricingCol: {
    flex: 1,
  },
  pricingColWide: {
    maxWidth: '33.33%',
  },
  pricingColStacked: {
    width: '100%',
  },
});
