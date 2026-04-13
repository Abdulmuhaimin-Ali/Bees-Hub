import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppColorScheme } from "@/constants/theme";

const FEATURES = [
  { icon: "heart-outline", title: "View All Your Matches", text: "Unlock the full Matches tab and see every connection waiting for you in your hive." },
  { icon: "map-outline", title: "Curated Date Activities", text: "Get personalized activity ideas and fun local suggestions for your matches." },
  { icon: "lock-open-outline", title: "Unlock Full Profiles", text: "See richer member information and get a better sense of compatibility before you connect." },
  { icon: "flash-outline", title: "Boost Your Visibility", text: "Help your profile stand out more so more people can discover you faster." },
  { icon: "star-outline", title: "Premium Member Badge", text: "Show off your upgraded status with a premium badge on your account." },
];

export default function MembershipScreen() {
  const colors = useAppTheme();
  const styles = makeStyles(colors);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🐝 PREMIUM</Text>
        </View>
        <Text style={styles.title}>Upgrade Your Membership</Text>
        <Text style={styles.subtitle}>
          Get the full BeesHub experience with premium access designed for professionals looking for better matches and better date ideas.
        </Text>
        <View style={styles.priceBox}>
          <Text style={styles.price}>$5</Text>
          <Text style={styles.pricePer}>/ month</Text>
        </View>
        <Text style={styles.paymentNote}>Pay with Visa or Mastercard</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's included</Text>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <Ionicons name={feature.icon as any} size={22} color={colors.accent} />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Why upgrade?</Text>
        <Text style={styles.summaryText}>
          Premium members get access to the most valuable parts of BeesHub: matches, activity ideas, better visibility, and a stronger profile presence.
        </Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push("/checkout")}>
          <Ionicons name="card-outline" size={18} color="#fff" />
          <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function makeStyles(c: AppColorScheme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: c.page },
    content: { padding: 16, paddingTop: 20, paddingBottom: 32 },
    topRow: { marginBottom: 12 },
    backButton: {
      width: 42, height: 42, borderRadius: 21, backgroundColor: c.card,
      alignItems: "center", justifyContent: "center",
      shadowColor: c.shadow, shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    },
    heroCard: {
      backgroundColor: c.card, borderRadius: 20, padding: 22, marginBottom: 14,
      shadowColor: c.shadow, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
      alignItems: "center",
    },
    badge: { backgroundColor: c.accentLight, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14 },
    badgeText: { color: c.accentText, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
    title: { fontSize: 25, fontWeight: "800", color: c.textPrimary, textAlign: "center", marginBottom: 8 },
    subtitle: { fontSize: 14, color: c.textSecondary, textAlign: "center", lineHeight: 21, marginBottom: 18 },
    priceBox: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
    price: { fontSize: 38, fontWeight: "800", color: c.accent, lineHeight: 42 },
    pricePer: { fontSize: 16, color: c.textSecondary, marginLeft: 4, marginBottom: 4 },
    paymentNote: { fontSize: 13, color: c.accentText, fontWeight: "600" },
    section: { marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: c.textPrimary, marginBottom: 10 },
    featureCard: {
      flexDirection: "row", backgroundColor: c.card, borderRadius: 16, padding: 14, marginBottom: 10,
      shadowColor: c.shadow, shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    },
    featureIconWrap: {
      width: 42, height: 42, borderRadius: 21, backgroundColor: c.accentLight,
      alignItems: "center", justifyContent: "center", marginRight: 12,
    },
    featureTextWrap: { flex: 1 },
    featureTitle: { fontSize: 15, fontWeight: "700", color: c.textPrimary, marginBottom: 4 },
    featureText: { fontSize: 13, color: c.textSecondary, lineHeight: 19 },
    summaryCard: {
      backgroundColor: c.card, borderRadius: 20, padding: 18,
      shadowColor: c.shadow, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    },
    summaryTitle: { fontSize: 18, fontWeight: "800", color: c.textPrimary, marginBottom: 8 },
    summaryText: { fontSize: 14, color: c.textSecondary, lineHeight: 21, marginBottom: 18 },
    checkoutButton: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      backgroundColor: c.accent, borderRadius: 14, paddingVertical: 14,
    },
    checkoutButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });
}
