# Phase 1: Living Card Asset Foundation

## Goal

Make the game understand that a card is not only a collection count. A card can be a specific owned asset with a location, condition, assignment, and availability.

This is the spine for the larger vision:

- scientists living in labs
- warriors training on worlds
- scouts assigned to expeditions
- crew cards working planets
- worlds and structures as card containers
- injured cards entering recovery
- ships carrying cards
- petitions generated from actual card/world state

## Implemented Foundation

### CardInstance

Added `CardInstance` as the exact-copy layer.

`UserCard` still summarizes collection ownership:

```txt
You own 3 Solari Scouts.
```

`CardInstance` represents each actual copy:

```txt
Solari Scout copy A:
  location: collection
  status: available
  condition: healthy

Solari Scout copy B:
  location: assignment
  status: busy
  condition: healthy
```

Tracked fields:

- defId
- source
- displayName
- title
- XP
- level
- location
- status
- condition
- assignment link
- deck/world/planet/ship placeholders
- metadata

### Locations

Phase 1 location vocabulary:

- collection
- deck
- assignment
- headquarters
- world
- structure
- ship
- recovery
- training
- medical
- repair
- captured
- missing

### Status

Phase 1 status vocabulary:

- available
- busy
- unavailable

### Condition

Phase 1 condition vocabulary:

- healthy
- fatigued
- injured
- critical
- fallen
- damaged
- restoring

## Backfill Strategy

Existing accounts still have `UserCard.count`.

The server lazily creates missing card instances from those counts when:

- `/api/card-instances` is called
- `/api/collection` is called
- assignment code needs an available card instance

This avoids a risky one-time migration script while still moving the app toward exact card copies.

## Assignment Integration

Assignments now support:

- legacy `cardDefId`
- new `cardInstanceId`

If the client sends only `cardDefId`, the server selects an available matching instance.

When an assignment starts:

- the card instance moves to `location = assignment`
- `status = busy`
- `currentAssignmentId` is set

When the assignment is claimed:

- the card instance returns to `location = collection`
- `status = available`
- `currentAssignmentId` clears

## Domain Integration

Planet crew assignment now stores:

- `crewCardDefId`
- `crewCardInstanceId`

Assigned crew cards move to:

```txt
location = world
status = busy
planetId = assigned planet
```

Unassigned crew cards return to collection.

Planet cards and development cards also move as instances:

- planet cards become world assets
- development cards become headquarters/domain assets

## API Surface

Added:

```txt
GET /api/card-instances
```

Returns:

- all exact card instances
- summary counts
- availability
- locations
- conditions

Updated:

- `/api/assignments`
- `/api/collection`
- `/api/domain`

## What This Unlocks Next

Now the game can start asking:

- Where is this exact card?
- Is it available?
- Is it injured?
- Is it assigned?
- Which world is it on?
- Which assignment owns it?
- Can this card be used in battle right now?

## Next Phase

Phase 2 should be World Operations MVP:

- Scout
- Study
- Gather
- Secure
- Build
- Train
- Heal
- Repair

Those operations should use card instances as teams, not just card definition ids.
