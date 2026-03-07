import { useState } from "react";
import { Heart, X, MapPin, Briefcase, Sparkles } from "lucide-react";
import "./Discover.css";

interface MatchProfile {
  id: number;
  name: string;
  age: number;
  location: string | null;
  occupation: string;
  bio: string;
  interests: string[];
  compatibility: number;
  initials: string;
  gradient: string;
}

const PROFILES: MatchProfile[] = [
  {
<<<<<<< HEAD
    id: 1, name: 'Sarah Kim', age: 26, location: null,
    occupation: 'UX Designer at Meta', initials: 'SK',
    bio: 'Creative soul who loves designing beautiful things and exploring hidden cafés.',
    interests: ['Coffee', 'Art', 'Hiking', 'Photography'],
    compatibility: 94, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
=======
    id: 1,
    name: "Sarah Kim",
    age: 26,
    location: "Toronto, ON",
    occupation: "UX Designer at Meta",
    initials: "SK",
    bio: "Creative soul who loves designing beautiful things and exploring hidden cafés.",
    interests: ["Coffee", "Art", "Hiking", "Photography"],
    compatibility: 94,
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
>>>>>>> 1bf592f9bf7bb5a3ce578d592055ec5b557f6891
  },
  {
    id: 2,
    name: "Maya Patel",
    age: 27,
    location: "Waterloo, ON",
    occupation: "Data Scientist at Google",
    initials: "MP",
    bio: "Bookworm by day, foodie by night. Always up for a spontaneous road trip.",
    interests: ["Reading", "Cooking", "Travel", "Yoga"],
    compatibility: 89,
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  },
  {
    id: 3,
    name: "Emily Rivera",
    age: 25,
    location: "Vancouver, BC",
    occupation: "Frontend Dev at Stripe",
    initials: "ER",
    bio: "Music festival enthusiast and weekend hiker. Let's grab a coffee and talk about life.",
    interests: ["Music", "Fitness", "Coffee", "Coding"],
    compatibility: 87,
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
  },
  {
    id: 4,
    name: "Jordan Lee",
    age: 29,
    location: "Montreal, QC",
    occupation: "Product Manager at Shopify",
    initials: "JL",
    bio: "Passionate about tech, sustainability, and great conversation over good food.",
    interests: ["Gaming", "Cooking", "Travel", "Movies"],
    compatibility: 82,
    gradient: "linear-gradient(135deg, #10b981, #14b8a6)",
  },
];

export default function Discover() {
  const [profiles, setProfiles] = useState(PROFILES);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  const currentProfile = profiles[0];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setProfiles((prev) => prev.slice(1));
      setSwipeDirection(null);
    }, 300);
  };
  
  const orNothing = (profileField: any, prop: React.JSX.IntrinsicElements ) => {
    return profileField === null ? "" : prop
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

<<<<<<< HEAD
        {/* TODO: shows profiles based on swip direction */}
        <div className={`profile-card-stack ${profiles.length > 1 ? `swiping-${swipeDirection}` : ''}`}>
=======
        <div
          className={`profile-card-stack ${swipeDirection ? `swiping-${swipeDirection}` : ""}`}
        >
>>>>>>> 1bf592f9bf7bb5a3ce578d592055ec5b557f6891
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
                  {currentProfile.name}, {currentProfile.age}
                </h2>
                <div className="compat-badge">
                  <Sparkles size={14} />
                  {currentProfile.compatibility}%
                </div>
              </div>
              <div className="card-meta">
<<<<<<< HEAD
                { currentProfile.location ? <span><MapPin size={14} /> {currentProfile.location}</span> : <span></span>}
                {/*<span><MapPin size={14} /> {currentProfile.location}</span>*/}
                <span><Briefcase size={14} /> {currentProfile.occupation}</span>
=======
                <span>
                  <MapPin size={14} /> {currentProfile.location}
                </span>
                <span>
                  <Briefcase size={14} /> {currentProfile.occupation}
                </span>
>>>>>>> 1bf592f9bf7bb5a3ce578d592055ec5b557f6891
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
