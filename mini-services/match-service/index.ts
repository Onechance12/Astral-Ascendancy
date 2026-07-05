// Astral Ascendancy — Multiplayer Match Service
// socket.io on port 3003. Handles matchmaking + live 2-player match state.
// Frontend connects via: io("/?XTransformPort=3003")

import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3003;

const httpServer = createServer((req, res) => {
  // health check
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "astral-match", port: PORT }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Astral Ascendancy match service");
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  path: "/socket.io/",
});

type QueueEntry = {
  socketId: string;
  commanderName: string;
  factionId: string;
  deckIds: string[];
};

type LiveMatch = {
  id: string;
  players: { socketId: string; commanderName: string; factionId: string; deckIds: string[] }[];
  turn: number;
  // minimal shared state — the host runs the actual engine, syncs to peer
  state: unknown;
};

const queue: QueueEntry[] = [];
const matches = new Map<string, LiveMatch>();
const socketToMatch = new Map<string, string>();

function tryMatchmake() {
  while (queue.length >= 2) {
    const a = queue.shift()!;
    const b = queue.shift()!;
    const matchId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const match: LiveMatch = {
      id: matchId,
      players: [
        { socketId: a.socketId, commanderName: a.commanderName, factionId: a.factionId, deckIds: a.deckIds },
        { socketId: b.socketId, commanderName: b.commanderName, factionId: b.factionId, deckIds: b.deckIds },
      ],
      turn: 1,
      state: null,
    };
    matches.set(matchId, match);
    socketToMatch.set(a.socketId, matchId);
    socketToMatch.set(b.socketId, matchId);
    // notify both — first player is "host" (player side), second is "guest" (enemy side)
    io.to(a.socketId).emit("matched", {
      matchId,
      role: "player",
      opponent: { commanderName: b.commanderName, factionId: b.factionId },
    });
    io.to(b.socketId).emit("matched", {
      matchId,
      role: "enemy",
      opponent: { commanderName: a.commanderName, factionId: a.factionId },
    });
    console.log(`[match] ${matchId}: ${a.commanderName} vs ${b.commanderName}`);
  }
}

io.on("connection", (socket) => {
  console.log(`[io] connected ${socket.id}`);

  socket.on("queue", (payload: { commanderName: string; factionId: string; deckIds: string[] }) => {
    // avoid double-queue
    const existing = queue.find((q) => q.socketId === socket.id);
    if (existing) return;
    queue.push({
      socketId: socket.id,
      commanderName: payload.commanderName || "Commander",
      factionId: payload.factionId || "solari",
      deckIds: payload.deckIds || [],
    });
    socket.emit("queueing");
    tryMatchmake();
  });

  socket.on("cancel-queue", () => {
    const idx = queue.findIndex((q) => q.socketId === socket.id);
    if (idx >= 0) queue.splice(idx, 1);
    socket.emit("queue-cancelled");
  });

  // live match state sync — host emits full state, we relay to the peer
  socket.on("match-state", (state: unknown) => {
    const matchId = socketToMatch.get(socket.id);
    if (!matchId) return;
    const match = matches.get(matchId);
    if (!match) return;
    match.state = state;
    const peer = match.players.find((p) => p.socketId !== socket.id);
    if (peer) io.to(peer.socketId).emit("match-state", state);
  });

  // relay an action to the peer (e.g. "I ended my turn")
  socket.on("match-action", (action: unknown) => {
    const matchId = socketToMatch.get(socket.id);
    if (!matchId) return;
    const match = matches.get(matchId);
    if (!match) return;
    const peer = match.players.find((p) => p.socketId !== socket.id);
    if (peer) io.to(peer.socketId).emit("match-action", action);
  });

  socket.on("leave-match", () => {
    const matchId = socketToMatch.get(socket.id);
    if (!matchId) return;
    const match = matches.get(matchId);
    if (match) {
      const peer = match.players.find((p) => p.socketId !== socket.id);
      if (peer) io.to(peer.socketId).emit("opponent-left");
      matches.delete(matchId);
    }
    socketToMatch.delete(socket.id);
  });

  socket.on("disconnect", () => {
    // remove from queue
    const qidx = queue.findIndex((q) => q.socketId === socket.id);
    if (qidx >= 0) queue.splice(qidx, 1);
    // forfeit any live match
    const matchId = socketToMatch.get(socket.id);
    if (matchId) {
      const match = matches.get(matchId);
      if (match) {
        const peer = match.players.find((p) => p.socketId !== socket.id);
        if (peer) io.to(peer.socketId).emit("opponent-left");
        matches.delete(matchId);
      }
      socketToMatch.delete(socket.id);
    }
    console.log(`[io] disconnected ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Astral match service listening on :${PORT}`);
});
