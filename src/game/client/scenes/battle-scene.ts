import { Container, Graphics, Text } from "pixi.js";
import { CARD_DEFS, type CardDef } from "@/lib/match-engine";
import {
  anomalyNeedsTarget,
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
  legalAnomalyIndexes,
  moveEntityInMatch,
  playAnomalyCard,
  playWorldCard,
  buildStructureCard,
  attachCardToEntity,
  startTurn,
  type FiveByFiveMatchState,
  type SectorState,
} from "@/game/five-by-five";
import { BaseScene } from "./base-scene";
import { COLORS, label, makeButton, roundedPanel } from "../pixi-ui";

const PLAYER_DECKLIST = [
  "sector_surveyor",
  "carrion_bloom",
  "smite",
  "solar_writ",
  "concord_arbiter",
  "hardlight_exoshell",
  "acolyte",
  "sunfire-cannon",
  "dawnknight",
  "solar-priest",
  "surge",
  "refract",
  "radiance",
  "survey_claim",
  "emergency_bulkhead",
  "solar_mantle",
  "verdict_of_helios",
  "artifact_recovery_team",
];

const ENEMY_DECKLIST = ["broodling", "spitter", "infestor", "larval_tide", "tyrant", "harvester", "maw_apostle", "spawning_pit", "black_bloom"];
const OPENING_HAND_SIZE = 5;

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

function shuffleDeck(deck: string[]): string[] {
  const shuffled = [...deck];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function drawCards(deck: string[], count: number): { hand: string[]; deck: string[] } {
  return {
    hand: deck.slice(0, count),
    deck: deck.slice(count),
  };
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
  private hand: string[] = [];
  private playerDeck: string[] = [];
  private playerRecovery: string[] = [];
  private enemyHand: string[] = [];
  private enemyDeck: string[] = [];
  private enemyRecovery: string[] = [];
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
  private enemyTurnQueued = false;
  private cardsPlayed: string[] = [];
  private deployedCount = 0;
  private castCount = 0;
  private resultSubmitted = false;

  enter(): void {
    if (this.hand.length === 0 && this.playerDeck.length === 0) this.resetBattle();
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
      this.resetBattle();
      this.redraw();
    });
    reset.position.set(width - 226, 78);
    const menu = makeButton("MENU", 94, COLORS.cyan, () => this.switchScene("mainMenu"));
    menu.position.set(width - 118, 78);
    const end = makeButton("END TURN", Math.min(170, width * 0.28), COLORS.emerald, () => this.endPlayerTurn());
    end.position.set(width - end.width - 18, height - 152);
    end.eventMode = this.match.active === "player" ? "static" : "none";
    end.alpha = this.match.active === "player" ? 1 : 0.34;
    const selectedCanStrikeCommander = this.selectedActor !== null && canAttackCommander(this.match.board, this.selectedActor);
    const direct = makeButton("STRIKE COMMANDER", Math.min(210, width * 0.38), COLORS.rose, () => this.attackCommander());
    direct.position.set(width - direct.width - 18, height - 208);
    direct.alpha = selectedCanStrikeCommander ? 1 : 0.34;
    direct.eventMode = selectedCanStrikeCommander ? "static" : "none";
    const selectedCard = this.selectedCardId ? getCard(this.selectedCardId) : null;
    const canCast = selectedCard?.type === "Anomaly" && !anomalyNeedsTarget(selectedCard) && selectedCard.cost <= this.match.player.resonance && this.match.active === "player";
    const cast = makeButton("CAST CARD", Math.min(170, width * 0.28), COLORS.gold, () => this.castSelectedCard());
    cast.position.set(width - cast.width - 18, height - 264);
    cast.alpha = canCast ? 1 : 0.34;
    cast.eventMode = canCast ? "static" : "none";

    const logPanel = roundedPanel(Math.min(300, width - 36), 92, 0x030712, 0.72, COLORS.cyan);
    logPanel.position.set(width - logPanel.width - 18, 138);
    const logTitle = label("BATTLE LOG", 9, COLORS.cyan, "900");
    logTitle.position.set(logPanel.x + 12, logPanel.y + 10);
    const phase = this.turnBanner(width);
    phase.position.set(Math.max(18, width / 2 - phase.width / 2), 22);
    const hint = this.actionHint();
    hint.position.set(22, Math.max(136, height - 208));
    this.hudLayer.addChild(top, player, reset, menu, end, direct, cast, logPanel, logTitle, phase, hint);
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
    const cardW = Math.min(104, Math.max(62, (width - 36) / (this.hand.length + 0.35)));
    const cardH = cardW * 1.34;
    const totalW = this.hand.length * cardW + (this.hand.length - 1) * 8;
    const startX = Math.max(14, (width - totalW) / 2);
    const y = height - cardH - 18;

    this.hand.forEach((defId, index) => {
      const def = getCard(defId);
      const selected = this.selectedCardId === defId;
      const disabled = this.match.active !== "player" || def.cost > this.match.player.resonance;
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
      if (event.type === "cardEffect") {
        const color = event.tone === "damage"
          ? COLORS.rose
          : event.tone === "shield"
            ? COLORS.cyan
            : event.tone === "heal"
              ? COLORS.emerald
              : event.tone === "world"
                ? COLORS.gold
                : COLORS.white;
        const text = label(event.label, 15, color, "900");
        text.anchor.set(0.5);
        if (typeof event.targetIndex === "number") {
          const center = this.cellCenter(event.targetIndex, originX, originY, cell, cellGap);
          text.position.set(center.x, center.y - cell * 0.2);
        } else if (event.commander) {
          text.position.set(width / 2, event.commander === "enemy" ? 82 : height - 116);
        } else {
          text.position.set(width / 2, height / 2);
        }
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
    const glyph = label(def.type === "World" ? "⬢" : def.type === "Structure" ? "▣" : def.type === "Attachment" ? "⚙" : def.type === "Anomaly" ? "!" : "✦", Math.max(20, width * 0.3), factionColor, "900");
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
    hud.addChild(roundedPanel(width, 68, 0x030712, 0.72, accent));
    const title = label(name, 13, COLORS.white, "900");
    title.position.set(12, 9);
    const hpBar = new Graphics()
      .roundRect(12, 32, width - 24, 8, 8)
      .fill({ color: 0xffffff, alpha: 0.08 })
      .roundRect(12, 32, (width - 24) * Math.max(0, Math.min(1, hp / maxHp)), 8, 8)
      .fill({ color: COLORS.rose, alpha: 0.95 });
    const stats = label(`${hp}/${maxHp} HP · ${influence}/30 INF${typeof resonance === "number" ? ` · ${resonance}R` : ""}`, 10, COLORS.slate, "bold");
    stats.position.set(12, 43);
    const zone = label(this.zoneSummary(side), 9, COLORS.slate, "bold");
    zone.position.set(12, 55);
    hud.addChild(title, hpBar, stats, zone);
    return hud;
  }

  private turnBanner(screenWidth: number) {
    const title = this.match.active === "player" ? `TURN ${this.match.turn} · YOUR ACTION` : `TURN ${this.match.turn} · ENEMY ACTION`;
    const accent = this.match.active === "player" ? COLORS.emerald : COLORS.fuchsia;
    const banner = new Container();
    const width = Math.min(360, screenWidth - 36);
    banner.addChild(roundedPanel(width, 38, 0x030712, 0.78, accent));
    const copy = label(title, 13, accent, "900");
    copy.anchor.set(0.5);
    copy.position.set(width / 2, 19);
    banner.addChild(copy);
    return banner;
  }

  private actionHint() {
    const width = Math.min(360, this.app.screen.width - 44);
    const hint = new Container();
    hint.addChild(roundedPanel(width, 54, 0x030712, 0.68, COLORS.gold));
    const copy = label(this.hintText(), 10, COLORS.slate, "bold");
    copy.position.set(12, 10);
    hint.addChild(copy);
    return hint;
  }

  private hintText() {
    if (this.match.active !== "player") return "Enemy commander is resolving actions.";
    if (this.selectedCardId) {
      const card = getCard(this.selectedCardId);
      if (card.cost > this.match.player.resonance) return `Need ${card.cost} Resonance to play ${card.name}.`;
      if (card.type === "Anomaly" && !anomalyNeedsTarget(card)) return "Use Cast Card to fire this anomaly.";
      if (this.targetIndexes().length === 0) return "No legal sectors for this card right now.";
      if (card.type === "Anomaly" && anomalyNeedsTarget(card)) return "Tap a glowing target to cast this anomaly.";
      return "Tap a glowing sector to play the selected card.";
    }
    if (this.selectedActor !== null) {
      const actor = this.match.board[this.selectedActor]?.entity;
      if (!actor) return "Select a card or a friendly unit.";
      if (canAttackCommander(this.match.board, this.selectedActor)) return "Enemy board is clear. Strike the commander or move.";
      if (actor.exhausted || !actor.canAttack) return "This unit is spent until your next turn.";
      if (legalAttackIndexes(this.match.board, this.selectedActor).length > 0) return "Tap a glowing enemy to attack. Each unit attacks once per turn.";
      return "No legal attack. Move toward the fight or end turn.";
    }
    return "Tap a hand card to deploy, or tap a friendly unit to move or attack.";
  }

  private targetIndexes() {
    const selectedCard = this.selectedCardId ? getCard(this.selectedCardId) : null;
    if (this.match.active !== "player") return [];
    if (selectedCard) {
      if (selectedCard.cost > this.match.player.resonance) return [];
      if (selectedCard.type === "Entity") return legalDeployIndexes(this.match.board, "player");
      if (selectedCard.type === "World") return legalWorldIndexes(this.match.board, "player");
      if (selectedCard.type === "Structure") return legalStructureIndexes(this.match.board, "player");
      if (selectedCard.type === "Attachment") {
        return this.match.board.filter((sector) => sector.entity?.owner === "player").map((sector) => sector.index);
      }
      if (selectedCard.type === "Anomaly") return legalAnomalyIndexes(this.match, selectedCard, "player");
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
    if (this.match.active !== "player") return;
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
        this.removeCardFromHand(selectedCard.defId);
        this.trackPlayedCard(selectedCard);
        this.collectDestroyedCards(this.match.lastEvents);
        this.applyDrawEvents();
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
      this.collectDestroyedCards(this.match.lastEvents);
      if (this.resolveWinner()) return;
      this.selectedActor = null;
      this.redraw();
    }
  }

  private attackCommander() {
    if (this.match.active !== "player" || this.selectedActor === null || !canAttackCommander(this.match.board, this.selectedActor)) return;
    this.match = attackCommanderInMatch(this.match, this.selectedActor);
    this.selectedActor = null;
    this.selectedCardId = null;
    if (this.resolveWinner()) return;
    this.redraw();
  }

  private playSelectedCard(def: CardDef, targetIndex: number) {
    if (def.type === "Entity") return deployEntityCard(this.match, def, "player", targetIndex);
    if (def.type === "World") return playWorldCard(this.match, def, "player", targetIndex);
    if (def.type === "Structure") return buildStructureCard(this.match, def, "player", targetIndex);
    if (def.type === "Attachment") return attachCardToEntity(this.match, def, "player", targetIndex);
    if (def.type === "Anomaly") return playAnomalyCard(this.match, def, "player", targetIndex);
    return this.match;
  }

  private castSelectedCard() {
    if (this.match.active !== "player" || !this.selectedCardId) return;
    const selectedCard = getCard(this.selectedCardId);
    if (selectedCard.type !== "Anomaly" || anomalyNeedsTarget(selectedCard) || selectedCard.cost > this.match.player.resonance) return;
    const before = this.match;
    const next = playAnomalyCard(this.match, selectedCard, "player", null);
    if (next === before) return;
    this.match = next;
    this.removeCardFromHand(selectedCard.defId);
    this.trackPlayedCard(selectedCard);
    this.collectDestroyedCards(this.match.lastEvents);
    this.applyDrawEvents();
    this.selectedCardId = null;
    if (this.resolveWinner()) return;
    this.redraw();
  }

  private endPlayerTurn() {
    if (this.match.active !== "player") return;
    this.selectedActor = null;
    this.selectedCardId = null;
    const playerEnded = endStep({
      ...this.match,
      log: [...this.match.log, "Player ends turn."],
      lastEvents: [],
    });
    this.match = playerEnded;
    if (this.resolveWinner()) return;
    this.match = startTurn(this.match, "enemy");
    this.drawEnemyCard();
    this.redraw();
    this.enemyTurnQueued = true;
    window.setTimeout(() => {
      if (!this.enemyTurnQueued || this.match.active !== "enemy") return;
      this.enemyTurnQueued = false;
      this.runEnemyTurn();
    }, 550);
  }

  private runEnemyTurn() {
    let next = this.playEnemyCard(this.match);
    next = this.resolveEnemyAttacks(next);
    const enemyEvents = next.lastEvents;
    if (next.phase !== "over") {
      next = endStep({
        ...next,
        log: [...next.log, "Enemy ends turn."],
      });
    }
    if (next.phase !== "over") {
      next = startTurn(next, "player");
      next = {
        ...next,
        lastEvents: enemyEvents.length > 0 ? enemyEvents : next.lastEvents,
      };
      this.drawPlayerCard();
    }
    this.match = next;
    this.enemyTurnQueued = false;
    this.collectDestroyedCards(this.match.lastEvents);
    if (this.resolveWinner()) return;
    this.redraw();
  }

  private playEnemyCard(state: FiveByFiveMatchState) {
    const affordable = this.enemyHand
      .map((id) => getCard(id))
      .filter((card) => card.type === "Entity" && card.cost <= state.enemy.resonance)
      .sort((a, b) => b.cost - a.cost);
    const card = affordable[0];
    if (!card) {
      return { ...state, log: [...state.log, "Enemy holds position."] };
    }
    const target = this.chooseEnemyDeployIndex(state);
    if (target === null) return state;
    const next = deployEntityCard(state, card, "enemy", target);
    if (next !== state) this.removeEnemyCardFromHand(card.defId);
    return next;
  }

  private chooseEnemyDeployIndex(state: FiveByFiveMatchState) {
    const targets = legalDeployIndexes(state.board, "enemy");
    if (targets.length === 0) return null;
    const playerIndexes = state.board.filter((sector) => sector.entity?.owner === "player").map((sector) => sector.index);
    if (playerIndexes.length === 0) {
      return targets.sort((a, b) => Math.abs((a % 5) - 2) - Math.abs((b % 5) - 2))[0];
    }
    return targets.sort((a, b) => this.closestDistance(a, playerIndexes) - this.closestDistance(b, playerIndexes))[0];
  }

  private resolveEnemyAttacks(state: FiveByFiveMatchState) {
    let next = state;
    for (let pass = 0; pass < 6; pass++) {
      const attackerIndex = this.bestEnemyAttacker(next);
      if (attackerIndex === null) break;
      const targetIndex = this.bestEnemyTarget(next, attackerIndex);
      if (targetIndex !== null) {
        next = attackInMatch(next, attackerIndex, targetIndex);
      } else if (canAttackCommander(next.board, attackerIndex)) {
        next = attackCommanderInMatch(next, attackerIndex);
      } else {
        const moveTarget = this.bestEnemyMove(next, attackerIndex);
        if (moveTarget === null) break;
        next = moveEntityInMatch(next, attackerIndex, moveTarget);
      }
      if (next.phase === "over") break;
    }
    return next;
  }

  private bestEnemyAttacker(state: FiveByFiveMatchState) {
    const candidates = state.board
      .filter((sector) => sector.entity?.owner === "enemy" && sector.entity.canAttack && !sector.entity.exhausted)
      .map((sector) => sector.index);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => (state.board[b].entity?.attack ?? 0) - (state.board[a].entity?.attack ?? 0))[0];
  }

  private bestEnemyTarget(state: FiveByFiveMatchState, attackerIndex: number) {
    const attacker = state.board[attackerIndex].entity;
    const targets = legalAttackIndexes(state.board, attackerIndex);
    if (!attacker || targets.length === 0) return null;
    return targets.sort((a, b) => {
      const aTarget = state.board[a].entity ?? state.board[a].structure;
      const bTarget = state.board[b].entity ?? state.board[b].structure;
      const aLethal = aTarget && aTarget.hp <= attacker.attack ? 0 : 1;
      const bLethal = bTarget && bTarget.hp <= attacker.attack ? 0 : 1;
      if (aLethal !== bLethal) return aLethal - bLethal;
      return (aTarget?.hp ?? 99) - (bTarget?.hp ?? 99);
    })[0];
  }

  private bestEnemyMove(state: FiveByFiveMatchState, fromIndex: number) {
    const moves = legalMoveIndexes(state.board, fromIndex);
    const playerIndexes = state.board.filter((sector) => sector.entity?.owner === "player").map((sector) => sector.index);
    if (moves.length === 0 || playerIndexes.length === 0) return null;
    return moves.sort((a, b) => this.closestDistance(a, playerIndexes) - this.closestDistance(b, playerIndexes))[0];
  }

  private closestDistance(index: number, targets: number[]) {
    return Math.min(...targets.map((target) => Math.abs(Math.floor(index / 5) - Math.floor(target / 5)) + Math.abs((index % 5) - (target % 5))));
  }

  private drawPlayerCard() {
    if (this.hand.length >= 7) return;
    const next = this.playerDeck.shift();
    if (!next) {
      this.match = { ...this.match, log: [...this.match.log, "Your deck is empty."] };
      return;
    }
    this.hand.push(next);
  }

  private applyDrawEvents() {
    const draws = this.match.lastEvents
      .reduce((total, event) => event.type === "draw" && event.side === "player" ? total + event.count : total, 0);
    for (let index = 0; index < draws; index++) {
      this.drawPlayerCard();
    }
  }

  private drawEnemyCard() {
    if (this.enemyHand.length >= 6) return;
    const next = this.enemyDeck.shift();
    if (!next) {
      this.match = { ...this.match, log: [...this.match.log, "Enemy deck is empty."] };
      return;
    }
    this.enemyHand.push(next);
  }

  private removeCardFromHand(defId: string) {
    const index = this.hand.indexOf(defId);
    if (index >= 0) this.hand.splice(index, 1);
  }

  private removeEnemyCardFromHand(defId: string) {
    const index = this.enemyHand.indexOf(defId);
    if (index >= 0) this.enemyHand.splice(index, 1);
  }

  private resolveWinner() {
    if (this.match.winner) this.finishMatch();
    return Boolean(this.match.winner);
  }

  private resetBattle() {
    const playerOpening = drawCards(shuffleDeck(PLAYER_DECKLIST), OPENING_HAND_SIZE);
    const enemyOpening = drawCards(shuffleDeck(ENEMY_DECKLIST), 3);
    this.match = createInitialBattleState();
    this.hand = playerOpening.hand;
    this.playerDeck = playerOpening.deck;
    this.playerRecovery = [];
    this.enemyHand = enemyOpening.hand;
    this.enemyDeck = enemyOpening.deck;
    this.enemyRecovery = [];
    this.selectedActor = null;
    this.selectedCardId = null;
    this.enemyTurnQueued = false;
    this.cardsPlayed = [];
    this.deployedCount = 0;
    this.castCount = 0;
    this.resultSubmitted = false;
  }

  private trackPlayedCard(card: CardDef) {
    this.cardsPlayed.push(card.defId);
    if (card.type === "Entity") this.deployedCount += 1;
    if (card.type === "Anomaly") {
      this.castCount += 1;
      this.playerRecovery.push(card.defId);
    }
  }

  private collectDestroyedCards(events: FiveByFiveMatchState["lastEvents"]) {
    for (const event of events) {
      if (event.type !== "destroyed") continue;
      if (event.owner === "player") this.playerRecovery.push(event.defId);
      if (event.owner === "enemy") this.enemyRecovery.push(event.defId);
    }
  }

  private zoneSummary(side: "player" | "enemy") {
    const deck = side === "player" ? this.playerDeck.length : this.enemyDeck.length;
    const hand = side === "player" ? this.hand.length : this.enemyHand.length;
    const recoveryCount = side === "player" ? this.playerRecovery.length : this.enemyRecovery.length;
    const field = this.match.board.filter((sector) => {
      const occupant = sector.entity ?? sector.structure;
      return occupant?.owner === side;
    }).length;
    return `DECK ${deck} · HAND ${hand} · FIELD ${field} · RECOVERY ${recoveryCount}`;
  }

  private finishMatch() {
    if (!this.match.winner) return;
    const destination = this.match.winner === "player" ? "victory" : "defeat";
    if (!this.resultSubmitted) {
      this.resultSubmitted = true;
      void this.submitMatchResult();
    }
    this.switchScene(destination);
  }

  private async submitMatchResult() {
    if (!this.match.winner) return;
    const payload = {
      result: this.match.winner === "player" ? "win" : "loss",
      commanderName: this.match.player.name,
      factionId: this.match.player.faction,
      enemyName: this.match.enemy.name,
      enemyFactionId: this.match.enemy.faction,
      turns: this.match.turn,
      playerHpLeft: this.match.player.hp,
      enemyHpLeft: this.match.enemy.hp,
      mode: this.match.winCondition === "ascendancy" ? "ascension" : "conquest",
      difficulty: "normal",
      deployedCount: this.deployedCount,
      castCount: this.castCount,
      cardsPlayed: this.cardsPlayed,
    };

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok && response.status !== 401) {
        console.warn("Match result was not saved", await response.text());
      }
    } catch (error) {
      console.warn("Match result submission failed", error);
    }
  }

  private clearLayer(layer: Container) {
    for (const child of layer.removeChildren()) {
      child.destroy({ children: true });
    }
  }
}
