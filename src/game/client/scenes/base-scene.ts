import { Application, Container } from "pixi.js";
import type { GameEventBus } from "../events";
import type { GameSceneId } from "../types";

export type SceneContext = {
  app: Application;
  bus: GameEventBus;
  switchScene: (scene: GameSceneId) => void;
};

export abstract class BaseScene {
  readonly container = new Container();
  protected readonly app: Application;
  protected readonly bus: GameEventBus;
  protected readonly switchScene: (scene: GameSceneId) => void;

  constructor(context: SceneContext) {
    this.app = context.app;
    this.bus = context.bus;
    this.switchScene = context.switchScene;
    this.container.sortableChildren = true;
  }

  abstract enter(): void;

  update(_deltaMS: number): void {}

  exit(): void {
    this.container.removeAllListeners();
    this.container.destroy({ children: true });
  }
}
