import { Container, Graphics, Text } from "pixi.js";

export const COLORS = {
  bg: 0x05070f,
  panel: 0x0b1020,
  cyan: 0x22d3ee,
  emerald: 0x34d399,
  gold: 0xfbbf24,
  rose: 0xfb7185,
  fuchsia: 0xd946ef,
  white: 0xffffff,
  slate: 0x94a3b8,
};

export function label(text: string, size: number, fill = COLORS.white, weight: "normal" | "bold" | "900" = "bold") {
  return new Text({
    text,
    style: {
      fill,
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: size,
      fontWeight: weight,
      letterSpacing: 0,
    },
  });
}

export function roundedPanel(width: number, height: number, color = COLORS.panel, alpha = 0.72, stroke = COLORS.cyan) {
  return new Graphics()
    .roundRect(0, 0, width, height, 8)
    .fill({ color, alpha })
    .stroke({ color: stroke, alpha: 0.28, width: 1 });
}

export function glowCircle(radius: number, color: number, alpha = 0.25) {
  return new Graphics()
    .circle(0, 0, radius)
    .fill({ color, alpha });
}

export function makeButton(text: string, width: number, accent: number, onTap: () => void) {
  const button = new Container();
  const bg = new Graphics()
    .roundRect(0, 0, width, 46, 8)
    .fill({ color: accent, alpha: 0.18 })
    .stroke({ color: accent, alpha: 0.75, width: 1 });
  const copy = label(text, 13, COLORS.white, "900");
  copy.anchor.set(0.5);
  copy.position.set(width / 2, 23);
  button.addChild(bg, copy);
  button.eventMode = "static";
  button.cursor = "pointer";
  button.on("pointertap", onTap);
  button.on("pointerover", () => {
    bg.alpha = 1;
    button.scale.set(1.025);
  });
  button.on("pointerout", () => {
    bg.alpha = 0.86;
    button.scale.set(1);
  });
  return button;
}
