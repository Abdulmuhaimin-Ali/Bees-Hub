import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllProfiles, type Profile } from "../../hooks/SignInApi";
import { getStoredUser } from "../../hooks/userStore";
import { useAppTheme } from "../../hooks/useAppTheme";
import type { AppColorScheme } from "../../constants/theme";

const GRADIENTS = ["#f59e0b", "#8b5cf6", "#06b6d4", "#10b981", "#f43f5e"];

function getInitials(p: Profile) {
  const first = p.first_name?.[0] ?? "";
  const last = p.last_name?.[0] ?? "";
  return (first + last).toUpperCase() || p.email[0].toUpperCase();
}

function getAge(dob?: string) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

interface MatchProfile {
  id: string;
  name: string;
  age: number | null;
  location: string;
  occupation: string;
  bio: string;
  interests: string[];
  compatibility: number;
  initials: string;
  color: string;
}

function toMatchProfile(p: Profile, index: number): MatchProfile {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
  const location = [p.city, p.province].filter(Boolean).join(", ");
  const occupation = [p.job_title, p.employer].filter(Boolean).join(" at ");
  const interests = p.interests ? p.interests.split(",").map((s) => s.trim()) : [];
  return {
    id: p.user_id,
    name,
    age: getAge(p.date_of_birth),
    location: location || "Unknown",
    occupation: occupation || "Not specified",
    bio: p.bio || "",
    interests,
    compatibility: Math.floor(Math.random() * 20 + 80),
    initials: getInitials(p),
    color: GRADIENTS[index % GRADIENTS.length],
  };
}

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useAppTheme();
  const styles = makeStyles(colors);

  useEffect(() => {
    getStoredUser().then((user) => {
      getAllProfiles()
        .then((data) => {
          const others = user ? data.filter((p) => p.user_id !== user.id) : data;
          setProfiles(others.map(toMatchProfile));
        })
        .catch((err) => console.error("Failed to load profiles:", err))
        .finally(() => setLoading(false));
    });
  }, []);

  const handleSwipe = () => {
    setProfiles((prev) => prev.slice(1));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const currentProfile = profiles[0];

  if (!currentProfile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🐝</Text>
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptySubtitle}>Check back later for new matches!</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find your perfect match</Text>
      </View>

      <View style={styles.cardStack}>
        {profiles[1] && (
          <View style={[styles.card, styles.nextCard]}>
            <View style={[styles.cardAvatar, { backgroundColor: profiles[1].color }]}>
              <Text style={styles.cardAvatarText}>{profiles[1].initials}</Text>
            </View>
          </View>
        )}

        <View style={[styles.card, styles.currentCard]}>
          <View style={[styles.cardAvatar, { backgroundColor: currentProfile.color }]}>
            <Text style={styles.cardAvatarText}>{currentProfile.initials}</Text>
          </View>
          <ScrollView style={styles.cardBody} showsVerticalScrollIndicator={false}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>
                {currentProfile.name}{currentProfile.age ? `, ${currentProfile.age}` : ""}
              </Text>
              <View style={styles.compatBadge}>
                <Ionicons name="sparkles" size={13} color="#b45309" />
                <Text style={styles.compatText}>{currentProfile.compatibility}%</Text>
              </View>
            </View>
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-sharp" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{currentProfile.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="briefcase" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{currentProfile.occupation}</Text>
              </View>
            </View>
            <Text style={styles.cardBio}>{currentProfile.bio}</Text>
            <View style={styles.cardInterests}>
              {currentProfile.interests.map((i) => (
                <View key={i} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{i}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={handleSwipe}>
          <Ionicons name="close" size={30} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={handleSwipe}>
          <Ionicons name="heart" size={28} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(c: AppColorScheme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: c.page },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.page },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 20, fontWeight: "bold", color: c.textPrimary, marginBottom: 6 },
    emptySubtitle: { fontSize: 14, color: c.textSecondary },
    header: { alignItems: "center", paddingTop: 60, paddingBottom: 12 },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: c.textPrimary },
    headerSubtitle: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
    cardStack: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
    card: {
      width: "100%",
      backgroundColor: c.card,
      borderRadius: 20,
      shadowColor: c.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      overflow: "hidden",
    },
    nextCard: { position: "absolute", top: 10, left: 30, right: 30, height: 200, opacity: 0.7, transform: [{ scale: 0.95 }] },
    currentCard: { maxHeight: 480 },
    cardAvatar: { height: 180, alignItems: "center", justifyContent: "center" },
    cardAvatarText: { fontSize: 52, fontWeight: "bold", color: "#fff" },
    cardBody: { padding: 16 },
    cardNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    cardName: { fontSize: 18, fontWeight: "bold", color: c.textPrimary, flex: 1 },
    compatBadge: { flexDirection: "row", alignItems: "center", backgroundColor: c.accentLight, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, gap: 3 },
    compatText: { fontSize: 12, fontWeight: "bold", color: "#b45309" },
    cardMeta: { gap: 4, marginBottom: 10 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 13, color: c.textSecondary },
    cardBio: { fontSize: 13, color: c.textPrimary, lineHeight: 19, marginBottom: 10 },
    cardInterests: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
    interestTag: { backgroundColor: c.inputBg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    interestTagText: { fontSize: 12, color: c.textPrimary },
    actionButtons: { flexDirection: "row", justifyContent: "center", gap: 40, paddingVertical: 20 },
    actionBtn: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.card,
      shadowColor: c.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    passBtn: { borderWidth: 2, borderColor: c.dangerLight },
    likeBtn: { borderWidth: 2, borderColor: "#bbf7d0" },
  });
}
