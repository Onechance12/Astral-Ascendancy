import { Container, Graphics } from "pixi.js";
import { BaseScene } from "./base-scene";
import { COLORS, label, makeButton } from "../pixi-ui";

const REVEALS = [
  { name: "Sector Surveyor", rarity: "Common", color: 0x94a3b8 },
  { name: "Carrion Bloom", rarity: "Uncommon", color: 0x34d399 },
  { name: "Hardlight Exoshell", rarity: "Rare", color: 0x22d3ee },
  { name: "Concord Arbiter", rarity: "Holo", color: 0xa78bfa },
  { name: "Ancient Terraformer", rarity: "Mythic", color: 0xfb923c },
];

export class PackOpeningScene extends BaseScene {
  private pack = new Container();
  private cardLayer = new Container();
  private phase: "idle" | "charging" | "burst" | "revealing" = "idle";
  private elapsed = 0;
  private revealCount = 0;

  enter(): void {
    this.draw();
  }

  update(deltaMS: number): void {
    this.elapsed += deltaMS;
    this.pack.rotation = Math.sin(this.elapsed * 0.008) * (this.phase === "charging" ? 0.11 : 0.025);
    this.pack.scale.set(1 + Math.sin(this.elapsed * 0.006) * (this.phase === "charging" ? 0.08 : 0.025));

    if (this.phase === "charging" && this.elapsed > 950) {
      this.phase = "burst";
      this.elapsed = 0;
      this.draw();
    } else if (this.phase === "burst" && this.elapsed > 520) {
      this.phase = "revealing";
      this.elapsed = 0;
      this.draw();
    } else if (this.phase === "revealing" && this.revealCount < REVEALS.length && this.elapsed > 430) {
      this.revealCount += 1;
      this.elapsed = 0;
      this.drawCards();
      if (this.revealCount === REVEALS.length) this.bus.emit("packopened", { rarity: "Mythic" });
    }
  }

  private draw() {
    this.container.removeChildren().forEach((child) => child.destroy({ children: true }));
    const { width, height } = this.app.screen;
    const title = label("SIGNAL PACK CHAMBER", 28, COLORS.white, "900");
    title.anchor.set(0.5);
    title.position.set(width / 2, 54);
    const back = makeButton("COMMAND", 140, COLORS.cyan, () => this.switchScene("mainMenu"));
    back.position.set(18, 18);
    this.container.addChild(title, back);

    const field = new Graphics()
      .circle(width / 2, height / 2, Math.min(width, height) * 0.3)
      .fill({ color: this.phase === "burst" ? COLORS.fuchsia : COLORS.cyan, alpha: this.phase === "burst" ? 0.18 : 0.08 });
    this.container.addChild(field);

    this.pack = this.createPack();
    this.pack.position.set(width / 2, height * 0.45);
    this.pack.eventMode = this.phase === "idle" ? "static" : "none";
    this.pack.cursor = "pointer";
    this.pack.on("pointertap", () => {
      this.phase = "charging";
      this.elapsed = 0;
      this.draw();
    });
    this.container.addChild(this.pack);

    const hint = label(this.phase === "idle" ? "Tap the pack to breach the signal" : this.phase === "charging" ? "Containment charging" : this.phase === "burst" ? "Signal breach" : "Cards resolving", 13, COLORS.cyan, "900");
    hint.anchor.set(0.5);
    hint.position.set(width / 2, height * 0.45 + 152);
    this.container.addChild(hint);

    this.cardLayer = new Container();
    this.container.addChild(this.cardLayer);
    this.drawCards();
  }

  private createPack() {
    const pack = new Container();
    const hot = this.phase === "charging" || this.phase === "burst";
    const body = new Graphics()
      .roundRect(-68, -96, 136, 192, 16)
      .fill({ color: 0x09111f, alpha: 0.94 })
      .stroke({ color: hot ? COLORS.fuchsia : COLORS.emerald, alpha: 0.85, width: 2 })
      .roundRect(-48, -70, 96, 118, 12)
      .fill({ color: hot ? COLORS.fuchsia : COLORS.emerald, alpha: hot ? 0.24 : 0.16 });
    const glyph = label("✦", 58, hot ? COLORS.fuchsia : COLORS.emerald, "900");
    glyph.anchor.set(0.5);
    glyph.y = -12;
    const copy = label("SIGNAL", 11, COLORS.white, "900");
    copy.anchor.set(0.5);
    copy.y = 66;
    pack.addChild(body, glyph, copy);
    return pack;
  }

  private drawCards() {
    this.cardLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    if (this.revealCount === 0) return;

    const { width, height } = this.app.screen;
    const cardW = Math.min(112, (width - 56) / 5);
    const cardH = cardW * 1.38;
    const total = REVEALS.length * cardW + 8 * (REVEALS.length - 1);
    const startX = (width - total) / 2;
    const y = height - cardH - 34;

    REVEALS.slice(0, this.revealCount).forEach((card, index) => {
      const node = new Container();
      node.position.set(startX + index * (cardW + 8), y);
      const bg = new Graphics()
        .roundRect(0, 0, cardW, cardH, 8)
        .fill({ color: 0x060914, alpha: 0.95 })
        .stroke({ color: card.color, alpha: 0.88, width: 2 })
        .roundRect(10, 12, cardW - 20, cardH * 0.5, 8)
        .fill({ color: card.color, alpha: 0.16 });
      const glyph = label("✦", Math.max(26, cardW * 0.34), card.color, "900");
      glyph.anchor.set(0.5);
      glyph.position.set(cardW / 2, cardH * 0.34);
      const name = label(card.name, 10, COLORS.white, "900");
      name.anchor.set(0.5);
      name.position.set(cardW / 2, cardH - 34);
      const rarity = label(card.rarity, 8, card.color, "900");
      rarity.anchor.set(0.5);
      rarity.position.set(cardW / 2, cardH - 18);
      node.addChild(bg, glyph, name, rarity);
      node.scale.set(0.88 + Math.min(0.12, this.elapsed / 3000));
      this.cardLayer.addChild(node);
    });
  }
}
