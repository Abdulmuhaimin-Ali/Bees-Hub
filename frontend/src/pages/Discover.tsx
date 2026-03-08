import { useState, useEffect } from "react";
import { Heart, X, MapPin, Briefcase, Sparkles } from "lucide-react";
import { getAllProfiles, type Profile } from "../api/SignInApi";
import "./Discover.css";

const GRADIENTS = [
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f43f5e, #a855f7)",
];

function getInitials(p: Profile) {
  const first = p.first_name?.[0] ?? "";
  const last = p.last_name?.[0] ?? "";
  return (first + last).toUpperCase() || p.email[0].toUpperCase();
}

function getAge(dob?: string) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

interface MatchProfile {
  id: string;
  name: string;
  age: number | null;
  location: string;
  occupation: string;
  bio: string;
  interests: string[];
  compatibility: number;
  initials: string;
  gradient: string;
}

function toMatchProfile(p: Profile, index: number): MatchProfile {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
  const location = [p.city, p.province].filter(Boolean).join(", ");
  const occupation = [p.job_title, p.employer].filter(Boolean).join(" at ");
  const interests = p.interests
    ? p.interests.split(",").map((s) => s.trim())
    : [];
  return {
    id: p.user_id,
    name,
    age: getAge(p.date_of_birth),
    location: location || "Unknown",
    occupation: occupation || "Not specified",
    bio: p.bio || "",
    interests,
    compatibility: Math.floor(Math.random() * 20 + 80),
    initials: getInitials(p),
    gradient: GRADIENTS[index % GRADIENTS.length],
  };
}

export default function Discover() {
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const currentUserId = stored ? JSON.parse(stored).id : null;

    getAllProfiles()
      .then((data) => {
        const others = currentUserId
          ? data.filter((p) => p.user_id !== currentUserId)
          : data;
        setProfiles(others.map(toMatchProfile));
      })
      .catch((err) => console.error("Failed to load profiles:", err))
      .finally(() => setLoading(false));
  }, []);

  const currentProfile = profiles[0];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setProfiles((prev) => prev.slice(1));
      setSwipeDirection(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="discover-page">
        <div className="discover-container">
          <div className="no-more">
            <span className="no-more-icon">🐝</span>
            <p>Loading profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="discover-page">
        <div className="discover-container">
          <div className="no-more">
            <span className="no-more-icon">🐝</span>
            <h2>No more profiles</h2>
            <p>Check back later for new matches!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-page">
      <div className="discover-container">
        <div className="discover-header">
          <h1>Discover</h1>
          <p>Find your perfect match</p>
        </div>

        <div
          className={`profile-card-stack ${swipeDirection ? `swiping-${swipeDirection}` : ""}`}
        >
          {/* Next card (behind) */}
          {profiles[1] && (
            <div className="profile-card next-card">
              <div
                className="card-avatar"
                style={{ background: profiles[1].gradient }}
              >
                <span>{profiles[1].initials}</span>
              </div>
            </div>
          )}

          {/* Current card */}
          <div className="profile-card current-card">
            <div
              className="card-avatar"
              style={{ background: currentProfile.gradient }}
            >
              <span>{currentProfile.initials}</span>
            </div>
            <div className="card-body">
              <div className="card-name-row">
                <h2>
                  {currentProfile.name}
                  {currentProfile.age ? `, ${currentProfile.age}` : ""}
                </h2>
                <div className="compat-badge">
                  <Sparkles size={14} />
                  {currentProfile.compatibility}%
                </div>
              </div>
              <div className="card-meta">
                <span>
                  <MapPin size={14} /> {currentProfile.location}
                </span>
                <span>
                  <Briefcase size={14} /> {currentProfile.occupation}
                </span>
              </div>
              <p className="card-bio">{currentProfile.bio}</p>
              <div className="card-interests">
                {currentProfile.interests.map((i) => (
                  <span key={i} className="card-interest-tag">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="action-btn pass"
            onClick={() => handleSwipe("left")}
          >
            <X size={28} />
          </button>
          <button
            className="action-btn like"
            onClick={() => handleSwipe("right")}
          >
            <Heart size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
