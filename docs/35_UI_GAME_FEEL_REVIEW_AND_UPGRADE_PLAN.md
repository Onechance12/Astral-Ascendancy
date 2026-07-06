# Astral Ascendancy UI Game-Feel Review and Upgrade Plan

Date: 2026-07-06

## Verdict

Astral Ascendancy has the right systems foundation now: 5x5 battle rules, living cards, deck draw, recovery, world operations, headquarters, structures, petitions, progression rewards, packs, and a PixiJS game-client layer.

The UI is not yet matching the ambition. Too many important systems are still displayed as React panels, grids, tabs, and readable cards. That makes the game feel like a good prototype dashboard instead of a premium browser game client.

The next UI direction is clear:

- `/play` becomes the primary player experience.
- PixiJS owns the main game scenes.
- React becomes overlay UI for modals, account, debug, settings, and exact data controls.
- Every major system becomes a place, not a page.

## Current UI Surface Audit

### Landing / Entry

What exists:
- Strong branded landing page with cosmic styling.
- Explains factions, board combat, cards, and game vision.
- Login/registration flow leads into the app.

Gap:
- The player still enters a normal web app flow after login.
- The main call-to-action does not fully feel like launching a game client.

Needed:
- Make `Play` route the main path.
- Add a launch transition: command signal lock, screen darken, stars accelerate, client boot.
- After login, route the player toward `/play` instead of a dashboard-style hub.

### Game Hub

What exists:
- Commander info, daily briefing, petitions, assignments, deck licenses, quests, shortcuts.
- Useful systems and good strategic information.

Gap:
- It is visually a stacked command dashboard.
- The nav grid feels like app navigation instead of game-space navigation.

Needed:
- Convert hub into a command bridge scene.
- Navigation should be physical interactable stations:
  - Battle Gate
  - Galaxy Map
  - Pack Chamber
  - Holographic Vault
  - Homeworld Command
  - World Operations Console
  - PvP War Room
  - Commander Profile Bridge
- Daily briefing should appear as a commander transmission, not a card.
- Petitions should be animated incoming requests from living cards, structures, and planets.

### Battle

What exists:
- Legacy React battle is still a 3-lane/3x3 style surface.
- PixiJS battle scene already has a stronger 5x5 battle prototype.
- Pixi battle includes deck draw, hand, field, recovery pile, one-attack-per-unit rules, overflow commander damage, world tiles, structures, attachments, and effects.

Gap:
- The older React battle still defines the app experience in the main flow.
- Cards on the field still do not feel alive enough.
- Attacks need more weight: impact, shake, sparks, beams, damage numbers, death animation, overflow hit to commander.

Needed:
- Promote the Pixi 5x5 battle scene to the main `Play vs AI` route.
- Retire or hide the legacy React 3-lane battle from normal player flow.
- Add animated card bodies on sectors:
  - idle breathing/glow
  - faction aura
  - health damage flash
  - exhausted/spent visual state
  - armor/shield overlays
  - injury warning
  - death dissolve into recovery
- Add stronger board communication:
  - deck, hand, field, recovery counters as physical zones
  - terrain/world cards visibly repaint sectors
  - structures become board objects, not just labels
  - attack line must read instantly on mobile

### Campaign

What exists:
- Campaign chapters grouped by faction.
- Rewards and progress are readable.

Gap:
- It is a list. The vision is a galaxy war map.

Needed:
- Replace the primary campaign view with a galaxy map.
- Planets are campaign nodes.
- Locked planets pulse.
- Completed planets glow.
- Boss planets distort space.
- Faction territory appears as colored nebula borders.
- Clicking a planet opens a mission panel overlay, not a new flat page.

### Domain / Worlds

What exists:
- Resources, planets, operations, structures, world cards, active developments.
- Timed operations and card availability rules are real.

Gap:
- This system has huge game potential but currently reads like tabs and cards.
- Planets do not feel like owned places.

Needed:
- Convert domain into a planetary command scene.
- Player sees orbiting owned worlds.
- Selecting a world zooms into its surface/colony layer.
- Structures appear as buildable objects on the world.
- Assigned cards should be visible as workers, scientists, warriors, scouts, or stationed units.
- Harvest should feel like collecting from reactors/mines/labs, not pressing a resource button.

### Headquarters / Homeworld

What exists:
- Facilities, doctrine, resource summary, care queues, training, medical, living asset readout.

Gap:
- HQ is the heart of the game, but it currently feels like management panels.

Needed:
- Build a homeworld/capital base scene.
- Facilities become visible buildings:
  - Command Spire
  - Infirmary
  - Training Grounds
  - Research Lab
  - Engineering Bay
  - Hangar
  - Shield Grid
- Upgrading should animate the facility, not just update a level number.
- Injured cards should appear in medical pods.
- Training cards should appear in drills.
- Doctrine should feel like setting civilization policy at a command table.

### Structures as Card Containers

What exists:
- Structures can hold/station card copies.
- Occupancy and integrity exist.

Gap:
- This is one of the most unique game ideas, but it is visually understated.

Needed:
- Structure interiors should become small scene panels.
- Stationed cards appear inside the building.
- Empty slots should look like physical bays, labs, barracks, pods, consoles, or docks.
- Integrity should be a visible building condition.
- Structure effects should project to world production, battle readiness, recovery speed, research speed, or defense.

### Collection

What exists:
- Owned/all filter, faction filter, card counts, craft/dismantle.

Gap:
- It feels like a card database.

Needed:
- Convert to a holographic vault.
- Keep grid for utility, but add:
  - large inspected card stage
  - rarity shelf lighting
  - faction wings
  - card state: available, assigned, injured, recovering, training, stationed, in deck
  - living-card history: battles survived, injuries, upgrades, armor, skills
- Cards should be inspectable objects, not just inventory tiles.

### Deck Builder

What exists:
- Saved decks, selected cards, available cards, deck metadata.

Gap:
- It is functional but not yet a battle loadout bay.
- It appears to rely heavily on playable definitions, so the UI must be audited for owned-copy enforcement before beta.

Needed:
- Convert to a war table / armory.
- Deck slots are physical loadout racks.
- Tier unlocks are achievements.
- Power score, legal rank tier, and illegal-card warnings should be prominent.
- Add test draw, curve, role balance, terrain/world balance, and card availability conflicts.
- Deck slots must clearly show whether a card copy is away, recovering, training, stationed, or locked.

### Pack Opening

What exists:
- Pixi pack chamber and React pack opener both exist.
- Basic charge, burst, rarity, reveal flow exists.

Gap:
- This needs to be one of the most exciting parts of the app.

Needed:
- One canonical Pixi pack chamber.
- Hold-to-open or drag-to-tear interaction.
- Pack floats in a containment field.
- On breach: screen shake, zoom out, particles, fragments, rarity beam.
- Reveal cards one-by-one with flip, glow, audio hook, and haptic hook.
- Mythic/Singularity reveal should feel completely different from common reveal.

### PvP

What exists:
- Ranked/unranked/friendly/event queue UI.
- Deck power, tier caps, PvP queue API scaffold, friends/tribes server hooks.

Gap:
- PvP still feels like a queue form.

Needed:
- Convert PvP into a war room.
- Ranked ladder should be a visible tower/star path.
- Queue entry should look like locking a battle deck into a gate.
- Friends and tribes need social spaces:
  - ally list
  - direct duel challenge
  - tribe hall
  - faction war board
  - recent opponents

### Profile

What exists:
- Commander stats and match history.

Gap:
- It feels like an account/profile page.

Needed:
- Convert profile into commander bridge.
- Show commander portrait/silhouette, rank banner, titles, faction allegiance, achievements, battle scars, favorite card, current active world.
- Match history becomes battle records or mission logs.

## Cross-Cutting Missing Pieces

### 1. One Primary Game Shell

The app needs one canonical fullscreen game shell:

- `GameShell`
- Pixi canvas underneath
- React overlays above
- global HUD
- scene transitions
- sound manager
- settings modal
- debug/dev panel

The current split between `/` React app and `/play` Pixi client should be resolved by making `/play` the main in-game experience.

### 2. Scene Transition Language

Every move between systems should feel physical:

- bridge to battle: jump gate opens
- battle to result: explosion/fade into report
- bridge to packs: chamber door opens
- bridge to galaxy: star map expands
- galaxy to mission: planet zoom
- homeworld to facility: camera pan/zoom

### 3. Audio and Haptics Hooks

Even before final audio assets, every major interaction should emit a named sound event:

- `ui.hover`
- `ui.confirm`
- `card.pickup`
- `card.deploy`
- `card.invalid`
- `battle.attack`
- `battle.shield`
- `battle.destroy`
- `pack.charge`
- `pack.burst`
- `pack.rarity.mythic`
- `reward.countup`

### 4. Faction Visual Identity

Every screen should inherit faction identity:

- Solari: gold, plasma, star shields
- Voidborn: purple/black, distortion, gravity
- Synthari: cyan, grids, drones
- Verdant: green, spores, living armor
- Crimson: red, volcanic, blood-metal
- Astral: blue/white, portals, constellations

This should change backgrounds, particles, button glow, card aura, commander frame, and battle effects.

### 5. Mobile First Without Looking Small

The current app works on mobile, but several views compress into dense panels.

Needed:
- Large touch targets.
- Bottom radial/command dock.
- One primary action per scene.
- Inspect panels slide up from bottom.
- Text reduced in combat; icons and motion carry more meaning.

## Priority Execution Plan

### UI Phase 1: Promote the Game Client

Goal: clicking Play feels like launching Astral Ascendancy, not opening another page.

Tasks:
- Make `/play` the primary in-game route after login.
- Add a real game shell around the Pixi client.
- Add global scene HUD: commander, resources, sound/settings, exit.
- Replace the current minimal overlay text with proper in-world HUD.
- Add bridge/main menu scene as the player’s default command center.
- Add React overlay portals for collection, account, debug, and settings.

Success criteria:
- A new player clicks Play and lands inside a fullscreen game client with moving background, command stations, audio toggle, and obvious game actions.

### UI Phase 2: Battle Becomes the Main Prototype

Goal: the main battle flow uses the 5x5 Pixi scene.

Tasks:
- Route `Play vs AI` to Pixi `BattleScene`.
- Hide legacy 3-lane React battle from primary player path.
- Improve board readability on mobile.
- Add living card idle animation.
- Add attack motion, impact shake, damage popups, death dissolve, commander overflow hit.
- Add visible deck, hand, field, recovery zones.
- Add end-turn and direct-strike feedback.

Success criteria:
- The battle now teaches itself visually: card draw, deploy, move, attack, one attack per unit, death to recovery, overflow damage to commander.

### UI Phase 3: Galaxy Campaign Map

Goal: campaign stops being a list.

Tasks:
- Build galaxy map scene with campaign planets.
- Add planet node states: locked, available, completed, boss, faction base.
- Add mission overlay on planet click.
- Connect mission launch to battle scene.
- Show rewards as orbiting holograms around the planet.

Success criteria:
- Campaign feels like conquering a galaxy.

### UI Phase 4: Homeworld and Domain Scenes

Goal: world-building feels alive.

Tasks:
- Build homeworld scene with visible facilities.
- Build domain/orbit scene with owned planets.
- Selecting a planet opens surface colony view.
- Structures become placeable/visible world objects.
- Stationed cards appear inside structures.
- Resource harvest animates from building to resource bar.

Success criteria:
- The player understands they own a growing civilization, not a resource spreadsheet.

### UI Phase 5: Collection Vault and Deck Armory

Goal: cards feel like living assets.

Tasks:
- Convert collection into holographic vault.
- Add large inspected card presentation.
- Show card location and state directly on cards.
- Convert deck builder into armory/war table.
- Enforce owned-copy and unavailable-copy rules clearly.
- Add deck tier/rank unlock presentation.
- Add test draw and deck power summary.

Success criteria:
- Building decks feels like preparing a squad, not editing a list.

### UI Phase 6: Pack Chamber and Rewards

Goal: pack opening and results become dopamine moments.

Tasks:
- Promote Pixi pack chamber as canonical.
- Add hold/open/tear interaction.
- Add rarity-specific reveal effects.
- Add result scene reward countups.
- Add card XP, shards, pack progress, injury/recovery routing in result presentation.

Success criteria:
- Opening packs and winning battles feel worth showing someone.

### UI Phase 7: Social War Room

Goal: PvP, friends, and tribes feel like a multiplayer game.

Tasks:
- Convert PvP queue to war room.
- Add ranked tower/ladder visual.
- Add deck lock-in animation.
- Add friends list and direct challenge surface.
- Add tribe hall shell.
- Add recent opponents and rematch hooks.

Success criteria:
- PvP feels like entering a war, not submitting a form.

## Immediate Next Build Recommendation

Do UI Phase 1 first.

Reason:
- The Pixi game client already exists.
- The 5x5 battle scene already exists.
- The highest-impact change is making the correct experience the front door.
- Once `/play` becomes the real client shell, every later system can plug into that structure.

Recommended first implementation slice:

1. Build `GameShell` around `AstralGameClientView`.
2. Improve `MainMenuScene` into `CommandBridgeScene`.
3. Add bridge stations for Battle, Galaxy, Packs, Collection, Homeworld, Domain, PvP.
4. Add event bus messages for opening React overlays from Pixi.
5. Route logged-in `Play` CTA directly to `/play`.
6. Make `Battle` station launch the existing 5x5 Pixi battle.
7. Keep old React screens available from hub/dev paths during transition.

## Hard Rule Going Forward

Never add a plain management panel when the feature can be represented as a game object.

Examples:

- Campaign list becomes galaxy map.
- Quest list becomes mission console.
- Resource table becomes reactors/mines/labs.
- Deck list becomes armory racks.
- Profile becomes commander bridge.
- Collection grid becomes holographic vault.
- Medical queue becomes infirmary pods.
- Training queue becomes drill grounds.
- Pack button becomes pack chamber.
- World cards become planets, buildings, and citizens.

