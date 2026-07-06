export type GameClientEventMap = {
  scenechange: { scene: string };
  battlelog: { message: string };
  packopened: { rarity: string };
  openoverlay: {
    view:
      | "hub"
      | "deckbuilder"
      | "profile"
      | "multiplayer"
      | "collection"
      | "campaign"
      | "operations"
      | "domain"
      | "headquarters"
      | "codex";
    label: string;
  };
};

type Listener<T> = (payload: T) => void;

export class GameEventBus {
  private listeners = new Map<keyof GameClientEventMap, Set<Listener<GameClientEventMap[keyof GameClientEventMap]>>>();

  on<K extends keyof GameClientEventMap>(type: K, listener: Listener<GameClientEventMap[K]>) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener as Listener<GameClientEventMap[keyof GameClientEventMap]>);
    this.listeners.set(type, listeners);
    return () => this.off(type, listener);
  }

  off<K extends keyof GameClientEventMap>(type: K, listener: Listener<GameClientEventMap[K]>) {
    this.listeners.get(type)?.delete(listener as Listener<GameClientEventMap[keyof GameClientEventMap]>);
  }

  emit<K extends keyof GameClientEventMap>(type: K, payload: GameClientEventMap[K]) {
    for (const listener of this.listeners.get(type) ?? []) listener(payload);
  }
}
