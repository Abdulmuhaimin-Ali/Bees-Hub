import { useState } from "react";
import { Heart, MapPin, Briefcase, Star, Clock, Users } from "lucide-react";
import "./Matches.css";

interface Match {
  id: number;
  name: string;
  age: number;
  location: string;
  occupation: string;
  initials: string;
  bio: string;
  interests: string[];
  compatibility: number;
  gradient: string;
}

interface Activity {
  id: number;
  name: string;
  category: string;
  distance: string;
  rating: number;
  price: string;
  image: string;
  matchScore: number;
  address: string;
  hours: string;
}

const MOCK_MATCHES: Match[] = [
  {
    id: 1,
    name: "Sarah Kim",
    age: 26,
    location: "Toronto, ON",
    occupation: "UX Designer",
    initials: "SK",
    bio: "Creative soul who loves designing beautiful things.",
    interests: ["Coffee", "Art", "Hiking"],
    compatibility: 94,
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
  {
    id: 2,
    name: "Maya Patel",
    age: 27,
    location: "Waterloo, ON",
    occupation: "Data Scientist",
    initials: "MP",
    bio: "Bookworm by day, foodie by night.",
    interests: ["Reading", "Cooking", "Travel"],
    compatibility: 89,
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  },
  // Add more matches as needed
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    name: "Cozy Bean Café",
    category: "Coffee",
    distance: "0.8 km",
    rating: 4.7,
    price: "$$",
    image: "☕",
    matchScore: 95,
    address: "123 Queen St W, Toronto",
    hours: "Open until 9 PM",
  },
  {
    id: 2,
    name: "High Park Trail Walk",
    category: "Outdoors",
    distance: "2.3 km",
    rating: 4.8,
    price: "Free",
    image: "🌿",
    matchScore: 92,
    address: "High Park, Toronto",
    hours: "Open 24/7",
  },
  // Add more activities as needed
];

export default function Matches() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <div className="matches-page">
      <div className="matches-container">
        <div className="matches-sidebar">
          <h2>Your Matches</h2>
          <div className="matches-list">
            {MOCK_MATCHES.map((match) => (
              <div
                key={match.id}
                className={`match-card ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="match-avatar" style={{ background: match.gradient }}>
                  <span className="match-initials">{match.initials}</span>
                </div>
                <div className="match-info">
                  <h3>{match.name}, {match.age}</h3>
                  <p className="match-location">
                    <MapPin size={14} />
                    {match.location}
                  </p>
                  <p className="match-occupation">
                    <Briefcase size={14} />
                    {match.occupation}
                  </p>
                  <div className="match-compatibility">
                    <Heart size={14} />
                    {match.compatibility}% match
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="activities-main">
          <h2>Recommended Activities</h2>
          <div className="activities-list">
            {MOCK_ACTIVITIES.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-image">
                  <span className="activity-emoji">{activity.image}</span>
                </div>
                <div className="activity-info">
                  <h3>{activity.name}</h3>
                  <p className="activity-category">{activity.category}</p>
                  <div className="activity-details">
                    <span className="activity-distance">
                      <MapPin size={14} />
                      {activity.distance}
                    </span>
                    <span className="activity-rating">
                      <Star size={14} />
                      {activity.rating}
                    </span>
                    <span className="activity-price">{activity.price}</span>
                  </div>
                  <p className="activity-address">{activity.address}</p>
                  <p className="activity-hours">
                    <Clock size={14} />
                    {activity.hours}
                  </p>
                  <div className="activity-match-score">
                    <Users size={14} />
                    {activity.matchScore}% match
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}