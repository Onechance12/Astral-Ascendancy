"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type MatchRole = "player" | "enemy";

export type MultiplayerState = {
  status: "idle" | "queueing" | "matched" | "opponent-left";
  matchId: string | null;
  role: MatchRole | null;
  opponent: { commanderName: string; factionId: string } | null;
};

/**
 * Connects to the Astral match mini-service (port 3003 via gateway).
 * Frontend uses: io("/?XTransformPort=3003") per the gateway rules.
 */
export function useMatchSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<MultiplayerState>({
    status: "idle",
    matchId: null,
    role: null,
    opponent: null,
  });

  useEffect(() => {
    const socket = io({
      path: "/socket.io/",
      query: { XTransformPort: "3003" },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("queueing", () => setState((s) => ({ ...s, status: "queueing" })));
    socket.on("queue-cancelled", () =>
      setState({ status: "idle", matchId: null, role: null, opponent: null })
    );
    socket.on("matched", (data: { matchId: string; role: MatchRole; opponent: { commanderName: string; factionId: string } }) => {
      setState({
        status: "matched",
        matchId: data.matchId,
        role: data.role,
        opponent: data.opponent,
      });
    });
    socket.on("opponent-left", () =>
      setState({ status: "opponent-left", matchId: null, role: null, opponent: null })
    );

    socket.on("connect", () => {
      console.log("[match-socket] connected", socket.id);
    });
    socket.on("connect_error", (err: Error) => {
      console.warn("[match-socket] connect error", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const queue = (commanderName: string, factionId: string, deckIds: string[]) => {
    socketRef.current?.emit("queue", { commanderName, factionId, deckIds });
  };
  const cancelQueue = () => {
    socketRef.current?.emit("cancel-queue");
  };
  const leaveMatch = () => {
    socketRef.current?.emit("leave-match");
    setState({ status: "idle", matchId: null, role: null, opponent: null });
  };
  const sendState = (state: unknown) => {
    socketRef.current?.emit("match-state", state);
  };
  const onPeerState = (cb: (state: unknown) => void) => {
    socketRef.current?.on("match-state", cb);
  };
  const onPeerAction = (cb: (action: unknown) => void) => {
    socketRef.current?.on("match-action", cb);
  };

  return { state, queue, cancelQueue, leaveMatch, sendState, onPeerState, onPeerAction, socket: socketRef };
}
