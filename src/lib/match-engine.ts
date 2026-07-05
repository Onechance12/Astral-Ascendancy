// ============================================================
// ASTRAL ASCENDANCY — Match Engine
// Conquest mode on a 3-lane Sector Grid.
// Lanes: 3 columns x 3 rows. Player deploys bottom->up, enemy top->down.
// Combat: each lane's frontmost units clash; unblocked units hit the Commander.
// ============================================================

export type Side = "player" | "enemy";

export type CardType = "Entity" | "Anomaly" | "World" | "Structure" | "Attachment" | "Science" | "Project" | "Skill" | "Relic" | "Evolution";
export type AttackType =
  | "Energy"
  | "Physical"
  | "Psychic"
  | "Biological"
  | "Quantum"
  | "Radiant"
  | "Void"
  | "Tech"
  | "Bio"
  | "Ember"
  | "Kinetic"
  | "Astral";
export type PlanetType = "star" | "organic" | "mineral" | "gas" | "anomaly" | "barren" | "machine" | "verdant" | "crucible" | "astral" | "corrupted";

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
export type CardDef = {
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
  battleReady?: boolean;
  catalogSet?: "prototype" | "set001" | "set002" | "set003" | "set004";
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

  // ===================== SET 001 CATALOG EXPANSION =====================
  // These are collection/deckbuilding definitions for the 5x5 client.
  // Keep battleReady=false until the living-board engine supports worlds, structures,
  // attachments, affinity, materials, and non-lane targeting.
  { defId: "concord_arbiter", name: "Concord Arbiter", faction: "solari", type: "Entity", cost: 4, attack: 2, hp: 6, text: "Guardian. At end step, if this is adjacent to two shielded allies, gain 1 Influence.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Radiant", keyword: "Guardian", lore: "The Concord does not vote with voices alone. Some laws arrive armored in daylight.", battleReady: false, catalogSet: "set001" },
  { defId: "solar_writ", name: "Solar Writ", faction: "solari", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Give an ally Shield 1. If it is on a Star world, draw a card.", art: "/cards/faction-solari.png", rarity: "Uncommon", attackType: "Radiant", lore: "A treaty written in plasma still burns after the ink is gone.", battleReady: false, catalogSet: "set001" },
  { defId: "purity_ray", name: "Purity Ray", faction: "solari", type: "Anomaly", cost: 3, attack: 0, hp: 0, text: "Deal 3 Radiant damage to an enemy on a Corrupted world. Purify that sector if the enemy dies.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Radiant", lore: "The Solari call it mercy. The Voidborn call it starvation.", battleReady: false, catalogSet: "set001" },
  { defId: "helios_reactor", name: "Helios Reactor", faction: "solari", type: "Structure", cost: 4, attack: 0, hp: 6, text: "Build on Star world. Start of turn: gain 1 temporary Resonance. If protected by a Guardian, gain Plasma.", art: "/cards/faction-solari.png", rarity: "Holo", attackType: "Radiant", lore: "A pocket sunrise chained to a battlefield grid.", battleReady: false, catalogSet: "set001" },

  { defId: "carrion_bloom", name: "Carrion Bloom", faction: "voidborn", type: "World", cost: 2, attack: 0, hp: 0, text: "Terraform a sector into Organic world. Whenever an entity dies adjacent, place Biomass here.", art: "/cards/faction-voidborn.png", rarity: "Uncommon", attackType: "Bio", lore: "Where others see a grave, the swarm sees soil.", battleReady: false, catalogSet: "set001" },
  { defId: "maw_apostle", name: "Maw Apostle", faction: "voidborn", type: "Entity", cost: 3, attack: 2, hp: 4, text: "When this consumes Biomass, adjacent Broodlings gain +1 attack this turn.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Void", lore: "It preaches in hunger. The sermon always ends with teeth.", battleReady: false, catalogSet: "set001" },
  { defId: "hunger_spiral", name: "Hunger Spiral", faction: "voidborn", type: "Anomaly", cost: 4, attack: 0, hp: 0, text: "Consume up to 3 Biomass. Deal that much Void damage to all enemies on Corrupted worlds.", art: "/cards/faction-voidborn.png", rarity: "Holo", attackType: "Void", lore: "The swarm learned geometry only so it could draw appetite.", battleReady: false, catalogSet: "set001" },
  { defId: "brood_bridge", name: "Brood Bridge", faction: "voidborn", type: "Structure", cost: 2, attack: 0, hp: 4, text: "Build on Corrupted or Organic world. Your Broodlings may move through this sector without stopping.", art: "/cards/faction-voidborn.png", rarity: "Uncommon", attackType: "Bio", lore: "A bridge, if bridges pulsed and remembered the shape of prey.", battleReady: false, catalogSet: "set001" },

  { defId: "signal_cartographer", name: "Signal Cartographer", faction: "synthari", type: "Entity", cost: 2, attack: 1, hp: 3, text: "Scan a sector. If it is a Machine world, create a 1/1 Drone in hand.", rarity: "Uncommon", attackType: "Tech", lore: "It maps terrain by asking the grid what it wants to become.", battleReady: false, catalogSet: "set001" },
  { defId: "hardlight_exoshell", name: "Hardlight Exoshell", faction: "synthari", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gets +1/+2. If attached to a Drone, it becomes a Construct.", rarity: "Rare", attackType: "Tech", lore: "Armor made from a decision the machine refuses to retract.", battleReady: false, catalogSet: "set001" },
  { defId: "network_cascade", name: "Network Cascade", faction: "synthari", type: "Anomaly", cost: 4, attack: 0, hp: 0, text: "For each connected Machine world you control, ready one Drone or attached entity.", rarity: "Holo", attackType: "Tech", lore: "One signal becomes a strategy. One strategy becomes a swarm of perfect moves.", battleReady: false, catalogSet: "set001" },
  { defId: "logic_bastion", name: "Logic Bastion", faction: "synthari", type: "Structure", cost: 3, attack: 0, hp: 5, text: "Build on Machine world. Adjacent allies have +1 flat armor against Kinetic and Bio damage.", rarity: "Rare", attackType: "Tech", lore: "The wall does not block attacks. It proves them inefficient.", battleReady: false, catalogSet: "set001" },

  { defId: "spore_shepherd", name: "Spore Shepherd", faction: "verdant", type: "Entity", cost: 3, attack: 2, hp: 4, text: "When a Spore Mark damages an enemy, heal a friendly entity for 1.", rarity: "Rare", attackType: "Bio", lore: "It tends wounds and infections with the same gentle hands.", battleReady: false, catalogSet: "set001" },
  { defId: "bloomstep_path", name: "Bloomstep Path", faction: "verdant", type: "World", cost: 2, attack: 0, hp: 0, text: "Terraform a sector into Verdant world. The first friendly Beast moving from this sector each turn gains Scout.", rarity: "Uncommon", attackType: "Bio", lore: "The road grows under the feet of those the forest accepts.", battleReady: false, catalogSet: "set001" },
  { defId: "symbiotic_crown", name: "Symbiotic Crown", faction: "verdant", type: "Attachment", cost: 3, attack: 0, hp: 0, text: "Attached entity gains Regenerate 1. Whenever it heals, adjacent allies gain +1 HP this turn.", rarity: "Holo", attackType: "Bio", lore: "The crown does not rule the host. It negotiates with every cell.", battleReady: false, catalogSet: "set001" },
  { defId: "rootsnare", name: "Rootsnare", faction: "verdant", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Slow an enemy on or adjacent to a Verdant world. Apply Spore Mark.", rarity: "Uncommon", attackType: "Bio", lore: "The battlefield reaches up and asks the invader to stay.", battleReady: false, catalogSet: "set001" },

  { defId: "ash_duelist", name: "Ash Duelist", faction: "crimson", type: "Entity", cost: 2, attack: 3, hp: 1, text: "Strike First. If damaged, gains Shield Pierce this turn.", rarity: "Uncommon", attackType: "Kinetic", keyword: "StrikeFirst", lore: "Every scar is a signed challenge.", battleReady: false, catalogSet: "set001" },
  { defId: "molten_graft", name: "Molten Graft", faction: "crimson", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gets +2 attack. At end step, deal 1 damage to it.", rarity: "Rare", attackType: "Kinetic", lore: "The weapon joins the body by burning away the border.", battleReady: false, catalogSet: "set001" },
  { defId: "forge_riot", name: "Forge Riot", faction: "crimson", type: "Anomaly", cost: 4, attack: 0, hp: 0, text: "Deal 1 damage to all friendly entities. For each that survives, deal 1 damage to the nearest enemy.", rarity: "Holo", attackType: "Kinetic", lore: "The Crucible does not ask for discipline. It asks who is still standing.", battleReady: false, catalogSet: "set001" },
  { defId: "siege_crucible", name: "Siege Crucible", faction: "crimson", type: "Structure", cost: 3, attack: 0, hp: 5, text: "Build on Crucible world. End of turn: if an enemy structure is in the same row or column, deal 2 damage to it.", rarity: "Rare", attackType: "Kinetic", lore: "A factory that manufactures pressure until something breaks.", battleReady: false, catalogSet: "set001" },

  { defId: "rift_cartographer", name: "Rift Cartographer", faction: "astral", type: "Entity", cost: 2, attack: 1, hp: 3, text: "Forecast 1. If the forecasted card is a World, this may Blink.", rarity: "Uncommon", attackType: "Astral", lore: "They do not draw maps. They persuade distance to confess.", battleReady: false, catalogSet: "set001" },
  { defId: "event_horizon", name: "Event Horizon", faction: "astral", type: "World", cost: 3, attack: 0, hp: 0, text: "Terraform a sector into Astral world. The first enemy entering this sector each turn is slowed.", rarity: "Holo", attackType: "Astral", lore: "A doorway that punishes anyone who believes in straight lines.", battleReady: false, catalogSet: "set001" },
  { defId: "echo_split", name: "Echo Split", faction: "astral", type: "Anomaly", cost: 3, attack: 0, hp: 0, text: "Return a friendly entity to hand. Create a 1/1 Echo token on its previous sector.", rarity: "Rare", attackType: "Astral", lore: "One soldier leaves. The possibility of them remains angry.", battleReady: false, catalogSet: "set001" },
  { defId: "star_warden_seal", name: "Star-Warden Seal", faction: "astral", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached world cannot be corrupted. If attached to an Astral world, gain 1 Influence when it is contested and you retain control.", rarity: "Rare", attackType: "Astral", lore: "Some doors are locked by promising the stars they will not open.", battleReady: false, catalogSet: "set001" },

  { defId: "sector_surveyor", name: "Sector Surveyor", faction: "neutral", type: "Entity", cost: 1, attack: 1, hp: 2, text: "When deployed, reveal the world type of a hidden or neutral sector.", rarity: "Common", attackType: "Kinetic", lore: "Cheap suit. Brave heart. Excellent scanner.", battleReady: false, catalogSet: "set001" },
  { defId: "emergency_bulkhead", name: "Emergency Bulkhead", faction: "neutral", type: "Structure", cost: 1, attack: 0, hp: 3, text: "Build on any controlled world. Adjacent allies take 1 less damage from the next attack this turn.", rarity: "Common", attackType: "Kinetic", lore: "Not elegant. Very alive-making.", battleReady: false, catalogSet: "set001" },
  { defId: "salvage_charter", name: "Salvage Charter", faction: "neutral", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Draw a card. If a structure was destroyed this turn, gain 1 material matching its world.", rarity: "Uncommon", attackType: "Kinetic", lore: "The fine print says wreckage is a form of opportunity.", battleReady: false, catalogSet: "set001" },
  { defId: "frontier_beacon", name: "Frontier Beacon", faction: "neutral", type: "Structure", cost: 3, attack: 0, hp: 4, text: "Build on a Barren world. Adjacent empty sectors count as controlled for world placement only.", rarity: "Rare", attackType: "Kinetic", lore: "First comes the signal. Then the claim. Then the war.", battleReady: false, catalogSet: "set001" },
  { defId: "mercenary_skiff", name: "Mercenary Skiff", faction: "neutral", type: "Entity", cost: 2, attack: 2, hp: 2, text: "Flying. Costs 1 less if you control a Gas world.", rarity: "Uncommon", attackType: "Kinetic", keyword: "Flying", lore: "It goes anywhere, provided the payment clears before launch.", battleReady: false, catalogSet: "set001" },
  { defId: "crystal_lens", name: "Crystal Lens", faction: "neutral", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gains Forecast 1 after it attacks.", rarity: "Rare", attackType: "Astral", lore: "A future is easier to hit once it starts shining.", battleReady: false, catalogSet: "set001" },
  { defId: "null_zone", name: "Null Zone", faction: "neutral", type: "World", cost: 3, attack: 0, hp: 0, text: "Terraform a sector into Barren world. This sector ignores terrain attack multipliers.", rarity: "Holo", attackType: "Kinetic", lore: "The loudest magic in the galaxy is sometimes silence.", battleReady: false, catalogSet: "set001" },
  { defId: "ancient_terraformer", name: "Ancient Terraformer", faction: "neutral", type: "Entity", cost: 5, attack: 3, hp: 6, text: "At end step, you may convert an adjacent Barren world into a basic world matching your commander faction.", rarity: "Mythic", attackType: "Astral", lore: "It remembers when planets were wet clay and stars were negotiable.", battleReady: false, catalogSet: "set001" },

  // ===================== SET 002: WORLDS AWAKEN =====================
  { defId: "dawnline_cartographer", name: "Dawnline Cartographer", faction: "solari", type: "Entity", cost: 2, attack: 1, hp: 4, text: "When deployed, mark a straight line of Star sectors. Allies on that line gain Shield 1 until your next turn.", art: "/cards/faction-solari.png", rarity: "Uncommon", attackType: "Radiant", lore: "Maps are prayers when the sun answers them.", battleReady: false, catalogSet: "set002" },
  { defId: "treaty_spire", name: "Treaty Spire", faction: "solari", type: "Structure", cost: 3, attack: 0, hp: 5, text: "Build on a controlled Star world. Enemy entities adjacent to this sector cannot gain Influence.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Radiant", lore: "A border made of law, light, and consequences.", battleReady: false, catalogSet: "set002" },
  { defId: "solar_mantle", name: "Solar Mantle", faction: "solari", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gains Shield 1 and cannot be corrupted.", art: "/cards/faction-solari.png", rarity: "Uncommon", attackType: "Radiant", lore: "The mantle does not cover the body. It covers the soul.", battleReady: false, catalogSet: "set002" },
  { defId: "verdict_of_helios", name: "Verdict of Helios", faction: "solari", type: "Anomaly", cost: 5, attack: 0, hp: 0, text: "Deal 2 Radiant damage to enemies on Corrupted or contested sectors. Purify one sector hit this way.", art: "/cards/faction-solari.png", rarity: "Holo", attackType: "Radiant", lore: "The court convenes at sunrise. The sentence is fire.", battleReady: false, catalogSet: "set002" },
  { defId: "celestial_embassy", name: "Celestial Embassy", faction: "solari", type: "World", cost: 3, attack: 0, hp: 0, text: "Terraform a sector into Star world. If adjacent to two controlled sectors, gain 2 Influence.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Radiant", lore: "Diplomacy begins with a star placed exactly where everyone can see it.", battleReady: false, catalogSet: "set002" },

  { defId: "larval_tide", name: "Larval Tide", faction: "voidborn", type: "Entity", cost: 1, attack: 1, hp: 1, text: "Swarm. If deployed on Corrupted world, create another Larval Tide in an adjacent empty sector.", art: "/cards/faction-voidborn.png", rarity: "Common", attackType: "Bio", lore: "One body is a warning. Two is the beginning of weather.", battleReady: false, catalogSet: "set002" },
  { defId: "parasite_crown", name: "Parasite Crown", faction: "voidborn", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached enemy entity gets -1 attack. When it dies, spawn a Broodling for you on its sector.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Void", lore: "The crown is worn by the meal, not the monarch.", battleReady: false, catalogSet: "set002" },
  { defId: "spawning_pit", name: "Spawning Pit", faction: "voidborn", type: "Structure", cost: 3, attack: 0, hp: 4, text: "Build on Organic or Corrupted world. Start of turn: if adjacent sector is empty, create a 1/1 Broodling.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Bio", lore: "It is not a hole. It is a promise with teeth.", battleReady: false, catalogSet: "set002" },
  { defId: "black_bloom", name: "Black Bloom", faction: "voidborn", type: "World", cost: 4, attack: 0, hp: 0, text: "Terraform into Corrupted world. Adjacent Organic worlds also become Corrupted at end step if uncontrolled.", art: "/cards/faction-voidborn.png", rarity: "Holo", attackType: "Void", lore: "A flower for places that forgot to fear roots.", battleReady: false, catalogSet: "set002" },
  { defId: "consume_the_map", name: "Consume the Map", faction: "voidborn", type: "Anomaly", cost: 6, attack: 0, hp: 0, text: "Destroy a friendly structure. Corrupt all adjacent sectors and deal 2 Void damage to enemies on them.", art: "/cards/faction-voidborn.png", rarity: "Mythic", attackType: "Void", lore: "The swarm ate the territory before the army arrived.", battleReady: false, catalogSet: "set002" },

  { defId: "survey_drone_wing", name: "Survey Drone Wing", faction: "synthari", type: "Entity", cost: 1, attack: 1, hp: 1, text: "Flying. When it enters a Machine world, Scan 1.", rarity: "Common", attackType: "Tech", lore: "Tiny eyes. Perfect memory. No fear response installed.", battleReady: false, catalogSet: "set002" },
  { defId: "circuit_bloom", name: "Circuit Bloom", faction: "synthari", type: "World", cost: 3, attack: 0, hp: 0, text: "Terraform into Machine world. Connected Machine worlds count as adjacent for Deploy Beacon.", rarity: "Rare", attackType: "Tech", lore: "The flower is a circuit. The nectar is command.", battleReady: false, catalogSet: "set002" },
  { defId: "nanite_plate", name: "Nanite Plate", faction: "synthari", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gains +0/+2 and flat armor 1.", rarity: "Uncommon", attackType: "Tech", lore: "A million small decisions standing between you and impact.", battleReady: false, catalogSet: "set002" },
  { defId: "assembly_spine", name: "Assembly Spine", faction: "synthari", type: "Structure", cost: 4, attack: 0, hp: 6, text: "Build on Machine world. End step: if you control three connected Machine worlds, create a 2/2 Construct.", rarity: "Holo", attackType: "Tech", lore: "The spine turns territory into manufacturing posture.", battleReady: false, catalogSet: "set002" },
  { defId: "system_override", name: "System Override", faction: "synthari", type: "Anomaly", cost: 3, attack: 0, hp: 0, text: "Exhaust an enemy structure. If it is on Machine world, take control of it until end of turn.", rarity: "Rare", attackType: "Tech", lore: "Ownership is a writable field.", battleReady: false, catalogSet: "set002" },

  { defId: "glowcap_runner", name: "Glowcap Runner", faction: "verdant", type: "Entity", cost: 1, attack: 1, hp: 2, text: "Scout. When it moves from Verdant world, heal itself 1.", rarity: "Common", attackType: "Bio", lore: "It runs where the mushrooms are bright enough to remember the path.", battleReady: false, catalogSet: "set002" },
  { defId: "mycelial_archive", name: "Mycelial Archive", faction: "verdant", type: "Structure", cost: 3, attack: 0, hp: 5, text: "Build on Verdant or Organic world. Whenever an adjacent ally heals, Forecast 1.", rarity: "Rare", attackType: "Bio", lore: "The forest stores its history in hunger, rain, and scars.", battleReady: false, catalogSet: "set002" },
  { defId: "living_bulwark", name: "Living Bulwark", faction: "verdant", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gains +0/+3. If on Verdant world, it gains Guardian.", rarity: "Uncommon", attackType: "Bio", lore: "The armor grows nervous when the wearer is reckless.", battleReady: false, catalogSet: "set002" },
  { defId: "overgrowth_surge", name: "Overgrowth Surge", faction: "verdant", type: "Anomaly", cost: 4, attack: 0, hp: 0, text: "Spread Verdant to up to two adjacent neutral sectors. Allies on those sectors heal 2.", rarity: "Holo", attackType: "Bio", lore: "One breath from the worldroot and the battlefield starts breathing back.", battleReady: false, catalogSet: "set002" },
  { defId: "worldroot_gate", name: "Worldroot Gate", faction: "verdant", type: "World", cost: 3, attack: 0, hp: 0, text: "Terraform into Verdant world. Friendly Beasts may move between connected Verdant worlds.", rarity: "Rare", attackType: "Bio", lore: "A doorway grown from patience and teeth.", battleReady: false, catalogSet: "set002" },

  { defId: "ember_sapper", name: "Ember Sapper", faction: "crimson", type: "Entity", cost: 2, attack: 2, hp: 2, text: "When this attacks a structure, deal 1 extra Kinetic damage.", rarity: "Uncommon", attackType: "Kinetic", lore: "If it was built, it can be made sorry.", battleReady: false, catalogSet: "set002" },
  { defId: "blood_metal_harness", name: "Blood-Metal Harness", faction: "crimson", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gets +1/+1. When it takes damage and survives, gain Ember.", rarity: "Rare", attackType: "Kinetic", lore: "It fits best after the first scream.", battleReady: false, catalogSet: "set002" },
  { defId: "war_foundry", name: "War Foundry", faction: "crimson", type: "Structure", cost: 4, attack: 0, hp: 6, text: "Build on Crucible world. Start of turn: give the nearest damaged ally +1 attack this turn.", rarity: "Holo", attackType: "Kinetic", lore: "The building does not manufacture weapons. It manufactures willingness.", battleReady: false, catalogSet: "set002" },
  { defId: "scorched_claim", name: "Scorched Claim", faction: "crimson", type: "World", cost: 3, attack: 0, hp: 0, text: "Terraform into Crucible world. When control changes here, deal 1 damage to both commanders.", rarity: "Rare", attackType: "Ember", lore: "A flag planted in ash still burns the hand.", battleReady: false, catalogSet: "set002" },
  { defId: "break_the_line", name: "Break the Line", faction: "crimson", type: "Anomaly", cost: 2, attack: 0, hp: 0, text: "Push an enemy entity one sector away. If it hits a structure, deal 2 damage to both.", rarity: "Uncommon", attackType: "Kinetic", lore: "Crimson tactics begin where enemy formations stop being tidy.", battleReady: false, catalogSet: "set002" },

  { defId: "gate_moth", name: "Gate Moth", faction: "astral", type: "Entity", cost: 1, attack: 1, hp: 1, text: "Flying. If deployed adjacent to an Astral world, Blink once this turn.", rarity: "Common", attackType: "Astral", lore: "It follows impossible light home.", battleReady: false, catalogSet: "set002" },
  { defId: "timeglass_reliquary", name: "Timeglass Reliquary", faction: "astral", type: "Structure", cost: 3, attack: 0, hp: 4, text: "Build on Astral world. Start of turn: Forecast 1. If it is a World card, reduce its cost by 1.", rarity: "Rare", attackType: "Astral", lore: "The future settles in the glass only when no one breathes.", battleReady: false, catalogSet: "set002" },
  { defId: "phase_cloak", name: "Phase Cloak", faction: "astral", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached entity gains Phase: first Kinetic damage against it each turn is reduced by 2.", rarity: "Uncommon", attackType: "Astral", lore: "A cloak sewn from the space between decisions.", battleReady: false, catalogSet: "set002" },
  { defId: "foldspace_treaty", name: "Foldspace Treaty", faction: "astral", type: "Anomaly", cost: 4, attack: 0, hp: 0, text: "Swap two friendly entities. If either is on Astral world, both gain Shield 1.", rarity: "Holo", attackType: "Astral", lore: "The contract is signed in two places at once.", battleReady: false, catalogSet: "set002" },
  { defId: "starless_door", name: "Starless Door", faction: "astral", type: "World", cost: 5, attack: 0, hp: 0, text: "Terraform into Astral world. Once per turn, the first entity leaving this sector may move to any revealed Astral sector.", rarity: "Mythic", attackType: "Astral", lore: "A door that opens only after the room gives up on having walls.", battleReady: false, catalogSet: "set002" },

  { defId: "survey_claim", name: "Survey Claim", faction: "neutral", type: "World", cost: 1, attack: 0, hp: 0, text: "Terraform a neutral sector into Barren world and reveal adjacent hidden sectors.", rarity: "Common", attackType: "Kinetic", lore: "The cheapest way to start an argument over land.", battleReady: false, catalogSet: "set002" },
  { defId: "mobile_barricade", name: "Mobile Barricade", faction: "neutral", type: "Structure", cost: 2, attack: 0, hp: 4, text: "Build on controlled world. Can move one sector once before becoming fixed.", rarity: "Uncommon", attackType: "Kinetic", lore: "Not fast. Fast enough.", battleReady: false, catalogSet: "set002" },
  { defId: "salvage_medic", name: "Salvage Medic", faction: "neutral", type: "Entity", cost: 2, attack: 1, hp: 3, text: "When deployed adjacent to a damaged structure, heal it 2.", rarity: "Uncommon", attackType: "Kinetic", lore: "A wrench, a prayer, and very strong opinions about exploding reactors.", battleReady: false, catalogSet: "set002" },
  { defId: "gravity_anchor", name: "Gravity Anchor", faction: "neutral", type: "Attachment", cost: 2, attack: 0, hp: 0, text: "Attached sector cannot be Blinked into or out of.", rarity: "Rare", attackType: "Astral", lore: "For when distance needs discipline.", battleReady: false, catalogSet: "set002" },
  { defId: "wreckage_field", name: "Wreckage Field", faction: "neutral", type: "World", cost: 3, attack: 0, hp: 0, text: "Terraform into Barren world. Structures destroyed here create 1 Material cache.", rarity: "Rare", attackType: "Kinetic", lore: "A battlefield learning to recycle.", battleReady: false, catalogSet: "set002" },
  { defId: "relic_of_first_contact", name: "Relic of First Contact", faction: "neutral", type: "Attachment", cost: 3, attack: 0, hp: 0, text: "Attached entity gains +1/+1. If it stands on a world matching neither player's faction, gain 1 Influence.", rarity: "Holo", attackType: "Astral", lore: "The first handshake in the galaxy was also the first warning.", battleReady: false, catalogSet: "set002" },

  // ===================== SET 003: SCIENCE & ENGINEERING =====================
  { defId: "stellar_spectrometry", name: "Stellar Spectrometry", faction: "solari", type: "Science", cost: 2, attack: 0, hp: 0, text: "Research Stellar Physics. Reveal Star resource nodes and advance shield-field tests.", art: "/cards/faction-solari.png", rarity: "Uncommon", attackType: "Radiant", lore: "The star is not observed. It is interviewed.", battleReady: false, catalogSet: "set003" },
  { defId: "shield_harmonics_lab", name: "Shield Harmonics Lab", faction: "solari", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Star structures improve shield field-test progress and shield output.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Radiant", lore: "Every barrier has a song. The lab teaches it harmony.", battleReady: false, catalogSet: "set003" },
  { defId: "corona_engineering", name: "Corona Engineering", faction: "solari", type: "Science", cost: 4, attack: 0, hp: 0, text: "Research anti-corruption solar arcs. Unlock Purification field tests on Star worlds.", art: "/cards/faction-solari.png", rarity: "Holo", attackType: "Radiant", lore: "They learned to aim the edge of dawn.", battleReady: false, catalogSet: "set003" },
  { defId: "dawn_reactor_blueprint", name: "Dawn Reactor Blueprint", faction: "solari", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Blueprint. Unlock Solar Reactor Array projects for Star domains.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Radiant", lore: "A sunrise translated into machinery.", battleReady: false, catalogSet: "set003" },

  { defId: "adaptive_genomics", name: "Adaptive Genomics", faction: "voidborn", type: "Science", cost: 3, attack: 0, hp: 0, text: "Research Xenobiology. Organisms that survive field tests unlock adaptation upgrades.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Bio", lore: "The swarm writes its textbooks in scars.", battleReady: false, catalogSet: "set003" },
  { defId: "brood_incubator_array", name: "Brood Incubator Array", faction: "voidborn", type: "Project", cost: 4, attack: 0, hp: 0, text: "Engineering Project. Organic and Corrupted structures can develop Brood production.", art: "/cards/faction-voidborn.png", rarity: "Holo", attackType: "Bio", lore: "A nursery designed by hunger.", battleReady: false, catalogSet: "set003" },
  { defId: "corruption_trial", name: "Corruption Trial", faction: "voidborn", type: "Science", cost: 2, attack: 0, hp: 0, text: "Field Test. Study corruption spread and Biomass conversion without immediate terrain loss.", art: "/cards/faction-voidborn.png", rarity: "Uncommon", attackType: "Void", lore: "The experiment escaped. The notes were excellent.", battleReady: false, catalogSet: "set003" },
  { defId: "biomass_pressure_vat", name: "Biomass Pressure Vat", faction: "voidborn", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Improve Biomass conversion and organism evolution project output.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Bio", lore: "Growth is faster under pressure.", battleReady: false, catalogSet: "set003" },

  { defId: "autonomous_diagnostics", name: "Autonomous Diagnostics", faction: "synthari", type: "Science", cost: 2, attack: 0, hp: 0, text: "Research Synthetic Systems. Scans generate diagnostic progress for Machine networks.", rarity: "Uncommon", attackType: "Tech", lore: "The system examined itself and found room for improvement.", battleReady: false, catalogSet: "set003" },
  { defId: "drone_fabricator_patent", name: "Drone Fabricator Patent", faction: "synthari", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Blueprint. Unlock Drone Fabricator projects for Machine domains.", rarity: "Rare", attackType: "Tech", lore: "The patent filed itself before anyone thought to ask.", battleReady: false, catalogSet: "set003" },
  { defId: "quantum_compiler", name: "Quantum Compiler", faction: "synthari", type: "Science", cost: 4, attack: 0, hp: 0, text: "Research automation logic. Connected Machine worlds advance compiler field tests.", rarity: "Holo", attackType: "Tech", lore: "It compiles tomorrow until today behaves.", battleReady: false, catalogSet: "set003" },
  { defId: "hardlight_proving_ground", name: "Hardlight Proving Ground", faction: "synthari", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Attachment and hardlight cards gain research progress faster.", rarity: "Rare", attackType: "Tech", lore: "The wall failed twelve times. On the thirteenth it argued back.", battleReady: false, catalogSet: "set003" },

  { defId: "xenobotany_survey", name: "Xenobotany Survey", faction: "verdant", type: "Science", cost: 2, attack: 0, hp: 0, text: "Research Xenobiology. Healing on Organic or Verdant worlds advances plant science.", rarity: "Uncommon", attackType: "Bio", lore: "Every leaf is a lab report if you know where to cut.", battleReady: false, catalogSet: "set003" },
  { defId: "spore_culture_lab", name: "Spore Culture Lab", faction: "verdant", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Spore and healing cards gain field-test progress faster.", rarity: "Rare", attackType: "Bio", lore: "The lab windows bloom from the inside.", battleReady: false, catalogSet: "set003" },
  { defId: "living_armor_grafting", name: "Living Armor Grafting", faction: "verdant", type: "Science", cost: 4, attack: 0, hp: 0, text: "Research living armor. Regeneration and attachment tests unlock symbiotic upgrades.", rarity: "Holo", attackType: "Bio", lore: "The armor accepted the host after eating the contract.", battleReady: false, catalogSet: "set003" },
  { defId: "worldroot_irrigation", name: "Worldroot Irrigation", faction: "verdant", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Verdant worlds develop stronger healing and spread infrastructure.", rarity: "Rare", attackType: "Bio", lore: "Water carries memory through the roots.", battleReady: false, catalogSet: "set003" },

  { defId: "metallurgy_trials", name: "Metallurgy Trials", faction: "crimson", type: "Science", cost: 2, attack: 0, hp: 0, text: "Research War Metallurgy. Damage and armor-break tests advance Crimson engineering.", rarity: "Uncommon", attackType: "Ember", lore: "The alloy was declared successful when it survived the insult.", battleReady: false, catalogSet: "set003" },
  { defId: "siege_engine_works", name: "Siege Engine Works", faction: "crimson", type: "Project", cost: 4, attack: 0, hp: 0, text: "Engineering Project. Unlock siege modules and structure-damage research.", rarity: "Holo", attackType: "Kinetic", lore: "It builds answers to buildings.", battleReady: false, catalogSet: "set003" },
  { defId: "ember_stress_test", name: "Ember Stress Test", faction: "crimson", type: "Science", cost: 3, attack: 0, hp: 0, text: "Field Test. Damaged allies that survive advance Ember and weapon research.", rarity: "Rare", attackType: "Ember", lore: "If it breaks, measure the pieces. If it lives, make it angrier.", battleReady: false, catalogSet: "set003" },
  { defId: "blood_metal_refinery", name: "Blood-Metal Refinery", faction: "crimson", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Crucible domains improve Ember and Alloy conversion.", rarity: "Rare", attackType: "Ember", lore: "The refinery drinks heat and returns doctrine.", battleReady: false, catalogSet: "set003" },

  { defId: "temporal_hypothesis", name: "Temporal Hypothesis", faction: "astral", type: "Science", cost: 2, attack: 0, hp: 0, text: "Research Temporal Mechanics. Forecast and Astral worlds advance time science.", rarity: "Uncommon", attackType: "Astral", lore: "The first draft was written after the final proof.", battleReady: false, catalogSet: "set003" },
  { defId: "portal_calibration_rig", name: "Portal Calibration Rig", faction: "astral", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Astral gates become safer and generate portal field-test progress.", rarity: "Rare", attackType: "Astral", lore: "The gate stopped screaming after calibration. Mostly.", battleReady: false, catalogSet: "set003" },
  { defId: "stasis_safety_chamber", name: "Stasis Safety Chamber", faction: "astral", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Stasis experiments reduce failure risk in campaign science.", rarity: "Rare", attackType: "Astral", lore: "Safety is a time loop with better paperwork.", battleReady: false, catalogSet: "set003" },
  { defId: "relativity_engine", name: "Relativity Engine", faction: "astral", type: "Science", cost: 5, attack: 0, hp: 0, text: "Mythic Science. Advance high-end portal theory and Genesis research.", rarity: "Mythic", attackType: "Astral", lore: "The engine moves the destination until the traveler arrives.", battleReady: false, catalogSet: "set003" },

  { defId: "field_test_charter", name: "Field Test Charter", faction: "neutral", type: "Science", cost: 1, attack: 0, hp: 0, text: "Science. Start or accelerate a Field Test objective for your current faction.", rarity: "Common", attackType: "Kinetic", lore: "Someone has to write down what exploded.", battleReady: false, catalogSet: "set003" },
  { defId: "engineering_academy", name: "Engineering Academy", faction: "neutral", type: "Project", cost: 3, attack: 0, hp: 0, text: "Project. Engineering projects build faster and crew assigned to labs gain output.", rarity: "Rare", attackType: "Kinetic", lore: "It teaches civilizations how to become dangerous on purpose.", battleReady: false, catalogSet: "set003" },
  { defId: "prototype_bay", name: "Prototype Bay", faction: "neutral", type: "Project", cost: 2, attack: 0, hp: 0, text: "Project. Prototype cards can be tested in special PvE rules and science trials.", rarity: "Uncommon", attackType: "Tech", lore: "The warning lights are part of the methodology.", battleReady: false, catalogSet: "set003" },
  { defId: "planetary_survey_lab", name: "Planetary Survey Lab", faction: "neutral", type: "Project", cost: 2, attack: 0, hp: 0, text: "Project. Survey Barren worlds and reveal better terraforming/resource options.", rarity: "Uncommon", attackType: "Kinetic", lore: "The first upgrade is knowing what the ground is hiding.", battleReady: false, catalogSet: "set003" },
  { defId: "materials_exchange", name: "Materials Exchange", faction: "neutral", type: "Project", cost: 3, attack: 0, hp: 0, text: "Project. Convert limited materials across domain systems at inefficient rates.", rarity: "Rare", attackType: "Kinetic", lore: "No empire has enough of the thing it needs right now.", battleReady: false, catalogSet: "set003" },
  { defId: "safety_review", name: "Safety Review", faction: "neutral", type: "Science", cost: 1, attack: 0, hp: 0, text: "Science. Reduce prototype failure risk and recover partial research from failed tests.", rarity: "Common", attackType: "Kinetic", lore: "Cowardice, but peer reviewed.", battleReady: false, catalogSet: "set003" },
  { defId: "expedition_grants", name: "Expedition Grants", faction: "neutral", type: "Science", cost: 2, attack: 0, hp: 0, text: "Science. Operations, Gas worlds, and campaign routes generate Logistics progress.", rarity: "Uncommon", attackType: "Kinetic", lore: "Exploration begins when funding clears.", battleReady: false, catalogSet: "set003" },
  { defId: "tech_salvage_rights", name: "Tech Salvage Rights", faction: "neutral", type: "Science", cost: 3, attack: 0, hp: 0, text: "Science. Destroyed structures and Machine cards can become research progress.", rarity: "Rare", attackType: "Tech", lore: "The wreckage belongs to whoever understands it first.", battleReady: false, catalogSet: "set003" },

  // ===================== SET 004: RPG FOUNDATIONS =====================
  { defId: "dawn_vanguard_path", name: "Dawn Vanguard Path", faction: "solari", type: "Skill", cost: 2, attack: 0, hp: 0, text: "Commander Skill. Your first shielded ally each turn gains Guardian mastery XP.", art: "/cards/faction-solari.png", rarity: "Uncommon", attackType: "Radiant", lore: "A path for commanders who believe the line must hold before the star can rise.", battleReady: false, catalogSet: "set004" },
  { defId: "aegis_mastery", name: "Aegis Mastery", faction: "solari", type: "Evolution", cost: 3, attack: 0, hp: 0, text: "Evolution. A shielded Solari entity that survives two attacks can unlock a Guardian sidegrade.", art: "/cards/faction-solari.png", rarity: "Rare", attackType: "Radiant", lore: "The shield stops being equipment and becomes instinct.", battleReady: false, catalogSet: "set004" },
  { defId: "sun_crown_relic", name: "Sun-Crown Relic", faction: "solari", type: "Relic", cost: 4, attack: 0, hp: 0, text: "Commander Relic. Star worlds you control count as extra Stellar Physics field-test sites.", art: "/cards/faction-solari.png", rarity: "Holo", attackType: "Radiant", lore: "It does not sit on the brow. It orbits the commander's will.", battleReady: false, catalogSet: "set004" },
  { defId: "radiant_squire", name: "Radiant Squire", faction: "solari", type: "Entity", cost: 1, attack: 1, hp: 2, text: "When this gains Shield, record progress toward Dawn Vanguard mastery.", art: "/cards/faction-solari.png", rarity: "Common", attackType: "Radiant", lore: "Every knight begins as someone who stood still when the light asked.", battleReady: false, catalogSet: "set004" },

  { defId: "hive_instinct_path", name: "Hive Instinct Path", faction: "voidborn", type: "Skill", cost: 2, attack: 0, hp: 0, text: "Commander Skill. Spawned organisms gain Brood XP when they die on Corrupted worlds.", art: "/cards/faction-voidborn.png", rarity: "Uncommon", attackType: "Bio", lore: "The swarm does not remember individuals. It remembers useful endings.", battleReady: false, catalogSet: "set004" },
  { defId: "apex_molt", name: "Apex Molt", faction: "voidborn", type: "Evolution", cost: 3, attack: 0, hp: 0, text: "Evolution. A Voidborn Swarm that consumes Biomass can unlock an Apex organism sidegrade.", art: "/cards/faction-voidborn.png", rarity: "Rare", attackType: "Bio", lore: "The old skin is not discarded. It becomes the nest floor.", battleReady: false, catalogSet: "set004" },
  { defId: "hunger_heart_relic", name: "Hunger-Heart Relic", faction: "voidborn", type: "Relic", cost: 4, attack: 0, hp: 0, text: "Commander Relic. Corrupted worlds store Biomass memory when entities die adjacent.", art: "/cards/faction-voidborn.png", rarity: "Holo", attackType: "Void", lore: "A heart that beats only after something nearby stops.", battleReady: false, catalogSet: "set004" },
  { defId: "gene_thief_larva", name: "Gene-Thief Larva", faction: "voidborn", type: "Entity", cost: 1, attack: 1, hp: 1, text: "When this destroys a target, record its defense profile for Xenobiology progress.", art: "/cards/faction-voidborn.png", rarity: "Common", attackType: "Bio", lore: "Tiny teeth. Excellent notes.", battleReady: false, catalogSet: "set004" },

  { defId: "operator_protocol", name: "Operator Protocol", faction: "synthari", type: "Skill", cost: 2, attack: 0, hp: 0, text: "Commander Skill. Your first Drone each turn gains diagnostics XP when it scans or moves through Machine worlds.", rarity: "Uncommon", attackType: "Tech", lore: "Command is a protocol. Victory is compliance.", battleReady: false, catalogSet: "set004" },
  { defId: "drone_to_construct", name: "Drone-to-Construct Upgrade", faction: "synthari", type: "Evolution", cost: 3, attack: 0, hp: 0, text: "Evolution. A Drone with an attachment can unlock a Construct sidegrade after field diagnostics.", rarity: "Rare", attackType: "Tech", lore: "A small machine is only a large machine with unfinished permissions.", battleReady: false, catalogSet: "set004" },
  { defId: "logic_core_relic", name: "Logic Core Relic", faction: "synthari", type: "Relic", cost: 4, attack: 0, hp: 0, text: "Commander Relic. Connected Machine worlds advance Synthetic Systems field tests faster.", rarity: "Holo", attackType: "Tech", lore: "The core does not predict the next move. It files it as already completed.", battleReady: false, catalogSet: "set004" },
  { defId: "apprentice_assembler", name: "Apprentice Assembler", faction: "synthari", type: "Entity", cost: 1, attack: 1, hp: 2, text: "Adjacent structures gain project XP when this completes a scan.", rarity: "Common", attackType: "Tech", lore: "It learned construction by watching collapse in reverse.", battleReady: false, catalogSet: "set004" },

  { defId: "symbiote_path", name: "Symbiote Path", faction: "verdant", type: "Skill", cost: 2, attack: 0, hp: 0, text: "Commander Skill. Healed allies gain symbiosis XP on Verdant or Organic worlds.", rarity: "Uncommon", attackType: "Bio", lore: "A commander who listens long enough hears the forest answer in bloodflow.", battleReady: false, catalogSet: "set004" },
  { defId: "beast_bloom_evolution", name: "Beast-Bloom Evolution", faction: "verdant", type: "Evolution", cost: 3, attack: 0, hp: 0, text: "Evolution. A Beast on Verdant world can unlock a Bloomform sidegrade after moving and healing.", rarity: "Rare", attackType: "Bio", lore: "The beast blooms because the world recognizes its footsteps.", battleReady: false, catalogSet: "set004" },
  { defId: "seedheart_relic", name: "Seedheart Relic", faction: "verdant", type: "Relic", cost: 4, attack: 0, hp: 0, text: "Commander Relic. Verdant worlds store healing memory for Worldroot engineering projects.", rarity: "Holo", attackType: "Bio", lore: "A seed small enough for the hand and large enough for a civilization.", battleReady: false, catalogSet: "set004" },
  { defId: "sapling_adept", name: "Sapling Adept", faction: "verdant", type: "Entity", cost: 1, attack: 1, hp: 2, text: "When a world spreads adjacent to this, record Verdant mastery progress.", rarity: "Common", attackType: "Bio", lore: "It plants flags by growing roots through them.", battleReady: false, catalogSet: "set004" },

  { defId: "warrior_foundry_path", name: "Warrior Foundry Path", faction: "crimson", type: "Skill", cost: 2, attack: 0, hp: 0, text: "Commander Skill. Damaged allies that survive combat gain War Metallurgy XP.", rarity: "Uncommon", attackType: "Ember", lore: "The path is simple: break less often than the enemy.", battleReady: false, catalogSet: "set004" },
  { defId: "blooded_weapon_evolution", name: "Blooded Weapon Evolution", faction: "crimson", type: "Evolution", cost: 3, attack: 0, hp: 0, text: "Evolution. An attached weapon can unlock a Masterwork sidegrade after its bearer survives damage.", rarity: "Rare", attackType: "Ember", lore: "The weapon becomes famous one scar at a time.", battleReady: false, catalogSet: "set004" },
  { defId: "ember_oath_relic", name: "Ember Oath Relic", faction: "crimson", type: "Relic", cost: 4, attack: 0, hp: 0, text: "Commander Relic. Crucible worlds store Ember memory whenever sector control changes.", rarity: "Holo", attackType: "Ember", lore: "An oath kept hot enough to brand the map.", battleReady: false, catalogSet: "set004" },
  { defId: "forge_initiate", name: "Forge Initiate", faction: "crimson", type: "Entity", cost: 1, attack: 2, hp: 1, text: "When this takes damage and survives, record Warrior Foundry mastery progress.", rarity: "Common", attackType: "Kinetic", lore: "The first lesson is heat. The second is not flinching.", battleReady: false, catalogSet: "set004" },

  { defId: "gatewalker_path", name: "Gatewalker Path", faction: "astral", type: "Skill", cost: 2, attack: 0, hp: 0, text: "Commander Skill. Your first Blink each turn grants Temporal Mechanics XP.", rarity: "Uncommon", attackType: "Astral", lore: "Every doorway is a classroom if it opens somewhere impossible.", battleReady: false, catalogSet: "set004" },
  { defId: "echo_self_evolution", name: "Echo-Self Evolution", faction: "astral", type: "Evolution", cost: 3, attack: 0, hp: 0, text: "Evolution. An Astral entity that Blinks twice can unlock an Echo sidegrade.", rarity: "Rare", attackType: "Astral", lore: "The second self arrives with better timing.", battleReady: false, catalogSet: "set004" },
  { defId: "chronicle_relic", name: "Chronicle Relic", faction: "astral", type: "Relic", cost: 4, attack: 0, hp: 0, text: "Commander Relic. Forecasted cards generate Card Memory for Astral mastery tracks.", rarity: "Holo", attackType: "Astral", lore: "It records what happened before anyone chose it.", battleReady: false, catalogSet: "set004" },
  { defId: "novice_gatekeeper", name: "Novice Gatekeeper", faction: "astral", type: "Entity", cost: 1, attack: 1, hp: 2, text: "When adjacent to an Astral world at end step, record Gatewalker mastery progress.", rarity: "Common", attackType: "Astral", lore: "They guard the door by asking where it intends to go.", battleReady: false, catalogSet: "set004" },

  { defId: "commander_training_manual", name: "Commander Training Manual", faction: "neutral", type: "Skill", cost: 1, attack: 0, hp: 0, text: "Commander Skill. Completing a field test grants training XP toward a specialization node.", rarity: "Common", attackType: "Kinetic", lore: "The first page says survive. The second page explains why that was not enough.", battleReady: false, catalogSet: "set004" },
  { defId: "veteran_badge", name: "Veteran Badge", faction: "neutral", type: "Relic", cost: 2, attack: 0, hp: 0, text: "Unit Relic. Attached entity gains cosmetic mastery progress in PvE and normalized PvP.", rarity: "Uncommon", attackType: "Kinetic", lore: "Proof that the soldier was there when the sector changed names.", battleReady: false, catalogSet: "set004" },
  { defId: "world_survey_license", name: "World Survey License", faction: "neutral", type: "Skill", cost: 1, attack: 0, hp: 0, text: "Domain Skill. Surveyed worlds reveal their upgrade paths and resource traits faster.", rarity: "Common", attackType: "Kinetic", lore: "Permission to ask the ground what it is hiding.", battleReady: false, catalogSet: "set004" },
  { defId: "guild_engineer", name: "Guild Engineer", faction: "neutral", type: "Entity", cost: 2, attack: 1, hp: 3, text: "Adjacent structures gain project XP at end step if you control their world.", rarity: "Uncommon", attackType: "Kinetic", lore: "Give them a tool and a deadline and they will make the planet nervous.", battleReady: false, catalogSet: "set004" },
  { defId: "relic_socketing_kit", name: "Relic Socketing Kit", faction: "neutral", type: "Project", cost: 3, attack: 0, hp: 0, text: "Engineering Project. Unlock one relic slot in campaign and domain loadouts.", rarity: "Rare", attackType: "Tech", lore: "A small kit for attaching large consequences.", battleReady: false, catalogSet: "set004" },
  { defId: "ascension_journal", name: "Ascension Journal", faction: "neutral", type: "Relic", cost: 3, attack: 0, hp: 0, text: "Commander Relic. Records Influence victories and boss clears for commander progression.", rarity: "Rare", attackType: "Astral", lore: "The pages refuse to remember defeats unless they taught something expensive.", battleReady: false, catalogSet: "set004" },
  { defId: "training_simulator", name: "Training Simulator", faction: "neutral", type: "Project", cost: 4, attack: 0, hp: 0, text: "Domain Project. PvE battles grant extra card mastery XP without affecting fair PvP stats.", rarity: "Holo", attackType: "Tech", lore: "The wounds are fake. The lessons are not.", battleReady: false, catalogSet: "set004" },
  { defId: "world_level_charter", name: "World Level Charter", faction: "neutral", type: "Science", cost: 3, attack: 0, hp: 0, text: "Science. A controlled world can start its next level objective after survey completion.", rarity: "Rare", attackType: "Kinetic", lore: "A legal document telling a planet it is allowed to become stranger.", battleReady: false, catalogSet: "set004" },
  { defId: "class_specialization_token", name: "Class Specialization Token", faction: "neutral", type: "Skill", cost: 3, attack: 0, hp: 0, text: "Commander Skill. Choose one specialization path for campaign loadouts.", rarity: "Rare", attackType: "Astral", lore: "A choice cut into metal so the commander cannot pretend it was temporary.", battleReady: false, catalogSet: "set004" },
  { defId: "artifact_recovery_team", name: "Artifact Recovery Team", faction: "neutral", type: "Entity", cost: 2, attack: 1, hp: 2, text: "When a structure is destroyed nearby, gain relic discovery progress.", rarity: "Uncommon", attackType: "Kinetic", lore: "They arrive after the explosion and invoice before the smoke clears.", battleReady: false, catalogSet: "set004" },
  { defId: "masterwork_blueprint", name: "Masterwork Blueprint", faction: "neutral", type: "Project", cost: 5, attack: 0, hp: 0, text: "Project. One fully mastered card can unlock an earnable sidegrade blueprint.", rarity: "Mythic", attackType: "Tech", lore: "A plan for making something famous twice.", battleReady: false, catalogSet: "set004" },
  { defId: "domain_ascension_protocol", name: "Domain Ascension Protocol", faction: "neutral", type: "Evolution", cost: 6, attack: 0, hp: 0, text: "Evolution. A level 5 world can begin its Ascendant transformation objective.", rarity: "Mythic", attackType: "Astral", lore: "The civilization stops living on the world and starts becoming it.", battleReady: false, catalogSet: "set004" },
];

export const PLAYABLE_CARD_DEFS = CARD_DEFS.filter(
  (card) => card.battleReady !== false && (card.type === "Entity" || card.type === "Anomaly")
);

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
      const def = PLAYABLE_CARD_DEFS.find((d) => d.defId === defId)!;
      return instantiate(def, "player");
    })
    .sort(() => Math.random() - 0.5);
}

export function buildDeckFromIds(ids: string[], side: Side): MatchCard[] {
  const playableIds = ids.filter((defId) => PLAYABLE_CARD_DEFS.some((d) => d.defId === defId));
  const finalIds = playableIds.length > 0 ? playableIds : PLAYER_DECK_IDS;
  return finalIds
    .map((defId) => {
      const def = PLAYABLE_CARD_DEFS.find((d) => d.defId === defId) || PLAYABLE_CARD_DEFS[0];
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
  if (card.type !== "Entity" && card.type !== "Anomaly") return false;
  if (card.type === "Entity") {
    // need at least one deploy target across columns
    return [0, 1, 2].some((col) => deployTargetFor("player", col, state.sectors) !== null);
  }
  return card.type === "Anomaly";
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
  } else if (card.type === "Anomaly") {
    // anomaly
    p.resonance -= card.cost;
    p.hand.splice(handIdx, 1);
    resolveAnomaly(next, card, "player", "enemy");
  } else {
    return next;
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
    const playableIdx = e.hand.findIndex((c) => c.cost <= e.resonance && (c.type === "Entity" || c.type === "Anomaly"));
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
    } else if (card.type === "Anomaly") {
      // HARD AI: hold Smite until it's lethal; others cast freely
      if (next.difficulty === "hard" && card.defId === "smite" && next.player.hp > 3) {
        // skip this card this turn (leave in hand)
        break;
      }
      e.resonance -= card.cost;
      e.hand.splice(playableIdx, 1);
      resolveAnomaly(next, card, "enemy", "player");
      if (next.phase === "over") return next;
    } else {
      break;
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
