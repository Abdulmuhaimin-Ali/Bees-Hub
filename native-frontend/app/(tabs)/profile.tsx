import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { clearStoredUser, getStoredUser } from "@/hooks/userStore";
import {
  getProfile,
  saveProfile,
  getUserPhotos,
  uploadPhoto,
  deletePhoto,
  setMainPhoto,
  getPhotoUrl,
} from "@/hooks/SignInApi";
import type { Profile, UserPhoto } from "@/hooks/SignInApi";

const INTERESTS = [
  "Hiking",
  "Cooking",
  "Gaming",
  "Photography",
  "Travel",
  "Music",
  "Fitness",
  "Reading",
  "Coffee",
  "Coding",
];

const TECH_SKILLS_LIST = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "AWS",
  "Docker",
  "Kubernetes",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "Mobile Dev",
  "UI/UX",
];

function initials(first?: string, last?: string) {
  return `${(first ?? "?")[0] ?? ""}${(last ?? "")[0] ?? ""}`.toUpperCase();
}

export default function ProfileScreen() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    heightCm: "",
    weightKg: "",
    bio: "",
    occupation: "",
    company: "",
    workType: "",
    salaryRange: "",
    yearsExperience: "",
    education: "",
    certifications: "",
    techSkills: [] as string[],
    lookingFor: "",
    preferredGender: "",
    preferredAgeMin: "",
    preferredAgeMax: "",
    relationshipType: "",
    interests: [] as string[],
  });

  useEffect(() => {
    (async () => {
      const user = await getStoredUser();
      if (!user) {
        router.replace("/signin");
        return;
      }

      setIsAdmin(user.is_admin === 1);
      setIsMember(user.is_member === 1 ? true : false);
      setUserId(user.id);

      if (user.is_admin !== 1) {
        try {
          const p: Profile = await getProfile(user.id);
          setProfile({
            firstName: p.first_name ?? "",
            lastName: p.last_name ?? "",
            dateOfBirth: p.date_of_birth ?? "",
            gender: p.gender ?? "",
            phone: p.phone ?? "",
            address: p.address ?? "",
            city: p.city ?? "",
            province: p.province ?? "",
            postalCode: p.postal_code ?? "",
            heightCm: p.height_cm?.toString() ?? "",
            weightKg: p.weight_kg?.toString() ?? "",
            bio: p.bio ?? "",
            occupation: p.job_title ?? "",
            company: p.employer ?? "",
            workType: p.work_type ?? "",
            salaryRange: p.salary_range ?? "",
            yearsExperience: p.years_experience?.toString() ?? "",
            education: p.education ?? "",
            certifications: p.certifications ?? "",
            techSkills: p.tech_skills
              ? p.tech_skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
            lookingFor: p.looking_for ?? "",
            preferredGender: p.preferred_gender ?? "",
            preferredAgeMin: p.preferred_age_min?.toString() ?? "",
            preferredAgeMax: p.preferred_age_max?.toString() ?? "",
            relationshipType: p.relationship_type ?? "",
            interests: p.interests
              ? p.interests
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
          });
        } catch {
          // blank form is fine for new users
        }

        try {
          const photos = await getUserPhotos(user.id);
          setUserPhotos(photos);
          const main = photos.find((ph) => ph.is_main === 1) ?? photos[0];
          if (main) setMainPhotoUrl(getPhotoUrl(main.photo_url));
        } catch {
          // no photos yet is fine
        }
      }

      setLoading(false);
    })();
  }, []);

  const handleSignOut = async () => {
    await clearStoredUser();
    router.replace("/signin");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile(userId, {
        first_name: profile.firstName,
        last_name: profile.lastName,
        date_of_birth: profile.dateOfBirth,
        gender: profile.gender,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        province: profile.province,
        postal_code: profile.postalCode,
        height_cm: profile.heightCm ? Number(profile.heightCm) : undefined,
        weight_kg: profile.weightKg ? Number(profile.weightKg) : undefined,
        bio: profile.bio,
        job_title: profile.occupation,
        employer: profile.company,
        work_type: profile.workType,
        salary_range: profile.salaryRange,
        years_experience: profile.yearsExperience
          ? Number(profile.yearsExperience)
          : undefined,
        education: profile.education,
        certifications: profile.certifications,
        tech_skills: profile.techSkills.join(", "),
        looking_for: profile.lookingFor,
        preferred_gender: profile.preferredGender,
        preferred_age_min: profile.preferredAgeMin
          ? Number(profile.preferredAgeMin)
          : undefined,
        preferred_age_max: profile.preferredAgeMax
          ? Number(profile.preferredAgeMax)
          : undefined,
        relationship_type: profile.relationshipType,
        interests: profile.interests.join(", "),
      });
      setEditing(false);
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  const refreshPhotos = async () => {
    try {
      const photos = await getUserPhotos(userId);
      setUserPhotos(photos);
      const main = photos.find((ph) => ph.is_main === 1) ?? photos[0];
      setMainPhotoUrl(main ? getPhotoUrl(main.photo_url) : null);
    } catch {
      // ignore
    }
  };

  const pickAndUploadPhoto = async (): Promise<void> => {
    const uri = await openPicker();
    if (!uri) return;
    try {
      await uploadPhoto(userId, uri);
      await refreshPhotos();
    } catch {
      Alert.alert("Upload failed", "Could not save the photo, please try again.");
    }
  };

  const openPicker = async (): Promise<string | null> => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return null;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    return result.canceled ? null : result.assets[0].uri;
  };

  const handleReplacePhoto = async (photoId: string): Promise<void> => {
    setSelectedPhoto(null);
    await new Promise((r) => setTimeout(r, 350));
    const uri = await openPicker();
    if (!uri) return;
    try {
      const wasMain = userPhotos.find((p) => p.id === photoId)?.is_main === 1;
      const newPhoto = await uploadPhoto(userId, uri);
      if (wasMain) await setMainPhoto(userId, newPhoto.id);
      await deletePhoto(userId, photoId);
      await refreshPhotos();
    } catch {
      Alert.alert("Upload failed", "Could not save the photo, please try again.");
    }
  };

  const handleChangeMainPhoto = async () => {
    await new Promise((r) => setTimeout(r, 350));
    const uri = await openPicker();
    if (!uri) return;
    try {
      const newPhoto = await uploadPhoto(userId, uri);
      await setMainPhoto(userId, newPhoto.id);
      await refreshPhotos();
    } catch {
      Alert.alert("Upload failed", "Could not save the photo, please try again.");
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    setSelectedPhoto(null);
    try {
      await deletePhoto(userId, photoId);
      await refreshPhotos();
    } catch {
      Alert.alert("Error", "Could not delete the photo. Try again.");
    }
  };

  const handleSetMain = async (photoId: string) => {
    setSelectedPhoto(null);
    try {
      await setMainPhoto(userId, photoId);
      await refreshPhotos();
    } catch {
      Alert.alert("Error", "Could not update the main photo. Try again.");
    }
  };

  const toggleInterest = (item: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((i) => i !== item)
        : [...prev.interests, item],
    }));
  };

  const toggleSkill = (item: string) => {
    setProfile((prev) => ({
      ...prev,
      techSkills: prev.techSkills.includes(item)
        ? prev.techSkills.filter((s) => s !== item)
        : [...prev.techSkills, item],
    }));
  };

  const field = (
    label: string,
    key: keyof typeof profile,
    keyboard: "default" | "numeric" = "default",
  ) => (
    <View style={styles.infoRow} key={label}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={styles.input}
          value={profile[key] as string}
          onChangeText={(v) => setProfile((prev) => ({ ...prev, [key]: v }))}
          keyboardType={keyboard}
          placeholder={label}
          placeholderTextColor="#9ca3af"
        />
      ) : (
        <Text style={styles.infoValue}>{(profile[key] as string) || "—"}</Text>
      )}
    </View>
  );

  if (loading || isMember === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  // Admin: sign-out only
  if (isAdmin) {
    return (
      <View style={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Profile</Text>
          <Text style={styles.cardSubtitle}>
            Sign out of the admin account.
          </Text>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Normal user: full profile
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {mainPhotoUrl ? (
              <Image source={{ uri: mainPhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {initials(profile.firstName, profile.lastName)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.cameraOverlay}
            onPress={handleChangeMainPhoto}
          >
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>
          {profile.firstName || profile.lastName
            ? `${profile.firstName} ${profile.lastName}`.trim()
            : "Your Profile"}
        </Text>
        {profile.city || profile.province ? (
          <Text style={styles.profileMeta}>
            {[profile.city, profile.province].filter(Boolean).join(", ")}
          </Text>
        ) : null}
      </View>

      {/* Edit / Save bar */}
      <View style={styles.editBar}>
        {editing ? (
          <>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editBtnRow}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="pencil-outline" size={16} color="#f59e0b" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            {!isMember && (
              <TouchableOpacity
                style={styles.upgradeBtnRow}
                onPress={() => router.push("/membership")}
              >
                <Ionicons name="card-outline" size={16} color="#fff" />
                <Text style={styles.upgradeBtnText}>Upgrade Membership</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        {editing ? (
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={profile.bio}
            onChangeText={(v) => setProfile((prev) => ({ ...prev, bio: v }))}
            multiline
            numberOfLines={4}
            placeholder="Tell people about yourself…"
            placeholderTextColor="#9ca3af"
          />
        ) : (
          <Text style={styles.bioText}>{profile.bio || "No bio yet."}</Text>
        )}
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoGrid}>
          {userPhotos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoSlot}
              onPress={() => editing && setSelectedPhoto(photo)}
              activeOpacity={editing ? 0.75 : 1}
            >
              <Image
                source={{ uri: getPhotoUrl(photo.photo_url) }}
                style={styles.photoImage}
              />
              {photo.is_main === 1 && (
                <View style={styles.mainBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
          {editing && userPhotos.length < 6 && (
            <TouchableOpacity
              style={[styles.photoSlot, styles.photoSlotAdd]}
              onPress={pickAndUploadPhoto}
            >
              <Text style={styles.photoPlus}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Photo action modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPhoto(null)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Photo</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectedPhoto && handleReplacePhoto(selectedPhoto.id)}
            >
              <Ionicons name="image-outline" size={20} color="#1f2937" />
              <Text style={styles.modalOptionText}>Change photo</Text>
            </TouchableOpacity>
            {selectedPhoto?.is_main !== 1 && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => selectedPhoto && handleSetMain(selectedPhoto.id)}
              >
                <Ionicons name="star-outline" size={20} color="#f59e0b" />
                <Text style={[styles.modalOptionText, { color: "#f59e0b" }]}>Set as main photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectedPhoto && handleDeletePhoto(selectedPhoto.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.modalOptionText, { color: "#ef4444" }]}>Delete photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setSelectedPhoto(null)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        {field("Date of Birth", "dateOfBirth")}
        {field("Gender", "gender")}
        {field("Phone", "phone")}
        {field("Address", "address")}
        {field("City", "city")}
        {field("Province", "province")}
        {field("Postal Code", "postalCode")}
        {field("Height (cm)", "heightCm", "numeric")}
        {field("Weight (kg)", "weightKg", "numeric")}
      </View>

      {/* Professional */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional</Text>
        {field("Job Title", "occupation")}
        {field("Employer", "company")}
        {field("Work Type", "workType")}
        {field("Salary Range", "salaryRange")}
        {field("Years Experience", "yearsExperience", "numeric")}
        {field("Education", "education")}
        {field("Certifications", "certifications")}
      </View>

      {/* Match Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Preferences</Text>
        {field("Looking For", "lookingFor")}
        {field("Preferred Gender", "preferredGender")}
        {field("Preferred Age Min", "preferredAgeMin", "numeric")}
        {field("Preferred Age Max", "preferredAgeMax", "numeric")}
        {field("Relationship Type", "relationshipType")}
      </View>

      {/* Tech Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tech Skills</Text>
        <View style={styles.chips}>
          {(editing
            ? TECH_SKILLS_LIST
            : profile.techSkills.length
              ? profile.techSkills
              : TECH_SKILLS_LIST
          ).map((skill) => {
            const active = profile.techSkills.includes(skill);
            return (
              <TouchableOpacity
                key={skill}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => editing && toggleSkill(skill)}
                activeOpacity={editing ? 0.7 : 1}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Interests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.chips}>
          {(editing
            ? INTERESTS
            : profile.interests.length
              ? profile.interests
              : INTERESTS
          ).map((interest) => {
            const active = profile.interests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => editing && toggleInterest(interest)}
                activeOpacity={editing ? 0.7 : 1}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  page: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d97706",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    justifyContent: "center",
  },
  photoSlot: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  photoSlotAdd: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  photoImage: {
    width: 90,
    height: 90,
  },
  photoPlus: {
    fontSize: 24,
    color: "#9ca3af",
  },
  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
  },
  modalCancel: {
    marginTop: 16,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "600",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 13,
    color: "#6b7280",
  },
  editBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  editBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editBtnText: {
    color: "#f59e0b",
    fontWeight: "600",
    fontSize: 14,
  },
  upgradeBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  upgradeBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 12,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  input: {
    flex: 2,
    fontSize: 13,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f9fafb",
    textAlign: "right",
  },
  bioInput: {
    flex: 0,
    width: "100%",
    textAlign: "left",
    minHeight: 80,
    paddingTop: 8,
  },
  bioText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  chipText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#d97706",
    fontWeight: "700",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginTop: 4,
  },
  signOutText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 15,
  },
});
