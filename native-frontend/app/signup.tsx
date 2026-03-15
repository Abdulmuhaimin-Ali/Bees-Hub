import React from "react";
import { View, Text, StyleSheet } from "react-native";
// TODO: Add navigation and adapt register from hooks/SignInApi

export default function SignUpScreen() {
  // ...existing code...
  return (
    <View style={styles.container}>
      <Text>Sign Up Screen (Migrated)</Text>
      {/* TODO: Render sign-up form */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
