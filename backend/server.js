import express from 'express'
import cors from 'cors'
import session from 'express-session'
import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import path from 'path'
import fs from 'fs'
import {v4 as uuidv4} from 'uuid'
import {getDb, run, get} from './db.js'
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
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
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

  console.log("userId error: ", req.user_1);
  // get user profile.
  const currentUserRes = await fetch(`${baseUrl}/api/profiles/${req.user_1}`)
 
  const currentUser = await currentUserRes.json();

   // get others profiles 
  const allProfilesRes = await fetch(`${baseUrl}/api/profiles/`);
  const allProfiles = await allProfilesRes.json();

  // send it to ai agent
  const model = genAI.getGenerativeModel({model: 'gemini-2.5-flash'});

  const prompt = `
      You are a matchmaking assistant. Based on the current user's profile, 
      recommend the best matching users from the list below.

      Current user:
      ${JSON.stringify(currentUser, null, 2)}

      Other users:
      ${JSON.stringify(allProfiles, null, 2)}

      Return ONLY a string of user IDs seprated by a ',' in order of best match, like:
      "4e3jkf, djkajdfj, ajkdjfkj". The userId is stored in the user_id field.
      No explanation, no markdown, just the raw JSON array.
    `;

    const aiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent', {
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
    const placeholders = ids.map(() => '?').join(',');


    const profiles = await all(
      `SELECT p.*, u.email, u.is_member
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id IN (${placeholders})`,
      recommendedIds
    );
    res.json(profiles);
})


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

