import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../hooks/SignInApi";
import { storeUser } from "../hooks/userStore";
import { useAppTheme } from "../hooks/useAppTheme";
import type { AppColorScheme } from "../constants/theme";

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const colors = useAppTheme();
  const styles = makeStyles(colors);

  const handleSignIn = async () => {
    setError("");
    try {
      const { user } = await login(email, password);
      await storeUser(user);
      router.replace(user.is_admin ? "/(tabs)/admin" : "/(tabs)/discover");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>🐝</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to BeesHub</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
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
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.btnSignin} onPress={handleSignIn}>
              <Text style={styles.btnSigninText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.signupLink}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={styles.linkText}>
              Sign up
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: AppColorScheme) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.signupPage,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    container: {
      backgroundColor: c.card,
      borderRadius: 20,
      padding: 28,
      shadowColor: c.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    header: {
      alignItems: "center",
      marginBottom: 24,
    },
    logo: {
      fontSize: 40,
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: c.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
    },
    form: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: c.textPrimary,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: c.inputBg,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: c.textPrimary,
    },
    passwordRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.inputBg,
      borderRadius: 10,
    },
    passwordInput: {
      flex: 1,
      padding: 12,
      fontSize: 15,
      color: c.textPrimary,
    },
    eyeBtn: {
      padding: 12,
    },
    errorText: {
      color: c.danger,
      fontSize: 13,
      marginTop: 8,
    },
    btnSignin: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.accent,
      borderRadius: 10,
      paddingVertical: 14,
      marginTop: 20,
      gap: 8,
    },
    btnSigninText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    signupLink: {
      textAlign: "center",
      fontSize: 14,
      color: c.textSecondary,
    },
    linkText: {
      color: c.accent,
      fontWeight: "600",
    },
  });
}
