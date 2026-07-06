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
- pack pity progress
- rematch and command hub actions

The client now sends surviving player cards to `/api/matches` as early `cardsPlayed` data so the existing mastery system can start surfacing in the result screen.

The Pixi game-client path now has a dedicated `ResultScene` for `victory` and `defeat`, replacing generic splash screens.

## Next Upgrades

- Track every played card in the React battle engine, including destroyed cards and anomalies.
- Feed exact result payloads into the Pixi result scene through the `GameEventBus`.
- Add card portraits, drop flip animation, reward count-up, and sound hooks.
- Connect injuries, recovery petitions, and post-battle medical review directly from result outcomes.
- Add a “next best action” button based on daily briefing and petitions.

## Design Rule

The result scene should teach the player what changed and make the next action obvious. Winning should feel rewarding. Losing should create a clear reason to recover, train, rebuild, or upgrade.
