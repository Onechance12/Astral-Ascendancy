# Set 001 Card Expansion

## Purpose

The alpha catalog proves the core loop. Set 001 adds deckbuilding depth.

This expansion should make each faction feel less like a starter kit and more like a real civilization with multiple deck paths.

## Expansion Goals

- Add 4 cards per core faction.
- Add 8 neutral support cards.
- Add more world, structure, attachment, and anomaly choices.
- Support alternate deck archetypes without bloating the first prototype.
- Keep every card tied to resource math through `set001_resource_costs.csv`.

## Content Count

Added in Set 001:

- 24 faction cards
- 8 neutral cards
- 32 total cards

Combined with alpha:

- 95 scripted card records across alpha plus Set 001

## Faction Archetype Expansion

### Solari

New archetype support:

- Influence control
- Anti-corruption
- Shield formations
- Commander protection

Cards:

1. Concord Arbiter
   - Entity, Rare, 4 Resonance
   - 2/6
   - Guardian. At end step, if this is adjacent to two shielded allies, gain 1 Influence.

2. Solar Writ
   - Anomaly, Uncommon, 2 Resonance
   - Give an ally Shield 1. If it is on a Star world, draw a card.

3. Purity Ray
   - Anomaly, Rare, 3 Resonance
   - Deal 3 Radiant damage to an enemy on a Corrupted world. Purify that sector if the enemy dies.

4. Helios Reactor
   - Structure, Holo, 4 Resonance
   - Build on Star world. Start of turn: gain 1 temporary Resonance. If protected by a Guardian, gain Plasma.

### Voidborn

New archetype support:

- Biomass markers
- Death loops
- Corrupted world chains
- Big consume payoffs

Cards:

1. Carrion Bloom
   - World, Uncommon, 2 Resonance
   - Terraform a sector into Organic world. Whenever an entity dies adjacent, place Biomass here.

2. Maw Apostle
   - Entity, Rare, 3 Resonance
   - 2/4
   - When this consumes Biomass, adjacent Broodlings gain +1 attack this turn.

3. Hunger Spiral
   - Anomaly, Holo, 4 Resonance
   - Consume up to 3 Biomass. Deal that much Void damage to all enemies on Corrupted worlds.

4. Brood Bridge
   - Structure, Uncommon, 2 Resonance
   - Build on Corrupted or Organic world. Your Broodlings may move through this sector without stopping.

### Synthari

New archetype support:

- Connected Machine networks
- Drone upgrades
- Attachment tempo
- Scan/control

Cards:

1. Signal Cartographer
   - Entity, Uncommon, 2 Resonance
   - 1/3
   - Scan a sector. If it is a Machine world, create a 1/1 Drone in hand.

2. Hardlight Exoshell
   - Attachment, Rare, 2 Resonance
   - Attached entity gets +1/+2. If attached to a Drone, it becomes a Construct.

3. Network Cascade
   - Anomaly, Holo, 4 Resonance
   - For each connected Machine world you control, ready one Drone or attached entity.

4. Logic Bastion
   - Structure, Rare, 3 Resonance
   - Build on Machine world. Adjacent allies have +1 flat armor against Kinetic and Bio damage.

### Verdant

New archetype support:

- Spore status
- Terrain spread
- Regeneration payoffs
- Living armor

Cards:

1. Spore Shepherd
   - Entity, Rare, 3 Resonance
   - 2/4
   - When a Spore Mark damages an enemy, heal a friendly entity for 1.

2. Bloomstep Path
   - World, Uncommon, 2 Resonance
   - Terraform a sector into Verdant world. The first friendly Beast moving from this sector each turn gains Scout.

3. Symbiotic Crown
   - Attachment, Holo, 3 Resonance
   - Attached entity gains Regenerate 1. Whenever it heals, adjacent allies gain +1 HP this turn.

4. Rootsnare
   - Anomaly, Uncommon, 2 Resonance
   - Slow an enemy on or adjacent to a Verdant world. Apply Spore Mark.

### Crimson

New archetype support:

- Self-damage control
- Structure destruction
- Weapon attachments
- Ember economy

Cards:

1. Ash Duelist
   - Entity, Uncommon, 2 Resonance
   - 3/1
   - Strike First. If damaged, gains Shield Pierce this turn.

2. Molten Graft
   - Attachment, Rare, 2 Resonance
   - Attached entity gets +2 attack. At end step, deal 1 damage to it.

3. Forge Riot
   - Anomaly, Holo, 4 Resonance
   - Deal 1 damage to all friendly entities. For each that survives, deal 1 damage to the nearest enemy.

4. Siege Crucible
   - Structure, Rare, 3 Resonance
   - Build on Crucible world. End of turn: if an enemy structure is in the same row or column, deal 2 damage to it.

### Astral

New archetype support:

- Portal chains
- Forecast matters
- Stasis control
- Aether objectives

Cards:

1. Rift Cartographer
   - Entity, Uncommon, 2 Resonance
   - 1/3
   - Forecast 1. If the forecasted card is a World, this may Blink.

2. Event Horizon
   - World, Holo, 3 Resonance
   - Terraform a sector into Astral world. The first enemy entering this sector each turn is slowed.

3. Echo Split
   - Anomaly, Rare, 3 Resonance
   - Return a friendly entity to hand. Create a 1/1 Echo token on its previous sector.

4. Star-Warden Seal
   - Attachment, Rare, 2 Resonance
   - Attached world cannot be corrupted. If attached to an Astral world, gain 1 Influence when it is contested and you retain control.

## Neutral Expansion

Neutral cards should support board fundamentals without replacing faction identity.

1. Sector Surveyor
   - Entity, Common, 1 Resonance
   - 1/2
   - When deployed, reveal the world type of a hidden or neutral sector.

2. Emergency Bulkhead
   - Structure, Common, 1 Resonance
   - 0/3
   - Build on any controlled world. Adjacent allies take 1 less damage from the next attack this turn.

3. Salvage Charter
   - Anomaly, Uncommon, 2 Resonance
   - Draw a card. If a structure was destroyed this turn, gain 1 material matching its world.

4. Frontier Beacon
   - Structure, Rare, 3 Resonance
   - Build on a Barren world. Adjacent empty sectors count as controlled for world placement only.

5. Mercenary Skiff
   - Entity, Uncommon, 2 Resonance
   - 2/2
   - Flying. Costs 1 less if you control a Gas world.

6. Crystal Lens
   - Attachment, Rare, 2 Resonance
   - Attached entity gains Forecast 1 after it attacks.

7. Null Zone
   - World, Holo, 3 Resonance
   - Terraform a sector into Barren world. This sector ignores terrain attack multipliers.

8. Ancient Terraformer
   - Entity, Mythic, 5 Resonance
   - 3/6
   - At end step, you may convert an adjacent Barren world into a basic world matching your commander faction.

## Design Guardrails

- No Set 001 card should be required for the tutorial.
- No Set 001 card should make the alpha starter decks obsolete.
- New cards should expand paths, not invalidate old ones.
- Every Set 001 card needs:
  - card catalog row
  - resource cost row
  - rarity
  - card type
  - faction
  - board role
  - value score
  - counterplay through positioning, resources, or setup

## Implementation Later

When importing cards into the app, keep Set 001 separate from alpha:

- Alpha = first playable tutorial/prototype.
- Set 001 = first real deckbuilding expansion.

This lets the prototype teach the game cleanly before exposing the full card pool.
