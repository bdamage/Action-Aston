Build a mobile-friendly top-down space shooter game using a modern web stack.

Tech stack:
- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- Zustand for game state
- Tailwind CSS for HUD and menus
- Howler.js for sound

Game concept:
Create a polished top-down sci-fi arcade shooter inspired by a clean modern sprite atlas with smooth futuristic ships, glowing engines, laser projectiles, shield/health/ammo pickups, and explosion effects.
The game should feel responsive, fast, readable, and suitable for both mobile and desktop.

Main requirements:
1. The game must be mobile-friendly first.
2. Support touch controls on phones and tablets.
3. Also support keyboard and mouse on desktop.
4. Use a portrait-friendly responsive layout, but also work in landscape.
5. Build the project with clean architecture and reusable components.
6. Use placeholder sprite paths that can be replaced later.
7. Optimize for performance on mobile browsers.

Gameplay:
- Top-down 2D/2.5D space shooter
- Player controls one ship
- Enemies spawn in waves and move downward or track the player slightly
- Player can shoot lasers
- Pickups: health, shield, ammo, weapon boost
- Explosion effects when enemies are destroyed
- Score system
- Player health and game over state
- Restart flow
- Light progression in difficulty over time

Visual style:
- Smooth modern sci-fi
- Clean HUD
- Glowing shots and engines
- Dark space background with subtle parallax stars
- Bright readable pickups
- Arcade feel, not realistic simulation
- Make sure all visuals are easy to read on small screens

Controls:
Desktop:
- WASD or arrow keys to move
- Mouse or space to shoot

Mobile:
- Virtual joystick on the lower left
- Fire button on the lower right
- Buttons large enough for children and mobile use
- Prevent accidental zoom and scrolling while playing

Architecture:
Create the project with this structure:
- src/app
- src/components
- src/game
- src/game/entities
- src/game/systems
- src/game/hooks
- src/game/state
- src/assets
- src/ui

Implement:
- App shell
- Main menu
- Game screen
- Pause overlay
- Game over overlay
- HUD with score, health, shield, ammo
- Responsive touch controls
- Enemy spawning system
- Projectile system
- Collision system
- Pickup system
- Basic wave/difficulty scaling
- Sound manager
- Asset config file for sprite references

Use placeholder asset names like:
- /assets/player-ship.png
- /assets/enemy-01.png
- /assets/enemy-02.png
- /assets/enemy-03.png
- /assets/laser-blue.png
- /assets/laser-red.png
- /assets/pickup-health.png
- /assets/pickup-shield.png
- /assets/pickup-ammo.png
- /assets/explosion-01.png
- /assets/explosion-02.png
- /assets/explosion-03.png

Implementation details:
- Use React Three Fiber canvas for rendering
- Use sprites or planes for ships and pickups
- Build a fixed game world with responsive scaling
- Keep gameplay deterministic and simple
- Use Zustand for score, lives, powerups, pause, and game state
- Separate rendering from gameplay logic as much as possible
- Use TypeScript types everywhere
- Write readable, production-style code
- Add comments only where truly helpful

Mobile UX details:
- Touch controls should be anchored and responsive
- UI should respect safe areas
- Buttons should have visual feedback
- Keep text large and readable
- Reduce visual clutter on small screens
- Cap effect density if performance drops

Please generate:
1. The full project structure
2. package installation commands
3. all starter files
4. the main game loop architecture
5. a responsive HUD
6. mobile touch controls
7. enemy spawning and shooting logic
8. collision handling
9. restart and game over flow

Start by generating the project structure and the core files first, then the main gameplay files.