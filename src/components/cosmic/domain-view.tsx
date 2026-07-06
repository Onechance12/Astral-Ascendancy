"use client";

import { useEffect, useState, useCallback } from "react";
import { useGame } from "@/store/game-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ResourceType = "plasma" | "biomass" | "crystals" | "tritium" | "quantumCores";

type Planet = {
  id: string;
  name: string;
  planetType: string;
  planetTypeName: string;
  planetGlyph: string;
  planetColor: string;
  planetDesc: string;
  sector: string;
  slot: number;
  structureType: string | null;
  structureLevel: number;
  structureName: string | null;
  structureGlyph: string | null;
  structureColor: string | null;
  productionRate: number;
  productionResource: ResourceType | null;
  validStructureType: string | null;
  validStructureName: string | null;
  crewCardDefId: string | null;
  crewName: string | null;
  crewBonus: string | null;
  sourceCardDefId: string | null;
  nextLevelCost: { shards: number; resource: number; resourceType: ResourceType } | null;
};

type WorldOperationType = "gather" | "survey" | "scout" | "secure";

type WorldOperationDef = {
  type: WorldOperationType;
  title: string;
  verb: string;
  durationMinutes: number;
  description: string;
  eligibleCategories: string[];
  requiresStructure?: boolean;
};

type WorldOperation = {
  id: string;
  type: WorldOperationType;
  title: string;
  status: "active" | "ready" | string;
  cardDefId: string | null;
  cardInstanceId: string | null;
  cardName: string | null;
  planetId: string | null;
  planetName: string | null;
  planetType: string | null;
  description: string | null;
  rewards: Record<string, number | { licenseId: string; amount: number } | undefined>;
  startedAt: string;
  completesAt: string;
};

type OperationCard = {
  id: string;
  defId: string;
  name: string;
  category: string;
  rarity: string;
  level: number;
  condition: string;
  eligibleOperations: WorldOperationType[];
};

type WorldOperationsData = {
  definitions: Record<WorldOperationType, WorldOperationDef>;
  operations: WorldOperation[];
  eligibleCards: OperationCard[];
};

type StructureContainer = {
  id: string;
  planetId: string;
  planetName: string;
  planetType: string;
  type: string;
  name: string;
  glyph: string;
  color: string;
  resourceType: ResourceType | null;
  level: number;
  status: string;
  integrity: number;
  maxIntegrity: number;
  capacity: number;
  occupied: number;
  description: string;
  stationedCards: StructureCard[];
};

type StructureCard = {
  id: string;
  defId: string;
  name: string;
  category: string;
  rarity: string;
  level: number;
  condition: string;
};

type StructureContainerData = {
  structures: StructureContainer[];
  eligibleCards: StructureCard[];
};

type WorldCard = {
  defId: string;
  name: string;
  category: string;
  rarity: string;
  description: string;
  flavor?: string;
  planetType?: string;
  startingStructureLevel?: number;
  effect?: { type: string; target?: string; value: number };
  bonus?: { type: string; value: number };
  count: number;
  activated?: boolean;
};

type DomainData = {
  planets: Planet[];
  resources: Record<ResourceType | "shards", number>;
  pending: Partial<Record<ResourceType, number>>;
  lastHarvest: string;
  developments: { defId: string; name: string; description: string }[];
  ownedPlanetCards: WorldCard[];
  ownedDevelopmentCards: WorldCard[];
  ownedCrewCards: WorldCard[];
  maxStructureLevel: number;
};

const RESOURCE_GLYPH: Record<string, string> = {
  plasma: "☀",
  biomass: "☣",
  crystals: "◆",
  tritium: "⚗",
  quantumCores: "⬡",
  shards: "◈",
};
const RESOURCE_COLOR: Record<string, string> = {
  plasma: "#fbbf24",
  biomass: "#e879f9",
  crystals: "#22d3ee",
  tritium: "#fb923c",
  quantumCores: "#34d399",
  shards: "#67e8f9",
};
const RESOURCE_LABEL: Record<string, string> = {
  plasma: "Plasma",
  biomass: "Biomass",
  crystals: "Crystals",
  tritium: "Tritium",
  quantumCores: "Quantum",
  shards: "Shards",
};

const RARITY_COLOR: Record<string, string> = {
  Common: "#94a3b8",
  Uncommon: "#34d399",
  Rare: "#22d3ee",
  Holo: "#a78bfa",
  Mythic: "#fb923c",
  Singularity: "#e879f9",
};

export default function DomainView() {
  const commander = useGame((s) => s.commander);
  const exitToHub = useGame((s) => s.exitToHub);
  const hydrateSession = useGame((s) => s.hydrateSession);
  const [data, setData] = useState<DomainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(false);
  const [activeTab, setActiveTab] = useState<"planets" | "operations" | "structures" | "cards">("planets");
  const [worldOps, setWorldOps] = useState<WorldOperationsData | null>(null);
  const [structureData, setStructureData] = useState<StructureContainerData | null>(null);
  const [operationBusy, setOperationBusy] = useState(false);
  const [structureBusy, setStructureBusy] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/domain").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/world-operations").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/structure-containers").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([domainData, operationData, containerData]) => {
        setData(domainData);
        setWorldOps(operationData);
        setStructureData(containerData);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const harvest = async () => {
    setHarvesting(true);
    const res = await fetch("/api/domain/harvest", { method: "POST" });
    if (res.ok) {
      const d = await res.json();
      const gained = d.gained || {};
      const totalGained = Object.entries(gained).map(([k, v]) => `${RESOURCE_GLYPH[k]} +${v}`).join("  ") || "nothing yet";
      toast.success(`Harvested: ${totalGained}`);
      load();
      hydrateSession();
    }
    setHarvesting(false);
  };

  const upgrade = async (planetId: string) => {
    const res = await fetch("/api/domain/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planetId }),
    });
    if (res.ok) {
      const d = await res.json();
      toast.success(`Structure upgraded to level ${d.newLevel}!`);
      load();
      hydrateSession();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Cannot build");
    }
  };

  const deployPlanet = async (defId: string) => {
    const res = await fetch("/api/domain/deploy-planet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defId }),
    });
    if (res.ok) {
      toast.success("Planet deployed!");
      load();
      hydrateSession();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Cannot deploy");
    }
  };

  const activateDev = async (defId: string) => {
    const res = await fetch("/api/domain/activate-development", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defId }),
    });
    if (res.ok) {
      toast.success("Development activated!");
      load();
      hydrateSession();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Cannot activate");
    }
  };

  const assignCrew = async (planetId: string, crewDefId: string) => {
    const res = await fetch("/api/domain/assign-crew", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planetId, crewCardDefId: crewDefId }),
    });
    if (res.ok) {
      toast.success("Crew assigned!");
      load();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Cannot assign crew");
    }
  };

  const startWorldOperation = async (planetId: string, type: WorldOperationType, cardInstanceId: string) => {
    if (!cardInstanceId) {
      toast.error("Choose a card to send");
      return;
    }
    setOperationBusy(true);
    const res = await fetch("/api/world-operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planetId, type, cardInstanceId }),
    });
    if (res.ok) {
      const d = await res.json();
      toast.success(`${d.assignment?.title || "World operation"} launched`);
      load();
      hydrateSession();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Cannot start operation");
    }
    setOperationBusy(false);
  };

  const claimWorldOperation = async (assignmentId: string) => {
    setOperationBusy(true);
    const res = await fetch("/api/world-operations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, action: "claim" }),
    });
    if (res.ok) {
      toast.success("World operation rewards claimed");
      load();
      hydrateSession();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Operation is not ready");
    }
    setOperationBusy(false);
  };

  const stationCard = async (structureId: string, cardInstanceId: string) => {
    if (!cardInstanceId) {
      toast.error("Choose a card to station");
      return;
    }
    setStructureBusy(true);
    const res = await fetch("/api/structure-containers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structureId, cardInstanceId }),
    });
    if (res.ok) {
      toast.success("Card stationed in structure");
      load();
      hydrateSession();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Cannot station card");
    }
    setStructureBusy(false);
  };

  const unstationCard = async (cardInstanceId: string) => {
    setStructureBusy(true);
    const res = await fetch("/api/structure-containers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unstation", cardInstanceId }),
    });
    if (res.ok) {
      toast.success("Card returned to collection");
      load();
      hydrateSession();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Cannot remove card");
    }
    setStructureBusy(false);
  };

  if (!commander) return null;

  const totalPending = data ? Object.values(data.pending).reduce((s, v) => s + (v || 0), 0) : 0;
  const hasWorldCards = data && (data.ownedPlanetCards.length > 0 || data.ownedDevelopmentCards.length > 0 || data.ownedCrewCards.length > 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={exitToHub} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-white/10">
          ← Hub
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Your Domain</p>
        <button
          onClick={harvest}
          disabled={harvesting || totalPending === 0}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition",
            totalPending > 0
              ? "bg-emerald-400 text-emerald-950 animate-pulse hover:bg-emerald-300"
              : "border border-white/10 bg-white/5 text-foreground/50"
          )}
        >
          {harvesting ? "…" : "⚡ Harvest"}
          {totalPending > 0 && (
            <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] tabular-nums">{totalPending}</span>
          )}
        </button>
      </div>

      {/* resource bar */}
      {data && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(["shards", "plasma", "biomass", "crystals", "tritium", "quantumCores"] as const).map((r) => {
            const amount = data.resources[r] || 0;
            const pending = data.pending[r as ResourceType] || 0;
            return (
              <div key={r} className="relative rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-center" style={{ boxShadow: `inset 0 0 16px ${RESOURCE_COLOR[r]}10` }}>
                <span className="text-base" style={{ color: RESOURCE_COLOR[r] }}>{RESOURCE_GLYPH[r]}</span>
                <p className="mt-0.5 text-sm font-black tabular-nums" style={{ color: RESOURCE_COLOR[r] }}>{amount}</p>
                <p className="text-[8px] uppercase tracking-wider text-muted-foreground">{RESOURCE_LABEL[r]}</p>
                {pending > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[8px] font-bold text-emerald-950">+{pending}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* tab switcher: planets / operations / world cards */}
      <div className="mb-3 grid grid-cols-4 rounded-lg border border-white/10 bg-black/30 p-0.5 text-xs">
        <button onClick={() => setActiveTab("planets")} className={cn("flex-1 rounded-md py-1.5 font-bold transition", activeTab === "planets" ? "bg-emerald-400 text-emerald-950" : "text-foreground/60")}>
          🪐 Planets ({data?.planets.length || 0})
        </button>
        <button onClick={() => setActiveTab("operations")} className={cn("flex-1 rounded-md py-1.5 font-bold transition", activeTab === "operations" ? "bg-emerald-400 text-emerald-950" : "text-foreground/60")}>
          ⚔ Ops ({worldOps?.operations.length || 0})
        </button>
        <button onClick={() => setActiveTab("structures")} className={cn("flex-1 rounded-md py-1.5 font-bold transition", activeTab === "structures" ? "bg-emerald-400 text-emerald-950" : "text-foreground/60")}>
          ▣ Structures ({structureData?.structures.length || 0})
        </button>
        <button onClick={() => setActiveTab("cards")} className={cn("flex-1 rounded-md py-1.5 font-bold transition", activeTab === "cards" ? "bg-emerald-400 text-emerald-950" : "text-foreground/60")}>
          🃏 World Cards ({(data?.ownedPlanetCards.length || 0) + (data?.ownedDevelopmentCards.length || 0) + (data?.ownedCrewCards.length || 0)})
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Scanning sector…</p>
      ) : activeTab === "planets" ? (
        /* PLANETS TAB */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.planets.map((p) => (
            <PlanetCard key={p.id} planet={p} onUpgrade={upgrade} onAssignCrew={assignCrew} ownedCrewCards={data?.ownedCrewCards || []} resources={data?.resources || {} as any} maxLevel={data?.maxStructureLevel || 5} />
          ))}
        </div>
      ) : activeTab === "operations" ? (
        <WorldOperationsPanel
          planets={data?.planets || []}
          worldOps={worldOps}
          busy={operationBusy}
          onStart={startWorldOperation}
          onClaim={claimWorldOperation}
        />
      ) : activeTab === "structures" ? (
        <StructureContainersPanel
          data={structureData}
          busy={structureBusy}
          onStation={stationCard}
          onUnstation={unstationCard}
        />
      ) : (
        /* WORLD CARDS TAB */
        <div className="space-y-4">
          {/* Planet cards */}
          {data && data.ownedPlanetCards.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-300/70">🪐 Planet Cards — deploy to claim new planets</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {data.ownedPlanetCards.map((c) => (
                  <WorldCardItem key={c.defId} card={c} actionLabel="Deploy" actionIcon="🚀" onAction={() => deployPlanet(c.defId)} />
                ))}
              </div>
            </div>
          )}
          {/* Development cards */}
          {data && data.ownedDevelopmentCards.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300/70">⚡ Development Cards — activate for permanent boosts</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {data.ownedDevelopmentCards.map((c) => (
                  <WorldCardItem key={c.defId} card={c} actionLabel={c.activated ? "Activated" : "Activate"} actionIcon="⚡" onAction={() => activateDev(c.defId)} disabled={c.activated} />
                ))}
              </div>
            </div>
          )}
          {/* Crew cards */}
          {data && data.ownedCrewCards.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300/70">👥 Crew Cards — assign to planets from the Planets tab</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {data.ownedCrewCards.map((c) => (
                  <WorldCardItem key={c.defId} card={c} actionLabel="Owned" actionIcon="👥" onAction={() => {}} disabled actionColor="text-muted-foreground" />
                ))}
              </div>
            </div>
          )}
          {data && !hasWorldCards && (
            <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-muted-foreground">
              No world cards yet. Open packs or win matches to find planet, development, and crew cards!
            </div>
          )}
        </div>
      )}

      {/* active developments */}
      {data && data.developments.length > 0 && (
        <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300/70">Active Developments</p>
          <div className="flex flex-wrap gap-2">
            {data.developments.map((d) => (
              <span key={d.defId} className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-300">
                ⚡ {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* info */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-muted-foreground">
        <p className="mb-1 font-bold text-foreground/70">⚡ How it works</p>
        <p>Build structures on planets to passively generate resources. Deploy planet cards to claim new worlds. Send exact card copies on timed world operations. Assigned cards become unavailable until they return. Resources are needed to craft faction cards.</p>
      </div>
    </div>
  );
}

function StructureContainersPanel({
  data,
  busy,
  onStation,
  onUnstation,
}: {
  data: StructureContainerData | null;
  busy: boolean;
  onStation: (structureId: string, cardInstanceId: string) => void;
  onUnstation: (cardInstanceId: string) => void;
}) {
  if (!data) {
    return <p className="py-8 text-center text-xs text-muted-foreground">Scanning structure interiors...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300/80">Structure Containers</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Built structures are now real places. Station living card copies inside them to prepare future production, repair, research, and defense systems.
        </p>
      </div>

      {data.structures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-muted-foreground">
          No built structures yet. Build a planet structure first, then it becomes a stationable container.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {data.structures.map((structure) => (
            <StructureContainerCard
              key={structure.id}
              structure={structure}
              eligibleCards={data.eligibleCards}
              busy={busy}
              onStation={onStation}
              onUnstation={onUnstation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StructureContainerCard({
  structure,
  eligibleCards,
  busy,
  onStation,
  onUnstation,
}: {
  structure: StructureContainer;
  eligibleCards: StructureCard[];
  busy: boolean;
  onStation: (structureId: string, cardInstanceId: string) => void;
  onUnstation: (cardInstanceId: string) => void;
}) {
  const [selectedCardId, setSelectedCardId] = useState("");
  const effectiveSelectedCardId = eligibleCards.some((card) => card.id === selectedCardId)
    ? selectedCardId
    : eligibleCards[0]?.id || "";
  const isFull = structure.occupied >= structure.capacity;
  const integrityPct = Math.max(0, Math.min(100, (structure.integrity / Math.max(1, structure.maxIntegrity)) * 100));

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3" style={{ boxShadow: `inset 0 0 24px ${structure.color}10` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl" style={{ color: structure.color }}>
          {structure.glyph}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black" style={{ color: structure.color }}>{structure.name}</p>
              <p className="text-[10px] text-muted-foreground">{structure.planetName} · Lv.{structure.level} · {structure.status}</p>
            </div>
            <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-foreground/70">
              {structure.occupied}/{structure.capacity}
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{structure.description}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[9px] text-muted-foreground">
          <span>Integrity</span>
          <span>{structure.integrity}/{structure.maxIntegrity}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
          <div className="h-full rounded-full" style={{ width: `${integrityPct}%`, background: structure.color }} />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {structure.stationedCards.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-2 py-2 text-center text-[10px] text-muted-foreground">No cards stationed</p>
        ) : (
          structure.stationedCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black">{card.name}</p>
                <p className="text-[9px] text-muted-foreground">Lv.{card.level} · {card.rarity} · {card.category}</p>
              </div>
              <button
                onClick={() => onUnstation(card.id)}
                disabled={busy}
                className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[9px] font-bold text-foreground/60 hover:bg-white/10 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 space-y-2">
        <select
          value={effectiveSelectedCardId}
          onChange={(event) => setSelectedCardId(event.target.value)}
          disabled={isFull || eligibleCards.length === 0}
          className="w-full rounded-lg border border-white/10 bg-black/50 px-2 py-2 text-xs text-foreground outline-none disabled:opacity-50"
        >
          {eligibleCards.length === 0 ? (
            <option value="">No eligible available cards</option>
          ) : (
            eligibleCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} · Lv.{card.level} · {card.rarity} · {card.category}
              </option>
            ))
          )}
        </select>
        <button
          onClick={() => onStation(structure.id, effectiveSelectedCardId)}
          disabled={busy || isFull || !effectiveSelectedCardId}
          className="w-full rounded-lg bg-cyan-400/20 px-3 py-2 text-xs font-black text-cyan-300 transition hover:bg-cyan-400/30 disabled:bg-white/5 disabled:text-muted-foreground"
        >
          {isFull ? "Structure Full" : "Station Card"}
        </button>
      </div>
    </div>
  );
}

function WorldOperationsPanel({
  planets,
  worldOps,
  busy,
  onStart,
  onClaim,
}: {
  planets: Planet[];
  worldOps: WorldOperationsData | null;
  busy: boolean;
  onStart: (planetId: string, type: WorldOperationType, cardInstanceId: string) => void;
  onClaim: (assignmentId: string) => void;
}) {
  const activeByPlanet = new Map((worldOps?.operations || []).map((operation) => [operation.planetId, operation]));
  const defs = worldOps?.definitions;

  if (!worldOps || !defs) {
    return <p className="py-8 text-center text-xs text-muted-foreground">Opening command channels...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/80">World Operations</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Pick a world, send a real available card, and let it work while the rest of your collection keeps moving.
          That card is locked until the operation returns.
        </p>
      </div>

      {worldOps.eligibleCards.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-muted-foreground">
          No available operation cards. Claim completed assignments or recover busy cards before launching another world task.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {planets.map((planet) => {
          const active = activeByPlanet.get(planet.id);
          return (
            <WorldOperationPlanet
              key={planet.id}
              planet={planet}
              active={active}
              definitions={defs}
              cards={worldOps.eligibleCards}
              busy={busy}
              onStart={onStart}
              onClaim={onClaim}
            />
          );
        })}
      </div>
    </div>
  );
}

function WorldOperationPlanet({
  planet,
  active,
  definitions,
  cards,
  busy,
  onStart,
  onClaim,
}: {
  planet: Planet;
  active?: WorldOperation;
  definitions: Record<WorldOperationType, WorldOperationDef>;
  cards: OperationCard[];
  busy: boolean;
  onStart: (planetId: string, type: WorldOperationType, cardInstanceId: string) => void;
  onClaim: (assignmentId: string) => void;
}) {
  const [selectedType, setSelectedType] = useState<WorldOperationType>("gather");
  const filteredCards = cards.filter((card) => card.eligibleOperations.includes(selectedType));
  const [selectedCardId, setSelectedCardId] = useState("");
  const effectiveSelectedCardId = filteredCards.some((card) => card.id === selectedCardId)
    ? selectedCardId
    : filteredCards[0]?.id || "";
  const selectedDef = definitions[selectedType];

  const timeLeft = active ? formatTimeLeft(active.completesAt) : "";
  const rewardText = active ? formatRewardText(active.rewards) : "";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${planet.planetColor}22`, color: planet.planetColor }}>
          {planet.planetGlyph}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{planet.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {planet.planetTypeName} · {planet.structureName ? `${planet.structureName} Lv.${planet.structureLevel}` : "no structure"}
          </p>
        </div>
      </div>

      {active ? (
        <div className={cn("mt-3 rounded-lg border p-3", active.status === "ready" ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-black/20")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black text-foreground">{active.title}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {active.cardName || active.cardDefId} · {active.status === "ready" ? "Ready" : timeLeft}
              </p>
            </div>
            {active.status === "ready" ? (
              <button
                onClick={() => onClaim(active.id)}
                disabled={busy}
                className="shrink-0 rounded-lg bg-emerald-400 px-2.5 py-1.5 text-[10px] font-black text-emerald-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                Claim
              </button>
            ) : (
              <span className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold text-muted-foreground">{timeLeft}</span>
            )}
          </div>
          {rewardText && <p className="mt-2 text-[10px] font-bold text-emerald-300">{rewardText}</p>}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(definitions) as WorldOperationType[]).map((type) => {
              const def = definitions[type];
              const disabled = def.requiresStructure && !planet.structureName;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  disabled={disabled}
                  className={cn(
                    "rounded-lg border px-2 py-1.5 text-[10px] font-bold transition",
                    selectedType === type ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-200" : "border-white/10 bg-white/5 text-foreground/60 hover:bg-white/10",
                    disabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  {def.verb}
                </button>
              );
            })}
          </div>

          <p className="min-h-8 text-[10px] leading-relaxed text-muted-foreground">{selectedDef.description}</p>

          <select
            value={effectiveSelectedCardId}
            onChange={(event) => setSelectedCardId(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-2 py-2 text-xs text-foreground outline-none"
          >
            {filteredCards.length === 0 ? (
              <option value="">No eligible available cards</option>
            ) : (
              filteredCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} · Lv.{card.level} · {card.rarity} · {card.category}
                </option>
              ))
            )}
          </select>

          <button
            onClick={() => onStart(planet.id, selectedType, effectiveSelectedCardId)}
            disabled={busy || !effectiveSelectedCardId}
            className="w-full rounded-lg bg-emerald-400/20 px-3 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-400/30 disabled:bg-white/5 disabled:text-muted-foreground"
          >
            Launch {selectedDef.verb} · {selectedDef.durationMinutes}m
          </button>
        </div>
      )}
    </div>
  );
}

function formatTimeLeft(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "ready";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.ceil((ms % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatRewardText(rewards: WorldOperation["rewards"]) {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(rewards)) {
    if (typeof value !== "number" || value <= 0) continue;
    parts.push(`${RESOURCE_GLYPH[key] || "◈"} +${value}`);
  }
  return parts.join("  ");
}

function PlanetCard({
  planet,
  onUpgrade,
  onAssignCrew,
  ownedCrewCards,
  resources,
  maxLevel,
}: {
  planet: Planet;
  onUpgrade: (id: string) => void;
  onAssignCrew: (planetId: string, crewDefId: string) => void;
  ownedCrewCards: WorldCard[];
  resources: Record<string, number>;
  maxLevel: number;
}) {
  const hasStructure = planet.structureLevel > 0;
  const canUpgrade = planet.nextLevelCost !== null && planet.planetType !== "barren";
  const isBarren = planet.planetType === "barren";
  const isMaxLevel = planet.structureLevel >= maxLevel;
  const [showCrewPicker, setShowCrewPicker] = useState(false);

  const canAfford = planet.nextLevelCost
    ? resources.shards >= planet.nextLevelCost.shards &&
      resources[planet.nextLevelCost.resourceType] >= planet.nextLevelCost.resource
    : false;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition",
        hasStructure ? "border-white/15 bg-white/[0.03]" : "border-white/10 bg-white/[0.02]",
        isBarren && "opacity-50"
      )}
      style={hasStructure && planet.structureColor ? { boxShadow: `inset 0 0 24px ${planet.structureColor}10` } : undefined}
    >
      {/* planet header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${planet.planetColor}22`, color: planet.planetColor }}>
          {planet.planetGlyph}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{planet.name}</p>
          <p className="text-[10px] text-muted-foreground">{planet.planetTypeName}</p>
        </div>
        {hasStructure && (
          <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-foreground/70">Lv.{planet.structureLevel}</span>
        )}
      </div>

      {/* structure or build prompt */}
      {hasStructure ? (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg" style={{ color: planet.structureColor || "#fff" }}>{planet.structureGlyph}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold" style={{ color: planet.structureColor || "#fff" }}>{planet.structureName}</p>
              <p className="text-[10px] text-muted-foreground">+{planet.productionRate}/hr {RESOURCE_GLYPH[planet.productionResource || "plasma"]}</p>
            </div>
          </div>
          {/* crew assignment */}
          {planet.crewName ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-emerald-400/10 px-2 py-1">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-emerald-300">👥 {planet.crewName}</p>
                <p className="truncate text-[9px] text-muted-foreground">{planet.crewBonus}</p>
              </div>
              <button onClick={() => setShowCrewPicker(!showCrewPicker)} className="shrink-0 text-[9px] text-foreground/50 hover:text-foreground">change</button>
            </div>
          ) : (
            <button
              onClick={() => setShowCrewPicker(!showCrewPicker)}
              className="mt-2 w-full rounded-md border border-dashed border-white/15 px-2 py-1 text-[10px] text-foreground/50 hover:bg-white/5"
            >
              + Assign crew
            </button>
          )}
          {showCrewPicker && (
            <div className="mt-1.5 space-y-1">
              {ownedCrewCards.length === 0 ? (
                <p className="text-[9px] text-muted-foreground">No crew cards owned</p>
              ) : (
                ownedCrewCards.map((c) => (
                  <button
                    key={c.defId}
                    onClick={() => { onAssignCrew(planet.id, c.defId); setShowCrewPicker(false); }}
                    className="flex w-full items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-left text-[9px] hover:bg-white/10"
                  >
                    <span className="font-bold text-emerald-300">{c.name}</span>
                    <span className="truncate text-muted-foreground">{c.description}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : isBarren ? (
        <div className="mt-3 rounded-lg border border-dashed border-white/10 p-2.5 text-center text-[11px] text-muted-foreground">Barren — cannot build</div>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-white/15 p-2.5 text-center">
          <p className="text-[11px] text-muted-foreground">Can build:</p>
          <p className="text-xs font-bold" style={{ color: planet.planetColor }}>{planet.validStructureName}</p>
        </div>
      )}

      {/* upgrade button */}
      {canUpgrade && !isMaxLevel && (
        <button
          onClick={() => onUpgrade(planet.id)}
          disabled={!canAfford}
          className={cn("mt-3 w-full rounded-lg px-3 py-2 text-xs font-bold transition", canAfford ? "bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30" : "bg-white/5 text-muted-foreground")}
        >
          {hasStructure ? `Upgrade to Lv.${planet.structureLevel + 1}` : "Build Structure"}
          {planet.nextLevelCost && (
            <span className="ml-1.5 text-[10px] opacity-80">◈{planet.nextLevelCost.shards} + {RESOURCE_GLYPH[planet.nextLevelCost.resourceType]}{planet.nextLevelCost.resource}</span>
          )}
        </button>
      )}
      {isMaxLevel && (
        <div className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-center text-xs font-bold text-amber-300">★ Max Level</div>
      )}
    </div>
  );
}

function WorldCardItem({
  card,
  actionLabel,
  actionIcon,
  onAction,
  disabled,
  actionColor,
}: {
  card: WorldCard;
  actionLabel: string;
  actionIcon: string;
  onAction: () => void;
  disabled?: boolean;
  actionColor?: string;
}) {
  const rarityColor = RARITY_COLOR[card.rarity] || "#94a3b8";
  return (
    <div className="relative overflow-hidden rounded-lg border-2 bg-card/60" style={{ borderColor: `${rarityColor}66` }}>
      <div className="aspect-[4/3] w-full" style={{ background: `${rarityColor}15` }}>
        <div className="flex h-full w-full items-center justify-center text-3xl" style={{ color: rarityColor }}>
          {card.category === "planet" ? "🪐" : card.category === "development" ? "⚡" : "👥"}
        </div>
      </div>
      <div className="p-2">
        <p className="truncate text-[10px] font-bold" style={{ color: rarityColor }}>{card.name}</p>
        <p className="text-[8px] uppercase tracking-wide text-muted-foreground">{card.rarity}</p>
        <p className="mt-1 line-clamp-2 text-[8px] leading-tight text-muted-foreground">{card.description}</p>
        {card.count > 1 && (
          <span className="absolute left-1 top-1 rounded bg-emerald-400 px-1 text-[8px] font-bold text-emerald-950">×{card.count}</span>
        )}
        <button
          onClick={onAction}
          disabled={disabled}
          className={cn(
            "mt-2 w-full rounded-md px-2 py-1 text-[10px] font-bold transition",
            disabled ? "bg-white/5 text-muted-foreground" : "bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30",
            actionColor
          )}
        >
          {actionIcon} {actionLabel}
        </button>
      </div>
    </div>
  );
}
