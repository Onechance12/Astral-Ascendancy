# Alpha Scope and Prototype Plan

## Purpose

Build the smallest version of Astral Ascendancy that proves it feels like a game.

This is not the full economy, monetization system, complete campaign, or final art pipeline. The alpha prototype exists to answer one question:

Does a 5x5 living board with animated cards, worlds, structures, and commanders feel awesome?

## Do Not Build Yet

Before the core loop works, do not build:

- Paid packs
- Marketplace
- Ranked PvP
- Guilds
- Mobile app wrapper
- Full roguelite campaign
- Large procedural domain system
- Dozens of currencies
- Full 3D game engine rewrite

## Phase 0: Design Freeze

Status:

- In progress

Deliverables:

- North star
- Genre research
- 5x5 rules
- World/resource rules
- Faction/commander bible
- Alpha content catalog
- Rarity, pack, crafting, and combine model
- Combat math and balance spreadsheets
- Resource costing, world costs, and card value spreadsheets
- Prototype scope

Exit criteria:

- 5x5 board rules are accepted.
- Starter faction identities are accepted.
- First cards/worlds/structures are accepted.
- Rarity and duplicate combine rules are accepted.
- Damage, resistance, and terrain effectiveness tables are accepted.
- Resonance, Affinity, material, and Influence cost rules are accepted.
- The first playable prototype has a clear target.

## Phase 1: Game Shell

Goal:

- A player clicks Play and enters a fullscreen game-client route.

Build:

- `/play`
- Fullscreen PixiJS canvas
- Animated cosmic background
- Main menu scene
- Commander/faction preview
- Buttons: Battle, Collection, Packs, Campaign, Settings
- Sound toggle
- React overlay layer for settings/debug only

Success:

- It feels like entering a game, not loading another app page.

## Phase 2: 5x5 Battle Board Prototype

Goal:

- Make the board feel alive before adding every rule.

Build:

- 25-sector grid in PixiJS
- Player and enemy command zones
- Resonance display
- Influence display
- Hand cards
- Hover lift
- Drag to legal sector
- Snap animation
- Invalid drop shake
- Basic entity idle animation
- Adjacent attack
- Damage number popups
- Death dissolve
- End-of-turn control update

Rules:

- 30 HP commanders
- Resonance 1 to 10
- Draw 1
- Move 1 orthogonal
- Attack adjacent orthogonal
- Conquest and Influence victory

Success:

- A non-technical player can understand where to play, move, attack, and why sectors matter.

## Phase 3: Worlds and Structures

Goal:

- Prove the board is a world, not a grid.

Build:

- One world card per faction
- One structure per faction
- Visible terrain transformation
- Structure radius indicator
- Start-of-turn structure triggers
- Center-row resource/control pressure
- Influence win support

Worlds:

- Solar Forge Moon
- Void Nest
- Relay Grid
- Verdant Seedbed
- Crimson Crucible
- Astral Gate

Structures:

- Dawn Spire
- Hive Nest
- Drone Foundry
- Worldroot Nursery
- Ember Cannon
- Time Observatory

Success:

- The board looks materially different by turn 5.

## Phase 4: Cards Feel Alive

Goal:

- Make every card interaction tactile and readable.

Build:

- Card breathing/idle animation
- Faction aura
- Rarity glow
- Attack anticipation
- Attack trail by faction
- Damage reaction shake
- Destroy animation by faction
- Evolution animation
- Attachment socket animation
- Keyword icons
- Audio hooks for hover, play, attack, death, evolve, victory

Success:

- Watching a card get played, hit, evolve, and die feels like a game event.

## Phase 5: Pack Opening Ritual

Goal:

- Make collection growth emotionally satisfying.

Build:

- Floating pack scene
- Hold-to-open charge
- Pack crack/burst
- Cards orbit face-down
- Flip reveal
- Rarity glow
- Duplicate-to-shards animation
- New card collection flyout
- Sound hooks

Success:

- Opening packs feels valuable even before monetization exists.

## Phase 6: Galaxy Campaign Map

Goal:

- Replace campaign list energy with a galactic map.

Build:

- Galaxy map scene
- Planet nodes
- Locked/completed/boss states
- Faction territories
- Animated planet hover
- Campaign mission launch
- Reward preview as objects, not a table

Success:

- Campaign feels like exploring a war map.

## Phase 7: Living Domain

Goal:

- Turn the domain into a living alien base.

Build:

- Orbit/world cluster view
- Resource collectors as animated buildings
- Commander/crew assignment
- Harvest animation
- Upgrade animation
- Alerts
- Structure blueprints
- World cards as domain assets

Success:

- Resource gathering feels like owning and developing worlds, not reading numbers.

## Prototype Technical Direction

Use:

- Next.js for shell and APIs
- PixiJS for game scenes
- React overlays only for settings, debug, account, modal text
- Existing data as seed material
- Placeholder art first

Avoid:

- Full rewrite
- Heavy 3D everywhere
- Premature server-authoritative multiplayer
- Complex monetization

## First Playable Content

Minimum decks:

- Solari vs Voidborn tutorial
- Synthari vs Crimson test match
- Verdant vs Astral test match

Minimum board objects:

- 6 world cards
- 6 structures
- 6 commanders
- 12 entities
- 6 anomalies
- 6 attachments

Minimum effects:

- Shield
- Spawn
- Drone
- Regenerate
- Frenzy
- Blink

## Success Criteria

The alpha is successful when:

- The 5x5 board is understandable within one tutorial.
- World cards visibly change sectors.
- Structures create meaningful risk/reward.
- Cards feel physical.
- Factions look and play differently.
- The player wants to play one more battle to unlock or test another card.

## Design Guardrails

- If a mechanic cannot be represented visually, simplify it.
- If a board state cannot be read in two seconds, reduce visual noise.
- If a card only changes a number, ask whether it should change a sector, status, animation, or formation instead.
- If the UI looks like a dashboard, move the experience into a scene.
- If a system does not support battle, collection, campaign, or domain, defer it.
