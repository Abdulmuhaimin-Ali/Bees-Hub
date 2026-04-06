import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getActivities,
  getMatches,
  type Activity,
  type Profile,
} from "../../hooks/SignInApi";
import { getStoredUser } from "../../hooks/userStore";

const GRADIENTS = ["#f59e0b", "#8b5cf6", "#06b6d4", "#10b981", "#f43f5e"];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Outdoor Recreation": "🌿",
  "Food & Drink": "🍽️",
  "Arts & Culture": "🎨",
  Entertainment: "🎭",
  Nightlife: "🌙",
  "Sports & Fitness": "⚽",
  Shopping: "🛍️",
  Wellness: "🧘",
  Music: "🎵",
  Adventure: "🏔️",
  "Coffee & Café": "☕",
  Movies: "🎬",
  Gaming: "🎮",
  Beach: "🏖️",
  Travel: "✈️",
};

function getCategoryEmoji(category: string): string {
  if (CATEGORY_EMOJIS[category]) return CATEGORY_EMOJIS[category];
  const key = Object.keys(CATEGORY_EMOJIS).find(
    (k) =>
      category.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(category.toLowerCase()),
  );
  return key ? CATEGORY_EMOJIS[key] : "📍";
}

function renderPriceLevel(price: string) {
  const count = (price.match(/\$/g) || []).length;
  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: 4 }, (_, i) => (
        <Text key={i} style={i < count ? styles.priceActive : styles.priceDim}>
          $
        </Text>
      ))}
    </View>
  );
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < full ? "star" : "star-outline"}
          size={12}
          color={i < full ? "#f59e0b" : "#d1d5db"}
        />
      ))}
      <Text style={styles.ratingNum}>{rating}</Text>
    </View>
  );
}

interface MatchEntry {
  name: string;
  initials: string;
  color: string;
  interests: string[];
}

function profileToMatch(p: Profile, index: number): [string, MatchEntry] {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
  const initials =
    ((p.first_name?.[0] ?? "") + (p.last_name?.[0] ?? "")).toUpperCase() ||
    p.email[0].toUpperCase();
  const interests = p.interests
    ? p.interests.split(",").map((s) => s.trim())
    : [];
  return [
    p.user_id,
    { name, initials, color: GRADIENTS[index % GRADIENTS.length], interests },
  ];
}

export default function ActivitiesScreen() {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [matches, setMatches] = useState<Record<string, MatchEntry>>({});
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activitiesMap, setActivitiesMap] = useState<
    Record<string, Activity[]>
  >({});
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    getStoredUser().then((u) => setIsPaid(u?.is_member === 1 ? true : false));
  }, []);

  useEffect(() => {
    if (isPaid === null) return;
    if (!isPaid) {
      setLoadingMatches(false);
      return;
    }
    getMatches()
      .then((profiles) => {
        const entries = profiles.map(profileToMatch);
        setMatches(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to fetch matches:", err))
      .finally(() => setLoadingMatches(false));
  }, [isPaid]);

  const fetchActivities = (matchId: string) => {
    setSelectedId(matchId);
    if (activitiesMap[matchId]) return;
    setLoadingActivities(true);
    getActivities(matchId)
      .then((data) =>
        setActivitiesMap((prev) => ({ ...prev, [matchId]: data })),
      )
      .catch((err) => console.error("Failed to fetch activities:", err))
      .finally(() => setLoadingActivities(false));
  };

  const matchIds = Object.keys(matches);
  const selectedMatch = selectedId ? matches[selectedId] : null;
  const activities = selectedId ? (activitiesMap[selectedId] ?? []) : [];

  if (isPaid === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  if (!isPaid) {
    return (
      <View style={styles.paywallContainer}>
        <Text style={styles.paywallHoneycomb}>🍯</Text>
        <Text style={styles.paywallBee}>🐝</Text>
        <Text style={styles.paywallTitle}>Members Only</Text>
        <Text style={styles.paywallSubtitle}>
          This hive is exclusive to paid members.{"\n"}We're sorry — the Matches
          tab is reserved for those who've joined the colony.
        </Text>
        <View style={styles.paywallDivider} />
        <Text style={styles.paywallPerks}>✨ Unlock with a membership:</Text>
        <View style={styles.paywallPerksList}>
          <Text style={styles.paywallPerk}>💛 View all your matches</Text>
          <Text style={styles.paywallPerk}>📍 Get curated date activity ideas</Text>
          <Text style={styles.paywallPerk}>🔓 Full access to contact info</Text>
        </View>
        <TouchableOpacity
          style={styles.paywallButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="star" size={16} color="#fff" />
          <Text style={styles.paywallButtonText}>Upgrade My Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Date Activities</Text>
        <Text style={styles.headerSubtitle}>
          Pick a match to see couple activity ideas
        </Text>
      </View>

      <View style={styles.matchesSection}>
        <View style={styles.matchesTitle}>
          <Ionicons name="heart-outline" size={16} color="#374151" />
          <Text style={styles.matchesTitleText}>Your Matches</Text>
        </View>
        {loadingMatches ? (
          <ActivityIndicator color="#f59e0b" style={{ marginTop: 12 }} />
        ) : matchIds.length === 0 ? (
          <Text style={styles.noMatchesText}>
            No matches yet — keep swiping on Discover!
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.matchesScroll}
          >
            {matchIds.map((id) => {
              const m = matches[id];
              return (
                <TouchableOpacity
                  key={id}
                  style={styles.matchBubble}
                  onPress={() => fetchActivities(id)}
                >
                  <View
                    style={[
                      styles.bubbleAvatar,
                      { backgroundColor: m.color },
                      selectedId === id && styles.bubbleAvatarActive,
                    ]}
                  >
                    <Text style={styles.bubbleInitials}>{m.initials}</Text>
                  </View>
                  <Text style={styles.bubbleName}>{m.name.split(" ")[0]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {selectedMatch && (
        <View>
          <View style={styles.selectedMatchHeader}>
            <Ionicons name="people" size={15} color="#374151" />
            <Text style={styles.selectedMatchText}>
              Activities with{" "}
              <Text style={{ fontWeight: "bold" }}>{selectedMatch.name}</Text>
            </Text>
          </View>
          {selectedMatch.interests.length > 0 && (
            <View style={styles.sharedInterests}>
              {selectedMatch.interests.slice(0, 4).map((i) => (
                <View key={i} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{i}</Text>
                </View>
              ))}
            </View>
          )}
          {loadingActivities ? (
            <ActivityIndicator color="#f59e0b" style={{ marginTop: 16 }} />
          ) : activities.length === 0 ? (
            <View style={styles.noActivities}>
              <Text style={styles.noActivitiesIcon}>✨</Text>
              <Text style={styles.noActivitiesText}>
                No activities found for this match yet.
              </Text>
            </View>
          ) : (
            <View style={styles.activitiesList}>
              {activities.map((activity, idx) => (
                <View key={idx} style={styles.activityCard}>
                  <Text style={styles.activityEmoji}>
                    {getCategoryEmoji(activity.category)}
                  </Text>
                  <View style={styles.activityInfo}>
                    <View style={styles.activityTop}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      {renderPriceLevel(activity.estimated_cost_per_person)}
                    </View>
                    <Text style={styles.activityCategory}>
                      {activity.category}
                    </Text>
                    <View style={styles.activityDetails}>
                      {renderStars(activity.rating)}
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color="#6b7280"
                        />
                        <Text style={styles.detailText}>
                          Open until {activity.open_until}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.activityReason}>
                      <Ionicons name="sparkles" size={12} color="#b45309" />
                      <Text style={styles.reasonText}>{activity.reason}</Text>
                    </View>
                    <View style={styles.activityAddress}>
                      <Ionicons
                        name="location-sharp"
                        size={12}
                        color="#6b7280"
                      />
                      <Text style={styles.addressText}>
                        {activity.street}, {activity.city}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, paddingBottom: 32 },
  header: { alignItems: "center", paddingTop: 44, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#1f2937" },
  headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  matchesSection: { marginBottom: 16 },
  matchesTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  matchesTitleText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  noMatchesText: { fontSize: 13, color: "#6b7280", marginTop: 8 },
  matchesScroll: { flexDirection: "row" },
  matchBubble: { alignItems: "center", marginRight: 16 },
  bubbleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bubbleAvatarActive: { borderWidth: 3, borderColor: "#f59e0b" },
  bubbleInitials: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  bubbleName: { fontSize: 12, color: "#374151" },
  selectedMatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fde68a",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedMatchText: { fontSize: 13, color: "#374151" },
  sharedInterests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  interestChip: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  interestChipText: { fontSize: 12, color: "#374151" },
  noActivities: { alignItems: "center", paddingVertical: 24 },
  noActivitiesIcon: { fontSize: 32, marginBottom: 8 },
  noActivitiesText: { fontSize: 14, color: "#6b7280" },
  activitiesList: { gap: 12 },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  activityEmoji: { fontSize: 32, marginBottom: 10 },
  activityInfo: { width: "100%" },
  activityTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  activityName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  priceActive: { fontSize: 13, color: "#f59e0b", fontWeight: "bold" },
  priceDim: { fontSize: 13, color: "#d1d5db" },
  activityCategory: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  activityDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  detailText: { fontSize: 12, color: "#6b7280" },
  ratingNum: { fontSize: 12, color: "#374151", marginLeft: 4 },
  activityReason: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    backgroundColor: "#fde68a",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  reasonText: { fontSize: 12, color: "#b45309", flex: 1 },
  activityAddress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },
  addressText: { fontSize: 12, color: "#6b7280" },
  // Paywall
  paywallContainer: {
    flex: 1,
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  paywallHoneycomb: { fontSize: 64, marginBottom: -16 },
  paywallBee: { fontSize: 48, marginBottom: 20 },
  paywallTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#92400e",
    marginBottom: 12,
    textAlign: "center",
  },
  paywallSubtitle: {
    fontSize: 15,
    color: "#78350f",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  paywallDivider: {
    width: 48,
    height: 3,
    backgroundColor: "#fbbf24",
    borderRadius: 2,
    marginBottom: 20,
  },
  paywallPerks: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 10,
  },
  paywallPerksList: { alignSelf: "stretch", gap: 8, marginBottom: 32 },
  paywallPerk: { fontSize: 14, color: "#78350f", textAlign: "center" },
  paywallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  paywallButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
