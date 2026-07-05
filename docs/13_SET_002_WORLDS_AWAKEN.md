# Set 002: Worlds Awaken

## Purpose

Set 001 widened deckbuilding. Set 002 makes the battlefield itself matter more.

This set leans into the core promise of Astral Ascendancy: players do not just play cards onto a board. They develop, scar, corrupt, seal, and weaponize the board.

## Expansion Goals

- Add more playable worlds and structures for the 5x5 engine.
- Give every faction at least one new board-development path.
- Add answers to powerful terrain without deleting terrain from the game.
- Add more attachments that make cards feel alive.
- Keep every card readable enough for future animated implementation.

## Content Count

Added in Set 002:

- 30 faction cards
- 6 neutral cards
- 36 total cards

Combined scripted catalog after Set 002:

- Alpha catalog
- Set 001
- Set 002

## Design Theme

Set 002 is about board identity.

Cards should make the 5x5 map visibly change:

- Star sectors flare.
- Corrupted sectors pulse.
- Machine sectors connect.
- Verdant sectors spread.
- Crucible sectors burn.
- Astral sectors bend movement.
- Neutral sectors become contested resources.

## Faction Cards

### Solari

1. Dawnline Cartographer
   - Entity, Uncommon, 2 Resonance
   - 1/4
   - When deployed, mark a straight line of Star sectors. Allies on that line gain Shield 1 until your next turn.

2. Treaty Spire
   - Structure, Rare, 3 Resonance
   - 0/5
   - Build on a controlled Star world. Enemy entities adjacent to this sector cannot gain Influence.

3. Solar Mantle
   - Attachment, Uncommon, 2 Resonance
   - Attached entity gains Shield 1 and cannot be corrupted.

4. Verdict of Helios
   - Anomaly, Holo, 5 Resonance
   - Deal 2 Radiant damage to enemies on Corrupted or contested sectors. Purify one sector hit this way.

5. Celestial Embassy
   - World, Rare, 3 Resonance
   - Terraform a sector into Star world. If adjacent to two controlled sectors, gain 2 Influence.

### Voidborn

1. Larval Tide
   - Entity, Common, 1 Resonance
   - 1/1
   - Swarm. If deployed on Corrupted world, create another Larval Tide in an adjacent empty sector.

2. Parasite Crown
   - Attachment, Rare, 2 Resonance
   - Attached enemy entity gets -1 attack. When it dies, spawn a Broodling for you on its sector.

3. Spawning Pit
   - Structure, Rare, 3 Resonance
   - 0/4
   - Build on Organic or Corrupted world. Start of turn: if adjacent sector is empty, create a 1/1 Broodling.

4. Black Bloom
   - World, Holo, 4 Resonance
   - Terraform into Corrupted world. Adjacent Organic worlds also become Corrupted at end step if uncontrolled.

5. Consume the Map
   - Anomaly, Mythic, 6 Resonance
   - Destroy a friendly structure. Corrupt all adjacent sectors and deal 2 Void damage to enemies on them.

### Synthari

1. Survey Drone Wing
   - Entity, Common, 1 Resonance
   - 1/1
   - Flying. When it enters a Machine world, Scan 1.

2. Circuit Bloom
   - World, Rare, 3 Resonance
   - Terraform into Machine world. Connected Machine worlds count as adjacent for Deploy Beacon.

3. Nanite Plate
   - Attachment, Uncommon, 2 Resonance
   - Attached entity gains +0/+2 and flat armor 1.

4. Assembly Spine
   - Structure, Holo, 4 Resonance
   - 0/6
   - Build on Machine world. End step: if you control three connected Machine worlds, create a 2/2 Construct.

5. System Override
   - Anomaly, Rare, 3 Resonance
   - Exhaust an enemy structure. If it is on Machine world, take control of it until end of turn.

### Verdant

1. Glowcap Runner
   - Entity, Common, 1 Resonance
   - 1/2
   - Scout. When it moves from Verdant world, heal itself 1.

2. Mycelial Archive
   - Structure, Rare, 3 Resonance
   - 0/5
   - Build on Verdant or Organic world. Whenever an adjacent ally heals, Forecast 1.

3. Living Bulwark
   - Attachment, Uncommon, 2 Resonance
   - Attached entity gains +0/+3. If on Verdant world, it gains Guardian.

4. Overgrowth Surge
   - Anomaly, Holo, 4 Resonance
   - Spread Verdant to up to two adjacent neutral sectors. Allies on those sectors heal 2.

5. Worldroot Gate
   - World, Rare, 3 Resonance
   - Terraform into Verdant world. Friendly Beasts may move between connected Verdant worlds.

### Crimson

1. Ember Sapper
   - Entity, Uncommon, 2 Resonance
   - 2/2
   - When this attacks a structure, deal 1 extra Kinetic damage.

2. Blood-Metal Harness
   - Attachment, Rare, 2 Resonance
   - Attached entity gets +1/+1. When it takes damage and survives, gain Ember.

3. War Foundry
   - Structure, Holo, 4 Resonance
   - 0/6
   - Build on Crucible world. Start of turn: give the nearest damaged ally +1 attack this turn.

4. Scorched Claim
   - World, Rare, 3 Resonance
   - Terraform into Crucible world. When control changes here, deal 1 damage to both commanders.

5. Break the Line
   - Anomaly, Uncommon, 2 Resonance
   - Push an enemy entity one sector away. If it hits a structure, deal 2 damage to both.

### Astral

1. Gate Moth
   - Entity, Common, 1 Resonance
   - 1/1
   - Flying. If deployed adjacent to an Astral world, Blink once this turn.

2. Timeglass Reliquary
   - Structure, Rare, 3 Resonance
   - 0/4
   - Build on Astral world. Start of turn: Forecast 1. If it is a World card, reduce its cost by 1.

3. Phase Cloak
   - Attachment, Uncommon, 2 Resonance
   - Attached entity gains Phase: first Kinetic damage against it each turn is reduced by 2.

4. Foldspace Treaty
   - Anomaly, Holo, 4 Resonance
   - Swap two friendly entities. If either is on Astral world, both gain Shield 1.

5. Starless Door
   - World, Mythic, 5 Resonance
   - Terraform into Astral world. Once per turn, the first entity leaving this sector may move to any revealed Astral sector.

## Neutral Cards

1. Survey Claim
   - World, Common, 1 Resonance
   - Terraform a neutral sector into Barren world and reveal adjacent hidden sectors.

2. Mobile Barricade
   - Structure, Uncommon, 2 Resonance
   - 0/4
   - Build on controlled world. Can move one sector once before becoming fixed.

3. Salvage Medic
   - Entity, Uncommon, 2 Resonance
   - 1/3
   - When deployed adjacent to a damaged structure, heal it 2.

4. Gravity Anchor
   - Attachment, Rare, 2 Resonance
   - Attached sector cannot be Blinked into or out of.

5. Wreckage Field
   - World, Rare, 3 Resonance
   - Terraform into Barren world. Structures destroyed here create 1 Material cache.

6. Relic of First Contact
   - Attachment, Holo, 3 Resonance
   - Attached entity gains +1/+1. If it stands on a world matching neither player's faction, gain 1 Influence.

## Implementation Guardrails

- These cards should remain `battleReady: false` until the 5x5 engine supports their exact text.
- The `/play` prototype can use selected Set 002 cards once their rules are implemented.
- Do not add monetization around Set 002.
- Strong board cards need counterplay through control, movement, structure removal, or terrain disruption.
