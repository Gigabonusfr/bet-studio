/**
 * Templates officiels Stake Engine Math SDK
 * IDs 0_0_* = jeux d'exemple du repo math-sdk
 * Référence: https://stakeengine.github.io/math-sdk/math_docs/sample_section/sample_games/
 */

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
