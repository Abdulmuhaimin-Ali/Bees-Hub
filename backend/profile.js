import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { run, get, all } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// Get all profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await all(`
        SELECT p.*, u.email, u.is_member
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE u.is_admin = 0
      `);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single profile
router.get("/:userId", async (req, res) => {
  try {
    const profile = await get(
      `
        SELECT p.*, u.email, u.is_member
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
      `,
      [req.params.userId],
    );

    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update profile
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const data = req.body;

  try {
    const existing = await get("SELECT id FROM profiles WHERE user_id = ?", [
      userId,
    ]);

    const fields = [
      "first_name",
      "last_name",
      "date_of_birth",
      "gender",
      "address",
      "city",
      "province",
      "postal_code",
      "phone",
      "height_cm",
      "weight_kg",
      "age",
      "bio",
      "job_title",
      "work_type",
      "employer",
      "salary_range",
      "years_experience",
      "education",
      "certifications",
      "tech_skills",
      "looking_for",
      "preferred_gender",
      "preferred_age_min",
      "preferred_age_max",
      "relationship_type",
      "deal_breakers",
      "interests",
    ];

    const normalizedData = {
      ...data,
      age:
        data.age ??
        (data.date_of_birth
          ? Math.floor(
              (Date.now() - new Date(data.date_of_birth).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000),
            )
          : null),
    };

    if (existing) {
      const setClauses = fields.map((f) => `${f} = ?`).join(", ");
      const values = [...fields.map((f) => normalizedData[f] ?? null), userId];
      await run(
        `UPDATE profiles SET ${setClauses}, updated_at = datetime('now') WHERE user_id = ?`,
        values,
      );
    } else {
      const cols = ["id", "user_id", ...fields, "updated_at"].join(", ");
      const placeholders = [
        "?",
        "?",
        ...fields.map(() => "?"),
        "datetime('now')",
      ].join(", ");
      const values = [
        uuidv4(),
        userId,
        ...fields.map((f) => normalizedData[f] ?? null),
      ];
      await run(
        `INSERT INTO profiles (${cols}) VALUES (${placeholders})`,
        values,
      );
    }

    const profile = await get("SELECT * FROM profiles WHERE user_id = ?", [
      userId,
    ]);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all photos for a user
router.get("/:userId/photos", async (req, res) => {
  const { userId } = req.params;
  try {
    const photos = await all(
      "SELECT * FROM user_photos WHERE user_id = ? ORDER BY position ASC",
      [userId],
    );
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload a photo for a user
router.post("/:userId/photos", upload.single("photo"), async (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const photoUrl = `/uploads/${req.file.filename}`;

    // Determine the next position
    const last = await get(
      "SELECT MAX(position) as maxPos FROM user_photos WHERE user_id = ?",
      [userId],
    );
    const position = last && last.maxPos !== null ? last.maxPos + 1 : 0;
    const isMain = position === 0 ? 1 : 0;
    const photoId = uuidv4();

    await run(
      "INSERT INTO user_photos (id, user_id, photo_url, is_main, position) VALUES (?, ?, ?, ?, ?)",
      [photoId, userId, photoUrl, isMain, position],
    );

    // Keep profiles.photo_url in sync with the main photo
    if (isMain) {
      const existingProfile = await get(
        "SELECT id FROM profiles WHERE user_id = ?",
        [userId],
      );
      if (existingProfile) {
        await run("UPDATE profiles SET photo_url = ? WHERE user_id = ?", [
          photoUrl,
          userId,
        ]);
      }
    }

    const photo = await get("SELECT * FROM user_photos WHERE id = ?", [
      photoId,
    ]);
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a photo
router.delete("/:userId/photos/:photoId", async (req, res) => {
  const { userId, photoId } = req.params;
  try {
    const photo = await get(
      "SELECT * FROM user_photos WHERE id = ? AND user_id = ?",
      [photoId, userId],
    );
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    await run("DELETE FROM user_photos WHERE id = ?", [photoId]);

    // Delete the file from disk
    const filePath = path.join(__dirname, photo.photo_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // If deleted photo was main, promote the next one
    if (photo.is_main) {
      const next = await get(
        "SELECT * FROM user_photos WHERE user_id = ? ORDER BY position ASC LIMIT 1",
        [userId],
      );
      if (next) {
        await run("UPDATE user_photos SET is_main = 1 WHERE id = ?", [next.id]);
        await run("UPDATE profiles SET photo_url = ? WHERE user_id = ?", [
          next.photo_url,
          userId,
        ]);
      } else {
        await run("UPDATE profiles SET photo_url = NULL WHERE user_id = ?", [
          userId,
        ]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set a photo as main
router.put("/:userId/photos/:photoId/main", async (req, res) => {
  const { userId, photoId } = req.params;
  try {
    const photo = await get(
      "SELECT * FROM user_photos WHERE id = ? AND user_id = ?",
      [photoId, userId],
    );
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    await run("UPDATE user_photos SET is_main = 0 WHERE user_id = ?", [userId]);
    await run("UPDATE user_photos SET is_main = 1 WHERE id = ?", [photoId]);
    await run("UPDATE profiles SET photo_url = ? WHERE user_id = ?", [
      photo.photo_url,
      userId,
    ]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
