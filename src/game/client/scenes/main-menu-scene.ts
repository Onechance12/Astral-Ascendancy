import { Container, Graphics } from "pixi.js";
import { BaseScene } from "./base-scene";
import { COLORS, glowCircle, label, makeButton, roundedPanel } from "../pixi-ui";

export class MainMenuScene extends BaseScene {
  private stars: Container[] = [];
  private time = 0;

  enter(): void {
    const { width, height } = this.app.screen;
    this.drawStars(width, height);

    const glow = glowCircle(Math.min(width, height) * 0.34, COLORS.cyan, 0.09);
    glow.position.set(width * 0.5, height * 0.46);

    const commander = new Graphics()
      .roundRect(-86, -96, 172, 192, 18)
      .fill({ color: 0x120d1f, alpha: 0.86 })
      .stroke({ color: COLORS.gold, alpha: 0.58, width: 2 })
      .circle(0, -28, 38)
      .fill({ color: COLORS.gold, alpha: 0.22 })
      .circle(0, -28, 18)
      .fill({ color: COLORS.gold, alpha: 0.68 });
    commander.position.set(width * 0.5, height * 0.42);

    const title = label("ASTRAL ASCENDANCY", Math.min(42, Math.max(25, width * 0.052)), COLORS.white, "900");
    title.anchor.set(0.5);
    title.position.set(width / 2, Math.max(74, height * 0.14));
    const subtitle = label("Cosmic war client online", 13, COLORS.cyan, "bold");
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, title.y + 40);

    const dockWidth = Math.min(620, width - 28);
    const dock = roundedPanel(dockWidth, 86, 0x050814, 0.78, COLORS.cyan);
    dock.position.set((width - dockWidth) / 2, height - 112);
    const buttons = [
      makeButton("BATTLE", 132, COLORS.emerald, () => this.switchScene("battle")),
      makeButton("GALAXY", 132, COLORS.cyan, () => this.switchScene("galaxyMap")),
      makeButton("PACKS", 132, COLORS.fuchsia, () => this.switchScene("packOpening")),
      makeButton("COLLECTION", 132, COLORS.gold, () => this.bus.emit("battlelog", { message: "React collection overlay will mount here." })),
    ];
    buttons.forEach((button, index) => {
      button.position.set(dock.x + 18 + index * ((dockWidth - 36) / buttons.length), dock.y + 20);
    });

    this.container.addChild(glow, commander, title, subtitle, dock, ...buttons);
  }

  update(deltaMS: number): void {
    this.time += deltaMS * 0.001;
    for (const [index, star] of this.stars.entries()) {
      star.y += (0.18 + (index % 5) * 0.035) * deltaMS * 0.06;
      star.alpha = 0.35 + Math.sin(this.time * 1.4 + index) * 0.18;
      if (star.y > this.app.screen.height + 10) star.y = -10;
    }
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
}
