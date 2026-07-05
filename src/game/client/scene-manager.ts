import { Application } from "pixi.js";
import { GameEventBus } from "./events";
import type { BaseScene } from "./scenes/base-scene";
import { BattleScene } from "./scenes/battle-scene";
import { BootScene } from "./scenes/boot-scene";
import { GalaxyMapScene } from "./scenes/galaxy-map-scene";
import { MainMenuScene } from "./scenes/main-menu-scene";
import { PackOpeningScene } from "./scenes/pack-opening-scene";
import { SplashScene } from "./scenes/splash-scene";
import type { GameSceneId } from "./types";

export class SceneManager {
  private current: BaseScene | null = null;

  constructor(
    private readonly app: Application,
    private readonly bus: GameEventBus
  ) {}

  switchTo(sceneId: GameSceneId) {
    if (this.current) {
      this.app.stage.removeChild(this.current.container);
      this.current.exit();
    }

    this.current = this.createScene(sceneId);
    this.app.stage.addChild(this.current.container);
    this.current.enter();
    this.bus.emit("scenechange", { scene: sceneId });
  }

  update(deltaMS: number) {
    this.current?.update(deltaMS);
  }

  destroy() {
    if (!this.current) return;
    this.app.stage.removeChild(this.current.container);
    this.current.exit();
    this.current = null;
  }

  private createScene(sceneId: GameSceneId): BaseScene {
    const context = {
      app: this.app,
      bus: this.bus,
      switchScene: (next: GameSceneId) => this.switchTo(next),
    };

    if (sceneId === "boot") return new BootScene(context);
    if (sceneId === "preload") return new SplashScene(context, "PRELOAD", "Charging star lanes...", "mainMenu");
    if (sceneId === "mainMenu") return new MainMenuScene(context);
    if (sceneId === "galaxyMap") return new GalaxyMapScene(context);
    if (sceneId === "battle") return new BattleScene(context);
    if (sceneId === "packOpening") return new PackOpeningScene(context);
    if (sceneId === "victory") return new SplashScene(context, "VICTORY", "Ascendancy signal secured.", "mainMenu");
    return new SplashScene(context, "DEFEAT", "The sector collapses. Rebuild and return.", "mainMenu");
  }
}
