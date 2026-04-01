import Constants from "expo-constants";

function getBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.experienceUrl;

  if (hostUri) {
    const host = hostUri.replace(/^[a-z]+:\/\//, "").split(":")[0];
    return `http://${host}:9000/api`;
  }

  return "http://10.0.2.2:9000/api";
}

const BASE_URL = getBaseUrl();

// Auth

export async function register(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
  return res.json() as Promise<{
    success: boolean;
    user: { id: string; email: string; is_member: number };
  }>;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json() as Promise<{
    success: boolean;
    user: { id: string; email: string; is_member: number };
  }>;
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
  return res.json() as Promise<{ success: boolean }>;
}

// Profiles

export interface Profile {
  user_id: string;
  email: string;
  is_member: number;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  height_cm?: number;
  weight_kg?: number;
  bio?: string;
  job_title?: string;
  work_type?: string;
  employer?: string;
  salary_range?: string;
  years_experience?: number;
  education?: string;
  certifications?: string;
  tech_skills?: string;
  looking_for?: string;
  preferred_gender?: string;
  preferred_age_min?: number;
  preferred_age_max?: number;
  relationship_type?: string;
  interests?: string;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const res = await fetch(`${BASE_URL}/profiles`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch profiles");
  return res.json();
}

export async function getProfile(userId: string): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/profiles/${encodeURIComponent(userId)}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function saveProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/profiles/${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

// Matches

export async function getMatches(): Promise<Profile[]> {
  const res = await fetch(`${BASE_URL}/matches`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

// Activities

export interface Activity {
  name: string;
  category: string;
  street: string;
  city: string;
  rating: number;
  estimated_cost_per_person: string;
  open_until: string;
  reason: string;
}

export async function getActivities(matchUserId: string): Promise<Activity[]> {
  const res = await fetch(`${BASE_URL}/activity/${encodeURIComponent(matchUserId)}`);
  if (!res.ok) throw new Error("Failed to fetch activities");
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}
