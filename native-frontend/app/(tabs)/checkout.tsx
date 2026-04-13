import { getProfile, subscribe, type Profile } from "@/hooks/SignInApi";
import { getStoredUser } from "@/hooks/userStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppColorScheme } from "@/constants/theme";

export default function CheckoutScreen() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    fullName: "", email: "", city: "", province: "", plan: "BeesHub Premium", price: "$5/month",
  });
  const [paymentInfo, setPaymentInfo] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
  const colors = useAppTheme();
  const styles = makeStyles(colors);

  useEffect(() => {
    (async () => {
      try {
        const user = await getStoredUser();
        if (!user) { router.replace("/signin"); return; }
        let fullName = "", city = "", province = "";
        try {
          const p: Profile = await getProfile(user.id);
          fullName = [p.first_name, p.last_name].filter(Boolean).join(" ") || "";
          city = p.city ?? "";
          province = p.province ?? "";
        } catch { /* leave blank */ }
        setUserInfo({ fullName, email: user.email ?? "", city, province, plan: "BeesHub Premium", price: "$5/month" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCheckout = async () => {
    if (!paymentInfo.cardName.trim() || !paymentInfo.cardNumber.trim() || !paymentInfo.expiry.trim() || !paymentInfo.cvv.trim()) {
      Alert.alert("Missing Info", "Please fill in all payment fields."); return;
    }
    try {
      await subscribe();
      Alert.alert("Payment Successful", "Your BeesHub Premium membership has been activated.", [{ text: "OK", onPress: () => router.replace("/profile") }]);
    } catch (e: any) {
      Alert.alert("Payment Failed", e.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SECURE CHECKOUT</Text>
        </View>
        <Text style={styles.title}>Complete Your Upgrade</Text>
        <Text style={styles.subtitle}>Review your membership details and enter your payment information below.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plan</Text>
          <Text style={styles.summaryValue}>{userInfo.plan}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price</Text>
          <Text style={styles.summaryValue}>{userInfo.price}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Methods</Text>
          <Text style={styles.summaryValue}>Visa / Mastercard</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{userInfo.fullName || "Not provided"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userInfo.email || "Not provided"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{[userInfo.city, userInfo.province].filter(Boolean).join(", ") || "Not provided"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <TextInput style={styles.input} placeholder="Cardholder Name" placeholderTextColor={colors.textMuted} value={paymentInfo.cardName} onChangeText={(v) => setPaymentInfo((prev) => ({ ...prev, cardName: v }))} />
        <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={paymentInfo.cardNumber} onChangeText={(v) => setPaymentInfo((prev) => ({ ...prev, cardNumber: v }))} />
        <View style={styles.rowInputs}>
          <TextInput style={[styles.input, styles.halfInput]} placeholder="MM/YY" placeholderTextColor={colors.textMuted} value={paymentInfo.expiry} onChangeText={(v) => setPaymentInfo((prev) => ({ ...prev, expiry: v }))} />
          <TextInput style={[styles.input, styles.halfInput]} placeholder="CVV" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={paymentInfo.cvv} onChangeText={(v) => setPaymentInfo((prev) => ({ ...prev, cvv: v }))} />
        </View>
        <Text style={styles.smallNote}>This is a demo.</Text>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handleCheckout}>
        <Ionicons name="lock-closed-outline" size={18} color="#fff" />
        <Text style={styles.payButtonText}>Confirm Payment</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function makeStyles(c: AppColorScheme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: c.page },
    content: { padding: 16, paddingTop: 20, paddingBottom: 32 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.page },
    loadingText: { fontSize: 16, color: c.textSecondary, fontWeight: "600" },
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
    subtitle: { fontSize: 14, color: c.textSecondary, textAlign: "center", lineHeight: 21 },
    section: {
      backgroundColor: c.card, borderRadius: 18, padding: 18, marginBottom: 14,
      shadowColor: c.shadow, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    },
    sectionTitle: { fontSize: 17, fontWeight: "800", color: c.textPrimary, marginBottom: 14 },
    summaryRow: {
      flexDirection: "row", justifyContent: "space-between", paddingVertical: 8,
      borderBottomWidth: 1, borderBottomColor: c.borderLight,
    },
    summaryLabel: { fontSize: 14, color: c.textSecondary },
    summaryValue: { fontSize: 14, color: c.textPrimary, fontWeight: "700" },
    infoRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.borderLight },
    infoLabel: { fontSize: 13, color: c.textSecondary, marginBottom: 4 },
    infoValue: { fontSize: 14, color: c.textPrimary, fontWeight: "600" },
    input: {
      borderWidth: 1, borderColor: c.border, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
      color: c.textPrimary, backgroundColor: c.inputBg, marginBottom: 12,
    },
    rowInputs: { flexDirection: "row", gap: 10 },
    halfInput: { flex: 1 },
    smallNote: { fontSize: 12, color: c.accentText, marginTop: 4, textAlign: "center" },
    payButton: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      backgroundColor: c.accent, borderRadius: 14, paddingVertical: 15,
      shadowColor: c.accent, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    payButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  });
}
