import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // No adapter — we manage User/Commander manually with credentials provider
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Commander Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // signup-only fields (ignored on signin)
        commanderName: { label: "Commander Name", type: "text" },
        title: { label: "War Title", type: "text" },
        factionId: { label: "Faction", type: "text" },
        mode: { label: "mode", type: "text" }, // "signin" | "signup"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const mode = credentials.mode || "signin";

        if (mode === "signup") {
          // create account + commander profile
          const name = (credentials.commanderName || "").trim() || "Commander";
          const title = (credentials.title || "").trim() || name;
          const factionId = credentials.factionId || "solari";
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(credentials.email)) return null;
          if (credentials.password.length < 4) return null;

          const existing = await db.user.findUnique({ where: { email: credentials.email } });
          if (existing) {
            // already exists — sign them in instead
            const ok = await bcrypt.compare(credentials.password, existing.passwordHash);
            if (!ok) return null;
            return { id: existing.id, email: existing.email, name: existing.name };
          }

          const passwordHash = await bcrypt.hash(credentials.password, 10);
          const user = await db.user.create({
            data: {
              email: credentials.email,
              name,
              passwordHash,
              commander: {
                create: { name, title, factionId },
              },
            },
          });
          return { id: user.id, email: user.email, name: user.name };
        }

        // signin
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { commander: true },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        // attach userId + commander to the session
        const dbUser = await db.user.findUnique({
          where: { id: token.uid as string },
          include: { commander: true },
        });
        if (dbUser) {
          (session.user as { id?: string }).id = dbUser.id;
          (session as SessionWithCommander).commander = dbUser.commander
            ? {
                id: dbUser.commander.id,
                name: dbUser.commander.name,
                title: dbUser.commander.title,
                factionId: dbUser.commander.factionId,
                wins: dbUser.commander.wins,
                losses: dbUser.commander.losses,
                matches: dbUser.commander.matches,
              }
            : null;
        }
      }
      return session;
    },
  },
  pages: {
    // we use a custom dialog, no dedicated auth page
    signIn: "/",
  },
};

type SessionWithCommander = {
  commander?: {
    id: string;
    name: string;
    title: string;
    factionId: string;
    wins: number;
    losses: number;
    matches: number;
  } | null;
};
