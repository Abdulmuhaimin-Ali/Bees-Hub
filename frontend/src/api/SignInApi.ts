const BASE_URL = "http://localhost:9000/api";

// Auth

export async function register(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
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
    credentials: "include",
    body: JSON.stringify({ email, password }),
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

export async function getAllProfiles() {
  const res = await fetch(`${BASE_URL}/profiles`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch profiles");
  return res.json() as Promise<Profile[]>;
}

export async function getProfile(userId: string) {
  const res = await fetch(
    `${BASE_URL}/profiles/${encodeURIComponent(userId)}`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json() as Promise<Profile>;
}

export async function saveProfile(userId: string, data: Partial<Profile>) {
  const res = await fetch(
    `${BASE_URL}/profiles/${encodeURIComponent(userId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json() as Promise<Profile>;
}

// Matches

export async function getMatches(): Promise<Profile[]> {
  const res = await fetch(`${BASE_URL}/matches`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

// Activities

export interface Activity {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  price: string;
  emoji: string;
  address: string;
  hours: string;
}

export async function getActivities(
  userId: string,
  matchUserId: string,
): Promise<Activity[]> {
  const res = await fetch(
    `${BASE_URL}/activities?userId=${encodeURIComponent(userId)}&matchUserId=${encodeURIComponent(matchUserId)}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}
