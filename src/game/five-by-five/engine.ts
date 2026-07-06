import type { CardDef } from "@/lib/match-engine";
import {
  buildStructure,
  canAttackCommander,
  checkVictory,
  influenceGainFor,
  attachToEntity,
  legalAttackIndexes,
  legalMoveIndexes,
  moveEntity,
  placeEntity,
  resolveSectorControl,
  terraformSector,
} from "./board";
import {
  applyDamageToEntity,
  applyDamageToStructure,
  calculateEntityAttackDamage,
} from "./combat";
import {
  createBoardAttachment,
  createBoardEntity,
  createBoardStructure,
} from "./content";
import type { FiveByFiveMatchState, Side, WorldType } from "./types";

const TARGETED_ANOMALIES = new Set(["sunfire-cannon", "solar_writ", "purity_ray"]);

export function startTurn(state: FiveByFiveMatchState, side: Side): FiveByFiveMatchState {
  const commander = side === "player" ? state.player : state.enemy;
  const refreshedCommander = {
    ...commander,
    maxResonance: Math.min(10, commander.maxResonance + 1),
    resonance: Math.min(10, commander.maxResonance + 1),
  };

  const board = state.board.map((sector) => {
    if (sector.entity?.owner !== side) return sector;
    return {
      ...sector,
      entity: {
        ...sector.entity,
        canMove: true,
        canAttack: true,
        exhausted: false,
      },
    };
  });

  return {
    ...state,
    active: side,
    phase: "main",
    board,
    player: side === "player" ? refreshedCommander : state.player,
    enemy: side === "enemy" ? refreshedCommander : state.enemy,
    turn: side === "player" ? state.turn + 1 : state.turn,
    log: [...state.log, `${side} starts turn with ${refreshedCommander.resonance} Resonance.`],
    lastEvents: [
      { type: "turn", side, turn: side === "player" ? state.turn + 1 : state.turn },
      { type: "resource", side, resonance: refreshedCommander.resonance },
    ],
  };
}

export function endStep(state: FiveByFiveMatchState): FiveByFiveMatchState {
  const board = resolveSectorControl(state.board);
  const playerInfluence = influenceGainFor(board, "player");
  const enemyInfluence = influenceGainFor(board, "enemy");
  const next = {
    ...state,
    phase: "end" as const,
    board,
    player: { ...state.player, influence: state.player.influence + playerInfluence },
    enemy: { ...state.enemy, influence: state.enemy.influence + enemyInfluence },
    log: [
      ...state.log,
      `Influence pulse: player +${playerInfluence}, enemy +${enemyInfluence}.`,
    ],
    lastEvents: [],
  };
  return checkVictory(next);
}

export function deployEntityCard(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "Entity" || commander.resonance < def.cost) return state;

  const entity = createBoardEntity(def, owner);
  const board = placeEntity(state.board, entity, targetIndex);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} deploys ${def.name} to ${state.board[targetIndex].id}.`],
      lastEvents: [],
    },
    owner,
    def.cost
  );
}

export function playWorldCard(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "World" || commander.resonance < def.cost) return state;

  const world = inferWorldType(def);
  const board = terraformSector(state.board, owner, targetIndex, world);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} terraforms ${state.board[targetIndex].id} into ${world}.`],
      lastEvents: [],
    },
    owner,
    def.cost
  );
}

export function buildStructureCard(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "Structure" || commander.resonance < def.cost) return state;

  const structure = createBoardStructure(def, owner);
  const board = buildStructure(state.board, structure, targetIndex);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} builds ${def.name} on ${state.board[targetIndex].id}.`],
      lastEvents: [],
    },
    owner,
    def.cost
  );
}

export function attachCardToEntity(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "Attachment" || commander.resonance < def.cost) return state;

  const attachment = createBoardAttachment(def, owner);
  const board = attachToEntity(state.board, attachment, targetIndex);
  if (board === state.board) return state;

  return spendResonance(
    {
      ...state,
      board,
      log: [...state.log, `${owner} attaches ${def.name} to ${state.board[targetIndex].id}.`],
      lastEvents: [],
    },
    owner,
    def.cost
  );
}

export function anomalyNeedsTarget(def: CardDef): boolean {
  return TARGETED_ANOMALIES.has(def.defId);
}

export function legalAnomalyIndexes(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side
): number[] {
  if (def.type !== "Anomaly") return [];
  const enemy: Side = owner === "player" ? "enemy" : "player";
  switch (def.defId) {
    case "sunfire-cannon":
      return state.board
        .filter((sector) => {
          const target = sector.entity ?? sector.structure;
          return target?.owner === enemy;
        })
        .map((sector) => sector.index);
    case "solar_writ":
      return state.board.filter((sector) => sector.entity?.owner === owner).map((sector) => sector.index);
    case "purity_ray":
      return state.board
        .filter((sector) => sector.entity?.owner === enemy && sector.world === "corrupted")
        .map((sector) => sector.index);
    default:
      return [];
  }
}

export function playAnomalyCard(
  state: FiveByFiveMatchState,
  def: CardDef,
  owner: Side,
  targetIndex: number | null = null
): FiveByFiveMatchState {
  const commander = owner === "player" ? state.player : state.enemy;
  if (def.type !== "Anomaly" || commander.resonance < def.cost) return state;
  if (anomalyNeedsTarget(def) && (targetIndex === null || !legalAnomalyIndexes(state, def, owner).includes(targetIndex))) {
    return state;
  }

  const spent = spendResonance(state, owner, def.cost);
  const enemy: Side = owner === "player" ? "enemy" : "player";

  switch (def.defId) {
    case "smite":
      return damageCommander(spent, enemy, 3, def.name, true);
    case "raid":
      return gainResonance(damageCommander(spent, enemy, 2, def.name, true), owner, 1, def.name);
    case "sunfire-cannon":
      return targetIndex === null
        ? damageCommander(spent, enemy, 5, def.name, true)
        : damageSector(spent, targetIndex, 4, def.name);
    case "dawnbreak":
      return healCommander(destroyEnemyEntitiesByAttack(spent, owner, 3, def.name), owner, 3, def.name);
    case "swarm-surge":
      return buffEntities(spent, owner, 1, 1, def.name);
    case "voidpulse":
      return damageEnemyEntities(spent, owner, 2, def.name);
    case "scrap-shield":
      return shieldEntities(spent, owner, 1, def.name);
    case "refract":
      return shieldEntities(spent, owner, 2, def.name);
    case "surge": {
      const surged = gainResonance(spent, owner, 2, def.name);
      return {
        ...surged,
        lastEvents: [
          ...surged.lastEvents,
          { type: "draw", side: owner, sourceName: def.name, count: 1 },
          { type: "cardEffect", sourceName: def.name, label: "Draw 1", value: 1, tone: "draw" },
        ],
        log: [...spent.log, `${owner} channels ${def.name}, gains 2 Resonance, and draws a card.`],
      };
    }
    case "solar_writ":
      return targetIndex === null ? spent : solarWrit(spent, owner, targetIndex, def.name);
    case "purity_ray":
      return targetIndex === null ? spent : purityRay(spent, targetIndex, def.name);
    case "salvage_charter":
      return {
        ...spent,
        log: [...spent.log, `${owner} plays ${def.name} and draws a card.`],
        lastEvents: [
          { type: "draw", side: owner, sourceName: def.name, count: 1 },
          { type: "cardEffect", sourceName: def.name, label: "Draw 1", value: 1, tone: "draw" },
        ],
      };
    case "verdict_of_helios":
      return verdictOfHelios(spent, owner, def.name);
    default:
      return {
        ...spent,
        log: [...spent.log, `${owner} plays ${def.name}. Its advanced rule is not beta-ready yet.`],
        lastEvents: [{ type: "cardEffect", sourceName: def.name, label: "Rule pending", tone: "buff" }],
      };
  }
}

export function moveEntityInMatch(
  state: FiveByFiveMatchState,
  fromIndex: number,
  toIndex: number
): FiveByFiveMatchState {
  if (!legalMoveIndexes(state.board, fromIndex).includes(toIndex)) return state;
  const board = moveEntity(state.board, fromIndex, toIndex);
  return {
    ...state,
    board,
    log: [...state.log, `${state.board[fromIndex].entity?.name ?? "Entity"} moves to ${state.board[toIndex].id}.`],
    lastEvents: [],
  };
}

export function attackInMatch(
  state: FiveByFiveMatchState,
  attackerIndex: number,
  targetIndex: number
): FiveByFiveMatchState {
  if (!legalAttackIndexes(state.board, attackerIndex).includes(targetIndex)) return state;
  const attackerSector = state.board[attackerIndex];
  const targetSector = state.board[targetIndex];
  const attacker = attackerSector.entity;
  const target = targetSector.entity ?? targetSector.structure;
  if (!attacker || !target) return state;

  const attackResult = calculateEntityAttackDamage({
    attacker,
    defender: target,
    defenderWorld: targetSector.world,
  });
  const targetHpBefore = target.hp;
  const destroyed = attackResult.hpDamage >= targetHpBefore;
  const overflowDamage = destroyed ? Math.max(0, attackResult.hpDamage - targetHpBefore) : 0;
  const defendingCommanderSide = target.owner;

  const board = state.board.map((sector) => {
    if (sector.index === attackerIndex) {
      return {
        ...sector,
        entity: {
          ...attacker,
          canAttack: false,
          exhausted: true,
        },
      };
    }
    if (sector.index !== targetIndex) return sector;
    if (sector.entity) {
      const damaged = applyDamageToEntity(sector.entity, attackResult);
      return { ...sector, entity: damaged.hp > 0 ? damaged : null };
    }
    if (sector.structure) {
      const damaged = applyDamageToStructure(sector.structure, attackResult);
      return { ...sector, structure: damaged.hp > 0 ? damaged : null };
    }
    return sector;
  });

  const enemy = defendingCommanderSide === "enemy" && overflowDamage > 0
    ? { ...state.enemy, hp: Math.max(0, state.enemy.hp - overflowDamage) }
    : state.enemy;
  const player = defendingCommanderSide === "player" && overflowDamage > 0
    ? { ...state.player, hp: Math.max(0, state.player.hp - overflowDamage) }
    : state.player;
  const events: FiveByFiveMatchState["lastEvents"] = [
    {
      type: "attack",
      attackerIndex,
      targetIndex,
      attackerName: attacker.name,
      targetName: target.name,
      damage: attackResult.hpDamage,
      shieldDamage: attackResult.shieldDamage,
      overflowDamage,
      destroyed,
    },
  ];

  if (destroyed) {
    events.push({ type: "destroyed", sectorIndex: targetIndex, name: target.name, owner: target.owner });
  }
  if (overflowDamage > 0) {
    events.push({
      type: "commanderDamage",
      commander: defendingCommanderSide,
      sourceIndex: attackerIndex,
      sourceName: attacker.name,
      damage: overflowDamage,
      direct: false,
    });
  }

  const next = {
    ...state,
    board,
    player,
    enemy,
    log: [
      ...state.log,
      `${attacker.name} hits ${target.name} for ${attackResult.hpDamage} damage.${destroyed ? " Target destroyed." : ""}${overflowDamage > 0 ? ` ${overflowDamage} overflow hits commander.` : ""}`,
    ],
    lastEvents: events,
  };
  return checkVictory(next);
}

export function attackCommanderInMatch(
  state: FiveByFiveMatchState,
  attackerIndex: number
): FiveByFiveMatchState {
  if (!canAttackCommander(state.board, attackerIndex)) return state;
  const attackerSector = state.board[attackerIndex];
  const attacker = attackerSector.entity;
  if (!attacker) return state;

  const defendingSide: Side = attacker.owner === "player" ? "enemy" : "player";
  const damage = attacker.attack;
  const player = defendingSide === "player"
    ? { ...state.player, hp: Math.max(0, state.player.hp - damage) }
    : state.player;
  const enemy = defendingSide === "enemy"
    ? { ...state.enemy, hp: Math.max(0, state.enemy.hp - damage) }
    : state.enemy;
  const board = state.board.map((sector) =>
    sector.index === attackerIndex
      ? {
          ...sector,
          entity: {
            ...attacker,
            canAttack: false,
            exhausted: true,
          },
        }
      : sector
  );

  return checkVictory({
    ...state,
    board,
    player,
    enemy,
    log: [...state.log, `${attacker.name} strikes the ${defendingSide} commander for ${damage}.`],
    lastEvents: [{
      type: "commanderDamage",
      commander: defendingSide,
      sourceIndex: attackerIndex,
      sourceName: attacker.name,
      damage,
      direct: true,
    }],
  });
}

function spendResonance(
  state: FiveByFiveMatchState,
  side: Side,
  amount: number
): FiveByFiveMatchState {
  if (side === "player") {
    return {
      ...state,
      player: { ...state.player, resonance: state.player.resonance - amount },
    };
  }
  return {
    ...state,
    enemy: { ...state.enemy, resonance: state.enemy.resonance - amount },
  };
}

function damageSector(
  state: FiveByFiveMatchState,
  targetIndex: number,
  amount: number,
  sourceName: string
): FiveByFiveMatchState {
  const targetSector = state.board[targetIndex];
  const target = targetSector.entity ?? targetSector.structure;
  if (!target) return state;
  let destroyed = false;

  const board = state.board.map((sector) => {
    if (sector.index !== targetIndex) return sector;
    if (sector.entity) {
      const shieldDamage = Math.min(sector.entity.shield, amount);
      const hpDamage = Math.max(0, amount - shieldDamage);
      const entity = {
        ...sector.entity,
        shield: Math.max(0, sector.entity.shield - shieldDamage),
        hp: Math.max(0, sector.entity.hp - hpDamage),
      };
      destroyed = entity.hp <= 0;
      return { ...sector, entity: entity.hp > 0 ? entity : null };
    }
    if (sector.structure) {
      const structure = { ...sector.structure, hp: Math.max(0, sector.structure.hp - amount) };
      destroyed = structure.hp <= 0;
      return { ...sector, structure: structure.hp > 0 ? structure : null };
    }
    return sector;
  });

  return checkVictory({
    ...state,
    board,
    log: [...state.log, `${sourceName} deals ${amount} damage to ${target.name}.${destroyed ? " Target destroyed." : ""}`],
    lastEvents: [
      { type: "cardEffect", sourceName, label: `-${amount}`, targetIndex, value: amount, tone: "damage" },
      ...(destroyed ? [{ type: "destroyed" as const, sectorIndex: targetIndex, name: target.name, owner: target.owner }] : []),
    ],
  });
}

function damageCommander(
  state: FiveByFiveMatchState,
  side: Side,
  amount: number,
  sourceName: string,
  direct: boolean
): FiveByFiveMatchState {
  const player = side === "player" ? { ...state.player, hp: Math.max(0, state.player.hp - amount) } : state.player;
  const enemy = side === "enemy" ? { ...state.enemy, hp: Math.max(0, state.enemy.hp - amount) } : state.enemy;

  return checkVictory({
    ...state,
    player,
    enemy,
    log: [...state.log, `${sourceName} hits the ${side} commander for ${amount}.`],
    lastEvents: [
      { type: "commanderDamage", commander: side, sourceIndex: -1, sourceName, damage: amount, direct },
      { type: "cardEffect", sourceName, label: `Commander -${amount}`, commander: side, value: amount, tone: "damage" },
    ],
  });
}

function healCommander(
  state: FiveByFiveMatchState,
  side: Side,
  amount: number,
  sourceName: string
): FiveByFiveMatchState {
  const player = side === "player" ? { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + amount) } : state.player;
  const enemy = side === "enemy" ? { ...state.enemy, hp: Math.min(state.enemy.maxHp, state.enemy.hp + amount) } : state.enemy;
  return {
    ...state,
    player,
    enemy,
    log: [...state.log, `${sourceName} heals ${side} commander for ${amount}.`],
    lastEvents: [
      ...state.lastEvents,
      { type: "cardEffect", sourceName, label: `Heal +${amount}`, commander: side, value: amount, tone: "heal" },
    ],
  };
}

function gainResonance(
  state: FiveByFiveMatchState,
  side: Side,
  amount: number,
  sourceName: string
): FiveByFiveMatchState {
  const commander = side === "player" ? state.player : state.enemy;
  const updated = { ...commander, resonance: Math.min(10, commander.resonance + amount) };
  return {
    ...state,
    player: side === "player" ? updated : state.player,
    enemy: side === "enemy" ? updated : state.enemy,
    log: [...state.log, `${sourceName} grants ${amount} Resonance to ${side}.`],
    lastEvents: [
      ...state.lastEvents,
      { type: "resource", side, resonance: updated.resonance },
      { type: "cardEffect", sourceName, label: `+${amount} Resonance`, value: amount, tone: "buff" },
    ],
  };
}

function shieldEntities(
  state: FiveByFiveMatchState,
  side: Side,
  amount: number,
  sourceName: string
): FiveByFiveMatchState {
  const events: FiveByFiveMatchState["lastEvents"] = [];
  const board = state.board.map((sector) => {
    if (sector.entity?.owner !== side) return sector;
    events.push({ type: "cardEffect", sourceName, label: `Shield +${amount}`, targetIndex: sector.index, value: amount, tone: "shield" });
    return { ...sector, entity: { ...sector.entity, shield: sector.entity.shield + amount } };
  });
  return {
    ...state,
    board,
    log: [...state.log, `${sourceName} gives allied entities Shield ${amount}.`],
    lastEvents: events,
  };
}

function buffEntities(
  state: FiveByFiveMatchState,
  side: Side,
  attackBonus: number,
  hpBonus: number,
  sourceName: string
): FiveByFiveMatchState {
  const events: FiveByFiveMatchState["lastEvents"] = [];
  const board = state.board.map((sector) => {
    if (sector.entity?.owner !== side) return sector;
    events.push({ type: "cardEffect", sourceName, label: `+${attackBonus}/+${hpBonus}`, targetIndex: sector.index, tone: "buff" });
    return {
      ...sector,
      entity: {
        ...sector.entity,
        attack: sector.entity.attack + attackBonus,
        hp: sector.entity.hp + hpBonus,
        maxHp: sector.entity.maxHp + hpBonus,
      },
    };
  });
  return {
    ...state,
    board,
    log: [...state.log, `${sourceName} gives allied entities +${attackBonus}/+${hpBonus}.`],
    lastEvents: events,
  };
}

function damageEnemyEntities(
  state: FiveByFiveMatchState,
  owner: Side,
  amount: number,
  sourceName: string
): FiveByFiveMatchState {
  const enemy: Side = owner === "player" ? "enemy" : "player";
  let next = state;
  const events: FiveByFiveMatchState["lastEvents"] = [];
  for (const sector of state.board) {
    if (sector.entity?.owner === enemy) {
      next = damageSector(next, sector.index, amount, sourceName);
      events.push(...next.lastEvents);
    }
  }
  return { ...next, lastEvents: events };
}

function destroyEnemyEntitiesByAttack(
  state: FiveByFiveMatchState,
  owner: Side,
  maxAttack: number,
  sourceName: string
): FiveByFiveMatchState {
  const enemy: Side = owner === "player" ? "enemy" : "player";
  const destroyed: FiveByFiveMatchState["lastEvents"] = [];
  const board = state.board.map((sector) => {
    if (sector.entity?.owner === enemy && sector.entity.attack <= maxAttack) {
      destroyed.push({ type: "destroyed", sectorIndex: sector.index, name: sector.entity.name, owner: sector.entity.owner });
      destroyed.push({ type: "cardEffect", sourceName, label: "Purged", targetIndex: sector.index, tone: "damage" });
      return { ...sector, entity: null };
    }
    return sector;
  });
  return {
    ...state,
    board,
    log: [...state.log, `${sourceName} destroys ${destroyed.filter((event) => event.type === "destroyed").length} enemy entities.`],
    lastEvents: destroyed,
  };
}

function solarWrit(
  state: FiveByFiveMatchState,
  owner: Side,
  targetIndex: number,
  sourceName: string
): FiveByFiveMatchState {
  const sector = state.board[targetIndex];
  if (!sector.entity || sector.entity.owner !== owner) return state;
  const board = state.board.map((item) =>
    item.index === targetIndex && item.entity
      ? { ...item, entity: { ...item.entity, shield: item.entity.shield + 1 } }
      : item
  );
  const draw = sector.world === "star";
  return {
    ...state,
    board,
    log: [...state.log, `${sourceName} gives ${sector.entity.name} Shield 1.${draw ? " Star world draw triggers." : ""}`],
    lastEvents: [
      { type: "cardEffect", sourceName, label: "Shield +1", targetIndex, value: 1, tone: "shield" },
      ...(draw ? [{ type: "draw" as const, side: owner, sourceName, count: 1 }, { type: "cardEffect" as const, sourceName, label: "Draw 1", value: 1, tone: "draw" as const }] : []),
    ],
  };
}

function purityRay(
  state: FiveByFiveMatchState,
  targetIndex: number,
  sourceName: string
): FiveByFiveMatchState {
  const damaged = damageSector(state, targetIndex, 3, sourceName);
  const targetCleared = !damaged.board[targetIndex].entity;
  if (!targetCleared) return damaged;
  return {
    ...damaged,
    board: damaged.board.map((sector) =>
      sector.index === targetIndex
        ? { ...sector, world: "barren", statuses: sector.statuses.filter((status) => status !== "corrupted") }
        : sector
    ),
    log: [...damaged.log, `${sourceName} purifies ${damaged.board[targetIndex].id}.`],
    lastEvents: [
      ...damaged.lastEvents,
      { type: "cardEffect", sourceName, label: "Purified", targetIndex, tone: "world" },
    ],
  };
}

function verdictOfHelios(
  state: FiveByFiveMatchState,
  owner: Side,
  sourceName: string
): FiveByFiveMatchState {
  const enemy: Side = owner === "player" ? "enemy" : "player";
  let next = state;
  const events: FiveByFiveMatchState["lastEvents"] = [];
  const targets = state.board.filter((sector) =>
    sector.entity?.owner === enemy && (sector.world === "corrupted" || sector.control === "contested")
  );
  for (const sector of targets) {
    next = damageSector(next, sector.index, 2, sourceName);
    events.push(...next.lastEvents);
  }
  return {
    ...next,
    board: next.board.map((sector) =>
      targets.some((target) => target.index === sector.index)
        ? { ...sector, statuses: sector.statuses.filter((status) => status !== "corrupted"), world: sector.world === "corrupted" ? "barren" : sector.world }
        : sector
    ),
    lastEvents: events,
    log: [...next.log, `${sourceName} judges ${targets.length} corrupted or contested enemies.`],
  };
}

function inferWorldType(def: CardDef): WorldType {
  const text = `${def.name} ${def.text}`.toLowerCase();
  if (text.includes("star")) return "star";
  if (text.includes("organic")) return "organic";
  if (text.includes("machine")) return "machine";
  if (text.includes("verdant")) return "verdant";
  if (text.includes("crucible")) return "crucible";
  if (text.includes("astral")) return "astral";
  if (text.includes("mineral")) return "mineral";
  if (text.includes("gas")) return "gas";
  if (text.includes("corrupted")) return "corrupted";
  return "barren";
}
