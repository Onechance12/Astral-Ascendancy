# Science and Engineering Progression

## Purpose

Astral Ascendancy should not feel like a static card game where worlds only produce currency.

The player should feel like they are leading an advancing civilization:

- Testing weapons.
- Studying alien worlds.
- Building labs.
- Engineering reactors, gates, spores, drones, shields, and siege platforms.
- Turning battlefield discoveries into permanent faction growth.

## Core Model

Science and engineering sit between battle, domain, campaign, and collection.

```txt
Battle behavior
  -> Field Test progress
  -> Science XP
  -> Research unlocks
  -> Engineering projects
  -> Upgraded worlds/cards/domain
  -> New battle options
```

This makes worlds feel alive. A Star world is not just Plasma income. It can become a shield lab, solar reactor, beam-test range, or diplomacy observatory.

## Progression Layers

### 1. Science Tracks

Science tracks are long-term civilization knowledge.

Each track has levels:

1. Hypothesis
2. Prototype
3. Field Test
4. Doctrine
5. Ascendant Theory

Science tracks should unlock options, not raw unbeatable stats.

Examples:

- Stellar Physics unlocks better Star worlds, Solari shields, radiant reactors, and anti-corruption tools.
- Xenobiology unlocks organisms, spores, biomass conversion, regeneration, and parasite control.
- Synthetic Systems unlocks drones, automation, scanning, and hardlight engineering.
- War Metallurgy unlocks armor, weapons, Crucible structures, and damage-survival effects.
- Temporal Mechanics unlocks Forecast, Blink, Stasis, and portal networks.
- Planetary Engineering unlocks terraforming, resource conversion, and world upgrades.

### 2. Field Tests

Field Tests convert player actions into research progress.

Examples:

- Shield 20 damage on Star worlds.
- Spawn 10 organisms from Corrupted worlds.
- Connect three Machine worlds in one match.
- Heal 15 HP on Verdant or Organic worlds.
- Destroy five structures with Crimson cards.
- Blink entities through two Astral gates.

Field Tests should be visible as mission-console objectives, not a hidden spreadsheet.

### 3. Engineering Projects

Engineering Projects are buildable upgrades.

They consume resources and sometimes require a science level.

Examples:

- Solar Reactor Array: Star structures produce +25% Plasma.
- Brood Incubator: Organic/Corrupted worlds can hatch a Broodling after enough deaths.
- Drone Fabricator: Machine structures periodically create Drone cards.
- Worldroot Irrigation: Verdant worlds heal more reliably.
- Siege Engine Works: Crimson structures gain structure-damage modules.
- Portal Calibration Rig: Astral gates become safer and more predictable.

### 4. Prototype Cards

Prototype cards are cards unlocked by science.

They can be:

- Science cards: represent discoveries and research boosts.
- Project cards: represent engineering facilities or build programs.
- Upgraded card variants: earnable sidegrades, not paid-only power.
- Experimental cards: high-ceiling cards with visible risk.

## Design Rule

Science should widen strategy before it increases raw power.

Good unlock:

- "Your Star worlds can purify adjacent Corrupted sectors once per match."

Risky unlock:

- "All Solari cards have +2/+2 forever."

Science should create new decisions, not erase balance.

## Faction Science Identity

### Solari

Science focus:

- Stellar Physics
- Shield Harmonics
- Radiant Purification
- Treaty Engineering

Advancement fantasy:

- Stars become laboratories.
- Shields become architecture.
- Light becomes law.

### Voidborn

Science focus:

- Xenobiology
- Adaptive Genomics
- Corruption Ecology
- Biomass Conversion

Advancement fantasy:

- The swarm learns from every death.
- Worlds become incubators.
- Biology becomes infrastructure.

### Synthari

Science focus:

- Synthetic Systems
- Autonomous Diagnostics
- Hardlight Fabrication
- Drone Logistics

Advancement fantasy:

- The board becomes a network.
- Drones become infrastructure.
- Every sector becomes data.

### Verdant

Science focus:

- Xenobotany
- Symbiotic Medicine
- Spore Culture
- Living Architecture

Advancement fantasy:

- Worlds grow upgrades.
- Armor heals.
- Forests become cities.

### Crimson

Science focus:

- War Metallurgy
- Stress Testing
- Siege Engineering
- Ember Catalysis

Advancement fantasy:

- Damage becomes fuel.
- Factories become weapons.
- Surviving pain becomes progress.

### Astral

Science focus:

- Temporal Mechanics
- Portal Geometry
- Stasis Control
- Relativity Engineering

Advancement fantasy:

- Movement becomes research.
- Time becomes infrastructure.
- Gates become civilization.

## Resource Integration

Science does not replace resources. It gives them better sinks.

- Plasma funds Stellar Physics and shield projects.
- Biomass funds Xenobiology and organism projects.
- Data funds Synthetic Systems and automation.
- Verdance funds Xenobotany and living architecture.
- Ember funds War Metallurgy and siege projects.
- Aether funds Temporal Mechanics and portal projects.
- Crystal funds durability, refraction, and precision instruments.
- Tritium funds exploration, logistics, and mobile projects.
- Alloy funds large structures, armor, machinery, and domain upgrades.

## World Integration

Worlds should level through use.

Example world advancement:

1. Barren Moon
   - Surveyed.
   - Gains a resource tag.
   - Can be terraformed.

2. Solar Forge Moon
   - Produces Plasma.
   - Builds Shield Lab.
   - Unlocks Stellar Physics field tests.
   - Can become a Solar Reactor Complex.

3. Astral Gate
   - Enables Blink.
   - Runs portal calibration.
   - Unlocks Temporal Mechanics field tests.
   - Can become a gate network node.

## Card Integration

Science and Engineering cards should exist as collectible game objects.

Card types:

- Science: discovery, research, doctrine, theorem.
- Project: lab, prototype bay, reactor plan, engineering program.

These cards should eventually be playable in domain/campaign and selectively in battle.

In PvP, science should be normalized or matched by league/ruleset so long-term players do not crush new players through permanent raw stats.

## First Implementation Direction

1. Add science tracks and engineering project data.
2. Add Set 003 Science & Engineering cards to the catalog.
3. Keep these cards `battleReady: false` until systems exist.
4. Add a future `/science` or domain tab for research.
5. Add field-test progress events from the 5x5 engine.
6. Add domain project build costs and unlock requirements.
