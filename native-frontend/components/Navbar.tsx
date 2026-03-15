import React from "react";
import { View, Text, StyleSheet } from "react-native";
// TODO: Add navigation and icons

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <Text style={styles.brand}>🐝 BeesHub</Text>
      {/* TODO: Add navigation links */}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
