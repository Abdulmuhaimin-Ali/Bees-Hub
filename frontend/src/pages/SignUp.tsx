import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import "./SignUp.css";

const INTERESTS = [
  "Hiking",
  "Cooking",
  "Gaming",
  "Photography",
  "Travel",
  "Music",
  "Fitness",
  "Reading",
  "Movies",
  "Art",
  "Coding",
  "Dancing",
  "Yoga",
  "Coffee",
  "Wine",
  "Sports",
  "Pets",
  "Volunteering",
  "Gardening",
  "Fashion",
];

const TECH_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "React", "Angular", "Vue", "Node.js", "AWS", "Docker", "Kubernetes",
  "Machine Learning", "Data Science", "DevOps", "Mobile Dev", "UI/UX",
];

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
    phone: "",
    city: "",
    address: "",
    province: "",
    postalCode: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    bio: "",
    lookingFor: "",
    occupation: "",
    company: "",
    workType: "",
    salaryRange: "",
    yearsExperience: "",
    education: "",
    certifications: "",
    techSkills: [] as string[],
    interests: [] as string[],
    preferredGender: "",
    preferredAgeMin: "",
    preferredAgeMax: "",
    relationshipType: "",
    dealBreakers: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleTechSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      techSkills: prev.techSkills.includes(skill)
        ? prev.techSkills.filter((s) => s !== skill)
        : [...prev.techSkills, skill],
    }));
  };

  const totalSteps = 6;
  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-logo">🐝</span>
          <h1>Join BeesHub</h1>
          <p>Find your perfect match in tech</p>
        </div>

        <div className="step-indicator">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`step-dot ${s === step ? "active" : ""} ${s < step ? "done" : ""}`}
            >
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="step-content">
            <h2>Basic Info</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="(416) 555-0123"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="123 Queen St W"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  placeholder="Toronto"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Province</label>
                <select
                  value={form.province}
                  onChange={(e) => updateField("province", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>ON</option>
                  <option>BC</option>
                  <option>QC</option>
                  <option>AB</option>
                  <option>MB</option>
                  <option>SK</option>
                  <option>NS</option>
                  <option>NB</option>
                  <option>NL</option>
                  <option>PE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  placeholder="M5V 2H1"
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>About You</h2>
            <div className="form-group">
              <label>I am</label>
              <div className="option-group">
                {["Man", "Woman", "Other"].map((g) => (
                  <button
                    key={g}
                    className={`option-btn ${form.gender === g ? "selected" : ""}`}
                    onClick={() => updateField("gender", g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  value={form.heightCm}
                  onChange={(e) => updateField("heightCm", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={form.weightKg}
                  onChange={(e) => updateField("weightKg", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Looking for</label>
              <div className="option-group">
                {["Men", "Women", "Everyone"].map((l) => (
                  <button
                    key={l}
                    className={`option-btn ${form.preferredGender === l ? "selected" : ""}`}
                    onClick={() => updateField("preferredGender", l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Looking For</label>
              <input
                type="text"
                placeholder="e.g. Adventurous, curious, creative"
                value={form.lookingFor}
                onChange={(e) => updateField("lookingFor", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                placeholder="Tell potential matches about yourself..."
                rows={3}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2>Professional Background</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Occupation / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Developer"
                  value={form.occupation}
                  onChange={(e) => updateField("occupation", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Work Type</label>
                <select
                  value={form.workType}
                  onChange={(e) => updateField("workType", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Remote</option>
                  <option>On-site</option>
                  <option>Hybrid</option>
                  <option>Freelance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Salary Range</label>
                <select
                  value={form.salaryRange}
                  onChange={(e) => updateField("salaryRange", e.target.value)}
                >
                  <option value="">Prefer not to say</option>
                  <option>$30k - $50k</option>
                  <option>$50k - $80k</option>
                  <option>$80k - $120k</option>
                  <option>$120k - $180k</option>
                  <option>$180k+</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Years of Experience</label>
                <select
                  value={form.yearsExperience}
                  onChange={(e) => updateField("yearsExperience", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>0 - 1</option>
                  <option>1 - 3</option>
                  <option>3 - 5</option>
                  <option>5 - 10</option>
                  <option>10+</option>
                </select>
              </div>
              <div className="form-group">
                <label>Education</label>
                <select
                  value={form.education}
                  onChange={(e) => updateField("education", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>High School</option>
                  <option>College Diploma</option>
                  <option>Bachelor's</option>
                  <option>Master's</option>
                  <option>PhD</option>
                  <option>Bootcamp</option>
                  <option>Self-taught</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Certifications</label>
              <input
                type="text"
                placeholder="e.g. AWS Solutions Architect, PMP"
                value={form.certifications}
                onChange={(e) => updateField("certifications", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tech Skills</label>
              <div className="interests-grid">
                {TECH_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    className={`interest-chip ${form.techSkills.includes(skill) ? "selected" : ""}`}
                    onClick={() => toggleTechSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2>Your Interests</h2>
            <p className="step-desc">Select interests to help us find better matches</p>
            <div className="interests-grid">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  className={`interest-chip ${form.interests.includes(interest) ? "selected" : ""}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content">
            <h2>Match Preferences</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Age Min</label>
                <input
                  type="number"
                  placeholder="18"
                  value={form.preferredAgeMin}
                  onChange={(e) => updateField("preferredAgeMin", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Preferred Age Max</label>
                <input
                  type="number"
                  placeholder="35"
                  value={form.preferredAgeMax}
                  onChange={(e) => updateField("preferredAgeMax", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Relationship Type</label>
              <div className="option-group">
                {["Friendship", "Casual Dating", "Long-term", "Not sure yet"].map((r) => (
                  <button
                    key={r}
                    className={`option-btn ${form.relationshipType === r ? "selected" : ""}`}
                    onClick={() => updateField("relationshipType", r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Deal Breakers</label>
              <textarea
                placeholder="List anything that's a deal breaker for you..."
                rows={3}
                value={form.dealBreakers}
                onChange={(e) => updateField("dealBreakers", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="step-content">
            <h2>Add Photos</h2>
            <p className="step-desc">
              Add at least 2 photos to complete your profile
            </p>
            <div className="photo-grid">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <label key={i} className="photo-slot">
                  <input type="file" accept="image/*" hidden />
                  <div className="photo-placeholder">
                    <span className="photo-plus">+</span>
                    {i === 0 && <span className="photo-label">Main</span>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="step-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={prevStep}>
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button className="btn-primary" onClick={nextStep}>
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <Link to="/discover" className="btn-primary">
              Create Account <ArrowRight size={18} />
            </Link>
          )}
        </div>

        <p className="signin-link">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
