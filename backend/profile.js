import express from 'express'
import * as db from './db.js'
const router = express.Router();
import path from 'path'
import multer from 'multer'
import {run, get, all} from './db.js'


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, './uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all profiles
router.get('/', async (req, res) => {
    try {
      const profiles = await all(`
        SELECT p.*, u.email, u.is_member
        FROM profiles p
        JOIN users u ON p.user_id = u.id
      `);
      res.json(profiles);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get single profile
  router.get('/:userId', async (req, res) => {
    try {
      const profile = await get(`
        SELECT p.*, u.email, u.is_member
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
      `, [req.params.userId]);
  
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Create or update profile
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const data = req.body;

  try {
    const existing = await get('SELECT id FROM profiles WHERE user_id = ?', [userId]);

    const fields = [
      'first_name', 'last_name', 'gender', 'address', 'city',
      'province', 'postal_code', 'phone', 'height_cm', 'weight_kg', 'age', 'bio',
      'job_title', 'work_type', 'employer', 'salary_range', 'years_experience',
      'education', 'certifications', 'tech_skills', 'looking_for', 'preferred_gender',
      'preferred_age_min', 'preferred_age_max', 'relationship_type', 'interests'
    ];

    if (existing) {
      const setClauses = fields.map(f => `${f} = ?`).join(', ');
      const values = [...fields.map(f => data[f] ?? null), userId];
       await run(`UPDATE profiles SET ${setClauses}, updated_at = datetime('now') WHERE user_id = ?`, values);
    } else {
      const cols = ['user_id', ...fields].join(', ');
      const placeholders = fields.map(() => '?').join(', ');
      const values = [userId, ...fields.map(f => data[f] ?? null)];
       await run(`INSERT INTO profiles (${cols}) VALUES (?, ${placeholders})`, values);
    }

    const profile = await get('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload photo
router.post('/:userId/photo', upload.single('photo'), async (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const photoUrl = `/uploads/${req.file.filename}`;
    const existing = await db.get('SELECT id FROM profiles WHERE user_id = ?')
    if (existing) {
      await db.get('UPDATE profiles SET photo_url = ? WHERE user_id = ?')
    } else {
      await db.get('INSERT INTO profiles (user_id, photo_url) VALUES (?, ?)')
    }
    res.json({ photo_url: photoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get matches's dates
router.get('/activities/:user1_id/:user2_id', async (req, res) => {
  try {
    const dates = await get(`
    SELECT d.*
    FROM dates d
    JOIN matches m ON d.match_id = m.id
    WHERE m.user1_id = ? AND m.user2_id = ?
    `, [req.params.user1_id, req.params.user2_id]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  finally {
    res.json(dates)
  }
});

// get user's matches
router.get('/matches', async (req, res) => {
  try {
    const dates = await get(`
    SELECT d.*
    FROM dates d
    JOIN matches m ON d.match_id = m.id
    WHERE m.user1_id = ? AND m.user2_id = ?
    `, [req.params.user1_id, req.params.user2_id]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  finally {
    res.json(dates)
  }
});

export default router;