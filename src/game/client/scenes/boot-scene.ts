import { Container, Graphics } from "pixi.js";
import { BaseScene } from "./base-scene";
import { COLORS, label } from "../pixi-ui";

export class BootScene extends BaseScene {
  private elapsed = 0;
  private timer: number | null = null;

  enter(): void {
    const { width, height } = this.app.screen;
    const root = new Container();
    root.position.set(width / 2, height / 2);

    const ring = new Graphics()
      .circle(0, 0, 82)
      .stroke({ color: COLORS.cyan, alpha: 0.45, width: 2 })
      .circle(0, 0, 46)
      .stroke({ color: COLORS.gold, alpha: 0.5, width: 1 });
    const title = label("ASTRAL ASCENDANCY", 22, COLORS.white, "900");
    title.anchor.set(0.5);
    const status = label("Booting game client", 11, COLORS.cyan, "bold");
    status.anchor.set(0.5);
    status.y = 34;

    root.addChild(ring, title, status);
    this.container.addChild(root);
    this.timer = window.setTimeout(() => this.switchScene("preload"), 700);
  }

  update(deltaMS: number): void {
    this.elapsed += deltaMS;
    this.container.rotation += deltaMS * 0.00008;
  }

  exit(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    super.exit();
  }
}
