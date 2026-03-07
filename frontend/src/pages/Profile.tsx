import { useState } from 'react';
import { Camera, Edit3, MapPin, Briefcase, Heart, Sparkles } from 'lucide-react';
import './Profile.css';

const INTERESTS = [
  'Hiking', 'Cooking', 'Gaming', 'Photography', 'Travel',
  'Music', 'Fitness', 'Reading', 'Coffee', 'Coding',
];

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Alex',
    lastName: 'Chen',
    age: 28,
    location: 'Toronto, ON',
    occupation: 'Full-Stack Developer',
    company: 'Shopify',
    bio: 'Passionate developer who loves building things and exploring the outdoors. Looking for someone who shares my love for adventure and good coffee.',
    relationshipGoal: 'Long-term',
    interests: ['Coding', 'Hiking', 'Coffee', 'Photography', 'Travel'],
  });

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div className="profile-page">
      <div className="profile-header-bg" />

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar">
              <span className="avatar-initials">
                {profile.firstName[0]}{profile.lastName[0]}
              </span>
            </div>
            <button className="avatar-edit">
              <Camera size={16} />
            </button>
          </div>
          <h1 className="profile-name">{profile.firstName} {profile.lastName}, {profile.age}</h1>
          <div className="profile-meta">
            <span><MapPin size={14} /> {profile.location}</span>
            <span><Briefcase size={14} /> {profile.occupation}</span>
          </div>
        </div>

        {/* Compatibility Score (mock) */}
        <div className="compatibility-card">
          <Sparkles size={20} />
          <div>
            <strong>Profile Strength: 85%</strong>
            <p>Add more photos to reach 100%</p>
          </div>
        </div>

        {/* Bio */}
        <div className="profile-card">
          <div className="card-header">
            <h3>About Me</h3>
            <button className="edit-btn" onClick={() => setEditing(!editing)}>
              <Edit3 size={16} />
            </button>
          </div>
          {editing ? (
            <textarea
              className="bio-edit"
              value={profile.bio}
              onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
            />
          ) : (
            <p className="bio-text">{profile.bio}</p>
          )}
        </div>

        {/* Professional Info */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Professional</h3>
          </div>
          <div className="info-row">
            <span className="info-label">Role</span>
            <span className="info-value">{profile.occupation}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Company</span>
            <span className="info-value">{profile.company}</span>
          </div>
        </div>

        {/* Relationship Goal */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Looking For</h3>
          </div>
          <div className="goal-badge">
            <Heart size={16} />
            {profile.relationshipGoal}
          </div>
        </div>

        {/* Interests */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Interests</h3>
            <button className="edit-btn" onClick={() => setEditing(!editing)}>
              <Edit3 size={16} />
            </button>
          </div>
          <div className="profile-interests">
            {(editing ? INTERESTS : profile.interests).map(interest => (
              <button
                key={interest}
                className={`interest-tag ${profile.interests.includes(interest) ? 'active' : ''}`}
                onClick={() => editing && toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Photos</h3>
          </div>
          <div className="photos-grid">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <label key={i} className="photo-upload-slot">
                <input type="file" accept="image/*" hidden />
                <div className="photo-upload-placeholder">
                  <Camera size={20} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {editing && (
          <button className="save-profile-btn" onClick={() => setEditing(false)}>
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
