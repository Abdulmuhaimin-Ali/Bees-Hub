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

app.use(cors());
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
  function requireMember(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    const user = get('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    if (!user || !user.is_member) return res.status(403).json({ error: 'Membership required' });
    next();
  }

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
        req.session.userId = user.id;
        req.session.email = user.email;
        res.json({ success: true, user: { id: user.id, email: user.email, is_member: user.is_member } });
    } catch(e) { res.status(500).json({ error: e.message }); } 
})

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({success: true});
});

// profile routes
app.use('/api/profiles', router);

// Matching
// in this function I want to make a request to 
app.get('/api/matches', requireMember, async (req, res) => {
  // get user profile.

  // get others profiles 

  // send it to ai agent
  const model = genAI.getGenerativeModel({model: 'gemini-2.5-flash'});

  const prompt = `
      You are a matchmaking assistant. Based on the current user's profile, 
      recommend the best matching users from the list below.

      Current user:
      ${JSON.stringify(currentUser, null, 2)}

      Other users:
      ${JSON.stringify(otherUsers.map(u => ({ id: u._id, ...u.toObject() })), null, 2)}

      Return ONLY a JSON array of user IDs (strings) in order of best match, like:
      ["id1", "id2", "id3"]
      No explanation, no markdown, just the raw JSON array.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const recommendedIds = JSON.parse(text);

  // return list of users with those ids


})


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

