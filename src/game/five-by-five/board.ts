import type {
  BoardAttachment,
  BoardEntity,
  BoardPosition,
  BoardStructure,
  CommanderState,
  FactionId,
  FiveByFiveMatchState,
  SectorControl,
  SectorId,
  SectorState,
  Side,
  WorldType,
} from "./types";

export const BOARD_ROWS = 5;
export const BOARD_COLS = 5;
export const BOARD_SIZE = BOARD_ROWS * BOARD_COLS;
export const ASCENDANCY_TARGET = 30;

const ROW_PREFIXES = ["E", "F", "C", "P", "D"] as const;

export function indexOf(row: number, col: number): number {
  return row * BOARD_COLS + col;
}

export function rowOf(index: number): number {
  return Math.floor(index / BOARD_COLS);
}

export function colOf(index: number): number {
  return index % BOARD_COLS;
}

export function sectorId(row: number, col: number): SectorId {
  return `${ROW_PREFIXES[row]}${col + 1}` as SectorId;
}

export function parseSectorId(id: SectorId): BoardPosition {
  const row = ROW_PREFIXES.indexOf(id[0] as (typeof ROW_PREFIXES)[number]);
  const col = Number(id.slice(1)) - 1;
  if (row < 0 || col < 0 || col >= BOARD_COLS) {
    throw new Error(`Invalid sector id: ${id}`);
  }
  return { row, col };
}

export function getSector(board: SectorState[], id: SectorId): SectorState {
  const { row, col } = parseSectorId(id);
  return board[indexOf(row, col)];
}

export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

export function orthogonalNeighbors(index: number): number[] {
  const row = rowOf(index);
  const col = colOf(index);
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]
    .filter(([r, c]) => isInsideBoard(r, c))
    .map(([r, c]) => indexOf(r, c));
}

export function manhattanDistance(a: number, b: number): number {
  return Math.abs(rowOf(a) - rowOf(b)) + Math.abs(colOf(a) - colOf(b));
}

export function createEmptyBoard(): SectorState[] {
  return Array.from({ length: BOARD_SIZE }, (_, index) => {
    const row = rowOf(index);
    const col = colOf(index);
    return {
      id: sectorId(row, col),
      index,
      row,
      col,
      control: "neutral",
      world: index === indexOf(2, 2) ? "astral" : "barren",
      statuses: index === indexOf(2, 2) ? ["anomalyCore"] : [],
      entity: null,
      structure: null,
      worldAttachment: null,
    };
  });
}

export function createCommander(side: Side, name: string, faction: FactionId): CommanderState {
  return {
    side,
    name,
    faction,
    hp: 30,
    maxHp: 30,
    resonance: side === "player" ? 1 : 0,
    maxResonance: side === "player" ? 1 : 0,
    influence: 0,
  };
}

export function createFiveByFiveMatch({
  playerName,
  playerFaction,
  enemyName = "Enemy Commander",
  enemyFaction = "voidborn",
}: {
  playerName: string;
  playerFaction: FactionId;
  enemyName?: string;
  enemyFaction?: FactionId;
}): FiveByFiveMatchState {
  return {
    turn: 1,
    active: "player",
    phase: "main",
    board: createEmptyBoard(),
    player: createCommander("player", playerName, playerFaction),
    enemy: createCommander("enemy", enemyName, enemyFaction),
    winner: null,
    winCondition: null,
    log: ["The 5x5 living board comes online."],
  };
}

export function legalDeployIndexes(board: SectorState[], side: Side): number[] {
  return board
    .filter((sector) => {
      if (sector.entity) return false;
      if (side === "player" && sector.row === 4) return true;
      if (side === "enemy" && sector.row === 0) return true;
      if (side === "player" && sector.row === 3 && sector.control === "player") return true;
      if (side === "enemy" && sector.row === 1 && sector.control === "enemy") return true;
      return hasAdjacentDeployBeacon(board, sector.index, side);
    })
    .map((sector) => sector.index);
}

export function canDeployEntity(board: SectorState[], side: Side, targetIndex: number): boolean {
  return legalDeployIndexes(board, side).includes(targetIndex);
}

export function legalWorldIndexes(board: SectorState[], side: Side): number[] {
  return board
    .filter((sector) => {
      if (sector.entity && sector.entity.owner !== side) return false;
      if (sector.structure && sector.structure.owner !== side) return false;
      if (sector.control === "neutral") return true;
      return sector.control === side;
    })
    .map((sector) => sector.index);
}

export function canPlayWorld(board: SectorState[], side: Side, targetIndex: number): boolean {
  return legalWorldIndexes(board, side).includes(targetIndex);
}

export function legalStructureIndexes(board: SectorState[], side: Side): number[] {
  return board
    .filter((sector) => {
      if (sector.structure) return false;
      return sector.control === side && sector.world !== "barren";
    })
    .map((sector) => sector.index);
}

export function canBuildStructure(board: SectorState[], side: Side, targetIndex: number): boolean {
  return legalStructureIndexes(board, side).includes(targetIndex);
}

export function legalMoveIndexes(board: SectorState[], fromIndex: number): number[] {
  const entity = board[fromIndex]?.entity;
  if (!entity || !entity.canMove || entity.exhausted) return [];
  const range = entity.keywords.includes("Scout") ? 2 : 1;
  const ignoresHazards = entity.keywords.includes("Flying") || entity.keywords.includes("Blink");

  return board
    .filter((sector) => {
      if (sector.index === fromIndex || sector.entity) return false;
      if (manhattanDistance(fromIndex, sector.index) > range) return false;
      if (!ignoresHazards && sector.statuses.includes("hazard") && sector.control !== entity.owner) return false;
      return true;
    })
    .map((sector) => sector.index);
}

export function legalAttackIndexes(board: SectorState[], fromIndex: number): number[] {
  const entity = board[fromIndex]?.entity;
  if (!entity || !entity.canAttack || entity.exhausted) return [];
  const reach = entity.keywords.includes("Reach");
  const ranged = entity.keywords.includes("Ranged2");

  return board
    .filter((sector) => {
      const target = sector.entity ?? sector.structure;
      if (!target || target.owner === entity.owner) return false;
      if (ranged) return sameRowOrColumn(fromIndex, sector.index) && manhattanDistance(fromIndex, sector.index) <= 2;
      if (reach) return Math.max(Math.abs(rowOf(fromIndex) - sector.row), Math.abs(colOf(fromIndex) - sector.col)) <= 1;
      return manhattanDistance(fromIndex, sector.index) === 1;
    })
    .map((sector) => sector.index);
}

export function placeEntity(board: SectorState[], entity: BoardEntity, targetIndex: number): SectorState[] {
  if (!canDeployEntity(board, entity.owner, targetIndex)) return board;
  return board.map((sector) =>
    sector.index === targetIndex
      ? { ...sector, entity: { ...entity, exhausted: true, canMove: false, canAttack: entity.keywords.includes("StrikeFirst") } }
      : sector
  );
}

export function terraformSector(
  board: SectorState[],
  side: Side,
  targetIndex: number,
  world: WorldType
): SectorState[] {
  if (!canPlayWorld(board, side, targetIndex)) return board;
  return board.map((sector) =>
    sector.index === targetIndex
      ? {
          ...sector,
          world,
          control: sector.control === "neutral" ? side : sector.control,
          statuses: world === "corrupted" ? uniqueStatuses([...sector.statuses, "corrupted"]) : sector.statuses.filter((s) => s !== "corrupted"),
        }
      : sector
  );
}

export function buildStructure(board: SectorState[], structure: BoardStructure, targetIndex: number): SectorState[] {
  if (!canBuildStructure(board, structure.owner, targetIndex)) return board;
  return board.map((sector) =>
    sector.index === targetIndex
      ? {
          ...sector,
          control: structure.owner,
          structure,
        }
      : sector
  );
}

export function attachToEntity(
  board: SectorState[],
  attachment: BoardAttachment,
  targetIndex: number
): SectorState[] {
  const target = board[targetIndex]?.entity;
  if (!target || target.owner !== attachment.owner) return board;
  const occupiedSlots = new Set(target.attachments.map((item) => item.slot));
  if (attachment.slot !== "Other" && occupiedSlots.has(attachment.slot)) return board;

  return board.map((sector) =>
    sector.index === targetIndex
      ? {
          ...sector,
          entity: {
            ...target,
            attack: target.attack + attachment.attackBonus,
            hp: target.hp + attachment.hpBonus,
            maxHp: target.maxHp + attachment.hpBonus,
            shield: target.shield + attachment.shieldBonus,
            attachments: [...target.attachments, attachment],
          },
        }
      : sector
  );
}

export function moveEntity(board: SectorState[], fromIndex: number, toIndex: number): SectorState[] {
  if (!legalMoveIndexes(board, fromIndex).includes(toIndex)) return board;
  const entity = board[fromIndex].entity;
  if (!entity) return board;
  return board.map((sector) => {
    if (sector.index === fromIndex) return { ...sector, entity: null };
    if (sector.index === toIndex) return { ...sector, entity: { ...entity, canMove: false, exhausted: true } };
    return sector;
  });
}

export function resolveSectorControl(board: SectorState[]): SectorState[] {
  return board.map((sector) => {
    const pressure = controlPressure(board, sector.index);
    const nextControl = pressure.player === pressure.enemy
      ? sector.entity || sector.structure
        ? sector.control
        : "contested"
      : pressure.player > pressure.enemy
        ? "player"
        : "enemy";

    if (pressure.player === 0 && pressure.enemy === 0 && !sector.structure) {
      return { ...sector, control: sector.statuses.includes("anomalyCore") ? "neutral" : sector.control };
    }

    return { ...sector, control: nextControl };
  });
}

export function influenceGainFor(board: SectorState[], side: Side): number {
  return board.reduce((total, sector) => {
    if (sector.control !== side) return total;
    const centerBonus = sector.row === 2 ? 1 : 0;
    const structureBonus = sector.structure?.owner === side ? 1 : 0;
    return total + centerBonus + structureBonus;
  }, 0);
}

export function checkVictory(state: FiveByFiveMatchState): FiveByFiveMatchState {
  if (state.player.hp <= 0) {
    return { ...state, phase: "over", winner: "enemy", winCondition: "conquest" };
  }
  if (state.enemy.hp <= 0) {
    return { ...state, phase: "over", winner: "player", winCondition: "conquest" };
  }
  if (state.player.influence >= ASCENDANCY_TARGET) {
    return { ...state, phase: "over", winner: "player", winCondition: "ascendancy" };
  }
  if (state.enemy.influence >= ASCENDANCY_TARGET) {
    return { ...state, phase: "over", winner: "enemy", winCondition: "ascendancy" };
  }
  return state;
}

function hasAdjacentDeployBeacon(board: SectorState[], index: number, side: Side): boolean {
  return orthogonalNeighbors(index).some((neighborIndex) => {
    const structure = board[neighborIndex].structure;
    return structure?.owner === side && structure.keywords.includes("DeployBeacon");
  });
}

function controlPressure(board: SectorState[], index: number): Record<Side, number> {
  const pressure: Record<Side, number> = { player: 0, enemy: 0 };
  const sector = board[index];
  if (sector.entity) pressure[sector.entity.owner] += 2;
  if (sector.structure) pressure[sector.structure.owner] += 2;

  for (const neighborIndex of orthogonalNeighbors(index)) {
    const neighbor = board[neighborIndex];
    if (neighbor.entity) pressure[neighbor.entity.owner] += 1;
    if (neighbor.structure?.keywords.includes("ProjectControl")) {
      pressure[neighbor.structure.owner] += 1;
    }
  }

  return pressure;
}

function sameRowOrColumn(a: number, b: number): boolean {
  return rowOf(a) === rowOf(b) || colOf(a) === colOf(b);
}

function uniqueStatuses<T extends string>(items: T[]): T[] {
  return [...new Set(items)];
}
