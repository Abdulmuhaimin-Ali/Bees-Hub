import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getAdminPortalData,
  getProfile,
  type AdminPortalData,
  type Profile,
} from "@/hooks/SignInApi";
import { getStoredUser } from "@/hooks/userStore";

export default function AdminScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<AdminPortalData | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<Profile | null>(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [selectedUserError, setSelectedUserError] = useState("");
  const [showFullProfile, setShowFullProfile] = useState(false);

  const handleUserPress = async (userId: string) => {
    setSelectedUserLoading(true);
    setSelectedUserError("");
    setShowFullProfile(false);
    try {
      const profile = await getProfile(userId);
      setSelectedUserProfile(profile);
    } catch {
      setSelectedUserProfile(null);
      setSelectedUserError("This user does not have a saved profile yet.");
    } finally {
      setSelectedUserLoading(false);
    }
  };

  useEffect(() => {
    getStoredUser().then((user) => {
      if (!user) {
        router.replace("/signin");
        return;
      }
      if (!user.is_admin) {
        router.replace("/(tabs)/profile");
        return;
      }

      getAdminPortalData()
        .then((portalData) => setData(portalData))
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Failed to load admin portal";
          setError(message);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No admin data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoBee}>🐝</Text>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color="#7c2d12"
            style={styles.logoShield}
          />
        </View>
        <Text style={styles.logoTitle}>BeesHub Admin</Text>
        <Text style={styles.logoSubtitle}>Portal Metrics Dashboard</Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          label="Free Members"
          value={data.free_members}
          icon="people-outline"
        />
        <MetricCard
          label="Paid Members"
          value={data.paid_members}
          icon="card-outline"
        />
        <MetricCard
          label="Matches Shown Contact Info"
          value={data.matches_shown_contact_info}
          icon="call-outline"
        />
        <MetricCard
          label="Matches and Date Activity"
          value={data.matches_and_date_activity_count}
          icon="calendar-outline"
        />
      </View>

      <Text style={styles.sectionTitle}>Matches and Date Activity</Text>
      {data.matches_and_date_activity.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No date activity records yet.</Text>
        </View>
      ) : (
        data.matches_and_date_activity.map((item) => (
          <View key={item.id} style={styles.activityCard}>
            <Text style={styles.activityTitle}>
              {item.activity || "Activity not set"}
            </Text>
            <Text style={styles.activityLine}>
              Match: {item.user1_email} and {item.user2_email}
            </Text>
            <Text style={styles.activityLine}>
              Location: {item.location || "Not set"}
            </Text>
            <Text style={styles.activityLine}>
              Date/Time: {item.date_time || "Not set"}
            </Text>
            <Text style={styles.activityStatus}>
              Status: {item.status || "scheduled"}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>All Users</Text>
      <Text style={styles.sectionHint}>
        Tap a user to open profile details.
      </Text>
      {data.admin_users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No users found.</Text>
        </View>
      ) : (
        data.admin_users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => handleUserPress(user.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userLine}>ID: {user.id}</Text>
            <Text style={styles.userLine}>
              Member: {user.is_member ? "Yes" : "No"} | Admin:{" "}
              {user.is_admin ? "Yes" : "No"}
            </Text>
            <Text style={styles.userLine}>Created: {user.created_at}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Selected User Profile</Text>
      {selectedUserLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color="#f59e0b" />
        </View>
      ) : selectedUserError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{selectedUserError}</Text>
        </View>
      ) : selectedUserProfile ? (
        <View style={styles.userCard}>
          <Text style={styles.userEmail}>
            {selectedUserProfile.first_name || selectedUserProfile.last_name
              ? `${selectedUserProfile.first_name ?? ""} ${selectedUserProfile.last_name ?? ""}`.trim()
              : selectedUserProfile.email}
          </Text>
          <Text style={styles.userLine}>
            Email: {selectedUserProfile.email}
          </Text>
          <Text style={styles.userLine}>
            Member: {selectedUserProfile.is_member ? "Yes" : "No"}
          </Text>

          {showFullProfile && (
            <>
              <Text style={styles.profileDivider}>— Full Profile —</Text>
              <Text style={styles.userLine}>
                Date of Birth: {selectedUserProfile.date_of_birth || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Gender: {selectedUserProfile.gender || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Phone: {selectedUserProfile.phone || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Address: {selectedUserProfile.address || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                City: {selectedUserProfile.city || "Not set"},{" "}
                {selectedUserProfile.province || "Not set"}{" "}
                {selectedUserProfile.postal_code || ""}
              </Text>
              <Text style={styles.userLine}>
                Height:{" "}
                {selectedUserProfile.height_cm
                  ? `${selectedUserProfile.height_cm} cm`
                  : "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Weight:{" "}
                {selectedUserProfile.weight_kg
                  ? `${selectedUserProfile.weight_kg} kg`
                  : "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Bio: {selectedUserProfile.bio || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Job Title: {selectedUserProfile.job_title || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Employer: {selectedUserProfile.employer || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Work Type: {selectedUserProfile.work_type || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Salary Range: {selectedUserProfile.salary_range || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Years Experience:{" "}
                {selectedUserProfile.years_experience ?? "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Education: {selectedUserProfile.education || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Certifications:{" "}
                {selectedUserProfile.certifications || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Tech Skills: {selectedUserProfile.tech_skills || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Interests: {selectedUserProfile.interests || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Looking For: {selectedUserProfile.looking_for || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Preferred Gender:{" "}
                {selectedUserProfile.preferred_gender || "Not set"}
              </Text>
              <Text style={styles.userLine}>
                Preferred Age: {selectedUserProfile.preferred_age_min ?? "?"} –{" "}
                {selectedUserProfile.preferred_age_max ?? "?"}
              </Text>
              <Text style={styles.userLine}>
                Relationship Type:{" "}
                {selectedUserProfile.relationship_type || "Not set"}
              </Text>
            </>
          )}

          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => setShowFullProfile((v) => !v)}
          >
            <Text style={styles.viewProfileBtnText}>
              {showFullProfile ? "Hide Profile" : "Go to Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Tap a user above to view their profile.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={18} color="#92400e" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffbeb" },
  content: { padding: 16, paddingBottom: 32 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffbeb",
  },
  logoWrap: { alignItems: "center", marginTop: 34, marginBottom: 16 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fcd34d",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoBee: { fontSize: 30 },
  logoShield: { position: "absolute", bottom: 6, right: 4 },
  logoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#78350f",
    marginTop: 8,
  },
  logoSubtitle: { fontSize: 13, color: "#92400e" },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  metricLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#78350f",
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  activityLine: { fontSize: 12, color: "#374151", marginBottom: 2 },
  activityStatus: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "600",
    marginTop: 4,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  userLine: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 2,
  },
  profileDivider: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 8,
  },
  viewProfileBtn: {
    marginTop: 10,
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewProfileBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  emptyText: { color: "#6b7280", fontSize: 14 },
  errorText: { color: "#b91c1c", fontSize: 14 },
  profileBtn: {
    marginTop: 10,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  profileBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
