# Combat Math and Effectiveness Model

## Goal

Astral Ascendancy needs strict combat math before implementation.

The game can look wild, but the numbers need to be boring, consistent, and easy to tune. The best structure is spreadsheet-first balance data that can later become CSV, JSON, database rows, or generated TypeScript constants.

This system defines:

- Creature classes
- Damage schools
- Armor/body profiles
- Resistance
- Terrain/world effectiveness
- Structure durability
- Calculation order
- Stat budget rules

## Design Rule

Do not hide balance in one-off card text unless the card truly breaks the rules.

Default combat should come from shared tables:

- Damage school vs armor profile
- Creature class vs terrain
- Faction affinity vs world
- Structure type vs damage school
- Keyword modifiers
- Status modifiers

Cards can add exceptions, but exceptions should be obvious and rare.

## Spreadsheet-First Files

Initial balance tables live in:

- `docs/balance/damage_type_matrix.csv`
- `docs/balance/terrain_effectiveness.csv`
- `docs/balance/creature_class_profiles.csv`
- `docs/balance/structure_profiles.csv`
- `docs/balance/stat_budget.csv`
- `docs/balance/combat_examples.csv`
- `docs/balance/alpha_card_catalog.csv`
- `docs/balance/world_catalog.csv`
- `docs/balance/rarity_ladder.csv`

These are design tables first. Later, implementation can import the same data or translate it into versioned game data.

## Core Concepts

### Damage School

Damage school describes what kind of force is being applied.

Alpha damage schools:

- Radiant
- Void
- Tech
- Bio
- Ember
- Astral
- Kinetic

Keep this list small in alpha. Too many types will make balance unreadable.

### Defense Profile

Defense profile describes what the target is made of or protected by.

Alpha defense profiles:

- Lightform
- Flesh
- Chitin
- Machine
- LivingArmor
- BloodMetal
- Phase
- Crystal
- Unarmored
- Structure

### Creature Class

Creature class controls movement, terrain interaction, and broad balance expectations.

Alpha creature classes:

- Infantry
- Beast
- Swarm
- Drone
- Construct
- Titan
- Flyer
- Caster
- Commander

### World Type

World type controls sector modifiers.

Alpha world types:

- Star
- Organic
- Machine
- Verdant
- Crucible
- Astral
- Mineral
- Gas
- Barren
- Corrupted

## Damage Formula

Use a fixed calculation order.

```txt
rawDamage
  = baseAttack
  + cardAttackBonuses
  + attachmentAttackBonuses
  + temporaryAttackBonuses

typedDamage
  = rawDamage * damageTypeMultiplier

terrainDamage
  = typedDamage * terrainAttackMultiplier

reducedDamage
  = terrainDamage - flatArmor - flatResistance

percentageReducedDamage
  = reducedDamage * (1 - percentResistance)

shieldedDamage
  = percentageReducedDamage - shieldValue

finalDamage
  = clamp(round(shieldedDamage), minimumDamage, maximumDamage)
```

Default values:

- `minimumDamage`: 1 if the attack successfully hits
- `maximumDamage`: none unless a card sets one
- Round halves up
- Shields are consumed before HP damage
- Excess shield damage does not carry unless a keyword says so

## Calculation Order

1. Validate attack legality.
2. Determine base attack.
3. Add attack bonuses from card, attachment, status, commander, and world.
4. Apply damage school vs defense profile multiplier.
5. Apply terrain/world attack multiplier.
6. Apply flat armor/resistance.
7. Apply percent resistance.
8. Apply shield.
9. Apply final HP damage.
10. Check death.
11. Apply retaliation if legal.
12. Apply on-damage and on-death triggers.
13. Update sector control preview.

## Why This Order

Bonuses first:

- Attachments and card buffs should feel meaningful before multipliers.

Type matchup before terrain:

- What the attack is matters before where it happens.

Flat reductions before percent reductions:

- This keeps armor good against small hits and resistance good against big hits.

Shield late:

- Shields should feel like a visible final barrier.

Minimum damage:

- Avoids frustrating zero-damage attacks unless the target is immune or in stasis.

## Type Multipliers

Use conservative multipliers.

Recommended alpha range:

- Very weak: 0.75
- Weak: 0.85
- Neutral: 1.00
- Strong: 1.15
- Very strong: 1.25

Avoid 2x style weaknesses in alpha. They will make card balance swingy and hard to read.

## Terrain Multipliers

World terrain should matter, but it should not override card identity.

Recommended alpha range:

- Bad terrain: 0.90
- Neutral terrain: 1.00
- Good terrain: 1.10
- Great terrain: 1.15

Terrain can also add non-damage effects:

- Movement cost
- Regeneration
- Shield
- Corruption
- Burn
- Forecast
- Spawn
- Deploy Beacon

## Resistances

There are three resistance types.

### Flat Armor

Subtracts from incoming damage.

Best against:

- Many small hits
- Swarm attacks
- Drone attacks

Example:

- BloodMetal Plate gives `flatArmor = 1`.

### Flat Resistance

Subtracts from specific damage schools.

Best against:

- Faction matchups
- Terrain-specific threats

Example:

- Solar wards give `flatResistance.Radiant = 1`.

### Percent Resistance

Reduces damage after flat reduction.

Best against:

- Large attacks
- Boss hits
- Mythic cards

Example:

- Phase Mantle gives `percentResistance.Kinetic = 0.25`.

## Vulnerability

Vulnerability is a positive damage modifier on the defender.

Use it sparingly.

Examples:

- Spore Mark: Bio damage against this target +15%.
- Armor Break: flatArmor becomes 0 until end of turn.
- Exposed: next attack against this target +1 final damage.

## Immunity

Avoid full immunity in normal card text.

Allowed uses:

- Boss phase
- Tutorial script
- Stasis
- One-turn mythic effect

Full immunity must be visually obvious.

## Creature Class Effects

Creature class should affect movement and terrain more than damage.

Examples:

- Swarm: can share some terrain bonuses, weak to area damage.
- Drone: stronger on Machine worlds, weak to Void corruption.
- Beast: stronger on Organic/Verdant worlds.
- Construct: more armor, slower movement.
- Flyer: ignores most terrain movement penalties, vulnerable to Ranged and Astral stasis.
- Titan: high HP, low movement, high terrain impact.
- Caster: lower HP, stronger anomalies.

## Structures

Structures should not use the exact same expectations as creatures.

Structure rules:

- Usually cannot move.
- Usually do not retaliate.
- Have high HP for cost.
- Have weak immediate tempo.
- Generate value only if protected.

Damage rules:

- Structures usually resist Bio and Void slightly.
- Structures are weak to Ember and Kinetic siege damage.
- Tech damage is strong against Machine structures but weaker against Organic structures.

## World Effectiveness

Worlds affect both sides unless card text says otherwise.

Example:

- Crimson Crucible should boost aggression for anyone willing to bleed.
- Solar Forge Moon should favor Solari, but an enemy can still stand on it.
- Void Nest should be dangerous for everyone, but Voidborn uses the danger better.

This keeps worlds from feeling like private buffs and makes map control matter.

## Recommended Alpha Damage Schools

### Radiant

Source:

- Solari
- Star worlds
- Purification effects

Good against:

- Void
- Chitin
- Corrupted sectors

Weak against:

- Crystal
- Lightform

### Void

Source:

- Voidborn
- Corrupted worlds
- Gravity hunger

Good against:

- Flesh
- Lightform
- Phase

Weak against:

- Machine
- Structure

### Tech

Source:

- Synthari
- Drones
- Lasers
- Grid weapons

Good against:

- Machine
- Structure
- Crystal

Weak against:

- Chitin
- Phase

### Bio

Source:

- Verdant
- Organic beasts
- Spores
- Parasites

Good against:

- Flesh
- LivingArmor
- Unarmored

Weak against:

- Machine
- BloodMetal
- Structure

### Ember

Source:

- Crimson
- Crucible worlds
- Volcanic weapons

Good against:

- LivingArmor
- Chitin
- Structure

Weak against:

- Phase
- Crystal

### Astral

Source:

- Astral
- Portals
- Time effects
- Stasis

Good against:

- Phase
- Commander
- Crystal

Weak against:

- BloodMetal
- Chitin

### Kinetic

Source:

- Neutral weapons
- Reavers
- Physical impacts
- Siege

Good against:

- Structure
- Machine
- Unarmored

Weak against:

- Lightform
- LivingArmor

## Balance Budget

Every card should have a rough budget.

Baseline:

- Cost 1: 3 total stats plus small text
- Cost 2: 5 total stats plus useful text
- Cost 3: 7 total stats plus strong text
- Cost 4: 9 total stats plus strong synergy
- Cost 5: 11 total stats or major board impact
- Cost 6: 13 total stats or faction payoff

Adjustments:

- Strike First: -1 stat budget
- Ranged 2: -1 stat budget
- Guardian: -0.5 to -1 stat budget
- Shield 1: -1 stat budget
- Regenerate 1: -1 stat budget
- Flying: -1 to -2 stat budget
- Overwhelm: -1 stat budget
- Structure value engine: lower immediate stats or no attack
- World card: low immediate stats, high delayed value

## Spreadsheet Columns

Damage matrix columns:

```txt
damage_school, defense_profile, multiplier, note
```

Terrain effectiveness columns:

```txt
world_type, faction, creature_class, attack_multiplier, defense_multiplier, movement_modifier, resource_bonus, note
```

Creature profile columns:

```txt
creature_class, default_move, can_fly, can_build, base_armor, area_damage_modifier, terrain_note
```

Structure profile columns:

```txt
structure_class, default_hp_bonus, can_retaliate, flat_armor, weak_to, resists, trigger_timing, note
```

Stat budget columns:

```txt
cost, baseline_total_stats, premium_text_budget, world_card_budget, structure_hp_budget, note
```

Combat example columns:

```txt
scenario, attacker, defender, base_attack, damage_school, defense_profile, world_type, type_multiplier, terrain_multiplier, armor, shield, final_damage, note
```

## Implementation Later

When code starts, do not hardcode random multipliers into card components.

Implementation should:

- Load balance tables from structured data.
- Version the tables.
- Run combat through one calculation function.
- Show previews in UI using the same function as resolution.
- Add tests around the combat function.
- Log every calculation step for debug mode.

## Debug Panel Requirement

The PixiJS battle prototype should eventually expose a debug calculation panel.

On hover or attack preview, show:

- Base attack
- Damage school
- Defender profile
- Type multiplier
- Terrain multiplier
- Armor/resistance
- Shield
- Final damage

This will make balancing much faster.
