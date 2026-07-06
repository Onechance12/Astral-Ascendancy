import { Container, Graphics } from "pixi.js";
import { BaseScene } from "./base-scene";
import { COLORS, glowCircle, label, makeButton, roundedPanel } from "../pixi-ui";

export class MainMenuScene extends BaseScene {
  private stars: Container[] = [];
  private stations: Container[] = [];
  private time = 0;

  enter(): void {
    const { width, height } = this.app.screen;
    const compact = width < 480;
    this.drawStars(width, height);

    const bridgeGlow = glowCircle(Math.min(width, height) * 0.46, COLORS.cyan, 0.08);
    bridgeGlow.position.set(width * 0.5, height * 0.48);

    const commandTable = new Graphics()
      .ellipse(0, 0, Math.min(width * (compact ? 0.3 : 0.34), compact ? 130 : 250), Math.min(height * 0.12, compact ? 44 : 74))
      .fill({ color: 0x06111d, alpha: 0.88 })
      .stroke({ color: COLORS.cyan, alpha: 0.38, width: 2 })
      .ellipse(0, 0, Math.min(width * (compact ? 0.22 : 0.24), compact ? 92 : 175), Math.min(height * 0.07, compact ? 30 : 48))
      .stroke({ color: COLORS.gold, alpha: 0.32, width: 1 });
    commandTable.position.set(width * 0.5, height * 0.48);

    const commander = new Container();
    const commanderWidth = compact ? 104 : 140;
    const commanderHeight = compact ? 142 : 174;
    const commanderBody = new Graphics()
      .roundRect(-commanderWidth / 2, -commanderHeight / 2, commanderWidth, commanderHeight, 16)
      .fill({ color: 0x120d1f, alpha: 0.88 })
      .stroke({ color: COLORS.gold, alpha: 0.6, width: 2 })
      .circle(0, compact ? -26 : -32, compact ? 28 : 34)
      .fill({ color: COLORS.gold, alpha: 0.22 })
      .circle(0, compact ? -26 : -32, compact ? 12 : 15)
      .fill({ color: COLORS.gold, alpha: 0.7 });
    const commanderName = label("COMMANDER", compact ? 8 : 10, COLORS.gold, "900");
    commanderName.anchor.set(0.5);
    commanderName.y = compact ? 34 : 46;
    const commanderStatus = label("BRIDGE ONLINE", compact ? 7 : 8, COLORS.slate, "bold");
    commanderStatus.anchor.set(0.5);
    commanderStatus.y = compact ? 48 : 62;
    commander.addChild(commanderBody, commanderName, commanderStatus);
    commander.position.set(width * 0.5, height * (compact ? 0.34 : 0.36));

    const title = label("ASTRAL ASCENDANCY", compact ? Math.max(24, width * 0.065) : Math.min(40, Math.max(24, width * 0.05)), COLORS.white, "900");
    title.anchor.set(0.5);
    title.position.set(width / 2, Math.max(compact ? 72 : 66, height * 0.11));
    const subtitle = label("Command bridge", 13, COLORS.cyan, "900");
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, title.y + (compact ? 28 : 34));

    const stationDefs = [
      { label: "BATTLE", detail: "5x5 live board", x: 0.5, y: compact ? 0.67 : 0.64, color: COLORS.emerald, action: () => this.switchScene("battle") },
      { label: "GALAXY", detail: "campaign planets", x: compact ? 0.23 : 0.23, y: compact ? 0.40 : 0.39, color: COLORS.cyan, action: () => this.switchScene("galaxyMap") },
      { label: "PACKS", detail: "signal breach", x: compact ? 0.77 : 0.77, y: compact ? 0.40 : 0.39, color: COLORS.fuchsia, action: () => this.switchScene("packOpening") },
      { label: "VAULT", detail: "collection", x: compact ? 0.2 : 0.2, y: compact ? 0.59 : 0.62, color: COLORS.gold, action: () => this.openOverlay("collection", "Holographic Vault") },
      { label: "HOME", detail: "headquarters", x: compact ? 0.8 : 0.8, y: compact ? 0.59 : 0.62, color: COLORS.emerald, action: () => this.openOverlay("headquarters", "Homeworld Command") },
      { label: "DOMAIN", detail: "world ops", x: compact ? 0.29 : 0.34, y: compact ? 0.8 : 0.77, color: COLORS.cyan, action: () => this.openOverlay("domain", "Domain Control") },
      { label: "PVP", detail: "ranked queues", x: compact ? 0.71 : 0.66, y: compact ? 0.8 : 0.77, color: COLORS.rose, action: () => this.openOverlay("multiplayer", "PvP War Room") },
    ];

    const connectionLayer = new Graphics();
    for (const station of stationDefs) {
      connectionLayer
        .moveTo(width * 0.5, height * 0.48)
        .lineTo(width * station.x, height * station.y)
        .stroke({ color: station.color, alpha: 0.18, width: 2 });
    }

    const stations = stationDefs.map((station) => {
      const node = this.createStation(station.label, station.detail, station.color, station.action, compact);
      node.position.set(width * station.x, height * station.y);
      this.stations.push(node);
      return node;
    });

    const dockWidth = Math.min(460, width - 24);
    const dock = roundedPanel(dockWidth, compact ? 46 : 54, 0x050814, 0.7, COLORS.cyan);
    dock.position.set((width - dockWidth) / 2, height - (compact ? 58 : 72));
    const dockText = label(compact ? "Select station. Battle opens the 5x5 prototype." : "Select a station. Battle is now the 5x5 Pixi prototype.", compact ? 9 : 11, COLORS.slate, "bold");
    dockText.anchor.set(0.5);
    dockText.position.set(width / 2, dock.y + (compact ? 23 : 27));

    this.container.addChild(bridgeGlow, connectionLayer, commandTable, commander, title, subtitle, ...stations, dock, dockText);
  }

  update(deltaMS: number): void {
    this.time += deltaMS * 0.001;
    for (const [index, star] of this.stars.entries()) {
      star.y += (0.18 + (index % 5) * 0.035) * deltaMS * 0.06;
      star.alpha = 0.35 + Math.sin(this.time * 1.4 + index) * 0.18;
      if (star.y > this.app.screen.height + 10) star.y = -10;
    }
    this.stations.forEach((station, index) => {
      station.scale.set(1 + Math.sin(this.time * 1.7 + index) * 0.018);
      station.rotation = Math.sin(this.time * 1.1 + index) * 0.01;
    });
  }

  private drawStars(width: number, height: number) {
    for (let index = 0; index < 90; index++) {
      const star = new Container();
      const dot = new Graphics().circle(0, 0, index % 7 === 0 ? 1.8 : 1).fill({ color: COLORS.white, alpha: 0.7 });
      star.addChild(dot);
      star.position.set((index * 97) % width, (index * 53) % height);
      this.stars.push(star);
      this.container.addChild(star);
    }
  }

  private createStation(labelText: string, detailText: string, color: number, onTap: () => void, compact = false) {
    const station = new Container();
    const outerRadius = compact ? 32 : 42;
    const innerRadius = compact ? 19 : 25;
    const outer = new Graphics()
      .circle(0, 0, outerRadius)
      .fill({ color, alpha: 0.08 })
      .stroke({ color, alpha: 0.52, width: 2 })
      .circle(0, 0, innerRadius)
      .fill({ color: 0x050814, alpha: 0.94 })
      .stroke({ color, alpha: 0.75, width: 1 });
    const core = new Graphics().circle(0, 0, compact ? 6 : 8).fill({ color, alpha: 0.88 });
    const name = label(labelText, compact ? 8 : 10, COLORS.white, "900");
    name.anchor.set(0.5);
    name.y = compact ? 41 : 54;
    station.addChild(outer, core, name);
    if (!compact) {
      const detail = label(detailText, 8, COLORS.slate, "bold");
      detail.anchor.set(0.5);
      detail.y = 68;
      station.addChild(detail);
    }
    station.eventMode = "static";
    station.cursor = "pointer";
    station.on("pointertap", onTap);
    station.on("pointerover", () => {
      outer.alpha = 1;
      station.scale.set(1.06);
      this.bus.emit("battlelog", { message: `${labelText} selected` });
    });
    station.on("pointerout", () => {
      outer.alpha = 0.92;
      station.scale.set(1);
    });
    return station;
  }

  private openOverlay(
    view: "hub" | "deckbuilder" | "profile" | "multiplayer" | "collection" | "campaign" | "operations" | "domain" | "headquarters" | "codex",
    labelText: string
  ) {
    this.bus.emit("openoverlay", { view, label: labelText });
    this.bus.emit("battlelog", { message: `${labelText} opening` });
  }
}
