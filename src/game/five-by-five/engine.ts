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
