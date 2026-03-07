import express from 'express'
import * as db from './db'
const router = express.Router();
import path from 'path'
import multer from 'multer'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, './uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all profiles (public - for browsing, non-members can view)
router.get('/', (req, res) => {
  try {
    const profiles = db.prepare(`
      SELECT p.*, u.email, u.is_member
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.updated_at DESC
    `).all();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single profile
router.get('/:userId', (req, res) => {
  try {
    const profile = db.prepare(`
      SELECT p.*, u.email, u.is_member
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `).get(req.params.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update profile
router.post('/:userId', (req, res) => {
  const { userId } = req.params;
  const data = req.body;

  try {
    const existing = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(userId);

    const fields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'city',
      'province', 'postal_code', 'phone', 'height_cm', 'weight_kg', 'bio',
      'job_title', 'work_type', 'employer', 'salary_range', 'years_experience',
      'education', 'certifications', 'tech_skills', 'looking_for', 'preferred_gender',
      'preferred_age_min', 'preferred_age_max', 'relationship_type', 'interests', 'deal_breakers'
    ];

    if (existing) {
      const setClauses = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => data[f] ?? null);
      db.prepare(`UPDATE profiles SET ${setClauses}, updated_at = datetime('now') WHERE user_id = ?`)
        .run(...values, userId);
    } else {
      const cols = ['user_id', ...fields].join(', ');
      const placeholders = ['?', ...fields.map(() => '?')].join(', ');
      const values = [userId, ...fields.map(f => data[f] ?? null)];
      db.prepare(`INSERT INTO profiles (${cols}) VALUES (${placeholders})`).run(...values);
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload photo
router.post('/:userId/photo', upload.single('photo'), (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const photoUrl = `/uploads/${req.file.filename}`;
    const existing = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare('UPDATE profiles SET photo_url = ? WHERE user_id = ?').run(photoUrl, userId);
    } else {
      db.prepare('INSERT INTO profiles (user_id, photo_url) VALUES (?, ?)').run(userId, photoUrl);
    }
    res.json({ photo_url: photoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;