# PvP Ranked And Community Systems

## Purpose

PvP in Astral Ascendancy should support real card progression without letting veterans farm new players.

The rule is:

```txt
Progression creates power.
Deck tier measures power.
Matchmaking respects power.
Rank proves skill inside that power bracket.
```

Account level should not be the source of combat power. Combat power comes from deck contents:

- card rarity
- card mastery
- evolution stage
- armor
- skills
- relics
- commander loadout
- world cards
- domain/campaign unlocks allowed by the format

## PvP Modes

### Ranked Ascendancy

Serious ladder.

- Requires a validated battle deck.
- Uses deck tier plus rating.
- Updates seasonal rank.
- Rewards packs, cosmetics, titles, Aether Shards, relic fragments, and tribe contribution.
- Does not allow illegal higher-tier decks into lower-tier queues.

### Unranked Battle

Casual matchmaking.

- Uses deck power matching but expands faster than ranked.
- Does not update ladder rank.
- Can grant normal play rewards and mastery progress.
- Good for testing decks.

### Friendly Duel

Direct challenge.

Rule options:

- Open power
- Tier cap
- Starter-only
- Draft
- Mirror world
- Experimental cards allowed
- PvE progression allowed
- PvP normalized

### Training Simulation

Practice mode.

- Test decks without rank loss.
- Can use bots or scripted faction archetypes.
- Grants reduced mastery progress.
- Supports deck legality preview.

### Event Queues

Rotating weekly formats.

Examples:

- Common/Uncommon only
- No relics
- No evolved cards
- World cards doubled
- One faction only
- Draft packs
- Tier 1 only
- Open War weekend

## Deck Power Tiers

Every battle deck gets a Deck Power Rating.

Power is calculated from:

- base card cost and stats
- rarity
- card type
- battle role
- progression type
- duplicate density
- evolved/advanced/masterwork/ascendant tags
- future per-copy progression metadata

Initial bracket names:

1. Starter
2. Skirmish
3. Veteran
4. Ascendant
5. Mythic
6. Open War

The live scoring constants are seeded in `docs/balance/pvp_deck_tiers.csv`.

## Battle Decks

Players should maintain multiple decks for different brackets.

Examples:

- Starter Solari Shields
- Skirmish Voidborn Swarm
- Veteran Astral Blink
- Ascendant Synthari Network
- Open War Crimson Monster Deck

The deck builder should eventually show:

```txt
Deck Power: 2,740
Tier: Veteran II
Illegal for: Starter, Skirmish I
Reason: 3 evolved cards, 2 rare relics, commander skill path active
```

## Ranked Structure

Rank is separate from deck power.

A player can be:

- Gold in Starter
- Silver in Veteran
- Unranked in Open War

Rank names:

- Bronze Orbit
- Silver Orbit
- Gold Orbit
- Platinum Constellation
- Diamond Constellation
- Ascendant
- Singularity

Each rank has divisions 5 through 1 before promotion.

Rating is tracked per:

- season
- queue type
- deck tier

This keeps low-tier skill meaningful.

## Matchmaking Rules

Ranked matching:

1. Match exact queue type.
2. Match exact deck tier.
3. Match close rating.
4. Respect new-player protection.
5. Avoid repeated opponents.
6. Expand rating window slowly.
7. Never match Starter against Ascendant or Mythic decks.

Unranked matching:

1. Match similar deck power.
2. Allow wider rating range.
3. Prioritize fast matches.
4. Still protect new players from extreme deck gaps.

Friendly duel:

1. Sender chooses rules.
2. Recipient accepts.
3. Both decks validate against the chosen rules.

## New Player Protection

Until a player has enough PvP history:

- Starter and Skirmish queues should prefer other protected players.
- Open War is allowed only by explicit player choice.
- Ranked placement should start conservative.
- The UI should warn before entering a high-power queue.

## PvP Rewards

Ranked rewards:

- rank points
- seasonal ladder progress
- mastery XP
- card drops
- shards
- tribe influence
- cosmetics

Unranked rewards:

- normal battle drops
- reduced ladder-independent progression
- mastery XP

Friendly rewards:

- minimal rewards
- no rank
- optional mastery-disabled setting to prevent farming

## Friends

Friend systems should include:

- friend request
- accept/decline/block
- online status later
- direct duel invite
- recent opponents
- spectate later

Initial data model:

- `Friend`
- `PvpMatchInvite`

## Tribes

Tribes are player communities.

Initial tribe systems:

- tribe name
- slug
- emblem
- faction banner
- founder
- member roles
- contribution
- invite/join flow later

Later tribe systems:

- tribe chat
- tribe missions
- tribe wars
- tribe boss/world invasion events
- shared leaderboards
- in-tribe tournaments

No tribe-exclusive combat power in the first version.

## Implementation Phases

### Phase 1: Design Foundation

- PvP design doc.
- Deck tier table.
- Ranked ladder table.
- Matchmaking table.

### Phase 2: Data And Deck Power

- Add deck power fields.
- Add PvP rank, queue, match, invite, friend, tribe models.
- Add deck power calculation library.

### Phase 3: PvP Hub UI

- Replace beta-only multiplayer copy.
- Show active deck power and tier.
- Show ranked/unranked/friendly/event sections.
- Show friends/tribes as planned systems.

### Phase 4: Matchmaking API

- Queue create/cancel.
- Deck validation.
- Rank overview.
- Match records for PvP.
- Result reporting scaffold.

### Phase 5: Community API

- Friend request scaffold.
- Tribe create/list scaffold.
- Tribe member model and roles.

## Current Guardrails

- PvP queue APIs can validate decks and create queue entries.
- Real-time battle sync is still separate work.
- Rank updates should not become fully authoritative until server-side battle resolution exists.
- Do not turn all PvP into normalized starter mode; that would erase the RPG promise.

