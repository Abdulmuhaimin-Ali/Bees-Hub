import { useState } from "react";
import { MapPin, Clock, Users, Navigation, Star, Heart } from "lucide-react";
import { getActivities, type Activity } from "../api/SignInApi";
import "./Activities.css";

interface MatchEntry {
  name: string;
  initials: string;
  gradient: string;
  interests: string[];
}

// Fallback activities when endpoint Not Finished
const FALLBACK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    name: "Cozy Bean Café",
    category: "Coffee",
    distance: "0.8 km",
    rating: 4.7,
    price: "$$",
    emoji: "☕",
    address: "123 Queen St W, Toronto",
    hours: "Open until 9 PM",
  },
  {
    id: "2",
    name: "High Park Trail Walk",
    category: "Outdoors",
    distance: "2.3 km",
    rating: 4.8,
    price: "Free",
    emoji: "🌿",
    address: "High Park, Toronto",
    hours: "Open 24/7",
  },
  {
    id: "3",
    name: "Pixel & Pour Arcade Bar",
    category: "Entertainment",
    distance: "1.5 km",
    rating: 4.5,
    price: "$$",
    emoji: "🎮",
    address: "456 King St W, Toronto",
    hours: "Open until 2 AM",
  },
  {
    id: "4",
    name: "Art Gallery of Ontario",
    category: "Culture",
    distance: "3.1 km",
    rating: 4.9,
    price: "$$$",
    emoji: "🎨",
    address: "317 Dundas St W, Toronto",
    hours: "Open until 6 PM",
  },
  {
    id: "5",
    name: "Sushi Masaki Omakase",
    category: "Dining",
    distance: "1.2 km",
    rating: 4.6,
    price: "$$$$",
    emoji: "🍣",
    address: "33 Harbour St, Toronto",
    hours: "Open until 11 PM",
  },
  {
    id: "6",
    name: "Toronto Rock Climbing",
    category: "Fitness",
    distance: "4.0 km",
    rating: 4.4,
    price: "$$",
    emoji: "🧗",
    address: "800 Dundas St E, Toronto",
    hours: "Open until 10 PM",
  },
];

export default function Activities() {
  const [matches] = useState<Record<string, MatchEntry>>(() => {
    const raw = localStorage.getItem("matches");
    return raw ? JSON.parse(raw) : {};
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activitiesMap, setActivitiesMap] = useState<
    Record<string, Activity[]>
  >({});
  const [loadingActivities, setLoadingActivities] = useState(false);

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
      .catch(() => {
        // Endpoint not ready yet — use fallback
        setActivitiesMap((prev) => ({
          ...prev,
          [matchId]: FALLBACK_ACTIVITIES,
        }));
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
          {matchIds.length === 0 ? (
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
