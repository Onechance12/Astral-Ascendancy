import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CARD_DEFS } from "@/lib/match-engine";
import { grantCard, grantShards } from "@/lib/progression";
import { ALL_WORLD_CARDS, getCardCategory } from "@/lib/world-cards";

const PACK_COST = 100; // shards
const PACK_SIZE = 5;

// POST /api/packs/open — spend 100 shards, get 5 cards (1 guaranteed Uncommon+)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const commander = await db.commander.findUnique({
    where: { userId: session.user.id },
  });
  if (!commander) {
    return NextResponse.json({ error: "no commander" }, { status: 400 });
  }
  if (commander.shards < PACK_COST) {
    return NextResponse.json({ error: "not enough shards", cost: PACK_COST, have: commander.shards }, { status: 400 });
  }

  // spend shards
  await db.commander.update({
    where: { userId: session.user.id },
    data: { shards: { decrement: PACK_COST } },
  });

  // roll 5 cards: 4 random by rarity weight, 1 guaranteed Uncommon+
  const weights = [
    { rarity: "Common", w: 650 },
    { rarity: "Uncommon", w: 250 },
    { rarity: "Rare", w: 80 },
    { rarity: "Holo", w: 15 },
    { rarity: "Mythic", w: 4 },
    { rarity: "Singularity", w: 1 },
  ];

  const rollRarity = (forceUncommonPlus = false) => {
    const pool = forceUncommonPlus ? weights.filter((w) => ["Uncommon", "Rare", "Holo", "Mythic", "Singularity"].includes(w.rarity)) : weights;
    const total = pool.reduce((s, w) => s + w.w, 0);
    let r = Math.random() * total;
    for (const w of pool) {
      r -= w.w;
      if (r <= 0) return w.rarity;
    }
    return "Common";
  };

  const results: { defId: string; name: string; category: string; faction?: string; rarity: string; art?: string; isNew: boolean }[] = [];
  for (let i = 0; i < PACK_SIZE; i++) {
    const rarity = rollRarity(i === PACK_SIZE - 1 && !results.some((r) => ["Uncommon", "Rare", "Holo", "Mythic", "Singularity"].includes(r.rarity)));
    // pool includes battle cards AND world cards (planet/development/crew)
    const battlePool = CARD_DEFS.filter((c) => c.rarity === rarity);
    const worldPool = ALL_WORLD_CARDS.filter((c) => c.rarity === rarity);
    const pool = [...battlePool, ...worldPool];
    const def = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CARD_DEFS[0];
    const r = await grantCard(session.user.id, def.defId, "drop");
    const category = getCardCategory(def.defId);
    results.push({
      defId: def.defId,
      name: def.name,
      category,
      faction: "faction" in def ? def.faction : undefined,
      rarity: def.rarity,
      art: "art" in def ? def.art : undefined,
      isNew: r.isNew,
    });
  }

  return NextResponse.json({
    ok: true,
    cost: PACK_COST,
    cards: results,
    shardsLeft: commander.shards - PACK_COST,
  });
}
