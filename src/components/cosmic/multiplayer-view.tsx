"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/store/game-store";
import { FACTIONS } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { analyzeDeckPower, PVP_DECK_TIERS, type PvpDeckTier, type PvpQueueType } from "@/lib/pvp";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FACTION_COLOR: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.accent])
);
const FACTION_GLYPH: Record<string, string> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f.glyph])
);

const QUEUES: Array<{
  id: PvpQueueType;
  label: string;
  desc: string;
  ranked: boolean;
}> = [
  { id: "ranked", label: "Ranked Ascendancy", desc: "Tier-locked ladder. Rank proves skill inside deck power.", ranked: true },
  { id: "unranked", label: "Unranked Battle", desc: "Casual testing with deck-power matching and wider search.", ranked: false },
  { id: "friendly", label: "Friendly Duel", desc: "Invite friends with open power, tier caps, draft, or experimental rules.", ranked: false },
  { id: "event", label: "Event Queue", desc: "Rotating formats like Starter-only, no relics, faction wars, or Open War.", ranked: false },
];

export default function MultiplayerView() {
  const commander = useGame((s) => s.commander);
  const decks = useGame((s) => s.decks);
  const activeDeckId = useGame((s) => s.activeDeckId);
  const exitToHub = useGame((s) => s.exitToHub);
  const setView = useGame((s) => s.setView);
  const [queueType, setQueueType] = useState<PvpQueueType>("ranked");
  const [tierCap, setTierCap] = useState<PvpDeckTier | "auto">("auto");
  const [queueing, setQueueing] = useState(false);

  const activeDeck = decks.find((deck) => deck.id === activeDeckId) ?? decks[0];
  const power = useMemo(
    () => analyzeDeckPower(activeDeck?.cardDefIds ?? []),
    [activeDeck?.cardDefIds]
  );
  const requestedTier = tierCap === "auto" ? power.tier : tierCap;
  const f = commander ? FACTIONS.find((x) => x.id === commander.factionId) : null;
  const color = commander ? FACTION_COLOR[commander.factionId] : "#22d3ee";
  const illegal = tierCap !== "auto" && power.illegalFor.includes(tierCap);

  if (!commander) return null;

  const enterQueue = async () => {
    if (!activeDeck) {
      toast.error("Build a battle deck first");
      setView("deckbuilder");
      return;
    }
    if (activeDeck.cardDefIds.length < 10) {
      toast.error("PvP decks need at least 10 cards");
      setView("deckbuilder");
      return;
    }
    if (queueType === "friendly" || queueType === "training") {
      toast.message("Friendly invites and training simulations are planned for the next PvP UI pass.");
      return;
    }

    setQueueing(true);
    try {
      const res = await fetch("/api/pvp/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: activeDeck.id,
          queueType,
          requestedTier,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.validation?.errors?.[0] || data.error || "Could not enter queue");
        return;
      }
      toast.success(`${QUEUES.find((queue) => queue.id === queueType)?.label} queue created`);
    } catch {
      toast.error("Could not reach PvP queue");
    } finally {
      setQueueing(false);
    }
  };

  const cancelQueue = async () => {
    try {
      await fetch("/api/pvp/queue", { method: "DELETE" });
      toast.success("Queue canceled");
    } catch {
      toast.error("Could not cancel queue");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={exitToHub}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10"
        >
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          PvP Command
        </p>
        <div className="w-[60px]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">Battle Deck</p>
                <h2 className="mt-1 text-xl font-black" style={{ color }}>
                  {activeDeck?.name ?? "No Battle Deck"}
                </h2>
                <p className="mt-1 text-sm text-foreground/65">
                  Power comes from card progression. Matchmaking controls where that power belongs.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Deck Power</p>
                <p className="text-2xl font-black text-emerald-300">{power.score}</p>
                <p className="text-xs font-bold text-foreground/70">{power.tierName}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {power.reasons.slice(0, 3).map((reason) => (
                <div key={reason} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground/70">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {QUEUES.map((queue) => {
              const active = queueType === queue.id;
              return (
                <button
                  key={queue.id}
                  onClick={() => setQueueType(queue.id)}
                  className={cn(
                    "min-h-[112px] rounded-xl border p-4 text-left transition",
                    active ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-black/20 hover:border-white/25"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-foreground">{queue.label}</p>
                    <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold", queue.ranked ? "bg-amber-300 text-amber-950" : "bg-white/10 text-foreground/70")}>
                      {queue.ranked ? "RANK" : "OPEN"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-snug text-foreground/65">{queue.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Tier Protocol</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <TierButton label="Auto" active={tierCap === "auto"} onClick={() => setTierCap("auto")} />
                  {PVP_DECK_TIERS.map((tier) => (
                    <TierButton
                      key={tier.id}
                      label={tier.name}
                      active={tierCap === tier.id}
                      disabled={power.illegalFor.includes(tier.id)}
                      onClick={() => setTierCap(tier.id)}
                    />
                  ))}
                </div>
                {illegal && (
                  <p className="mt-2 text-xs text-rose-300">
                    This deck is too powerful for the selected lower tier. Build a capped deck for that bracket.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelQueue} className="border-white/15 bg-white/5">
                  Cancel
                </Button>
                <Button
                  onClick={enterQueue}
                  disabled={queueing || illegal || !activeDeck}
                  className="bg-emerald-400 px-5 font-bold text-emerald-950 hover:bg-emerald-300"
                >
                  {queueing ? "Entering…" : "Enter Queue"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-2xl" style={{ color }}>
                {FACTION_GLYPH[commander.factionId]}
              </div>
              <div>
                <p className="text-sm font-black" style={{ color }}>{commander.name}</p>
                <p className="text-xs text-muted-foreground">{f?.name ?? commander.factionId}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Metric label="Wins" value={commander.wins} />
              <Metric label="Losses" value={commander.losses} />
              <Metric label="Decks" value={decks.length} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Friends</p>
            <h3 className="mt-1 font-black text-foreground">Online allies and direct duels</h3>
            <p className="mt-2 text-xs leading-snug text-foreground/65">
              Friend requests, direct challenges, recent opponents, and spectate hooks now have server endpoints.
            </p>
            <Button variant="outline" className="mt-3 w-full border-white/15 bg-white/5" onClick={() => toast.message("Friends panel API is ready; full UI is next.")}>
              Open Friends
            </Button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Tribes</p>
            <h3 className="mt-1 font-black text-foreground">Guilds for faction war</h3>
            <p className="mt-2 text-xs leading-snug text-foreground/65">
              Tribes support founders, roles, contribution, faction banners, missions, and future tribe wars.
            </p>
            <Button variant="outline" className="mt-3 w-full border-white/15 bg-white/5" onClick={() => toast.message("Tribe create/list API is ready; tribe hall UI is next.")}>
              Tribe Hall
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TierButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border px-2.5 py-1 text-[10px] font-bold transition",
        active ? "border-emerald-300 bg-emerald-300 text-emerald-950" : "border-white/10 bg-black/20 text-foreground/70 hover:border-white/25",
        disabled && "cursor-not-allowed opacity-35"
      )}
    >
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 px-2 py-2">
      <p className="text-lg font-black text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
