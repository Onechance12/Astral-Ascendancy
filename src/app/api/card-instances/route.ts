import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCardInstanceOverview } from "@/lib/card-instances";

// GET /api/card-instances — exact owned card copies with location, condition, and availability.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const overview = await getCardInstanceOverview(session.user.id);
  return NextResponse.json(overview);
}
