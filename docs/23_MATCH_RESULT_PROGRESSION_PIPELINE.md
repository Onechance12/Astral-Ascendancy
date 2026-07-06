# Match Result + Progression Pipeline

This phase makes battles matter after the board ends. A match should produce a durable result object that feeds collection growth, daily briefing strategy, card mastery, rank/deck progression, and future pack/reward systems.

## Result Flow

1. Pixi battle reaches victory or defeat.
2. The client submits `/api/matches` with:
   - result: win or loss
   - commander and enemy identity
   - turns, remaining HP, mode, difficulty
   - deployed count, cast count
   - cards played by defId
3. The server processes progression before writing the match record.
4. The match record stores the displayable reward summary.
5. Daily briefing reads the latest match and turns it into strategic advice.

## Reward Truth

The server is the authority for rewards. The client reports what happened, but the server owns the actual grants.

Current grants:

- Win: 50 shards, 100 season XP, higher drop chance.
- Loss: 20 shards, 40 season XP, lower drop chance.
- First match of the day: bonus shards and XP.
- Campaign mode reduces farming rewards.
- Wins grant faction resources.
- Matches can trigger card drops with rare-plus pity.
- Played cards gain card mastery XP.
- Quests and rescue operations progress from match triggers.

## Card Mastery

Each owned `UserCard` now tracks:

- `xp`
- `level`
- `matchesPlayed`
- `lastPlayedAt`

Cards played in battle gain XP. A win gives more XP than a loss, and repeat plays in the same battle give a small capped bonus. If a battle uses a valid card the account does not own yet, the server creates a battle mastery copy so the progression state remains consistent during prototype decks and starter flow.

Level thresholds are intentionally simple for beta:

- Level 1: 0 XP
- Level 2: 40 XP
- Level 3: 100 XP
- Level 4: 180 XP
- Level 5: 300 XP
- Level 6+: scales every 220 XP

Long term, card level should unlock cosmetic states, mastery variants, border effects, title badges, and possibly PvE-only upgrade branches. PvP power should remain governed by deck tier and rules format so old players do not automatically crush new players.

## Pack Progress

Match rewards return `packProgress`:

- current rare-plus pity counter
- rare-plus threshold
- wins until guaranteed rare-plus

This is not yet a full pack meter, but it is the foundation for a post-battle result screen that can show progress toward a dramatic pack/opening ritual.

## Daily Briefing Use

The briefing now reads the latest match:

- A win becomes momentum: keep fighting while the deck is working.
- A loss becomes diagnosis: tune the deck and improve board control.
- The summary includes last battle result, enemy, mode, timestamp, and reward summary.

This matters because briefings should eventually become strategic, personal, and faction-specific rather than generic daily tasks.

## Next Build Target

The next visual/game-feel phase should add an actual post-match result scene:

- victory or defeat splash
- reward count-up
- card XP bars
- level-up burst
- pack progress meter
- dropped card reveal
- continue buttons for Battle Again, Deckbuilder, Packs, and Daily Briefing
