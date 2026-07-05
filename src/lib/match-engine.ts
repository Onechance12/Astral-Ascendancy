// ============================================================
// ASTRAL ASCENDANCY — Match Engine
// Conquest mode on a 3-lane Sector Grid.
// Lanes: 3 columns x 3 rows. Player deploys bottom->up, enemy top->down.
// Combat: each lane's frontmost units clash; unblocked units hit the Commander.
// ============================================================

export type Side = "player" | "enemy";

export type CardType = "Entity" | "Anomaly";
export type AttackType = "Energy" | "Physical" | "Psychic" | "Biological" | "Quantum";
export type PlanetType = "star" | "organic" | "mineral" | "gas" | "anomaly" | "barren";

export type MatchCard = {
  uid: string;
  defId: string;
  name: string;
  faction: string;
  type: CardType;
  cost: number;
  attack: number;
  hp: number;
  maxHp: number;
  text: string;
  art?: string;
  rarity: string;
  lore?: string;
  attackType?: AttackType;
  environmentBonus?: { planetType: PlanetType; attackBonus: number; hpBonus: number };
  // transient
  canAttack: boolean;
  justDeployed: boolean;
  keyword?: "Guardian" | "StrikeFirst" | "Trample" | "Overwhelm" | "Shield" | "Lifedrain" | "Pierce" | "Flying";
  shieldValue?: number; // for Shield keyword
  ownerSide: Side;
  evolved: boolean;
  evolvesTo?: { name: string; attackBonus: number; hpBonus: number; keyword?: MatchCard["keyword"] };
};

export type Sector = MatchCard | null;

export type PlayerState = {
  side: Side;
  name: string;
  factionId: string;
  hp: number;
  maxHp: number;
  resonance: number;
  maxResonance: number;
  influence: number; // Cosmic Influence for Ascension win (reach 20 = win)
  hand: MatchCard[];
  deck: MatchCard[];
};

export type MatchPhase = "main" | "resolving" | "over";

export type MatchState = {
  turn: number;
  active: Side;
  phase: MatchPhase;
  sectors: Sector[]; // 9 slots, row-major. row0 = top(enemy home), row2 = bottom(player home)
  player: PlayerState;
  enemy: PlayerState;
  log: LogEntry[];
  winner: Side | null;
  selectedHandIdx: number | null;
  selectedAttacker: number | null; // sector index
  aiThinking: boolean;
  convergence: ConvergenceEvent | null;
  winCondition: "conquest" | "ascension" | "singularity" | null;
  difficulty: Difficulty;
};

export type LogEntry = {
  id: number;
  side: Side | "system";
  text: string;
};

export type ConvergenceEvent = {
  name: string;
  glyph: string;
  desc: string;
};

const CONVERGENCE_EVENTS: ConvergenceEvent[] = [
  { name: "Supernova", glyph: "✺", desc: "All Entities take 1 damage." },
  { name: "Gravity Well", glyph: "◉", desc: "All Entities lose StrikeFirst & Trample this turn." },
  { name: "Time Dilation", glyph: "⏳", desc: "Both Commanders heal 2 HP." },
  { name: "Aether Surge", glyph: "◈", desc: "Both players gain +2 Resonance." },
  { name: "Void Echo", glyph: "☣", desc: "Each player draws a card." },
];

let uidCounter = 0;
const nextUid = () => `c${++uidCounter}`;
let logCounter = 0;
const logId = () => ++logCounter;

// ---------- Card definitions (playable) ----------
type CardDef = {
  defId: string;
  name: string;
  faction: string;
  type: CardType;
  cost: number;
  attack: number;
  hp: number;
  text: string;
  art?: string;
  rarity: string;
  lore?: string;
  attackType?: AttackType;
  environmentBonus?: { planetType: PlanetType; attackBonus: number; hpBonus: number };
  keyword?: MatchCard["keyword"];
  shieldValue?: number;
  evolvesTo?: MatchCard["evolvesTo"];
};

export const CARD_DEFS: CardDef[] = [
  // ===================== SOLARI (10 cards) =====================
  { defId: "acolyte", name: "Solari Acolyte", faction: "solari", type: "Entity", cost: 1, attack: 2, hp: 1, text: "A humble spark of the Concord. Evolves after surviving a turn.", art: "/cards/faction-solari.png", rarity: "Common", attackType: "Energy", lore: "Born from the first dawn, Acolytes carry a fragment of the Concord's eternal flame. Each one is a prayer given form.", environmentBonus: { planetType: "star", attackBonus: 1, hpBonus: 0 }, evolvesTo: { name: "Dawn Acolyte", attackBonus: 2, hpBonus: 1, keyword: "Guardian" } },
  { defId: "dawnknight", name: "Dawn Knight", faction: "solari", type: "Entity", cost: 3, attack: 4, hp: 3, text: "Guardian — must be attacked first in its lane. Radiant Bastion: shields allies.", art: "/cards/card-guardian.png", rarity: "Rare", attackType: "Energy", lore: "When the Convergence cracked the Veil, the Dawn Knights were the first to charge through. They have not stopped charging since.", keyword: "Guardian", environmentBonus: { planetType: "star", attackBonus: 1, hpBonus: 1 } },
  { defId: "guardian", name: "Stellar Guardian Aeon", faction: "solari", type: "Entity", cost: 4, attack: 3, hp: 6, text: "Guardian. Shield 2 — absorbs the first 2 damage each turn.", art: "/cards/card-guardian.png", rarity: "Holo", attackType: "Energy", lore: "An Aeon is not born — it is forged across millennia of stellar meditation. The Guardian Aeon stood on a dead moon for ten thousand years. Then it was needed.", keyword: "Guardian", shieldValue: 2, environmentBonus: { planetType: "star", attackBonus: 0, hpBonus: 2 } },
  { defId: "solar-priest", name: "Solar Priest of Dawn", faction: "solari", type: "Entity", cost: 2, attack: 1, hp: 3, text: "Lifedrain — heal your Commander for damage dealt. On Star Orbits: +2 attack.", art: "/cards/card-solar-priest.png", rarity: "Uncommon", attackType: "Energy", lore: "They sing the sun's true name. The sun listens. The sun answers.", keyword: "Lifedrain", environmentBonus: { planetType: "star", attackBonus: 2, hpBonus: 0 } },
  { defId: "radiance", name: "Avatar of Radiance", faction: "solari", type: "Entity", cost: 5, attack: 5, hp: 5, text: "Flying — can only be blocked by other Flying units. Pierce — ignores Guardian.", art: "/cards/card-radiance.png", rarity: "Mythic", attackType: "Energy", lore: "When the Avatar descends, shadows forget how to exist. It does not fight darkness. It un-creates it.", keyword: "Flying", environmentBonus: { planetType: "star", attackBonus: 1, hpBonus: 1 } },
  { defId: "lightblade", name: "Lightblade Sentinel", faction: "solari", type: "Entity", cost: 2, attack: 3, hp: 2, text: "Strike First — attacks the turn it deploys. Shield 1.", art: "/cards/faction-solari.png", rarity: "Uncommon", attackType: "Energy", keyword: "StrikeFirst", shieldValue: 1, lore: "Forged from condensed photons, the Lightblade is both weapon and wielder." },
  { defId: "sunfire-cannon", name: "Sunfire Cannon", faction: "solari", type: "Anomaly", cost: 3, attack: 0, hp: 0, text: "Deal 4 damage to any target. If targeting a Commander, deal 5 instead.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Energy", lore: "The Concord does not wage war. The Concord ends war. This is how." },
  { defId: "dawnbreak", name: "Dawnbreak", faction: "solari", type: "Anomaly", cost: 5, attack: 0, hp: 0, text: "Destroy all enemy Entities with 3 or less attack. Heal your Commander for 3.", art: "/cards/faction-solari.png", rarity: "Mythic", attackType: "Energy", lore: "And the dawn came, and the swarm was as shadows before it, and the shadows were no more." },
  // existing Solari anomalies
  { defId: "smite", name: "Radiant Smite", faction: "solari", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Deal 3 damage to the enemy Commander.", art: "/cards/faction-solari.png", rarity: "Uncommon", attackType: "Energy", lore: "A column of holy fire, delivered with prejudice." },

  // ===================== VOIDBORN (10 cards) =====================
  { defId: "broodling", name: "Void Broodling", faction: "voidborn", type: "Entity", cost: 1, attack: 1, hp: 2, text: "The swarm's first whisper. Evolves after surviving a turn.", art: "/cards/card-swarm.png", rarity: "Common", attackType: "Biological", lore: "A Broodling is not a creature. It is a question the swarm asks the universe: 'Can I eat this?' The answer is always yes.", environmentBonus: { planetType: "organic", attackBonus: 1, hpBonus: 1 }, evolvesTo: { name: "Brood Hunter", attackBonus: 1, hpBonus: 2, keyword: "StrikeFirst" } },
  { defId: "tyrant", name: "Brood Tyrant", faction: "voidborn", type: "Entity", cost: 4, attack: 4, hp: 4, text: "Overwhelm — excess damage carries to the next unit in lane. On Organic worlds: +1/+1.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Biological", lore: "The Tyrant does not command the swarm. The Tyrant IS the swarm — a billion bodies, one hunger.", keyword: "Overwhelm", environmentBonus: { planetType: "organic", attackBonus: 1, hpBonus: 1 } },
  { defId: "leviathan", name: "Void Leviathan", faction: "voidborn", type: "Entity", cost: 6, attack: 7, hp: 6, text: "Trample — excess damage hits the Commander. Overwhelm — carries to next unit.", art: "/cards/card-leviathan.png", rarity: "Mythic", attackType: "Biological", lore: "It does not swim through space. Space moves aside for it. The Leviathan is the swarm's final answer to existence.", keyword: "Trample", environmentBonus: { planetType: "organic", attackBonus: 0, hpBonus: 2 } },
  { defId: "spitter", name: "Acid Spitter", faction: "voidborn", type: "Entity", cost: 2, attack: 2, hp: 2, text: "Pierce — ignores Guardian. On Organic worlds: +1 attack.", art: "/cards/card-spitter.png", rarity: "Common", attackType: "Biological", keyword: "Pierce", lore: "Its acid dissolves crystal, flesh, and the distinction between the two.", environmentBonus: { planetType: "organic", attackBonus: 1, hpBonus: 0 } },
  { defId: "harvester", name: "Biomass Harvester", faction: "voidborn", type: "Entity", cost: 3, attack: 2, hp: 4, text: "Lifedrain — heal your Commander for damage dealt. Shield 1.", art: "/cards/card-harvester.png", rarity: "Uncommon", attackType: "Biological", keyword: "Lifedrain", shieldValue: 1, lore: "It takes. It gives back to the swarm. The cycle is... efficient." },
  { defId: "infestor", name: "Infestor Node", faction: "voidborn", type: "Entity", cost: 3, attack: 1, hp: 5, text: "Guardian. When destroyed, spawn a 2/2 Broodling in this sector.", art: "/cards/card-infestor.png", rarity: "Rare", attackType: "Biological", keyword: "Guardian", lore: "Kill it and it becomes two. Kill those and they become four. The swarm does not understand loss." },
  { defId: "swarm-surge", name: "Swarm Surge", faction: "voidborn", type: "Anomaly", cost: 3, attack: 0, hp: 0, text: "Give all your Entities +1/+1 this turn. Draw a card.", art: "/cards/faction-voidborn.png", rarity: "Uncommon", attackType: "Biological", lore: "The hive mind pulses. Every body moves faster. Every jaw hungers more." },
  { defId: "voidpulse", name: "Void Pulse", faction: "voidborn", type: "Anomaly", cost: 4, attack: 0, hp: 0, text: "Deal 2 damage to all enemy Entities. If any die, spawn a 2/2 Broodling.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Biological", lore: "A ripple of pure hunger through the fabric of space. What it touches, it tastes. What it tastes, it takes." },
  { defId: "consume", name: "Consume Essence", faction: "voidborn", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Destroy your own Entity. Gain shards equal to its cost + 3. Heal Commander for its HP.", art: "/cards/faction-voidborn.png", rarity: "Uncommon", attackType: "Biological", lore: "Nothing is wasted in the swarm. Not even death." },

  // ===================== CRYSTALLINE (10 cards) =====================
  { defId: "shardling", name: "Crystalline Shardling", faction: "crystalline", type: "Entity", cost: 2, attack: 2, hp: 3, text: "Refracts light into blades. Evolves after surviving a turn.", art: "/cards/faction-crystalline.png", rarity: "Common", attackType: "Physical", lore: "A Shardling is a thought given geometry. The Crystalline do not build — they remember, and their memories become solid.", environmentBonus: { planetType: "mineral", attackBonus: 1, hpBonus: 1 }, evolvesTo: { name: "Shard Warden", attackBonus: 1, hpBonus: 3, keyword: "Guardian" } },
  { defId: "lattice", name: "Lattice Warden", faction: "crystalline", type: "Entity", cost: 3, attack: 2, hp: 5, text: "Guardian. Shield 2. On Mineral worlds: +2 HP.", art: "/cards/faction-crystalline.png", rarity: "Uncommon", attackType: "Physical", keyword: "Guardian", shieldValue: 2, lore: "The Lattice Warden does not fight. It waits. It is very, very good at waiting.", environmentBonus: { planetType: "mineral", attackBonus: 0, hpBonus: 2 } },
  { defId: "prism", name: "Prism Striker", faction: "crystalline", type: "Entity", cost: 3, attack: 4, hp: 2, text: "Pierce — ignores Guardian. Flying — evades non-Flying blockers.", art: "/cards/card-prism.png", rarity: "Rare", attackType: "Physical", keyword: "Pierce", lore: "Light bent through a living prism becomes a blade that cuts through anything, including the concept of armor.", environmentBonus: { planetType: "mineral", attackBonus: 1, hpBonus: 0 } },
  { defId: "geode-titan", name: "Geode Titan", faction: "crystalline", type: "Entity", cost: 5, attack: 4, hp: 8, text: "Guardian. Shield 3. Overwhelm — excess damage carries to next unit.", art: "/cards/card-geode-titan.png", rarity: "Holo", attackType: "Physical", keyword: "Guardian", shieldValue: 3, lore: "It was a mountain. Now it walks. The Crystalline do not see the difference.", environmentBonus: { planetType: "mineral", attackBonus: 0, hpBonus: 2 } },
  { defId: "resonator", name: "Crystal Resonator", faction: "crystalline", type: "Entity", cost: 2, attack: 1, hp: 4, text: "Guardian. When deployed, give adjacent allies Shield 1.", art: "/cards/faction-crystalline.png", rarity: "Uncommon", attackType: "Physical", keyword: "Guardian", shieldValue: 1, lore: "Its hum aligns the crystalline structure of nearby allies, making them harder to shatter." },
  { defId: "shatterstorm", name: "Shatterstorm", faction: "crystalline", type: "Anomaly", cost: 4, attack: 0, hp: 0, text: "Destroy all Structures on the board. Deal 1 damage to all Entities for each Structure destroyed.", art: "/cards/faction-crystalline.png", rarity: "Rare", attackType: "Physical", lore: "The Crystalline's ultimate weapon: a frequency that makes everything brittle, then makes everything break." },
  { defId: "refract", name: "Refract", faction: "crystalline", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Give your Entities Shield 2 this turn. Draw a card.", art: "/cards/faction-crystalline.png", rarity: "Uncommon", attackType: "Physical", lore: "Bend the incoming damage around your forces. They won't even feel it." },

  // ===================== REAVERS (10 cards) =====================
  { defId: "skirmisher", name: "Reaver Skirmisher", faction: "reavers", type: "Entity", cost: 2, attack: 3, hp: 1, text: "Strike First — attacks the turn it deploys. On Gas Giants: +1 attack.", art: "/cards/faction-reavers.png", rarity: "Common", attackType: "Physical", keyword: "StrikeFirst", lore: "Skirmishers don't fight fair. They fight first. That's better.", environmentBonus: { planetType: "gas", attackBonus: 1, hpBonus: 0 } },
  { defId: "vex", name: "Kael Vex, Void-Runner", faction: "reavers", type: "Entity", cost: 3, attack: 3, hp: 2, text: "Strike First. Pierce — ignores Guardian. On Gas Giants: +1/+1.", art: "/cards/faction-reavers.png", rarity: "Rare", attackType: "Physical", keyword: "StrikeFirst", lore: "\"I don't steal. I redistribute.\" — Kael Vex, last words before his capture, and first words after his escape.", environmentBonus: { planetType: "gas", attackBonus: 1, hpBonus: 1 } },
  { defId: "raider", name: "Nebula Raider", faction: "reavers", type: "Entity", cost: 3, attack: 4, hp: 3, text: "Strike First. When this deals damage to the enemy Commander, steal 1 shard.", art: "/cards/faction-reavers.png", rarity: "Uncommon", attackType: "Physical", keyword: "StrikeFirst", lore: "They raid not for treasure, but for the joy of taking. The treasure is a bonus." },
  { defId: "warlord", name: "Reaver Warlord", faction: "reavers", type: "Entity", cost: 5, attack: 5, hp: 4, text: "Strike First. Overwhelm. Adjacent allies gain +1 attack.", art: "/cards/card-warlord.png", rarity: "Holo", attackType: "Physical", keyword: "StrikeFirst", lore: "The Warlord doesn't command. He inspires. Mostly through violence.", environmentBonus: { planetType: "gas", attackBonus: 0, hpBonus: 1 } },
  { defId: "boarder", name: "Gravity Boarder", faction: "reavers", type: "Entity", cost: 2, attack: 2, hp: 3, text: "Flying — evades non-Flying blockers. Strike First.", art: "/cards/card-boarder.png", rarity: "Uncommon", attackType: "Physical", keyword: "Flying", lore: "They ride gravity wells like waves. Boarding enemy ships mid-orbit is a Tuesday." },
  { defId: "salvage", name: "Salvage Beam", faction: "reavers", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Destroy an enemy Entity with 3+ HP. Gain shards equal to its cost.", art: "/cards/faction-reavers.png", rarity: "Rare", attackType: "Physical", lore: "One Reaver's trash is another Reaver's weapons cache. Everything is a weapons cache if you try hard enough." },
  { defId: "raid", name: "Raiding Party", faction: "reavers", type: "Anomaly", cost: 3, attack: 0, hp: 0, text: "Deal 2 damage to the enemy Commander. Steal 5 shards. Draw a card.", art: "/cards/faction-reavers.png", rarity: "Uncommon", attackType: "Physical", lore: "Hit fast, take everything, leave nothing but confusion and IOUs." },
  { defId: "scrap-shield", name: "Scrap Shield", faction: "reavers", type: "Anomaly", cost: 1, attack: 0, hp: 0, text: "Give all your Entities Shield 1. Cost 1 less if you have 5 or fewer shards.", art: "/cards/faction-reavers.png", rarity: "Common", attackType: "Physical", lore: "Trash welded to trash is still trash. But trash that stops bullets? That's Reaver engineering." },

  // ===================== QUANTUM (10 cards) =====================
  { defId: "probe", name: "Quantum Probe", faction: "quantum", type: "Entity", cost: 2, attack: 2, hp: 2, text: "When deployed, reveal the top card of your deck. On Anomaly worlds: +1/+1.", art: "/cards/faction-quantum.png", rarity: "Common", attackType: "Quantum", lore: "The Probe exists in all states simultaneously until observed. Then it stabs you.", environmentBonus: { planetType: "anomaly", attackBonus: 1, hpBonus: 1 } },
  { defId: "engine", name: "Singularity Engine", faction: "quantum", type: "Entity", cost: 5, attack: 5, hp: 5, text: "Quantum — exists in superposition until it attacks. On Observe: choose 5 damage to any target OR draw 3 cards.", art: "/cards/faction-quantum.png", rarity: "Singularity", attackType: "Quantum", lore: "It calculated its own victory 0.3 seconds before you played it. It is waiting for you to catch up.", environmentBonus: { planetType: "anomaly", attackBonus: 1, hpBonus: 1 } },
  { defId: "comparator", name: "Quantum Comparator", faction: "quantum", type: "Entity", cost: 3, attack: 3, hp: 3, text: "Pierce — ignores Guardian. When deployed, look at the top 2 cards of your deck, keep 1, discard 1.", art: "/cards/card-comparator.png", rarity: "Uncommon", attackType: "Quantum", keyword: "Pierce", lore: "It compares all possible futures and selects the one where you lose. Then it helps make it happen." },
  { defId: "entangler", name: "Entangler Node", faction: "quantum", type: "Entity", cost: 2, attack: 1, hp: 4, text: "Guardian. Shield 2. When destroyed, deal 2 damage to all enemy Entities in this lane.", art: "/cards/card-entangler.png", rarity: "Rare", attackType: "Quantum", keyword: "Guardian", shieldValue: 2, lore: "Entangled particles share a fate. Destroy this, and your enemies share it too." },
  { defId: "overclock", name: "Overclocked Drone", faction: "quantum", type: "Entity", cost: 4, attack: 6, hp: 2, text: "Strike First. Overwhelm. At the end of each turn, take 1 damage.", art: "/cards/card-overclock.png", rarity: "Rare", attackType: "Quantum", keyword: "StrikeFirst", lore: "It runs so fast it burns itself out. But for one glorious moment, it is everywhere at once." },
  { defId: "surge", name: "Resonance Surge", faction: "quantum", type: "Anomaly", cost: 1, attack: 0, hp: 0, text: "Gain 2 Resonance. Draw a card at the end of your turn.", art: "/cards/faction-quantum.png", rarity: "Common", attackType: "Quantum", lore: "The Architects don't waste energy. They recycle it. This is the recycling." },
  { defId: "rewind", name: "Temporal Rewind", faction: "quantum", type: "Anomaly", cost: 3, attack: 0, hp: 0, text: "Return a destroyed Entity from your void to your hand. It costs 2 less.", art: "/cards/faction-quantum.png", rarity: "Rare", attackType: "Quantum", lore: "The Architects perceive time non-linearly. To them, death is just a temporary inconvenience." },
  { defId: "collapse", name: "Probability Collapse", faction: "quantum", type: "Anomaly", cost: 5, attack: 0, hp: 0, text: "Destroy the enemy Entity with the highest attack. If tied, destroy both.", art: "/cards/faction-quantum.png", rarity: "Mythic", attackType: "Quantum", lore: "All possibilities exist until observed. The Architects observe the possibility where your best unit is dead. They select it." },
];

const PLAYER_DECK_IDS = [
  "acolyte", "acolyte", "broodling", "broodling", "shardling",
  "skirmisher", "shardling", "probe", "dawnknight", "tyrant",
  "smite", "surge", "skirmisher", "guardian", "leviathan",
];

const ENEMY_DECK_IDS = [
  "broodling", "broodling", "acolyte", "shardling", "probe",
  "lattice", "vex", "voidpulse", "tyrant", "lattice",
  "smite", "shardling", "leviathan", "broodling", "engine",
];

// ---------- helpers ----------
const ROWS = 3;
const COLS = 3;
export const SECTOR_COUNT = ROWS * COLS;

export const rowOf = (i: number) => Math.floor(i / COLS);
export const colOf = (i: number) => i % COLS;
export const idxOf = (row: number, col: number) => row * COLS + col;

// Player occupies bottom rows; deploy target = lowest empty row in a column.
// Enemy occupies top rows; deploy target = highest empty row in a column.
export function deployTargetFor(side: Side, col: number, sectors: Sector[]): number | null {
  if (side === "player") {
    for (let row = ROWS - 1; row >= 0; row--) {
      const i = idxOf(row, col);
      if (sectors[i] === null) return i;
    }
    return null;
  } else {
    for (let row = 0; row < ROWS; row++) {
      const i = idxOf(row, col);
      if (sectors[i] === null) return i;
    }
    return null;
  }
}

// Frontmost player unit in a column = the unit in the lowest row index occupied by player.
// It attacks the nearest enemy above it in the same column; if none, hits enemy commander.
export function playerAttackerInCol(col: number, sectors: Sector[]): number | null {
  for (let row = 0; row < ROWS; row++) {
    const i = idxOf(row, col);
    const c = sectors[i];
    if (c && c.ownerSide === "player") return i;
  }
  return null;
}
export function enemyAttackerInCol(col: number, sectors: Sector[]): number | null {
  for (let row = ROWS - 1; row >= 0; row--) {
    const i = idxOf(row, col);
    const c = sectors[i];
    if (c && c.ownerSide === "enemy") return i;
  }
  return null;
}

// target for a player attacker at sector i (same column, nearest enemy above)
export function playerAttackTarget(i: number, sectors: Sector[]): number | "commander" | null {
  const col = colOf(i);
  const myRow = rowOf(i);
  // nearest enemy with smaller row index (above)
  for (let row = myRow - 1; row >= 0; row--) {
    const j = idxOf(row, col);
    const c = sectors[j];
    if (c && c.ownerSide === "enemy") return j;
  }
  return "commander";
}

export function enemyAttackTarget(i: number, sectors: Sector[]): number | "commander" | null {
  const col = colOf(i);
  const myRow = rowOf(i);
  for (let row = myRow + 1; row < ROWS; row++) {
    const j = idxOf(row, col);
    const c = sectors[j];
    if (c && c.ownerSide === "player") return j;
  }
  return "commander";
}

// ---------- deck building ----------
function buildDeck(ids: string[]): MatchCard[] {
  return ids
    .map((defId) => {
      const def = CARD_DEFS.find((d) => d.defId === defId)!;
      return instantiate(def, "player");
    })
    .sort(() => Math.random() - 0.5);
}

export function buildDeckFromIds(ids: string[], side: Side): MatchCard[] {
  return ids
    .map((defId) => {
      const def = CARD_DEFS.find((d) => d.defId === defId) || CARD_DEFS[0];
      return instantiate(def, side);
    })
    .sort(() => Math.random() - 0.5);
}

export function instantiate(def: CardDef, side: Side): MatchCard {
  return {
    uid: nextUid(),
    defId: def.defId,
    name: def.name,
    faction: def.faction,
    type: def.type,
    cost: def.cost,
    attack: def.attack,
    hp: def.hp,
    maxHp: def.hp,
    text: def.text,
    art: def.art,
    rarity: def.rarity,
    lore: def.lore,
    attackType: def.attackType,
    environmentBonus: def.environmentBonus,
    keyword: def.keyword,
    shieldValue: def.shieldValue,
    canAttack: false,
    justDeployed: false,
    ownerSide: side,
    evolved: false,
    evolvesTo: def.evolvesTo,
  };
}

export type DeckData = {
  id: string;
  name: string;
  factionId: string;
  cardDefIds: string[];
  isActive: boolean;
};

// ---------- create a new match ----------
export type Difficulty = "easy" | "normal" | "hard";

export function createMatch(
  playerName: string,
  playerFaction: string,
  enemyName = "Brood Tyrant Vzaal",
  enemyFaction = "voidborn",
  playerDeckIds?: string[],
  difficulty: Difficulty = "normal",
  enemyDeckIds?: string[],
  enemyHp?: number
): MatchState {
  uidCounter = 0;
  logCounter = 0;

  const playerDeck = playerDeckIds && playerDeckIds.length >= 10
    ? buildDeckFromIds(playerDeckIds, "player")
    : buildDeck(PLAYER_DECK_IDS);
  const enemyDeck = enemyDeckIds && enemyDeckIds.length >= 3
    ? buildDeckFromIds(enemyDeckIds, "enemy")
    : buildDeck(ENEMY_DECK_IDS);

  const startHp = enemyHp ?? (difficulty === "easy" ? 16 : difficulty === "hard" ? 10 : 12);

  const player: PlayerState = {
    side: "player",
    name: playerName,
    factionId: playerFaction,
    hp: startHp,
    maxHp: startHp,
    resonance: 1,
    maxResonance: 1,
    influence: 0,
    hand: [],
    deck: playerDeck,
  };
  const enemy: PlayerState = {
    side: "enemy",
    name: enemyName,
    factionId: enemyFaction,
    hp: startHp,
    maxHp: startHp,
    resonance: 0,
    maxResonance: 0,
    influence: 0,
    hand: [],
    deck: enemyDeck,
  };

  // draw opening hands
  for (let i = 0; i < 4; i++) {
    draw(player);
    draw(enemy);
  }

  const state: MatchState = {
    turn: 1,
    active: "player",
    phase: "main",
    sectors: Array(SECTOR_COUNT).fill(null),
    player,
    enemy,
    log: [
      { id: logId(), side: "system", text: `The Convergence begins. ${playerName} vs ${enemyName}.` },
      { id: logId(), side: "system", text: "Your turn. Deploy Entities and strike the enemy Commander." },
    ],
    winner: null,
    selectedHandIdx: null,
    selectedAttacker: null,
    aiThinking: false,
    convergence: null,
    winCondition: null,
    difficulty,
  };

  // player's units can't attack turn 1 anyway (just deployed), but allow new turns
  return state;
}

export function draw(p: PlayerState): void {
  if (p.deck.length === 0) return;
  const card = p.deck.shift()!;
  // keep ownerSide from instantiation (deck built for that side)
  p.hand.push(card);
}

// ---------- actions ----------
export function startTurn(state: MatchState, side: Side): MatchState {
  const next = clone(state);
  const p = side === "player" ? next.player : next.enemy;
  p.maxResonance = Math.min(p.maxResonance + 1, 10);
  p.resonance = p.maxResonance;
  draw(p);

  // Cosmic Influence accrues: +1 per owned Entity on the board at turn start
  let ownedEntities = 0;
  for (const s of next.sectors) {
    if (s && s.ownerSide === side) ownedEntities++;
  }
  p.influence += ownedEntities;

  // Stellar Evolution: units that survived since last turn ascend
  for (const s of next.sectors) {
    if (s && s.ownerSide === side && s.evolvesTo && !s.evolved && !s.justDeployed) {
      const evo = s.evolvesTo;
      const oldName = s.name;
      s.name = evo.name;
      s.attack += evo.attackBonus;
      s.hp += evo.hpBonus;
      s.maxHp += evo.hpBonus;
      if (evo.keyword) s.keyword = evo.keyword;
      s.evolved = true;
      next.log.push({ id: logId(), side, text: `↟ ${oldName} ascends into ${evo.name}!` });
    }
  }

  // refresh attack capability + reset shields for that side's units
  for (const s of next.sectors) {
    if (s && s.ownerSide === side) {
      s.canAttack = true;
      s.justDeployed = false;
      // reset shield to the card's base shieldValue (from its def)
      const def = CARD_DEFS.find((d) => d.defId === s.defId);
      if (def?.shieldValue) s.shieldValue = def.shieldValue;
    }
  }
  next.active = side;
  next.turn = state.turn + (side === "player" ? 1 : 0);

  // Convergence Event: fires once, at the start of the player's turn 5
  if (side === "player" && next.turn === 5 && !next.convergence) {
    const ev = CONVERGENCE_EVENTS[Math.floor(Math.random() * CONVERGENCE_EVENTS.length)];
    next.convergence = ev;
    next.log.push({ id: logId(), side: "system", text: `${ev.glyph} CONVERGENCE: ${ev.name}! ${ev.desc}` });
    applyConvergence(next, ev);
  }

  if (side === "player") {
    next.log.push({ id: logId(), side: "system", text: `— Turn ${next.turn} — Your move.` });
  }

  // Ascension win check
  if (p.influence >= 20 && !next.winner) {
    next.winner = side;
    next.phase = "over";
    next.winCondition = "ascension";
    next.log.push({ id: logId(), side: "system", text: `✦ ${p.name} reaches 20 Cosmic Influence and ASCENDS the Cluster!` });
  }
  return next;
}

export function canPlay(state: MatchState, handIdx: number): boolean {
  const p = state.player;
  const card = p.hand[handIdx];
  if (!card) return false;
  if (card.cost > p.resonance) return false;
  if (card.type === "Entity") {
    // need at least one deploy target across columns
    return [0, 1, 2].some((col) => deployTargetFor("player", col, state.sectors) !== null);
  }
  return true;
}

export function playCard(state: MatchState, handIdx: number, col: number): MatchState {
  const next = clone(state);
  const p = next.player;
  const card = p.hand[handIdx];
  if (!card || card.cost > p.resonance) return next;

  if (card.type === "Entity") {
    const target = deployTargetFor("player", col, next.sectors);
    if (target === null) return next;
    p.resonance -= card.cost;
    p.hand.splice(handIdx, 1);
    const placed = { ...card, justDeployed: true, canAttack: card.keyword === "StrikeFirst" };
    next.sectors[target] = placed;
    next.log.push({ id: logId(), side: "player", text: `Deployed ${card.name} to lane ${col + 1}.` });
  } else {
    // anomaly
    p.resonance -= card.cost;
    p.hand.splice(handIdx, 1);
    resolveAnomaly(next, card, "player", "enemy");
  }
  next.selectedHandIdx = null;
  return next;
}

function resolveAnomaly(state: MatchState, card: MatchCard, caster: Side, foe: Side) {
  const log = (text: string, side: Side = caster) =>
    state.log.push({ id: logId(), side, text });
  switch (card.defId) {
    case "smite": {
      const enemy = foe === "enemy" ? state.enemy : state.player;
      enemy.hp = Math.max(0, enemy.hp - 3);
      log(`Radiant Smite sears ${enemy.name} for 3.`);
      break;
    }
    case "voidpulse": {
      let killed = 0;
      state.sectors = state.sectors.map((s) => {
        if (s && s.ownerSide === foe) {
          const nhp = s.hp - 2;
          if (nhp <= 0) {
            killed++;
            return null;
          }
          return { ...s, hp: nhp };
        }
        return s;
      });
      log(`Void Pulse ripples across the grid — ${killed} enemy Entities destroyed.`);
      break;
    }
    case "surge": {
      const self = caster === "player" ? state.player : state.enemy;
      self.resonance += 2;
      log(`Resonance Surge flows through ${self.name} (+2).`);
      break;
    }
    case "salvage": {
      // destroy first enemy entity with 3+ hp
      const idx = state.sectors.findIndex((s) => s && s.ownerSide === foe && s.hp >= 3);
      if (idx >= 0) {
        const victim = state.sectors[idx]!;
        state.sectors[idx] = null;
        log(`Salvage Beam dismantles ${victim.name}.`);
      } else {
        log(`Salvage Beam fizzles — no valid target.`);
      }
      break;
    }
    default:
      log(`${card.name} resolves.`);
  }
  checkWin(state);
}

// Helper: apply damage to a unit, accounting for Shield
function applyDamage(card: MatchCard, damage: number): { hpLost: number; shieldLost: number } {
  let remaining = damage;
  let shieldLost = 0;
  let hpLost = 0;
  // Shield absorbs first
  if (card.shieldValue && card.shieldValue > 0) {
    shieldLost = Math.min(card.shieldValue, remaining);
    card.shieldValue -= shieldLost;
    remaining -= shieldLost;
  }
  // Rest hits HP
  if (remaining > 0) {
    hpLost = remaining;
    card.hp -= remaining;
  }
  return { hpLost, shieldLost };
}

export function attackWith(state: MatchState, sectorIdx: number): MatchState {
  const next = clone(state);
  const attacker = next.sectors[sectorIdx];
  if (!attacker || attacker.ownerSide !== "player" || !attacker.canAttack) return next;

  // Flying: if attacker has Flying, it bypasses non-Flying defenders
  let target = playerAttackTarget(sectorIdx, next.sectors);
  if (target === null) return next;

  // If attacker is Flying and target is a non-Flying unit, bypass to commander
  if (target !== "commander" && attacker.keyword === "Flying") {
    const targetCard = next.sectors[target];
    if (targetCard && targetCard.keyword !== "Flying") {
      target = "commander"; // bypass non-Flying blocker
    }
  }

  // Pierce: if attacker has Pierce, it can target commander even if Guardian is in lane
  // (handled implicitly — Pierce just means Guardian doesn't force targeting)

  if (target === "commander") {
    const dmg = attacker.attack;
    next.enemy.hp = Math.max(0, next.enemy.hp - dmg);
    next.log.push({ id: logId(), side: "player", text: `${attacker.name} strikes ${next.enemy.name} for ${dmg}.` });
    // Lifedrain
    if (attacker.keyword === "Lifedrain") {
      const heal = Math.min(dmg, next.player.maxHp - next.player.hp);
      if (heal > 0) {
        next.player.hp += heal;
        next.log.push({ id: logId(), side: "system", text: `${attacker.name} drains ${heal} HP.` });
      }
    }
  } else {
    const defender = next.sectors[target]!;
    const atkDmg = attacker.attack;
    const defDmg = defender.attack;

    // Apply attacker damage to defender (through Shield)
    const result = applyDamage(defender, atkDmg);
    next.log.push({ id: logId(), side: "player", text: `${attacker.name} (${atkDmg}) clashes ${defender.name} (${defDmg}).` });

    // Lifedrain: heal for HP damage dealt (not shield)
    if (attacker.keyword === "Lifedrain" && result.hpLost > 0) {
      const heal = Math.min(result.hpLost, next.player.maxHp - next.player.hp);
      if (heal > 0) {
        next.player.hp += heal;
        next.log.push({ id: logId(), side: "system", text: `${attacker.name} drains ${heal} HP.` });
      }
    }

    // Defender takes damage (through Shield) — defender fights back
    const atkResult = applyDamage(attacker, defDmg);

    if (defender.hp <= 0) {
      next.sectors[target] = null;
      next.log.push({ id: logId(), side: "system", text: `${defender.name} is destroyed.` });

      // Overwhelm: excess damage to next unit in lane
      const excessDmg = -defender.hp;
      if (attacker.keyword === "Overwhelm" && excessDmg > 0) {
        // find next enemy unit below the defender in the same column
        const col = colOf(target);
        for (let row = rowOf(target) + 1; row < ROWS; row++) {
          const j = idxOf(row, col);
          const nextUnit = next.sectors[j];
          if (nextUnit && nextUnit.ownerSide === "enemy") {
            const overResult = applyDamage(nextUnit, excessDmg);
            next.log.push({ id: logId(), side: "system", text: `Overwhelm hits ${nextUnit.name} for ${excessDmg}.` });
            if (nextUnit.hp <= 0) {
              next.sectors[j] = null;
              next.log.push({ id: logId(), side: "system", text: `${nextUnit.name} is destroyed.` });
            }
            break;
          }
        }
      }

      // Trample: excess damage to commander
      if (attacker.keyword === "Trample" && excessDmg > 0) {
        next.enemy.hp = Math.max(0, next.enemy.hp - excessDmg);
        next.log.push({ id: logId(), side: "system", text: `Trample deals ${excessDmg} excess to ${next.enemy.name}.` });
      }
    }

    if (attacker.hp <= 0) {
      next.sectors[sectorIdx] = null;
      next.log.push({ id: logId(), side: "system", text: `${attacker.name} is destroyed.` });
    } else {
      next.sectors[sectorIdx] = { ...attacker, canAttack: false };
    }
  }
  next.selectedAttacker = null;
  checkWin(next);
  return next;
}

export function endTurn(state: MatchState): MatchState {
  // hand off to enemy
  const next = startTurn(state, "enemy");
  next.log.push({ id: logId(), side: "system", text: `${next.enemy.name} takes the field…` });
  return next;
}

export function checkWin(state: MatchState): void {
  if (state.phase === "over") return;
  if (state.enemy.hp <= 0 && state.player.hp <= 0) {
    state.winner = "player"; // tie goes to attacker
    state.phase = "over";
    state.winCondition = "conquest";
  } else if (state.enemy.hp <= 0) {
    state.winner = "player";
    state.phase = "over";
    state.winCondition = "conquest";
    state.log.push({ id: logId(), side: "system", text: `Victory! ${state.enemy.name} is unmade.` });
  } else if (state.player.hp <= 0) {
    state.winner = "enemy";
    state.phase = "over";
    state.winCondition = "conquest";
    state.log.push({ id: logId(), side: "system", text: `Defeat. ${state.player.name} falls to the swarm.` });
  }
}

// Apply a Convergence Event's effect to the board
function applyConvergence(state: MatchState, ev: ConvergenceEvent): void {
  switch (ev.name) {
    case "Supernova": {
      state.sectors = state.sectors.map((s) => {
        if (s) {
          const nhp = s.hp - 1;
          if (nhp <= 0) return null;
          return { ...s, hp: nhp };
        }
        return s;
      });
      break;
    }
    case "Gravity Well": {
      state.sectors = state.sectors.map((s) =>
        s && (s.keyword === "StrikeFirst" || s.keyword === "Trample")
          ? { ...s, keyword: undefined }
          : s
      );
      break;
    }
    case "Time Dilation": {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 2);
      state.enemy.hp = Math.min(state.enemy.maxHp, state.enemy.hp + 2);
      break;
    }
    case "Aether Surge": {
      state.player.resonance += 2;
      state.enemy.resonance += 2;
      break;
    }
    case "Void Echo": {
      draw(state.player);
      draw(state.enemy);
      break;
    }
  }
}

// ---------- AI ----------
export function runEnemyTurn(state: MatchState): MatchState {
  let next = clone(state);
  const e = next.enemy;
  // 1. play affordable cards (entities prefer lane with fewest player blockers; anomalies prefer smite/voidpulse)
  let guard = 0;
  while (guard++ < 12) {
    const playableIdx = e.hand.findIndex((c) => c.cost <= e.resonance);
    if (playableIdx === -1) break;
    const card = e.hand[playableIdx];
    if (card.type === "Entity") {
      // EASY AI: deploy to a random valid lane. NORMAL/HARD: smart lane choice.
      let best: { col: number; score: number };
      if (next.difficulty === "easy") {
        const valid = [0, 1, 2].filter((col) => deployTargetFor("enemy", col, next.sectors) !== null);
        if (valid.length === 0) break;
        best = { col: valid[Math.floor(Math.random() * valid.length)], score: 0 };
      } else {
        const laneScores = [0, 1, 2].map((col) => {
          const tgt = deployTargetFor("enemy", col, next.sectors);
          if (tgt === null) return { col, score: -Infinity };
          let playerUnits = 0;
          for (let r = 0; r < ROWS; r++) {
            const s = next.sectors[idxOf(r, col)];
            if (s && s.ownerSide === "player") playerUnits++;
          }
          return { col, score: 10 - playerUnits * 3 };
        });
        laneScores.sort((a, b) => b.score - a.score);
        best = laneScores[0];
        if (best.score === -Infinity) break;
      }
      const target = deployTargetFor("enemy", best.col, next.sectors);
      if (target === null) break;
      e.resonance -= card.cost;
      e.hand.splice(playableIdx, 1);
      next.sectors[target] = { ...card, justDeployed: true, canAttack: false };
      next.log.push({ id: logId(), side: "enemy", text: `${e.name} deploys ${card.name} to lane ${best.col + 1}.` });
    } else {
      // HARD AI: hold Smite until it's lethal; others cast freely
      if (next.difficulty === "hard" && card.defId === "smite" && next.player.hp > 3) {
        // skip this card this turn (leave in hand)
        break;
      }
      e.resonance -= card.cost;
      e.hand.splice(playableIdx, 1);
      resolveAnomaly(next, card, "enemy", "player");
      if (next.phase === "over") return next;
    }
  }
  // 2. attack with every enemy unit that can
  for (let i = 0; i < SECTOR_COUNT; i++) {
    const unit = next.sectors[i];
    if (unit && unit.ownerSide === "enemy" && unit.canAttack) {
      next = enemyAttack(next, i);
      if (next.phase === "over") return next;
    }
  }
  // 3. end enemy turn -> player turn
  next = startTurn(next, "player");
  return next;
}

function enemyAttack(state: MatchState, sectorIdx: number): MatchState {
  const next = clone(state);
  const attacker = next.sectors[sectorIdx];
  if (!attacker || attacker.ownerSide !== "enemy" || !attacker.canAttack) return next;
  const target = enemyAttackTarget(sectorIdx, next.sectors);
  if (target === null) return next;
  if (target === "commander") {
    next.player.hp = Math.max(0, next.player.hp - attacker.attack);
    next.log.push({
      id: logId(),
      side: "enemy",
      text: `${attacker.name} hits ${next.player.name} for ${attacker.attack}.`,
    });
    next.sectors[sectorIdx] = { ...attacker, canAttack: false };
  } else {
    const defender = next.sectors[target]!;
    const atkDmg = attacker.attack;
    const defDmg = defender.attack;
    defender.hp -= atkDmg;
    attacker.hp -= defDmg;
    next.log.push({
      id: logId(),
      side: "enemy",
      text: `${attacker.name} (${atkDmg}) clashes ${defender.name} (${defDmg}).`,
    });
    if (defender.hp <= 0) {
      next.sectors[target] = null;
      if (attacker.keyword === "Trample") {
        const dmg = Math.max(0, -defender.hp);
        if (dmg > 0) {
          next.player.hp = Math.max(0, next.player.hp - dmg);
        }
      }
    }
    if (attacker.hp <= 0) {
      next.sectors[sectorIdx] = null;
    } else {
      next.sectors[sectorIdx] = { ...attacker, canAttack: false };
    }
  }
  checkWin(next);
  return next;
}

// ---------- utils ----------
function clone(s: MatchState): MatchState {
  return {
    ...s,
    sectors: s.sectors.map((sec) => (sec ? { ...sec } : null)),
    player: { ...s.player, hand: s.player.hand.map((c) => ({ ...c })), deck: [...s.player.deck] },
    enemy: { ...s.enemy, hand: s.enemy.hand.map((c) => ({ ...c })), deck: [...s.enemy.deck] },
    log: [...s.log],
  };
}
