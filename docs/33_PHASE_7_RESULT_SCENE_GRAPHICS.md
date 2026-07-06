# Phase 7 - Result Scene + Graphics

## Purpose

Battle should not end like a form submission. The result should feel like a game moment: victory, defeat, rewards, mastery, pack pressure, and next decisions all arriving with impact.

## Current Implementation

The main React battle flow now uses `MatchResultScene` instead of the old compact overlay.

It shows:

- full-screen animated starfield result scene
- victory or defeat state
- win condition and turn count
- player and enemy commander summary
- shards and season XP
- daily bonus callout
- card drop reveal with rarity color
- card mastery XP and level-up rows
- medical review rows for fatigued or injured cards
- pack pity progress
- rematch and command hub actions

The React match engine now tracks player `cardsPlayed` directly when cards are deployed or anomalies are cast. This means destroyed units and spent anomalies still count for mastery and post-battle condition handling.

The match reward pipeline now returns:

- card mastery XP
- level-up flags
- post-battle condition changes
- recovery flags
- pack progress

The Pixi game-client path now has a dedicated `ResultScene` for `victory` and `defeat`, replacing generic splash screens.

## Next Upgrades

- Feed exact result payloads into the Pixi result scene through the `GameEventBus`.
- Add card portraits, drop flip animation, reward count-up, and sound hooks.
- Expand injuries into critical, fallen, armor damage, and structure damage once battle severity is modeled.
- Add a “next best action” button based on daily briefing and petitions.

## Design Rule

The result scene should teach the player what changed and make the next action obvious. Winning should feel rewarding. Losing should create a clear reason to recover, train, rebuild, or upgrade.
