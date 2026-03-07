import { NavLink } from 'react-router-dom';
import { Home, User, CalendarHeart, MessageCircle } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🐝</span>
        <span className="brand-name">BeesHub</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Home size={20} />
          <span>Discover</span>
        </NavLink>
        <NavLink to="/activities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <CalendarHeart size={20} />
          <span>Activities</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <MessageCircle size={20} />
          <span>Chat</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
