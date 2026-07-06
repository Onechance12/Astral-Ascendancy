"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGame } from "@/store/game-store";
import { cn } from "@/lib/utils";

type ResourceType = "plasma" | "biomass" | "crystals" | "tritium" | "quantumCores";
type Doctrine = "balanced" | "expansion" | "research" | "war" | "recovery";

type FacilityCost = {
  shards: number;
  resourceType: ResourceType;
  resourceAmount: number;
};

type Facility = {
  key: string;
  name: string;
  glyph: string;
  description: string;
  phaseUse: string;
  level: number;
  maxLevel: number;
  nextLevel: number | null;
  nextCost: FacilityCost | null;
  canAfford: boolean;
  resourceGlyph: string;
  resourceLabel: string;
};

type HeadquartersData = {
  headquarters: {
    id: string;
    name: string;
    homeworldName: string;
    homeworldType: string;
    doctrine: Doctrine;
    capitalLevel: number;
    morale: number;
    stability: number;
    alertLevel: string;
  };
  facilities: Facility[];
  capacities: {
    worldOperationSlots: number;
    recoveryBeds: number;
    trainingSlots: number;
    researchProjects: number;
    engineeringProjects: number;
    expeditionSlots: number;
    defenseRating: number;
  };
  resources: Record<ResourceType | "shards", number>;
  summary: {
    planetCount: number;
    activeOperations: number;
    readyOperations: number;
    doctrine: string;
    cardInstances: {
      total: number;
      available: number;
      busy: number;
      injured: number;
      recovering: number;
      assigned: number;
    };
  };
};

const RESOURCE_GLYPH: Record<ResourceType | "shards", string> = {
  shards: "◈",
  plasma: "☀",
  biomass: "☣",
  crystals: "◆",
  tritium: "⚗",
  quantumCores: "⬡",
};

const RESOURCE_COLOR: Record<ResourceType | "shards", string> = {
  shards: "#67e8f9",
  plasma: "#fbbf24",
  biomass: "#e879f9",
  crystals: "#22d3ee",
  tritium: "#fb923c",
  quantumCores: "#34d399",
};

const DOCTRINES: Array<{ key: Doctrine; label: string; desc: string }> = [
  { key: "balanced", label: "Balanced", desc: "Flexible growth" },
  { key: "expansion", label: "Expansion", desc: "Worlds and travel" },
  { key: "research", label: "Research", desc: "Science and unlocks" },
  { key: "war", label: "War", desc: "Training and defense" },
  { key: "recovery", label: "Recovery", desc: "Medical preservation" },
];

const HOMEWORLD_GLYPH: Record<string, string> = {
  star: "☀",
  organic: "☣",
  mineral: "◆",
  gas: "⚗",
  anomaly: "⬡",
  barren: "·",
};

export default function HeadquartersView() {
  const commander = useGame((s) => s.commander);
  const exitToHub = useGame((s) => s.exitToHub);
  const hydrateSession = useGame((s) => s.hydrateSession);
  const [data, setData] = useState<HeadquartersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/headquarters")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => setData(payload))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!commander) return null;

  const upgrade = async (facilityKey: string) => {
    setBusyKey(facilityKey);
    const res = await fetch("/api/headquarters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facilityKey }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error || "Upgrade unavailable");
      setBusyKey(null);
      return;
    }
    toast.success(`${payload.facility?.name || "Facility"} upgraded to level ${payload.newLevel}`);
    load();
    hydrateSession();
    setBusyKey(null);
  };

  const setDoctrine = async (doctrine: Doctrine) => {
    setBusyKey(`doctrine-${doctrine}`);
    const res = await fetch("/api/headquarters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctrine }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload.error || "Doctrine unavailable");
      setBusyKey(null);
      return;
    }
    toast.success("Doctrine updated");
    load();
    hydrateSession();
    setBusyKey(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={exitToHub} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10">
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Headquarters</p>
        <div className="w-[60px]" />
      </div>

      {loading ? (
        <p className="py-10 text-center text-xs text-muted-foreground">Opening homeworld channel...</p>
      ) : !data ? (
        <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-muted-foreground">Headquarters unavailable.</div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-black/45 p-4 sm:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 20% 0%, ${RESOURCE_COLOR[data.headquarters.homeworldType as ResourceType] || "#34d399"}22, transparent 45%)` }} />
            <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300/80">Homeworld Command</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
                    {HOMEWORLD_GLYPH[data.headquarters.homeworldType] || "◆"}
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-black sm:text-3xl">{data.headquarters.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{data.headquarters.homeworldName} · Capital Lv.{data.headquarters.capitalLevel}</p>
                  </div>
                </div>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-foreground/70">{data.summary.doctrine}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                <BaseMetric label="Morale" value={data.headquarters.morale} />
                <BaseMetric label="Stability" value={data.headquarters.stability} />
                <BaseMetric label="Alert" value={data.headquarters.alertLevel} />
                <BaseMetric label="Worlds" value={data.summary.planetCount} />
              </div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(["shards", "plasma", "biomass", "crystals", "tritium", "quantumCores"] as const).map((resource) => (
              <div key={resource} className="rounded-xl border border-white/10 bg-white/[0.025] p-2 text-center">
                <p className="text-base" style={{ color: RESOURCE_COLOR[resource] }}>{RESOURCE_GLYPH[resource]}</p>
                <p className="text-sm font-black tabular-nums" style={{ color: RESOURCE_COLOR[resource] }}>{data.resources[resource]}</p>
                <p className="text-[8px] uppercase tracking-wider text-muted-foreground">{resource === "quantumCores" ? "Quantum" : resource}</p>
              </div>
            ))}
          </section>

          <section className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Doctrine</p>
              <div className="mt-3 space-y-2">
                {DOCTRINES.map((doctrine) => (
                  <button
                    key={doctrine.key}
                    onClick={() => setDoctrine(doctrine.key)}
                    disabled={busyKey !== null || data.headquarters.doctrine === doctrine.key}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left transition",
                      data.headquarters.doctrine === doctrine.key
                        ? "border-emerald-400/40 bg-emerald-400/15"
                        : "border-white/10 bg-black/20 hover:bg-white/5",
                      busyKey !== null && "opacity-60"
                    )}
                  >
                    <p className="text-xs font-black">{doctrine.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{doctrine.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <BaseMetric label="Ops Slots" value={data.capacities.worldOperationSlots} />
                <BaseMetric label="Recovery" value={data.capacities.recoveryBeds} />
                <BaseMetric label="Training" value={data.capacities.trainingSlots} />
                <BaseMetric label="Defense" value={data.capacities.defenseRating} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.facilities.map((facility) => (
                <FacilityPanel
                  key={facility.key}
                  facility={facility}
                  busy={busyKey === facility.key}
                  locked={busyKey !== null && busyKey !== facility.key}
                  onUpgrade={() => upgrade(facility.key)}
                />
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Living Asset Readout</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              <BaseMetric label="Cards" value={data.summary.cardInstances.total} />
              <BaseMetric label="Available" value={data.summary.cardInstances.available} />
              <BaseMetric label="Busy" value={data.summary.cardInstances.busy} />
              <BaseMetric label="Assigned" value={data.summary.cardInstances.assigned} />
              <BaseMetric label="Injured" value={data.summary.cardInstances.injured} />
              <BaseMetric label="Ready Ops" value={data.summary.readyOperations} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function FacilityPanel({
  facility,
  busy,
  locked,
  onUpgrade,
}: {
  facility: Facility;
  busy: boolean;
  locked: boolean;
  onUpgrade: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">{facility.glyph}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-black">{facility.name}</p>
            <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-foreground/70">
              Lv.{facility.level}/{facility.maxLevel}
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{facility.description}</p>
        </div>
      </div>

      <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] leading-relaxed text-foreground/60">{facility.phaseUse}</p>

      {facility.nextCost ? (
        <Button
          onClick={onUpgrade}
          disabled={busy || locked || !facility.canAfford}
          className={cn(
            "mt-3 h-9 w-full text-xs font-black",
            facility.canAfford ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300" : "bg-white/5 text-muted-foreground hover:bg-white/5"
          )}
        >
          {busy ? "Upgrading..." : `Upgrade to Lv.${facility.nextLevel}`}
          <span className="ml-2 text-[10px] opacity-80">◈{facility.nextCost.shards} {facility.resourceGlyph}{facility.nextCost.resourceAmount}</span>
        </Button>
      ) : (
        <div className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-center text-xs font-bold text-amber-300">Current max reached</div>
      )}
    </div>
  );
}

function BaseMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">
      <p className="truncate text-sm font-black text-foreground">{value}</p>
      <p className="mt-0.5 truncate text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
