"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAstralGameClient, type AstralGameClient } from "@/game/client/create-game-client";
import { useGame, type View } from "@/store/game-store";

type OverlayView = Exclude<View, "landing" | "game">;

export default function AstralGameClientView() {
  const router = useRouter();
  const setView = useGame((s) => s.setView);
  const commander = useGame((s) => s.commander);
  const hydrateSession = useGame((s) => s.hydrateSession);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<AstralGameClient | null>(null);
  const [scene, setScene] = useState("boot");
  const [message, setMessage] = useState("Game client initializing");
  const [overlayPrompt, setOverlayPrompt] = useState<{ view: OverlayView; label: string } | null>(null);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

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
        setOverlayPrompt(null);
      });
      client.bus.on("battlelog", ({ message }) => setMessage(message));
      client.bus.on("packopened", ({ rarity }) => setMessage(`${rarity} signal opened`));
      client.bus.on("openoverlay", ({ view, label }) => {
        setOverlayPrompt({ view, label });
        setMessage(`${label} ready`);
      });
    }

    void boot();

    return () => {
      canceled = true;
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, []);

  const openLegacyView = (view: OverlayView) => {
    setView(view);
    router.push("/");
  };

  return (
    <main suppressHydrationWarning className="relative h-dvh w-full overflow-hidden bg-[#05070f] text-white">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:p-3 sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="pointer-events-auto rounded-md border border-white/10 bg-black/45 px-2.5 py-1.5 text-[10px] font-black text-white/75 backdrop-blur transition hover:bg-white/10 sm:px-3 sm:py-2 sm:text-xs"
        >
          Exit
        </Link>
        <div className="hidden min-w-0 rounded-md border border-cyan-300/20 bg-black/45 px-3 py-2 text-center backdrop-blur sm:block">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-200">Astral Client</p>
          <p className="mt-0.5 max-w-[48vw] truncate text-[10px] font-bold text-white/65">
            {commander ? `${commander.name} · ${message}` : message}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/45 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white/55 backdrop-blur sm:px-3 sm:py-2 sm:text-[10px]">
          {scene}
        </div>
      </div>

      {overlayPrompt && (
        <div className="absolute inset-x-3 bottom-3 z-20 mx-auto max-w-md rounded-xl border border-cyan-300/25 bg-black/70 p-3 text-white shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">Bridge Station</p>
              <p className="mt-1 truncate text-sm font-black">{overlayPrompt.label}</p>
              <p className="mt-0.5 text-[11px] text-white/55">Temporary React command surface while this station becomes a native game scene.</p>
            </div>
            <button
              onClick={() => openLegacyView(overlayPrompt.view)}
              className="shrink-0 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-cyan-950 transition hover:bg-cyan-200"
            >
              Open
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
