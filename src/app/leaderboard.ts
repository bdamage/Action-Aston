export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  createdAt: string;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  message?: string;
}

const BASE_URL = '/api/leaderboard';

async function parseResponse(response: Response): Promise<LeaderboardResponse> {
  const payload = (await response.json()) as LeaderboardResponse;
  if (!response.ok) {
    throw new Error(payload.message ?? 'Leaderboard request failed.');
  }
  return payload;
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${BASE_URL}?limit=${limit}`);
  const payload = await parseResponse(response);
  return payload.entries;
}

export async function submitScore(name: string, score: number): Promise<LeaderboardEntry[]> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      score,
    }),
  });

  const payload = await parseResponse(response);
  return payload.entries;
}