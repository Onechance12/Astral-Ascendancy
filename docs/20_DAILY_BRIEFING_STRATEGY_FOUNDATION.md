# Daily Briefing Strategy Foundation

## Purpose

The Daily Command Brief should become the player's personalized war-room intelligence report.

It cannot be generic text.

It should look at the player's actual faction, decks, cards, worlds, resources, assignments, quests, campaign progress, PvP rank, tribe state, and near-term unlocks, then tell them what matters now.

The briefing is the layer that makes the whole game communicate.

## Core Rule

The briefing should never say something just because it sounds cool.

Every recommendation must come from a known source of truth:

- Prisma user state
- static card and faction catalogs
- balance tables
- current assignment timers
- current deck legality
- collection gaps
- domain/world production
- quest and campaign progress
- PvP tier/rank status
- tribe/friend/community status

If the data does not exist, the briefing should not pretend it knows.

## Current Truth Sources

The app already has strong raw data:

- `Commander`: faction, stats, shards, season XP, resources, active deck.
- `UserCard`: owned card definitions and copy count.
- `Deck`: saved decks, format, power score, power tier.
- `DeckLicense`: progression gates by tier.
- `Assignment`: timed resource, study, and rescue jobs.
- `Quest` and `UserQuest`: daily, weekly, and story objectives.
- `Campaign` and `CampaignProgress`: faction story chapters.
- `Planet`: claimed worlds, structures, crew assignment, resource production.
- `DevelopmentProgress`: activated world/domain upgrades.
- `Operation` and `OperationProgress`: limited-time rescue/bounty style events.
- `PvpRank`, `PvpQueueEntry`, `PvpMatch`, and `PvpMatchInvite`: ranked and multiplayer foundation.
- `Friend`, `Tribe`, `TribeMember`, and `TribeMission`: community foundation.
- Static catalogs: factions, cards, worlds, resources, science, engineering, rarity, damage math, PvP tiers, deck slots, action capacity, and economy planning.

This is enough to start a useful briefing.

## Missing Truth Sources

The current app does not yet persist several important strategy signals:

### Production Database Contract

Current state:

The Prisma schema currently uses a SQLite datasource. The production direction is Postgres on Render.

Why it matters:

The briefing analyzer will become one of the most query-heavy parts of the app because it joins player state across commander, cards, decks, assignments, quests, domain, PvP, and community systems.

Before the briefing becomes a core production surface, the database provider and migration path need to be made explicit.

Recommended rule:

Use SQLite only for local prototype work. Use Postgres for deployed persistent beta data.

### Login And Return State

Missing:

- last login timestamp separate from session update
- daily streak
- missed days
- last briefing seen
- previous briefing recommendations
- claimed daily login reward

Why it matters:

The game needs to greet a player with what changed while they were gone.

### Reward Inbox

Missing:

- unclaimed reward queue
- source of each reward
- reward expiration
- reward reveal status
- pack reward grants separate from immediate card grants

Why it matters:

Briefings need a clean way to say "claim this" without mixing rewards across quests, missions, packs, events, and future purchases.

### Card Instance And Availability

Missing:

- individual card copy ids
- per-copy busy state
- per-copy XP, mastery, armor, skills, relics, or evolution state
- copy-level deck membership

Current state:

`UserCard.count` works for collection count, but it cannot precisely answer "which copy is away studying a world?"

Why it matters:

The long-term RPG/card strategy needs exact copy availability.

### Deck Slots And Action Capacity

Missing:

- persisted saved deck slot entitlements
- persisted assignment capacity by type
- temporary capacity expiration
- slot source such as rank, license, event, subscription, purchase

Why it matters:

The briefing should know whether the next best move is "build another deck", "unlock a rescue bay", or "free a deck slot."

### Science And Engineering Progress

Missing:

- science track progress
- field test progress
- active project queue
- completed research unlocks
- project prerequisites

Why it matters:

The briefing should recommend study and engineering based on the faction's strategy and worlds.

### Faction Story State

Current state:

Campaign chapters exist, but only Solari and Voidborn seed content is currently represented in the seed file. The broader faction story data exists in static lore, not campaign progression.

Missing:

- story beat state per faction
- faction mentor/commander briefing voice
- faction-specific tutorial milestones
- faction rivalry pressure

Why it matters:

A Solari player and Voidborn player should not receive the same briefing copy or strategic priorities.

### Strategic History

Missing:

- recommendations shown recently
- player ignored or completed recommendation
- briefing conversion result
- repeated blocker detection

Why it matters:

Without history, the game may repeat stale advice and feel dumb.

## Spreadsheet Analogy

Spreadsheet-style analysis is the correct design step.

The runtime should not literally become a spreadsheet app, but the design truth should be spreadsheet-shaped:

- rows of recommendation rules
- weights for urgency and impact
- thresholds for resources, deck slots, and license progress
- faction-specific variants
- source data contracts
- reward and risk categories

This lets the game stay creative without becoming random.

The app should eventually load static rule tables and run a deterministic analyzer over the player's database state.

## Daily Briefing Data Graph

The briefing analyzer should gather this graph:

```txt
User
  -> Commander
  -> Faction definition
  -> Collection
  -> Decks
  -> Deck licenses
  -> Assignments
  -> Quests
  -> Campaign progress
  -> Operations
  -> Planets
  -> Developments
  -> PvP ranks
  -> Friends and tribe
  -> Future reward inbox
  -> Future login streak
  -> Future science progress
  -> Future card instances
```

Then it should output:

```txt
DailyBriefing
  headline
  faction_voice_line
  completed_items
  urgent_items
  recommended_action
  secondary_actions
  risk_warnings
  near_unlocks
  rewards_ready
  deck_state
  world_state
  pvp_state
  campaign_state
```

## Recommendation Ranking

A recommendation should be scored by:

- urgency
- player value
- progress toward unlock
- faction fit
- time efficiency
- blocked-state severity
- daily retention value
- fun factor
- whether it teaches a core system
- whether it avoids repetition

Example:

```txt
Skirmish License is 1 progress away.
Resource assignment takes 30 minutes.
Player has no active assignment.
Player's active deck is available.

Recommendation:
Start Resource Gathering now.

Why:
Unlocks Skirmish soon, starts a timer, and teaches resource assignment.
```

## Faction Voice

Each faction needs a briefing voice.

The copy can be templated, but the meaning must come from real state.

Examples:

- Solari: ordered, radiant, duty-focused, defensive planning.
- Voidborn: hungry, efficient, growth and consumption.
- Synthari: diagnostic, networked, optimization.
- Verdant: living, symbiotic, growth over time.
- Crimson: aggressive, forge-pressure, action now.
- Astral: prophetic, precise, path and timing.

See `docs/balance/faction_briefing_templates.csv`.

## Briefing Sections

### 1. Return Report

Answers:

- What finished while I was gone?
- What resources accumulated?
- Did any deck return?
- Did any quest complete?

Required now:

- assignments
- domain pending harvest
- quest state

Required later:

- login streak
- reward inbox
- briefing history

### 2. Strategic Priority

Answers:

- What is the single best next action?
- Why is it best?
- What does it unlock?

Examples:

- claim ready assignment
- start resource gathering
- start study
- play campaign chapter
- build a legal deck
- open a pack
- upgrade a world
- queue ranked

### 3. Faction Counsel

Answers:

- What would this faction care about?
- What world/resource/card path supports this faction?

Examples:

- Solari needs Star worlds and Plasma.
- Voidborn needs Organic/Corrupted worlds and Biomass.
- Synthari needs Machine worlds and Data.
- Verdant needs Verdant/Organic worlds and growth/healing.
- Crimson needs Crucible/Mineral worlds and Ember.
- Astral needs Astral worlds and Aether.

### 4. Deck Readiness

Answers:

- Is the active deck available?
- Is the deck legal for the next tier?
- Is the deck too weak or too strong for the selected format?
- Is a needed deck away on assignment?
- Does the player need more deck slots?

### 5. World And Resource State

Answers:

- What is producing?
- What should be harvested?
- Which world should be upgraded?
- Which resource is short for the player's next goal?

### 6. Progression Unlocks

Answers:

- Which license is nearest?
- Which campaign chapter is next?
- Which rank reward is near?
- Which science/project track should start?

### 7. Social And PvP

Answers:

- Any invites?
- Any friends online later?
- Any tribe mission needing contribution?
- Any ranked tier available?

This can stay low priority until the single-player loop feels good.

## Minimum Viable Briefing

The first implementation should not require every missing model.

MVP data can use:

- commander
- assignments
- deck licenses
- decks
- quests
- domain resources/pending
- planets
- collection summary
- campaign progress
- PvP ranks if present

MVP output:

1. One faction-flavored headline.
2. Completed assignments to claim.
3. Pending harvest/resources.
4. Nearest deck license unlock.
5. One recommended action.
6. Two secondary actions.
7. One warning if active deck is busy or no legal deck exists.

## Required Future Models

Add these when the briefing starts needing deeper truth:

```txt
LoginStreak
  userId
  currentStreak
  longestStreak
  lastClaimedAt
  nextRewardAt

RewardInbox
  userId
  sourceType
  sourceId
  rewardJson
  status
  revealType
  expiresAt
  claimedAt

BriefingHistory
  userId
  recommendationId
  priority
  shownAt
  actedAt
  dismissedAt

ScienceProgress
  userId
  trackId
  level
  xp
  unlockedJson

CardInstance
  userId
  defId
  copyIndex
  status
  masteryXp
  evolutionStage
  attachmentsJson

DeckSlotEntitlement
  userId
  slotType
  tierCap
  source
  expiresAt
  active

ActionCapacityEntitlement
  userId
  activityType
  quantity
  source
  expiresAt
```

## Implementation Order

### Phase 1: Briefing Analyzer Without New Tables

- Build `src/lib/daily-briefing.ts`.
- Query existing commander, assignments, quests, decks, licenses, planets, collection, and campaign state.
- Score recommendations using static tables.
- Add `/api/daily-briefing`.
- Render a Command Brief panel on the hub.

### Phase 2: Return Report And Reward Inbox

- Add login streak and reward inbox models.
- Move daily login rewards and completed mission rewards into the inbox.
- Add cinematic claim moments.

### Phase 3: Card Instances And Science Progress

- Add copy-level card instances.
- Add science progress.
- Make study assignments choose specific cards and worlds.
- Make briefings recommend studies based on actual owned cards and faction direction.

### Phase 4: Deck Slots And Action Capacity

- Persist deck slots and assignment capacity.
- Briefing can recommend unlocking or buying capacity later.
- Keep paid systems disabled until the core loop is fun.

## Hard Rule Before UI

Do not build the briefing UI as a static card.

Build the analyzer first.

The UI should simply render the result of the strategic data layer.
