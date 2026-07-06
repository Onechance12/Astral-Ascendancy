# Beta Battle Set 001

This phase moves Astral Ascendancy from "cards with text" toward executable beta cards.

The goal is not to make every card work yet. The goal is to make a smaller battle slice actually playable end-to-end inside `/play`.

## Implemented Battle Actions

The 5x5 engine now supports beta anomaly effects:

- direct commander damage
- targeted sector damage
- enemy board sweeps
- shield buffs
- attack/HP buffs
- commander healing
- resonance gain
- draw-card events
- purify corrupted sectors
- destroy weak enemy entities

The Pixi battle scene now supports:

- selecting anomaly cards from hand
- highlighting legal anomaly targets
- casting no-target anomalies with `CAST CARD`
- drawing from the local beta deck when an effect emits a draw event
- showing card-effect labels on sectors and commanders

## Current Beta Cards With Executable Hooks

Core combat:

- `acolyte`
- `dawnknight`
- `solar-priest`
- `radiance`
- `broodling`
- `spitter`
- `infestor`
- `tyrant`
- `harvester`

Anomalies:

- `smite`: direct commander damage.
- `sunfire-cannon`: targeted unit/structure damage or commander damage.
- `dawnbreak`: destroys low-attack enemy entities and heals commander.
- `swarm-surge`: buffs allied entities.
- `voidpulse`: damages enemy entities.
- `scrap-shield`: shields allied entities.
- `refract`: shields allied entities.
- `surge`: gains resonance and draws.
- `raid`: damages commander and gives a simple resonance steal proxy.
- `solar_writ`: shields an ally and draws on Star world.
- `purity_ray`: damages corrupted-world enemy and purifies on kill.
- `salvage_charter`: draws.
- `verdict_of_helios`: damages enemies on corrupted/contested sectors and purifies.

Board/object cards partially supported:

- world cards terraform sectors
- structures build on controlled non-barren sectors
- attachments modify unit stats and shields

## Still Partial

These are intentionally not fully solved yet:

- advanced keywords like Guardian targeting enforcement
- true temporary buffs that expire at end of turn
- generated tokens
- material/shard economy inside battle
- per-card cooldowns
- full structure passive triggers
- full "when deployed" and "end step" triggered abilities
- server-authoritative match commands
- deck loading from player-owned cards

## Next Gate

The next beta gate should be a real match result pipeline:

1. Match ends.
2. Result records win/loss condition.
3. Cards used gain XP.
4. Player gains shards/resources.
5. Pack progress advances.
6. Daily briefing can reference the result.

That turns `/play` from a local game loop into account progression.
