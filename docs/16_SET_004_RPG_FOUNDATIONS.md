# Set 004: RPG Foundations

## Purpose

Set 004 gives Astral Ascendancy the first concrete RPG-card foundation.

This set introduces three new long-term card categories:

- Skill: commander, unit, domain, or specialization paths.
- Relic: socketable identity objects for commanders, units, worlds, or domains.
- Evolution: card, unit, weapon, or world transformation unlocks.

These cards are not battle-ready yet. They are catalog foundation cards for the progression systems described in `docs/15_RPG_GAME_SYSTEMS_AUDIT.md`.

## Design Goal

Make advancement feel like the player is growing a civilization:

```txt
Battle actions
  -> XP and field tests
  -> commander paths
  -> card mastery
  -> world levels
  -> science and engineering unlocks
  -> sidegrade cards and living visuals
```

## Set Rules

- Skill cards unlock choices and objectives.
- Relic cards create identity and long-term build hooks.
- Evolution cards unlock sidegrade forms.
- Common cards should teach mastery.
- Rare and Holo cards should create clear build paths.
- Mythic cards should unlock account-defining but earnable progression goals.
- No Set 004 card should become paid-only power.
- PvP use should be normalized until the live balance model proves safe.

## Faction RPG Identity

### Solari

Progression fantasy:

- Shields become law.
- Star worlds become training temples.
- Guardians evolve through survival.

Core hooks:

- Shield survival XP
- Guardian mastery
- Stellar Physics field tests
- Star-world leveling

### Voidborn

Progression fantasy:

- Death becomes data.
- Biomass becomes memory.
- Organisms evolve from consumption.

Core hooks:

- Biomass memory
- Corruption XP
- Swarm death progress
- Xenobiology evolution

### Synthari

Progression fantasy:

- The board becomes a machine network.
- Drones become constructs.
- Diagnostics become civilization upgrades.

Core hooks:

- Scan XP
- Machine-world chains
- Drone mastery
- Synthetic Systems projects

### Verdant

Progression fantasy:

- Healing becomes infrastructure.
- Worlds grow into allies.
- Beasts bloom into new forms.

Core hooks:

- Healing memory
- Verdant spread
- Symbiosis XP
- Living architecture

### Crimson

Progression fantasy:

- Damage becomes training.
- Weapons become famous.
- Worlds level through conflict.

Core hooks:

- Survive damage XP
- Ember memory
- Weapon mastery
- War Metallurgy

### Astral

Progression fantasy:

- Movement becomes research.
- Time becomes infrastructure.
- Echo forms emerge from portal mastery.

Core hooks:

- Blink XP
- Forecast memory
- Astral gates
- Temporal Mechanics

## Neutral RPG Infrastructure

Neutral cards establish the shared progression language:

- Commander training
- World survey
- Relic socketing
- Card mastery
- World leveling
- Training simulation
- Masterwork blueprints
- Domain ascension

These are the cards that make the game feel like an RPG system instead of only a set of faction tricks.

## Balance Sources

Primary spreadsheets:

- `docs/balance/set004_rpg_foundations.csv`
- `docs/balance/set004_resource_costs.csv`
- `docs/balance/rpg_progression_tracks.csv`

Implementation source:

- `src/lib/match-engine.ts`

All Set 004 implementation entries should remain `battleReady: false` until the progression engine supports:

- commander XP
- card mastery
- world XP
- field-test event capture
- relic slots
- evolution unlocks
- PvP normalization

## Content Count

Set 004 contains 36 cards:

- 4 Solari
- 4 Voidborn
- 4 Synthari
- 4 Verdant
- 4 Crimson
- 4 Astral
- 12 Neutral progression infrastructure cards

Type spread:

- 9 Skill
- 8 Relic
- 7 Evolution
- 8 Entity
- 3 Project
- 1 Science

## Next Design Needs

Before coding progression behavior:

1. Define commander progression tables.
2. Define card mastery XP requirements.
3. Define world XP requirements by level.
4. Define field-test event names in the 5x5 engine.
5. Define PvE vs PvP normalization.
6. Define how progression cards enter packs, rewards, crafting, and campaign drops.
