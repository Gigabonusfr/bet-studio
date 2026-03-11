export type EmbedConfig = {
  gameName: string;
  gameId: string;
  numReels: number;
  numRows: number;
  winMechanic: "cluster" | "ways" | "lines" | "scatter" | string;
  defaultBetAmount: number; // entier 6 décimales implicites
  reelColor: string;
  gridBorderStyle?: "none" | "solid" | "glow" | "neon" | "gradient";
  gridBorderColor?: string;
  bodyBackgroundUrl?: string | null;
  backgroundUrl?: string | null;
  symbolIdToUrl?: (string | null)[];
  symbolIdToName?: (string | null)[];
  tumbleEnabled?: boolean;
  freeSpinsEnabled?: boolean;
  freeSpinsCostMultiplier?: number;
};

export type RgsRoundEvent =
  | { type: "reveal"; board?: any; gameType?: "basegame" | "freegame" | string }
  | { type: "winInfo"; wins?: any[]; balance?: number; amount?: number; gameType?: any }
  | { type: "setWin"; amount?: number; balance?: number; gameType?: any }
  | { type: "finalWin"; amount?: number; balance?: number; gameType?: any }
  | { type: string; [key: string]: unknown };

