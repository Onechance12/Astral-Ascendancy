import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDeckLicenses } from "@/lib/beta-progression";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const licenses = await listDeckLicenses(session.user.id);
  return NextResponse.json({ licenses });
}
