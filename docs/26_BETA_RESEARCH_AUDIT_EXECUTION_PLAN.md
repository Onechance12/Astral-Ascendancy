# Beta Research Audit and Execution Plan

## Purpose

Astral Ascendancy is not just a card battler.

The target is a card-based civilization RPG where every meaningful object is a card:

- worlds
- buildings
- houses
- scientists
- warriors
- scouts
- engineers
- medics
- ships
- gear
- resources
- research
- projects
- battle units
- missions

The beta needs to prove that this system is fun, understandable, and repeatable without requiring the full galaxy-scale version on day one.

## Market Research

No major hit appears to combine every part of this vision in one game. The opportunity is real, but the risk is scope.

Successful adjacent games prove the component systems:

### Digital Card Collection

Magic: The Gathering proves strategic card games can become durable, multi-decade platforms. Hasbro reports Magic at 50M+ players to date, 13M registered digital Arena players, and $1.72B FY2025 revenue across tabletop and digital.

Source: https://investor.hasbro.com/magic-gathering

Pokemon TCG Pocket proves that simplified digital collecting, pack opening, daily missions, social collection viewing, and frequent live events can become massive. Sensor Tower reports 100M downloads, #1 top-grossing card battler of all time, and calls out pack-opening/collecting as core to success.

Source: https://sensortower.com/blog/pokemon-tcg-pocket-100-million-downloads

Marvel Snap proves short matches, small decks, dramatic locations, and mobile-first clarity can bring card battlers to a broad audience. The key lesson is compression: deep strategy can fit into fast sessions.

Source: https://play.google.com/store/apps/details?id=com.nvsgames.snap

### Everything Is A Card

Stacklands proves the card-as-object UI works for villagers, structures, food, combat, and production. GameDiscover reports 450K Steam copies sold and describes it as a card-based village builder where players stack cards to collect food, build structures, and fight creatures.

Source: https://newsletter.gamediscover.co/p/how-one-of-sokpops-almost-100-steam

Cultist Simulator and Book of Hours prove that card-based work slots, timers, discoveries, texts, and ritual-like interactions can sustain a niche audience. Weather Factory reported Cultist Simulator sold 50K copies in month one as a two-person studio project, then sustained through updates/DLC.

Source: https://weatherfactory.biz/post-launch-steam-data-cultist-simulator-in-numbers/

### Emergent Colony Story

RimWorld proves players attach to procedural stories when individual pawns, injuries, bases, and events create consequence. Ludeon reported RimWorld passed 1M copies sold and credited community/modding/story sharing as part of its long-term life.

Source: https://ludeon.com/blog/2018/01/one-million-copies-sold/

### Long-Term Base And Timer Economy

Supercell proves long-term base building, upgrades, daily routines, and live operations can last for years. In its 2024 annual post, Supercell reported 300M+ monthly active players, record gross revenue, and revenue growth across all live games.

Source: https://supercell.com/en/news/forever-game/

### Tactical Card Board Caution

Duelyst proves grid-based card tactics are compelling, but also risky commercially. It was loved enough for the studio to later open-source the code/art after shutdown. The lesson: a tactical PvP card game needs stronger retention, PvE, progression, and collection loops than battle alone.

Source: https://www.gamedeveloper.com/business/tactical-card-battler-duelyst-goes-open-source-three-years-after-shutdown

Stormbound and Faeria also show that board-card hybrids can work mechanically, especially when board position creates resource/control pressure. The caution is that these games did not become Hearthstone-scale, so Astral must not rely on PvP board battles alone.

## Strategic Conclusion

Astral should not compete as a normal CCG.

It should compete as:

> A card-based civilization RPG where every card is an asset with location, condition, purpose, history, and possible petitions.

The battle board is one expression of the card system, not the whole game.

## Current Repo Audit

### Already Implemented

Resources exist on `Commander`:

- shards
- plasma
- biomass
- crystals
- tritium
- quantumCores

World/domain system exists:

- `Planet`
- `StructureDef`
- structure type/level
- planet source card
- crew card assignment
- passive resource harvest
- pending harvest preview
- domain API

Timed activity system exists:

- `Assignment`
- resource assignment
- study assignment
- rescue assignment
- busy card/deck checks
- claim rewards
- license progression

Card system exists:

- battle card definitions
- world card definitions
- planet cards
- development cards
- crew cards
- rarity
- card XP/level/matches played

Battle foundation exists:

- Pixi `/play`
- 5x5 board
- shuffled deck/draw/hand/field/recovery counters
- one attack per unit per turn
- overflow damage
- worlds/structures/attachments/anomalies
- match result pipeline
- card XP after battle

Daily briefing foundation exists:

- reads commander, decks, cards, worlds, assignments, quests, resources, ranks, rewards, latest match
- recommends next action

### Designed But Not Fully Implemented

These exist in docs/data but not as full live systems:

- science track progress
- engineering project queue
- real world regions
- native creatures
- hazards
- pollution
- world specialization
- headquarters/city buildings
- ships and travel
- recovery/medical persistence
- card petitions
- individual card copies/instances
- rule-approved card titles, personality notes, lore changes, and visual variants
- world events
- scout/warrior/scientist team risk

## Critical Design Rule

Do not make new features as separate menus.

Make them card movements.

Bad:

```txt
Click upgrade building.
Click start research.
Click gather resource.
```

Better:

```txt
Play Structure card onto World slot.
Assign Scientist card to Structure card.
Assign Warrior card to protect mission.
Spend Resource cards/currency.
Wait timer.
Receive Field Report / Petition.
Approve next action.
```

## Core Beta Model

### Everything Is A Card

Every player-owned asset should be represented as a card or card instance.

Card classes:

- World
- Region
- Structure
- Housing
- Lab
- Mine
- Factory
- Barracks
- Infirmary
- Shipyard
- Ship
- Scout
- Scientist
- Engineer
- Warrior
- Medic
- Diplomat
- Gear
- Resource
- Research
- Project
- Battle Entity
- Anomaly
- Attachment
- Relic
- Skill
- Event

### Every Card Has State

Each real owned card instance eventually needs:

- owner
- base definition
- location
- condition
- assignment
- XP/level
- traits
- equipment
- history
- art/lore variant
- busy/unavailable status

MVP can keep `UserCard` count, but beta needs `CardInstance` or equivalent.

### Every Card Has Location

Possible locations:

- collection
- deck
- battle field
- recovery
- headquarters
- world
- structure
- ship
- assignment
- training
- medical
- repair
- captured
- missing

This is the backbone of the game.

## World System

### Current

Current `Planet` is a single object with:

- type
- structure
- level
- crew
- production

### Beta Target

Worlds need layers:

```txt
World Card
  -> World Instance
    -> Regions
      -> Build Slots
        -> Structure Cards
          -> Assigned Specialist Cards
```

World properties:

- type
- biome
- size
- danger level
- discovered percent
- pollution
- stability
- population
- condition
- native presence
- resource nodes
- hazards
- special traits
- faction affinity

### World Specializations

Players should be able to specialize any world, with tradeoffs:

- War World
- Research World
- Forge World
- Garden World
- Trade World
- Fortress World
- Portal World
- Infirmary World
- Training World
- Mining World
- Shipyard World
- Prison/Containment World

Example:

```txt
Mineral World + Forge Specialization
  output: alloy, weapons, armor XP
  downside: pollution, unrest, heat hazard
  battle effect: forged gear and toxic/industrial battlefield modifiers
```

## Headquarters And City System

Headquarters is the player's capital card-container.

HQ should eventually contain:

- Command Center
- Card Vault
- Pack Chamber
- Housing District
- Research Institute
- Engineering Yard
- Training Academy
- Barracks
- Infirmary
- Revival Chamber
- Repair Yard
- Shipyard
- Marketplace
- Diplomacy Hall
- Mission Console

All of these should be structure cards.

HQ rules:

- Homeworld is safest.
- Full revival happens only at homeworld/HQ.
- Best healing happens at infirmary/revival chamber.
- Best crafting/repair happens in engineering yard/repair yard.
- Best ship building happens in shipyard.
- Best science coordination happens in research institute.

## Assignment System Expansion

Current assignments:

- resource
- study
- rescue

Beta assignments:

- Scout
- Study
- Gather
- Secure
- Build
- Train
- Heal
- Repair
- Revive
- Defend
- Expedition
- Diplomacy
- Project

### Assignment Team Composition

Assignments should allow multiple cards:

```txt
Scout toxic world:
  required: Scout or Ship
  optional: Warrior escort
  optional: Scientist
  optional: Gear
  cost: Tritium
  risk: injury/capture/discovery failure
```

### Role Logic

Scouts:

- reveal traits
- reveal hazards
- find resource nodes
- lower assignment risk

Scientists:

- study traits
- create research progress
- generate petitions
- unlock projects

Engineers:

- build structures
- repair structures
- improve world output
- create gear

Warriors:

- protect missions
- fight native creatures
- secure regions
- reduce capture/injury risk

Medics:

- stabilize injured cards
- reduce recovery time
- operate infirmaries/ships

Diplomats:

- negotiate with native civilizations
- reduce unrest
- unlock trade/culture routes

Ships:

- transport cards
- open expeditions
- carry mobile structures
- rescue cards
- act as mission platforms

## Native Creatures And Civilizations

Worlds should not be empty.

Native systems:

- wildlife
- hostile creatures
- intelligent civilizations
- ancient machines
- ruins
- parasite swarms
- rogue drones
- elemental hazards

Outcomes:

- fight
- study
- domesticate
- negotiate
- exploit
- protect
- relocate
- awaken

This should not be random story text only. It should produce rule tags.

Example:

```txt
Native Threat: Crystal Burrowers
Tags: creature, mineral, armor, underground
Risk: injures miners/scientists
Counter: warrior escort, seismic scanner, sonic lure
Unlock: Crystal Armor research
```

## Resources

Current resources are a good start:

- plasma
- biomass
- crystals
- tritium
- quantumCores
- shards

Beta likely needs more conceptual resource layers:

- Data
- Alloy
- Aether
- Verdance
- Ember
- Medical Supplies
- Relic Fragments
- Population
- Labor
- Pollution
- Stability

Recommendation:

Do not add all as currencies immediately.

Use existing currencies for beta, but model world traits and project requirements so new resources can be added when needed.

## Pollution And Hazard Example

Pollution should be a world condition, battle modifier, and resource tradeoff.

Example:

```txt
Toxic War World
  output: alloy, weapon XP, warrior training
  hazard: toxic atmosphere
  rule: unfiltered biological entities take 1 Bio damage at end of each turn
  counters:
    - Respirator Mask gear
    - Sealed Armor
    - Machine body
    - Verdant Purification
    - Astral Phase Field
```

The key is counterplay. A world hazard is fun only if players can prepare for it.

## Card Petitions

The petition system is the signature bridge.

Cards should come to the commander with requests based on actual events.

Examples:

```txt
Scientist:
I found airborne crystal spores. Approve Respirator Filtration research?
```

```txt
Warrior:
I survived toxic-world combat. Approve Hazard Warfare training?
```

```txt
Engineer:
The mine is profitable but unstable. Approve Sealed Mining Colony construction?
```

Architecture:

```txt
Rules engine detects eligible petition
Petition template renders report text from world/card state
Player approves/denies/delays
Server validates cost/time/outcome
Card/world/research state changes
```

Petitions should use authored templates and approved outcome tables. They should make the game feel alive without inventing unbounded power.

## Battle Integration

Battle should consume and create world/domain state.

Battle consumes:

- deck availability
- card condition
- gear
- world battlefield selection
- ship mission availability

Battle creates:

- card XP
- injuries
- damaged structures
- discoveries
- wreckage
- pollution
- recovery needs
- petitions
- world control changes

For ranked PvP, avoid punitive persistent injuries. For PvE, campaign, raids, domain defense, and expeditions, persistent condition is part of the strategy.

## Beta Execution Plan

### Phase 1: Master Data Model

Goal:

Create the schema foundation without full UI.

Models:

- CardInstance
- CardLocation
- CardCondition
- WorldRegion
- WorldSlot
- WorldHazard
- WorldDiscovery
- WorldSpecialization
- StructureInstance
- ShipInstance
- AssignmentTeam
- ScienceProgress
- ProjectQueue
- Petition

Deliverable:

The database can answer:

- Where is this card?
- What is it doing?
- Is it usable?
- What world/structure/ship contains it?
- What condition is it in?
- What petition did it generate?

### Phase 2: World Operations MVP

Goal:

Turn current assignments into real card-based operations.

Operations:

- Scout
- Study
- Gather
- Secure
- Build
- Train
- Heal
- Repair

Deliverable:

A player can pick a world, assign specific cards, see risk/time/reward, and claim a report.

### Phase 3: Headquarters MVP

Goal:

Build the home base as the central card container.

Structures:

- Command Center
- Infirmary
- Training Grounds
- Research Lab
- Engineering Yard
- Ship Dock

Deliverable:

Cards can live, train, heal, build, and report at HQ.

### Phase 4: World Regions And Slots

Goal:

Make worlds feel vast without a huge map.

Each world gets 3-6 regions:

- surface zone
- resource zone
- hazard zone
- ruin/native zone
- build zone

Deliverable:

Scouting reveals region cards. Structures are played into region slots.

### Phase 5: Science And Engineering Live

Goal:

Turn science docs into persisted progress.

Features:

- Science tracks
- Field tests
- Project queue
- Research unlocks
- engineering costs

Deliverable:

Scientists assigned to labs/worlds create real science progress that unlocks projects/cards.

### Phase 6: Ships And Expeditions

Goal:

Connect worlds together.

Features:

- ships transport cards
- ships have slots/modules
- expeditions discover worlds
- rescue uses ship/deck/team
- Tritium matters

Deliverable:

The galaxy starts feeling large.

### Phase 7: Recovery And Medical

Goal:

Make battle and missions have consequences.

Features:

- injured/fatigued/fallen states
- medical assignment
- repair assignment
- revival assignment
- mobile ship med bay limitations

Deliverable:

Cards can be unavailable because they are recovering, not just because of deck rules.

### Phase 8: Petition System

Goal:

Make the game feel alive.

Features:

- scientist reports
- warrior training requests
- engineer project proposals
- ship upgrade proposals
- world development proposals

Deliverable:

The player logs in and sees meaningful requests generated by their actual world/card state.

### Phase 9: Post-Match Result Scene

Goal:

Make battles feed the whole game.

Features:

- reward reveal
- card XP bars
- injury/recovery summary
- discoveries
- petitions triggered
- pack progress

Deliverable:

Winning or losing creates the next strategic decision.

### Phase 10: Beta Polish

Goal:

Make it feel like a game client, not admin software.

Features:

- Pixi world operation scene
- animated card movement between zones
- pack opening ritual
- command report screen
- headquarters view
- world view
- battle result cinematic

Deliverable:

Beta users understand the loop in one session and want to return tomorrow.

## Beta Success Criteria

A beta player should be able to:

1. Open packs and get cards that are more than battle moves.
2. Claim or discover a world.
3. Build a structure card on that world.
4. Assign a scientist/scout/warrior/engineer card.
5. Wait for a mission timer.
6. Receive a report/petition.
7. Approve a project or training.
8. Use the result in battle.
9. See battle cause XP, injuries, rewards, and new decisions.
10. Return tomorrow because resources, recovery, science, and petitions advanced.

## Main Risk

Scope.

The vision is big enough to become impossible if we build every subsystem equally.

The safe beta path is:

1. Card instance/location/condition.
2. World operations.
3. Headquarters.
4. Science/project persistence.
5. Petition system.
6. Battle result integration.
7. Graphics polish.

If those work, the rest can expand for years.

## Product Positioning

Astral Ascendancy should be pitched as:

> A living card civilization RPG where every planet, building, ship, specialist, weapon, discovery, and warrior is a card.

The key differentiator:

> Your cards do not just sit in a collection. They live, work, fight, recover, discover, petition, and evolve.
