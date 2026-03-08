import { useState, useEffect } from "react";
import { MapPin, Clock, Users, Navigation, Star, Heart } from "lucide-react";
import { getMatches, getActivities, type Activity, type Profile } from "../api/SignInApi";
import "./Activities.css";

const GRADIENTS = [
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f43f5e, #a855f7)",
];

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
    const user = JSON.parse(stored);

    setLoadingActivities(true);
    getActivities(user.id, matchId)
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
            ) : (
              <div className="activities-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-emoji">{activity.emoji}</div>
                    <div className="activity-info">
                      <div className="activity-top">
                        <h3>{activity.name}</h3>
                        <span className="activity-price">{activity.price}</span>
                      </div>
                      <span className="activity-category">
                        {activity.category}
                      </span>
                      <div className="activity-details">
                        <span className="detail">
                          <Navigation size={13} /> {activity.distance}
                        </span>
                        <span className="detail">
                          <Star size={13} /> {activity.rating}
                        </span>
                        <span className="detail">
                          <Clock size={13} /> {activity.hours}
                        </span>
                      </div>
                      <div className="activity-bottom">
                        <span className="activity-address">
                          <MapPin size={13} /> {activity.address}
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
