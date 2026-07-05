import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildDailyBriefing } from "@/lib/daily-briefing";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const briefing = await buildDailyBriefing(session.user.id);
  if (!briefing) {
    return NextResponse.json({ error: "briefing unavailable" }, { status: 404 });
  }

  return NextResponse.json({ briefing });
}
