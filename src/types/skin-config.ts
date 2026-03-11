/**
 * SkinConfig — config skin uniquement, compatible Web SDK / RGS.
 * templateId = template officiel Stake (maths côté SDK), symbols = assets par symbolId.
 */

import type { OfficialTemplateId } from "@/data/official-stake-templates";

export interface SkinConfig {
  /** Template officiel Stake (0_0_lines, 0_0_cluster, …) */
  templateId: OfficialTemplateId;
  /** symbolId (numérique) → URL ou path de l'asset (ex: 0: "cherry.png") */
  symbols: Record<number, string>;
  /** Backgrounds */
  backgrounds: {
    main: string;
    reels?: string;
  };
  /** Position / style UI (optionnel pour Web SDK) */
  ui?: {
    spinButton?: { x: number; y: number };
    [key: string]: unknown;
  };
  /** Version skin */
  version?: string;
}

export const DEFAULT_SKIN_CONFIG: SkinConfig = {
  templateId: "0_0_lines",
  symbols: {},
  backgrounds: { main: "" },
  version: "1.0.0",
};
