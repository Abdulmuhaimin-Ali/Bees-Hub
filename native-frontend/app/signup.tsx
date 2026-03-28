import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { router, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { storeUser } from "../hooks/userStore";
import { register, saveProfile } from "../hooks/SignInApi";

const INTERESTS = [
  "Hiking",
  "Cooking",
  "Gaming",
  "Photography",
  "Travel",
  "Music",
  "Fitness",
  "Reading",
  "Movies",
  "Art",
  "Coding",
  "Dancing",
  "Yoga",
  "Coffee",
  "Wine",
  "Sports",
  "Pets",
  "Volunteering",
  "Gardening",
  "Fashion",
];

const TECH_SKILLS = [
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

const PROVINCES = ["ON", "BC", "QC", "AB", "MB", "SK", "NS", "NB", "NL", "PE"];
const WORK_TYPES = ["Remote", "On-site", "Hybrid", "Freelance"];
const SALARY_RANGES = [
  "$30k - $50k",
  "$50k - $80k",
  "$80k - $120k",
  "$120k - $180k",
  "$180k+",
];
const YEARS_EXP = ["0 - 1", "1 - 3", "3 - 5", "5 - 10", "10+"];
const EDUCATIONS = [
  "High School",
  "College Diploma",
  "Bachelor's",
  "Master's",
  "PhD",
  "Bootcamp",
  "Self-taught",
];

function PickerModal({
  visible,
  options,
  onSelect,
  onClose,
  title,
}: {
  visible: boolean;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function SelectButton({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.selectBtn} onPress={onPress}>
        <Text
          style={value ? styles.selectBtnText : styles.selectBtnPlaceholder}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
}

export default function SignUpScreen() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [picker, setPicker] = useState<{
    field: string;
    options: string[];
    title: string;
  } | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
    phone: "",
    city: "",
    address: "",
    province: "",
    postalCode: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    bio: "",
    lookingFor: "",
    occupation: "",
    company: "",
    workType: "",
    salaryRange: "",
    yearsExperience: "",
    education: "",
    certifications: "",
    techSkills: [] as string[],
    interests: [] as string[],
    preferredGender: "",
    preferredAgeMin: "",
    preferredAgeMax: "",
    relationshipType: "",
    dealBreakers: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Helper: check if string is a number
  const isNumber = (val: string) => /^\d+(\.\d+)?$/.test(val.trim());
  // Helper: check if string is not a number (for name, city, etc.)
  const isNotNumber = (val: string) =>
    val.trim() !== "" && !/^\d+$/.test(val.trim());

  // Step validation
  function validateStep() {
    setError(null);
    if (step === 1) {
      if (
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        !form.password ||
        !form.birthDate ||
        !form.phone ||
        !form.address ||
        !form.city ||
        !form.province ||
        !form.postalCode
      ) {
        setError("Please fill in all required fields.");
        return false;
      }
      if (!isNotNumber(form.firstName) || !isNotNumber(form.lastName)) {
        setError("Name fields must not be numbers.");
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (!/^\d{3,}/.test(form.phone.replace(/\D/g, ""))) {
        setError("Please enter a valid phone number.");
        return false;
      }
      if (!isNotNumber(form.city)) {
        setError("City must not be a number.");
        return false;
      }
    }
    if (step === 2) {
      if (
        !form.gender ||
        !form.heightCm ||
        !form.weightKg ||
        !form.preferredGender ||
        !form.lookingFor ||
        !form.bio
      ) {
        setError("Please fill in all required fields.");
        return false;
      }
      if (!isNumber(form.heightCm) || !isNumber(form.weightKg)) {
        setError("Height and weight must be numbers.");
        return false;
      }
      if (!isNotNumber(form.lookingFor)) {
        setError("Looking For must not be a number.");
        return false;
      }
    }
    if (step === 3) {
      if (
        !form.occupation ||
        !form.company ||
        !form.workType ||
        !form.salaryRange ||
        !form.yearsExperience ||
        !form.education
      ) {
        setError("Please fill in all required fields.");
        return false;
      }
      if (!isNotNumber(form.occupation) || !isNotNumber(form.company)) {
        setError("Occupation and company must not be numbers.");
        return false;
      }
      if (!isNumber(form.yearsExperience.replace(/[^\d]/g, ""))) {
        setError("Years of experience must be a number.");
        return false;
      }
    }
    if (step === 4) {
      if (!form.interests.length) {
        setError("Please select at least one interest.");
        return false;
      }
    }
    if (step === 5) {
      if (
        !form.preferredAgeMin ||
        !form.preferredAgeMax ||
        !form.relationshipType
      ) {
        setError("Please fill in all required fields.");
        return false;
      }
      if (!isNumber(form.preferredAgeMin) || !isNumber(form.preferredAgeMax)) {
        setError("Preferred ages must be numbers.");
        return false;
      }
    }
    // Step 6: skip for now (photos)
    return true;
  }

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (interest: string) =>
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));

  const toggleTechSkill = (skill: string) =>
    setForm((prev) => ({
      ...prev,
      techSkills: prev.techSkills.includes(skill)
        ? prev.techSkills.filter((s) => s !== skill)
        : [...prev.techSkills, skill],
    }));

  const totalSteps = 6;
  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleCreateAccount = async () => {
    try {
      // 1. Register user (email/password)
      const { user } = await register(form.email, form.password);
      await storeUser(user);

      // 2. Prepare profile data for backend
      const profileData = {
        user_id: user.id,
        email: form.email,
        is_member: user.is_member,
        first_name: form.firstName,
        last_name: form.lastName,
        date_of_birth: form.birthDate,
        gender: form.gender,
        address: form.address,
        city: form.city,
        province: form.province,
        postal_code: form.postalCode,
        phone: form.phone,
        height_cm: form.heightCm ? parseInt(form.heightCm) : undefined,
        weight_kg: form.weightKg ? parseInt(form.weightKg) : undefined,
        bio: form.bio,
        job_title: form.occupation,
        work_type: form.workType,
        employer: form.company,
        salary_range: form.salaryRange,
        years_experience: form.yearsExperience
          ? isNaN(Number(form.yearsExperience))
            ? undefined
            : Number(form.yearsExperience)
          : undefined,
        education: form.education,
        certifications: form.certifications,
        tech_skills: form.techSkills.length
          ? form.techSkills.join(",")
          : undefined,
        looking_for: form.lookingFor,
        preferred_gender: form.preferredGender,
        preferred_age_min: form.preferredAgeMin
          ? parseInt(form.preferredAgeMin)
          : undefined,
        preferred_age_max: form.preferredAgeMax
          ? parseInt(form.preferredAgeMax)
          : undefined,
        relationship_type: form.relationshipType,
        interests: form.interests.length ? form.interests.join(",") : undefined,
        deal_breakers: form.dealBreakers,
      };

      // 3. Save profile
      await saveProfile(user.id, profileData);

      router.replace("/(tabs)/discover");
    } catch {
      // Optionally show error to user
      router.replace("/(tabs)/discover");
    }
  };

  const openPicker = (field: string, options: string[], title: string) =>
    setPicker({ field, options, title });

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {picker && (
        <PickerModal
          visible={true}
          options={picker.options}
          title={picker.title}
          onSelect={(v) => updateField(picker.field, v)}
          onClose={() => setPicker(null)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {error && (
            <Text
              style={{
                color: "#ef4444",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          )}
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🐝</Text>
            <Text style={styles.title}>Join BeesHub</Text>
            <Text style={styles.subtitle}>Find your perfect match in tech</Text>
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  s === step && styles.stepDotActive,
                  s < step && styles.stepDotDone,
                ]}
              >
                <Text
                  style={[
                    styles.stepDotText,
                    (s === step || s < step) && styles.stepDotTextActive,
                  ]}
                >
                  {s}
                </Text>
              </View>
            ))}
          </View>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Basic Info</Text>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor="#9ca3af"
                    value={form.firstName}
                    onChangeText={(v) => updateField("firstName", v)}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor="#9ca3af"
                    value={form.lastName}
                    onChangeText={(v) => updateField("lastName", v)}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor="#9ca3af"
                  value={form.email}
                  onChangeText={(v) => updateField("email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a strong password"
                    placeholderTextColor="#9ca3af"
                    value={form.password}
                    onChangeText={(v) => updateField("password", v)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword((v) => !v)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="yyyy-mm-dd"
                    placeholderTextColor="#9ca3af"
                    value={form.birthDate}
                    onChangeText={(v) => updateField("birthDate", v)}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(416) 555-0123"
                    placeholderTextColor="#9ca3af"
                    value={form.phone}
                    onChangeText={(v) => updateField("phone", v)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123 Queen St W"
                  placeholderTextColor="#9ca3af"
                  value={form.address}
                  onChangeText={(v) => updateField("address", v)}
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Toronto"
                    placeholderTextColor="#9ca3af"
                    value={form.city}
                    onChangeText={(v) => updateField("city", v)}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <SelectButton
                    label="Province"
                    value={form.province}
                    placeholder="Select"
                    onPress={() =>
                      openPicker("province", PROVINCES, "Select Province")
                    }
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="M5V 2H1"
                    placeholderTextColor="#9ca3af"
                    value={form.postalCode}
                    onChangeText={(v) => updateField("postalCode", v)}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>About You</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>I am</Text>
                <View style={styles.optionGroup}>
                  {["Man", "Woman", "Other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.optionBtn,
                        form.gender === g && styles.optionBtnSelected,
                      ]}
                      onPress={() => updateField("gender", g)}
                    >
                      <Text
                        style={[
                          styles.optionBtnText,
                          form.gender === g && styles.optionBtnTextSelected,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="175"
                    placeholderTextColor="#9ca3af"
                    value={form.heightCm}
                    onChangeText={(v) => updateField("heightCm", v)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="70"
                    placeholderTextColor="#9ca3af"
                    value={form.weightKg}
                    onChangeText={(v) => updateField("weightKg", v)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Looking for</Text>
                <View style={styles.optionGroup}>
                  {["Men", "Women", "Everyone"].map((l) => (
                    <TouchableOpacity
                      key={l}
                      style={[
                        styles.optionBtn,
                        form.preferredGender === l && styles.optionBtnSelected,
                      ]}
                      onPress={() => updateField("preferredGender", l)}
                    >
                      <Text
                        style={[
                          styles.optionBtnText,
                          form.preferredGender === l &&
                            styles.optionBtnTextSelected,
                        ]}
                      >
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Looking For</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Adventurous, curious, creative"
                  placeholderTextColor="#9ca3af"
                  value={form.lookingFor}
                  onChangeText={(v) => updateField("lookingFor", v)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Tell potential matches about yourself..."
                  placeholderTextColor="#9ca3af"
                  value={form.bio}
                  onChangeText={(v) => updateField("bio", v)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}

          {/* Step 3: Professional Background */}
          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Professional Background</Text>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Occupation / Role</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Full-Stack Developer"
                    placeholderTextColor="#9ca3af"
                    value={form.occupation}
                    onChangeText={(v) => updateField("occupation", v)}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Company</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Google"
                    placeholderTextColor="#9ca3af"
                    value={form.company}
                    onChangeText={(v) => updateField("company", v)}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <SelectButton
                    label="Work Type"
                    value={form.workType}
                    placeholder="Select"
                    onPress={() =>
                      openPicker("workType", WORK_TYPES, "Work Type")
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <SelectButton
                    label="Salary Range"
                    value={form.salaryRange}
                    placeholder="Prefer not to say"
                    onPress={() =>
                      openPicker("salaryRange", SALARY_RANGES, "Salary Range")
                    }
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <SelectButton
                    label="Years of Experience"
                    value={form.yearsExperience}
                    placeholder="Select"
                    onPress={() =>
                      openPicker(
                        "yearsExperience",
                        YEARS_EXP,
                        "Years of Experience",
                      )
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <SelectButton
                    label="Education"
                    value={form.education}
                    placeholder="Select"
                    onPress={() =>
                      openPicker("education", EDUCATIONS, "Education")
                    }
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Certifications</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. AWS Solutions Architect, PMP"
                  placeholderTextColor="#9ca3af"
                  value={form.certifications}
                  onChangeText={(v) => updateField("certifications", v)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tech Skills</Text>
                <View style={styles.chipsGrid}>
                  {TECH_SKILLS.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.chip,
                        form.techSkills.includes(skill) && styles.chipSelected,
                      ]}
                      onPress={() => toggleTechSkill(skill)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.techSkills.includes(skill) &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>Your Interests</Text>
              <Text style={styles.stepDesc}>
                Select interests to help us find better matches
              </Text>
              <View style={styles.chipsGrid}>
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.chip,
                      form.interests.includes(interest) && styles.chipSelected,
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.interests.includes(interest) &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 5: Match Preferences */}
          {step === 5 && (
            <View>
              <Text style={styles.stepTitle}>Match Preferences</Text>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Preferred Age Min</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="18"
                    placeholderTextColor="#9ca3af"
                    value={form.preferredAgeMin}
                    onChangeText={(v) => updateField("preferredAgeMin", v)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Preferred Age Max</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="35"
                    placeholderTextColor="#9ca3af"
                    value={form.preferredAgeMax}
                    onChangeText={(v) => updateField("preferredAgeMax", v)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Relationship Type</Text>
                <View style={styles.optionGroup}>
                  {[
                    "Friendship",
                    "Casual Dating",
                    "Long-term",
                    "Not sure yet",
                  ].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.optionBtn,
                        form.relationshipType === r && styles.optionBtnSelected,
                      ]}
                      onPress={() => updateField("relationshipType", r)}
                    >
                      <Text
                        style={[
                          styles.optionBtnText,
                          form.relationshipType === r &&
                            styles.optionBtnTextSelected,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Deal Breakers</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="List anything that's a deal breaker for you..."
                  placeholderTextColor="#9ca3af"
                  value={form.dealBreakers}
                  onChangeText={(v) => updateField("dealBreakers", v)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}

          {/* Step 6: Add Photos */}
          {step === 6 && (
            <View>
              <Text style={styles.stepTitle}>Add Photos</Text>
              <Text style={styles.stepDesc}>
                Add at least 2 photos to complete your profile
              </Text>
              <View style={styles.photoGrid}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={styles.photoSlot}>
                    <Text style={styles.photoPlus}>+</Text>
                    {i === 0 && <Text style={styles.photoLabel}>Main</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {step > 1 && (
              <TouchableOpacity style={styles.btnSecondary} onPress={prevStep}>
                <Text style={styles.btnSecondaryText}>Back</Text>
              </TouchableOpacity>
            )}
            {step < totalSteps ? (
              <TouchableOpacity style={styles.btnPrimary} onPress={nextStep}>
                <Text style={styles.btnPrimaryText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleCreateAccount}
              >
                <Text style={styles.btnPrimaryText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.signinLink}>
            Already have an account?{" "}
            <Link href="/signin" style={styles.linkText}>
              Sign in
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fde68a" },
  scrollContent: { flexGrow: 1, padding: 16, paddingVertical: 40 },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: { alignItems: "center", marginBottom: 16 },
  logo: { fontSize: 36, marginBottom: 6 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  subtitle: { fontSize: 13, color: "#6b7280" },
  stepRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { borderColor: "#f59e0b", backgroundColor: "#f59e0b" },
  stepDotDone: { borderColor: "#10b981", backgroundColor: "#10b981" },
  stepDotText: { fontSize: 12, fontWeight: "bold", color: "#9ca3af" },
  stepDotTextActive: { color: "#fff" },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  stepDesc: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  row: { flexDirection: "row" },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 4 },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  textarea: { height: 80, textAlignVertical: "top" },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  passwordInput: { flex: 1, padding: 10, fontSize: 14, color: "#1f2937" },
  eyeBtn: { padding: 10 },
  selectBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBtnText: { fontSize: 14, color: "#1f2937" },
  selectBtnPlaceholder: { fontSize: 14, color: "#9ca3af" },
  optionGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  optionBtnSelected: { borderColor: "#f59e0b", backgroundColor: "#fde68a" },
  optionBtnText: { fontSize: 13, color: "#374151" },
  optionBtnTextSelected: { color: "#b45309", fontWeight: "600" },
  chipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  chipSelected: { borderColor: "#f59e0b", backgroundColor: "#fde68a" },
  chipText: { fontSize: 13, color: "#374151" },
  chipTextSelected: { color: "#b45309", fontWeight: "600" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  photoSlot: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  photoPlus: { fontSize: 24, color: "#9ca3af" },
  photoLabel: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  btnSecondary: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  btnSecondaryText: { fontSize: 15, color: "#374151" },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  btnPrimaryText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  signinLink: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    marginTop: 12,
  },
  linkText: { color: "#f59e0b", fontWeight: "600" },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalOptionText: { fontSize: 15, color: "#374151" },
  modalCancel: { marginTop: 12, alignItems: "center" },
  modalCancelText: { fontSize: 15, color: "#ef4444", fontWeight: "600" },
});
