# Astral Ascendancy North Star

## One Sentence

Astral Ascendancy is a free-to-play tactical card war game where every card feels alive, every battle takes place on a changing 5x5 alien world, and every victory grows the player's galactic domain.

## The Promise

The player should feel like they are commanding a living alien civilization, not managing a web dashboard.

The board is not a tray for cards. The board is a world. Cards land on it, move across it, scar it, terraform it, feed from it, corrupt it, and sometimes become part of it.

## Product North Star

When a player clicks Play, it should feel like a game client launches inside the browser:

- Animated galaxy menu
- Living commanders
- 5x5 animated battle world
- Cards that hover, breathe, glow, evolve, and react
- Terrain and world cards that visibly change sectors
- Faction-colored attacks, damage, shields, particles, and death effects
- Pack opening as a ritual, not a button
- Domain/base as a living alien place, not a spreadsheet
- Daily command briefings that read the player's actual faction, cards, worlds, timers, decks, and unlocks before giving advice

## Design Pillars

### 1. The Board Is Alive

The 5x5 battlefield is the core identity. Every match should produce a different physical story:

- A solar forge turns a corner of the map gold.
- A Void nest spreads corruption from tile to tile.
- A Synthari relay grid lights up adjacent sectors.
- A Verdant bloomworld grows spore armor across nearby allies.
- A Crimson crucible damages everything around it.
- An Astral gate opens a portal path through space.

The player should remember matches by what happened to the board.

### 2. Cards Are Living Game Objects

Cards should not feel like flat rectangles after they are played.

Cards have:

- Idle animation
- Faction aura
- Rarity glow
- Hover lift
- Drag weight
- Snap-to-sector animation
- Damage reaction
- Attack anticipation
- Death/dissolve animation
- Evolution form
- Attachment sockets for armor, weapons, relics, or skills

The card begins as a collectible object, then becomes a living battlefield entity.

### 3. Worlds Matter

World cards are the game's differentiator.

A world is both:

- A card in the deck
- A sector-state on the 5x5 board
- A possible permanent domain asset after battle

Worlds create resources, modify movement, unlock structures, boost factions, and change the victory path.

### 4. Simple Actions, Deep Positioning

The game must remain readable. The tactical depth comes from a few clear verbs:

- Deploy
- Move
- Attack
- Build
- Attach
- Evolve
- Terraform
- Activate commander

The player should understand the turn quickly but keep discovering smarter board decisions.

### 5. Free First, Fair Always

The game should be free and generous before monetization exists.

Early trust rules:

- Earn packs by playing.
- Crafting must matter.
- Duplicate conversion must feel fair.
- No paid-only gameplay power.
- Cosmetic and convenience monetization can come later.
- Selling card packs later should never make the best strategy "pay more."

### 6. Browser-Native Game Client

Use the web stack as infrastructure, not the game feel.

- Next.js: auth, account, routing, APIs, profile, store shell, collection data
- PixiJS: primary 2D/WebGL game renderer
- Rive: commander, faction, pack, and card animation assets later
- Three.js: galaxy, planets, portals, holographic atmosphere only where useful
- Prisma/Postgres: persistence and long-term server authority
- Render/GitHub: boring production foundation

## Hard Rules

- No plain table when a game object can explain it.
- No dashboard-first gameplay surfaces.
- No monetization implementation before the core loop feels excellent.
- No full rewrite until the design is stable.
- No adding complexity that cannot be shown clearly on the board.
- No mechanics that only exist in text if they should visibly alter the world.

## Current Direction

The current live app is a foundation. It proves deployment, data, factions, cards, profile, collection, decks, packs, campaign, domain, and match concepts.

The next creative direction is to evolve it into a real game client:

- 5x5 living tactical board
- Animated PixiJS battle scene
- World cards that terraform sectors
- Structures that gather resources
- Evolving entities and equipment/skill attachments
- Rarity, crafting, and duplicate combine systems that create collection excitement without paid-only power
- Resource and card-value math that makes every card powerful for a specific reason
- Faction commanders with visible identity
- Strategic daily briefing analyzer
- Galaxy map campaign
- Pack opening ritual
- Living alien domain/base

## First Design Freeze

Before code changes, the design target is:

- Core 5x5 rules defined
- Factions and commanders defined
- World/resource loop defined
- Alpha card catalog defined
- Rarity/combine economy defined
- Combat math and effectiveness tables defined
- Resource costing and card value tables defined
- Alpha prototype scope defined
- Daily briefing source-of-truth and recommendation rules defined

Implementation should start only after those documents are accepted as the creative foundation.

See `docs/20_DAILY_BRIEFING_STRATEGY_FOUNDATION.md`.
