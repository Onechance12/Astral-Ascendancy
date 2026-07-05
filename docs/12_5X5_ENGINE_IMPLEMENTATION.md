# 5x5 Engine Implementation

## Purpose

This phase turns the 5x5 living-board design into reusable game-client code.

The current production battle can remain on the older prototype engine while `/play` and future Pixi scenes begin using the new 5x5 model.

## Added Code

- `src/game/five-by-five/types.ts`
  - Shared game types for sides, factions, worlds, sectors, entities, structures, attachments, commanders, and match state.

- `src/game/five-by-five/board.ts`
  - 25-sector board helpers.
  - Sector IDs: `E1-E5`, `F1-F5`, `C1-C5`, `P1-P5`, `D1-D5`.
  - Legal deploy, world, structure, movement, attack, control, and Influence helpers.

- `src/game/five-by-five/combat.ts`
  - Damage formula implementation.
  - Damage-school multipliers.
  - Terrain attack multipliers.
  - Armor, resistance, shield, HP damage, and structure damage helpers.

- `src/game/five-by-five/content.ts`
  - Adapter from existing `CardDef` records into 5x5 board entities, structures, and attachments.
  - Normalizes old prototype damage labels into alpha damage schools.

- `src/game/five-by-five/engine.ts`
  - Start turn, end step, deploy, terraform, build, attach, move, attack, and victory checks.

- `src/app/play/page.tsx`
  - Fullscreen 5x5 prototype route.

- `src/components/game/five-by-five-prototype.tsx`
  - React prototype that exercises the new engine with visible board state, hand cards, legal target highlights, movement, attacks, and turn pulses.

## Current Scope

Implemented:

- 5x5 board state
- Center anomaly sector
- Legal deploy rows
- Legal world placement
- Legal structure placement
- Entity movement
- Entity attacks
- Terrain and damage math hooks
- Sector control resolution
- Influence pulse
- Conquest and Ascendancy win checks
- Fullscreen `/play` route

Not implemented yet:

- PixiJS renderer
- Server-authoritative 5x5 match API
- Enemy AI for the new 5x5 engine
- Full card text resolution for every Set 001 card
- Pack-to-collection integration specifically tagged by set
- Sound hooks
- Particle effects
- Real card art for every Set 001 card

## Next Build Step

The next step should be a PixiJS game-client mount for `/play` that renders this same 5x5 state through canvas/WebGL instead of React DOM.

The React prototype can stay as a debug/reference surface until the Pixi scene catches up.
