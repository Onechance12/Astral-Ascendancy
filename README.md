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

First major milestone:

- Add `src/game/`
- Add PixiJS
- Add `/play`
- Create a scene manager
- Build `BootScene`, `PreloadScene`, `MainMenuScene`, `BattleScene`, `PackOpeningScene`, `GalaxyMapScene`, `VictoryScene`, and `DefeatScene`
- Connect `BattleScene` to the existing match engine
- Render cards, board lanes, attacks, damage numbers, rarity glows, and destroy effects as animated game objects

## Local Development

This project was generated with Bun-oriented scripts, but it can be inspected with npm in a standard Node environment.

```bash
npm install
npm run build
npx tsc --noEmit
```

`npm run lint` currently exposes React lint cleanup work that should be resolved before production hardening.

## Production Notes

- The current Prisma datasource is SQLite for prototype development. Production should move to Postgres.
- Do not commit `.env`, local SQLite databases, generated upload files, or local process files.
- Monetization is intentionally out of scope for the current milestone. The alpha should prove the game feel first.
