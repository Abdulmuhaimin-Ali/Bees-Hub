import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppColors, type AppColorScheme } from "@/constants/theme";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  colors: AppColorScheme;
  isDark: boolean;
}

const THEME_KEY = "beeshub_theme";

const ThemeContext = createContext<ThemeContextValue>({
  preference: "system",
  setPreference: () => {},
  colors: AppColors.light,
  isDark: false,
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme() ?? "light";
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") {
        setPreferenceState(v);
      }
    });
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(THEME_KEY, p);
  };

  const resolved = preference === "system" ? system : preference;
  const colors = AppColors[resolved];
  const isDark = resolved === "dark";

  return (
    <ThemeContext.Provider value={{ preference, setPreference, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
