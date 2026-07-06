# Phase 2: World Operations

## Goal

Make claimed worlds do more than passively generate resources.

Phase 2 turns a world into an active command surface where the player sends exact living card copies to do timed work:

- gather resources
- survey terrain and anomalies
- scout nearby sector routes
- secure the planet perimeter

The important rule is that the card is real. If a player sends a card to a world operation, that exact `CardInstance` becomes busy until the timer completes and rewards are claimed.

## Implemented Foundation

World operations are stored in the existing `Assignment` table instead of adding a separate model.

This keeps them visible to:

- daily briefing
- active assignment counts
- card availability
- reward claiming
- future petition logic

World operation assignment types:

```txt
world_gather
world_survey
world_scout
world_secure
```

## Operations

### Gather

Requires a built structure on the world.

Purpose:

- direct resource haul
- teaches that structures matter
- makes high-level worlds feel productive

Eligible card categories:

- crew
- entity
- structure

Rewards scale from:

- world structure level
- sent card level
- planet or structure resource type

### Survey

Studies the planet.

Purpose:

- science/research flavor
- anomaly discovery foundation
- later feeds petitions and world modifiers

Eligible card categories:

- crew
- science
- project
- entity

Rewards:

- shards
- Quantum Cores
- Skirmish license progress

### Scout

Searches the surrounding sector.

Purpose:

- future campaign hooks
- expedition route setup
- world danger preview

Eligible card categories:

- crew
- entity
- skill

Rewards:

- shards
- Tritium
- Veteran license progress

### Secure

Protects the world.

Purpose:

- foundation for raids, invasions, pollution, and hostile natives
- makes warrior cards useful outside battle

Eligible card categories:

- crew
- entity
- relic
- skill

Rewards:

- shards
- local world resource
- Veteran license progress

## API Surface

Added:

```txt
GET /api/world-operations
POST /api/world-operations
PATCH /api/world-operations
```

GET returns:

- operation definitions
- operation capacity from Headquarters Command Spire
- active and ready world operations
- eligible available card instances

POST starts an operation:

```json
{
  "type": "gather",
  "planetId": "...",
  "cardInstanceId": "..."
}
```

PATCH claims an operation:

```json
{
  "action": "claim",
  "assignmentId": "..."
}
```

## Card Lifecycle

When started:

```txt
CardInstance.location = assignment
CardInstance.status = busy
CardInstance.currentAssignmentId = assignment.id
CardInstance.planetId = planet.id
```

When claimed:

```txt
CardInstance.location = collection
CardInstance.status = available
CardInstance.currentAssignmentId = null
```

## Headquarters Capacity Integration

Audit pass update:

World operations now respect Headquarters capacity.

Capacity is derived from:

```txt
Command Spire level + floor(Capital level / 2)
```

Active and ready world operations both occupy capacity. A ready operation must be claimed before that slot opens again.

The Domain Operations panel now shows:

```txt
used slots / max slots
```

and disables new launches when slots are full.

## Domain UI

The Domain screen now has:

- Planets tab
- Operations tab
- World Cards tab

The Operations tab lets the player:

- see active world operations
- claim ready operations
- select a planet
- select operation type
- select an eligible available card
- launch a timed world task

## Design Constraint

Phase 2 intentionally does not create recovery, training, building containers, petitions, or headquarters logic.

Those are later phases:

- Phase 3: Headquarters / Homeworld
- Phase 4: Structures as Card Containers
- Phase 5: Recovery / Medical / Training
- Phase 6: Petitions

Phase 2 only establishes the world operation loop and proves that worlds, cards, resources, and timers communicate through one shared foundation.
