import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [myMemberships, openTribes] = await Promise.all([
    db.tribeMember.findMany({
      where: { userId: session.user.id },
      include: { tribe: true },
      orderBy: { joinedAt: "desc" },
    }),
    db.tribe.findMany({
      where: { privacy: "open" },
      include: { _count: { select: { members: true } } },
      orderBy: [{ influence: "desc" }, { xp: "desc" }],
      take: 20,
    }),
  ]);

  return NextResponse.json({
    mine: myMemberships.map((membership) => ({
      id: membership.tribe.id,
      name: membership.tribe.name,
      slug: membership.tribe.slug,
      description: membership.tribe.description,
      emblemGlyph: membership.tribe.emblemGlyph,
      factionBanner: membership.tribe.factionBanner,
      role: membership.role,
      contribution: membership.contribution,
      xp: membership.tribe.xp,
      influence: membership.tribe.influence,
    })),
    discover: openTribes.map((tribe) => ({
      id: tribe.id,
      name: tribe.name,
      slug: tribe.slug,
      description: tribe.description,
      emblemGlyph: tribe.emblemGlyph,
      factionBanner: tribe.factionBanner,
      members: tribe._count.members,
      memberLimit: tribe.memberLimit,
      xp: tribe.xp,
      influence: tribe.influence,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 32) : "";
  if (name.length < 3) {
    return NextResponse.json({ error: "tribe name must be at least 3 characters" }, { status: 400 });
  }

  const slug = slugify(name);
  const existing = await db.tribe.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "tribe name is already taken" }, { status: 409 });
  }

  const tribe = await db.tribe.create({
    data: {
      name,
      slug,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 160) : null,
      emblemGlyph: typeof body.emblemGlyph === "string" ? body.emblemGlyph.trim().slice(0, 2) || "✦" : "✦",
      factionBanner: typeof body.factionBanner === "string" ? body.factionBanner.trim().slice(0, 24) : null,
      privacy: body.privacy === "open" || body.privacy === "closed" ? body.privacy : "invite",
      founderId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "founder",
        },
      },
    },
    include: { members: true },
  });

  return NextResponse.json({ ok: true, tribe });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}
