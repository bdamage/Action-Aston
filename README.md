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
