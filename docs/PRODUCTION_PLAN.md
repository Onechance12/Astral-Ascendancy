# Production Plan

## Immediate Baseline

- Keep the current prototype code as the functional foundation.
- Remove local artifacts from public history.
- Rename the package and public copy around Astral's own identity.
- Push a clean initial `main` branch to GitHub.

## Short-Term Hardening

- Remove `typescript.ignoreBuildErrors` once CI checks are in place.
- Resolve current lint failures.
- Add a CI workflow for build, lint, and typecheck.
- Add `.env.example` with required variables.
- Document local DB setup.

## Database Direction

Prototype:

- SQLite
- Local `db/custom.db`

Production:

- Postgres on Render
- Prisma migrations
- No checked-in database files
- Seed script for starter quests, campaign chapters, starter cards, and structure definitions

## Server Authority

Current match flow is client-owned for local prototype speed.

Long-term:

- Client emits player intents.
- Server validates legal actions.
- Server owns reward outcomes.
- Multiplayer results are only persisted from server-authoritative matches.
- Pack opening and purchases remain backend-controlled.

## Render Deployment

Target services:

- Web service: Next.js standalone app
- Postgres: production database
- Background or WebSocket service: future match service

Later:

- Object storage or CDN for larger game assets
- Separate staging environment
- Preview deploys for pull requests
