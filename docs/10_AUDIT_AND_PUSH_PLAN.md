# Design Audit and Push Plan

## Current State

The repository has a working Next.js prototype and a new design bible.

Current live app:

- Deployed at `https://astral-ascendancy.onrender.com`
- Still presents the older prototype direction:
  - 3-lane / 3x3 sector grid
  - Five civilizations
  - Quantum, Crystalline, and Reaver language
  - Existing React/dashboard-style gameplay surfaces

Current design direction:

- 5x5 living tactical board
- Six core factions:
  - Solari
  - Voidborn
  - Synthari
  - Verdant
  - Crimson
  - Astral
- PixiJS game-client route later
- Worlds as playable terrain and domain assets
- Structures as protected economy engines
- Resonance, Affinity, materials, and Influence resource model
- Strict combat math and card value spreadsheets
- Rarity, crafting, duplicate protection, Memory, combine, and Fusion model

## What Has Been Added

Design docs:

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
- `docs/11_SET_001_CARD_EXPANSION.md`
- `docs/13_SET_002_WORLDS_AWAKEN.md`
- `docs/14_SCIENCE_ENGINEERING_PROGRESSION.md`
- `docs/15_RPG_GAME_SYSTEMS_AUDIT.md`
- `docs/16_SET_004_RPG_FOUNDATIONS.md`
- `docs/17_PVP_RANKED_COMMUNITY_SYSTEMS.md`
- `docs/18_BETA_PUSH_LIVE_GAME_PLAN.md`

Balance sheets:

- `docs/balance/alpha_card_catalog.csv`
- `docs/balance/card_resource_costs.csv`
- `docs/balance/card_value_formula.csv`
- `docs/balance/combat_examples.csv`
- `docs/balance/creature_class_profiles.csv`
- `docs/balance/damage_type_matrix.csv`
- `docs/balance/rarity_ladder.csv`
- `docs/balance/resource_curve.csv`
- `docs/balance/resource_types.csv`
- `docs/balance/stat_budget.csv`
- `docs/balance/structure_profiles.csv`
- `docs/balance/terrain_effectiveness.csv`
- `docs/balance/world_catalog.csv`
- `docs/balance/world_resource_costs.csv`
- `docs/balance/set001_card_expansion.csv`
- `docs/balance/set001_resource_costs.csv`
- `docs/balance/set002_card_expansion.csv`
- `docs/balance/set002_resource_costs.csv`
- `docs/balance/science_tracks.csv`
- `docs/balance/engineering_projects.csv`
- `docs/balance/set003_science_engineering.csv`
- `docs/balance/set003_resource_costs.csv`
- `docs/balance/set004_rpg_foundations.csv`
- `docs/balance/set004_resource_costs.csv`
- `docs/balance/rpg_progression_tracks.csv`
- `docs/balance/pvp_deck_tiers.csv`
- `docs/balance/pvp_rank_ladder.csv`
- `docs/balance/pvp_matchmaking_rules.csv`
- `docs/balance/deck_license_progression.csv`
- `docs/balance/async_assignment_loops.csv`
- `docs/balance/beta_push_milestones.csv`

Updated index docs:

- `README.md`
- `docs/GAME_CLIENT_PLAN.md`

## What Looks Strong

- The game now has a clear north star: a browser game client, not a dashboard.
- The 5x5 board has enough room for card combat, terrain, structures, movement, and objectives.
- The faction set is more distinctive than the current live prototype.
- Worlds now connect battle, campaign, collection, and domain.
- Combat math is no longer loose. Damage schools, defense profiles, terrain, and examples exist.
- Rarity has an economy model with crafting and duplicate protection.
- Every alpha card has a resource-cost/value row.
- RPG progression now has an explicit audit across battle, worlds, commander levels, card mastery, relics, skills, evolutions, and PvP fairness.
- Set 004 seeds the catalog with non-battle-ready RPG foundation cards.
- PvP now has a ranked/unranked/friendly/event plan where deck tiers organize progression power and ranks measure skill inside each bracket.
- The beta push plan now defines the live-game loop: timed assignments, busy cards/decks/crew, deck licenses, world study, resource gathering, rescue operations, and long-term return reasons.
- The design protects free-to-play trust by making chase cards craftable/earnable and avoiding paid-only power.

## Important Gaps Before Implementation

These should be resolved before large code work:

1. Tutorial script needs more detail.
   - We know the sequence, but not exact dialogue, board setup, first cards, enemy moves, or success/fail states.

2. AI behavior is not designed yet.
   - Need early PvE enemy policy: deploy, move, attack, build, preserve structures, contest worlds.

3. Match timing needs tuning.
   - Need target turn count per mode and rough expected damage/Influence pace.

4. Card wording needs a stricter templating pass.
   - Current cards are good design records, but final text should use one templated style.

5. Asset list is still conceptual.
   - Need first placeholder asset manifest: sector textures, card backs, faction particles, commander portraits, UI sounds.

6. Data import format is not decided.
   - CSV is good for design, but implementation needs a decision: CSV import, generated JSON, direct TypeScript constants, or database seed.

7. Live app copy is now outdated.
   - Render currently still advertises 3x3 and older factions. That should be fixed before public marketing push.

8. Render production config still needs hardening.
   - `start` currently uses Bun.
   - Production DB direction is Postgres, but prototype remains SQLite.
   - CI is not yet defined.

9. RPG progression needs implementation scaffolding.
   - Set 004 exists as design/catalog data.
   - The engine still needs field-test events, mastery records, world XP, commander XP, relic slots, evolution unlocks, and PvP normalization rules before these cards become battle-ready.

10. PvP needs live service work.
   - Deck power, ranks, queues, friends, and tribes now have scaffolding.
   - Real-time opponent pairing, battle sync, server-authoritative result validation, and anti-abuse checks are still future work.

11. Beta live-game loop needs implementation.
   - The design now calls for assignment timers and deck licenses.
   - Next code phase should add `Assignment`, asset availability, `DeckLicense`, unlock requirements, claim rewards, and visible timers.

## Recommended Next Commits

### Commit 1: Design Bible

Scope:

- All docs and balance CSV files created in this planning phase.
- README and game client plan updates.

Suggested commit message:

```txt
Add Astral Ascendancy design bible and balance sheets
```

Why first:

- It preserves the creative direction before implementation starts.
- It gives GitHub/Render a clear project plan without changing runtime behavior.

### Commit 2: Align Public Copy With New Direction

Scope:

- Update landing page copy from 3x3/five-faction language to 5x5/six-faction direction.
- Avoid building Pixi yet.
- Make the live site describe the future accurately.

Suggested commit message:

```txt
Align public copy with 5x5 game direction
```

Why separate:

- It changes user-facing app behavior/content.
- It should be easier to review than mixing it with the docs commit.

### Commit 3: Production Hardening

Scope:

- Add `.env.example`.
- Add GitHub Actions for lint/typecheck/build.
- Consider changing production start command to Node if Render is not using Bun intentionally.
- Add Render deployment notes.

Suggested commit message:

```txt
Add production setup and CI checks
```

### Commit 4: Game Client Foundation

Scope:

- Add `src/game/`.
- Add PixiJS.
- Add `/play`.
- Add scene manager skeleton.
- Add event bus.
- Add asset folders.

Suggested commit message:

```txt
Add PixiJS game client shell
```

## Push Plan

Before pushing:

1. Validate CSV column consistency.
2. Run lint.
3. Run typecheck.
4. Run build if code or package files changed.
5. Review `git diff --stat`.
6. Commit only intended files.

Push:

```bash
git add README.md docs
git commit -m "Add Astral Ascendancy design bible and balance sheets"
git push origin main
```

Render:

- A docs-only commit may still trigger a Render deploy if auto-deploy is enabled.
- Runtime output should not change from Commit 1.
- After Commit 2, Render should show the updated 5x5/six-faction public direction.

## Recommendation

Push Commit 1 first.

Do not mix design docs, landing copy, production config, and Pixi implementation in one commit. The clean sequence is:

1. Preserve the design bible.
2. Align public copy.
3. Harden deploy/CI.
4. Build `/play` and the Pixi game client.
