import { FACTIONS, LANDING_FACTIONS } from "@/lib/game-data";
import { db } from "@/lib/db";
import { listAssignments, listDeckLicenses } from "@/lib/beta-progression";
import { getPendingResources, STRUCTURE_DEFS, structureCost, type ResourceType, type StructureType } from "@/lib/resources";
import { ensureDailyQuests } from "@/lib/progression";

type BriefingActionKind =
  | "claim_assignment"
  | "start_assignment"
  | "open_domain"
  | "open_deckbuilder"
  | "open_pack"
  | "play_match"
  | "open_campaign"
  | "open_multiplayer"
  | "open_operations";

export type DailyBriefingAction = {
  kind: BriefingActionKind;
  label: string;
  assignmentId?: string;
  assignmentType?: "resource" | "study" | "rescue";
  view?: string;
};

export type DailyBriefingItem = {
  id: string;
  title: string;
  body: string;
  score: number;
  priority: "critical" | "high" | "medium" | "low";
  source: string;
  action: DailyBriefingAction;
};

export type DailyBriefing = {
  generatedAt: string;
  headline: string;
  factionVoiceLine: string;
  commander: {
    name: string;
    factionId: string;
    factionName: string;
    glyph: string;
    color: string;
  };
  summary: {
    readyAssignments: number;
    activeAssignments: number;
    pendingResourceTotal: number;
    availableDecks: number;
    deckCount: number;
    nearestLicense: {
      displayName: string;
      progress: number;
      target: number;
      unlocked: boolean;
    } | null;
    claimableQuests: number;
  };
  recommendedAction: DailyBriefingItem;
  secondaryActions: DailyBriefingItem[];
  completedItems: DailyBriefingItem[];
  warnings: DailyBriefingItem[];
  context: {
    deckState: string;
    worldState: string;
    progressionState: string;
  };
};

const PACK_COST = 100;

const FACTION_BRIEFING: Record<
  string,
  {
    ready: string;
    quiet: string;
    resource: string;
    deck: string;
    assignment: string;
    campaign: string;
    warning: string;
  }
> = {
  solari: {
    ready: "The Concord reports completed signals awaiting your command.",
    quiet: "The dawn is stable, but idle assets create no victory.",
    resource: "Prioritize Star worlds, Plasma, and shield infrastructure.",
    deck: "Maintain a legal defensive deck before extending the line.",
    assignment: "Assign crews with purpose and return every asset to the light.",
    campaign: "Advance the Concord campaign and restore order.",
    warning: "Do not leave the line undefended.",
  },
  voidborn: {
    ready: "The swarm has returned with biomass and opportunity.",
    quiet: "The hive waits, and hunger is inefficient.",
    resource: "Prioritize Organic or Corrupted worlds, Biomass, and spawn engines.",
    deck: "Keep a second swarm deck ready when the first feeds elsewhere.",
    assignment: "Send bodies to gather, study, and rescue because idle biomass is waste.",
    campaign: "Consume the next campaign node and grow.",
    warning: "Starvation begins when assets sit unused.",
  },
  synthari: {
    ready: "Diagnostics complete. Actionable outputs are ready.",
    quiet: "System idle state detected.",
    resource: "Prioritize Machine worlds, Data, and relay infrastructure.",
    deck: "Build tier-legal network decks with clear combo paths.",
    assignment: "Assign probes, labs, and rescue units to maximize throughput.",
    campaign: "Run the next simulation or campaign test.",
    warning: "Current configuration is suboptimal.",
  },
  quantum: {
    ready: "Diagnostics complete. Probability branches have resolved into action.",
    quiet: "Idle computation is an unacceptable loss of future value.",
    resource: "Prioritize Anomaly worlds, Quantum Cores, and recursion engines.",
    deck: "Keep one precise combo deck legal and one experimental deck available.",
    assignment: "Assign probes and studies where the output improves future options.",
    campaign: "Run the next optimized campaign branch.",
    warning: "Unmodeled downtime compounds into defeat.",
  },
  verdant: {
    ready: "The grove has produced new growth while you were away.",
    quiet: "The roots are waiting for direction.",
    resource: "Prioritize Organic or Verdant worlds, healing, and growth resources.",
    deck: "Keep a resilient deck that survives while the world expands.",
    assignment: "Send study teams to learn which worlds will bloom.",
    campaign: "Follow the living path through the next campaign node.",
    warning: "Neglect causes withering.",
  },
  crimson: {
    ready: "The forge is hot and orders are ready.",
    quiet: "The war engine is cooling.",
    resource: "Prioritize Crucible or Mineral worlds, Ember, and weapon projects.",
    deck: "Keep an attack deck ready and a backup deck for raids.",
    assignment: "Send teams now because pressure wins wars.",
    campaign: "Strike the next campaign target before it fortifies.",
    warning: "Delay is weakness.",
  },
  astral: {
    ready: "The constellation has resolved into immediate action.",
    quiet: "The path is visible but not yet taken.",
    resource: "Prioritize Astral worlds, Aether, gates, and forecast paths.",
    deck: "Prepare one precise deck for battle and one for expedition.",
    assignment: "Commit assets where timing creates the future.",
    campaign: "Step into the next campaign branch.",
    warning: "An unused moment collapses into loss.",
  },
  crystalline: {
    ready: "The Lattice has completed several resonant tasks.",
    quiet: "The structure is stable, but unextended.",
    resource: "Prioritize Mineral worlds, Crystals, and defensive infrastructure.",
    deck: "Maintain a durable tier-legal deck before committing another formation.",
    assignment: "Commit studies and defenses where patience compounds.",
    campaign: "Advance when the formation is prepared.",
    warning: "A weak facet cracks the whole lattice.",
  },
  reavers: {
    ready: "The fleet has loot on deck and engines hot.",
    quiet: "A still fleet earns nothing.",
    resource: "Prioritize Gas worlds, Tritium, and fast salvage paths.",
    deck: "Keep a raiding deck ready while another crew is away.",
    assignment: "Send crews before someone else steals the opportunity.",
    campaign: "Hit the next target before it prices in the risk.",
    warning: "Slow crews come home empty.",
  },
};

export async function buildDailyBriefing(userId: string): Promise<DailyBriefing | null> {
  await ensureDailyQuests(userId);

  const [user, assignments, licenses, pendingResources, pvpRanks] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: {
        commander: true,
        cards: true,
        decks: { orderBy: { updatedAt: "desc" } },
        quests: { where: { claimed: false }, include: { quest: true }, orderBy: { assignedAt: "desc" } },
        campaignProg: true,
        planets: { orderBy: { slot: "asc" } },
        developments: true,
        tribeMemberships: { include: { tribe: { include: { missions: { where: { active: true } } } } } },
      },
    }),
    listAssignments(userId),
    listDeckLicenses(userId),
    getPendingResources(userId),
    db.pvpRank.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
  ]);

  if (!user?.commander) return null;

  const commander = user.commander;
  const faction = findFaction(commander.factionId);
  const voice = FACTION_BRIEFING[commander.factionId] ?? FACTION_BRIEFING.solari;
  const readyAssignments = assignments.filter((assignment) => assignment.status === "ready");
  const activeAssignments = assignments.filter((assignment) => assignment.status === "active");
  const activeDeck = commander.activeDeckId
    ? user.decks.find((deck) => deck.id === commander.activeDeckId)
    : user.decks[0];
  const activeDeckBusy = activeDeck
    ? assignments.find((assignment) => assignment.deckId === activeDeck.id && ["active", "ready"].includes(assignment.status))
    : null;
  const unlockedTiers = new Set(licenses.filter((license) => license.unlocked).map((license) => license.deckTier));
  const availableDecks = user.decks.filter((deck) => {
    const busy = assignments.some((assignment) => assignment.deckId === deck.id && ["active", "ready"].includes(assignment.status));
    return !busy;
  });
  const legalDecks = availableDecks.filter((deck) => unlockedTiers.has(deck.powerTier || "starter"));
  const nearestLicense = licenses.find((license) => !license.unlocked) ?? null;
  const pendingResourceTotal = Object.values(pendingResources).reduce((sum, value) => sum + (value ?? 0), 0);
  const claimableQuests = user.quests.filter((userQuest) => userQuest.completed).length;
  const nextQuest = user.quests
    .filter((userQuest) => !userQuest.completed)
    .sort((a, b) => (b.progress / Math.max(1, b.quest.target)) - (a.progress / Math.max(1, a.quest.target)))[0];
  const affordableUpgrade = findAffordableWorldUpgrade(user.planets, {
    shards: commander.shards,
    plasma: commander.plasma,
    biomass: commander.biomass,
    crystals: commander.crystals,
    tritium: commander.tritium,
    quantumCores: commander.quantumCores,
  });
  const nextCampaign = await findNextCampaign(userId, commander.factionId);

  const recommendations: DailyBriefingItem[] = [];

  for (const assignment of readyAssignments) {
    recommendations.push({
      id: `claim-${assignment.id}`,
      title: `${assignment.title} complete`,
      body: `${assignment.assetType} returned. Claim the reward and free the asset for the next order.`,
      score: 150,
      priority: "critical",
      source: "assignment_state",
      action: { kind: "claim_assignment", label: "Claim reward", assignmentId: assignment.id },
    });
  }

  if (activeDeckBusy) {
    recommendations.push({
      id: "active-deck-busy",
      title: `${activeDeck?.name ?? "Active deck"} is deployed`,
      body: `${voice.warning} The deck is assigned to ${activeDeckBusy.title}; claim it when ready or switch decks before battle.`,
      score: 140,
      priority: "critical",
      source: "deck_state",
      action: activeDeckBusy.status === "ready"
        ? { kind: "claim_assignment", label: "Claim return", assignmentId: activeDeckBusy.id }
        : { kind: "open_deckbuilder", label: "Manage decks", view: "deckbuilder" },
    });
  }

  if (pendingResourceTotal > 0) {
    recommendations.push({
      id: "harvest-ready",
      title: "Domain harvest ready",
      body: `${formatResourceBundle(pendingResources)} waiting. ${voice.resource}`,
      score: 110 + Math.min(20, pendingResourceTotal),
      priority: "high",
      source: "domain_state",
      action: { kind: "open_domain", label: "Open domain", view: "domain" },
    });
  }

  if (activeAssignments.length === 0 && readyAssignments.length === 0) {
    const assignmentType = nearestLicense?.licenseId === "veteran" && activeDeck ? "rescue" : "resource";
    recommendations.push({
      id: "no-active-assignment",
      title: "No galaxy timer is running",
      body: `${voice.assignment} Start a ${assignmentType === "rescue" ? "rescue operation" : "resource run"} so progress continues while you are away.`,
      score: 105,
      priority: "high",
      source: "assignment_state",
      action: { kind: "start_assignment", label: assignmentType === "rescue" ? "Start rescue" : "Start gathering", assignmentType },
    });
  }

  if (nearestLicense) {
    const remaining = Math.max(0, nearestLicense.target - nearestLicense.progress);
    const nearScore = remaining <= 1 ? 120 : 80 - remaining * 3;
    recommendations.push({
      id: `license-${nearestLicense.licenseId}`,
      title: `${nearestLicense.displayName} is ${remaining || 1} step${remaining === 1 ? "" : "s"} away`,
      body: `Unlocking it opens ${nearestLicense.deckTier} deck building. ${voice.deck}`,
      score: nearScore,
      priority: remaining <= 1 ? "high" : "medium",
      source: "license_state",
      action: {
        kind: "start_assignment",
        label: nearestLicense.licenseId === "veteran" ? "Run rescue" : "Gain license progress",
        assignmentType: nearestLicense.licenseId === "veteran" ? "rescue" : "study",
      },
    });
  }

  if (legalDecks.length === 0) {
    recommendations.push({
      id: "no-legal-deck",
      title: "No available legal battle deck",
      body: "Build or activate a deck that matches your unlocked tier before entering serious fights.",
      score: 130,
      priority: "critical",
      source: "deck_state",
      action: { kind: "open_deckbuilder", label: "Build deck", view: "deckbuilder" },
    });
  } else if (user.decks.length <= 1 && licenses.some((license) => license.licenseId === "skirmish" && license.unlocked)) {
    recommendations.push({
      id: "build-backup-deck",
      title: "Build a second usable deck",
      body: "Rescue and defense missions can send decks away. A backup deck keeps you battle-ready.",
      score: 74,
      priority: "medium",
      source: "deck_state",
      action: { kind: "open_deckbuilder", label: "Build backup", view: "deckbuilder" },
    });
  }

  if (claimableQuests > 0) {
    recommendations.push({
      id: "claim-quest",
      title: `${claimableQuests} quest reward${claimableQuests === 1 ? "" : "s"} ready`,
      body: "Claim the reward before pushing into the next match.",
      score: 112,
      priority: "high",
      source: "quest_state",
      action: { kind: "open_operations", label: "Review quests", view: "operations" },
    });
  } else if (nextQuest && nextQuest.progress / Math.max(1, nextQuest.quest.target) >= 0.5) {
    recommendations.push({
      id: `quest-${nextQuest.id}`,
      title: `${nextQuest.quest.title} is close`,
      body: `${nextQuest.progress}/${nextQuest.quest.target}: ${nextQuest.quest.description}. Finish it for ${nextQuest.quest.rewardShards} shards.`,
      score: 78,
      priority: "medium",
      source: "quest_state",
      action: { kind: "play_match", label: "Play objective match" },
    });
  }

  if (commander.shards >= PACK_COST) {
    recommendations.push({
      id: "open-pack",
      title: "Signal Pack available",
      body: "You have enough shards for a pack. New cards can change deck and assignment options.",
      score: 70,
      priority: "medium",
      source: "collection_state",
      action: { kind: "open_pack", label: "Open pack" },
    });
  }

  if (affordableUpgrade) {
    recommendations.push({
      id: `upgrade-${affordableUpgrade.planetId}`,
      title: `Upgrade ${affordableUpgrade.planetName}`,
      body: `${affordableUpgrade.structureName} can reach level ${affordableUpgrade.nextLevel}. This improves long-term resource flow.`,
      score: 68,
      priority: "medium",
      source: "domain_state",
      action: { kind: "open_domain", label: "Upgrade world", view: "domain" },
    });
  }

  if (nextCampaign && !activeDeckBusy) {
    recommendations.push({
      id: `campaign-${nextCampaign.id}`,
      title: `Next campaign: ${nextCampaign.title}`,
      body: `${voice.campaign} Chapter ${nextCampaign.chapter} rewards ${nextCampaign.rewardShards} shards.`,
      score: 62,
      priority: "medium",
      source: "campaign_state",
      action: { kind: "open_campaign", label: "Open campaign", view: "campaign" },
    });
  }

  if (pvpRanks.length > 0 && legalDecks.length > 0) {
    recommendations.push({
      id: "pvp-ready",
      title: "Ranked ladder has a legal deck",
      body: `Your ${legalDecks[0].powerTier} deck can enter tiered PvP when you want a proving match.`,
      score: 38,
      priority: "low",
      source: "pvp_state",
      action: { kind: "open_multiplayer", label: "Open PvP", view: "multiplayer" },
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "default-play",
      title: "Enter battle",
      body: "No urgent blockers detected. Play a match to create progress, rewards, and new decisions.",
      score: 50,
      priority: "medium",
      source: "fallback",
      action: { kind: "play_match", label: "Play match" },
    });
  }

  recommendations.sort((a, b) => b.score - a.score);
  const recommendedAction = recommendations[0];
  const secondaryActions = recommendations.slice(1, 4);
  const completedItems = recommendations.filter((item) => item.id.startsWith("claim-")).slice(0, 3);
  const warnings = recommendations.filter((item) => item.priority === "critical" && !item.id.startsWith("claim-")).slice(0, 2);
  const headline = readyAssignments.length > 0 || pendingResourceTotal > 0 ? voice.ready : voice.quiet;

  return {
    generatedAt: new Date().toISOString(),
    headline,
    factionVoiceLine: pickFactionLine(recommendedAction.source, voice),
    commander: {
      name: commander.name,
      factionId: commander.factionId,
      factionName: faction.name,
      glyph: faction.glyph,
      color: faction.accent,
    },
    summary: {
      readyAssignments: readyAssignments.length,
      activeAssignments: activeAssignments.length,
      pendingResourceTotal,
      availableDecks: availableDecks.length,
      deckCount: user.decks.length,
      nearestLicense: nearestLicense
        ? {
            displayName: nearestLicense.displayName,
            progress: nearestLicense.progress,
            target: nearestLicense.target,
            unlocked: nearestLicense.unlocked,
          }
        : null,
      claimableQuests,
    },
    recommendedAction,
    secondaryActions,
    completedItems,
    warnings,
    context: {
      deckState: activeDeck
        ? `${activeDeck.name} · ${activeDeck.powerTier} · ${activeDeckBusy ? "deployed" : "available"}`
        : "No active deck",
      worldState: user.planets.length > 0
        ? `${user.planets.length} worlds · ${pendingResourceTotal} pending resources`
        : "No claimed worlds yet",
      progressionState: nearestLicense
        ? `${nearestLicense.displayName}: ${nearestLicense.progress}/${nearestLicense.target}`
        : "All visible licenses unlocked",
    },
  };
}

function findFaction(factionId: string) {
  return (
    LANDING_FACTIONS.find((faction) => faction.id === factionId) ??
    FACTIONS.find((faction) => faction.id === factionId) ??
    LANDING_FACTIONS[0]
  );
}

function pickFactionLine(source: string, voice: (typeof FACTION_BRIEFING)[string]) {
  if (source.includes("domain")) return voice.resource;
  if (source.includes("deck") || source.includes("license")) return voice.deck;
  if (source.includes("campaign")) return voice.campaign;
  if (source.includes("assignment")) return voice.assignment;
  return voice.warning;
}

function formatResourceBundle(resources: Partial<Record<ResourceType, number>>) {
  const entries = Object.entries(resources).filter(([, value]) => (value ?? 0) > 0);
  if (entries.length === 0) return "Resources are";
  return entries.map(([key, value]) => `${value} ${resourceLabel(key)}`).join(", ");
}

function resourceLabel(resource: string) {
  if (resource === "quantumCores") return "Quantum";
  return resource.charAt(0).toUpperCase() + resource.slice(1);
}

function findAffordableWorldUpgrade(
  planets: Array<{ id: string; name: string; planetType: string; structureLevel: number }>,
  resources: Record<"shards" | ResourceType, number>
) {
  for (const planet of planets) {
    const validStructure = Object.values(STRUCTURE_DEFS).find((structure) => structure.validPlanetType === planet.planetType);
    if (!validStructure) continue;
    const nextLevel = planet.structureLevel + 1;
    if (nextLevel > 5) continue;
    const cost = structureCost(validStructure.type as StructureType, nextLevel);
    if (resources.shards >= cost.shards && resources[cost.resourceType] >= cost.resource) {
      return {
        planetId: planet.id,
        planetName: planet.name,
        structureName: validStructure.name,
        nextLevel,
      };
    }
  }
  return null;
}

async function findNextCampaign(userId: string, factionId: string) {
  const chapters = await db.campaign.findMany({
    where: { factionId },
    orderBy: { chapter: "asc" },
  });
  if (chapters.length === 0) return null;
  const progress = await db.campaignProgress.findMany({ where: { userId } });
  const completed = new Set(progress.filter((row) => row.completed).map((row) => row.campaignId));
  return chapters.find((chapter) => !completed.has(chapter.id)) ?? null;
}
