import type { Metadata } from "next";
import FiveByFivePrototype from "@/components/game/five-by-five-prototype";

export const metadata: Metadata = {
  title: "Play Astral Ascendancy",
  description: "Fullscreen 5x5 living-board prototype for Astral Ascendancy.",
};

export default function PlayPage() {
  return <FiveByFivePrototype />;
}
