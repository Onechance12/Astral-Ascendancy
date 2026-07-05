"use client";

import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { useMatchSocket } from "@/lib/use-match-socket";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

export default function MultiplayerView() {
  const commander = useGame((s) => s.commander);
  const decks = useGame((s) => s.decks);
  const activeDeckId = useGame((s) => s.activeDeckId);
  const exitToHub = useGame((s) => s.exitToHub);
  const setView = useGame((s) => s.setView);
  const { state, queue, cancelQueue } = useMatchSocket();

  if (!commander) return null;

  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const deckIds = activeDeck?.cardDefIds || [];

  const onQueue = () => {
    if (deckIds.length < 10) {
      toast.error("Build & activate a deck first (min 10 cards)");
      setView("deckbuilder");
      return;
    }
    queue(commander.name, commander.factionId, deckIds);
  };

  const f = FACTIONS.find((x) => x.id === commander.factionId)!;
  const color = FACTION_COLOR[commander.factionId];

  return (
    <div className="mx-auto w-full max-w-2xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={exitToHub}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Multiplayer
        </p>
        <div className="w-[60px]" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        {/* status indicator */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-white/[0.03]">
          {state.status === "queueing" ? (
            <span className="animate-spin text-3xl text-amber-300">◉</span>
          ) : state.status === "matched" ? (
            <span className="text-4xl text-emerald-300">⚔</span>
          ) : state.status === "opponent-left" ? (
            <span className="text-3xl text-rose-300">⚠</span>
          ) : (
            <span className="text-3xl text-foreground/40">✦</span>
          )}
        </div>

        {state.status === "idle" && (
          <>
            <h2 className="text-xl font-bold">Find a Live Opponent</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-foreground/70">
              Queue up to be matched against another Commander in the Cluster.
              {deckIds.length < 10 && (
                <span className="mt-2 block text-amber-300">
                  ⚠ You need an active deck (min 10 cards) to queue.
                </span>
              )}
            </p>
            <Button
              onClick={onQueue}
              className="mt-5 bg-emerald-400 px-6 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-300"
            >
              Enter the Queue
            </Button>
          </>
        )}

        {state.status === "queueing" && (
          <>
            <h2 className="animate-pulse text-xl font-bold text-amber-300">
              Searching the Cluster…
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Waiting for an opponent. This usually takes a few seconds.
            </p>
            <Button
              onClick={cancelQueue}
              variant="outline"
              className="mt-5 border-white/15 bg-white/5"
            >
              Cancel
            </Button>
          </>
        )}

        {state.status === "matched" && state.opponent && (
          <>
            <h2 className="text-xl font-bold text-emerald-300">Opponent Found!</h2>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: `${color}22`, color }}
                >
                  {FACTION_GLYPH[commander.factionId]}
                </div>
                <p className="mt-1.5 text-xs font-bold" style={{ color }}>
                  {commander.name}
                </p>
                <p className="text-[10px] text-muted-foreground">You</p>
              </div>
              <span className="text-2xl text-muted-foreground">vs</span>
              <div className="text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: `${FACTION_COLOR[state.opponent.factionId]}22`, color: FACTION_COLOR[state.opponent.factionId] }}
                >
                  {FACTION_GLYPH[state.opponent.factionId]}
                </div>
                <p className="mt-1.5 text-xs font-bold" style={{ color: FACTION_COLOR[state.opponent.factionId] }}>
                  {state.opponent.commanderName}
                </p>
                <p className="text-[10px] text-muted-foreground">Opponent</p>
              </div>
            </div>
            <p className="mt-5 text-xs text-amber-300/80">
              Live peer-to-peer match sync is being finalized — you'll be able to
              start the match in the next build.
            </p>
          </>
        )}

        {state.status === "opponent-left" && (
          <>
            <h2 className="text-xl font-bold text-rose-300">Opponent Disconnected</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Your opponent left the match. Return to the hub or queue again.
            </p>
            <Button
              onClick={() => exitToHub()}
              className="mt-5 bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
            >
              Return to Hub
            </Button>
          </>
        )}
      </div>

      {/* info */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 text-center text-xs">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="font-bold text-foreground">Beta</p>
          <p className="text-muted-foreground">Matchmaking live · peer-sync WIP</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="font-bold text-foreground">Port 3003</p>
          <p className="text-muted-foreground">socket.io mini-service</p>
        </div>
      </div>
    </div>
  );
}
