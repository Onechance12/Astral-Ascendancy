import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { dismantleCard, grantCard } from "@/lib/progression";
import { craftingCost } from "@/lib/resources";

// POST /api/craft { action: "craft" | "dismantle", defId, count? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { action, defId, count = 1 } = body as {
    action?: string;
    defId?: string;
    count?: number;
  };
  if (!action || !defId) {
    return NextResponse.json({ error: "missing action/defId" }, { status: 400 });
  }
  if (action === "craft") {
    // new resource-aware crafting
    const cost = craftingCost(defId);
    const commander = await db.commander.findUnique({ where: { userId: session.user.id } });
    if (!commander) return NextResponse.json({ error: "no commander" }, { status: 400 });
    if (commander.shards < cost.shards) {
      return NextResponse.json({ error: `need ${cost.shards} shards` }, { status: 400 });
    }
    if (cost.resource && commander[cost.resource] < cost.resourceAmount) {
      return NextResponse.json({ error: `need ${cost.resourceAmount} ${cost.resource}` }, { status: 400 });
    }
    // deduct
    const update: Record<string, { decrement: number }> = { shards: { decrement: cost.shards } };
    if (cost.resource) update[cost.resource] = { decrement: cost.resourceAmount };
    await db.commander.update({ where: { userId: session.user.id }, data: update as any });
    await grantCard(session.user.id, defId, "craft");
    return NextResponse.json({ ok: true, crafted: defId, cost });
  }
  if (action === "dismantle") {
    const dust = await dismantleCard(session.user.id, defId, Number(count) || 1);
    if (dust === 0) return NextResponse.json({ error: "not enough copies" }, { status: 400 });
    return NextResponse.json({ ok: true, dusted: dust });
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
