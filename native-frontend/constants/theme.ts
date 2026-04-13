import { Platform } from 'react-native';

const tintColorLight = '#f59e0b';
const tintColorDark = '#fbbf24';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  light: {
    page: '#f9fafb',
    card: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#d1d5db',
    borderLight: '#f3f4f6',
    inputBg: '#f3f4f6',
    accent: '#f59e0b',
    accentDark: '#d97706',
    accentLight: '#fef3c7',
    accentText: '#d97706',
    danger: '#ef4444',
    dangerLight: '#fecaca',
    tabBar: '#ffffff',
    tabBorder: '#eeeeee',
    avatarBg: '#fef3c7',
    signupPage: '#fde68a',
    shadow: '#000000',
  },
  dark: {
    page: '#0f172a',
    card: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    borderLight: '#1e293b',
    inputBg: '#334155',
    accent: '#f59e0b',
    accentDark: '#fbbf24',
    accentLight: '#1c1400',
    accentText: '#fbbf24',
    danger: '#ef4444',
    dangerLight: '#450a0a',
    tabBar: '#1e293b',
    tabBorder: '#334155',
    avatarBg: '#1c1400',
    signupPage: '#1e293b',
    shadow: '#000000',
  },
};

export type AppColorScheme = typeof AppColors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
