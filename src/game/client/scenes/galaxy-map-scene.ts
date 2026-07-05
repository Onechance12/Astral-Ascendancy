import { Container, Graphics } from "pixi.js";
import { BaseScene } from "./base-scene";
import { COLORS, label, makeButton } from "../pixi-ui";

const PLANETS = [
  { x: 0.22, y: 0.34, r: 24, color: COLORS.gold, name: "Helios Prime", state: "Faction Base" },
  { x: 0.48, y: 0.52, r: 18, color: COLORS.cyan, name: "Virell Gate", state: "Campaign Node" },
  { x: 0.68, y: 0.31, r: 28, color: COLORS.fuchsia, name: "The Maw", state: "Boss World" },
  { x: 0.78, y: 0.68, r: 16, color: COLORS.emerald, name: "Verdant Relay", state: "Locked" },
];

export class GalaxyMapScene extends BaseScene {
  private planetNodes: Container[] = [];
  private time = 0;

  enter(): void {
    const { width, height } = this.app.screen;
    const title = label("GALAXY WAR MAP", 30, COLORS.white, "900");
    title.anchor.set(0.5);
    title.position.set(width / 2, 54);
    const subtitle = label("Light Three.js planet rendering lands here next. Pixi owns the game shell now.", 12, COLORS.slate, "bold");
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, 86);
    const back = makeButton("COMMAND", 140, COLORS.cyan, () => this.switchScene("mainMenu"));
    back.position.set(18, 18);

    const lane = new Graphics();
    lane.moveTo(width * 0.22, height * 0.34)
      .lineTo(width * 0.48, height * 0.52)
      .lineTo(width * 0.68, height * 0.31)
      .lineTo(width * 0.78, height * 0.68)
      .stroke({ color: COLORS.cyan, alpha: 0.25, width: 2 });

    this.container.addChild(lane, title, subtitle, back);

    for (const planet of PLANETS) {
      const node = this.createPlanet(planet.name, planet.state, planet.r, planet.color);
      node.position.set(width * planet.x, height * planet.y);
      this.planetNodes.push(node);
      this.container.addChild(node);
    }
  }

  update(deltaMS: number): void {
    this.time += deltaMS * 0.001;
    this.planetNodes.forEach((planet, index) => {
      planet.rotation += (index % 2 === 0 ? 1 : -1) * deltaMS * 0.00018;
      planet.scale.set(1 + Math.sin(this.time * 1.7 + index) * 0.025);
    });
  }

  private createPlanet(name: string, state: string, radius: number, color: number) {
    const node = new Container();
    const aura = new Graphics().circle(0, 0, radius * 1.9).fill({ color, alpha: 0.09 });
    const ring = new Graphics().ellipse(0, 0, radius * 1.55, radius * 0.45).stroke({ color, alpha: 0.45, width: 2 });
    const body = new Graphics().circle(0, 0, radius).fill({ color, alpha: 0.7 }).stroke({ color: COLORS.white, alpha: 0.3, width: 1 });
    const planetName = label(name, 12, COLORS.white, "900");
    planetName.anchor.set(0.5);
    planetName.y = radius + 20;
    const planetState = label(state, 9, COLORS.slate, "bold");
    planetState.anchor.set(0.5);
    planetState.y = radius + 36;
    node.addChild(aura, ring, body, planetName, planetState);
    node.eventMode = "static";
    node.cursor = "pointer";
    node.on("pointertap", () => this.switchScene("battle"));
    return node;
  }
}
