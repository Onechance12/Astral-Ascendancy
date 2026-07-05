// Seed: daily quest templates, Solari 5-chapter campaign, one active Operation.
// Run with: bun run src/lib/seed.ts

import { db } from "./db";

async function main() {
  // ---------- Quests ----------
  const quests = [
    { kind: "daily", type: "win", target: 2, title: "Distress Signal", description: "Win 2 matches", rewardShards: 60 },
    { kind: "daily", type: "deploy", target: 15, title: "Muster the Ranks", description: "Deploy 15 Entities", rewardShards: 50 },
    { kind: "daily", type: "cast", target: 5, title: "Quantum Anomaly", description: "Cast 5 Anomalies", rewardShards: 50 },
    { kind: "daily", type: "faction_win", target: 1, title: "Solari Devotion", description: "Win 1 match with Solari", rewardShards: 70, factionId: "solari", rewardCardDefId: "acolyte" },
    { kind: "daily", type: "faction_win", target: 1, title: "Swarm Directive", description: "Win 1 match with Voidborn", rewardShards: 70, factionId: "voidborn", rewardCardDefId: "broodling" },
    { kind: "weekly", type: "win", target: 7, title: "Sector Sweep", description: "Win 7 matches this week", rewardShards: 200, rewardCardDefId: "guardian" },
    { kind: "weekly", type: "capture", target: 1, title: "Take a Prisoner", description: "Capture an enemy Entity (complete a Bounty)", rewardShards: 150, rewardCardDefId: "tyrant" },
  ];
  for (const q of quests) {
    const existing = await db.quest.findFirst({ where: { title: q.title } });
    if (!existing) {
      await db.quest.create({ data: q });
      console.log("seeded quest:", q.title);
    }
  }

  // ---------- Solari Campaign (5 chapters) ----------
  const solariChapters = [
    {
      factionId: "solari",
      chapter: 1,
      title: "First Light",
      intro: "Dawn breaks over the Concord's oldest temple. Acolyte Vael'Sun must prove the Concord's fire still burns. Face a lone Voidborn scout probing the border.",
      outro: "The scout dissolves into ash. Vael'Sun kneels — the first victory of a long war. The Concord names you Herald.",
      enemyName: "Voidborn Scout",
      enemyFactionId: "voidborn",
      enemyDeckIds: JSON.stringify(["broodling", "broodling", "broodling"]),
      enemyHp: 10,
      rewardCardDefIds: JSON.stringify(["acolyte", "acolyte"]),
      rewardShards: 30,
    },
    {
      factionId: "solari",
      chapter: 2,
      title: "The Ambush at Vrellis",
      intro: "Captain Vael'Sun's reconnaissance crew was ambushed in the Vrellis Nebula. Three crew are missing. Cut through the swarm to find them.",
      outro: "You find the crew alive, shielded by a Dawn Knight who held the line. He pledges his blade to your command.",
      enemyName: "Brood Ambusher",
      enemyFactionId: "voidborn",
      enemyDeckIds: JSON.stringify(["broodling", "broodling", "broodling", "broodling", "tyrant"]),
      enemyHp: 12,
      rewardCardDefIds: JSON.stringify(["dawnknight"]),
      rewardShards: 40,
    },
    {
      factionId: "solari",
      chapter: 3,
      title: "The Shattered Moon",
      intro: "A Crystalline vanguard has seized a Concord moon-refinery. Reclaim it — but the Crystalline do not die easily. Their walls are gemstone.",
      outro: "The moon-refinery hums back to life. A captured Shard Warden agrees to serve rather than shatter. A rare ally.",
      enemyName: "Crystalline Vanguard",
      enemyFactionId: "crystalline",
      enemyDeckIds: JSON.stringify(["shardling", "shardling", "lattice", "lattice"]),
      enemyHp: 14,
      rewardCardDefIds: JSON.stringify(["guardian", "shardling"]),
      rewardShards: 50,
    },
    {
      factionId: "solari",
      chapter: 4,
      title: "The Reaver's Toll",
      intro: "Reaver clans block the only lane to the besieged Concord world. They demand tribute — you offer plasma instead. A fast, ruthless foe.",
      outro: "The Reaver flagship drifts, silenced. Kael Vex, their most cunning runner, surrenders his blade rather than burn with his ship.",
      enemyName: "Reaver Captain Vex",
      enemyFactionId: "reavers",
      enemyDeckIds: JSON.stringify(["skirmisher", "skirmisher", "vex", "skirmisher"]),
      enemyHp: 12,
      rewardCardDefIds: JSON.stringify(["vex", "skirmisher"]),
      rewardShards: 60,
    },
    {
      factionId: "solari",
      chapter: 5,
      title: "The Leviathan's Wake",
      intro: "A Void Leviathan orbits the Concord's capital world. If it strikes, dawn ends forever. This is the final stand. Command everything you have earned.",
      outro: "The Leviathan unspools into the void, undone. The Cluster names you Ascendant Herald of the Solari. A new age begins.",
      enemyName: "Brood Tyrant Vzaal",
      enemyFactionId: "voidborn",
      enemyDeckIds: JSON.stringify(["broodling", "broodling", "tyrant", "leviathan", "tyrant", "broodling"]),
      enemyHp: 16,
      rewardCardDefIds: JSON.stringify(["leviathan", "smite"]),
      rewardShards: 100,
    },
  ];
  for (const ch of solariChapters) {
    const existing = await db.campaign.findUnique({
      where: { factionId_chapter: { factionId: ch.factionId, chapter: ch.chapter } },
    });
    if (!existing) {
      await db.campaign.create({ data: ch });
      console.log("seeded campaign:", ch.title);
    }
  }

  // ---------- Active Operation: Rescue ----------
  const existingOp = await db.operation.findFirst({ where: { active: true } });
  if (!existingOp) {
    await db.operation.create({
      data: {
        type: "rescue",
        name: "Rescue the Quantum Architect",
        lore: "A Quantum Architect probe crash-landed on a Reaver-held world. Win 3 matches to locate and extract the probe before the Reavers strip it for parts.",
        target: 3,
        factionId: null,
        rewardCardDefIds: JSON.stringify(["engine"]),
        rewardShards: 120,
        rewardCommanderTitle: "Probe Liberator",
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        active: true,
      },
    });
    console.log("seeded operation: Rescue the Quantum Architect");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

// ---------- Voidborn Campaign (4 chapters) ----------
const voidbornChapters = [
  {
    factionId: "voidborn",
    chapter: 1,
    title: "The First Hunger",
    intro: "A new consciousness stirs in the biomass. You are a Broodling-mind, freshly spawned. Devour the weak to grow.",
    outro: "The scout's biomass joins the swarm. You are no longer one — you are many.",
    enemyName: "Solari Scout",
    enemyFactionId: "solari",
    enemyDeckIds: JSON.stringify(["acolyte", "acolyte"]),
    enemyHp: 10,
    rewardCardDefIds: JSON.stringify(["broodling", "broodling"]),
    rewardShards: 30,
  },
  {
    factionId: "voidborn",
    chapter: 2,
    title: "The Crystal Harvest",
    intro: "A Crystalline lattice-world drifts into swarm territory. Its silicon bodies will feed a thousand new spawn.",
    outro: "The lattice shatters. The swarm absorbs the shards. New Broodlings emerge, stronger.",
    enemyName: "Crystalline Harvester",
    enemyFactionId: "crystalline",
    enemyDeckIds: JSON.stringify(["shardling", "shardling", "lattice"]),
    enemyHp: 12,
    rewardCardDefIds: JSON.stringify(["tyrant"]),
    rewardShards: 50,
  },
  {
    factionId: "voidborn",
    chapter: 3,
    title: "The Reaver's End",
    intro: "Reaver clans have been raiding your spawn-pools. Corner their flagship and end their raids forever.",
    outro: "The Reaver flagship falls silent. You salvage their tech — and their bodies.",
    enemyName: "Reaver Warlord",
    enemyFactionId: "reavers",
    enemyDeckIds: JSON.stringify(["skirmisher", "vex", "skirmisher", "skirmisher"]),
    enemyHp: 12,
    rewardCardDefIds: JSON.stringify(["leviathan"]),
    rewardShards: 70,
  },
  {
    factionId: "voidborn",
    chapter: 4,
    title: "The Solari Dawn Ends",
    intro: "The Concord's capital world orbits a dying star. Plunge it into permanent night. The swarm's final ascension begins.",
    outro: "The dawn dies. The swarm reigns. You are the Tyrant now — the Cluster's new apex.",
    enemyName: "Dawn Herald Vael'Sun",
    enemyFactionId: "solari",
    enemyDeckIds: JSON.stringify(["acolyte", "dawnknight", "guardian", "dawnknight"]),
    enemyHp: 16,
    rewardCardDefIds: JSON.stringify(["leviathan", "voidpulse"]),
    rewardShards: 100,
  },
];

async function seedVoidborn() {
  for (const ch of voidbornChapters) {
    const existing = await db.campaign.findUnique({
      where: { factionId_chapter: { factionId: ch.factionId, chapter: ch.chapter } },
    });
    if (!existing) {
      await db.campaign.create({ data: ch });
      console.log("seeded campaign:", ch.title);
    }
  }
}

seedVoidborn().then(() => console.log("Voidborn campaign seeded."));
