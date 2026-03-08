import { useState, useEffect } from "react";
import { MapPin, Clock, Users, Star, Heart, DollarSign, Sparkles } from "lucide-react";
import { getMatches, getActivities, type Activity, type Profile } from "../api/SignInApi";
import "./Activities.css";

const GRADIENTS = [
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f43f5e, #a855f7)",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Outdoor Recreation": "🌿",
  "Food & Drink": "🍽️",
  "Arts & Culture": "🎨",
  "Entertainment": "🎭",
  "Nightlife": "🌙",
  "Sports & Fitness": "⚽",
  "Shopping": "🛍️",
  "Wellness": "🧘",
  "Music": "🎵",
  "Adventure": "🏔️",
  "Coffee & Café": "☕",
  "Movies": "🎬",
  "Gaming": "🎮",
  "Beach": "🏖️",
  "Travel": "✈️",
};

function getCategoryEmoji(category: string): string {
  if (CATEGORY_EMOJIS[category]) return CATEGORY_EMOJIS[category];
  const key = Object.keys(CATEGORY_EMOJIS).find((k) =>
    category.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(category.toLowerCase())
  );
  return key ? CATEGORY_EMOJIS[key] : "📍";
}

function renderPriceLevel(price: string) {
  const count = (price.match(/\$/g) || []).length;
  return (
    <span className="price-indicator">
      {Array.from({ length: 4 }, (_, i) => (
        <DollarSign
          key={i}
          size={13}
          className={i < count ? "price-active" : "price-dim"}
        />
      ))}
    </span>
  );
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <span className="stars-row">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          className={
            i < full
              ? "star-filled"
              : i === full && hasHalf
                ? "star-half"
                : "star-empty"
          }
        />
      ))}
      <span className="rating-number">{rating}</span>
    </span>
  );
}

interface MatchEntry {
  name: string;
  initials: string;
  gradient: string;
  interests: string[];
}

function profileToMatch(p: Profile, index: number): [string, MatchEntry] {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
  const initials = ((p.first_name?.[0] ?? "") + (p.last_name?.[0] ?? "")).toUpperCase() || p.email[0].toUpperCase();
  const interests = p.interests ? p.interests.split(",").map((s) => s.trim()) : [];
  return [
    p.user_id,
    { name, initials, gradient: GRADIENTS[index % GRADIENTS.length], interests },
  ];
}

export default function Activities() {
  const [matches, setMatches] = useState<Record<string, MatchEntry>>({});
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activitiesMap, setActivitiesMap] = useState<
    Record<string, Activity[]>
  >({});
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    getMatches()
      .then((profiles) => {
        const entries = profiles.map(profileToMatch);
        setMatches(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to fetch matches:", err))
      .finally(() => setLoadingMatches(false));
  }, []);

  // When a match is selected, fetch activities for that pair
  const fetchActivities = (matchId: string) => {
    setSelectedId(matchId);
    if (activitiesMap[matchId]) return; // already fetched

    const stored = localStorage.getItem("user");
    if (!stored) return;

    setLoadingActivities(true);
    getActivities(matchId)
      .then((data) => {
        setActivitiesMap((prev) => ({ ...prev, [matchId]: data }));
      })
      .catch((err) => {
        console.error("Failed to fetch activities:", err);
      })
      .finally(() => setLoadingActivities(false));
  };

  const matchIds = Object.keys(matches);
  const selectedMatch = selectedId ? matches[selectedId] : null;
  const activities = selectedId ? (activitiesMap[selectedId] ?? []) : [];

  return (
    <div className="activities-page">
      <div className="activities-container">
        {/* Header */}
        <div className="activities-header">
          <h1>Date Activities</h1>
          <p>Pick a match to see couple activity ideas</p>
        </div>

        {/* Matches Row */}
        <div className="matches-row">
          <h3>
            <Heart size={16} /> Your Matches
          </h3>
          {loadingMatches ? (
            <p className="no-matches-text">Loading matches...</p>
          ) : matchIds.length === 0 ? (
            <p className="no-matches-text">
              No matches yet — keep swiping on Discover!
            </p>
          ) : (
            <div className="matches-scroll">
              {matchIds.map((id) => {
                const m = matches[id];
                return (
                  <button
                    key={id}
                    className={`match-bubble ${selectedId === id ? "active" : ""}`}
                    onClick={() => fetchActivities(id)}
                  >
                    <div
                      className="bubble-avatar"
                      style={{ background: m.gradient }}
                    >
                      <span>{m.initials}</span>
                    </div>
                    <span className="bubble-name">{m.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Activities for selected match */}
        {selectedMatch && (
          <>
            <div className="selected-match-header">
              <Users size={16} />
              <span>
                Activities with <strong>{selectedMatch.name}</strong>
              </span>
              {selectedMatch.interests.length > 0 && (
                <div className="shared-interests">
                  {selectedMatch.interests.slice(0, 4).map((i) => (
                    <span key={i} className="interest-chip">
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {loadingActivities ? (
              <p className="loading-text">Loading activities...</p>
            ) : activities.length === 0 ? (
              <div className="no-activities">
                <Sparkles size={32} />
                <p>No activities found for this match yet.</p>
              </div>
            ) : (
              <div className="activities-list">
                {activities.map((activity, idx) => (
                  <div key={idx} className="activity-card">
                    <div className="activity-emoji">
                      {getCategoryEmoji(activity.category)}
                    </div>
                    <div className="activity-info">
                      <div className="activity-top">
                        <h3>{activity.name}</h3>
                        {renderPriceLevel(activity.estimated_cost_per_person)}
                      </div>
                      <span className="activity-category">
                        {activity.category}
                      </span>
                      <div className="activity-details">
                        <span className="detail">
                          {renderStars(activity.rating)}
                        </span>
                        <span className="detail">
                          <Clock size={13} /> Open until {activity.open_until}
                        </span>
                      </div>
                      <div className="activity-reason">
                        <Sparkles size={13} />
                        <span>{activity.reason}</span>
                      </div>
                      <div className="activity-bottom">
                        <span className="activity-address">
                          <MapPin size={13} /> {activity.street}, {activity.city}
                        </span>
                      </div>
                      <button className="suggest-date-btn">
                        Suggest This Date
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
