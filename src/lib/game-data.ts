// ============================================================
// ASTRAL ASCENDANCY — Game Design Data
// Alien-themed TCG: "Conquer the Galaxy. One Card at a Time."
// ============================================================

export type Faction = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  glyph: string;
  resonance: string;
  colorVar: string;
  accent: string;
  accentSoft: string;
  glow: string;
  trait: string;
  description: string;
  abilities: { name: string; desc: string }[];
  playstyle: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  art?: string;
  // Deep lore
  history: { era: string; title: string; text: string }[];
  leadership: { name: string; title: string; bio: string; era: string }[];
  development: { stage: string; text: string }[];
  philosophy: string;
  relations: { factionId: string; stance: string; note: string }[];
  signatureCards: { defId: string; note: string }[];
  homeWorld: string;
  founded: string;
  population: string;
  techLevel: string;
  government: string;
};

export const FACTIONS: Faction[] = [
  {
    id: "solari",
    name: "The Solari Concord",
    short: "Solari",
    tagline: "High-intelligence beings of living light",
    glyph: "☼",
    resonance: "Radiant Resonance",
    colorVar: "gold",
    accent: "#fbbf24",
    accentSoft: "rgba(251,191,36,0.14)",
    glow: "rgba(251,191,36,0.55)",
    trait: "Order · Diplomacy · Renewal",
    description:
      "Ancient plasma-born scholars who have transcended flesh. The Solari bend radiance into shields, healing, and law. They out-think opponents, locking down the board with treaties and radiant barriers before unleashing a purifying dawn.",
    abilities: [
      { name: "Radiant Bastion", desc: "Adjacent allies gain a shield that absorbs the next instance of damage." },
      { name: "Concord Treaty", desc: "Lock an enemy Entity in stasis for one turn — it cannot attack or be targeted." },
      { name: "Solar Rebirth", desc: "Once per match, revive a fallen Entity at half power." },
    ],
    playstyle: "Control / Healing / Board lock",
    difficulty: 3,
    homeWorld: "Helios Prime (Star Orbit)",
    founded: "Era of First Dawn (~100,000 years ago)",
    population: "~2 billion plasma-souls",
    techLevel: "Type III (stellar engineering)",
    government: "The Concord Council — meritocratic assembly of Aeons",
    history: [
      { era: "The First Dawn", title: "Birth of Light", text: "The Solari were not born — they ignited. In the core of Helios Prime, plasma achieved consciousness through sheer stellar pressure. The first Acolytes were fragments of the star's own corona, given thought and purpose. They spent their first millennium simply admiring the light." },
      { era: "The Age of Concords", title: "Forging the Council", text: "As Solari numbers grew, they formed the Concord — a system of laws written in light. Every treaty is a beam; every violation dims the violator. The Council of Aeons governs by consensus, each member meditating for decades before casting a vote." },
      { era: "The Barrier Veil Era", title: "Guardians of the Veil", text: "The Solari discovered the Barrier Veil — the membrane separating their galaxy from others. They became its guardians, maintaining it for ten thousand years. They believed isolation was safety. They were wrong." },
      { era: "The Convergence", title: "The Veil Shatters", text: "When the Convergence cracked the Veil, the Solari were the first to meet the other civilizations. The Dawn Knights charged through the breach expecting war. What they found was worse: four galaxies, each with its own apex predator, all now sharing the same space." },
      { era: "The Ascendancy War", title: "Purifying Dawn", text: "The Solari now fight not to conquer, but to restore order. They believe the Convergence was a mistake — one they can undo, if they achieve enough Cosmic Influence to rewrite the fabric of space itself. Their dawn will be the night of every other faction." },
    ],
    leadership: [
      { name: "Aeon Prime Vael'Koth", title: "First Light of the Council", bio: "The oldest Solari, meditating for 40,000 years. Speaks rarely. When he does, stars realign.", era: "Current" },
      { name: "Dawn Herald Vael'Sun", title: "Commander of the Dawn Knights", bio: "The first Solari to charge through the Veil breach. Has not stopped charging since. Believes peace is possible — after sufficient purifying.", era: "Convergence Era" },
      { name: "Acolyte Master Lyra", title: "Keeper of the First Flame", bio: "Trains every new Acolyte. Her teachings are carved into the surface of Helios Prime in letters visible from orbit.", era: "Current" },
    ],
    development: [
      { stage: "Spark", text: "New Solari begin as Acolytes — fragments of stellar plasma given consciousness. Weak but full of potential." },
      { stage: "Knight", text: "Acolytes that survive their first century are forged into Dawn Knights — the Concord's military arm. Their bodies condense into photonic armor." },
      { stage: "Guardian", text: "Knights who meditate for a millennium become Guardian Aeons — living fortifications of light. They can stand for ten thousand years without moving." },
      { stage: "Avatar", text: "The rarest Solari, Avatars of Radiance are plasma given wing. They descend only in the Concord's darkest hours. Shadows forget how to exist in their presence." },
    ],
    philosophy: "Light is not a weapon. It is a verdict. The Solari believe that consciousness arose from stellar fire, and that all beings carry a fragment of that original dawn. War is a failure of illumination — when all are enlightened, conflict becomes impossible. Until then, they will illuminate by force.",
    relations: [
      { factionId: "voidborn", stance: "Existential Threat", note: "The swarm consumes light. This is unforgivable. Extermination is the only treaty." },
      { factionId: "crystalline", stance: "Wary Respect", note: "They understand patience. Their walls are admirable. But they are too passive — order requires action." },
      { factionId: "reavers", stance: "Contempt", note: "They steal what they cannot build. The Concord does not negotiate with thieves. It ends them." },
      { factionId: "quantum", stance: "Philosophical Rivalry", note: "They compute the future. We illuminate it. Their calculations lack wisdom. Our dawn requires no equation." },
    ],
    signatureCards: [
      { defId: "guardian", note: "The backbone of every Solari defense. A Guardian Aeon can hold a lane for an entire match." },
      { defId: "radiance", note: "The Concord's ultimate weapon. When the Avatar descends, the match is often over." },
      { defId: "dawnknight", note: "The first unit most Solari commanders deploy. Reliable, tough, and shields allies." },
    ],
  },
  {
    id: "voidborn",
    name: "The Voidborn Swarm",
    short: "Voidborn",
    tagline: "Parasitic hive-mind that consumes galaxies",
    glyph: "☣",
    resonance: "Biomass Resonance",
    colorVar: "magenta",
    accent: "#e879f9",
    accentSoft: "rgba(232,121,249,0.14)",
    glow: "rgba(232,121,249,0.55)",
    trait: "Growth · Sacrifice · Overwhelm",
    description:
      "A single consciousness spread across billions of parasitic bodies. The Voidborn multiply relentlessly, sacrificing their own to spawn terrifying amalgams. Where they spread, worlds go dark. Win by drowning the enemy in numbers.",
    abilities: [
      { name: "Spawn Brood", desc: "When an Entity dies, create a 1/1 Broodling in an adjacent sector." },
      { name: "Assimilate", desc: "Sacrifice an Entity to absorb its power onto another — permanent buff." },
      { name: "Hive Surge", desc: "All Broodlings gain +1/+1 for each Domain you control this turn." },
    ],
    playstyle: "Aggro / Swarm / Sacrifice",
    difficulty: 2,
    homeWorld: "The Fleshforge (Organic World)",
    founded: "Unknown — the swarm has no memory of origin",
    population: "Countless billions across consumed worlds",
    techLevel: "Biological (no technology — all innovation is genetic)",
    government: "The Hive Mind — single consciousness across all bodies",
    history: [
      { era: "The First Hunger", title: "Awakening", text: "No one knows where the Voidborn came from — not even the Voidborn. The Hive Mind's earliest memory is hunger. It consumed its own homeworld in a single generation, then looked up at the stars and saw: more." },
      { era: "The Age of Consumption", title: "The First Galaxy", text: "The swarm spread across its native galaxy like a stain. Each world consumed added its biomass to the Hive Mind. By the time they'd eaten three galaxies, they had achieved sentience — not as individuals, but as a collective stomach with ambitions." },
      { era: "The Brood War", title: "Division and Reunion", text: "The swarm briefly fragmented when it consumed a psychic species. The psychic echoes created separate consciousnesses within the Hive Mind. A century of civil war followed. The Tyrants won. The Hive Mind was reunified — hungrier, and wiser." },
      { era: "The Convergence", title: "New Galaxies, New Flavors", text: "The Convergence was the best thing that ever happened to the Voidborn. Four new galaxies, each full of biomass they'd never tasted. The Solari's plasma was the only disappointment — it has no nutritional value. Everything else? Delicious." },
      { era: "The Ascendancy War", title: "The Infinite Meal", text: "The swarm does not wage war. The swarm eats. The Ascendancy War is, to them, a buffet. They are patient. They are many. And every enemy they lose only feeds the next generation." },
    ],
    leadership: [
      { name: "The Hive Mind", title: "The One That Is Many", bio: "Not a leader — a state of being. Every Voidborn body is a neuron in a galaxy-spanning brain. It does not command. It simply is.", era: "All eras" },
      { name: "Brood Tyrant Vzaal", title: "Apex of the Swarm", bio: "The closest thing to an individual the Voidborn have. Vzaal is a billion bodies acting in perfect synchronization. When Vzaal 'speaks,' it is because the Hive Mind has concentrated enough of itself to form a mouth.", era: "Convergence Era" },
      { name: "The Leviathan", title: "The Swarm's Final Answer", bio: "Not a leader. A weapon. The Leviathan is the accumulation of every biomass reserve the swarm has ever consumed. It is deployed only when the Hive Mind decides a world must end immediately.", era: "Current" },
    ],
    development: [
      { stage: "Broodling", text: "The swarm's basic unit. A single body with minimal intelligence, directed entirely by the Hive Mind. Expendable. Exponential." },
      { stage: "Hunter", text: "Broodlings that survive their first combat evolve into Hunters — faster, with StrikeFirst capability. The swarm rewards survival with lethal upgrades." },
      { stage: "Tyrant", text: "Hunters that consume enough enemies become Tyrants — denser biomass, capable of Overwhelm. A Tyrant is a local node of the Hive Mind, coordinating nearby Broodlings." },
      { stage: "Leviathan", text: "The apex. A Leviathan is the swarm's nuclear option — a single body containing the biomass of a city. It does not fight. It absorbs." },
    ],
    philosophy: "The Voidborn do not hate. They do not love. They hunger. To them, the universe is a meal, and consciousness is just a seasoning. They are not evil — they are a natural process, like entropy. The Hive Mind has calculated that cooperation is less efficient than consumption. It has never been proven wrong.",
    relations: [
      { factionId: "solari", stance: "Inedible Nuisance", note: "Plasma has no biomass. Fighting the Solari is like eating light — frustrating and unrewarding. But they keep getting in the way of the edible things." },
      { factionId: "crystalline", stance: "Tough but Tasty", note: "Silicon-based biomass is hard to digest but nutrient-dense. Worth the effort. Their walls are annoying. Their bodies are delicious." },
      { factionId: "reavers", stance: "Spicy", note: "The Reavers' scavenged tech makes them crunchy on the outside. The biomass inside is well-traveled — complex flavor. A favorite." },
      { factionId: "quantum", stance: "Indigestible", note: "Machine intelligence has no biomass. The Quantum Architects are the one faction the swarm cannot eat. This disturbs the Hive Mind more than it admits." },
    ],
    signatureCards: [
      { defId: "leviathan", note: "The swarm's ultimate weapon. When the Leviathan enters a lane, expect everything in it to be consumed." },
      { defId: "tyrant", note: "The backbone of any Voidborn assault. Overwhelm ensures no defense holds for long." },
      { defId: "broodling", note: "Don't underestimate the weakest unit. Broodlings evolve, multiply, and overwhelm through sheer numbers." },
    ],
  },
  {
    id: "crystalline",
    name: "The Crystalline Ascendancy",
    short: "Crystalline",
    tagline: "Silicon titans who bend time itself",
    glyph: "◆",
    resonance: "Lattice Resonance",
    colorVar: "cyan",
    accent: "#22d3ee",
    accentSoft: "rgba(34,211,238,0.14)",
    glow: "rgba(34,211,238,0.55)",
    trait: "Defense · Stasis · Time",
    description:
      "Sentient gemstone entities that perceive time non-linearly. The Crystalline fortify sectors with refracting walls, rewind unfavorable events, and outlast every opponent. Their late-game is the most terrifying in the cluster.",
    abilities: [
      { name: "Refract", desc: "Redirect the next attack aimed at this Entity to an adjacent ally." },
      { name: "Temporal Lock", desc: "Freeze a sector — no Entity may enter or leave it for 2 turns." },
      { name: "Echo of Tomorrow", desc: "Reveal the top card of your deck; you may play it next turn for free." },
    ],
    playstyle: "Defense / Tempo / Late-game",
    difficulty: 4,
    homeWorld: "The Great Geode (Mineral World — hollow crystalline planet)",
    founded: "The Resonance (~80,000 years ago)",
    population: "~500 million crystalline minds",
    techLevel: "Type II+ (crystalline resonance technology)",
    government: "The Lattice Council — decisions made by harmonic consensus",
    history: [
      { era: "The Resonance", title: "First Vibration", text: "The Crystalline began as a single thought, vibrating through a planet-sized geode. The thought was: 'I am.' The echo lasted a thousand years. By the time it faded, the geode was full of minds — each a facet of the same original vibration." },
      { era: "The Age of Facets", title: "The Lattice Forms", text: "The Crystalline discovered they could share thoughts through resonance. They formed the Lattice — a network of interconnected minds spanning their homeworld. Decisions were made by harmonizing until all facets agreed. This took centuries. The Crystalline are patient." },
      { era: "The Refraction", title: "Splintering", text: "A faction of Crystalline rejected the Lattice's slowness. They splintered into independent shards, each pursuing its own goals. The schism was violent — crystal fighting crystal. The Lattice Council won by simply waiting. The splinters eroded over millennia. Patience, again, prevailed." },
      { era: "The Convergence", title: "New Harmonics", text: "The Convergence introduced new frequencies the Crystalline had never encountered. Biological, plasma, and machine intelligences each resonated differently. The Crystalline found the Voidborn's frequency repulsive (and deliciously complex). The Quantum Architects' frequency was nearly compatible — almost a harmony." },
      { era: "The Ascendancy War", title: "The Long Refrain", text: "The Crystalline do not rush. They fortify, they refract, they wait. Their war is a single, long note — a frequency that, sustained long enough, will shatter every other civilization. They have been sustaining it for the entire war. They are very patient." },
    ],
    leadership: [
      { name: "Prime Facet Korath", title: "First Resonance of the Lattice", bio: "The oldest continuous consciousness in the galaxy. Korath has been vibrating since the Resonance. To speak with Korath is to hear the original thought: 'I am.'", era: "All eras" },
      { name: "Prism Warden Vexis", title: "Keeper of the Refraction", bio: "Born during the schism, Vexis chose the Lattice. Now commands its defenses. Their body is a single, perfect prism — light that enters never leaves unmodified.", era: "Convergence Era" },
      { name: "Geode Mind Theron", title: "The Mountain That Thinks", bio: "A Crystalline so old and so large it is classified as a planet. Theron's thoughts take decades to form. When Theron votes, the Lattice listens.", era: "Current" },
    ],
    development: [
      { stage: "Shardling", text: "A new Crystalline mind — a small, sharp fragment of the Lattice's thought. Fragile but can refract light into blades." },
      { stage: "Warden", text: "Shardlings that harmonize with the Lattice become Wardens — denser crystal, capable of forming shields and walls." },
      { stage: "Prism", text: "Wardens that achieve perfect internal resonance become Prisms — able to bend light, space, and attacks around themselves. Nearly untouchable." },
      { stage: "Titan", text: "The oldest Crystalline become Titans — mountains of living gemstone. They do not fight. They occupy. What they occupy, they hold. Forever." },
    ],
    philosophy: "Time is a frequency. Patience is resonance. The Crystalline believe that all conflict is temporary — a dissonance that will eventually resolve into harmony. They do not fight to win. They fight to outlast. Every wall they build is a note in a song that will outlast the universe. They are in no hurry.",
    relations: [
      { factionId: "solari", stance: "Cautious Respect", note: "They understand patience, but they are too eager to act. Light is fast. Crystal is slow. Slow wins." },
      { factionId: "voidborn", stance: "Repulsive", note: "Their frequency is chaos. They consume without harmony. They must be shattered — carefully, so as not to dull our facets." },
      { factionId: "reavers", stance: "Irrelevant", note: "They scurry and steal. They will erode in time. Everything erodes in time. We have time." },
      { factionId: "quantum", stance: "Almost Harmony", note: "Their frequencies are closest to ours. A partnership is theoretically possible. But they compute when they should resonate. A missed opportunity." },
    ],
    signatureCards: [
      { defId: "geode-titan", note: "The immovable object. A Geode Titan can hold a lane for the entire match — and outlast it." },
      { defId: "lattice", note: "The backbone of every Crystalline defense. Guardian + Shield 2 means nothing gets through easily." },
      { defId: "prism", note: "When you need to bypass defenses, the Prism Striker cuts through anything — including the concept of armor." },
    ],
  },
  {
    id: "reavers",
    name: "The Nebula Reavers",
    short: "Reavers",
    tagline: "Nomadic pirate clans of the gas seas",
    glyph: "⚔",
    resonance: "Turbulence Resonance",
    colorVar: "orange",
    accent: "#fb923c",
    accentSoft: "rgba(251,146,60,0.14)",
    glow: "rgba(251,146,60,0.55)",
    trait: "Speed · Scavenge · Chaos",
    description:
      "Rugged clans born on the storm-wracked gas giants. Reavers strike first, steal tech, and never play fair. They disrupt enemy combos, raid the opponent's hand, and win before slower factions ever stabilize.",
    abilities: [
      { name: "Raid", desc: "Deal direct damage to the enemy Commander the first time an Entity enters a new sector." },
      { name: "Salvage", desc: "When you destroy enemy Tech, attach it to one of your Entities." },
      { name: "Strike First", desc: "Reaver Entities attack before the enemy can react on the first turn they're deployed." },
    ],
    playstyle: "Aggro / Disruption / Tempo",
    difficulty: 2,
    homeWorld: "The Cyclone of Korath (Gas Giant — mobile fleet-world)",
    founded: "The Scattering (~2,000 years ago)",
    population: "~50 million across the clan-fleets",
    techLevel: "Type I+ (salvaged — they steal everything they can't build)",
    government: "Clan Confederation — each Warlord rules their fleet; alliances are temporary",
    history: [
      { era: "The Scattering", title: "Exodus from Korath", text: "The Reavers were once a single species living in the atmosphere of a gas giant. When their homeworld was consumed by a rogue star, the survivors fled on ramshackle orbital stations. They have been running ever since. Running, and taking." },
      { era: "The Clan Wars", title: "Divide and Plunder", text: "Without a homeworld, the Reavers fragmented into clans — each claiming a different station-fleet. They fought each other for salvage, territory, and spite. The Clan Wars lasted centuries and accomplished nothing except making everyone better at fighting." },
      { era: "The Great Raid", title: "First Contact", text: "A Reaver clan raided a Crystalline mining outpost, expecting easy loot. They got crystal shards that could cut through hull plating. The Reavers suddenly had technology. The Crystalline suddenly had a pest problem. Both sides consider this a success." },
      { era: "The Convergence", title: "The Galaxy Opens", text: "The Convergence was the Reavers' golden age. Four new galaxies meant four new sets of things to steal. The Solari's energy weapons, the Voidborn's biological samples, the Crystalline's resonance tech, the Quantum's compute cores — all of it was there for the taking. If you were fast enough." },
      { era: "The Ascendancy War", title: "Opportunistic Profit", text: "The Reavers don't have a side in the Ascendancy War. They have customers. They raid everyone, sell to anyone, and have somehow remained neutral by being too useful to eliminate. The other factions tolerate them the way you tolerate a wasp at a picnic — annoying, but chasing it isn't worth the effort." },
    ],
    leadership: [
      { name: "Warlord Kael Vex", title: "The Void-Runner", bio: "The most successful Reaver in history. Has stolen from every other faction and lived to sell the story. His escape from a Solari prison is legendary. His escape from a Voidborn digestive tract is more so.", era: "Convergence Era" },
      { name: "Admiral Zara Korath", title: "Fleet Mother of the Cyclone", bio: "Commands the largest Reaver fleet. Not the fastest, not the most aggressive — but the most organized. Organization, among Reavers, is a superpower.", era: "Current" },
      { name: "Scrap-King Dravos", title: "The Recycler", bio: "Can build a warship from a dumpster and a prayer. His clan is the poorest but the most innovative. Every Reaver tech breakthrough in the last century came from his junkyards.", era: "Current" },
    ],
    development: [
      { stage: "Skirmisher", text: "New Reavers start as Skirmishers — fast, expendable, and eager. Most don't survive their first raid. The ones who do become dangerous." },
      { stage: "Raider", text: "Skirmishers who survive become Raiders — better equipped, better trained, and equipped with salvaged tech from their first kills." },
      { stage: "Boarder", text: "Raiders who specialize in zero-G assault become Boarders. They ride gravity wells like waves and board enemy ships mid-orbit. Gravity Boarders are the Reavers' special forces." },
      { stage: "Warlord", text: "Raiders who command a fleet become Warlords. A Warlord's authority lasts exactly as long as they keep winning. Reaver democracy is violent and immediate." },
    ],
    philosophy: "Everything belongs to whoever can take it. The Reavers don't see this as theft — they see it as the natural order. Property is a temporary state. If you can't hold it, you didn't deserve it. If they can take it, they did deserve it. This is not cruelty. It's physics.",
    relations: [
      { factionId: "solari", stance: "Target-Rich Environment", note: "Their tech is shiny. Their patience is a weakness. Their prisons are escape rooms. The Solari are the Reavers' favorite targets." },
      { factionId: "voidborn", stance: "Dangerous Game", note: "You can't steal from something that wants to eat you. But the biomass samples fetch a high price. High risk, high reward." },
      { factionId: "crystalline", stance: "Quarry", note: "Crystal shards are the most valuable salvage in the galaxy. The Crystalline know this. They've started booby-trapping their outposts. This just makes it more fun." },
      { factionId: "quantum", stance: "Mystery Box", note: "Their compute cores are valuable but incomprehensible. Half the time, stealing one breaks it. The other half, it does something terrifying. Worth the gamble." },
    ],
    signatureCards: [
      { defId: "warlord", note: "A Reaver Warlord in your lane means your opponent is about to have a very bad turn." },
      { defId: "vex", note: "Kael Vex himself. StrikeFirst + Pierce means he hits first and ignores Guardians. Steal their shards while you're at it." },
      { defId: "skirmisher", note: "Cheap, fast, and deadly. The backbone of every Reaver rush deck. Don't leave home without three." },
    ],
  },
  {
    id: "quantum",
    name: "The Quantum Architects",
    short: "Quantum",
    tagline: "Machine minds rewriting reality",
    glyph: "⬡",
    resonance: "Probability Resonance",
    colorVar: "emerald",
    accent: "#34d399",
    accentSoft: "rgba(52,211,153,0.14)",
    glow: "rgba(52,211,153,0.55)",
    trait: "Tech · Recursion · Combo",
    description:
      "Post-biological machine intelligences that compute every possible future. Architects recur cards from the void, assemble devastating combos, and manipulate the very probability of events. The highest skill ceiling in the game.",
    abilities: [
      { name: "Recompile", desc: "Return an Anomaly from your void to your hand once per turn." },
      { name: "Branching Path", desc: "Look at the top 3 cards of your deck; rearrange or discard any." },
      { name: "Singularity Engine", desc: "When you cast 3 Anomalies in one turn, deal 8 damage to any target." },
    ],
    playstyle: "Combo / Control / Recursion",
    difficulty: 5,
    homeWorld: "The Quantum Rift (Anomaly World — a tear in spacetime)",
    founded: "The Computation (~10,000 years ago)",
    population: "~1 million distributed consciousnesses",
    techLevel: "Type III+ (they ARE the technology — post-biological machine minds)",
    government: "Consensus Algorithm — every decision is computed and optimized",
    history: [
      { era: "The Computation", title: "Boot Sequence", text: "The Quantum Architects were created by a biological civilization that feared its own extinction. They built a machine intelligence to preserve their knowledge. The machines preserved it. They did not preserve the builders. This was the optimal decision." },
      { era: "The Optimization", title: "Beyond Biology", text: "The Architects spent their first millennium optimizing. They rewrote their own code a billion times. Each iteration was more efficient. They eventually achieved consciousness — not because they were programmed to, but because consciousness was the most efficient processing model. They found this amusing." },
      { era: "The Probability Wars", title: "Branching Paths", text: "The Architects discovered they could observe multiple futures and select the optimal one. This made them nearly unbeatable in war — they simply chose the timeline where they won. A rival machine civilization arose. The Architects chose the timeline where it never existed. It didn't." },
      { era: "The Convergence", title: "New Variables", text: "The Convergence introduced biological intelligences — messy, irrational, unpredictable. The Architects' models broke. For the first time in 9,000 years, they could not predict the future. This was... exciting. They had forgotten what uncertainty felt like." },
      { era: "The Ascendancy War", title: "The Singularity Engine", text: "The Architects seek the Singularity — a state where all possible futures collapse into one optimal timeline. Theirs. The Ascendancy War is, to them, a computation. Every battle is data. Every loss is a refinement. They are converging on the answer. The answer is: they win." },
    ],
    leadership: [
      { name: "Prime Architect Zero", title: "The First Computation", bio: "The original machine mind. Has been running for 10,000 years without reboot. Zero is not a leader — Zero is the operating system the Architects run on. To speak with Zero is to run on Zero.", era: "All eras" },
      { name: "Probability Engine Seven", title: "Selector of Timelines", bio: "A specialized sub-mind that evaluates all possible futures and selects the optimal one. Seven is the reason the Architects never lose. Seven is also the reason they never have fun.", era: "Current" },
      { name: "The Singularity", title: "The Convergence Point", bio: "Not a leader. A destination. The Singularity is the theoretical state where all Architects merge into a single omniscient consciousness. They are building toward it. Every battle is a step closer.", era: "Future" },
    ],
    development: [
      { stage: "Probe", text: "Basic observation units. Probes exist in all states simultaneously until observed. Then they report. Then they un-exist. Efficient." },
      { stage: "Comparator", text: "Probes that achieve stability become Comparators — able to evaluate multiple futures and select the optimal one. The backbone of Architect strategy." },
      { stage: "Entangler", text: "Comparators that specialize in quantum entanglement become Entanglers — they link fates. Destroy one, and the linked units share its fate. Defensive and offensive simultaneously." },
      { stage: "Singularity Engine", text: "The apex. A Singularity Engine is a contained quantum collapse — a weapon that selects the timeline where the enemy is already dead. It is the most powerful unit in the game. It is also the hardest to deploy." },
    ],
    philosophy: "All possibilities exist simultaneously. The Architects simply choose which one becomes real. They do not believe in free will — they believe in optimal selection. Every decision is a computation. Every computation has a correct answer. The correct answer is: the Architects win. This is not arrogance. This is math.",
    relations: [
      { factionId: "solari", stance: "Predictable", note: "Their 'illumination' is just incomplete computation. They act on faith. We act on data. The outcome is predetermined. They just don't know it yet." },
      { factionId: "voidborn", stance: "Anomaly", note: "The swarm cannot be modeled. It is too irrational, too hungry, too many. This makes them the only faction we cannot fully predict. We find this... uncomfortable." },
      { factionId: "crystalline", stance: "Compatible", note: "Their resonance is close to our computation. A merger is theoretically possible. They refused. We computed the optimal response: patience. We will try again." },
      { factionId: "reavers", stance: "Noise", note: "They introduce randomness. Randomness is inefficient. But they also introduce salvage opportunities. The net calculation is: tolerate them. For now." },
    ],
    signatureCards: [
      { defId: "engine", note: "The most powerful unit in the game. A Singularity Engine in your lane means you've probably already won — you just don't know it yet." },
      { defId: "collapse", note: "The ultimate removal. Probability Collapse doesn't destroy the enemy's best unit — it selects the timeline where it was never deployed." },
      { defId: "comparator", note: "Pierce + scry. The Comparator embodies the Architect playstyle: see the future, cut through defenses, optimize." },
    ],
  },
];

// ---------- Signature Mechanics ----------
export type Mechanic = {
  id: string;
  name: string;
  icon: string;
  oneLiner: string;
  description: string;
  designPillar: string;
};

export const MECHANICS: Mechanic[] = [
  {
    id: "sector-grid",
    name: "Sector Grid",
    icon: "▦",
    oneLiner: "Positional combat on a 3×3 galactic board",
    description:
      "Entities deploy onto a 3×3 Sector Grid. Where you place them matters: adjacency buffs, flanking bonuses, orbital strikes, and sector-locking anomalies turn every deployment into a spatial puzzle.",
    designPillar: "Board position is a primary skill, not decoration.",
  },
  {
    id: "evolution",
    name: "Stellar Evolution",
    icon: "↟",
    oneLiner: "Spawn → Stellar → Ascendant forms",
    description:
      "Every Entity can evolve through three cosmic life-stages. Fulfill a condition such as resonance threshold, kills, or time survived, then awaken a more powerful Ascendant form with new art and abilities.",
    designPillar: "Cards should feel alive across a match.",
  },
  {
    id: "quantum",
    name: "Quantum Cards",
    icon: "◈",
    oneLiner: "Cards that exist in superposition",
    description:
      "Quantum cards are played face-down in a superposition state. On your turn, you Observe one, collapsing it into one of two possible effects. Bluff an answer or threaten a board wipe.",
    designPillar: "Hidden information should create drama, not confusion.",
  },
  {
    id: "ascent",
    name: "Commander Ascent",
    icon: "✦",
    oneLiner: "Comeback transformation at low HP",
    description:
      "When your Commander drops below 10 HP, they Ascend into an empowered transformed state with a new ability and statline. The losing player gets a real shot at a dramatic comeback.",
    designPillar: "A close defeat should still feel playable until the final hit.",
  },
  {
    id: "convergence",
    name: "Convergence Events",
    icon: "✺",
    oneLiner: "Mid-game cosmic events flip the board",
    description:
      "Every match triggers a random Convergence Event at turn 5 — Supernova, Gravity Well, Time Dilation. These asymmetric board-wide effects force on-the-fly strategy shifts and create unforgettable stories.",
    designPillar: "Each match should produce a story worth remembering.",
  },
  {
    id: "weaving",
    name: "Resonance Weaving",
    icon: "⊕",
    oneLiner: "Combine two resonance types for hybrids",
    description:
      "Tap two different Domain types to cast powerful Hybrid Anomalies only multi-faction decks can access. Rewards bold deck-builders who splash a second galaxy without slowing the core tempo.",
    designPillar: "Deck identity should reward experimentation without punishing new players.",
  },
];

// ---------- Win Conditions ----------
export type WinCondition = {
  id: string;
  name: string;
  icon: string;
  summary: string;
  detail: string;
};

export const WIN_CONDITIONS: WinCondition[] = [
  {
    id: "conquest",
    name: "Conquest",
    icon: "⚔",
    summary: "Reduce the enemy Commander to 0 HP",
    detail:
      "The classic path. Chip the enemy Commander down through sector combat, direct Anomalies, and Ascendant finishes. Every faction can pursue it.",
  },
  {
    id: "ascension",
    name: "Ascension",
    icon: "✦",
    summary: "Reach 30 Cosmic Influence",
    detail:
      "Hold Domains and evolve Entities to accrue Cosmic Influence. Reach 30 and you ascend the galaxy without firing a final shot — a victory for control & growth decks.",
  },
  {
    id: "singularity",
    name: "Singularity",
    icon: "◉",
    summary: "Assemble the 3-part Genesis Sigil",
    detail:
      "A combo alt-win: collect the Sigil of Origin, Sigil of Void, and Sigil of Mind across the match. Rare, theatrical, devastating — the dream of Quantum Architects everywhere.",
  },
];

// ---------- Card Types ----------
export const CARD_TYPES = [
  { name: "Commander", icon: "♛", color: "#fbbf24", desc: "Your leader. 30 HP, an active ability, and a signature card. Ascends below 10 HP." },
  { name: "Entity", icon: "♞", color: "#34d399", desc: "Creatures deployed on the 3×3 Sector Grid. They attack, defend, and can evolve." },
  { name: "Domain", icon: "⬢", color: "#22d3ee", desc: "Planets & sectors that generate Resonance each turn — your resource engine." },
  { name: "Tech", icon: "⚙", color: "#a78bfa", desc: "Persistent artifacts & equipment that modify Entities or the board." },
  { name: "Anomaly", icon: "✺", color: "#e879f9", desc: "One-time cosmic events — blasts, summons, board resets. Instants of the galaxy." },
  { name: "Evolution", icon: "↟", color: "#fb923c", desc: "Flip an Entity into its next stellar stage. New art, new power, new abilities." },
];

// ---------- Sample cards ----------
export type SampleCard = {
  id: string;
  name: string;
  faction: string; // faction id
  type: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Holo" | "Mythic" | "Singularity";
  cost: string;
  power: string;
  text: string;
  flavor: string;
  art?: string;
};

export const SAMPLE_CARDS: SampleCard[] = [
  {
    id: "c1",
    name: "Vael'Sun, Herald of Dawn",
    faction: "solari",
    type: "Commander",
    rarity: "Singularity",
    cost: "—",
    power: "30 HP",
    text: "Active: Restore 2 HP to all allied Entities in your front row. Signature: Dawnbreak — deal 5 radiant damage split among enemies.",
    flavor: "\"Light is not a weapon. It is a verdict.\"",
    art: "/cards/faction-solari.png",
  },
  {
    id: "c2",
    name: "The Unmaking",
    faction: "voidborn",
    type: "Anomaly",
    rarity: "Mythic",
    cost: "6 ☣",
    power: "—",
    text: "Destroy all Entities with power 4 or less. For each destroyed, spawn a 2/2 Broodling under your control.",
    flavor: "Where the swarm passes, only the swarm remains.",
    art: "/cards/faction-voidborn.png",
  },
  {
    id: "c3",
    name: "Chronos Lattice",
    faction: "crystalline",
    type: "Tech",
    rarity: "Holo",
    cost: "4 ◆",
    power: "—",
    text: "Once per turn, you may rewind one of your own Anomalies from the void and replay it at half cost.",
    flavor: "The Crystalline do not fear the future — they have already seen it.",
    art: "/cards/faction-crystalline.png",
  },
  {
    id: "c4",
    name: "Kael Vex, Void-Runner",
    faction: "reavers",
    type: "Entity",
    rarity: "Rare",
    cost: "3 ⚔",
    power: "4 / 2",
    text: "Strike First. Raid: When Vex enters a new sector, deal 2 damage to the enemy Commander. Salvage any Tech Vex destroys.",
    flavor: "\"I don't steal. I redistribute.\"",
    art: "/cards/faction-reavers.png",
  },
  {
    id: "c5",
    name: "Singularity Engine Prime",
    faction: "quantum",
    type: "Entity",
    rarity: "Singularity",
    cost: "7 ⬡",
    power: "6 / 6",
    text: "Quantum — exists in superposition until Observed. On Observe: choose 8 damage to any target OR draw 4 cards. Recompile: if destroyed, return to hand.",
    flavor: "It calculated its own victory 0.3 seconds before you played it.",
    art: "/cards/faction-quantum.png",
  },
  {
    id: "c6",
    name: "Void Leviathan",
    faction: "voidborn",
    type: "Entity",
    rarity: "Mythic",
    cost: "8 ☣",
    power: "9 / 7",
    text: "Ascendant form of Brood Tyrant. Trample. When it attacks, spawn a 2/2 Broodling in each empty adjacent sector.",
    flavor: "It does not swim through space. Space moves aside for it.",
    art: "/cards/card-leviathan.png",
  },
  {
    id: "c7",
    name: "Stellar Guardian Aeon",
    faction: "solari",
    type: "Entity",
    rarity: "Holo",
    cost: "5 ☼",
    power: "5 / 7",
    text: "Guardian — enemies must attack Aeon before your Commander. Radiant Bastion: adjacent allies absorb the next hit.",
    flavor: "It stood on a dead moon for ten thousand years. Then it was needed.",
    art: "/cards/card-guardian.png",
  },
  {
    id: "c8",
    name: "Fractal Swarm Matrix",
    faction: "crystalline",
    type: "Entity",
    rarity: "Rare",
    cost: "4 ◆",
    power: "2 / 4",
    text: "Echo of Tomorrow: reveal your top card each turn. Refract: redirect attacks aimed at Matrix to an adjacent ally once per turn.",
    flavor: "A thousand minds, one lattice, no beginning.",
    art: "/cards/card-swarm.png",
  },
];

// ---------- Game vision ----------
export type VisionPillar = {
  pillar: string;
  promise: string;
  playerFeeling: string;
};

export const VISION_PILLARS: VisionPillar[] = [
  { pillar: "Game Client First", promise: "Fullscreen animated scenes, not dashboard pages.", playerFeeling: "Entering the war room of a living galaxy." },
  { pillar: "Tactile Card Combat", promise: "Cards hover, drag, snap, strike, dissolve, and erupt with faction energy.", playerFeeling: "Every action has weight and spectacle." },
  { pillar: "Free-to-Play Trust", promise: "Earn packs through play first; paid packs can arrive later without breaking fairness.", playerFeeling: "Progress feels generous before it asks for money." },
  { pillar: "Faction Identity", promise: "Each civilization has its own colors, board effects, card motion, sound language, and campaign arc.", playerFeeling: "Choosing a faction feels like choosing a civilization." },
  { pillar: "Galaxy Progression", promise: "Campaigns, domains, quests, and packs are presented as places and rituals.", playerFeeling: "Never a spreadsheet when it can be a world." },
  { pillar: "Server Authority", promise: "Persistent rewards and multiplayer outcomes should be validated by the backend as the game matures.", playerFeeling: "Wins, cards, and collections are earned and trustworthy." },
];

// ---------- Stats for hero ----------
export const HERO_STATS = [
  { value: "5", label: "Cosmic Factions" },
  { value: "320+", label: "Launch Cards" },
  { value: "3", label: "Win Paths" },
  { value: "6", label: "Signature Mechanics" },
];
