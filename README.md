# Astral Ascendancy

Astral Ascendancy is a free-to-play cosmic card strategy game in active development.

The current codebase is a Next.js prototype with account, collection, deck, campaign, reward, and match-rule foundations. The product direction is to evolve it into a real browser game client: Next.js for the shell and backend, PixiJS for fullscreen animated game scenes, and Postgres for persistent player data.

## Current Foundation

- Next.js app shell, routing, auth, and API routes
- Prisma data model for commanders, decks, collections, quests, campaigns, operations, planets, and rewards
- Local match engine for sector-grid card combat
- Prototype battle, collection, deck builder, campaign, domain, profile, multiplayer, and pack-opening views
- Initial card, faction, world-card, reward, crafting, and progression systems

## Target Architecture

```txt
Next.js
  account, auth, APIs, profile, collection, store, deck management

PixiJS game client
  /play fullscreen route, scene manager, battle board, pack opening,
  galaxy map, particles, card motion, faction effects

Prisma + Postgres
  player identity, collection, decks, rewards, campaign progress,
  domain/base state, future purchases

Render
  production deployment for web app, database, and later match services
```

## Development Direction

The browser is where the game runs. The player-facing experience should feel like launching a game client, not navigating a dashboard.

Design-first direction:

- Lock the design bible in `docs/00_NORTH_STAR.md` through `docs/16_SET_004_RPG_FOUNDATIONS.md`
- Move combat from the existing 3-lane prototype toward a 5x5 living tactical board
- Make world cards visibly terraform sectors
- Make structures produce risk/reward on controlled worlds
- Treat cards as animated battlefield entities with hover, drag, snap, attack, damage, death, evolution, and attachment feedback
- Define combat math through spreadsheet-style balance tables for damage types, resistances, terrain/world modifiers, and stat budgets
- Define rarity, pack reveal, crafting, duplicate protection, and card combine rules before monetization work
- Define Resonance, Affinity, materials, Influence, world costs, and per-card value scores before implementation
- Define the RPG progression model for commander levels, card mastery, world levels, science, engineering, relics, skills, and evolutions before making those systems battle-ready
- Define PvP as ranked/unranked/friendly/event queues where deck tiers organize progression power instead of flattening the RPG systems
- Build the beta around timed assignments where cards, crews, worlds, and decks can be committed to resource gathering, study, rescue, expedition, training, and defense missions

First implementation milestone after design approval:

- Add `src/game/`
- Add PixiJS
- Add `/play`
- Create a scene manager
- Build `BootScene`, `PreloadScene`, `MainMenuScene`, `BattleScene`, `PackOpeningScene`, `GalaxyMapScene`, `VictoryScene`, and `DefeatScene`
- Use existing match data as seed material while implementing the 5x5 prototype rules
- Render cards, sectors, worlds, structures, attacks, damage numbers, rarity glows, and destroy effects as animated game objects

## Local Development

Use npm and Node for local development and production startup.

```bash
npm install
npm run db:deploy
npm run lint
npm run build
npx tsc --noEmit
```

The app now expects Postgres through `DATABASE_URL`.

Local Postgres options:

```bash
# Homebrew Postgres, already compatible with this repo's .env.example
brew services start postgresql@16

# Or Docker Desktop / Compose
docker compose up -d postgres
```

## Production Notes

- Prisma is configured for Postgres. Render should use a managed Render Postgres database.
- Production deploys should run `npm run db:deploy` before `npm run build`; `render.yaml` defines that path.
- Do not commit `.env`, local SQLite databases, generated upload files, or local process files.
- Monetization is intentionally out of scope for the current milestone. The alpha should prove the game feel first.
