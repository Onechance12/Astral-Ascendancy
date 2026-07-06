import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  HEADQUARTERS_FACILITIES,
  getHeadquartersState,
  updateHeadquartersDoctrine,
  upgradeHeadquartersFacility,
  type HeadquartersDoctrine,
  type HeadquartersFacilityKey,
} from "@/lib/headquarters";

const DOCTRINES = new Set<HeadquartersDoctrine>(["balanced", "expansion", "research", "war", "recovery"]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const state = await getHeadquartersState(session.user.id);
  if (!state) return NextResponse.json({ error: "headquarters unavailable" }, { status: 404 });
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const facilityKey = typeof body.facilityKey === "string" ? body.facilityKey as HeadquartersFacilityKey : null;
  if (!facilityKey || !HEADQUARTERS_FACILITIES[facilityKey]) {
    return NextResponse.json({ error: "valid facilityKey required" }, { status: 400 });
  }

  const result = await upgradeHeadquartersFacility(session.user.id, facilityKey);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const doctrine = typeof body.doctrine === "string" && DOCTRINES.has(body.doctrine as HeadquartersDoctrine)
    ? body.doctrine as HeadquartersDoctrine
    : null;
  if (!doctrine) {
    return NextResponse.json({ error: "valid doctrine required" }, { status: 400 });
  }

  const result = await updateHeadquartersDoctrine(session.user.id, doctrine);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
