import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'


const DB_PATH = path.join(__dirname, 'itconnect.db');
let db;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  initSchema();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_member INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      -- Personal
      first_name TEXT,
      last_name TEXT,
      address TEXT,
      city TEXT,
      province TEXT,
      postal_code TEXT,
      phone TEXT,
      height_cm INTEGER,
      weight_kg INTEGER,
      age INTEGER,
      gender TEXT,
      photo_url TEXT,
      bio TEXT,
      -- Professional
      job_title TEXT,
      work_type TEXT,
      salary_range TEXT,
      employer TEXT,
      years_experience INTEGER,
      tech_skills TEXT,
      certifications TEXT,
      education TEXT,
      -- Preferences/Wants
      looking_for TEXT,
      preferred_gender TEXT,
      preferred_age_min INTEGER,
      preferred_age_max INTEGER,
      interests TEXT,
      relationship_type TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL,
      user2_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      match_score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user1_id) REFERENCES users(id),
      FOREIGN KEY(user2_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS dates (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL,
      activity TEXT,
      location TEXT,
      date_time TEXT,
      status TEXT DEFAULT 'scheduled',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(match_id) REFERENCES matches(id)
    );

    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      date_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER,
      would_meet_again INTEGER,
      comments TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(date_id) REFERENCES dates(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  saveDb();
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

module.exports = { getDb, run, get, all, saveDb };