import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Edit3,
  MapPin,
  Briefcase,
  Sparkles,
  LogOut,
  Phone,
  Ruler,
  Weight,
  GraduationCap,
  Code,
  DollarSign,
  Target,
} from "lucide-react";
import "./Profile.css";

const INTERESTS = [
  "Hiking",
  "Cooking",
  "Gaming",
  "Photography",
  "Travel",
  "Music",
  "Fitness",
  "Reading",
  "Coffee",
  "Coding",
];

const TECH_SKILLS_LIST = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "AWS",
  "Docker",
  "Kubernetes",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "Mobile Dev",
  "UI/UX",
];

export default function Profile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Chen",
    age: 28,
    dateOfBirth: "1998-03-15",
    gender: "Man",
    phone: "(416) 555-0199",
    address: "123 Queen St W",
    city: "Toronto",
    province: "ON",
    postalCode: "M5V 2H1",
    occupation: "Full-Stack Developer",
    company: "Shopify",
    workType: "Hybrid",
    salaryRange: "$120k - $180k",
    yearsExperience: "5 - 10",
    education: "Bachelor's",
    certifications: "AWS Solutions Architect",
    techSkills: ["TypeScript", "React", "Node.js", "AWS", "Docker"],
    heightCm: "178",
    weightKg: "75",
    bio: "Passionate developer who loves building things and exploring the outdoors. Looking for someone who shares my love for adventure and good coffee.",
    lookingFor: "Adventurous, curious, and a bit nerdy",
    relationshipType: "Long-term",
    preferredGender: "Women",
    preferredAgeMin: "24",
    preferredAgeMax: "32",
    dealBreakers: "Smoking, dishonesty",
    interests: ["Coding", "Hiking", "Coffee", "Photography", "Travel"],
  });

  const toggleInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleTechSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      techSkills: prev.techSkills.includes(skill)
        ? prev.techSkills.filter((s) => s !== skill)
        : [...prev.techSkills, skill],
    }));
  };

  const location = `${profile.city}, ${profile.province}`;

  return (
    <div className="profile-page">
      <div className="profile-header-bg" />

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar">
              <span className="avatar-initials">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </span>
            </div>
            <button className="avatar-edit">
              <Camera size={16} />
            </button>
          </div>
          <h1 className="profile-name">
            {profile.firstName} {profile.lastName}, {profile.age}
          </h1>
          <div className="profile-meta">
            <span>
              <MapPin size={14} /> {location}
            </span>
            <span>
              <Briefcase size={14} /> {profile.occupation}
            </span>
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

        <div className="profile-grid">
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
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={4}
              />
            ) : (
              <p className="bio-text">{profile.bio}</p>
            )}
          </div>

          {/* Personal Info */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Details</h3>
            </div>
            <div className="info-row">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{profile.dateOfBirth}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Gender</span>
              <span className="info-value">{profile.gender}</span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <Phone size={14} /> Phone
              </span>
              <span className="info-value">{profile.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <MapPin size={14} /> Address
              </span>
              <span className="info-value">{profile.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <MapPin size={14} /> City
              </span>
              <span className="info-value">
                {profile.city}, {profile.province} {profile.postalCode}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <Ruler size={14} /> Height
              </span>
              <span className="info-value">{profile.heightCm} cm</span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <Weight size={14} /> Weight
              </span>
              <span className="info-value">{profile.weightKg} kg</span>
            </div>
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
            <div className="info-row">
              <span className="info-label">Work Type</span>
              <span className="info-value">{profile.workType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <DollarSign size={14} /> Salary
              </span>
              <span className="info-value">{profile.salaryRange}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Experience</span>
              <span className="info-value">
                {profile.yearsExperience} years
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <GraduationCap size={14} /> Education
              </span>
              <span className="info-value">{profile.education}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Certifications</span>
              <span className="info-value">{profile.certifications}</span>
            </div>
          </div>

          {/* Match Preferences */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <Target size={16} /> Match Preferences
              </h3>
            </div>
            <div className="info-row">
              <span className="info-label">Preferred Gender</span>
              <span className="info-value">{profile.preferredGender}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Looking For</span>
              <span className="info-value">{profile.lookingFor}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Relationship Type</span>
              <span className="info-value">{profile.relationshipType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Preferred Age Min</span>
              <span className="info-value">{profile.preferredAgeMin}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Preferred Age Max</span>
              <span className="info-value">{profile.preferredAgeMax}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Deal Breakers</span>
              <span className="info-value">{profile.dealBreakers}</span>
            </div>
          </div>

          {/* Tech Skills */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <Code size={16} /> Tech Skills
              </h3>
              <button className="edit-btn" onClick={() => setEditing(!editing)}>
                <Edit3 size={16} />
              </button>
            </div>
            <div className="profile-interests">
              {(editing ? TECH_SKILLS_LIST : profile.techSkills).map(
                (skill) => (
                  <button
                    key={skill}
                    className={`interest-tag ${profile.techSkills.includes(skill) ? "active" : ""}`}
                    onClick={() => editing && toggleTechSkill(skill)}
                  >
                    {skill}
                  </button>
                ),
              )}
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
              {(editing ? INTERESTS : profile.interests).map((interest) => (
                <button
                  key={interest}
                  className={`interest-tag ${profile.interests.includes(interest) ? "active" : ""}`}
                  onClick={() => editing && toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Grid */}
          <div className="profile-card photos-card">
            <div className="card-header">
              <h3>Photos</h3>
            </div>
            <div className="photos-grid">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <label key={i} className="photo-upload-slot">
                  <input type="file" accept="image/*" hidden />
                  <div className="photo-upload-placeholder">
                    <Camera size={20} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {editing && (
          <button
            className="save-profile-btn"
            onClick={() => setEditing(false)}
          >
            Save Changes
          </button>
        )}

        <button className="sign-out-btn" onClick={() => navigate("/")}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
