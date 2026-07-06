import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { seedStarterPlanets } from "@/lib/resources";
import {
  listStructureContainers,
  stationCardInStructure,
  unstationCardFromStructure,
} from "@/lib/structure-containers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await seedStarterPlanets(session.user.id);
  const data = await listStructureContainers(session.user.id);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const structureId = typeof body.structureId === "string" ? body.structureId : "";
  if (!structureId) {
    return NextResponse.json({ error: "structureId required" }, { status: 400 });
  }

  const result = await stationCardInStructure({
    userId: session.user.id,
    structureId,
    cardInstanceId: typeof body.cardInstanceId === "string" ? body.cardInstanceId : undefined,
    cardDefId: typeof body.cardDefId === "string" ? body.cardDefId : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const cardInstanceId = typeof body.cardInstanceId === "string" ? body.cardInstanceId : "";
  if (!cardInstanceId || body.action !== "unstation") {
    return NextResponse.json({ error: "cardInstanceId and unstation action required" }, { status: 400 });
  }

  const result = await unstationCardFromStructure({
    userId: session.user.id,
    cardInstanceId,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
