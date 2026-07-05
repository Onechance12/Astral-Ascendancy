"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createAstralGameClient, type AstralGameClient } from "@/game/client/create-game-client";

export default function AstralGameClientView() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<AstralGameClient | null>(null);
  const [scene, setScene] = useState("boot");
  const [message, setMessage] = useState("Game client initializing");

  useEffect(() => {
    let canceled = false;

    async function boot() {
      if (!hostRef.current) return;
      const client = await createAstralGameClient(hostRef.current);
      if (canceled) {
        client.destroy();
        return;
      }
      clientRef.current = client;
      client.bus.on("scenechange", ({ scene }) => {
        setScene(scene);
        setMessage(`Scene: ${scene}`);
      });
      client.bus.on("battlelog", ({ message }) => setMessage(message));
      client.bus.on("packopened", ({ rarity }) => setMessage(`${rarity} signal opened`));
    }

    void boot();

    return () => {
      canceled = true;
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#05070f] text-white">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="pointer-events-auto rounded-md border border-white/10 bg-black/45 px-3 py-2 text-xs font-black text-white/75 backdrop-blur transition hover:bg-white/10"
        >
          Exit
        </Link>
        <div className="rounded-md border border-cyan-300/20 bg-black/45 px-3 py-2 text-center backdrop-blur">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-200">Astral Client</p>
          <p className="mt-0.5 text-[10px] font-bold text-white/65">{message}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/45 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/55 backdrop-blur">
          {scene}
        </div>
      </div>
    </main>
  );
}
