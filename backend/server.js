import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDb, run, get, all } from "./db.js";
import { error } from "console";

// routes
import router from "./profile.js";

const app = express();
const port = 9000;

// Initialize the database and schema and ai
(async () => {
  try {
    await getDb();
    const seededAdmin = await get(
      "SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
      ["admin@beesHub.com"],
    );
    if (!seededAdmin) {
      await run(
        "INSERT INTO users (id, email, password, is_member, is_admin) VALUES (?, ?, ?, ?, ?)",
        [uuidv4(), "admin@beesHub.com", "123", 1, 1],
      );
      console.log("Seeded default admin user: admin@beesHub.com");
    }
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
})();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const allowedOriginPatterns = [
  /^http:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
  /^http:\/\/10\.0\.2\.2(?::\d+)?$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(?::\d+)?$/,
  /^exp:\/\/(?:localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d{1,3}\.\d{1,3})(?::\d+)?$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOriginPatterns.some((pattern) =>
        pattern.test(origin),
      );
      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use(express.urlencoded());
app.use(
  session({
    secret: "itconnect-secret-bare-bones",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  }),
);

// Helper: require login
function requireAuth(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  next();
}

async function requireAdmin(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const user = await get("SELECT is_admin FROM users WHERE id = ?", [
    req.session.userId,
  ]);
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Helper: require membership
async function requireMember(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const user_1 = await get("SELECT * FROM users WHERE id = ?", [
    req.session.userId,
  ]);
  //if (!user || !user.is_member) return res.status(403).json({ error: 'Membership required' });
  next();
}

app.get("/api/whoami", (req, res) => {
  res.json({
    user: req.user,
    session: req.session,
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated?.(),
  });
});

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const id = uuidv4();
    run(
      "INSERT INTO users (id, email, password, is_admin) VALUES (?, ?, ?, ?)",
      [id, email, password, 0],
    );
    req.session.userId = id;
    req.session.email = email;
    res.json({ success: true, user: { id, email, is_member: 0, is_admin: 0 } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await get(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?",
      [email, password],
    );
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    console.log("User ID:", user.id); // ← confirm id exists

    req.session.userId = user.id;
    req.session.email = user.email;

    req.session.save((err) => {
      if (err) return res.status(500).json({ error: "Session save failed" });

      console.log("Session saved:", req.session); // ← confirm in terminal

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          is_member: user.is_member,
          is_admin: user.is_admin,
        },
      });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get("/api/admin/portal", requireAdmin, async (req, res) => {
  try {
    const freeMembersRow = await get(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0 AND is_member = 0",
    );
    const paidMembersRow = await get(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0 AND is_member = 1",
    );
    const matchesWithContactInfoRow = await get(
      `SELECT COUNT(DISTINCT m.id) AS count
       FROM matches m
       JOIN users u1 ON u1.id = m.user1_id
       JOIN users u2 ON u2.id = m.user2_id
       LEFT JOIN profiles p1 ON p1.user_id = m.user1_id
       LEFT JOIN profiles p2 ON p2.user_id = m.user2_id
       WHERE u1.is_admin = 0
         AND u2.is_admin = 0
         AND COALESCE(TRIM(p1.phone), '') <> ''
         AND COALESCE(TRIM(p2.phone), '') <> ''`,
    );
    const dateActivityRows = await all(
      `SELECT
         d.id,
         d.activity,
         d.location,
         d.date_time,
         d.status,
         d.created_at,
         m.id AS match_id,
         u1.email AS user1_email,
         u2.email AS user2_email
       FROM dates d
       JOIN matches m ON m.id = d.match_id
       JOIN users u1 ON u1.id = m.user1_id
       JOIN users u2 ON u2.id = m.user2_id
       WHERE u1.is_admin = 0
         AND u2.is_admin = 0
       ORDER BY d.created_at DESC`,
    );
    const adminUsers = await all(
      `SELECT
         id,
         email,
         is_member,
         is_admin,
         created_at
       FROM users
       ORDER BY created_at ASC`,
    );

    res.json({
      free_members: freeMembersRow?.count ?? 0,
      paid_members: paidMembersRow?.count ?? 0,
      matches_shown_contact_info: matchesWithContactInfoRow?.count ?? 0,
      matches_and_date_activity_count: dateActivityRows.length,
      matches_and_date_activity: dateActivityRows,
      admin_users: adminUsers,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// profile routes
app.use("/api/profiles", router);

// Matching
app.get("/api/matches", requireMember, async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  console.log("userId error: ", req.session.userId);
  // get user profile.
  const currentUserRes = await fetch(
    `${baseUrl}/api/profiles/${req.session.userId}`,
  );

  const currentUser = await currentUserRes.json();

  // get others profiles
  const allProfilesRes = await fetch(`${baseUrl}/api/profiles/`);
  const allProfiles = await allProfilesRes.json();

  // send it to ai agent
  const prompt = `
      You are a matchmaking assistant. Based on the current user's profile, 
      recommend the best matching users from the list below.

      Current user:
      ${JSON.stringify(currentUser)}

      Other users:
      ${JSON.stringify(allProfiles)}

      Return ONLY a string of user IDs seprated by a ',' in order of best match, like:
      "4e3jkf, djkajdfj, ajkdjfkj". The userId is stored in the user_id field.
      No explanation, no markdown, just the raw JSON array.
    `;

  const aiRes = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Swapped the Anthropic header for the Google one
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        // 'messages' becomes 'contents' and 'parts'
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        // 'max_tokens' moves inside 'generationConfig'
        generationConfig: {
          maxOutputTokens: 1024,
        },
      }),
    },
  );

  const data = await aiRes.json();

  if (!aiRes.ok) {
    console.error("Gemini API Error:", data);
    throw new Error(`API returned status ${aiRes.status}`);
  }

  const text = data.candidates[0].content.parts[0].text.trim();
  console.log("returned ids from ai agent", text);

  const ids = text.split(",").map((v) => v.trim());
  const placeholder = ids.map(() => "?").join(",");

  const profiles = await all(
    `SELECT p.*, u.email, u.is_member
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE u.is_admin = 0
         AND p.user_id IN (${placeholder})`,
    ids,
  );
  res.json(profiles);
});

app.get("/api/activity/:userId", async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const { userId } = req.params;

  console.log("other user id", userId);

  console.log("userId error: ", req.session.userId);
  // get user profile.
  const currentUserRes = await fetch(
    `${baseUrl}/api/profiles/${req.session.userId}`,
  );
  const currentUser = await currentUserRes.json();
  const trimmedUser = {
    id: currentUser.id,
    name: currentUser.name,
    age: currentUser.age,
    city: currentUser.city,
    interests: currentUser.interests,
  };

  const otherUserRes = await fetch(`${baseUrl}/api/profiles/${userId}`);
  const otherUser = await otherUserRes.json();

  const trimmedUser2 = {
    id: otherUser.id,
    name: otherUser.name,
    age: otherUser.age,
    city: otherUser.city,
    interests: otherUser.interests,
  };

  console.log(trimmedUser);
  console.log(trimmedUser2);

  // prompt:
  const ActivityPrompt = `
  Recommend ONE activity two matched users would enjoy together.
  
  Choose based on shared interests, hobbies, and compatibility from their profiles. Avoid generic answers unless necessary.
  
  Return JSON only:
  
  {
    "activities":[
      {
        "title":"",
        "reason":""
      }
    ]
  }
  
  reason: 5–7 words.
  
  U1:${JSON.stringify(trimmedUser)}
  U2:${JSON.stringify(trimmedUser2)}
  `;

  const aiRes = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Swapped the Anthropic header for the Google one
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        // 'messages' becomes 'contents' and 'parts'
        contents: [
          {
            role: "user",
            parts: [{ text: ActivityPrompt }],
          },
        ],
        // 'max_tokens' moves inside 'generationConfig'
        generationConfig: {
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const data = await aiRes.json();

  if (!aiRes.ok) {
    console.error("Gemini API Error:", data);
    throw new Error(`API returned status ${aiRes.status}`);
  }

  const text = data.candidates[0].content.parts[0].text.trim();

  const parsed = JSON.parse(text);

  // Access the activities array
  const activities = parsed.activities;

  console.log("Activities returned from Ai", activities);

  const UserActivityPrompt = `You recommend a meeting place for two matched users.

Steps:
1. Read both user profiles and suggested activities.
2. Choose the activity best suited to both users.
3. Suggest ONE real venue for that activity that is reasonably convenient for both users.

Rules:
- Venue must match the activity category.
- Estimate rating, cost, and closing time if unknown.


Return JSON only. Don't return an inalid JSON. Make sure it's complete! Optimize for this.

Schema:

{
  "activity": { "name": "", "category": "" },
  "place": {
    "name": "",
    "street": "",
    "city": "",
    "rating": 0.0,
    "estimated_cost_per_person": "$$",
    "open_until": "HH:MM",
    "reason": ""
  }
}

reason: 5–7 words.

User1:
${JSON.stringify(trimmedUser)}

User2:
${JSON.stringify(trimmedUser2)}

Activities:
${JSON.stringify(activities)}`;

  const aiRes2 = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Swapped the Anthropic header for the Google one
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        // 'messages' becomes 'contents' and 'parts'
        contents: [
          {
            role: "user",
            parts: [{ text: UserActivityPrompt }],
          },
        ],
        // 'max_tokens' moves inside 'generationConfig'
        generationConfig: {
          maxOutputTokens: 2024,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const data2 = await aiRes2.json();

  if (!aiRes2.ok) {
    console.error("Gemini API Error:", data2);
    throw new Error(`API returned status ${aiRes2.status}`);
  }

  const text2 = data2.candidates[0].content.parts[0].text.trim();
  let parsed2;
  try {
    parsed2 = JSON.parse(text2);
  } catch (err) {
    console.error("Invalid JSON from Gemini:");
    console.error(text2);
    throw err;
  }

  const result = {
    ...parsed2.activity,
    ...parsed2.place,
  };

  console.log("Activities and place returned from Ai", result);

  res.json(result);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
