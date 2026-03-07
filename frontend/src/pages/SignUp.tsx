import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import './SignUp.css';

const INTERESTS = [
  'Hiking', 'Cooking', 'Gaming', 'Photography', 'Travel',
  'Music', 'Fitness', 'Reading', 'Movies', 'Art',
  'Coding', 'Dancing', 'Yoga', 'Coffee', 'Wine',
  'Sports', 'Pets', 'Volunteering', 'Gardening', 'Fashion',
];

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: '',
    gender: '',
    lookingFor: '',
    relationshipGoal: '',
    bio: '',
    occupation: '',
    company: '',
    interests: [] as string[],
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-logo">🐝</span>
          <h1>Join BeesHub</h1>
          <p>Find your perfect match in tech</p>
        </div>

        <div className="step-indicator">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`step-dot ${s === step ? 'active' : ''} ${s < step ? 'done' : ''}`}>
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
                  onChange={e => updateField('firstName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={e => updateField('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={e => updateField('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
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
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => updateField('birthDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>About You</h2>
            <div className="form-group">
              <label>I am</label>
              <div className="option-group">
                {['Man', 'Woman', 'Non-binary', 'Other'].map(g => (
                  <button
                    key={g}
                    className={`option-btn ${form.gender === g ? 'selected' : ''}`}
                    onClick={() => updateField('gender', g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Looking for</label>
              <div className="option-group">
                {['Men', 'Women', 'Everyone'].map(l => (
                  <button
                    key={l}
                    className={`option-btn ${form.lookingFor === l ? 'selected' : ''}`}
                    onClick={() => updateField('lookingFor', l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Relationship Goal</label>
              <div className="option-group">
                {['Friendship', 'Casual Dating', 'Long-term', 'Not sure yet'].map(r => (
                  <button
                    key={r}
                    className={`option-btn ${form.relationshipGoal === r ? 'selected' : ''}`}
                    onClick={() => updateField('relationshipGoal', r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                placeholder="Tell potential matches about yourself..."
                rows={3}
                value={form.bio}
                onChange={e => updateField('bio', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2>Professional Background</h2>
            <div className="form-group">
              <label>Occupation / Role</label>
              <input
                type="text"
                placeholder="e.g. Full-Stack Developer"
                value={form.occupation}
                onChange={e => updateField('occupation', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={form.company}
                onChange={e => updateField('company', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Select Your Interests</label>
              <div className="interests-grid">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    className={`interest-chip ${form.interests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2>Add Photos</h2>
            <p className="step-desc">Add at least 2 photos to complete your profile</p>
            <div className="photo-grid">
              {[0, 1, 2, 3, 4, 5].map(i => (
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
          {step < 4 ? (
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
