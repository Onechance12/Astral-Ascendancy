# Phase 2-7 Audit

## Audit Result

The Phase 2-7 foundation is present and connected:

- worlds can run timed operations with exact living card instances
- headquarters exists as the homeworld command object
- built structures can contain real card instances
- medical and training queues lock exact cards and return them with state changes
- petitions generate from live player state
- result scenes show rewards, progression, and battle aftermath

This pass found and corrected three missing cross-phase connections.

## Filled During Audit

### World Operation Capacity

Gap:

Headquarters exposed `worldOperationSlots`, but `startWorldOperation` did not enforce that capacity.

Fix:

- world operations now load Headquarters
- active and ready world operations occupy capacity
- capacity is `Command Spire level + floor(Capital level / 2)`
- Domain Operations UI shows used/max slots
- launch buttons disable when slots are full

### Played Card Tracking

Gap:

The React battle result only sent surviving player cards as `cardsPlayed`, so destroyed units and spent anomalies did not receive mastery or post-battle handling.

Fix:

- `MatchState.cardsPlayed` is now part of the match engine
- `playCard` records deployed entities and cast anomalies
- result submission sends exact played-card history

### Battle Results Feeding Medical

Gap:

Phase 5 created medical/training queues, but battle results did not produce fatigue or injuries.

Fix:

- match rewards now include `cardConditions`
- wins fatigue played available card instances
- losses injure one played available card instance and fatigue the rest
- only available collection copies are touched
- result scene now displays Medical Review rows
- injured cards can now trigger recovery petitions

## Phase Status

### Phase 2: World Operations

Status: implemented and tightened.

Working:

- gather, survey, scout, secure operations
- exact `CardInstance` locking
- operation rewards
- claim flow
- Domain Operations UI
- Headquarters capacity enforcement

Still later:

- operation-specific danger rolls
- native creatures
- pollution/world hazards
- world operation result reports with narrative events

### Phase 3: Headquarters / Homeworld

Status: implemented.

Working:

- persistent Headquarters model
- facilities and doctrine
- resource-based upgrades
- derived capacities
- Headquarters UI
- daily briefing integration

Still later:

- visual homeworld/base map
- city regions
- building placement
- homeworld defense events

### Phase 4: Structures As Card Containers

Status: implemented.

Working:

- `StructureInstance`
- lazy sync from built planet structures
- station/unstation exact card instances
- capacity and integrity fields
- Domain Structures UI

Still later:

- stationed-card bonuses
- structure jobs
- damaged/repairing structure queues
- specialized labs, barracks, reactors, hangars, and hospitals

### Phase 5: Recovery / Medical / Training

Status: implemented and connected to results.

Working:

- medical recovery queues
- training queues
- exact card locking
- infirmary/training capacity
- card XP and level gain
- post-battle fatigue/injury feed

Still later:

- critical/fallen severity tables
- revival costs
- armor/weapon training paths
- specialist class upgrades

### Phase 6: Petitions

Status: implemented.

Working:

- durable Petition table
- generated petitions from real state
- approve/dismiss state
- command hub panel
- routing to HQ, Domain, Operations, or Packs
- duplicate prevention with generated keys

Still later:

- faction-specific petition writing
- card portraits and source art
- petitions with resource cost choices
- accepted petitions that start approved jobs

### Phase 7: Result Scene + Graphics

Status: implemented and tightened.

Working:

- full-screen React result scene
- Pixi result scene
- reward display
- card drop reveal panel
- card mastery display
- medical review display
- pack progress display

Still later:

- animated count-up numbers
- card flip/reveal in result scene
- sound hooks
- server-fed Pixi result payloads
- more cinematic victory/defeat transitions

## Foundation Health

The important system chain now exists:

```txt
Battle result
  -> rewards
  -> card mastery
  -> card fatigue/injury
  -> medical/training candidates
  -> petitions
  -> headquarters/domain action
```

This is the core loop the larger RPG/card/world game needs.
