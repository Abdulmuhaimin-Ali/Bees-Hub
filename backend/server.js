import express from 'express'
import cors from 'cors'
import session from 'express-session'
import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import path from 'path'
import fs from 'fs'
import {v4 as uuidv4} from 'uuid'
import {getDb, run, get, all} from './db.js'
import { error } from 'console'

// routes
import router from './profile.js'

const app = express()
const port = 9000;

// Initialize the database and schema and ai 
(async () => {
  try {
    await getDb(); 
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1); 
  }
})();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());



app.use(express.urlencoded());
app.use(session({
    secret: 'itconnect-secret-bare-bones',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true}
  }));

// Helper: require login
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    next();
  }
  
  // Helper: require membership
  async function requireMember(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    
    const user_1 = await get('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    //if (!user || !user.is_member) return res.status(403).json({ error: 'Membership required' });
    next();
  }

  app.get('/api/whoami', (req, res) => {
    res.json({ 
      user: req.user, 
      session: req.session,
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated?.() 
    });
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json({error: 'Email and password required' });

        const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const id = uuidv4();
        run('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [id, email, password]);
        req.session.userId = id;
        req.session.email = email;
        res.json({ success: true, user: { id, email, is_member: 0 } });
    } catch(e) { res.status(500).json({ error: e.message }); }
  })

app.post('/api/auth/login', async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        console.log('User ID:', user.id); // ← confirm id exists
    
        req.session.userId = user.id;
        req.session.email = user.email;

        req.session.save((err) => {
          if (err) return res.status(500).json({ error: 'Session save failed' });
          
          console.log('Session saved:', req.session); // ← confirm in terminal

          res.json({ success: true, user: { id: user.id, email: user.email, is_member: user.is_member } });
        });


    } catch(e) { res.status(500).json({ error: e.message }); } 
})

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({success: true});
});

// profile routes
app.use('/api/profiles', router);

// Matching
app.get('/api/matches', requireMember,  async (req, res) => {

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  console.log("userId error: ", req.session.userId);
  // get user profile.
  const currentUserRes = await fetch(`${baseUrl}/api/profiles/${req.session.userId}`)
 
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

    const aiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Swapped the Anthropic header for the Google one
        'x-goog-api-key': process.env.GEMINI_API_KEY 
      },
      body: JSON.stringify({
        // 'messages' becomes 'contents' and 'parts'
        contents: [
          { 
            role: 'user', 
            parts: [{ text: prompt }] 
          }
        ],
        // 'max_tokens' moves inside 'generationConfig'
        generationConfig: {
          maxOutputTokens: 1024
        }
      })
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(`API returned status ${aiRes.status}`);
    }

    const text = data.candidates[0].content.parts[0].text.trim();
    console.log("returned ids from ai agent", text);

    const ids = text.split(',').map(v => v.trim());
    const placeholder = ids.map(() => '?').join(',');


    const profiles = await all(
      `SELECT p.*, u.email, u.is_member
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id IN (${placeholder})`,
       ids
    );
    res.json(profiles);
})


app.get('/api/activity/:userId',  async (req, res) => {

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const {userId} = req.params;

  console.log("other user id", userId);

  console.log("userId error: ", req.session.userId);
  // get user profile.
  const currentUserRes = await fetch(`${baseUrl}/api/profiles/${req.session.userId}`)
  const currentUser = await currentUserRes.json();

  const otherUserRes = await fetch(`${baseUrl}/api/profiles/${userId}`) 
  const otherUser = await otherUserRes.json();

  console.log(currentUser);
  console.log(otherUser)

  // prompt:
 const ActivitiesPrompt = `You are an assistant that recommends activities for two people who matched on a social platform.

Your task:
Analyze both user profiles and suggest the TOP 1 activities they would likely enjoy doing together.

Use the following reasoning process:
1. Look for overlapping interests between the two users.
2. Consider compatibility factors such as age, profession, hobbies, and personality hints from the bio.
3. Suggest activities that both people would realistically enjoy.
4. Avoid generic answers unless there is no overlap.
5. Activities should be social, realistic, and possible in a typical city.

Return only one activity strictly in the following JSON format:

{
  "activities": [
    {
      "title": "Activity name",
      "reason": "Why this activity suits both users" - make this sentence short limited to 5-7 words.
    },
  ]
}

User 1 Profile:
${JSON.stringify(currentUser)}

User 2 Profile:
${JSON.stringify(otherUser)}`;

const aiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Swapped the Anthropic header for the Google one
    'x-goog-api-key': process.env.GEMINI_API_KEY 
  },
  body: JSON.stringify({
    // 'messages' becomes 'contents' and 'parts'
    contents: [
      { 
        role: 'user', 
        parts: [{ text: ActivitiesPrompt }] 
      }
    ],
    // 'max_tokens' moves inside 'generationConfig'
    generationConfig: {
      maxOutputTokens: 1024,
      responseMimeType: "application/json" 
    }
  })
});

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

 const UserActivityPrompt = `You are an assistant that recommends a meeting place for two matched users.

Your task:
1. Review both user profiles and their locations.
2. Review the list of suggested activities.
3. Choose the activity that best fits both users.
4. Suggest a realistic venue where they could meet to do that activity.
5. Prefer a place roughly convenient for both users.
6. The venue must logically match the activity category.

Guidelines:
- The place should be a real type of venue (coffee shop, climbing gym, park, restaurant, museum, etc.).
- Estimate values like rating, cost, and closing time if exact data is unknown.
- Do not return multiple places. Return only ONE.

Return ONLY JSON in the format below:

{
  "activity": {
    "name": "Activity name",
    "category": "General category of activity"
  },
  "place": {
    "name": "Name of venue",
    "street": "Street address",
    "city": "City",
    "rating": 0.0,
    "estimated_cost_per_person": "$$",
    "open_until": "HH:MM",
    "reason": "Short explanation why this place fits both users and the activity" make this really short 5-7 words
  }
}

User 1 Profile:
${JSON.stringify(currentUser)}

User 2 Profile:
${JSON.stringify(otherUser)}

Suggested Activities:
${JSON.stringify(activities)}`;


const aiRes2 = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Swapped the Anthropic header for the Google one
    'x-goog-api-key': process.env.GEMINI_API_KEY 
  },
  body: JSON.stringify({
    // 'messages' becomes 'contents' and 'parts'
    contents: [
      { 
        role: 'user', 
        parts: [{ text: UserActivityPrompt }] 
      }
    ],
    // 'max_tokens' moves inside 'generationConfig'
    generationConfig: {
      maxOutputTokens: 1024,
      responseMimeType: "application/json" 
    }
  })
});


const data2 = await aiRes2.json();

if (!aiRes2.ok) {
  console.error("Gemini API Error:", data2);
  throw new Error(`API returned status ${aiRes2.status}`);
}

const text2 = data2.candidates[0].content.parts[0].text.trim();

const parsed2 = JSON.parse(text2);

const result = {
  ...parsed2.activity,
  ...parsed2.place
};


console.log("Activities and place returned from Ai", result);
 
res.json(result);
})


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


