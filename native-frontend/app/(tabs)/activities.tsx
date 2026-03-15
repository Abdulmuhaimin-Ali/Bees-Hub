import React from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
// TODO: Add icons and navigation
// TODO: Adapt getMatches, getActivities from hooks/SignInApi

export default function ActivitiesScreen() {
  // ...existing code...
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Activities</Text>
      {/* TODO: Render activities */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff', 
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
});
