export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  createdAt: string;
}

const STORAGE_KEY = "action-aston:leaderboard:v1";
const MAX_STORED_ENTRIES = 100;

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function safeId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function normalizeEntries(value: unknown): LeaderboardEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const candidate = entry as Partial<LeaderboardEntry>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.score === "number" &&
        Number.isFinite(candidate.score) &&
        typeof candidate.createdAt === "string"
      );
    })
    .map((entry) => {
      const candidate = entry as LeaderboardEntry;
      return {
        id: candidate.id,
        name: candidate.name.trim().slice(0, 18),
        score: Math.max(0, Math.floor(candidate.score)),
        createdAt: candidate.createdAt,
      };
    });
}

function sortEntries(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function readStoredEntries() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return sortEntries(normalizeEntries(parsed)).slice(0, MAX_STORED_ENTRIES);
  } catch {
    return [];
  }
}

function writeStoredEntries(entries: LeaderboardEntry[]) {
  if (!canUseStorage()) {
    return;
  }

  const sanitized = sortEntries(normalizeEntries(entries)).slice(
    0,
    MAX_STORED_ENTRIES,
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
}

export async function fetchLeaderboard(
  limit = 10,
): Promise<LeaderboardEntry[]> {
  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  return readStoredEntries().slice(0, normalizedLimit);
}

export async function submitScore(
  name: string,
  score: number,
): Promise<LeaderboardEntry[]> {
  const sanitizedName = name.replace(/\s+/g, " ").trim().slice(0, 18);
  const normalizedScore = Math.floor(score);

  if (sanitizedName.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  if (!Number.isFinite(normalizedScore) || normalizedScore < 0) {
    throw new Error("Score is invalid.");
  }

  const current = readStoredEntries();
  const nextEntry: LeaderboardEntry = {
    id: safeId(),
    name: sanitizedName,
    score: normalizedScore,
    createdAt: new Date().toISOString(),
  };
  const nextEntries = sortEntries([...current, nextEntry]).slice(
    0,
    MAX_STORED_ENTRIES,
  );
  writeStoredEntries(nextEntries);
  return nextEntries.slice(0, 10);
}
