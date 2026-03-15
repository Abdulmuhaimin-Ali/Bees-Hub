import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProfile, saveProfile } from "../../hooks/SignInApi";
import { getStoredUser, clearStoredUser } from "../../hooks/userStore";

const INTERESTS = [
  "Hiking","Cooking","Gaming","Photography","Travel","Music",
  "Fitness","Reading","Coffee","Coding",
];

const TECH_SKILLS_LIST = [
  "JavaScript","TypeScript","Python","Java","C++","Go","Rust",
  "React","Angular","Vue","Node.js","AWS","Docker","Kubernetes",
  "Machine Learning","Data Science","DevOps","Mobile Dev","UI/UX",
];

interface ProfileState {
  firstName: string; lastName: string; age: number;
  dateOfBirth: string; gender: string; phone: string;
  address: string; city: string; province: string; postalCode: string;
  occupation: string; company: string; workType: string;
  salaryRange: string; yearsExperience: string; education: string;
  certifications: string; techSkills: string[];
  heightCm: string; weightKg: string; bio: string;
  lookingFor: string; relationshipType: string;
  preferredGender: string; preferredAgeMin: string; preferredAgeMax: string;
  dealBreakers: string; interests: string[];
}

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfileState>({
    firstName: "", lastName: "", age: 0, dateOfBirth: "", gender: "",
    phone: "", address: "", city: "", province: "", postalCode: "",
    occupation: "", company: "", workType: "", salaryRange: "",
    yearsExperience: "", education: "", certifications: "",
    techSkills: [], heightCm: "", weightKg: "", bio: "",
    lookingFor: "", relationshipType: "", preferredGender: "",
    preferredAgeMin: "", preferredAgeMax: "", dealBreakers: "", interests: [],
  });

  useEffect(() => {
    getStoredUser().then((user) => {
      if (!user) { router.replace("/signin"); return; }
      getProfile(user.id)
        .then((p) => {
          setProfile({
            firstName: p.first_name ?? "",
            lastName: p.last_name ?? "",
            age: p.date_of_birth
              ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : 0,
            dateOfBirth: p.date_of_birth ?? "",
            gender: p.gender ?? "",
            phone: p.phone ?? "",
            address: p.address ?? "",
            city: p.city ?? "",
            province: p.province ?? "",
            postalCode: p.postal_code ?? "",
            occupation: p.job_title ?? "",
            company: p.employer ?? "",
            workType: p.work_type ?? "",
            salaryRange: p.salary_range ?? "",
            yearsExperience: p.years_experience?.toString() ?? "",
            education: p.education ?? "",
            certifications: p.certifications ?? "",
            techSkills: p.tech_skills ? p.tech_skills.split(",").map((s) => s.trim()) : [],
            heightCm: p.height_cm?.toString() ?? "",
            weightKg: p.weight_kg?.toString() ?? "",
            bio: p.bio ?? "",
            lookingFor: p.looking_for ?? "",
            relationshipType: p.relationship_type ?? "",
            preferredGender: p.preferred_gender ?? "",
            preferredAgeMin: p.preferred_age_min?.toString() ?? "",
            preferredAgeMax: p.preferred_age_max?.toString() ?? "",
            dealBreakers: "",
            interests: p.interests ? p.interests.split(",").map((s) => s.trim()) : [],
          });
        })
        .catch(() => setError("Failed to fetch profile"))
        .finally(() => setLoading(false));
    });
  }, []);

  const handleSave = async () => {
    const user = await getStoredUser();
    if (!user) return;
    await saveProfile(user.id, {
      first_name: profile.firstName, last_name: profile.lastName,
      date_of_birth: profile.dateOfBirth, gender: profile.gender,
      phone: profile.phone, address: profile.address, city: profile.city,
      province: profile.province, postal_code: profile.postalCode,
      job_title: profile.occupation, employer: profile.company,
      work_type: profile.workType, salary_range: profile.salaryRange,
      years_experience: profile.yearsExperience ? Number(profile.yearsExperience) : undefined,
      education: profile.education, certifications: profile.certifications,
      tech_skills: profile.techSkills.join(", "),
      height_cm: profile.heightCm ? Number(profile.heightCm) : undefined,
      weight_kg: profile.weightKg ? Number(profile.weightKg) : undefined,
      bio: profile.bio, looking_for: profile.lookingFor,
      relationship_type: profile.relationshipType, preferred_gender: profile.preferredGender,
      preferred_age_min: profile.preferredAgeMin ? Number(profile.preferredAgeMin) : undefined,
      preferred_age_max: profile.preferredAgeMax ? Number(profile.preferredAgeMax) : undefined,
      interests: profile.interests.join(", "),
    });
    setEditing(false);
  };

  const toggleInterest = (interest: string) =>
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));

  const toggleTechSkill = (skill: string) =>
    setProfile((prev) => ({
      ...prev,
      techSkills: prev.techSkills.includes(skill)
        ? prev.techSkills.filter((s) => s !== skill)
        : [...prev.techSkills, skill],
    }));

  const handleSignOut = async () => {
    await clearStoredUser();
    router.replace("/signin");
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#fbbf24" /></View>;
  if (error) return <View style={styles.loading}><Text style={{ color: "red" }}>{error}</Text></View>;

  const initials = (profile.firstName[0] ?? "") + (profile.lastName[0] ?? "");

  return (
    <ScrollView style={styles.container}>
      {/* Header gradient */}
      <View style={styles.headerGradient} />
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials || "?"}</Text>
          <TouchableOpacity style={styles.avatarCamera}>
            <Ionicons name="camera" size={16} color="#fbbf24" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-sharp" size={13} color="#6b7280" />
          <Text style={styles.metaText}>{profile.city}, {profile.province}</Text>
          <Ionicons name="briefcase" size={13} color="#6b7280" style={{ marginLeft: 8 }} />
          <Text style={styles.metaText}>{profile.occupation}</Text>
        </View>
      </View>

      {/* Profile Strength */}
      <View style={styles.strengthBox}>
        <Ionicons name="sparkles" size={18} color="#b45309" />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.strengthLabel}>Profile Strength: 85%</Text>
          <Text style={styles.strengthHint}>Add more photos to reach 100%</Text>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name="pencil" size={16} color="#fbbf24" />
          </TouchableOpacity>
        </View>
        {editing ? (
          <TextInput style={[styles.sectionText, styles.editInput]} value={profile.bio}
            onChangeText={(v) => setProfile((p) => ({ ...p, bio: v }))}
            multiline numberOfLines={4} />
        ) : (
          <Text style={styles.sectionText}>{profile.bio}</Text>
        )}
      </View>

      {/* Personal Details */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        {[
          ["Date of Birth", profile.dateOfBirth],
          ["Gender", profile.gender],
          ["Phone", profile.phone],
          ["Address", profile.address],
          ["City", `${profile.city}, ${profile.province} ${profile.postalCode}`],
          ["Height", `${profile.heightCm} cm`],
          ["Weight", `${profile.weightKg} kg`],
        ].map(([label, value]) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Professional */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Professional</Text>
        {[
          ["Role", profile.occupation],
          ["Company", profile.company],
          ["Work Type", profile.workType],
          ["Salary", profile.salaryRange],
          ["Experience", `${profile.yearsExperience} years`],
          ["Education", profile.education],
          ["Certifications", profile.certifications],
        ].map(([label, value]) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Match Preferences */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Match Preferences</Text>
        {[
          ["Preferred Gender", profile.preferredGender],
          ["Looking For", profile.lookingFor],
          ["Relationship Type", profile.relationshipType],
          ["Preferred Age Min", profile.preferredAgeMin],
          ["Preferred Age Max", profile.preferredAgeMax],
          ["Deal Breakers", profile.dealBreakers],
        ].map(([label, value]) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Tech Skills */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tech Skills</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name="pencil" size={16} color="#fbbf24" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipRow}>
          {(editing ? TECH_SKILLS_LIST : profile.techSkills).map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[styles.chip, profile.techSkills.includes(skill) && styles.chipActive]}
              onPress={() => editing && toggleTechSkill(skill)}
            >
              <Text style={[styles.chipText, profile.techSkills.includes(skill) && styles.chipTextActive]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interests */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name="pencil" size={16} color="#fbbf24" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipRow}>
          {(editing ? INTERESTS : profile.interests).map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[styles.chip, profile.interests.includes(interest) && styles.chipActive]}
              onPress={() => editing && toggleInterest(interest)}
            >
              <Text style={[styles.chipText, profile.interests.includes(interest) && styles.chipTextActive]}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photos */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.photoBox}>
              <Ionicons name="camera" size={22} color="#fbbf24" />
            </View>
          ))}
        </View>
      </View>

      {editing && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  headerGradient: { height: 120, backgroundColor: "#fde68a" },
  header: { alignItems: "center", marginTop: -60, marginBottom: 16 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: "#fbbf24",
    alignItems: "center", justifyContent: "center",
    borderWidth: 4, borderColor: "#fff",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    marginBottom: 8,
  },
  avatarInitials: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  avatarCamera: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#fff", borderRadius: 14, padding: 4, borderWidth: 1, borderColor: "#fde68a",
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 13, color: "#6b7280" },
  strengthBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fde68a", borderRadius: 12,
    marginHorizontal: 16, marginBottom: 16, padding: 12,
  },
  strengthLabel: { fontWeight: "bold", color: "#b45309", fontSize: 15 },
  strengthHint: { color: "#b45309", fontSize: 12 },
  sectionBox: {
    backgroundColor: "#fff", borderRadius: 16,
    marginHorizontal: 16, marginBottom: 16, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, color: "#1f2937" },
  sectionText: { color: "#374151", fontSize: 14, lineHeight: 20 },
  editInput: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8,
    padding: 8, minHeight: 80, textAlignVertical: "top",
  },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  detailLabel: { color: "#6b7280", fontSize: 14, fontWeight: "500", flex: 1 },
  detailValue: { color: "#1f2937", fontSize: 14, fontWeight: "bold", flex: 1, textAlign: "right" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    backgroundColor: "#f3f4f6", borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  chipActive: { backgroundColor: "#fde68a", borderColor: "#fbbf24" },
  chipText: { fontSize: 13, color: "#6b7280" },
  chipTextActive: { color: "#b45309", fontWeight: "600" },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  photoBox: {
    width: 60, height: 60, borderRadius: 12,
    backgroundColor: "#f9fafb", borderWidth: 1.5,
    borderColor: "#e5e7eb", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#f59e0b", borderRadius: 12,
    marginHorizontal: 16, paddingVertical: 14,
    alignItems: "center", marginBottom: 12,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1, borderColor: "#fecaca",
    borderRadius: 12, marginHorizontal: 16, paddingVertical: 14, marginBottom: 12,
  },
  signOutText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
});
