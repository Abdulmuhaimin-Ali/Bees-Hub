import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { getProfile, Profile } from "../../hooks/SignInApi";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TODO: Replace with real user ID from auth/session
  const userId = "1";

  useEffect(() => {
    getProfile(userId)
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#fbbf24" /></View>;
  if (error) return <View style={styles.loading}><Text style={{ color: 'red' }}>{error}</Text></View>;
  if (!profile) return null;

  // Helper functions
  const initials = (profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "");
  const techSkills = profile.tech_skills ? profile.tech_skills.split(",") : [];
  const interests = profile.interests ? profile.interests.split(",") : [];
  const photos = Array(6).fill(null);

  return (
    <ScrollView style={styles.container}>
      {/* Header gradient and initials */}
      <View style={styles.headerGradient} />
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials || "AC"}</Text>
          <TouchableOpacity style={styles.avatarCamera}>
            <Text style={styles.avatarCameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
        <Text style={styles.location}>{profile.city}  |  {profile.job_title}</Text>
      </View>

      {/* Profile Strength */}
      <View style={styles.strengthBox}>
        <Text style={styles.strengthLabel}>Profile Strength: 85%</Text>
        <Text style={styles.strengthHint}>Add more photos to reach 100%</Text>
      </View>

      {/* Bio */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TouchableOpacity><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
        </View>
        <Text style={styles.sectionText}>{profile.bio}</Text>
      </View>

      {/* Personal Details */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Date of Birth</Text><Text style={styles.detailValue}>{profile.date_of_birth}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Gender</Text><Text style={styles.detailValue}>{profile.gender}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone</Text><Text style={styles.detailValue}>{profile.phone}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Address</Text><Text style={styles.detailValue}>{profile.address}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>City</Text><Text style={styles.detailValue}>{profile.city}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Height</Text><Text style={styles.detailValue}>{profile.height_cm} cm</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Weight</Text><Text style={styles.detailValue}>{profile.weight_kg} kg</Text></View>
      </View>

      {/* Professional */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Professional</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Role</Text><Text style={styles.detailValue}>{profile.job_title}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Company</Text><Text style={styles.detailValue}>{profile.employer}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Work Type</Text><Text style={styles.detailValue}>{profile.work_type}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Salary</Text><Text style={styles.detailValue}>{profile.salary_range}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Experience</Text><Text style={styles.detailValue}>{profile.years_experience} years</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Education</Text><Text style={styles.detailValue}>{profile.education}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Certifications</Text><Text style={styles.detailValue}>{profile.certifications}</Text></View>
      </View>

      {/* Match Preferences */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Match Preferences</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Preferred Gender</Text><Text style={styles.detailValue}>{profile.preferred_gender}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Looking For</Text><Text style={styles.detailValue}>{profile.looking_for}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Relationship Type</Text><Text style={styles.detailValue}>{profile.relationship_type}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Preferred Age Min</Text><Text style={styles.detailValue}>{profile.preferred_age_min}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Preferred Age Max</Text><Text style={styles.detailValue}>{profile.preferred_age_max}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Deal Breakers</Text></View>
      </View>

      {/* Tech Skills */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tech Skills</Text>
          <TouchableOpacity><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
        </View>
        <View style={styles.chipRow}>
          {techSkills.map(skill => (
            <View key={skill} style={styles.chip}><Text style={styles.chipText}>{skill}</Text></View>
          ))}
        </View>
      </View>

      {/* Interests */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <TouchableOpacity><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
        </View>
        <View style={styles.chipRow}>
          {interests.map(interest => (
            <View key={interest} style={styles.chip}><Text style={styles.chipText}>{interest}</Text></View>
          ))}
        </View>
      </View>

      {/* Photos */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoRow}>
          {photos.map((photo, idx) => (
            <View key={idx} style={styles.photoBox}><Text style={styles.photoIcon}>📷</Text></View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde68a',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  headerGradient: {
    height: 120,
    backgroundColor: '#fde68a',
  },
  header: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarCamera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  avatarCameraIcon: {
    fontSize: 16,
    color: '#fbbf24',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  location: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  strengthBox: {
    backgroundColor: '#fde68a',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
  },
  strengthLabel: {
    fontWeight: 'bold',
    color: '#b45309',
    fontSize: 16,
  },
  strengthHint: {
    color: '#b45309',
    fontSize: 12,
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1f2937',
  },
  editIcon: {
    fontSize: 16,
    color: '#fbbf24',
  },
  sectionText: {
    color: '#1f2937',
    fontSize: 14,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#fff7e6',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    marginRight: 8,
  },
  chipText: {
    color: '#b45309',
    fontWeight: 'bold',
    fontSize: 14,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fff7e6',
    borderColor: '#fbbf24',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginRight: 8,
  },
  photoIcon: {
    fontSize: 24,
    color: '#fbbf24',
  },
});
