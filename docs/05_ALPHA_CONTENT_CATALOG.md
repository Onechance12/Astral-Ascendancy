# Alpha Content Catalog

This is the first playable content script. It is not every card forever. It is the first complete set that proves the game: six factions, six commanders, 5x5 board, worlds, structures, attachments, evolution, and readable tactical play.

For the first deckbuilding expansion after alpha, see `docs/11_SET_001_CARD_EXPANSION.md`.

For the second board-development expansion, see `docs/13_SET_002_WORLDS_AWAKEN.md`.

For science, engineering, and faction advancement systems, see `docs/14_SCIENCE_ENGINEERING_PROGRESSION.md`.

For the RPG-style interaction audit across battle, worlds, commander levels, card mastery, relics, skills, and evolutions, see `docs/15_RPG_GAME_SYSTEMS_AUDIT.md`.

For the first RPG foundation card expansion, see `docs/16_SET_004_RPG_FOUNDATIONS.md`.

## Alpha Content Target

- 6 commanders
- 6 starter decks
- 48 faction cards
- 12 neutral cards
- 2 Singularity chase cards
- 12 world cards
- 12 structures
- 12 attachments
- 6 pack/reward rarity treatments
- 5 campaign planets
- 1 tutorial planet

## Rarity

The playable card list below is the readable design catalog. The stricter spreadsheet-style source for tuning is:

- `docs/balance/alpha_card_catalog.csv`
- `docs/balance/world_catalog.csv`
- `docs/balance/rarity_ladder.csv`

Use the CSV files when balancing cost, stats, damage school, defense profile, creature class, world affinity, combine family, and deck role.

Common:

- Core mechanics, simple stat lines, tutorial-friendly.

Uncommon:

- Faction synergies, board positioning.

Rare:

- Build-around cards and stronger worlds/structures.

Holo:

- Flashy cards with animated frames and strong identity.

Mythic:

- Commander-level signature cards.

Singularity:

- Ultra-rare cosmic cards, earned/craftable long-term. Avoid too many in alpha.

Rarity rules:

- Common and Uncommon cards should remain important in real decks.
- Rare cards should define build paths.
- Holo cards should be visually dramatic and tactically memorable.
- Mythic cards should feel like faction signatures.
- Singularity cards should be rare af, rule-bending, craftable, and never paid-only.
- Duplicate combining improves animation, cosmetics, lore, campaign options, or sidegrade access, not raw PvP stat power.

## Detailed Card Record Fields

Every card should eventually have these fields:

- `card_id`
- `name`
- `faction`
- `rarity`
- `card_type`
- `cost`
- `attack`
- `hp`
- `damage_school`
- `defense_profile`
- `creature_class`
- `world_affinity`
- `structure_class`
- `keywords`
- `combine_family`
- `board_role`

This keeps the card fantasy tied directly to combat math and board behavior.

## Solari Starter Set

Commander:

- Vael'Sun, Dawn Herald

Cards:

1. Solari Acolyte
   - Type: Entity
   - Cost: 1
   - Stats: 1/2
   - Text: If this survives until your next turn, evolve into Dawn Acolyte.
   - Evolved: 2/3, Shield 1.
   - Role: early body, teaches evolution.

2. Lightblade Sentinel
   - Type: Entity
   - Cost: 2
   - Stats: 3/2
   - Text: Strike First. Gains Shield 1 on Star worlds.
   - Role: early pressure.

3. Dawn Knight
   - Type: Entity
   - Cost: 3
   - Stats: 3/4
   - Text: Guardian. Adjacent allies take 1 less damage from the next attack each turn.
   - Role: formation anchor.

4. Stellar Guardian Aeon
   - Type: Entity
   - Cost: 5
   - Stats: 3/7
   - Text: Guardian. Shield 2. Cannot be moved by enemy effects.
   - Role: defensive wall.

5. Solar Forge Moon
   - Type: World
   - Cost: 2
   - Text: Terraform a sector into Star World. While controlled, your first Shield each turn is +1 stronger.
   - Role: world identity.

6. Dawn Spire
   - Type: Structure
   - Cost: 3
   - Stats: 0/5
   - Text: Start of turn: give adjacent allies Shield 1. If three allies have Shield, gain 1 Influence.
   - Role: defensive engine.

7. Radiant Aegis
   - Type: Attachment - Armor
   - Cost: 1
   - Text: Attached entity gains Shield 2. If attached on a Star World, also gains +1 HP.
   - Role: survivability.

8. Dawnbreak
   - Type: Anomaly
   - Cost: 5
   - Text: Deal 2 damage to all enemies. Purify corrupted sectors adjacent to your entities.
   - Role: comeback and visual spectacle.

Signature animation:

- Gold ring expands from target sector; shields bloom as hard-light discs.

## Voidborn Starter Set

Commander:

- Vzaal, Apex Brood

Cards:

1. Void Broodling
   - Type: Entity
   - Cost: 1
   - Stats: 1/1
   - Text: When destroyed, leave Biomass on this sector.
   - Role: swarm seed.

2. Acid Spitter
   - Type: Entity
   - Cost: 2
   - Stats: 2/2
   - Text: Ranged 2. Deals +1 damage to armored or shielded enemies.
   - Role: anti-defense.

3. Infestor Node
   - Type: Entity
   - Cost: 3
   - Stats: 1/5
   - Text: Guardian. At end step, corrupt this sector if it is neutral.
   - Role: board conversion.

4. Brood Tyrant
   - Type: Entity
   - Cost: 4
   - Stats: 4/4
   - Text: Overwhelm. Gains +1/+1 for each adjacent Broodling.
   - Role: payoff.

5. Void Nest
   - Type: World
   - Cost: 2
   - Text: Terraform a sector into Organic/Corrupted World. When a friendly organism dies here, spawn a 1/1 Broodling adjacent if possible.
   - Role: swarm terrain.

6. Hive Nest
   - Type: Structure
   - Cost: 3
   - Stats: 0/4
   - Text: Start of turn: spawn a 1/1 Broodling in an adjacent empty sector.
   - Role: pressure engine.

7. Parasite Carapace
   - Type: Attachment - Parasite Armor
   - Cost: 1
   - Text: Attached organism gets +1/+2. When it dies, spawn a 1/1 Broodling.
   - Role: sticky board.

8. World Hunger
   - Type: Anomaly
   - Cost: 5
   - Text: Consume all Biomass markers. Deal that much damage split across enemies nearest to corrupted sectors.
   - Role: finisher.

Signature animation:

- Purple-black tendrils pull light from the sector; death leaves pulsing biomass.

## Synthari Starter Set

Commander:

- Unit-0 Lyra, Prime Architect

Cards:

1. Survey Drone
   - Type: Entity
   - Cost: 1
   - Stats: 1/1
   - Text: Flying. When deployed, Scan a sector.
   - Role: cheap utility.

2. Relay Operator
   - Type: Entity
   - Cost: 2
   - Stats: 2/3
   - Text: If deployed adjacent to a Machine world or structure, create a 1/1 Drone.
   - Role: setup body.

3. Overclocked Striker
   - Type: Entity
   - Cost: 3
   - Stats: 5/2
   - Text: Strike First. End of turn: takes 1 damage.
   - Role: burst damage.

4. Prime Walker
   - Type: Entity
   - Cost: 5
   - Stats: 4/6
   - Text: Attachments on this cost 1 less. When it attacks, one attached Drone also attacks.
   - Role: late engine.

5. Relay Grid
   - Type: World
   - Cost: 2
   - Text: Terraform a sector into Machine World. Connected Machine worlds extend Deploy Beacon for Synthari entities.
   - Role: network terrain.

6. Drone Foundry
   - Type: Structure
   - Cost: 3
   - Stats: 0/4
   - Text: Start of turn: create a 1/1 Drone in an adjacent empty sector.
   - Role: token engine.

7. Adaptive Plating
   - Type: Attachment - Armor
   - Cost: 2
   - Text: Attached entity gets +0/+3. The first time it would die, destroy this attachment instead.
   - Role: protection.

8. System Override
   - Type: Anomaly
   - Cost: 4
   - Text: Move a Drone or attached entity up to 2 sectors. It may attack after moving.
   - Role: tactical swing.

Signature animation:

- Cyan vector lines lock onto sectors; pieces assemble from hard-light fragments.

## Verdant Starter Set

Commander:

- Myca Vey, Spore Oracle

Cards:

1. Seedling Scout
   - Type: Entity
   - Cost: 1
   - Stats: 1/2
   - Text: Regenerate 1 on Organic or Verdant worlds.
   - Role: survivable scout.

2. Spore Archer
   - Type: Entity
   - Cost: 2
   - Stats: 2/2
   - Text: Ranged 2. Damaged enemies receive Spore Mark.
   - Role: status spread.

3. Living Bulwark
   - Type: Entity
   - Cost: 3
   - Stats: 2/5
   - Text: Guardian. Regenerate 1.
   - Role: durable wall.

4. Worldroot Colossus
   - Type: Entity
   - Cost: 6
   - Stats: 5/7
   - Text: Costs 1 less for each connected Verdant world you control.
   - Role: terrain payoff.

5. Verdant Seedbed
   - Type: World
   - Cost: 2
   - Text: Terraform a sector into Verdant World. At end step, heal one friendly entity on it for 1.
   - Role: sustain terrain.

6. Worldroot Nursery
   - Type: Structure
   - Cost: 3
   - Stats: 0/5
   - Text: Start of turn: heal adjacent allies 1. If no healing happens, spread Verdant to adjacent empty neutral sector.
   - Role: board growth.

7. Living Armor
   - Type: Attachment - Armor
   - Cost: 2
   - Text: Attached entity gets +1/+2 and Regenerate 1.
   - Role: sustain attachment.

8. Spore Bloom
   - Type: Anomaly
   - Cost: 4
   - Text: Apply Spore Mark to all enemies on or adjacent to Organic/Verdant worlds. Draw a card.
   - Role: area pressure.

Signature animation:

- Bioluminescent spores drift upward; roots stitch cracked tiles together.

## Crimson Starter Set

Commander:

- Korr Vane, Crucible Warlord

Cards:

1. Ember Initiate
   - Type: Entity
   - Cost: 1
   - Stats: 2/1
   - Text: When damaged and survives, gains +1 attack.
   - Role: aggression tutorial.

2. Blood-Metal Raider
   - Type: Entity
   - Cost: 2
   - Stats: 3/2
   - Text: Frenzy. If played on Crucible World, gains +1 HP.
   - Role: pressure.

3. Forge Breaker
   - Type: Entity
   - Cost: 3
   - Stats: 4/3
   - Text: Pierce Shield. Deals +1 damage to structures.
   - Role: anti-defense.

4. Crucible Titan
   - Type: Entity
   - Cost: 6
   - Stats: 6/6
   - Text: When this takes damage, deal 1 damage to all adjacent enemies.
   - Role: boss-like threat.

5. Crimson Crucible
   - Type: World
   - Cost: 2
   - Text: Terraform a sector into Crucible World. Entities played here take 1 damage and gain +1 attack.
   - Role: risk/reward terrain.

6. Ember Cannon
   - Type: Structure
   - Cost: 3
   - Stats: 0/4
   - Text: End of turn: deal 1 damage to nearest enemy in same row or column.
   - Role: placement weapon.

7. Blood-Metal Plate
   - Type: Attachment - Armor
   - Cost: 2
   - Text: Attached entity gets +2 HP. When damaged, it gains +1 attack until end of turn.
   - Role: rage armor.

8. Crucible Verdict
   - Type: Anomaly
   - Cost: 5
   - Text: Deal 2 damage to all entities. Friendly damaged entities gain Frenzy.
   - Role: dramatic swing.

Signature animation:

- Red shockwave, sparks, heat distortion, and metal impact sounds.

## Astral Starter Set

Commander:

- Ilyon, Star-Warden

Cards:

1. Gate Wisp
   - Type: Entity
   - Cost: 1
   - Stats: 1/2
   - Text: Blink when deployed to an adjacent controlled sector.
   - Role: movement tutorial.

2. Starblade Adept
   - Type: Entity
   - Cost: 2
   - Stats: 2/3
   - Text: If this moved this turn, gains +1 attack until end of turn.
   - Role: movement payoff.

3. Timebound Sentinel
   - Type: Entity
   - Cost: 3
   - Stats: 2/5
   - Text: Guardian. When damaged, Forecast 1.
   - Role: control body.

4. Constellation Dragon
   - Type: Entity
   - Cost: 6
   - Stats: 5/6
   - Text: Flying. When deployed through an Astral Gate, freeze adjacent enemies.
   - Role: mythic payoff.

5. Astral Gate
   - Type: World
   - Cost: 2
   - Text: Terraform a sector into Astral World. Friendly entities may Blink between connected Astral Gates.
   - Role: portal terrain.

6. Time Observatory
   - Type: Structure
   - Cost: 3
   - Stats: 0/4
   - Text: Start of turn: Forecast 2. You may move one forecasted card to the bottom.
   - Role: deck control.

7. Phase Mantle
   - Type: Attachment - Relic
   - Cost: 2
   - Text: Attached entity can Blink once per turn after attacking.
   - Role: movement skill.

8. Starlight Reversal
   - Type: Anomaly
   - Cost: 4
   - Text: Return a friendly entity to hand, then deploy it to a controlled sector for 2 less this turn.
   - Role: combo/redeploy.

Signature animation:

- Blue-white portal opens under the card; time rings rotate backward on recall.

## Neutral Alpha Cards

1. Barren Moon
   - Type: World
   - Cost: 1
   - Text: Terraform a sector into Barren World. Draw a card if you control no other worlds.

2. Frontier Harvester
   - Type: Structure
   - Cost: 2
   - Stats: 0/3
   - Text: Start of turn: gain 1 Influence if this is on a center-row sector.

3. Nomad Engineer
   - Type: Entity
   - Cost: 2
   - Stats: 1/3
   - Text: When deployed, repair a structure for 2.

4. Crystalline Warden
   - Type: Entity
   - Cost: 3
   - Stats: 2/5
   - Text: Guardian. Shield 1.

5. Salvage Runner
   - Type: Entity
   - Cost: 2
   - Stats: 2/2
   - Text: When an adjacent structure is destroyed, draw a card.

6. Gravity Mine
   - Type: Structure
   - Cost: 2
   - Stats: 0/2
   - Text: First enemy that enters adjacent sector takes 2 damage and is slowed.

7. Aether Battery
   - Type: Attachment - Relic
   - Cost: 1
   - Text: Attached structure stores 1 unused Resonance at end of turn.

8. Emergency Evacuation
   - Type: Anomaly
   - Cost: 2
   - Text: Move a friendly entity back to your deploy row and heal it 1.

9. Ruin Survey
   - Type: Anomaly
   - Cost: 1
   - Text: Scan two sectors. Draw a card if either contains a world.

10. Orbital Drop
    - Type: Anomaly
    - Cost: 3
    - Text: Deploy a 2/2 neutral Trooper onto any controlled sector.

11. Star Chart
    - Type: Attachment - Skill
    - Cost: 1
    - Text: Attached entity gains Scout.

12. Ancient Seal
    - Type: Attachment - Relic
    - Cost: 2
    - Text: Attached world cannot be corrupted the next time it would be.

## Singularity Chase Cards

These are not required for starter decks. They exist to define the top of the collection fantasy.

Rules:

- Craftable through long-term play.
- Earnable through special campaign/domain paths.
- Never paid-only.
- Limited to one copy in deck.
- Designed around dramatic board moments, not raw efficiency.

1. The Convergence Engine
   - Type: Anomaly
   - Rarity: Singularity
   - Cost: 7
   - Damage School: Astral
   - Text: Choose a controlled world. It copies the sector effect of another revealed world until end of turn. If this creates a connected chain of three different world types, gain 5 Influence.
   - Role: rule-bending combo card.
   - Counterplay: break world control, destroy structures, or deny connected sectors.

2. Worldheart Genesis
   - Type: World
   - Rarity: Singularity
   - Cost: 5
   - World Type: Astral
   - Text: Terraform a neutral center-row sector into Worldheart. At the end of your turn, if you control Worldheart and four different world types, trigger Genesis: gain 10 Influence and evolve your commander cosmetically for the match.
   - Role: alternate objective and board-building payoff.
   - Counterplay: contest the center, corrupt Worldheart, or force the player off one required world type.

## Tutorial Planet

Name:

- Kepler-0, Broken Training Moon

Purpose:

- Teach the 5x5 board without overwhelming the player.

Tutorial sequence:

1. Deploy an entity to the bottom row.
2. Move forward.
3. Attack adjacent enemy.
4. Play a world card.
5. Build a structure on that world.
6. Protect the structure for one turn.
7. Attach armor to a living card.
8. Evolve a unit.
9. Win by conquest.
10. Replay optional objective: win by Influence.

## Campaign Planet Starter Map

1. Helios Verge
   - Theme: Star World
   - Teaches: shields, structures, Influence
   - Boss: Solar Mirror

2. Maw of Vzaal
   - Theme: Organic/Corrupted World
   - Teaches: swarm, corruption, area damage
   - Boss: Lesser Leviathan

3. Lyra's Broken Grid
   - Theme: Machine World
   - Teaches: drones, attachments, connected sectors
   - Boss: Rogue Prime Walker

4. The Mycelial Cradle
   - Theme: Verdant World
   - Teaches: regeneration, terrain spread, spores
   - Boss: Worldroot Avatar

5. Crucible Scar
   - Theme: Volcanic/Crucible World
   - Teaches: self-damage, structure placement, aggressive pressure
   - Boss: Emberheart Titan

6. The Silent Gate
   - Theme: Astral World
   - Teaches: blink, forecast, stasis
   - Boss: Locked Constellation

## Pack Opening Alpha Script

Pack scene:

1. Pack floats in space over a faction-neutral altar.
2. Player presses and holds to charge it.
3. The pack trembles and cracks.
4. Rarity colors leak through seams.
5. Cards fly out face-down into orbit.
6. Player clicks each card to flip.
7. Common cards flip quickly.
8. Rare+ cards pause, glow, and pulse before reveal.
9. Duplicate conversion appears as shards flowing into the player's vault.
10. New cards fly into collection as holograms.

Rarity colors:

- Common: white/silver
- Uncommon: green
- Rare: blue
- Holo: gold
- Mythic: violet
- Singularity: black-white gravitational lens

## Alpha Balance Assumptions

Initial balance targets:

- Cost 1: 1/1 to 2/1 with small upside
- Cost 2: 2/2, 1/3 utility, or 3/2 aggressive
- Cost 3: 3/3, 2/5 defensive, or 4/3 risky
- Cost 4: 4/4 with synergy
- Cost 5: strong defensive or control swing
- Cost 6: faction payoff

Important:

- Board position should be worth roughly one card over time.
- Structures should be strong if protected, bad if played carelessly.
- World cards should pay off through board control, not immediate raw stats.
