import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listPetitions, resolvePetition } from "@/lib/petitions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const petitions = await listPetitions(session.user.id);
  return NextResponse.json({ petitions });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const petitionId = typeof body.petitionId === "string" ? body.petitionId : "";
  const action = body.action === "approve" || body.action === "dismiss" ? body.action : null;

  if (!petitionId || !action) {
    return NextResponse.json({ error: "petitionId and approve/dismiss action required" }, { status: 400 });
  }

  const result = await resolvePetition({ userId: session.user.id, petitionId, action });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
