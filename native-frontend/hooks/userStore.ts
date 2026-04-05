import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoredUser {
  id: string;
  email: string;
  is_member: number;
  is_admin: number;
}

const USER_KEY = "beeshub_user";

export async function storeUser(user: StoredUser) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function clearStoredUser() {
  await AsyncStorage.removeItem(USER_KEY);
}
