/**
 * Templates officiels Stake Engine Math SDK
 * IDs 0_0_* = jeux d'exemple du repo math-sdk
 * Référence: https://stakeengine.github.io/math-sdk/math_docs/sample_section/sample_games/
 * Uniquement ces templates : math géré côté SDK, pas de package math à générer.
 */

import type { SymbolDef } from "@/types/game-config";

/** 12 symboles alignés sur le SDK (0-11 : H1-H5, L1-L4, WILD, SCATTER, BONUS). BONUS = symbole multiplicateur 0_0_scatter (ajouté au multiplicateur global en freegame). Réf. sample_games pour l’UI / assets */
export const OFFICIAL_DEFAULT_SYMBOLS: SymbolDef[] = [
  { id: "h1", name: "H1", type: "high", color: "#E74C3C", paytable: {} },
  { id: "h2", name: "H2", type: "high", color: "#E67E22", paytable: {} },
  { id: "h3", name: "H3", type: "high", color: "#9B59B6", paytable: {} },
  { id: "h4", name: "H4", type: "high", color: "#F1C40F", paytable: {} },
  { id: "h5", name: "H5", type: "high", color: "#FF6B81", paytable: {} },
  { id: "l1", name: "L1", type: "low", color: "#3498DB", paytable: {} },
  { id: "l2", name: "L2", type: "low", color: "#2ECC71", paytable: {} },
  { id: "l3", name: "L3", type: "low", color: "#1ABC9C", paytable: {} },
  { id: "l4", name: "L4", type: "low", color: "#00BCD4", paytable: {} },
  { id: "wild", name: "WILD", type: "wild", color: "#F5A623", paytable: {} },
  { id: "scatter", name: "SCATTER", type: "scatter", color: "#00D4FF", paytable: {} },
  { id: "bonus", name: "BONUS", type: "bonus", color: "#9B59B6", paytable: {} },
];

/** Paytable Lines (0_0_lines, 0_0_expwilds) : gain par nombre de symboles consécutifs (3, 4, 5). */
const LINES_PAYTABLE_HIGH: Record<number, number> = { 3: 1.5, 4: 4, 5: 10 };
const LINES_PAYTABLE_LOW: Record<number, number> = { 3: 0.8, 4: 2, 5: 5 };

/** Paytable Ways (0_0_ways) : 243 ways, gain par reels consécutifs (3, 4, 5). */
const WAYS_PAYTABLE_HIGH: Record<number, number> = { 3: 1, 4: 3, 5: 8 };
const WAYS_PAYTABLE_LOW: Record<number, number> = { 3: 0.5, 4: 1.5, 5: 4 };

/** Paytable Cluster (0_0_cluster) : gain par taille de cluster (3 à 7). SDK 5+ like-symbols. */
const CLUSTER_PAYTABLE_HIGH: Record<number, number> = { 3: 0.8, 4: 2.5, 5: 6, 6: 12, 7: 20 };
const CLUSTER_PAYTABLE_LOW: Record<number, number> = { 3: 0.4, 4: 1.2, 5: 3, 6: 6, 7: 10 };

/** Paytable Scatter Pays (0_0_scatter) : pay-anywhere par nombre de symboles. SDK groupe (8-8), (9-10), (11-13), (14-36). */
const SCATTER_PAYTABLE_HIGH: Record<number, number> = {};
const SCATTER_PAYTABLE_LOW: Record<number, number> = {};
([3, 4, 5, 6, 7]).forEach((n, i) => {
  SCATTER_PAYTABLE_HIGH[n] = [0.2, 0.5, 1, 1.5, 2.5][i];
  SCATTER_PAYTABLE_LOW[n] = [0.1, 0.25, 0.5, 0.75, 1.2][i];
});
SCATTER_PAYTABLE_HIGH[8] = 4;
SCATTER_PAYTABLE_LOW[8] = 2;
[9, 10].forEach(n => { SCATTER_PAYTABLE_HIGH[n] = 6; SCATTER_PAYTABLE_LOW[n] = 3; });
[11, 12, 13].forEach(n => { SCATTER_PAYTABLE_HIGH[n] = 10; SCATTER_PAYTABLE_LOW[n] = 5; });
for (let n = 14; n <= 36; n++) {
  SCATTER_PAYTABLE_HIGH[n] = 18;
  SCATTER_PAYTABLE_LOW[n] = 9;
}

export type OfficialTemplateId =
  | "0_0_lines"
  | "0_0_ways"
  | "0_0_cluster"
  | "0_0_scatter"
  | "0_0_expwilds";

export type WinMechanicType = "lines" | "ways" | "cluster" | "scatter";

export interface OfficialStakeTemplate {
  gameId: OfficialTemplateId;
  name: string;
  /** [numReels, numRows] */
  grid: [number, number];
  /** Nombre de symboles (IDs numériques 0 à symbols-1) */
  symbols: number;
  mechanic: WinMechanicType;
  /** Pour lines: nombre de paylines; 0 pour ways/cluster/scatter */
  numPaylines: number;
  /** Tumble activé (cluster, scatter) */
  tumbleEnabled: boolean;
  /** Description courte */
  description: string;
}

/**
 * Templates officiels Stake Engine — grilles et mécaniques alignés sur le Math SDK.
 * symbolId: 0..(symbols-1) (ex. 0-11 = H1-H5, L1-L4, WILD, SCATTER pour lines/ways).
 */
export const OFFICIAL_TEMPLATES: Record<OfficialTemplateId, OfficialStakeTemplate> = {
  "0_0_lines": {
    gameId: "0_0_lines",
    name: "Lines (5x3)",
    grid: [5, 3],
    symbols: 12, // 0-11: H1-H5, L1-L4, WILD(9), SCATTER(10) — aligné sample lines
    mechanic: "lines",
    numPaylines: 20,
    tumbleEnabled: false,
    description: "Slot classique 5 rouleaux × 3 rangées, 20 lignes. Wilds avec multiplicateurs en Free Spins.",
  },
  "0_0_ways": {
    gameId: "0_0_ways",
    name: "Ways (5x3)",
    grid: [5, 3],
    symbols: 12, // H1-H5, L1-L4, WILD, SCATTER
    mechanic: "ways",
    numPaylines: 0,
    tumbleEnabled: false,
    description: "243 Ways, 5×3. Multiplicateurs Wild composés en Free Spins.",
  },
  "0_0_cluster": {
    gameId: "0_0_cluster",
    name: "Cluster (7x7)",
    grid: [7, 7],
    symbols: 12,
    mechanic: "cluster",
    numPaylines: 0,
    tumbleEnabled: true,
    description: "Grille 7×7 cluster, tumble. Multiplicateurs de position en Free Spins.",
  },
  "0_0_scatter": {
    gameId: "0_0_scatter",
    name: "Scatter Pays (6x5)",
    grid: [6, 5],
    symbols: 12,
    mechanic: "scatter",
    numPaylines: 0,
    tumbleEnabled: true,
    description: "Pay-anywhere 6×5, tumble. Multiplicateur global progressif en Free Spins.",
  },
  "0_0_expwilds": {
    gameId: "0_0_expwilds",
    name: "Expanding Wilds (5x5)",
    grid: [5, 5],
    symbols: 12,
    mechanic: "lines",
    numPaylines: 15,
    tumbleEnabled: false,
    description: "5×5, 15 lignes. Wilds expansifs en Free Spins. Mode superspin optionnel.",
  },
};

export const OFFICIAL_TEMPLATE_IDS = Object.keys(OFFICIAL_TEMPLATES) as OfficialTemplateId[];

/** Vérifie si un gameId est un template officiel */
export function isOfficialTemplate(gameId: string): gameId is OfficialTemplateId {
  return gameId in OFFICIAL_TEMPLATES;
}

/** Symboles avec paytables remplies pour le template (preview local aligné SDK). */
export function getOfficialSymbolsForTemplate(templateId: OfficialTemplateId): SymbolDef[] {
  const base = OFFICIAL_DEFAULT_SYMBOLS.map(s => ({ ...s, paytable: { ...s.paytable } }));
  return base.map(s => {
    if (s.type !== "high" && s.type !== "low") return s;
    switch (templateId) {
      case "0_0_lines":
      case "0_0_expwilds":
        return { ...s, paytable: s.type === "high" ? { ...LINES_PAYTABLE_HIGH } : { ...LINES_PAYTABLE_LOW } };
      case "0_0_ways":
        return { ...s, paytable: s.type === "high" ? { ...WAYS_PAYTABLE_HIGH } : { ...WAYS_PAYTABLE_LOW } };
      case "0_0_cluster":
        return { ...s, paytable: s.type === "high" ? { ...CLUSTER_PAYTABLE_HIGH } : { ...CLUSTER_PAYTABLE_LOW } };
      case "0_0_scatter":
        return { ...s, paytable: s.type === "high" ? { ...SCATTER_PAYTABLE_HIGH } : { ...SCATTER_PAYTABLE_LOW } };
      default:
        return s;
    }
  });
}
