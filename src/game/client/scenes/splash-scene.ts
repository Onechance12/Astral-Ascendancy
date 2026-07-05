import { Graphics } from "pixi.js";
import { BaseScene, type SceneContext } from "./base-scene";
import { COLORS, label, makeButton } from "../pixi-ui";
import type { GameSceneId } from "../types";

export class SplashScene extends BaseScene {
  private elapsed = 0;
  private readonly next: GameSceneId;
  private timer: number | null = null;

  constructor(context: SceneContext, private readonly title: string, private readonly body: string, next: GameSceneId) {
    super(context);
    this.next = next;
  }

  enter(): void {
    const { width, height } = this.app.screen;
    const pulse = new Graphics()
      .circle(width / 2, height / 2, Math.min(width, height) * 0.24)
      .fill({ color: COLORS.cyan, alpha: 0.08 });
    const title = label(this.title, 34, COLORS.white, "900");
    title.anchor.set(0.5);
    title.position.set(width / 2, height / 2 - 18);
    const body = label(this.body, 13, COLORS.slate, "bold");
    body.anchor.set(0.5);
    body.position.set(width / 2, height / 2 + 24);
    const button = makeButton(this.next === "mainMenu" ? "Return To Command" : "Continue", 190, COLORS.emerald, () => this.switchScene(this.next));
    button.position.set(width / 2 - 95, height / 2 + 72);
    this.container.addChild(pulse, title, body, button);
    if (this.title === "PRELOAD") this.timer = window.setTimeout(() => this.switchScene(this.next), 650);
  }

  update(deltaMS: number): void {
    this.elapsed += deltaMS;
    this.container.alpha = Math.min(1, 0.4 + this.elapsed / 600);
  }

  exit(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    super.exit();
  }
}
