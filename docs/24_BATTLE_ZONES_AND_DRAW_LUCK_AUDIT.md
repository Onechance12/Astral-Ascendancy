# Battle Zones and Draw Luck Audit

## Current Read

The 5x5 battle is becoming the right core: board position matters, each unit attacks once per turn, destroyed blockers can leak overflow damage to commander HP, and worlds change the battlefield.

The missing system was battle zones. A serious card game needs every card to have a place:

- Deck: hidden draw pile.
- Hand: available tactical options.
- Field: entities, structures, attachments, and transformed worlds.
- Void: destroyed or spent cards.
- Exile: removed-from-match cards for future high-power effects.
- Reveal/forecast: temporary visible top-deck information.

Without zones, cards feel like buttons. With zones, cards feel like real objects moving through a battle.

## Luck Philosophy

Astral Ascendancy should have draw luck, but not helpless randomness.

The right model is:

- Random shuffled deck creates tension.
- Opening hand creates identity.
- Draw one card per turn.
- World and science cards can manipulate future draws.
- Better players win by building reliable decks, controlling board position, and using forecast/search/discard tools.
- Bad draws should create hard decisions, not instant losses.

This is closer to a tactical card battler than pure chess. Chess-level positioning lives on the 5x5 board. Card-game variance lives in deck order, draw timing, and tech choices.

## Zone Rules for Beta

### Deck

- Minimum beta deck: 20 cards.
- Normal constructed target: 30 cards.
- Draw one card at the start of your turn.
- Hand limit: 7.
- If hand is full, draw is skipped, not burned.
- Empty deck should eventually trigger fatigue/anomaly damage, not instant loss.

### Hand

- Hand is private in PvP.
- PvE enemy hand can be hidden but represented by count.
- Cards should be dragged from hand to legal sectors or targets.
- Playable cards glow based on available Resonance and legal board targets.

### Field

- Entities occupy sectors.
- Structures occupy sectors.
- Attachments attach to entities and die with the host unless a card says otherwise.
- World cards transform sectors and become map state, not normal graveyard cards.
- Future world-card provenance should be stored so effects can care which card created the world.

### Void

- Destroyed entities and structures go to Void.
- Spent Anomalies go to Void after resolving.
- Void should be visible as a count first, then inspectable later.
- Quantum, Voidborn, and Astral cards should care about Void heavily.

### Exile

- Not needed for alpha.
- Reserve for cards that permanently remove something from the match.

### Reveal and Forecast

- Quantum and Astral factions should own this design space.
- Forecast can show the next card.
- Scan can reveal enemy top-deck or hidden world properties.
- Scry-style effects let players reorder or bottom cards.

## Why This Matters

Deck, hand, field, and void create the emotional card-game loop:

1. I need an answer.
2. I draw.
3. The card is playable or not.
4. I commit it to the board.
5. It survives, evolves, dies, or becomes fuel for another effect.

That is where the luck and drama come from.

## Implementation State

Added now:

- Shuffled draw piles in the Pixi battle prototype.
- Random opening hand for the player.
- Enemy draw pile and hand count.
- Visible Deck / Hand / Field / Void counters.
- Destroyed card events now preserve card definition id.
- Destroyed player/enemy cards move into Void counters.
- Spent player Anomalies move into Void.
- Full hand no longer burns the next draw.

Still needed:

- Engine-level zone state instead of scene-level arrays.
- Inspectable graveyard/void overlay.
- Real constructed deck loading from saved decks.
- Mulligan.
- Fatigue or deck-empty rule.
- Effects that interact with Void, forecast, discard, search, and resurrection.
- World provenance so a sector remembers which card transformed it.
