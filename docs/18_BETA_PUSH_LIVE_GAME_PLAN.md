# Beta Push: Living Galaxy Progression Plan

## Purpose

Astral Ascendancy has enough bones for the game:

- factions
- card catalog
- deck builder
- collection
- packs
- campaign
- domain/worlds
- passive resources
- operations
- PvP tiering
- science and engineering
- RPG progression direction

The beta push should make those systems feel like one living game.

The missing connective tissue is **time and commitment**.

Cards, crew, decks, commanders, worlds, structures, and science projects should not be abstract numbers. They should be things the player commits to jobs in the galaxy.

If a card is sent to study a world, that card is busy.

If a crew is gathering resources on a planet, that crew is unavailable.

If a battle deck is sent to rescue a crew, that deck is away and cannot be used in PvP until the mission resolves or returns.

That is the long-term game loop.

## Genre Model

Astral Ascendancy should become:

```txt
Tactical card battler
  + RPG deck progression
  + async strategy timers
  + living world/domain management
  + collection economy
  + PvE campaign
  + ranked PvP
  + tribes/community
```

This is not only a card battler. It is a **living galaxy command game** where battles, cards, worlds, and resources all matter over time.

## Beta North Star

A beta player should have something meaningful to do in three session lengths:

### 2 Minutes

- Collect resources.
- Claim completed assignments.
- Open a reward.
- Start a study, mining, rescue, or training task.
- Adjust a deck.

### 10 Minutes

- Play a PvE battle.
- Queue an unranked/ranked PvP match.
- Complete a field test.
- Upgrade a world or structure.
- Resolve an operation.

### 45 Minutes

- Push campaign progress.
- Build a new deck tier.
- Plan world assignments.
- Run multiple PvP matches.
- Manage tribe/community goals.

The player should leave the game with timers running and a reason to come back.

## The Core Loop

```txt
Play battle
  -> earn cards/resources/mastery/renown
  -> unlock assignments
  -> send cards/decks/crew/worlds to timed tasks
  -> assigned assets become unavailable
  -> tasks finish later
  -> claim rewards
  -> unlock stronger deck licenses/world levels/science projects
  -> play tougher PvE/PvP
```

## Assignment Commitment Rules

### Rule 1: Busy Means Busy

If an asset is assigned to a timed task, it cannot be used somewhere else.

Examples:

- A crew assigned to a mining operation cannot also boost another world.
- A card sent to a science study cannot be placed into a battle deck.
- A deck sent to rescue a crew cannot queue for PvP.
- A commander sent on a high-risk diplomatic mission cannot enter certain campaign battles.

This creates real decisions.

### Rule 2: Copies Matter

If the player owns multiple copies of a card, one copy can be busy while another remains usable.

Example:

```txt
Owned: 3x Radiant Squire
1 copy assigned to Star World Training
2 copies still available for decks
```

This makes duplicates meaningful without only becoming dust.

### Rule 3: Deck Commitment Is High Stakes

A whole deck can be assigned to:

- rescue mission
- bounty hunt
- expedition
- world defense
- tribe war deployment
- campaign scouting

While assigned:

- deck cannot be edited
- deck cannot queue PvP
- cards inside may be locked from other decks depending on format

This makes players maintain multiple decks and tier-specific rosters.

### Rule 4: Timers Teach Mechanics

Timed tasks should teach what the next system does.

Examples:

- Study Star World teaches Stellar Physics.
- Rescue Crew teaches operations.
- Train Starter Deck teaches deck license progression.
- Survey Barren World teaches world upgrading.
- Relic Expedition teaches relic slots.

## Deck License Progression

Players should unlock deck power tiers through achievement.

Deck licenses should exist across PvE and PvP.

```txt
Starter License
  -> Skirmish License
  -> Veteran License
  -> Ascendant License
  -> Mythic License
  -> Open War License
```

Power is not flattened. Power is earned and organized.

Players can own powerful cards before they can use them in all formats.

Example:

```txt
You discovered Apex Molt.
Reach Veteran License to use Evolution cards in battle decks.
```

This creates long-term aspiration without hiding exciting cards.

See `docs/balance/deck_license_progression.csv`.

Deck licenses should also unlock deck capacity.

The player needs multiple usable decks per tier because timed assignments can make decks unavailable. Starter should begin with enough capacity to learn, Skirmish should add the first serious extra slots, and Veteran should make specialized ranked, campaign, rescue, and defense decks normal.

See `docs/19_DECK_CAPACITY_AND_ECONOMY_FOUNDATION.md` and `docs/balance/deck_slot_capacity.csv`.

## Assignment Types

### Resource Gathering

Send crew/cards to worlds to gather resources.

Examples:

- Mining Team on Mineral World.
- Solar Priests on Star World.
- Biomass Cultivators on Organic World.
- Scout Squad on Gas World.

Output:

- resources
- world XP
- occasional card drops
- science progress

Risk:

- low

Duration:

- 15 minutes to 8 hours

### World Study

Send science cards, study cards, or researchers to learn a world.

Output:

- science XP
- world traits
- unlock hidden resources
- field-test objectives

Risk:

- low to medium

Duration:

- 30 minutes to 12 hours

### Engineering Project

Send project cards, crew, and resources to build upgrades.

Output:

- structure upgrade
- reactor
- portal calibration
- fabricator
- relic socket
- deck license requirement progress

Risk:

- low

Duration:

- 1 hour to 24 hours

### Rescue Operation

Send a deck to rescue crew, recover cards, or retrieve relics.

Output:

- crew card
- rescued card
- shards
- relic fragments
- campaign unlock

Risk:

- medium to high

Duration:

- 20 minutes to 6 hours

Commitment:

- full deck unavailable while deployed

### Expedition

Send a deck or crew to unknown worlds.

Output:

- new world
- resource node
- enemy encounter
- science project
- artifact

Risk:

- medium

Duration:

- 1 hour to 12 hours

### Training

Send cards/decks to training simulations.

Output:

- card mastery
- commander XP
- deck license progress
- tutorial completion

Risk:

- none

Duration:

- 10 minutes to 2 hours

### Defense Deployment

Assign a deck to defend a world/domain node.

Output:

- protects resources
- contributes to tribe/world control
- unlocks defense reports

Risk:

- medium

Duration:

- 2 hours to 24 hours

## World And Resource Timers

Worlds should produce passively, but active assignments make them more interesting.

### Passive Production

Always runs if a structure exists.

Examples:

- Solar Harvester produces Plasma.
- Biomass Farm produces Biomass.
- Crystal Mine produces Crystal.
- Gas Refinery produces Tritium.
- Quantum Array produces Data/Aether-like research output.

### Active Assignment Production

Requires busy assets.

Examples:

- Crew assigned to world.
- Science card assigned to study.
- Project card assigned to build.
- Deck assigned to defend.

Active assignments should produce higher rewards and progression but create opportunity cost.

Assignment capacity is separate from saved deck capacity.

A player may have many saved decks but only one rescue bay, study lab, or engineering bay until progression unlocks more. This keeps the galaxy readable and gives science, worlds, and future subscriptions a clean place to add convenience without bypassing PvP legality.

See `docs/balance/action_capacity_progression.csv`.

## Availability Model

Every owned card/deck/crew needs an availability state.

Suggested states:

- available
- in_deck
- assigned_resource
- assigned_study
- assigned_project
- assigned_rescue
- assigned_expedition
- assigned_defense
- injured
- locked_by_tutorial

Important:

- The player must always understand why something is unavailable.
- The UI should say where it is and when it returns.

Example:

```txt
Dawn Knight unavailable
Assigned to Rescue Operation: Vrellis Nebula
Returns in 1h 12m
```

## Beta Feature Set

The beta should not implement every dream system. It should prove the living loop.

### Must Have

- `/play` game-client entry remains.
- Deck license ladder.
- PvE campaign path.
- PvP tiered queue foundation.
- Domain worlds and passive resource harvest.
- Active assignments with timers.
- Busy cards/decks/crew.
- Starter and Skirmish unlock flow.
- Pack/reward moments.
- First rescue operation.
- First study assignment.
- First resource assignment.
- First deck unavailable state.

### Should Have

- Veteran license plan visible but mostly locked.
- Tribe/friend UI shell.
- World level 1 to 3.
- Basic field-test progress.
- Assignment completion notifications.
- Deck power meter tied to license legality.

### Not For First Beta

- Live monetization.
- Fully open player trading.
- Full tribe wars.
- Full real-time PvP battle sync if not stable.
- Deep AI economy simulation.
- Dozens of parallel assignment types.

Beta should still plan the economy foundation: deck slot capacity, assignment capacity, future entitlements, transparent pack rules, and disabled store-ready product categories. Do not enable checkout until the loop is fun and fair.

See `docs/balance/economy_monetization_surfaces.csv`.

## Beta Progression Arc

### First 30 Minutes

Player should:

1. Choose faction.
2. Open starter pack.
3. Play tutorial battle.
4. Claim first world.
5. Assign first crew/resource task.
6. Build first Starter deck.
7. See Skirmish License locked with clear requirements.

### First Day

Player should:

1. Complete early PvE campaign nodes.
2. Run several short assignments.
3. Unlock Skirmish License.
4. Open Skirmish reward pack.
5. Try unranked PvP or training.
6. Start first study assignment.

### First Week

Player should:

1. Reach Veteran path visibility.
2. Build multiple tier decks.
3. Own cards that are too powerful for current license.
4. Rescue or recruit crew.
5. Upgrade worlds.
6. Join or create a tribe.
7. Understand that the galaxy keeps moving while offline.

### First Month

Player should:

1. Have several worlds.
2. Maintain multiple decks.
3. Run long assignments overnight.
4. Unlock Veteran.
5. Start evolving cards.
6. Care about faction identity.
7. Have a reason to keep logging in without grinding endlessly.

## Beta Push Sequence

### Beta 0: Stabilize The Foundation

Goal:

- Existing app builds and deploys cleanly.
- Database schema supports future systems.
- Docs and balance tables are coherent.

Exit criteria:

- Build passes.
- Prisma schema can push.
- Render deploys.
- No old-brand language.

### Beta 1: Assignment Clock

Goal:

- Add `Assignment` model.
- Add asset availability service.
- Add create/claim assignment APIs.
- Show active assignments in Domain/Operations.

Exit criteria:

- Player can assign a crew/card/deck to a timed task.
- Asset becomes unavailable.
- Timer completes.
- Player claims reward.

### Beta 2: Deck License Ladder

Goal:

- Add `DeckLicense` model.
- Gate deck tier use by license.
- Add unlock requirements.
- Add Starter -> Skirmish unlock celebration.
- Add earned saved deck slot rewards.

Exit criteria:

- Player starts with Starter.
- Skirmish is locked with clear requirements.
- Completing requirements unlocks Skirmish.
- Reward pack is granted.
- Extra deck slot is granted and explained.

### Beta 3: World Study And Resource Expansion

Goal:

- Add study assignments.
- Add world XP.
- Add world traits.
- Add resource specialization.

Exit criteria:

- Player can study a world.
- Study returns a trait/reward.
- World improves or reveals a path.

### Beta 4: Rescue Operations

Goal:

- Deck commitment missions.
- Rescue crew/cards.
- Deck unavailable while deployed.
- Risk/reward resolution.

Exit criteria:

- Player sends a deck away.
- Deck cannot be used in battle.
- Operation resolves later.
- Reward or failure outcome appears.

### Beta 5: PvP And Community Beta

Goal:

- Tiered PvP queue uses deck license and deck power.
- Friends and tribes have visible UI.
- Tribe contribution begins.

Exit criteria:

- Player can queue legal decks only.
- Player can manage friends.
- Player can create/join tribe.
- Tribe contribution grows from battles/assignments.

## Risk Notes

### Risk: Too Many Timers

Fix:

- Start with 3 assignment types:
  - resource
  - study
  - rescue

### Risk: Player Feels Punished By Busy Cards

Fix:

- Make early timers short.
- Give starter duplicates.
- Always show return time.
- Let players cancel low-risk assignments with partial/no reward.

### Risk: PvP Feels Locked Away

Fix:

- Starter PvP unlocked early.
- Skirmish unlock happens quickly.
- Higher tiers are aspirational, not required.

### Risk: Game Feels Like A Spreadsheet

Fix:

- Assignments must look like missions on worlds.
- Cards should visually fly to a world/operation.
- Timers should appear on game objects, not tables.

## Beta Implementation Priority

The next implementation target should be:

```txt
Assignment Clock + Deck License Ladder
```

These two systems make everything else matter.

Without assignments, resources are passive numbers.

Without deck licenses, progression power has no teaching structure.

Together they create a game players can live in for years.
