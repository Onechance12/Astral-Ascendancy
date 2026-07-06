# Phase 6 - Petitions

## Purpose

Petitions turn the command hub into a living base interface. The player should not only read menus. Cards, worlds, structures, assignments, and headquarters systems should surface requests that feel like people and places asking command for approval.

This is the foundation for:

- injured cards requesting medical recovery
- trained cards requesting drills or specialization
- worlds requesting gather, survey, scout, or secure orders
- structures requesting stationed cards
- headquarters requesting facility upgrades
- completed timers requesting claim review
- pack openings surfacing as a ritual request when enough shards exist

## Current Implementation

The `Petition` table stores durable command requests with:

- `sourceType` and `sourceId` for the thing making the request
- `tone` for urgency and presentation
- `priority` for sorting
- `status` for open, approved, dismissed, or expired
- `actionType` and JSON payload for routing the player to the right game system
- `generatedKey` to prevent duplicate spam

The `/api/petitions` route generates current petitions from real player state, returns open requests, and resolves them through approve or dismiss actions.

Approving a petition does not spend resources or start irreversible work. It routes the player to the correct place, such as Headquarters, Domain, Operations, or Pack Opening. The player still makes the final gameplay decision there.

## First Petition Sources

- Ready assignment rewards
- Early headquarters direction
- Missing infirmary when injured cards exist
- Medical recovery when beds are available
- Missing training grounds when cards can train
- Training rotations when slots are available
- Idle worlds with eligible operation cards
- Structures with open station capacity
- Pack availability at 100+ shards

## Design Rule

Never let this become a plain notification list. A petition should feel like a commander, scientist, medic, engineer, planet, or structure reporting to the player.

Future versions should add portraits, card art, faction voice, animations, and stronger approve-result feedback.
