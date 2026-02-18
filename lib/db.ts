import { neon } from '@neondatabase/serverless';

// 1. Initialize the Neon client
// Ensure DATABASE_URL is set in your .env.local and Vercel dashboard
const sql = neon(process.env.DATABASE_URL!);

// 2. Interfaces remain the same for your frontend
export interface Situation {
  id: number | null;
  situation: string;
  response: string;
  verses: string[];
  tags: string[];
  created_at: string;
  average_rating?: number;
  rating_count?: number;
  moderated?: boolean;
  category?: string;
  matchedFrom?: {
    id: number;
    originalQuestion: string;
  };
}

export interface Rating {
  id: number;
  situation_id: number;
  stars: number;
  comment: string | null;
  created_at: string;
}

export type SortOption = 'recent' | 'top_rated' | 'most_rated';

export interface PaginatedResult {
  situations: Situation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 3. Refactored Functions using Neon
export async function createSituation(
  situation: string,
  response: string,
  verses: string[],
  tags: string[] = []
): Promise<Situation> {
  // In Postgres, we store arrays natively or as JSONB
  // Here we use JSONB to mirror your SQLite structure
  const rows = await sql`
    INSERT INTO situations (situation, response, verses, tags)
    VALUES (${situation}, ${response}, ${JSON.stringify(verses)}, ${JSON.stringify(tags)})
    RETURNING id, created_at
  `;

  const { id, created_at } = rows[0];

  return { id, situation, response, verses, tags, created_at };
}

export async function getAllSituations(): Promise<Situation[]> {
  const rows = await sql`
    SELECT
      s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
      COALESCE(AVG(r.stars), 0)::float as average_rating,
      COUNT(r.id)::int as rating_count
    FROM situations s
    LEFT JOIN ratings r ON s.id = r.situation_id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;

  return rows.map(row => ({
    ...row,
    verses: typeof row.verses === 'string' ? JSON.parse(row.verses) : (row.verses || []),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
  })) as Situation[];
}

export async function searchSituations(query: string): Promise<Situation[]> {
  const searchTerm = `%${query}%`;
  const rows = await sql`
    SELECT
      s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
      COALESCE(AVG(r.stars), 0)::float as average_rating,
      COUNT(r.id)::int as rating_count
    FROM situations s
    LEFT JOIN ratings r ON s.id = r.situation_id
    WHERE s.situation ILIKE ${searchTerm} OR s.response ILIKE ${searchTerm} OR s.tags::text ILIKE ${searchTerm}
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;

  return rows.map(row => ({
    ...row,
    verses: typeof row.verses === 'string' ? JSON.parse(row.verses) : (row.verses || []),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
  })) as Situation[];
}

export async function getPaginatedSituations(
  page: number = 1,
  pageSize: number = 10,
  sort: SortOption = 'recent',
  query?: string
): Promise<PaginatedResult> {
  const offset = (page - 1) * pageSize;

  // Get total count
  let countResult;
  if (query) {
    const searchTerm = `%${query}%`;
    countResult = await sql`
      SELECT COUNT(DISTINCT s.id)::int as total
      FROM situations s
      WHERE s.situation ILIKE ${searchTerm} OR s.response ILIKE ${searchTerm} OR s.tags::text ILIKE ${searchTerm}
    `;
  } else {
    countResult = await sql`
      SELECT COUNT(*)::int as total FROM situations
    `;
  }
  const total = countResult[0]?.total || 0;

  // Build query based on sort option
  let rows;
  if (query) {
    const searchTerm = `%${query}%`;
    if (sort === 'top_rated') {
      rows = await sql`
        SELECT
          s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
          COALESCE(AVG(r.stars), 0)::float as average_rating,
          COUNT(r.id)::int as rating_count
        FROM situations s
        LEFT JOIN ratings r ON s.id = r.situation_id
        WHERE s.situation ILIKE ${searchTerm} OR s.response ILIKE ${searchTerm} OR s.tags::text ILIKE ${searchTerm}
        GROUP BY s.id
        ORDER BY average_rating DESC, rating_count DESC, s.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else if (sort === 'most_rated') {
      rows = await sql`
        SELECT
          s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
          COALESCE(AVG(r.stars), 0)::float as average_rating,
          COUNT(r.id)::int as rating_count
        FROM situations s
        LEFT JOIN ratings r ON s.id = r.situation_id
        WHERE s.situation ILIKE ${searchTerm} OR s.response ILIKE ${searchTerm} OR s.tags::text ILIKE ${searchTerm}
        GROUP BY s.id
        ORDER BY rating_count DESC, average_rating DESC, s.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT
          s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
          COALESCE(AVG(r.stars), 0)::float as average_rating,
          COUNT(r.id)::int as rating_count
        FROM situations s
        LEFT JOIN ratings r ON s.id = r.situation_id
        WHERE s.situation ILIKE ${searchTerm} OR s.response ILIKE ${searchTerm} OR s.tags::text ILIKE ${searchTerm}
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    }
  } else {
    if (sort === 'top_rated') {
      rows = await sql`
        SELECT
          s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
          COALESCE(AVG(r.stars), 0)::float as average_rating,
          COUNT(r.id)::int as rating_count
        FROM situations s
        LEFT JOIN ratings r ON s.id = r.situation_id
        GROUP BY s.id
        ORDER BY average_rating DESC, rating_count DESC, s.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else if (sort === 'most_rated') {
      rows = await sql`
        SELECT
          s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
          COALESCE(AVG(r.stars), 0)::float as average_rating,
          COUNT(r.id)::int as rating_count
        FROM situations s
        LEFT JOIN ratings r ON s.id = r.situation_id
        GROUP BY s.id
        ORDER BY rating_count DESC, average_rating DESC, s.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT
          s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
          COALESCE(AVG(r.stars), 0)::float as average_rating,
          COUNT(r.id)::int as rating_count
        FROM situations s
        LEFT JOIN ratings r ON s.id = r.situation_id
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    }
  }

  const situations = rows.map(row => ({
    ...row,
    verses: typeof row.verses === 'string' ? JSON.parse(row.verses) : (row.verses || []),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
  })) as Situation[];

  return {
    situations,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createRating(
  situationId: number,
  stars: number,
  comment: string | null
): Promise<Rating> {
  const rows = await sql`
    INSERT INTO ratings (situation_id, stars, comment)
    VALUES (${situationId}, ${stars}, ${comment})
    RETURNING id, created_at
  `;

  return {
    id: rows[0].id,
    situation_id: situationId,
    stars,
    comment,
    created_at: rows[0].created_at
  };
}

// Common words to ignore when matching questions
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
  'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of',
  'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
  'don', 'should', 'now', 'would', 'could', 'jesus', 'god', 'want', 'need',
  'feel', 'feeling', 'think', 'know', 'really', 'going', 'get', 'got', 'like',
  'im', "i'm", 'ive', "i've", 'dont', "don't", 'cant', "can't", 'wont', "won't",
]);

// Extract meaningful keywords from text
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Find similar existing situations based on keyword matching
export async function findSimilarSituation(
  question: string,
  minKeywordMatches: number = 2
): Promise<Situation | null> {
  const keywords = extractKeywords(question);

  if (keywords.length < 2) {
    return null; // Not enough keywords to match
  }

  // Fetch all situations
  const rows = await sql`
    SELECT
      s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
      COALESCE(AVG(r.stars), 0)::float as average_rating,
      COUNT(r.id)::int as rating_count
    FROM situations s
    LEFT JOIN ratings r ON s.id = r.situation_id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;

  if (rows.length === 0) return null;

  // Score each situation by keyword matches
  let bestMatch: { situation: Situation; score: number } | null = null;

  for (const row of rows) {
    const situationText = row.situation.toLowerCase();
    let matchCount = 0;

    for (const keyword of keywords) {
      if (situationText.includes(keyword)) {
        matchCount++;
      }
    }

    // Calculate match percentage
    const matchPercentage = matchCount / keywords.length;

    // Require at least minKeywordMatches AND at least 40% keyword overlap
    if (matchCount >= minKeywordMatches && matchPercentage >= 0.4) {
      const score = matchCount + matchPercentage; // Combine for ranking

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          situation: {
            ...row,
            verses: typeof row.verses === 'string' ? JSON.parse(row.verses) : (row.verses || []),
            tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
          } as Situation,
          score,
        };
      }
    }
  }

  return bestMatch?.situation || null;
}

export async function getSituationById(id: number): Promise<Situation | null> {
  const rows = await sql`
    SELECT
      s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
      COALESCE(AVG(r.stars), 0)::float as average_rating,
      COUNT(r.id)::int as rating_count
    FROM situations s
    LEFT JOIN ratings r ON s.id = r.situation_id
    WHERE s.id = ${id}
    GROUP BY s.id
  `;

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    verses: typeof row.verses === 'string' ? JSON.parse(row.verses) : (row.verses || []),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
  } as Situation;
}


// import initSqlJs, { Database } from 'sql.js';
// import fs from 'fs';
// import path from 'path';

// const dbPath = path.join(process.cwd(), 'wwjd.db');


// let db: Database | null = null;

// async function getDb(): Promise<Database> {
//   if (db) return db;

//   // Read the wasm file from node_modules
//   const wasmPath = path.join(
//     process.cwd(),
//     'node_modules',
//     'sql.js',
//     'dist',
//     'sql-wasm.wasm'
//   );
//   const wasmBinary = fs.readFileSync(wasmPath);

//   const SQL = await initSqlJs({
//     wasmBinary: new Uint8Array(wasmBinary) as any,
//   });

//   // Load existing database or create new one
//   if (fs.existsSync(dbPath)) {
//     const buffer = fs.readFileSync(dbPath);
//     db = new SQL.Database(buffer);
//   } else {
//     db = new SQL.Database();
//   }

//   // Initialize tables
//   db.run(`
//     CREATE TABLE IF NOT EXISTS situations (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       situation TEXT NOT NULL,
//       response TEXT NOT NULL,
//       verses TEXT NOT NULL,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     )
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS ratings (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       situation_id INTEGER NOT NULL,
//       stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
//       comment TEXT,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (situation_id) REFERENCES situations(id)
//     )
//   `);

//   saveDb();
//   return db;
// }

// function saveDb() {
//   if (db) {
//     const data = db.export();
//     const buffer = Buffer.from(data);
//     fs.writeFileSync(dbPath, buffer);
//   }
// }

// export interface Situation {
//   id: number;
//   situation: string;
//   response: string;
//   verses: string[];
//   created_at: string;
//   average_rating?: number;
//   rating_count?: number;
// }

// export interface Rating {
//   id: number;
//   situation_id: number;
//   stars: number;
//   comment: string | null;
//   created_at: string;
// }

// export async function createSituation(
//   situation: string,
//   response: string,
//   verses: string[]
// ): Promise<Situation> {
//   const database = await getDb();
//   const created_at = new Date().toISOString();

//   database.run(
//     `INSERT INTO situations (situation, response, verses, created_at) VALUES (?, ?, ?, ?)`,
//     [situation, response, JSON.stringify(verses), created_at]
//   );

//   const result = database.exec(`SELECT last_insert_rowid() as id`);
//   const id = result[0].values[0][0] as number;

//   saveDb();

//   return {
//     id,
//     situation,
//     response,
//     verses,
//     created_at,
//   };
// }

// export async function getAllSituations(): Promise<Situation[]> {
//   const database = await getDb();

//   const result = database.exec(`
//     SELECT
//       s.id,
//       s.situation,
//       s.response,
//       s.verses,
//       s.created_at,
//       COALESCE(AVG(r.stars), 0) as average_rating,
//       COUNT(r.id) as rating_count
//     FROM situations s
//     LEFT JOIN ratings r ON s.id = r.situation_id
//     GROUP BY s.id
//     ORDER BY s.created_at DESC
//   `);

//   if (result.length === 0) return [];

//   return result[0].values.map((row) => ({
//     id: row[0] as number,
//     situation: row[1] as string,
//     response: row[2] as string,
//     verses: JSON.parse(row[3] as string),
//     created_at: row[4] as string,
//     average_rating: row[5] as number,
//     rating_count: row[6] as number,
//   }));
// }

// export async function searchSituations(query: string): Promise<Situation[]> {
//   const database = await getDb();
//   const searchTerm = `%${query}%`;

//   const stmt = database.prepare(`
//     SELECT
//       s.id,
//       s.situation,
//       s.response,
//       s.verses,
//       s.created_at,
//       COALESCE(AVG(r.stars), 0) as average_rating,
//       COUNT(r.id) as rating_count
//     FROM situations s
//     LEFT JOIN ratings r ON s.id = r.situation_id
//     WHERE s.situation LIKE ? OR s.response LIKE ?
//     GROUP BY s.id
//     ORDER BY s.created_at DESC
//   `);
//   stmt.bind([searchTerm, searchTerm]);

//   const results: Situation[] = [];
//   while (stmt.step()) {
//     const row = stmt.get();
//     results.push({
//       id: row[0] as number,
//       situation: row[1] as string,
//       response: row[2] as string,
//       verses: JSON.parse(row[3] as string),
//       created_at: row[4] as string,
//       average_rating: row[5] as number,
//       rating_count: row[6] as number,
//     });
//   }
//   stmt.free();

//   return results;
// }

// export async function getSituationById(id: number): Promise<Situation | null> {
//   const database = await getDb();

//   const stmt = database.prepare(`
//     SELECT
//       s.id,
//       s.situation,
//       s.response,
//       s.verses,
//       s.created_at,
//       COALESCE(AVG(r.stars), 0) as average_rating,
//       COUNT(r.id) as rating_count
//     FROM situations s
//     LEFT JOIN ratings r ON s.id = r.situation_id
//     WHERE s.id = ?
//     GROUP BY s.id
//   `);
//   stmt.bind([id]);

//   if (!stmt.step()) {
//     stmt.free();
//     return null;
//   }

//   const row = stmt.get();
//   stmt.free();

//   return {
//     id: row[0] as number,
//     situation: row[1] as string,
//     response: row[2] as string,
//     verses: JSON.parse(row[3] as string),
//     created_at: row[4] as string,
//     average_rating: row[5] as number,
//     rating_count: row[6] as number,
//   };
// }

// export async function createRating(
//   situationId: number,
//   stars: number,
//   comment: string | null
// ): Promise<Rating> {
//   const database = await getDb();
//   const created_at = new Date().toISOString();

//   database.run(
//     `INSERT INTO ratings (situation_id, stars, comment, created_at) VALUES (?, ?, ?, ?)`,
//     [situationId, stars, comment, created_at]
//   );

//   const result = database.exec(`SELECT last_insert_rowid() as id`);
//   const id = result[0].values[0][0] as number;

//   saveDb();

//   return {
//     id,
//     situation_id: situationId,
//     stars,
//     comment,
//     created_at,
//   };
// }

// export async function getRatingsForSituation(
//   situationId: number
// ): Promise<Rating[]> {
//   const database = await getDb();

//   const stmt = database.prepare(`
//     SELECT id, situation_id, stars, comment, created_at
//     FROM ratings
//     WHERE situation_id = ?
//     ORDER BY created_at DESC
//   `);
//   stmt.bind([situationId]);

//   const ratings: Rating[] = [];
//   while (stmt.step()) {
//     const row = stmt.get();
//     ratings.push({
//       id: row[0] as number,
//       situation_id: row[1] as number,
//       stars: row[2] as number,
//       comment: row[3] as string | null,
//       created_at: row[4] as string,
//     });
//   }
//   stmt.free();

//   return ratings;
// }
