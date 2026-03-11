import type { GameConfig } from "@/types/game-config";
import {
  DEFAULT_VISUAL_EFFECTS,
  DEFAULT_AUDIO,
  DEFAULT_ANIMATION,
  DEFAULT_SYMBOLS,
} from "@/types/game-config";

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon: string;
  difficulty: "Facile" | "Moyen" | "Avancé";
  preview: {
    reels: number;
    rows: number;
    mechanic: string;
  };
  config: GameConfig;
}

// ─── Lines 5x3 ───────────────────────────────────────────────
const LINES_SYMBOLS = [
  { id: "h1", name: "H1", type: "high" as const, color: "#E74C3C", paytable: { 3: 2.0, 4: 5.0, 5: 20.0 } },
  { id: "h2", name: "H2", type: "high" as const, color: "#E67E22", paytable: { 3: 1.5, 4: 4.0, 5: 15.0 } },
  { id: "h3", name: "H3", type: "high" as const, color: "#9B59B6", paytable: { 3: 1.2, 4: 3.0, 5: 12.0 } },
  { id: "h4", name: "H4", type: "high" as const, color: "#F1C40F", paytable: { 3: 1.0, 4: 2.5, 5: 10.0 } },
  { id: "h5", name: "H5", type: "high" as const, color: "#FF6B81", paytable: { 3: 0.8, 4: 2.0, 5: 8.0 } },
  { id: "l1", name: "L1", type: "low" as const, color: "#3498DB", paytable: { 3: 0.5, 4: 1.5, 5: 5.0 } },
  { id: "l2", name: "L2", type: "low" as const, color: "#2ECC71", paytable: { 3: 0.4, 4: 1.2, 5: 4.0 } },
  { id: "l3", name: "L3", type: "low" as const, color: "#1ABC9C", paytable: { 3: 0.3, 4: 1.0, 5: 3.0 } },
  { id: "l4", name: "L4", type: "low" as const, color: "#00BCD4", paytable: { 3: 0.2, 4: 0.8, 5: 2.0 } },
  { id: "wild", name: "WILD", type: "wild" as const, color: "#F5A623", paytable: { 5: 50.0 } },
  { id: "scatter", name: "SCATTER", type: "scatter" as const, color: "#00D4FF", paytable: {} },
];

// ─── Ways 5x3 ─────────────────────────────────────────────────
const WAYS_SYMBOLS = [
  { id: "h1", name: "H1", type: "high" as const, color: "#FF4757", paytable: { 3: 1.5, 4: 4.0, 5: 15.0 } },
  { id: "h2", name: "H2", type: "high" as const, color: "#FF6348", paytable: { 3: 1.2, 4: 3.0, 5: 12.0 } },
  { id: "h3", name: "H3", type: "high" as const, color: "#A55EEA", paytable: { 3: 1.0, 4: 2.5, 5: 10.0 } },
  { id: "h4", name: "H4", type: "high" as const, color: "#FED330", paytable: { 3: 0.8, 4: 2.0, 5: 8.0 } },
  { id: "h5", name: "H5", type: "high" as const, color: "#FC5C65", paytable: { 3: 0.6, 4: 1.5, 5: 6.0 } },
  { id: "l1", name: "L1", type: "low" as const, color: "#45AAF2", paytable: { 3: 0.4, 4: 1.0, 5: 4.0 } },
  { id: "l2", name: "L2", type: "low" as const, color: "#26DE81", paytable: { 3: 0.3, 4: 0.8, 5: 3.0 } },
  { id: "l3", name: "L3", type: "low" as const, color: "#2BCBBA", paytable: { 3: 0.2, 4: 0.6, 5: 2.0 } },
  { id: "l4", name: "L4", type: "low" as const, color: "#4ECDC4", paytable: { 3: 0.15, 4: 0.4, 5: 1.5 } },
  { id: "wild", name: "WILD", type: "wild" as const, color: "#F5A623", paytable: {} },
  { id: "scatter", name: "SCATTER", type: "scatter" as const, color: "#00D4FF", paytable: {} },
];

// ─── Cluster 7x7 ─────────────────────────────────────────────
// Same as DEFAULT_SYMBOLS (already cluster-oriented)

// ─── Scatter-Pays 6x5 ────────────────────────────────────────
const SCATTER_PAYS_SYMBOLS = [
  { id: "h1", name: "H1", type: "high" as const, color: "#E74C3C", paytable: { 8: 2.0, 9: 5.0, 11: 10.0, 14: 50.0 } },
  { id: "h2", name: "H2", type: "high" as const, color: "#E67E22", paytable: { 8: 1.5, 9: 4.0, 11: 8.0, 14: 40.0 } },
  { id: "h3", name: "H3", type: "high" as const, color: "#9B59B6", paytable: { 8: 1.2, 9: 3.0, 11: 6.0, 14: 30.0 } },
  { id: "h4", name: "H4", type: "high" as const, color: "#F1C40F", paytable: { 8: 1.0, 9: 2.5, 11: 5.0, 14: 25.0 } },
  { id: "l1", name: "L1", type: "low" as const, color: "#3498DB", paytable: { 8: 0.5, 9: 1.5, 11: 3.0, 14: 15.0 } },
  { id: "l2", name: "L2", type: "low" as const, color: "#2ECC71", paytable: { 8: 0.4, 9: 1.2, 11: 2.5, 14: 12.0 } },
  { id: "l3", name: "L3", type: "low" as const, color: "#1ABC9C", paytable: { 8: 0.3, 9: 1.0, 11: 2.0, 14: 10.0 } },
  { id: "l4", name: "L4", type: "low" as const, color: "#00BCD4", paytable: { 8: 0.2, 9: 0.8, 11: 1.5, 14: 8.0 } },
  { id: "wild", name: "WILD", type: "wild" as const, color: "#F5A623", paytable: {} },
  { id: "scatter", name: "SCATTER", type: "scatter" as const, color: "#00D4FF", paytable: {} },
];

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: "lines-classic",
    name: "Classic Lines",
    description: "Slot classique à 5 rouleaux, 3 rangées et 20 lignes de paiement. Les gains sont évalués de gauche à droite. Wilds avec multiplicateurs en Free Spins.",
    tags: ["Lines", "5x3", "20 Paylines", "Wild Multipliers"],
    icon: "🎰",
    difficulty: "Facile",
    preview: { reels: 5, rows: 3, mechanic: "Lines" },
    config: {
      gameName: "Classic Lines",
      gameId: "classic-lines",
      gameVersion: "1.0.0",
      theme: "fantasy",
      numReels: 5,
      numRows: 3,
      winMechanic: "lines",
      numPaylines: 20,
      tumbleEnabled: false,
      symbols: LINES_SYMBOLS,
      baseBetMode: { name: "base", cost: 1.0 },
      rtpTarget: 96,
      volatility: "medium",
      simulations: 100000,
      freeSpins: {
        enabled: true,
        modeName: "freegame",
        costMultiplier: 100.0,
        scatterAwards: { 3: 10, 4: 15, 5: 20 },
        multiplier: "2x",
        retrigger: true,
      },
      reelColor: "#1a1c23",
      visualEffects: DEFAULT_VISUAL_EFFECTS,
      audio: DEFAULT_AUDIO,
      animation: { ...DEFAULT_ANIMATION, reelAnimation: "bounce" },
    },
  },
  {
    id: "ways-standard",
    name: "Ways to Win",
    description: "243 Ways sur 5 rouleaux × 3 rangées. Les gains sont calculés par adjacence de gauche à droite. Multiplicateurs sur les Wilds en Free Spins (composés).",
    tags: ["Ways", "5x3", "243 Ways", "Compounding Multipliers"],
    icon: "⚡",
    difficulty: "Facile",
    preview: { reels: 5, rows: 3, mechanic: "Ways" },
    config: {
      gameName: "Ways to Win",
      gameId: "ways-standard",
      gameVersion: "1.0.0",
      theme: "sci-fi",
      numReels: 5,
      numRows: 3,
      winMechanic: "ways",
      numPaylines: 0,
      tumbleEnabled: false,
      symbols: WAYS_SYMBOLS,
      baseBetMode: { name: "base", cost: 1.0 },
      rtpTarget: 96,
      volatility: "medium",
      simulations: 100000,
      freeSpins: {
        enabled: true,
        modeName: "freegame",
        costMultiplier: 100.0,
        scatterAwards: { 3: 10, 4: 15, 5: 20 },
        multiplier: "5x",
        retrigger: false,
      },
      reelColor: "#0d1117",
      visualEffects: { ...DEFAULT_VISUAL_EFFECTS, particleEffect: "sparkles", celebrationStyle: "neon" },
      audio: DEFAULT_AUDIO,
      animation: { ...DEFAULT_ANIMATION, reelAnimation: "cascade" },
    },
  },
  {
    id: "cluster-tumble",
    name: "Cluster Tumble",
    description: "Grille 7×7 avec mécanique cluster. Les groupes de 5+ symboles adjacents sont gagnants et disparaissent (tumble). Multiplicateurs de position en Free Spins qui doublent à chaque gain.",
    tags: ["Cluster", "7x7", "Tumble", "Position Multipliers"],
    icon: "💎",
    difficulty: "Moyen",
    preview: { reels: 7, rows: 7, mechanic: "Cluster" },
    config: {
      gameName: "Cluster Tumble",
      gameId: "cluster-tumble",
      gameVersion: "1.0.0",
      theme: "custom",
      numReels: 7,
      numRows: 7,
      winMechanic: "cluster",
      numPaylines: 0,
      tumbleEnabled: true,
      symbols: DEFAULT_SYMBOLS,
      baseBetMode: { name: "base", cost: 1.0 },
      rtpTarget: 96,
      volatility: "high",
      simulations: 100000,
      freeSpins: {
        enabled: true,
        modeName: "bonus",
        costMultiplier: 100.0,
        scatterAwards: { 4: 10, 5: 15 },
        multiplier: "none",
        retrigger: true,
      },
      reelColor: "#1a1c23",
      visualEffects: { ...DEFAULT_VISUAL_EFFECTS, celebrationStyle: "epic", particleEffect: "confetti" },
      audio: DEFAULT_AUDIO,
      animation: { ...DEFAULT_ANIMATION, reelAnimation: "cascade", cascadeDelay: 150 },
    },
  },
  {
    id: "scatter-pays",
    name: "Scatter Pays",
    description: "Grille 6×5 pay-anywhere avec tumble. Les gains sont basés sur le nombre total de symboles identiques (8+). Multiplicateur global progressif en Free Spins (+1 par tumble).",
    tags: ["Scatter", "6x5", "Pay-Anywhere", "Global Multiplier"],
    icon: "🌟",
    difficulty: "Avancé",
    preview: { reels: 6, rows: 5, mechanic: "Scatter" },
    config: {
      gameName: "Scatter Pays",
      gameId: "scatter-pays",
      gameVersion: "1.0.0",
      theme: "egypt",
      numReels: 6,
      numRows: 5,
      winMechanic: "scatter",
      numPaylines: 0,
      tumbleEnabled: true,
      symbols: SCATTER_PAYS_SYMBOLS,
      baseBetMode: { name: "base", cost: 1.0 },
      rtpTarget: 96,
      volatility: "high",
      simulations: 100000,
      freeSpins: {
        enabled: true,
        modeName: "freegame",
        costMultiplier: 100.0,
        scatterAwards: { 3: 6, 4: 8, 5: 10 },
        multiplier: "none",
        retrigger: true,
      },
      reelColor: "#1c1408",
      visualEffects: { ...DEFAULT_VISUAL_EFFECTS, celebrationStyle: "golden", particleEffect: "coins", glowColor: "#DAA520" },
      audio: DEFAULT_AUDIO,
      animation: { ...DEFAULT_ANIMATION, reelAnimation: "cascade", cascadeDelay: 120 },
    },
  },
];

// Visual effect presets for amateur mode
export const EFFECT_PRESETS = [
  {
    id: "minimal",
    name: "Minimaliste",
    icon: "🪶",
    description: "Effets sobres et élégants",
    effects: {
      ...DEFAULT_VISUAL_EFFECTS,
      particleEffect: "none" as const,
      glowEnabled: false,
      celebrationStyle: "none" as const,
      symbolAnimation: "none" as const,
      gridBorderStyle: "solid" as const,
    },
  },
  {
    id: "classic",
    name: "Classique",
    icon: "🎰",
    description: "Style casino traditionnel",
    effects: {
      ...DEFAULT_VISUAL_EFFECTS,
      particleEffect: "confetti" as const,
      particleIntensity: 40,
      glowEnabled: true,
      glowColor: "#FFD700",
      celebrationStyle: "classic" as const,
      symbolAnimation: "pulse" as const,
    },
  },
  {
    id: "festive",
    name: "Festif",
    icon: "🎉",
    description: "Explosions de particules et animations vives",
    effects: {
      ...DEFAULT_VISUAL_EFFECTS,
      particleEffect: "confetti" as const,
      particleIntensity: 80,
      glowEnabled: true,
      glowColor: "#FF6B6B",
      glowIntensity: 80,
      celebrationStyle: "epic" as const,
      symbolAnimation: "shake" as const,
      gridBorderStyle: "glow" as const,
    },
  },
  {
    id: "neon",
    name: "Néon",
    icon: "💜",
    description: "Ambiance cyberpunk avec effets lumineux",
    effects: {
      ...DEFAULT_VISUAL_EFFECTS,
      particleEffect: "sparkles" as const,
      particleIntensity: 60,
      glowEnabled: true,
      glowColor: "#00D4FF",
      glowIntensity: 90,
      celebrationStyle: "neon" as const,
      symbolAnimation: "zoom" as const,
      gridBorderStyle: "neon" as const,
      gridBorderColor: "#00D4FF",
      winLineColor: "#FF00FF",
    },
  },
  {
    id: "ocean",
    name: "Océan",
    icon: "🌊",
    description: "Bulles et ambiance sous-marine",
    effects: {
      ...DEFAULT_VISUAL_EFFECTS,
      particleEffect: "bubbles" as const,
      particleIntensity: 60,
      glowEnabled: true,
      glowColor: "#00BCD4",
      glowIntensity: 70,
      celebrationStyle: "neon" as const,
      symbolAnimation: "pulse" as const,
      gridBorderStyle: "solid" as const,
      gridBorderColor: "#0097A7",
      winLineColor: "#00BCD4",
    },
  },
];
