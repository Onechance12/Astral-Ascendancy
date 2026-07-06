# Phase 5: Recovery / Medical / Training

## Goal

Make living cards preserve condition and growth across the broader game.

Phase 5 adds the first homeworld care loops:

- medical recovery
- training drills
- card XP gain
- exact-card queue locking
- headquarters capacity limits

This is not yet the full battle casualty system. It is the durable queue foundation that battle results, expeditions, raids, and petitions can feed later.

## Implemented Foundation

Added recovery and training queues using the existing `Assignment` table.

New assignment types:

```txt
medical_recovery
training_drill
```

These are deliberately claimed through the Headquarters care API, not the generic assignment API, because their results are card-state changes rather than simple currency rewards.

## Medical Recovery

Medical recovery uses `Headquarters.infirmaryLevel` as capacity.

If Infirmary level is 0:

```txt
No medical beds are available.
```

Eligible conditions:

- fatigued
- injured
- critical
- fallen
- damaged
- restoring

When recovery starts:

```txt
CardInstance.location = medical
CardInstance.status = busy
CardInstance.condition = restoring
CardInstance.currentAssignmentId = assignment.id
```

When recovery is claimed:

```txt
CardInstance.location = collection
CardInstance.status = available
CardInstance.condition = healthy
CardInstance.currentAssignmentId = null
```

Fallen cards require Infirmary level 3.

## Training

Training uses `Headquarters.trainingLevel` as capacity.

If Training Grounds level is 0:

```txt
No training slots are available.
```

Eligible conditions:

- healthy
- fatigued

When training starts:

```txt
CardInstance.location = training
CardInstance.status = busy
CardInstance.currentAssignmentId = assignment.id
```

When training is claimed:

```txt
CardInstance.location = collection
CardInstance.status = available
CardInstance.condition = fatigued
CardInstance.xp += reward XP
CardInstance.level may increase
```

The matching `UserCard` summary syncs upward to the highest known XP/level for that card definition.

## API Surface

Added:

```txt
GET /api/recovery-training
POST /api/recovery-training
PATCH /api/recovery-training
```

GET returns:

- recovery/training capacities
- active and ready care queues
- recovery candidates
- training candidates

POST starts recovery:

```json
{
  "action": "recover",
  "cardInstanceId": "..."
}
```

POST starts training:

```json
{
  "action": "train",
  "cardInstanceId": "..."
}
```

PATCH claims a care queue:

```json
{
  "action": "claim",
  "assignmentId": "..."
}
```

## UI

The Headquarters screen now includes a Medical / Training section.

It shows:

- recovery bed usage
- training slot usage
- active care queues
- ready claim buttons
- cards eligible for recovery
- cards eligible for training

## Design Constraint

Phase 5 does not yet create injuries from battle results.

That belongs with Phase 7 and later battle-result persistence. This phase builds the system that will receive those injuries when result scenes start producing them.

## Next Hooks

Phase 6 petitions can now ask for:

- training approval
- recovery priority
- revival permission
- medical facility upgrades
- class specialization after training

Phase 7 result scenes can now output:

- card injured
- card fatigued
- card fallen
- card gained XP
- card needs recovery
