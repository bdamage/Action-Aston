# Action Aston

Mobile-first top-down space shooter built with Vite, React, TypeScript, Three.js (React Three Fiber), Zustand, Tailwind CSS, and Howler.js.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Central Leaderboard (Vercel)

This project now includes a centralized leaderboard API at `/api/leaderboard`.

1. Install dependencies:

```bash
npm install
```

2. In Vercel, add a **Postgres** database to this project.
3. Vercel will provide these environment variables automatically:
- `POSTGRES_URL`
4. Redeploy.

`GET /api/leaderboard?limit=10` returns top scores.
`POST /api/leaderboard` accepts JSON like:

```json
{
	"name": "Pilot",
	"score": 4200
}
```

Local development can use a Vercel-linked environment (`vercel env pull`) if you want local API writes to hit the same Postgres backend.

## Sprite Atlas

The game is currently wired to `sprites.png` at the project root via `src/assets/assetConfig.ts`.
Replace frame coordinates and placeholder keys there when you drop in your final atlas.

## Project Structure

- `src/app`: app shell and main game screen
- `src/components`: reusable render components
- `src/game`: core gameplay modules
- `src/game/entities`: scene entity rendering
- `src/game/systems`: spawn, pickup, collision systems
- `src/game/hooks`: game loop + input hooks
- `src/game/state`: Zustand game state store
- `src/assets`: atlas and sprite references
- `src/ui`: HUD, menus, overlays, touch controls
