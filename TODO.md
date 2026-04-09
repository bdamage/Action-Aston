# TODO

## Måste fixas

- [ ] Spara och ladda spelarens progression (poäng, upplåsningar, uppgraderingar).
- [ ] Bygga ett system för att byta skepp med poäng man tjänar ihop.
- [ ] Visa tydligt pris och krav för varje skepp i UI.
- [ ] Lägga till vapenuppgraderingar (skada, eldhastighet, projektilhastighet).
- [ ] Säkerställa att uppgraderingar påverkar gameplay direkt och känns tydligt.
- [ ] Balansjustera ekonomi så att upplåsningar inte går för snabbt eller för långsamt.
- [ ] Lägg till bättre feedback i HUD när man köper/upgraderar (ljud, text, animation).
- [ ] Hantera edge cases: för lite poäng, maxnivå uppnådd, redan upplåst skepp.

## Idéer

- [ ] Skapa en "Hangar"-vy mellan rundor där man kan välja skepp och utrustning.
- [ ] Introducera olika skeppsklasser (snabb, tank, allround) med unika stats.
- [ ] Lägg till unika vapen per skeppstyp.
- [ ] Inför passiva perks (t.ex. +5% loot, +10% sköld).
- [ ] Lägg till tillfälliga powerups under run som inte påverkar permanent progression.
- [ ] Skapa ett uppdrags-/achievement-system som ger bonuspoäng.
- [ ] Visa jämförelsepanel när man byter skepp (nuvarande vs nytt).

## Tekniskt att planera

- [ ] Definiera datamodell för butik/upplåsningar i game state.
- [ ] Skapa central prislista i konfigfil (skepp, vapen, uppgraderingar).
- [ ] Lägg till versionering för sparfil (enkelt att migrera senare).
- [ ] Skriv tester för köpflöde och uppgraderingslogik.

## Fiendevågor & formationer — Implementationsplan

Arbetet delas upp i 7 steg i ordning. Varje steg bygger på föregående.

---

### Steg 1 — Definiera `FormationType` i `types.ts`

- [ ] Lägg till `export type FormationType = "random" | "V" | "diagonal-left" | "diagonal-right" | "arc" | "pincer";`
- [ ] Lägg till `formationOffsetX?: number` och `formationHoldTimer?: number` på `Enemy`-interfacet.
  - `formationOffsetX`: fienden försöker hålla detta X-värde relativt formationens centrum medan timern löper.
  - `formationHoldTimer`: räknar ned från ett startvärde (t.ex. 1.8 s); när den nått 0 övergår fienden till normal tracking.
- [ ] Lägg till `spawnQueue: Array<{ enemy: Enemy; delay: number }>` på `GameState` (används i steg 4).
- [ ] Lägg till `lastFormation: FormationType | null` på `GameState` (används för HUD-meddelande i steg 7).

---

### Steg 2 — Layoutfunktioner för varje formation i `spawnSystem.ts`

Varje funktion tar `count: number` och returnerar `Array<{ x: number; y: number }>` med världskoordinater för varje fiendes startposition. Alla positioner är relativa till formationens centrum (x=0, y=HALF_HEIGHT + 0.7).

- [ ] `layoutRandom(count)` — befintligt beteende med slumpade lanes, extraherat till en funktion.
- [ ] `layoutV(count)` — apex i mitten längst ned; varje par placeras ±`i * 1.1` i X och `i * 0.9` upp i Y.
  ```
  // Exempel för 5 fiender:
  // slot 0: {x:0,   y:0}       (apex)
  // slot 1: {x:-1.1, y:0.9}
  // slot 2: {x:+1.1, y:0.9}
  // slot 3: {x:-2.2, y:1.8}
  // slot 4: {x:+2.2, y:1.8}
  ```
- [ ] `layoutDiagonal(count, direction: "left"|"right")` — fiender placeras längs en linje från en kant till en annan, ±`i * 1.0` i X och `i * 0.8` upp i Y, speglat beroende på riktning.
- [ ] `layoutArc(count)` — fiender jämnt fördelade längs en halvcirkel (θ från 0 till π), radie ~2.5, uppåt-böjd (Y = sin(θ) * radius).
- [ ] `layoutPincer(count)` — dela count i två grupper; vänstergrupp spawnas vid X ≈ -HALF_WIDTH + 1, högergrupp vid X ≈ HALF_WIDTH - 1, med liten Y-staggerning inom varje grupp.

---

### Steg 3 — Utöka `WavePattern` i `spawnSystem.ts`

- [ ] Lägg till `formations: FormationType[]` på `WavePattern` (en lista att välja bland slumpmässigt).
- [ ] Uppdatera de fyra befintliga `WAVE_PATTERNS`-objekten:
  - Pattern 0 (våg 1–2): `formations: ["random"]`
  - Pattern 1 (våg 3–4): `formations: ["random", "V"]`
  - Pattern 2 (våg 5–6): `formations: ["V", "diagonal-left", "diagonal-right"]`
  - Pattern 3 (våg 7+): `formations: ["diagonal-left", "diagonal-right", "arc", "pincer"]`
- [ ] I `updateSpawnTimer`: välj `formation = pattern.formations[randInt(0, pattern.formations.length - 1)]` och anropa rätt layoutfunktion.
- [ ] Sätt `spawnState.lastFormation = formation` innan funktionen returnerar.

---

### Steg 4 — Staggerad spawn-kö i `spawnSystem.ts` + `gameStore.ts`

- [ ] I `updateSpawnTimer`, istället för att returnera alla `Enemy[]` direkt: beräkna alla positioner, men returnera bara den **första** fienden direkt och lägg resten i `spawnState.spawnQueue` med `delay = i * 0.13` sekunder.
- [ ] I `gameStore.ts / step`: lägg till ett steg som tickar ned `state.spawnQueue`:
  ```ts
  for (const entry of spawnState.spawnQueue) {
    entry.delay -= frameDt;
    if (entry.delay <= 0) {
      // flytta till enemies-listan
    }
  }
  ```
- [ ] Uppdatera `createBaseState()` att inkludera `spawnQueue: []` och `lastFormation: null`.

---

### Steg 5 — Flocking-rörelse i `gameStore.ts`

Lokalisera enemy-loop i `step` (~rad 245):

- [ ] Om `enemy.formationHoldTimer > 0`:
  - Räkna ned `formationHoldTimer -= frameDt`.
  - Istället för att tracka spelarens X, styr mot `enemy.formationOffsetX` (världskoordinat):
    ```ts
    const targetX = enemy.formationOffsetX ?? player.position.x;
    const dx = targetX - enemy.position.x;
    // samma clamp-logik som idag
    ```
  - Minska `trackStrength` med 50 % under hold-fasen för mjukare rörelse.
- [ ] När `formationHoldTimer <= 0` används befintlig spelare-tracking som idag.
- [ ] Sätt `formationOffsetX` till den beräknade X-positionen från layoutfunktionen vid spawn.
- [ ] Sätt `formationHoldTimer` till `1.8 - wave * 0.08` (formationen håller kortare tid på högre vågor), clampad till `[0.4, 1.8]`.

---

### Steg 6 — Svårighetsramp & formationsval

- [ ] I `updateSpawnTimer`, begränsa tillgängliga formations baserat på vågnummer:
  - Våg < 3: tvinga `"random"` oavsett pattern.
  - Våg 3–4: max `["random", "V"]`.
  - Våg 5–7: alla utom `"pincer"`.
  - Våg 8+: alla formations tillgängliga.
- [ ] Öka `enemyCount`-taket från 6 till 8 på våg 12+ för att fylla större formationer.

---

### Steg 7 — HUD-meddelande för formationstyp

- [ ] I `HUD.tsx`: läs `lastFormation` från `useGameStore`.
- [ ] Lägg till en lokal `useState<string | null>` för displaytext och en `useEffect` som triggas när `lastFormation` ändras.
- [ ] Visa texten (~2 s) med fade-out via CSS-transition, placerad i överkanten av spelplanen.
- [ ] Mappning formation → visningstext:
  - `"V"` → `"V-FORMATION"`
  - `"diagonal-left"` / `"diagonal-right"` → `"DIAGONAL ATTACK"`
  - `"arc"` → `"ARC SWEEP"`
  - `"pincer"` → `"PINCER INCOMING"`
  - `"random"` → ingen text visas.

## Spelararförmågor

- [ ] Dash/sidostep: spelaren kan göra en kort snabb rörelse i en riktning med kort avkylning (t.ex. Q/E eller dubbeltryck).
- [ ] Sköldburst: aktivera sköld aktivt som kortvarig parering som reflekterar projektiler (kräver sköld > 0).
- [ ] Laddad skott: håll in skjuta för att ladda upp ett kraftfullare, bredare skott.
- [ ] Smart bomb: sällsynt pickup som rensar alla fiendeprojektiler och dealar AOE-skada.
- [ ] Bakåtskjutning: knapp för att skjuta bakåt (nedåt på skärmen) mot fiender som passerat.

## Visuell & ljudfeedback

- [ ] Visa formationstyp som en kort blinkande text på skärmen när en ny våg spawnar (t.ex. "V-FORMATION!").
- [ ] Ge varje formation en distinkt entré-animation (t.ex. fiender glider in från sidan i diagonal).
- [ ] Lägg till warp-in-effekt per fiende med en liten staggerad delay för att göra formationer tydligare.
- [ ] Soundtrack-intensitet ökar dynamiskt ju fler fiender som är aktiva (t.ex. via Web Audio GainNode).
