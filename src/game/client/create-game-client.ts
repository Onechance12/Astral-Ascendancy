import { Application } from "pixi.js";
import { GameEventBus } from "./events";
import { SceneManager } from "./scene-manager";

export type AstralGameClient = {
  bus: GameEventBus;
  destroy: () => void;
};

export async function createAstralGameClient(host: HTMLElement): Promise<AstralGameClient> {
  const app = new Application();
  await app.init({
    resizeTo: host,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    preference: "webgl",
  });

  app.canvas.className = "h-full w-full touch-none";
  host.appendChild(app.canvas);

  const bus = new GameEventBus();
  const scenes = new SceneManager(app, bus);
  app.ticker.add((ticker) => scenes.update(ticker.deltaMS));
  scenes.switchTo("boot");

  return {
    bus,
    destroy: () => {
      scenes.destroy();
      app.destroy({ removeView: true }, { children: true });
    },
  };
}
