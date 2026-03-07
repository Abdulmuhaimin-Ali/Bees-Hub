import express from 'express'
const router = express.Router();
import * as db from './db.js'

// Register
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, password);
    const user = db.prepare('SELECT id, email, is_member FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = db.prepare('SELECT id, email, password, is_member FROM users WHERE email = ?').get(email);
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

    const { password: _pw, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate membership activation (no real payment)
router.post('/activate-membership/:userId', (req, res) => {
  const { userId } = req.params;
  try {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    db.prepare('UPDATE users SET is_member = 1, membership_expires = ? WHERE id = ?').run(
      expires.toISOString(), userId
    );
    res.json({ success: true, message: 'Membership activated', expires: expires.toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID (for session refresh)
router.get('/me/:userId', (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, is_member, membership_expires FROM users WHERE id = ?').get(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;