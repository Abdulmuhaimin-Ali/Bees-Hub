import { useState } from 'react';
import { MapPin, Clock, Users, Navigation, Star, Filter, Calendar } from 'lucide-react';
import './Activities.css';

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

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1, name: 'Cozy Bean Café', category: 'Coffee',
    distance: '0.8 km', rating: 4.7, price: '$$', image: '☕',
    matchScore: 95, address: '123 Queen St W, Toronto',
    hours: 'Open until 9 PM',
  },
  {
    id: 2, name: 'High Park Trail Walk', category: 'Outdoors',
    distance: '2.3 km', rating: 4.8, price: 'Free', image: '🌿',
    matchScore: 92, address: 'High Park, Toronto',
    hours: 'Open 24/7',
  },
  {
    id: 3, name: 'Pixel & Pour Arcade Bar', category: 'Entertainment',
    distance: '1.5 km', rating: 4.5, price: '$$', image: '🎮',
    matchScore: 88, address: '456 King St W, Toronto',
    hours: 'Open until 2 AM',
  },
  {
    id: 4, name: 'Art Gallery of Ontario', category: 'Culture',
    distance: '3.1 km', rating: 4.9, price: '$$$', image: '🎨',
    matchScore: 85, address: '317 Dundas St W, Toronto',
    hours: 'Open until 6 PM',
  },
  {
    id: 5, name: 'Sushi Masaki Omakase', category: 'Dining',
    distance: '1.2 km', rating: 4.6, price: '$$$$', image: '🍣',
    matchScore: 82, address: '33 Harbour St, Toronto',
    hours: 'Open until 11 PM',
  },
  {
    id: 6, name: 'Toronto Rock Climbing', category: 'Fitness',
    distance: '4.0 km', rating: 4.4, price: '$$', image: '🧗',
    matchScore: 78, address: '800 Dundas St E, Toronto',
    hours: 'Open until 10 PM',
  },
];

const CATEGORIES = ['All', 'Coffee', 'Outdoors', 'Entertainment', 'Culture', 'Dining', 'Fitness'];

export default function Activities() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAvailability, setShowAvailability] = useState(false);
  const [availability, setAvailability] = useState({
    day: '',
    startTime: '',
    endTime: '',
  });

  const filtered = selectedCategory === 'All'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(a => a.category === selectedCategory);

  return (
    <div className="activities-page">
      <div className="activities-container">
        {/* Header */}
        <div className="activities-header">
          <h1>Date Activities</h1>
          <p>Discover perfect date spots based on your shared interests</p>
        </div>

        {/* Availability Scheduler */}
        <div className="availability-section">
          <button
            className="availability-toggle"
            onClick={() => setShowAvailability(!showAvailability)}
          >
            <Calendar size={18} />
            Set Your Availability
          </button>
          {showAvailability && (
            <div className="availability-form">
              <div className="avail-field">
                <label>Day</label>
                <select
                  value={availability.day}
                  onChange={e => setAvailability(prev => ({ ...prev, day: e.target.value }))}
                >
                  <option value="">Select day</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </div>
              <div className="avail-field">
                <label>From</label>
                <input
                  type="time"
                  value={availability.startTime}
                  onChange={e => setAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="avail-field">
                <label>To</label>
                <input
                  type="time"
                  value={availability.endTime}
                  onChange={e => setAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <button className="avail-save-btn">Save</button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="category-filters">
          <Filter size={16} className="filter-icon" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Activities List */}
        <div className="activities-list">
          {filtered.map(activity => (
            <div key={activity.id} className="activity-card">
              <div className="activity-emoji">{activity.image}</div>
              <div className="activity-info">
                <div className="activity-top">
                  <h3>{activity.name}</h3>
                  <span className="match-badge">
                    <Users size={12} /> {activity.matchScore}% match
                  </span>
                </div>
                <span className="activity-category">{activity.category}</span>
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
                  <span className="activity-price">{activity.price}</span>
                </div>
                <button className="suggest-date-btn">Suggest This Date</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
