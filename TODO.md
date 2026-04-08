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
