import { Container, Graphics } from "pixi.js";
import { BaseScene, type SceneContext } from "./base-scene";
import { COLORS, label, makeButton, roundedPanel } from "../pixi-ui";

type ResultMode = "victory" | "defeat";

export class ResultScene extends BaseScene {
  private elapsed = 0;
  private readonly particles: Array<{ node: Graphics; speed: number; drift: number }> = [];
  private readonly mode: ResultMode;
  private core: Container | null = null;
  private ring: Graphics | null = null;

  constructor(context: SceneContext, mode: ResultMode) {
    super(context);
    this.mode = mode;
  }

  enter(): void {
    const { width, height } = this.app.screen;
    const win = this.mode === "victory";
    const accent = win ? COLORS.emerald : COLORS.rose;

    const bg = new Graphics().rect(0, 0, width, height).fill({ color: COLORS.bg });
    const wash = new Graphics()
      .circle(width * 0.5, height * 0.35, Math.max(width, height) * 0.42)
      .fill({ color: accent, alpha: 0.12 })
      .circle(width * 0.78, height * 0.74, Math.max(width, height) * 0.26)
      .fill({ color: win ? COLORS.cyan : COLORS.fuchsia, alpha: 0.1 });

    this.container.addChild(bg, wash);
    this.createParticles(width, height, accent);

    this.ring = new Graphics()
      .circle(width / 2, height * 0.34, Math.min(width, height) * 0.22)
      .stroke({ color: accent, alpha: 0.48, width: 2 });
    this.container.addChild(this.ring);

    this.core = new Container();
    this.core.position.set(width / 2, height * 0.34);
    const coreGlow = new Graphics()
      .circle(0, 0, 82)
      .fill({ color: accent, alpha: 0.16 })
      .circle(0, 0, 46)
      .fill({ color: accent, alpha: 0.28 })
      .stroke({ color: accent, alpha: 0.85, width: 2 });
    const glyph = label(win ? "✦" : "◆", 58, accent, "900");
    glyph.anchor.set(0.5);
    this.core.addChild(coreGlow, glyph);
    this.container.addChild(this.core);

    const title = label(win ? "VICTORY" : "DEFEAT", width < 520 ? 40 : 56, accent, "900");
    title.anchor.set(0.5);
    title.position.set(width / 2, height * 0.5);
    const subtitle = label(
      win ? "Ascendancy signal secured. Rewards are transmitting." : "Sector line broken. Recover, train, and return.",
      14,
      COLORS.slate,
      "bold"
    );
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, height * 0.5 + 42);

    const panelWidth = Math.min(520, width - 32);
    const panel = new Container();
    panel.position.set(width / 2 - panelWidth / 2, height * 0.5 + 76);
    panel.addChild(roundedPanel(panelWidth, 112, COLORS.panel, 0.68, accent));

    const report = label(win ? "SHARDS  +50     SEASON XP  +100     PACK PRESSURE  ARMED" : "LESSON RECORDED     MEDICAL REVIEW ADVISED     TRAINING QUEUE OPEN", 13, COLORS.white, "900");
    report.anchor.set(0.5);
    report.position.set(panelWidth / 2, 35);
    const hint = label("Next phase: detailed reward payloads, card portraits, and server-fed result data.", 11, COLORS.slate, "bold");
    hint.anchor.set(0.5);
    hint.position.set(panelWidth / 2, 68);
    panel.addChild(report, hint);

    const rematch = makeButton("Battle Again", 150, COLORS.emerald, () => this.switchScene("battle"));
    rematch.position.set(width / 2 - 160, height - 92);
    const command = makeButton("Command", 150, COLORS.cyan, () => this.switchScene("mainMenu"));
    command.position.set(width / 2 + 10, height - 92);

    this.container.addChild(title, subtitle, panel, rematch, command);
  }

  update(deltaMS: number): void {
    this.elapsed += deltaMS;
    const t = this.elapsed / 1000;
    if (this.core) this.core.scale.set(1 + Math.sin(t * 2.8) * 0.035);
    if (this.ring) {
      this.ring.rotation += deltaMS * 0.00035;
      this.ring.alpha = 0.38 + Math.sin(t * 2) * 0.12;
    }
    for (const particle of this.particles) {
      particle.node.y -= particle.speed * deltaMS;
      particle.node.x += Math.sin(t * particle.drift) * 0.18;
      if (particle.node.y < -12) particle.node.y = this.app.screen.height + 12;
    }
  }

  private createParticles(width: number, height: number, accent: number) {
    for (let index = 0; index < 72; index++) {
      const size = 1 + Math.random() * 2.5;
      const particle = new Graphics()
        .circle(0, 0, size)
        .fill({ color: index % 5 === 0 ? accent : COLORS.white, alpha: index % 5 === 0 ? 0.42 : 0.26 });
      particle.position.set(Math.random() * width, Math.random() * height);
      this.particles.push({ node: particle, speed: 0.006 + Math.random() * 0.025, drift: 1 + Math.random() * 3 });
      this.container.addChild(particle);
    }
  }
}
