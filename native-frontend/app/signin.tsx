import React from "react";
import { View, Text, StyleSheet } from "react-native";
// TODO: Add navigation and adapt login from hooks/SignInApi

export default function SignInScreen() {
  // ...existing code...
  return (
    <View style={styles.container}>
      <Text>Sign In Screen (Migrated)</Text>
      {/* TODO: Render sign-in form */}
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
