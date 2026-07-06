# Casualty Recovery and Homeworld Medical System

## North Star

Cards are not disposable buttons. Important cards represent crews, creatures, commanders, worlds, structures, ships, weapons, armor, research teams, and living assets.

When a battle ends, some assets should need care.

That gives the game long-term strategy:

- Do I risk my evolved unit again?
- Do I send a damaged deck into another fight?
- Do I spend resources healing now or wait?
- Do I build better medical infrastructure at home?
- Do I take a weaker deck while my best cards recover?
- Do I rescue a stranded crew with another deck?

This turns battle into part of the larger RPG/domain loop.

## Core Idea

Replace generic graveyard thinking with asset condition.

Battle result should create post-match condition records:

- Healthy: ready for use.
- Fatigued: usable, but needs time for full readiness.
- Injured: unavailable until treated or healed over time.
- Critical: unavailable and needs advanced treatment.
- Destroyed: structure/world asset needs repair.
- Fallen: entity is dead or lost and requires homeworld revival.
- Missing: crew/card is away on an operation, rescue, or expedition.

For alpha, show this as `Recovery`.

For beta, persist it per owned card/copy.

## Recovery Locations

### Field Recovery

Traveling fleets and ship cards can provide light healing.

Use cases:

- Heal fatigue.
- Stabilize injured units.
- Reduce recovery timer.
- Repair minor armor damage.

Limits:

- Cannot revive fallen cards.
- Cannot fully repair destroyed worlds or major structures.
- Costs fewer resources but gives weaker outcomes.

### Homeworld Infirmary

Primary healing system.

Use cases:

- Heal injured cards.
- Remove fatigue.
- Treat critical wounds.
- Restore armor/weapon durability.
- Speed recovery timers.

Requires:

- Homeworld facility.
- Resource costs.
- Time.
- Optional medical/science staff assignments.

### Revival Chamber

High-value late system.

Use cases:

- Revive fallen entities.
- Recover unique commanders.
- Restore mythic/singularity assets.

Rules:

- Homeworld only.
- Expensive.
- Time-gated.
- May require rare resources or completed science.
- Some PvP formats should auto-normalize condition so monetization does not become pay-to-win.

### Repair Yard

For structures, ships, weapons, armor, and world installations.

Use cases:

- Repair damaged structures.
- Restore equipment durability.
- Rebuild destroyed infrastructure.
- Prepare damaged worlds for resource gathering.

Resources:

- Alloy
- Crystals
- Tritium
- Plasma
- faction-specific resource

### World Restoration

World cards and owned planets can be damaged, corrupted, ruined, or exhausted.

Use cases:

- Repair destroyed sectors.
- Purify corruption.
- Restore resource output.
- Rebuild structures.
- Remove invasion damage.

This makes worlds feel alive and valuable instead of static cards.

## Card Condition by Type

### Entities

Entities can be:

- Fatigued if played and survived.
- Injured if defeated.
- Fallen if overkilled, executed, sacrificed, or hit by specific effects.

Entity recovery can interact with:

- creature class
- faction
- rarity
- level
- armor/attachments
- world where defeated
- damage type that defeated it

### Commanders

Commanders should not be permanently lost.

They can suffer:

- fatigue
- wounds
- morale loss
- temporary campaign debuffs

Commander injuries should affect PvE/campaign/domain, not fair ranked PvP.

### Attachments

Attachments can lose durability.

Examples:

- Armor cracked.
- Weapon overheated.
- Relic destabilized.
- Skill module damaged.

Repair creates resource sinks without deleting the card.

### Structures

Destroyed structures should go to repair.

The card is not gone. The installation is damaged and needs:

- time
- materials
- workers/crew
- engineering project

### Worlds

World cards are special. In battle, they transform sectors. Long term, a world can also be a player asset.

World condition states:

- Stable
- Exhausted
- Damaged
- Ruined
- Corrupted
- Besieged
- Restoring

World recovery should connect to domain, resource gathering, science, and campaign.

### Anomalies

Most Anomalies are spent tactics and should not need medical healing.

They can go to:

- Archive
- Cooldown
- Recovery count in alpha UI

Later, separate tactical cards from living assets in the result screen.

## Strategic Loop

1. Player builds several decks.
2. Player enters battle.
3. Cards take damage, die, survive, or carry wounds.
4. Match result generates casualties and damaged assets.
5. Player sends injured assets to infirmary, repair yard, revival chamber, or field recovery.
6. Those assets are unavailable while recovering.
7. Player chooses another deck, waits, spends resources, or takes a risk.

This is the same long-term tension as RPG party management, base-building timers, and card collection progression.

## Resource Costs

Healing should not be punitive early.

Starter rules:

- Tutorial and early campaign: auto-heal after match.
- Casual PvE: light recovery only.
- Ranked PvP: no persistent injury penalties for competitive fairness.
- Campaign, expeditions, raids, domain defense: persistent condition matters.

Possible costs:

- Biomass: organic healing, mutations, Verdant/Voidborn recovery.
- Plasma: energy restoration, Solari shielding.
- Crystals: structural repair, Crystalline bodies.
- Tritium: ship recovery, travel rescue, Reaver repairs.
- Quantum Cores: revival, cloning, forecast reconstruction.
- Alloy: armor, weapons, structures.
- Data: science-based treatment.
- Shards: universal shortcut currency, carefully limited.

## Monetization Boundary

This can create spending pressure, so it needs strict guardrails.

Allowed later:

- extra medical bay slots
- cosmetics for recovery scenes
- convenience speedups in PvE/domain modes
- premium animations
- extra deck slots

Avoid:

- paid revival required for core cards
- ranked PvP recovery penalties
- deleting paid/rare cards
- making players feel punished for playing

The system should create strategy, not hostage pressure.

## Beta Implementation Plan

Phase 1:

- Rename graveyard/void language to Recovery in the live battle.
- Show Deck / Hand / Field / Recovery counts.
- Keep recovery local to the match.

Phase 2:

- Add post-match result screen with casualty summary.
- Split Recovery into:
  - Injured
  - Damaged
  - Spent
  - Fallen

Phase 3:

- Persist card condition per user card/copy.
- Add recovery timers.
- Add homeworld infirmary and repair yard.

Phase 4:

- Add assignments:
  - Send to Medical
  - Send to Repair
  - Stabilize in Fleet
  - Rescue Missing Crew

Phase 5:

- Add cards and facilities:
  - Infirmary Ship
  - Solari Restoration Chapel
  - Verdant Regrowth Grove
  - Synthari Repair Lattice
  - Quantum Revival Chamber
  - Reaver Patchwork Yard
  - Crimson War-Surgeon Forge

## Open Design Question

The key balance decision:

Should persistent injuries apply to all battles, or only campaign/domain/expedition modes?

Recommendation:

- Apply persistent condition in PvE, campaign, expeditions, raids, and domain defense.
- Keep ranked PvP fair by snapshotting decks at full battle readiness.
- Let PvP still produce card XP and cosmetics, but not punitive injury locks.
