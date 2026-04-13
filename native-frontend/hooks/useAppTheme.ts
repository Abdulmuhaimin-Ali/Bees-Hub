import { useThemeContext } from "@/context/ThemeContext";
import type { AppColorScheme } from "@/constants/theme";

export function useAppTheme(): AppColorScheme {
  return useThemeContext().colors;
}
