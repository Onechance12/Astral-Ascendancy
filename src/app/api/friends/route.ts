import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await db.friend.findMany({
    where: {
      OR: [{ requesterId: session.user.id }, { addresseeId: session.user.id }],
    },
    include: {
      requester: { include: { commander: true } },
      addressee: { include: { commander: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    friends: rows.map((row) => {
      const other = row.requesterId === session.user.id ? row.addressee : row.requester;
      return {
        id: row.id,
        status: row.status,
        direction: row.requesterId === session.user.id ? "sent" : "received",
        user: {
          id: other.id,
          name: other.name,
          commander: other.commander
            ? {
                name: other.commander.name,
                title: other.commander.title,
                factionId: other.commander.factionId,
              }
            : null,
        },
        createdAt: row.createdAt,
        acceptedAt: row.acceptedAt,
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { email } });
  if (!target) {
    return NextResponse.json({ error: "player not found" }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: "cannot friend yourself" }, { status: 400 });
  }

  const existing = await db.friend.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: session.user.id },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ friend: existing, existing: true });
  }

  const friend = await db.friend.create({
    data: {
      requesterId: session.user.id,
      addresseeId: target.id,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, friend });
}
