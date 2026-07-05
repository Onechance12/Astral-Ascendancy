import type { Metadata } from "next";
import AstralGameClientView from "@/components/game-client/astral-game-client";

export const metadata: Metadata = {
  title: "Play Astral Ascendancy",
  description: "Fullscreen PixiJS game client for Astral Ascendancy.",
};

export default function PlayPage() {
  return <AstralGameClientView />;
}
