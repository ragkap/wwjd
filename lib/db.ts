import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'wwjd.db');

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;

  // Read the wasm file from node_modules
  const wasmPath = path.join(
    process.cwd(),
    'node_modules',
    'sql.js',
    'dist',
    'sql-wasm.wasm'
  );
  const wasmBinary = fs.readFileSync(wasmPath);

  const SQL = await initSqlJs({
    wasmBinary,
  });

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize tables
  db.run(`
    CREATE TABLE IF NOT EXISTS situations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      situation TEXT NOT NULL,
      response TEXT NOT NULL,
      verses TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      situation_id INTEGER NOT NULL,
      stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (situation_id) REFERENCES situations(id)
    )
  `);

  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export interface Situation {
  id: number;
  situation: string;
  response: string;
  verses: string[];
  created_at: string;
  average_rating?: number;
  rating_count?: number;
}

export interface Rating {
  id: number;
  situation_id: number;
  stars: number;
  comment: string | null;
  created_at: string;
}

export async function createSituation(
  situation: string,
  response: string,
  verses: string[]
): Promise<Situation> {
  const database = await getDb();
  const created_at = new Date().toISOString();

  database.run(
    `INSERT INTO situations (situation, response, verses, created_at) VALUES (?, ?, ?, ?)`,
    [situation, response, JSON.stringify(verses), created_at]
  );

  const result = database.exec(`SELECT last_insert_rowid() as id`);
  const id = result[0].values[0][0] as number;

  saveDb();

  return {
    id,
    situation,
    response,
    verses,
    created_at,
  };
}

export async function getAllSituations(): Promise<Situation[]> {
  const database = await getDb();

  const result = database.exec(`
    SELECT
      s.id,
      s.situation,
      s.response,
      s.verses,
      s.created_at,
      COALESCE(AVG(r.stars), 0) as average_rating,
      COUNT(r.id) as rating_count
    FROM situations s
    LEFT JOIN ratings r ON s.id = r.situation_id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);

  if (result.length === 0) return [];

  return result[0].values.map((row) => ({
    id: row[0] as number,
    situation: row[1] as string,
    response: row[2] as string,
    verses: JSON.parse(row[3] as string),
    created_at: row[4] as string,
    average_rating: row[5] as number,
    rating_count: row[6] as number,
  }));
}

export async function searchSituations(query: string): Promise<Situation[]> {
  const database = await getDb();
  const searchTerm = `%${query}%`;

  const stmt = database.prepare(`
    SELECT
      s.id,
      s.situation,
      s.response,
      s.verses,
      s.created_at,
      COALESCE(AVG(r.stars), 0) as average_rating,
      COUNT(r.id) as rating_count
    FROM situations s
    LEFT JOIN ratings r ON s.id = r.situation_id
    WHERE s.situation LIKE ? OR s.response LIKE ?
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);
  stmt.bind([searchTerm, searchTerm]);

  const results: Situation[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    results.push({
      id: row[0] as number,
      situation: row[1] as string,
      response: row[2] as string,
      verses: JSON.parse(row[3] as string),
      created_at: row[4] as string,
      average_rating: row[5] as number,
      rating_count: row[6] as number,
    });
  }
  stmt.free();

  return results;
}

export async function getSituationById(id: number): Promise<Situation | null> {
  const database = await getDb();

  const stmt = database.prepare(`
    SELECT
      s.id,
      s.situation,
      s.response,
      s.verses,
      s.created_at,
      COALESCE(AVG(r.stars), 0) as average_rating,
      COUNT(r.id) as rating_count
    FROM situations s
    LEFT JOIN ratings r ON s.id = r.situation_id
    WHERE s.id = ?
    GROUP BY s.id
  `);
  stmt.bind([id]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.get();
  stmt.free();

  return {
    id: row[0] as number,
    situation: row[1] as string,
    response: row[2] as string,
    verses: JSON.parse(row[3] as string),
    created_at: row[4] as string,
    average_rating: row[5] as number,
    rating_count: row[6] as number,
  };
}

export async function createRating(
  situationId: number,
  stars: number,
  comment: string | null
): Promise<Rating> {
  const database = await getDb();
  const created_at = new Date().toISOString();

  database.run(
    `INSERT INTO ratings (situation_id, stars, comment, created_at) VALUES (?, ?, ?, ?)`,
    [situationId, stars, comment, created_at]
  );

  const result = database.exec(`SELECT last_insert_rowid() as id`);
  const id = result[0].values[0][0] as number;

  saveDb();

  return {
    id,
    situation_id: situationId,
    stars,
    comment,
    created_at,
  };
}

export async function getRatingsForSituation(
  situationId: number
): Promise<Rating[]> {
  const database = await getDb();

  const stmt = database.prepare(`
    SELECT id, situation_id, stars, comment, created_at
    FROM ratings
    WHERE situation_id = ?
    ORDER BY created_at DESC
  `);
  stmt.bind([situationId]);

  const ratings: Rating[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    ratings.push({
      id: row[0] as number,
      situation_id: row[1] as number,
      stars: row[2] as number,
      comment: row[3] as string | null,
      created_at: row[4] as string,
    });
  }
  stmt.free();

  return ratings;
}
