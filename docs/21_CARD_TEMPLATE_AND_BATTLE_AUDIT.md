# Card Template And Battle Audit

Astral Ascendancy needs one canonical card shape before the card pool gets huge. A card is not just art plus attack and HP. It can be a battle unit, a world, an assignment, a science project, a relic, an evolution path, a resource engine, a PvP balance object, and a visual event in the game client.

This phase adds that foundation in `src/game/cards`.

## North Star

Every card should answer the same questions:

- What is it?
- Where can it be used?
- What does it cost?
- What does it affect?
- What world or faction does it care about?
- What does it unlock over time?
- How rare is it?
- What visual and audio treatment does it get?
- Is it actually implemented, partially implemented, or only designed?

That lets the game grow toward hundreds of cards without losing control of balance.

## Canonical Card Template

The new `CardTemplate` schema has these sections:

- `identity`: id, name, faction, set, rarity, scopes, lore, tags.
- `gameplay`: kind, readiness, cost, stats, combat typing, board placement, equipment slots, effects.
- `progression`: combine family, mastery track, evolution family, max level, XP triggers.
- `economy`: crafting shards, duplicate value, pack weight, deck copy limit, power tier, stat budget.
- `presentation`: art reference, icon, animation key, VFX profile, sound profile, reveal tier.
- `authoring`: source, rules notes, missing implementation, counterplay.

The important field is `gameplay.readiness`:

- `playable`: executable enough for the current engine.
- `rules_partial`: designed, present in collection/economy, but not ready for fair ranked play.
- `design_only`: concept exists and needs real implementation before gameplay use.

## Why This Matters

The app already has many cards across battle, worlds, science, engineering, RPG progression, relics, and domain systems. The risk is that the catalog becomes a pile of cool ideas that do not communicate.

The template makes every card readable by:

- battle engine
- pack opening
- collection
- deck builder
- daily briefing
- PvP tier rules
- domain assignments
- future monetization
- PixiJS/Rive/Three.js scenes

This is the spreadsheet truth layer, but stored in TypeScript so the app can validate it and ship it.

## Current Sources

`legacy-adapter.ts` currently adapts:

- `CARD_DEFS` from `src/lib/match-engine.ts`
- `ALL_WORLD_CARDS` from `src/lib/world-cards.ts`

Battle cards become `battle + collection` scoped templates.

World/domain cards become `domain + collection` scoped templates.

That means we can audit the whole catalog through one endpoint:

`GET /api/card-audit`

## Battle Readiness Audit

The validator checks for:

- missing ids or names
- invalid resonance cost
- entity cards without HP
- battle cards without placement rules
- non-entity cards using raw stats instead of effects
- documented effects that are not engine-backed yet
- world cards that do not mark world modification
- structure cards that do not occupy or modify board state
- missing animation/VFX/sound hooks
- invalid economy values
- duplicate ids

This is intentionally strict. It is not trying to say the game is broken. It is saying which cards can safely enter ranked play and which cards are still content/design.

## Battle System Direction

The current battle must evolve from quick prototype combat into a real 5x5 tactical card battle.

The target battle model:

- 5x5 sector board.
- Each card can attack once per turn unless an effect says otherwise.
- A card attacks another card, a structure, or a commander only when targeting rules allow it.
- Damage reduces HP.
- If attack damage exceeds defender HP, overflow only hits commander if the attacker has a keyword like Trample/Overwhelm or a rule grants overflow.
- Killing the only enemy unit should not instantly win.
- Victory comes from commander life, influence/ascendancy, objective control, or special win conditions.
- Worlds change sectors and alter combat math.
- Structures hold territory and create objectives.
- Attachments, relics, armor, weapons, and skills modify a card or commander through slots.
- Science and project cards unlock new capabilities instead of acting like normal spells.

## Card Value Formula

The template stores `economy.statBudget` as a rough first-pass budget:

`cost * 3 + attack * 2 + hp + rarity pressure + effect pressure`

This is not final balance. It is the starting signal for:

- pack rarity pressure
- PvP tier caps
- starter deck limits
- progression unlock pacing
- cards that need nerf review
- cards that are too weak for their rarity

The next version should pull from `docs/balance/card_value_formula.csv` and calculate budget with world synergy, effect timing, target flexibility, and progression ceiling.

## Rarity Foundation

The current rarity economy:

- Common: high pack weight, 3 deck copies.
- Uncommon: high pack weight, 3 deck copies.
- Rare: lower pack weight, 2 deck copies.
- Holo: rare reveal tier, 2 deck copies.
- Mythic: very low pack weight, 1 deck copy.
- Singularity: ultra-rare, 1 deck copy.

Long term, rarity should affect acquisition and reveal drama more than raw unfair power. Power should come from card progression, synergy, world development, equipment, and deck construction.

## Domain And Daily Briefing Link

Domain/world cards now have a shared template, which lets daily briefing eventually say things like:

- "Your Synthari science cards are idle while Machine worlds are producing."
- "This crew is assigned for 6 more hours, so that card should be locked from battle decks."
- "You can rescue a crew, but that deck becomes unavailable during the mission."
- "Your next ranked unlock needs a Tier 2 deck license and three battle-ready cards."
- "This world is underdeveloped compared to your faction strategy."

The briefing should not be generic. It should be computed from:

- owned cards
- card readiness
- decks
- current assignments
- world production
- faction
- rank
- PvE campaign state
- PvP goals
- resource bottlenecks

## Beta Requirements

Before beta, the game needs these content gates:

1. No ranked card can be `rules_partial` unless ranked normalizes or disables its missing effect.
2. Every ranked card must define placement, targeting, combat profile, VFX profile, and sound profile.
3. Every card must have a rarity, pack weight, duplicate value, and deck copy rule.
4. Domain assignments must mark cards/decks unavailable while assigned.
5. Deck tier rules must restrict PvP queues by rank and deck license.
6. Pack opening must read reveal tier directly from the card template.
7. Daily briefing must pull from card templates instead of hardcoded flavor.
8. Battle UI must expose why a move is legal or illegal.
9. The game client must use card animation keys and VFX profiles instead of static cards.
10. The audit endpoint must be clean enough that errors mean "do not ship."

## Next Implementation Gates

The next major build phases should be:

1. Move 3-lane prototype combat fully onto the 5x5 engine.
2. Enforce one attack per card per turn.
3. Add real target legality and overflow rules.
4. Add world state to sectors in live battle.
5. Add battle event records for PixiJS animations.
6. Make deck licenses and PvP tiers read card power tiers.
7. Lock assigned cards/decks out of battle while they are on domain missions.
8. Make daily briefing consume this card template registry.
9. Add admin/dev audit UI for card readiness and balance warnings.
10. Create a card-authoring workflow so new cards start from this template.
