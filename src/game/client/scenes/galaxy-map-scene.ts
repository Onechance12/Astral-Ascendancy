import { Container, Graphics, Text } from "pixi.js";
import { BaseScene } from "./base-scene";
import { COLORS, label, makeButton, roundedPanel } from "../pixi-ui";

type NodeType = "base" | "outpost" | "campaign" | "boss" | "locked";

type MapNode = {
  id: string;
  name: string;
  type: NodeType;
  /** relative position within the map region (0..1) */
  x: number;
  y: number;
  radius: number;
  tagline: string;
  description: string;
  reward: string;
  /** id of the node that must be cleared before this one unlocks */
  requires?: string;
};

type NodeView = {
  node: MapNode;
  container: Container;
  ring: Graphics;
  core: Graphics;
  position: { x: number; y: number };
};

type Pulse = {
  gfx: Graphics;
  from: { x: number; y: number };
  to: { x: number; y: number };
  t: number;
  speed: number;
  color: number;
};

const TYPE_META: Record<NodeType, { color: number; badge: string; glyph: string }> = {
  base: { color: COLORS.gold, badge: "FACTION BASE", glyph: "★" },
  outpost: { color: COLORS.emerald, badge: "SUPPLY OUTPOST", glyph: "◇" },
  campaign: { color: COLORS.cyan, badge: "CAMPAIGN NODE", glyph: "◈" },
  boss: { color: COLORS.fuchsia, badge: "BOSS WORLD", glyph: "✷" },
  locked: { color: COLORS.slate, badge: "SEALED WORLD", glyph: "◌" },
};

const NODES: MapNode[] = [
  {
    id: "helios",
    name: "Helios Prime",
    type: "base",
    x: 0.16,
    y: 0.36,
    radius: 30,
    tagline: "Your homeworld command spire.",
    description: "Marshal your fleet, upgrade the homeworld, and set your active deck before pushing into contested space.",
    reward: "Homeworld production & upgrades",
  },
  {
    id: "verdant",
    name: "Verdant Relay",
    type: "outpost",
    x: 0.34,
    y: 0.66,
    radius: 20,
    tagline: "Automated resource relay.",
    description: "Deploy crews to harvest shards and seed development. Keeps the war economy running while you campaign.",
    reward: "Passive shard & resource flow",
  },
  {
    id: "virell",
    name: "Virell Gate",
    type: "campaign",
    x: 0.44,
    y: 0.34,
    radius: 22,
    tagline: "The first contested gate.",
    description: "A Synthari border gate holding the lane to the Cluster core. Break the garrison to open the campaign.",
    reward: "Campaign chapter · card cache",
  },
  {
    id: "ashen",
    name: "Ashen Drift",
    type: "campaign",
    x: 0.58,
    y: 0.62,
    radius: 20,
    tagline: "Debris-choked skirmish field.",
    description: "Voidborn raiders nest in the drift. A fast skirmish world that rewards aggressive board control.",
    reward: "Skirmish rewards · shards",
  },
  {
    id: "maw",
    name: "The Maw",
    type: "boss",
    x: 0.7,
    y: 0.36,
    radius: 30,
    tagline: "A world that devours fleets.",
    description: "The Crimson Devourer commands this collapsed star. A brutal boss encounter — bring an evolved deck.",
    reward: "Boss cache · Singularity shard",
  },
  {
    id: "terminus",
    name: "Void Terminus",
    type: "locked",
    x: 0.84,
    y: 0.6,
    radius: 24,
    tagline: "Beyond the Barrier Veil.",
    description: "The endgame gate into the next galaxy. Sealed until the Devourer at The Maw is broken.",
    reward: "Endgame chapter",
    requires: "maw",
  },
];

const LANES: Array<[string, string]> = [
  ["helios", "verdant"],
  ["helios", "virell"],
  ["verdant", "ashen"],
  ["virell", "ashen"],
  ["virell", "maw"],
  ["ashen", "maw"],
  ["maw", "terminus"],
];

export class GalaxyMapScene extends BaseScene {
  private nodeViews = new Map<string, NodeView>();
  private stars: Container[] = [];
  private pulses: Pulse[] = [];
  private laneLayer = new Graphics();
  private panelLayer = new Container();
  private selectedId: string | null = null;
  private time = 0;

  enter(): void {
    const { width, height } = this.app.screen;
    const compact = width < 640;

    // Reserve space for the detail panel (right on wide, bottom on compact).
    const panelW = compact ? width : Math.min(340, Math.round(width * 0.32));
    const panelH = compact ? 196 : height;
    const mapW = compact ? width : width - panelW;
    const mapH = compact ? height - panelH : height;

    this.drawStars(width, height);

    // Header sits below the React client overlay bar (Exit / status / scene badge).
    const title = label("GALAXY WAR MAP", compact ? 22 : 28, COLORS.white, "900");
    title.anchor.set(0, 0.5);
    title.position.set(compact ? 18 : 24, compact ? 74 : 84);
    const subtitle = label(
      "Select a world to plan your next move across the Aetherion Cluster.",
      compact ? 9 : 11,
      COLORS.slate,
      "bold"
    );
    subtitle.anchor.set(0, 0.5);
    subtitle.position.set(compact ? 18 : 24, compact ? 94 : 108);

    const back = makeButton("◄ COMMAND", 132, COLORS.cyan, () => this.switchScene("mainMenu"));
    back.position.set(mapW - 150, compact ? 58 : 62);

    this.container.addChild(this.laneLayer);

    // Position + draw nodes within the map region.
    const insetX = compact ? 0.06 : 0.05;
    const insetY = compact ? 0.2 : 0.16;
    const spanX = 1 - insetX * 2;
    const spanY = 1 - insetY * 2;
    for (const node of NODES) {
      const px = (insetX + node.x * spanX) * mapW;
      const py = (insetY + node.y * spanY) * mapH;
      const view = this.createNode(node);
      view.container.position.set(px, py);
      view.position = { x: px, y: py };
      this.nodeViews.set(node.id, view);
      this.container.addChild(view.container);
    }

    this.drawLanes();
    this.seedPulses();

    this.container.addChild(title, subtitle, back, this.panelLayer);
    this.panelLayer.position.set(compact ? 0 : mapW, compact ? height - panelH : 0);
    this.renderPanel(panelW, panelH);
  }

  update(deltaMS: number): void {
    this.time += deltaMS * 0.001;

    for (const [index, star] of this.stars.entries()) {
      star.alpha = 0.3 + Math.sin(this.time * 1.3 + index) * 0.22;
    }

    for (const [index, view] of Array.from(this.nodeViews.values()).entries()) {
      const unlocked = this.isUnlocked(view.node);
      const pulse = unlocked ? 1 + Math.sin(this.time * 1.8 + index) * 0.03 : 1;
      view.container.scale.set(pulse);
      if (view.node.id === this.selectedId) {
        view.ring.rotation += deltaMS * 0.0016;
        view.ring.alpha = 0.7 + Math.sin(this.time * 3) * 0.25;
      }
      view.core.alpha = unlocked ? 0.7 + Math.sin(this.time * 2.4 + index) * 0.25 : 0.3;
    }

    // Advance signal pulses along their lanes.
    for (const pulse of this.pulses) {
      pulse.t += deltaMS * 0.001 * pulse.speed;
      if (pulse.t > 1) pulse.t -= 1;
      pulse.gfx.position.set(
        pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.t,
        pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.t
      );
    }
  }

  // ---------- construction helpers ----------

  private drawStars(width: number, height: number) {
    for (let index = 0; index < 110; index++) {
      const star = new Container();
      const dot = new Graphics()
        .circle(0, 0, index % 9 === 0 ? 1.8 : 0.9)
        .fill({ color: index % 6 === 0 ? COLORS.cyan : COLORS.white, alpha: 0.7 });
      star.addChild(dot);
      star.position.set((index * 131) % width, (index * 71) % height);
      this.stars.push(star);
      this.container.addChild(star);
    }
  }

  private drawLanes() {
    this.laneLayer.clear();
    for (const [fromId, toId] of LANES) {
      const from = this.nodeViews.get(fromId);
      const to = this.nodeViews.get(toId);
      if (!from || !to) continue;
      const live = this.isUnlocked(from.node) && this.isUnlocked(to.node);
      const color = live ? COLORS.cyan : COLORS.slate;
      this.laneLayer
        .moveTo(from.position.x, from.position.y)
        .lineTo(to.position.x, to.position.y)
        .stroke({ color, alpha: live ? 0.28 : 0.12, width: live ? 2 : 1 });
    }
  }

  private seedPulses() {
    for (const [fromId, toId] of LANES) {
      const from = this.nodeViews.get(fromId);
      const to = this.nodeViews.get(toId);
      if (!from || !to) continue;
      if (!this.isUnlocked(from.node) || !this.isUnlocked(to.node)) continue;
      const gfx = new Graphics().circle(0, 0, 2.4).fill({ color: COLORS.cyan, alpha: 0.9 });
      this.container.addChild(gfx);
      this.pulses.push({
        gfx,
        from: from.position,
        to: to.position,
        t: (fromId.length * 0.17) % 1,
        speed: 0.35 + (toId.length % 3) * 0.12,
        color: COLORS.cyan,
      });
    }
  }

  private createNode(node: MapNode): NodeView {
    const meta = TYPE_META[node.type];
    const unlocked = this.isUnlocked(node);
    const color = unlocked ? meta.color : COLORS.slate;
    const container = new Container();

    const aura = new Graphics().circle(0, 0, node.radius * 2).fill({ color, alpha: unlocked ? 0.08 : 0.04 });

    // Selection ring (hidden until selected) — dashed arc segments that rotate.
    const ring = new Graphics();
    for (let i = 0; i < 8; i++) {
      const start = (i / 8) * Math.PI * 2;
      ring.arc(0, 0, node.radius + 9, start, start + Math.PI / 8).stroke({ color, alpha: 0.9, width: 2 });
    }
    ring.visible = false;

    const orbit = new Graphics()
      .ellipse(0, 0, node.radius * 1.6, node.radius * 0.5)
      .stroke({ color, alpha: unlocked ? 0.4 : 0.15, width: 1.5 });

    const body = new Graphics()
      .circle(0, 0, node.radius)
      .fill({ color, alpha: unlocked ? 0.7 : 0.25 })
      .stroke({ color: COLORS.white, alpha: unlocked ? 0.32 : 0.12, width: 1 });

    const core = new Graphics().circle(0, 0, node.radius * 0.34).fill({ color: COLORS.white, alpha: unlocked ? 0.85 : 0.3 });

    const glyph = label(meta.glyph, node.radius * 0.9, unlocked ? COLORS.white : COLORS.slate, "900");
    glyph.anchor.set(0.5);
    glyph.alpha = 0.9;

    const name = label(node.name, 12, unlocked ? COLORS.white : COLORS.slate, "900");
    name.anchor.set(0.5);
    name.y = node.radius + 20;

    const state = label(unlocked ? meta.badge : "LOCKED", 8, unlocked ? color : COLORS.slate, "bold");
    state.anchor.set(0.5);
    state.y = node.radius + 34;

    container.addChild(aura, ring, orbit, body, core, glyph, name, state);
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("pointertap", () => this.selectNode(node.id));
    container.on("pointerover", () => {
      body.alpha = unlocked ? 0.92 : 0.3;
      if (node.id !== this.selectedId) container.scale.set(1.08);
    });
    container.on("pointerout", () => {
      body.alpha = unlocked ? 0.7 : 0.25;
      if (node.id !== this.selectedId) container.scale.set(1);
    });

    return { node, container, ring, core, position: { x: 0, y: 0 } };
  }

  // ---------- selection + detail panel ----------

  private selectNode(id: string) {
    const view = this.nodeViews.get(id);
    if (!view) return;
    this.selectedId = id;
    for (const other of this.nodeViews.values()) {
      other.ring.visible = other.node.id === id;
    }
    this.bus.emit("battlelog", { message: `${view.node.name} targeted` });
    const { width, height } = this.app.screen;
    const compact = width < 640;
    const panelW = compact ? width : Math.min(340, Math.round(width * 0.32));
    const panelH = compact ? 196 : height;
    this.renderPanel(panelW, panelH);
  }

  private renderPanel(panelW: number, panelH: number) {
    this.panelLayer.removeChildren().forEach((child) => child.destroy({ children: true }));

    const bg = new Graphics()
      .rect(0, 0, panelW, panelH)
      .fill({ color: 0x05070f, alpha: 0.82 })
      .moveTo(0, 0)
      .lineTo(0, panelH)
      .stroke({ color: COLORS.cyan, alpha: 0.22, width: 1 });
    this.panelLayer.addChild(bg);

    const node = this.selectedId ? this.nodeViews.get(this.selectedId)?.node : null;
    const pad = 20;

    if (!node) {
      const heading = label("STAR CHART", 13, COLORS.cyan, "900");
      heading.position.set(pad, 24);
      const hint = this.wrapText(
        "Pick a world on the map to see its briefing, rewards, and available action.",
        11,
        COLORS.slate,
        panelW - pad * 2
      );
      hint.position.set(pad, 50);
      this.panelLayer.addChild(heading, hint);
      this.drawLegend(pad, 96, panelW - pad * 2);
      return;
    }

    const meta = TYPE_META[node.type];
    const unlocked = this.isUnlocked(node);
    const accent = unlocked ? meta.color : COLORS.slate;

    const badge = new Graphics().roundRect(pad, 22, 128, 20, 6).fill({ color: accent, alpha: 0.16 }).stroke({ color: accent, alpha: 0.6, width: 1 });
    const badgeText = label(meta.badge, 9, accent, "900");
    badgeText.anchor.set(0, 0.5);
    badgeText.position.set(pad + 10, 32);

    const name = label(node.name, 22, COLORS.white, "900");
    name.position.set(pad, 54);

    const tagline = this.wrapText(node.tagline, 11, accent, panelW - pad * 2);
    tagline.position.set(pad, 86);

    const desc = this.wrapText(node.description, 11, COLORS.slate, panelW - pad * 2);
    desc.position.set(pad, 116);

    const rewardLabel = label("REWARD", 8, COLORS.slate, "900");
    rewardLabel.position.set(pad, 196);
    const reward = this.wrapText(node.reward, 11, COLORS.gold, panelW - pad * 2);
    reward.position.set(pad, 210);

    this.panelLayer.addChild(badge, badgeText, name, tagline, desc, rewardLabel, reward);

    const actionY = panelH >= 300 ? panelH - 84 : 236;
    if (unlocked) {
      const button = makeButton(this.actionLabel(node), panelW - pad * 2, accent, () => this.runNodeAction(node));
      button.position.set(pad, actionY);
      this.panelLayer.addChild(button);
    } else {
      const requiredName = node.requires ? this.nodeViews.get(node.requires)?.node.name ?? "an earlier world" : "an earlier world";
      const gate = new Graphics()
        .roundRect(pad, actionY, panelW - pad * 2, 46, 8)
        .fill({ color: COLORS.slate, alpha: 0.1 })
        .stroke({ color: COLORS.slate, alpha: 0.4, width: 1 });
      const gateText = label(`SEALED · clear ${requiredName}`, 10, COLORS.slate, "900");
      gateText.anchor.set(0.5);
      gateText.position.set(panelW / 2, actionY + 23);
      this.panelLayer.addChild(gate, gateText);
    }
  }

  private drawLegend(x: number, y: number, w: number) {
    const heading = label("LEGEND", 8, COLORS.slate, "900");
    heading.position.set(x, y);
    this.panelLayer.addChild(heading);
    const entries: NodeType[] = ["base", "outpost", "campaign", "boss", "locked"];
    entries.forEach((type, i) => {
      const meta = TYPE_META[type];
      const rowY = y + 20 + i * 26;
      const dot = new Graphics().circle(x + 7, rowY + 7, 7).fill({ color: meta.color, alpha: 0.75 });
      const text = label(`${meta.glyph}  ${meta.badge}`, 10, COLORS.white, "bold");
      text.anchor.set(0, 0.5);
      text.position.set(x + 22, rowY + 7);
      this.panelLayer.addChild(dot, text);
    });
    void w;
  }

  private actionLabel(node: MapNode): string {
    switch (node.type) {
      case "base":
        return "ENTER HOMEWORLD ►";
      case "outpost":
        return "MANAGE DOMAIN ►";
      case "boss":
        return "ASSAULT THE MAW ►";
      default:
        return "DEPLOY TO BATTLE ►";
    }
  }

  private runNodeAction(node: MapNode) {
    switch (node.type) {
      case "base":
        this.bus.emit("openoverlay", { view: "headquarters", label: "Homeworld Command" });
        return;
      case "outpost":
        this.bus.emit("openoverlay", { view: "domain", label: "Domain Control" });
        return;
      case "campaign":
      case "boss":
        this.bus.emit("battlelog", { message: `Deploying to ${node.name}` });
        this.switchScene("battle");
        return;
      default:
        return;
    }
  }

  // ---------- utilities ----------

  private isUnlocked(node: MapNode): boolean {
    return node.type !== "locked" && !node.requires;
  }

  private wrapText(text: string, size: number, fill: number, width: number): Text {
    return new Text({
      text,
      style: {
        fill,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: size,
        fontWeight: "bold",
        wordWrap: true,
        wordWrapWidth: width,
        lineHeight: size + 5,
      },
    });
  }
}
