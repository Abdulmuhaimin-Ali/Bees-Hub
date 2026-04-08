import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getStoredUser, type StoredUser } from "@/hooks/userStore";

// BeesHub yellow for active tab
const beesHubActive = "#fbbf24";
const beesHubInactive = "#999";

export default function TabLayout() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser()
      .then((storedUser) => setUser(storedUser))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: beesHubActive,
        tabBarInactiveTintColor: beesHubInactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { height: -2, width: 0 },
        },
      }}
    >
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: user?.is_admin ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="shield.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          href: user?.is_admin ? null : undefined,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: "Matches",
          href: user?.is_admin ? null : undefined,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
      name="checkout"
      options={{
        href: null,
      }}
/>
    </Tabs>
  );
}
