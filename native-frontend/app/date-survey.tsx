import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DateSurveyScreen() {
  const { matchName } = useLocalSearchParams<{ matchName: string }>();
  const [highlight, setHighlight] = useState("");
  const [wouldSeeAgain, setWouldSeeAgain] = useState("");
  const [rating, setRating] = useState(0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.emoji}>🐝</Text>
          <Text style={styles.title}>How was your date?</Text>
          {matchName ? (
            <Text style={styles.subtitle}>
              Tell us about your time with{" "}
              <Text style={{ fontWeight: "700" }}>{matchName}</Text>
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Share a little about how it went
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.questionLabel}>
            1. What was the highlight of your date?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. We had amazing coffee and talked for hours..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={highlight}
            onChangeText={setHighlight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.questionLabel}>
            2. Would you go on another date with them?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. Definitely! We already made plans for next week..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={wouldSeeAgain}
            onChangeText={setWouldSeeAgain}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.questionLabel}>Rate your date</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1;
              return (
                <TouchableOpacity
                  key={value}
                  style={styles.starBtn}
                  onPress={() => setRating(value)}
                >
                  <Ionicons
                    name={rating >= value ? "star" : "star-outline"}
                    size={36}
                    color={rating >= value ? "#f59e0b" : "#d1d5db"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0
              ? "Tap a star to rate"
              : rating === 1
              ? "Not great"
              : rating === 2
              ? "It was okay"
              : rating === 3
              ? "Pretty good"
              : rating === 4
              ? "Really good!"
              : "Amazing! 🎉"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => router.replace("/(tabs)/discover")}
        >
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  topRow: {
    marginBottom: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  emoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 21,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  questionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    minHeight: 100,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  starBtn: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f59e0b",
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
