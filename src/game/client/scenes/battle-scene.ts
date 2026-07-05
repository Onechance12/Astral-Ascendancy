import { Container, Graphics, Text } from "pixi.js";
import { CARD_DEFS, type CardDef } from "@/lib/match-engine";
import {
  attackInMatch,
  attackCommanderInMatch,
  canAttackCommander,
  createBoardEntity,
  createFiveByFiveMatch,
  deployEntityCard,
  endStep,
  indexOf,
  legalAttackIndexes,
  legalDeployIndexes,
  legalMoveIndexes,
  legalStructureIndexes,
  legalWorldIndexes,
  moveEntityInMatch,
  playWorldCard,
  buildStructureCard,
  attachCardToEntity,
  startTurn,
  type FiveByFiveMatchState,
  type SectorState,
} from "@/game/five-by-five";
import { BaseScene } from "./base-scene";
import { COLORS, label, makeButton, roundedPanel } from "../pixi-ui";

const STARTING_HAND = [
  "sector_surveyor",
  "carrion_bloom",
  "concord_arbiter",
  "helios_reactor",
  "hardlight_exoshell",
];

const WORLD_COLOR: Record<string, number> = {
  barren: 0x64748b,
  astral: 0x93c5fd,
  organic: 0x34d399,
  star: 0xfbbf24,
  machine: 0x22d3ee,
  verdant: 0x4ade80,
  crucible: 0xfb7185,
  corrupted: 0xd946ef,
  mineral: 0xa78bfa,
  gas: 0x38bdf8,
};

function getCard(defId: string): CardDef {
  const def = CARD_DEFS.find((card) => card.defId === defId);
  if (!def) throw new Error(`Missing card definition: ${defId}`);
  return def;
}

function createInitialBattleState(): FiveByFiveMatchState {
  const initial = createFiveByFiveMatch({
    playerName: "Ascendant",
    playerFaction: "solari",
    enemyName: "Brood Tyrant Vzaal",
    enemyFaction: "voidborn",
  });
  const enemy = createBoardEntity(getCard("broodling"), "enemy");
  const board = initial.board;
  board[indexOf(0, 2)] = {
    ...board[indexOf(0, 2)],
    entity: enemy,
    control: "enemy",
  };
  return {
    ...initial,
    board,
    player: { ...initial.player, resonance: 6, maxResonance: 6 },
    enemy: { ...initial.enemy, resonance: 4, maxResonance: 4 },
    log: ["Pixi battle scene online.", "Tap a card, then tap a legal sector."],
  };
}

export class BattleScene extends BaseScene {
  private match = createInitialBattleState();
  private hand = [...STARTING_HAND];
  private selectedCardId: string | null = null;
  private selectedActor: number | null = null;
  private bgLayer = new Container();
  private boardLayer = new Container();
  private hudLayer = new Container();
  private handLayer = new Container();
  private fxLayer = new Container();
  private lastWidth = 0;
  private lastHeight = 0;
  private time = 0;

  enter(): void {
    this.container.addChild(this.bgLayer, this.boardLayer, this.hudLayer, this.handLayer, this.fxLayer);
    this.redraw();
  }

  update(deltaMS: number): void {
    this.time += deltaMS * 0.001;
    if (this.lastWidth !== this.app.screen.width || this.lastHeight !== this.app.screen.height) this.redraw();
    this.bgLayer.children.forEach((child, index) => {
      if (index === 0) return;
      child.alpha = 0.55 + Math.sin(this.time * 2 + index) * 0.18;
      child.rotation += deltaMS * 0.00012;
    });
  }

  private redraw() {
    this.lastWidth = this.app.screen.width;
    this.lastHeight = this.app.screen.height;
    this.clearLayer(this.bgLayer);
    this.clearLayer(this.boardLayer);
    this.clearLayer(this.hudLayer);
    this.clearLayer(this.handLayer);
    this.clearLayer(this.fxLayer);
    this.drawBackground();
    this.drawHud();
    this.drawBoard();
    this.drawBattleEvents();
    this.drawHand();
  }

  private drawBackground() {
    const { width, height } = this.app.screen;
    const bg = new Graphics()
      .rect(0, 0, width, height)
      .fill({ color: COLORS.bg, alpha: 1 })
      .circle(width * 0.5, height * 0.44, Math.min(width, height) * 0.42)
      .fill({ color: COLORS.cyan, alpha: 0.07 })
      .circle(width * 0.66, height * 0.24, Math.min(width, height) * 0.21)
      .fill({ color: COLORS.fuchsia, alpha: 0.055 });
    this.bgLayer.addChild(bg);

    for (let index = 0; index < 80; index++) {
      const dot = new Graphics()
        .circle(0, 0, index % 9 === 0 ? 1.8 : 1)
        .fill({ color: COLORS.white, alpha: 0.34 + (index % 4) * 0.08 });
      dot.position.set((index * 127) % width, (index * 71) % height);
      this.bgLayer.addChild(dot);
    }
  }

  private drawHud() {
    const { width, height } = this.app.screen;
    const top = this.commanderHud(this.match.enemy.name, this.match.enemy.hp, this.match.enemy.maxHp, this.match.enemy.influence, "enemy");
    top.position.set(18, 78);
    const player = this.commanderHud(
      this.match.player.name,
      this.match.player.hp,
      this.match.player.maxHp,
      this.match.player.influence,
      "player",
      this.match.player.resonance
    );
    player.position.set(18, height - 166);
    const reset = makeButton("RESET", 94, COLORS.gold, () => {
      this.match = createInitialBattleState();
      this.hand = [...STARTING_HAND];
      this.selectedActor = null;
      this.selectedCardId = null;
      this.redraw();
    });
    reset.position.set(width - 226, 78);
    const menu = makeButton("MENU", 94, COLORS.cyan, () => this.switchScene("mainMenu"));
    menu.position.set(width - 118, 78);
    const pulse = makeButton("PULSE TURN", Math.min(170, width * 0.28), COLORS.emerald, () => this.pulseTurn());
    pulse.position.set(width - pulse.width - 18, height - 152);
    const selectedCanStrikeCommander = this.selectedActor !== null && canAttackCommander(this.match.board, this.selectedActor);
    const direct = makeButton("STRIKE COMMANDER", Math.min(210, width * 0.38), COLORS.rose, () => this.attackCommander());
    direct.position.set(width - direct.width - 18, height - 208);
    direct.alpha = selectedCanStrikeCommander ? 1 : 0.34;
    direct.eventMode = selectedCanStrikeCommander ? "static" : "none";

    const logPanel = roundedPanel(Math.min(300, width - 36), 92, 0x030712, 0.72, COLORS.cyan);
    logPanel.position.set(width - logPanel.width - 18, 138);
    const logTitle = label("BATTLE LOG", 9, COLORS.cyan, "900");
    logTitle.position.set(logPanel.x + 12, logPanel.y + 10);
    this.hudLayer.addChild(top, player, reset, menu, pulse, direct, logPanel, logTitle);
    this.match.log.slice(-4).forEach((entry, index) => {
      const row = label(entry, 10, COLORS.slate, "bold");
      row.position.set(logPanel.x + 12, logPanel.y + 28 + index * 15);
      this.hudLayer.addChild(row);
    });
  }

  private drawBoard() {
    const { width, height } = this.app.screen;
    const boardSize = Math.min(width - 26, height - 260, 760);
    const cellGap = Math.max(5, boardSize * 0.012);
    const cell = (boardSize - cellGap * 4) / 5;
    const originX = (width - boardSize) / 2;
    const originY = Math.max(112, (height - boardSize) / 2 - 16);
    const targets = this.targetIndexes();

    for (const sector of this.match.board) {
      const sectorNode = this.sectorTile(sector, cell, targets.includes(sector.index), this.selectedActor === sector.index);
      sectorNode.position.set(originX + sector.col * (cell + cellGap), originY + sector.row * (cell + cellGap));
      sectorNode.eventMode = "static";
      sectorNode.cursor = "pointer";
      sectorNode.on("pointertap", () => this.onSectorTap(sector.index));
      this.boardLayer.addChild(sectorNode);
    }
  }

  private drawHand() {
    const { width, height } = this.app.screen;
    const cardW = Math.min(104, Math.max(76, (width - 36) / 5.35));
    const cardH = cardW * 1.34;
    const totalW = this.hand.length * cardW + (this.hand.length - 1) * 8;
    const startX = Math.max(14, (width - totalW) / 2);
    const y = height - cardH - 18;

    this.hand.forEach((defId, index) => {
      const def = getCard(defId);
      const selected = this.selectedCardId === defId;
      const disabled = def.cost > this.match.player.resonance || def.type === "Anomaly";
      const card = this.handCard(def, cardW, cardH, selected, disabled);
      card.position.set(startX + index * (cardW + 8), y + (selected ? -10 : 0));
      card.eventMode = disabled ? "none" : "static";
      card.cursor = disabled ? "default" : "pointer";
      card.on("pointertap", () => {
        this.selectedActor = null;
        this.selectedCardId = this.selectedCardId === def.defId ? null : def.defId;
        this.redraw();
      });
      this.handLayer.addChild(card);
    });
  }

  private sectorTile(sector: SectorState, size: number, target: boolean, selected: boolean) {
    const node = new Container();
    const world = WORLD_COLOR[sector.world] ?? COLORS.slate;
    const bg = new Graphics()
      .roundRect(0, 0, size, size, 8)
      .fill({ color: 0x050814, alpha: 0.82 })
      .roundRect(2, 2, size - 4, size - 4, 7)
      .fill({ color: world, alpha: sector.world === "barren" ? 0.1 : 0.2 })
      .stroke({ color: target ? COLORS.emerald : selected ? COLORS.gold : 0xffffff, alpha: target || selected ? 0.84 : 0.12, width: target || selected ? 2 : 1 });
    const grid = new Graphics()
      .moveTo(size / 2, 8)
      .lineTo(size / 2, size - 8)
      .moveTo(8, size / 2)
      .lineTo(size - 8, size / 2)
      .stroke({ color: 0xffffff, alpha: 0.04, width: 1 });
    const id = label(sector.id, Math.max(8, size * 0.09), COLORS.slate, "900");
    id.position.set(7, 5);
    const dot = new Graphics().circle(size - 11, 11, 4).fill({ color: world, alpha: 0.9 });
    node.addChild(bg, grid, id, dot);

    if (sector.statuses.includes("anomalyCore")) {
      const anomaly = new Graphics()
        .circle(size / 2, size / 2, size * 0.25)
        .stroke({ color: COLORS.cyan, alpha: 0.35, width: 1 });
      anomaly.rotation = this.time;
      node.addChild(anomaly);
    }

    const occupant = sector.entity ?? sector.structure;
    if (occupant) {
      const ownerColor = occupant.owner === "player" ? COLORS.emerald : COLORS.fuchsia;
      const card = new Graphics()
        .roundRect(size * 0.14, size * 0.22, size * 0.72, size * 0.58, 8)
        .fill({ color: ownerColor, alpha: 0.16 })
        .stroke({ color: ownerColor, alpha: 0.72, width: 1 });
      const glyph = label(occupant.owner === "player" ? "☼" : "☣", Math.max(18, size * 0.24), ownerColor, "900");
      glyph.anchor.set(0.5);
      glyph.position.set(size / 2, size * 0.42);
      const name = label(occupant.name, Math.max(8, size * 0.075), COLORS.white, "900");
      name.anchor.set(0.5);
      name.position.set(size / 2, size * 0.64);
      const stats = "attack" in occupant ? `${occupant.attack}/${occupant.hp}` : `STR ${occupant.hp}`;
      const statLabel = label(stats, Math.max(10, size * 0.09), COLORS.gold, "900");
      statLabel.anchor.set(0.5);
      statLabel.position.set(size / 2, size * 0.76);
      node.addChild(card, glyph, name, statLabel);
      if ("exhausted" in occupant && occupant.exhausted) {
        const spent = label("SPENT", Math.max(8, size * 0.07), COLORS.rose, "900");
        spent.anchor.set(0.5);
        spent.position.set(size / 2, size * 0.88);
        node.addChild(spent);
      }
    }

    const controlColor = sector.control === "player" ? COLORS.emerald : sector.control === "enemy" ? COLORS.fuchsia : sector.control === "contested" ? COLORS.gold : COLORS.slate;
    node.addChild(new Graphics().roundRect(4, size - 7, size - 8, 3, 3).fill({ color: controlColor, alpha: 0.8 }));
    return node;
  }

  private drawBattleEvents() {
    if (this.match.lastEvents.length === 0) return;
    const { width, height } = this.app.screen;
    const boardSize = Math.min(width - 26, height - 260, 760);
    const cellGap = Math.max(5, boardSize * 0.012);
    const cell = (boardSize - cellGap * 4) / 5;
    const originX = (width - boardSize) / 2;
    const originY = Math.max(112, (height - boardSize) / 2 - 16);

    for (const event of this.match.lastEvents) {
      if (event.type === "attack") {
        const from = this.cellCenter(event.attackerIndex, originX, originY, cell, cellGap);
        const to = this.cellCenter(event.targetIndex, originX, originY, cell, cellGap);
        const beam = new Graphics()
          .moveTo(from.x, from.y)
          .lineTo(to.x, to.y)
          .stroke({ color: event.destroyed ? COLORS.rose : COLORS.gold, alpha: 0.72, width: 4 });
        const burst = new Graphics()
          .circle(to.x, to.y, Math.max(18, cell * 0.22))
          .stroke({ color: event.destroyed ? COLORS.rose : COLORS.gold, alpha: 0.7, width: 3 })
          .circle(to.x, to.y, Math.max(5, cell * 0.07))
          .fill({ color: event.destroyed ? COLORS.rose : COLORS.gold, alpha: 0.55 });
        const damage = label(`-${event.damage}`, Math.max(18, cell * 0.2), event.destroyed ? COLORS.rose : COLORS.gold, "900");
        damage.anchor.set(0.5);
        damage.position.set(to.x, to.y - cell * 0.34);
        this.fxLayer.addChild(beam, burst, damage);
        if (event.overflowDamage > 0) {
          const overflow = label(`OVERFLOW -${event.overflowDamage}`, Math.max(13, cell * 0.12), COLORS.rose, "900");
          overflow.anchor.set(0.5);
          overflow.position.set(width / 2, event.targetIndex < 13 ? 62 : height - 88);
          this.fxLayer.addChild(overflow);
        }
      }
      if (event.type === "commanderDamage") {
        const text = label(`${event.direct ? "DIRECT" : "OVERFLOW"} COMMANDER -${event.damage}`, 18, COLORS.rose, "900");
        text.anchor.set(0.5);
        text.position.set(width / 2, event.commander === "enemy" ? 56 : height - 92);
        this.fxLayer.addChild(text);
      }
      if (event.type === "destroyed") {
        const center = this.cellCenter(event.sectorIndex, originX, originY, cell, cellGap);
        const text = label("DESTROYED", Math.max(12, cell * 0.11), COLORS.rose, "900");
        text.anchor.set(0.5);
        text.position.set(center.x, center.y + cell * 0.35);
        this.fxLayer.addChild(text);
      }
    }
  }

  private cellCenter(index: number, originX: number, originY: number, cell: number, cellGap: number) {
    const row = Math.floor(index / 5);
    const col = index % 5;
    return {
      x: originX + col * (cell + cellGap) + cell / 2,
      y: originY + row * (cell + cellGap) + cell / 2,
    };
  }

  private handCard(def: CardDef, width: number, height: number, selected: boolean, disabled: boolean) {
    const node = new Container();
    const factionColor = def.faction === "voidborn" ? COLORS.fuchsia : def.faction === "synthari" ? COLORS.cyan : COLORS.gold;
    const bg = new Graphics()
      .roundRect(0, 0, width, height, 8)
      .fill({ color: 0x070a14, alpha: disabled ? 0.55 : 0.94 })
      .stroke({ color: selected ? COLORS.emerald : factionColor, alpha: selected ? 0.9 : 0.42, width: selected ? 2 : 1 })
      .roundRect(8, 10, width - 16, height * 0.47, 7)
      .fill({ color: factionColor, alpha: disabled ? 0.08 : 0.16 });
    const cost = new Graphics().circle(17, 18, 12).fill({ color: COLORS.cyan, alpha: 0.9 });
    const costText = label(String(def.cost), 12, 0x041016, "900");
    costText.anchor.set(0.5);
    costText.position.set(17, 18);
    const glyph = label(def.type === "World" ? "⬢" : def.type === "Structure" ? "▣" : def.type === "Attachment" ? "⚙" : "✦", Math.max(20, width * 0.3), factionColor, "900");
    glyph.anchor.set(0.5);
    glyph.position.set(width / 2, height * 0.33);
    const name = label(def.name, Math.max(9, width * 0.09), COLORS.white, "900");
    name.anchor.set(0.5);
    name.position.set(width / 2, height - 34);
    const kind = label(def.type.toUpperCase(), 8, COLORS.slate, "bold");
    kind.anchor.set(0.5);
    kind.position.set(width / 2, height - 18);
    node.addChild(bg, cost, costText, glyph, name, kind);
    node.alpha = disabled ? 0.48 : 1;
    return node;
  }

  private commanderHud(name: string, hp: number, maxHp: number, influence: number, side: "player" | "enemy", resonance?: number) {
    const width = Math.min(340, this.app.screen.width - 36);
    const hud = new Container();
    const accent = side === "player" ? COLORS.emerald : COLORS.fuchsia;
    hud.addChild(roundedPanel(width, 58, 0x030712, 0.72, accent));
    const title = label(name, 13, COLORS.white, "900");
    title.position.set(12, 9);
    const hpBar = new Graphics()
      .roundRect(12, 32, width - 24, 8, 8)
      .fill({ color: 0xffffff, alpha: 0.08 })
      .roundRect(12, 32, (width - 24) * Math.max(0, Math.min(1, hp / maxHp)), 8, 8)
      .fill({ color: COLORS.rose, alpha: 0.95 });
    const stats = label(`${hp}/${maxHp} HP · ${influence}/30 INF${typeof resonance === "number" ? ` · ${resonance}R` : ""}`, 10, COLORS.slate, "bold");
    stats.position.set(12, 43);
    hud.addChild(title, hpBar, stats);
    return hud;
  }

  private targetIndexes() {
    const selectedCard = this.selectedCardId ? getCard(this.selectedCardId) : null;
    if (selectedCard) {
      if (selectedCard.cost > this.match.player.resonance) return [];
      if (selectedCard.type === "Entity") return legalDeployIndexes(this.match.board, "player");
      if (selectedCard.type === "World") return legalWorldIndexes(this.match.board, "player");
      if (selectedCard.type === "Structure") return legalStructureIndexes(this.match.board, "player");
      if (selectedCard.type === "Attachment") {
        return this.match.board.filter((sector) => sector.entity?.owner === "player").map((sector) => sector.index);
      }
      return [];
    }
    if (this.selectedActor !== null) {
      return [
        ...legalMoveIndexes(this.match.board, this.selectedActor),
        ...legalAttackIndexes(this.match.board, this.selectedActor),
      ];
    }
    return [];
  }

  private onSectorTap(index: number) {
    const sector = this.match.board[index];
    const selectedCard = this.selectedCardId ? getCard(this.selectedCardId) : null;
    const targets = this.targetIndexes();

    if (!selectedCard && sector.entity?.owner === "player") {
      this.selectedActor = this.selectedActor === index ? null : index;
      this.redraw();
      return;
    }

    if (!targets.includes(index)) return;

    if (selectedCard) {
      const before = this.match;
      const next = this.playSelectedCard(selectedCard, index);
      if (next !== before) {
        this.match = next;
        this.hand = this.hand.filter((id) => id !== selectedCard.defId);
        this.selectedCardId = null;
        this.bus.emit("battlelog", { message: `${selectedCard.name} played.` });
      }
      this.redraw();
      return;
    }

    if (this.selectedActor !== null) {
      const attacks = legalAttackIndexes(this.match.board, this.selectedActor);
      this.match = attacks.includes(index)
        ? attackInMatch(this.match, this.selectedActor, index)
        : moveEntityInMatch(this.match, this.selectedActor, index);
      if (this.match.winner) this.switchScene(this.match.winner === "player" ? "victory" : "defeat");
      this.selectedActor = null;
      this.redraw();
    }
  }

  private attackCommander() {
    if (this.selectedActor === null || !canAttackCommander(this.match.board, this.selectedActor)) return;
    this.match = attackCommanderInMatch(this.match, this.selectedActor);
    this.selectedActor = null;
    this.selectedCardId = null;
    if (this.match.winner) this.switchScene(this.match.winner === "player" ? "victory" : "defeat");
    this.redraw();
  }

  private playSelectedCard(def: CardDef, targetIndex: number) {
    if (def.type === "Entity") return deployEntityCard(this.match, def, "player", targetIndex);
    if (def.type === "World") return playWorldCard(this.match, def, "player", targetIndex);
    if (def.type === "Structure") return buildStructureCard(this.match, def, "player", targetIndex);
    if (def.type === "Attachment") return attachCardToEntity(this.match, def, "player", targetIndex);
    return this.match;
  }

  private pulseTurn() {
    const ended = endStep(this.match);
    this.match = ended.phase === "over" ? ended : startTurn(ended, "player");
    this.selectedActor = null;
    this.selectedCardId = null;
    if (this.match.winner) this.switchScene(this.match.winner === "player" ? "victory" : "defeat");
    this.redraw();
  }

  private clearLayer(layer: Container) {
    for (const child of layer.removeChildren()) {
      child.destroy({ children: true });
    }
  }
}
