// Profile type
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

export async function getProfile(userId: string): Promise<Profile> {
  const res = await fetch(
    `${BASE_URL}/profiles/${encodeURIComponent(userId)}`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}
const BASE_URL = "http://10.0.2.2:9000/api";

export async function register(email: string, password: string) {
  // ...existing code...
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
  return res.json();
}

export async function login(email: string, password: string) {
  // ...existing code...
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

export async function logout() {
  // ...existing code...
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Logout failed");
  }
  return res.json();
}

// TODO: Add getAllProfiles, getMatches, getActivities, getProfile, saveProfile as needed
