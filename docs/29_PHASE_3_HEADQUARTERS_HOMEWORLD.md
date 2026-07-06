# Phase 3: Headquarters / Homeworld

## Goal

Create the player's capital base as a real game object.

Commander is the player identity.
Headquarters is the place the player returns to between battles, world operations, recovery, training, research, engineering, and future petitions.

This phase establishes the homeworld spine for later systems:

- structures as card containers
- medical and recovery queues
- training queues
- research and engineering projects
- petitions from living cards
- homeworld defense
- future base visuals

## Implemented Foundation

Added `Headquarters` as a persistent Prisma model.

Tracked fields:

- homeworld name
- homeworld type
- base name
- doctrine
- capital level
- command level
- infirmary level
- training level
- research level
- engineering level
- hangar level
- security level
- morale
- stability
- alert level

Existing users receive a headquarters lazily when profile or headquarters state is loaded.

## Facilities

### Capital Core

Controls base ceiling and major unlock gates.

Future hooks:

- city expansion
- headquarters visual scale
- max level caps for other buildings
- prestige or ascension upgrades

### Command Spire

Controls strategic coordination.

Future hooks:

- world operation slots
- strategic orders
- petitions
- assignment capacity

### Homeworld Infirmary

Controls medical recovery.

Future hooks:

- injured card recovery
- fallen card revival
- post-battle casualty handling
- medical queue slots

### Training Grounds

Controls warrior and card growth.

Future hooks:

- training assignments
- card XP
- class paths
- armor/weapon drills

### Research Observatory

Controls science and discovery.

Future hooks:

- study reports
- science tracks
- anomaly analysis
- researcher petitions

### Engineering Yard

Controls construction and repair.

Future hooks:

- structures as card containers
- repair queues
- world structure build projects
- damaged structure recovery

### Starship Hangar

Controls travel and expeditions.

Future hooks:

- ship cards
- rescue range
- expedition teams
- mobile operations

### Defense Grid

Controls security.

Future hooks:

- raids
- invasions
- homeworld alerts
- secure operations

## API Surface

Added:

```txt
GET /api/headquarters
POST /api/headquarters
PATCH /api/headquarters
```

GET returns:

- headquarters state
- facilities
- upgrade costs
- affordability
- resources
- derived capacities
- living asset summary

POST upgrades a facility:

```json
{
  "facilityKey": "infirmary"
}
```

PATCH changes doctrine:

```json
{
  "doctrine": "recovery"
}
```

## UI

Added a new Headquarters view reachable from the Hub.

The view includes:

- homeworld command header
- morale/stability/alert/world metrics
- resources
- doctrine selector
- facility grid
- upgrade buttons
- capacity readout
- living asset readout

## Daily Briefing Integration

Daily briefing can now recommend Headquarters when:

- a facility upgrade is affordable
- capital level is still at starter level
- the player needs a strategic base direction

## Design Constraint

Phase 3 does not implement medical queues, training queues, structure containers, or petitions yet.

It creates the durable homeworld object those later phases will use:

- Phase 4: Structures as Card Containers
- Phase 5: Recovery / Medical / Training
- Phase 6: Petitions
- Phase 7: Result Scene + Graphics
