# Game Client Plan

## North Star

Astral Ascendancy should feel like a game client that happens to run in the browser.

The web stack stays useful, but it should fade into the background once the player clicks Play. The player should see animated scenes, a living galaxy map, tactile cards, faction energy, particles, sound hooks, and cinematic reward rituals.

## Layered Stack

- Next.js: auth, account, APIs, profile, collection, deck management, store shell, static marketing
- PixiJS: primary 2D/WebGL game renderer
- Rive: future commander, faction, seal, button, and pack animation assets
- Three.js: reserved for galaxy maps, planets, portals, and holographic atmosphere
- Prisma/Postgres: persistent data and server authority
- Render/GitHub: production deployment foundation

## Scene List

- `BootScene`: initialize renderer, scale manager, event bridge
- `PreloadScene`: load cards, backgrounds, effects, audio, and animation manifests
- `MainMenuScene`: animated cosmic menu with Battle, Collection, Packs, Campaign, and Settings entry points
- `GalaxyMapScene`: campaign planets, locked nodes, completed nodes, boss effects, faction territories
- `BattleScene`: animated board, player hand, enemy side, energy, attacks, damage, victory/defeat triggers
- `PackOpeningScene`: floating pack, hold-to-open ritual, burst, card flight, flip reveal, rarity glow
- `VictoryScene`: rewards, progress, cinematic result splash
- `DefeatScene`: loss summary, earned progress, replay path

## First Playable Prototype

The first serious milestone is an animated 5x5 living-board battle prototype using placeholder art.

Required:

- Fullscreen `/play`
- Animated cosmic background
- Main menu scene
- Battle scene rendered in PixiJS
- Existing match data used as seed material, then evolved toward the 5x5 rules in `docs/02_CORE_GAMEPLAY_5X5.md`
- 25-sector tactical board with player/enemy command zones
- World cards that visually terraform sectors
- Structures that sit on world sectors and create risk/reward
- Influence and conquest win conditions
- Card hover lift and rarity glow
- Drag/drop card to valid sector
- Snap-to-sector animation
- Invalid drop shake
- Attack line and impact flash
- Damage number popups
- Destroy dissolve animation
- Evolution and attachment hooks
- Victory/defeat splash
- React overlays only for settings, account, debug, and tooltips

## Design Bible

Before implementation, keep the creative target in these docs:

- `docs/00_NORTH_STAR.md`
- `docs/01_GENRE_RESEARCH.md`
- `docs/02_CORE_GAMEPLAY_5X5.md`
- `docs/03_BOARD_WORLDS_RESOURCES.md`
- `docs/04_CARD_CHARACTER_FACTION_BIBLE.md`
- `docs/05_ALPHA_CONTENT_CATALOG.md`
- `docs/06_ALPHA_SCOPE_AND_PROTOTYPE.md`
- `docs/07_COMBAT_MATH_AND_EFFECTIVENESS.md`
- `docs/08_RARITY_PACKS_AND_COMBINE.md`
- `docs/09_RESOURCE_COSTING_AND_CARD_VALUE.md`

## Asset Pipeline

```txt
public/game/cards
public/game/backgrounds
public/game/effects
public/game/audio
public/game/rive
```

The first assets can be placeholder images and generated effects. The folder structure should exist before the final art pipeline is mature.

## Free-to-Play Direction

Alpha should be generous and free.

Paid packs can be added later, but the early product needs trust:

- Earn packs by playing
- Keep crafting useful
- Keep pity visible and fair
- Keep gameplay power reachable without payment
- Avoid monetization work until the game loop feels excellent
