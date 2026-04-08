import {sql} from "@vercel/postgres";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;
const MAX_STORED_ENTRIES = 100;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 18;
const MAX_SCORE = 9_999_999;

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  createdAt: string;
};

function sanitizeName(input: unknown) {
  if (typeof input !== "string") {
    return "";
  }

  return input.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

function normalizeLimit(rawLimit: unknown) {
  if (typeof rawLimit !== "string") {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, parsed);
}

function sortLeaderboard(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function toIsoString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}

async function ensureLeaderboardTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard_scores (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(${MAX_NAME_LENGTH}) NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function fetchTopEntries(limit: number) {
  const {rows} = await sql<{
    id: number | string;
    name: string;
    score: number;
    created_at: string | Date;
  }>`
    SELECT id, name, score, created_at
    FROM leaderboard_scores
    ORDER BY score DESC, created_at ASC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    score: row.score,
    createdAt: toIsoString(row.created_at),
  }));
}

async function pruneEntries() {
  await sql`
    DELETE FROM leaderboard_scores
    WHERE id IN (
      SELECT id
      FROM leaderboard_scores
      ORDER BY score DESC, created_at ASC
      OFFSET ${MAX_STORED_ENTRIES}
    )
  `;
}

function sendJson(res: any, statusCode: number, body: unknown) {
  res.status(statusCode).json(body);
}

export default async function handler(req: any, res: any) {
  try {
    await ensureLeaderboardTable();

    if (req.method === "GET") {
      const limit = normalizeLimit(req.query?.limit);
      const entries = await fetchTopEntries(limit);
      return sendJson(res, 200, {entries});
    }

    if (req.method === "POST") {
      const name = sanitizeName(req.body?.name);
      const score = Number(req.body?.score);

      if (name.length < MIN_NAME_LENGTH) {
        return sendJson(res, 400, {
          message: `Name must be at least ${MIN_NAME_LENGTH} characters.`,
        });
      }

      if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
        return sendJson(res, 400, {message: "Score is invalid."});
      }

      await sql`
        INSERT INTO leaderboard_scores (name, score)
        VALUES (${name}, ${Math.floor(score)})
      `;

      await pruneEntries();
      const entries = sortLeaderboard(await fetchTopEntries(DEFAULT_LIMIT));
      return sendJson(res, 200, {entries});
    }

    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, {message: "Method not allowed."});
  } catch {
    return sendJson(res, 503, {
      message:
        "Leaderboard storage is unavailable. Verify Vercel Postgres is connected.",
    });
  }
}
