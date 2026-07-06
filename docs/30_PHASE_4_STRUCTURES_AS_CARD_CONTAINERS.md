# Phase 4: Structures As Card Containers

## Goal

Make built structures into real places, not just resource numbers on a planet.

Before this phase, a planet had:

```txt
structureType
structureLevel
```

That was enough for passive production, but not enough for the bigger game loop where cards live inside structures, work inside structures, defend them, repair them, train in them, or create petitions from them.

Phase 4 adds the container layer.

## Implemented Foundation

Added `StructureInstance`.

`Planet.structureType` and `Planet.structureLevel` remain as the production summary.

`StructureInstance` represents the actual built structure object:

- structure id
- user
- planet
- type
- name
- level
- status
- integrity
- max integrity
- capacity
- future source card fields
- metadata

## Container Sync

Built planet structures are mirrored into `StructureInstance` rows lazily.

When a player opens the structure-container API, the server checks every planet with a built structure:

```txt
Planet.structureType != null
Planet.structureLevel > 0
```

Then it creates or updates the matching `StructureInstance`.

This avoids a risky backfill script and keeps old accounts compatible.

## Stationed Cards

Cards can now be stationed inside structures.

Stationing a card updates the exact `CardInstance`:

```txt
location = structure
status = busy
planetId = structure.planetId
structureKey = structure.id
```

Removing the card returns it to collection:

```txt
location = collection
status = available
planetId = null
structureKey = null
```

## Eligible Cards

Phase 4 allows these categories to be stationed:

- crew
- entity
- science
- project
- structure

This is intentionally broad enough to support:

- workers
- guards
- scientists
- engineers
- structure support cards

Later phases can narrow or specialize this by structure type.

## API Surface

Added:

```txt
GET /api/structure-containers
POST /api/structure-containers
PATCH /api/structure-containers
```

GET returns:

- structure containers
- stationed cards
- eligible available cards

POST stations a card:

```json
{
  "structureId": "...",
  "cardInstanceId": "..."
}
```

PATCH removes a card:

```json
{
  "action": "unstation",
  "cardInstanceId": "..."
}
```

## UI

The Domain screen now has:

- Planets
- Ops
- Structures
- World Cards

The Structures tab lets the player:

- see each built structure as a container
- inspect integrity and capacity
- see stationed living cards
- station eligible available cards
- remove stationed cards back to collection

## Why This Matters

This is the concrete step toward:

- laboratories containing scientists
- infirmaries containing patients
- barracks containing trainees
- repair yards containing damaged structures
- hangars containing ships
- reactors containing workers
- world structures producing petitions

The spreadsheet analogy becomes actual game state:

```txt
Card -> Location -> Container -> Planet -> Homeworld -> Strategy
```

## Design Constraint

Phase 4 does not yet add bonuses from stationed cards.

That comes later when the game has:

- structure-specific jobs
- medical/training/research queues
- repair timers
- petitions
- battle result injuries and damage

For now, the important foundation is that a structure can contain living card instances and those cards are unavailable elsewhere while stationed.
