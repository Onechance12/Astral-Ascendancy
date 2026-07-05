# Deck Capacity And Economy Foundation

## Purpose

Astral Ascendancy needs many usable decks, not one perfect deck.

The player should feel like they are commanding a living faction:

- one deck is climbing ranked
- one deck is defending a world
- one deck is rescuing a crew
- one deck is training low-tier cards
- one deck is testing a new faction build

This creates long-term play because decisions have opportunity cost. If the player sends a deck away, that deck is actually away.

The economy foundation must support this without turning PvP into a wallet contest.

## Core Rule

Paid items can increase options, convenience, cosmetics, and collection speed.

Paid items must not bypass deck tier validation, ranked ladder requirements, or matchmaking power rules.

```txt
Money can expand the player's command room.
Money cannot secretly lower a deck's power tier.
```

If a purchased card, weapon, armor piece, world, or relic makes a deck stronger, the deck power rating rises and the deck moves into the proper tier.

## Three Separate Capacity Systems

These must stay separate in code and UI.

### 1. Saved Deck Slots

Saved deck slots are the number of decks a player can keep built.

Purpose:

- support multiple factions
- support multiple PvP tiers
- support PvE and assignment decks
- reduce frustration when decks are away

Saved deck slots should be unlockable by license, rank, campaign milestones, events, and future purchase entitlements.

### 2. Active Assignment Capacity

Assignment capacity is how many timed tasks can run at once.

Examples:

- resource crews
- study teams
- engineering projects
- rescue operations
- expeditions
- defense deployments

This is not the same as saved deck capacity. A player might own 12 saved decks but only have 1 active rescue bay.

### 3. Deck Tier Licenses

Deck licenses control which power tier a deck can enter.

Examples:

- Starter License
- Skirmish License
- Veteran License
- Ascendant License
- Mythic License
- Open War License

Licenses are earned by progression. Paid purchases should not directly unlock ranked licenses.

## Deck Slot Model

A deck slot should eventually have these fields:

```txt
deck_slot_id
user_id
slot_type
tier_cap
source
expires_at
is_active
label
```

Suggested `slot_type` values:

- general
- ranked
- campaign
- rescue
- expedition
- defense
- event
- training

The slot type is a teaching/defaulting tool, not a hard prison unless a special event requires it.

Example:

```txt
Slot: Veteran Rescue Deck
Tier Cap: Veteran
Source: Earned from Veteran License
Expires: never
```

## Usable Deck Philosophy

The player should have several decks per tier over time.

Early game:

- enough slots to learn
- enough slots to send one deck away without losing all play
- clear reason to unlock Skirmish

Mid game:

- one PvP deck per tier
- one PvE/campaign deck
- one rescue or defense deck
- one experiment deck

Late game:

- multiple meta decks
- faction-specific decks
- world/terrain counter decks
- tribe defense decks
- event decks
- expedition decks

## Recommended Deck Slot Arc

Starter account:

- 3 saved deck slots
- 1 Starter ranked slot
- 1 campaign/training slot
- 1 flex slot

Skirmish:

- unlock 2 more earned deck slots
- teach that a rescue deck may be unavailable
- give one Skirmish reward pack

Veteran:

- unlock 3 more earned deck slots
- introduce relic/evolution deck validation
- unlock first serious rescue/defense deck identity

Ascendant:

- unlock 3 more earned deck slots
- introduce high-power world-aware decks
- make deck specialization matter

Mythic and Open War:

- unlock fewer slots, but make them feel prestigious
- most extra capacity comes from rank, events, subscriptions, or permanent purchases

See `docs/balance/deck_slot_capacity.csv`.

## Rank-Based Slot Unlocks

Rank should unlock extra slots inside the tier the player actually plays.

Example:

```txt
Silver Orbit in Skirmish
  -> +1 Skirmish saved deck slot

Gold Orbit in Veteran
  -> +1 Veteran saved deck slot

Platinum Constellation in Ascendant
  -> +1 Ascendant saved deck slot
```

This rewards skill and engagement without handing raw stats to the deck.

Rank unlocks should be exciting:

- slot unlock cinematic
- new deck frame
- "Build your first Veteran sideboard deck" mission
- starter cards for that tier
- tutorial explaining legal deck power

## Timed And Paid Deck Slots

Future monetization can sell deck capacity as:

- 24 hour temporary slot
- 7 day temporary slot
- season slot
- permanent slot
- subscription slot bundle

Rules:

- An expired slot never deletes a deck.
- An expired slot freezes the deck until the player frees or renews capacity.
- If a deck is on an assignment when the slot expires, the assignment can finish.
- The expired deck cannot start new missions or queue PvP until capacity is valid.
- Paid slots still obey deck tier licenses and deck power rating.

This supports revenue without feeling like theft.

## Active Assignment Capacity

The game should sell and unlock activity capacity separately from deck slots.

Examples:

- Study Lab Slot
- Rescue Bay
- Engineering Bay
- Expedition Bay
- Defense Fleet Slot

Earned capacity should always be enough to play meaningfully for free.

Paid capacity should add convenience, specialization, and more long-session planning.

See `docs/balance/action_capacity_progression.csv`.

## Store And Entitlement Foundation

Do not hardcode paid products directly into gameplay models.

Use a product and entitlement layer.

Recommended future models:

```txt
ProductCatalog
  id
  sku
  display_name
  product_type
  grants_json
  price_cents
  currency
  active

Entitlement
  id
  user_id
  entitlement_type
  scope
  quantity
  source
  starts_at
  expires_at
  metadata_json

WalletLedger
  id
  user_id
  currency
  delta
  reason
  source_id
  created_at

PurchaseGrant
  id
  user_id
  provider
  provider_purchase_id
  product_sku
  granted_at
  revoked_at
```

Gameplay should ask the entitlement service:

```txt
How many saved deck slots does this user have?
How many rescue bays are active?
Does this subscription slot expire?
What tier can this deck enter?
```

The deck builder should not care whether capacity came from rank, campaign, event, subscription, or purchase.

## Monetization Surfaces

The strongest future surfaces are:

- card packs
- starter bundles
- cosmetics
- permanent deck slots
- temporary deck slots
- assignment capacity
- speed boosts
- battle pass
- world skins
- commander skins
- card animations
- faction base cosmetics
- armor and weapon blueprints
- subscription command pass

See `docs/balance/economy_monetization_surfaces.csv`.

## Fairness Rules

### Packs

Packs may sell collection progress.

Required guardrails:

- visible odds
- pity rules
- duplicate protection
- craftable chase cards
- no paid-only competitive staples

### Weapons And Armor

Weapons and armor can be powerful.

Rules:

- they increase deck power score
- they require tier/license legality
- ranked queues validate them
- low-tier formats can ban or normalize them

### Worlds

Worlds can be earned, opened, crafted, or eventually sold.

Rules:

- world cards affect deck power
- campaign worlds can unlock resource paths
- paid world access cannot bypass campaign teaching gates
- ranked formats can restrict world card rarity and tier

### Speed

Speed monetization is dangerous and must be capped.

Allowed:

- finish short assignments faster
- reduce PvE/domain timers
- catch-up for new players
- subscription convenience within daily caps

Not allowed:

- instant ranked progress
- instant seasonal rank
- bypassing deck license requirements
- unlimited acceleration of high-value rewards

Speed should use a named currency like Chrono Cells with daily and weekly caps.

## Beta Scope

Do not implement payments in beta.

Beta should implement:

- earned deck slots
- visible slot caps
- active assignment caps
- deck unavailable states
- deck license gates
- frozen placeholder state for future entitlements

Beta should document future products but leave Stripe/checkout disabled until the game loop is fun.

## First Implementation Milestones

### Milestone 1: Saved Deck Capacity

- Add deck slot capacity service.
- Starter account gets 3 slots.
- Skirmish unlock grants +2 slots.
- Deck creation validates remaining capacity.
- UI explains how to unlock more slots.

### Milestone 2: Assignment Capacity

- Add per-type assignment caps.
- Starter account gets 1 resource, 1 study, 1 rescue.
- Higher licenses and science projects increase caps.
- UI shows "1/2 rescue bays active".

### Milestone 3: Rank Slot Rewards

- Link PvP rank milestones to deck slot grants.
- Add rewards to rank ladder display.
- Unlock slot celebration.

### Milestone 4: Entitlement Schema

- Add entitlement records.
- Capacity service reads earned and temporary entitlements.
- No purchase UI yet.

### Milestone 5: Store-Ready Catalog

- Add product catalog data model.
- Add disabled store previews.
- Add odds and fairness copy.
- Only enable checkout after pack, economy, and PvP validation are stable.
