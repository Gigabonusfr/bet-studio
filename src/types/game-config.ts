export type WinMechanic = "lines" | "ways" | "cluster" | "scatter";
export type SymbolType = "high" | "low" | "wild" | "scatter" | "bonus";
export type Volatility = "low" | "medium" | "high";
export type Theme = "fantasy" | "sci-fi" | "egypt" | "wild-west" | "ocean" | "custom";
export type FreeSpinMultiplier = "none" | "2x" | "3x" | "5x" | "random";
export type ParticleEffect = "none" | "confetti" | "sparkles" | "coins" | "stars" | "fire" | "bubbles";
export type CelebrationStyle = "none" | "classic" | "epic" | "neon" | "golden";
export type ReelAnimation = "instant" | "cascade" | "bounce" | "elastic" | "blur";

// ——————————————————————————————————————————————
// Front-only Skin model (no math impact)
// ——————————————————————————————————————————————
export type SkinBadgeStyle = "secondary" | "outline" | "default";
export type SkinImageFit = "contain" | "cover";

export interface SkinTokens {
  gold?: string;
  text?: string;
  mutedText?: string;
  cardBg?: string;
}

export interface SkinHeaderConfig {
  /** Afficher le badge nom du jeu */
  showGameNameBadge: boolean;
  /** Afficher l'heure */
  showClockBadge: boolean;
  /** Style des badges dans le preview builder */
  builderBadgeVariantName: SkinBadgeStyle;
  builderBadgeVariantClock: SkinBadgeStyle;
  /** Style des badges dans l'export (locked overlay) */
  exportBadgeVariantName: SkinBadgeStyle;
  exportBadgeVariantClock: SkinBadgeStyle;
}

export interface SkinGridConfig {
  /** Espace entre cellules en px (gap) */
  gapPx: number;
  /** Réserve px pour padding/border/glow afin d'éviter la coupe */
  paddingAllowancePx: number;
  /** Marge de sécurité px pour fit au pixel près */
  safetyPx: number;
  /** Taille min/max de cellule en px (responsive clamp) */
  minCellPx: number;
  maxCellPx: number;
  /** Décalage horizontal de la grille en % (desktop uniquement, -50 à 50, 0 = centré) */
  gridOffsetDesktopX?: number;
  /** Décalage vertical de la grille en % (desktop uniquement, -50 à 50, 0 = position par défaut) */
  gridOffsetDesktopY?: number;
  /** Taille de la grille en % (70–130). 100 = taille auto, &lt;100 = plus petite, &gt;100 = plus grande. */
  gridScalePercent?: number;
}

export interface SkinSymbolsConfig {
  imageFit: SkinImageFit;
  imagePaddingPct: number; // 0-20 (pour breathing room)
}

export interface SkinBannersConfig {
  topBannerMinHeightPx: number;
}

export interface SkinConfigFront {
  tokens: SkinTokens;
  header: SkinHeaderConfig;
  grid: SkinGridConfig;
  symbols: SkinSymbolsConfig;
  banners: SkinBannersConfig;
}

export interface SymbolDef {
  id: string;
  name: string;
  type: SymbolType;
  color: string;
  paytable: Record<number, number>;
  image?: string; // custom symbol image URL
  customImageUrl?: string; // user-uploaded custom image (data URL or path)
}

export interface BetMode {
  name: string;
  cost: number;
}

export interface FreeSpinsConfig {
  enabled: boolean;
  modeName: string;
  costMultiplier: number;
  scatterAwards: Record<number, number>;
  multiplier: FreeSpinMultiplier;
  retrigger: boolean;
}

export interface VisualEffectsConfig {
  particleEffect: ParticleEffect;
  particleIntensity: number; // 1-100
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number; // 1-100
  celebrationStyle: CelebrationStyle;
  celebrationThreshold: number; // multiplier threshold for big win
  winLineColor: string;
  winLineWidth: number;
  symbolAnimation: "none" | "pulse" | "shake" | "flip" | "zoom";
  gridBorderStyle: "none" | "solid" | "glow" | "neon" | "gradient";
  gridBorderColor: string;
}

export interface AudioConfig {
  enabled: boolean;
  musicUrl: string;
  basegameMusicUrl?: string;
  freespinMusicUrl?: string;
  musicVolume: number; // 0-100
  sfxVolume: number; // 0-100
  // Event sounds with custom upload support
  spinSound: boolean;
  spinSoundUrl?: string;
  reelStopSound: boolean;
  reelStopSoundUrl?: string;
  winSound: boolean;
  winSoundUrl?: string;
  bigWinSound: boolean;
  bigWinSoundUrl?: string;
  freeSpinsTriggerSound: boolean;
  freeSpinsTriggerSoundUrl?: string;
  freeSpinsWinSound: boolean;
  freeSpinsWinSoundUrl?: string;
  bonusBuySound: boolean;
  bonusBuySoundUrl?: string;
  nearMissSound: boolean;
  nearMissSoundUrl?: string;
  multiplierSound: boolean;
  multiplierSoundUrl?: string;
  ambientSound: boolean;
  ambientSoundUrl?: string;
  buttonClickSound: boolean;
  buttonClickSoundUrl?: string;
  /** Indique que l'UI expose un bouton master mute (front) */
  masterMuteAvailable?: boolean;
}

export interface AnimationConfig {
  reelAnimation: ReelAnimation;
  speed: number; // 0.5x - 3x
  cascadeDelay: number; // ms between reel stops
  anticipationEnabled: boolean;
  anticipationReels: number; // last N reels get anticipation
  bounceEnabled: boolean;
  turboMode: boolean;
  winAnimationDuration: number; // ms
  symbolScale: number; // 0.5 - 2
}

// Mode UX (front-only) : permet de forcer desktop/mobile ou d'utiliser un breakpoint.
export interface AutoUxConfig {
  mode: "auto" | "desktop" | "mobile" | "off";
  mobileBreakpointPx: number;
}

export interface GameConfig {
  gameName: string;
  assetsConfig?: any; // AssetsConfig from asset-types.ts
  /** Skin front-only (preview + export). Ne touche pas au math. */
  skin?: SkinConfigFront;
  /** Flag interne pour prévisualiser le loader dans le builder amateur. */
  bootLoaderPreview?: boolean;
  /** Background spécifique pour l'écran de chargement (optionnel). */
  bootLoaderBackgroundUrl?: string;
  /** Configuration front-only pour adapter l'UX à la taille de l'écran. */
  autoUX?: AutoUxConfig;
  gameId: string;
  gameVersion: string;
  theme: Theme;
  numReels: number;
  numRows: number;
  winMechanic: WinMechanic;
  numPaylines: number;
  tumbleEnabled: boolean;
  symbols: SymbolDef[];
  baseBetMode: BetMode;
  rtpTarget: number;
  volatility: Volatility;
  simulations: number;
  freeSpins: FreeSpinsConfig;
  backgroundImage?: string;
  backgroundType?: "image" | "video";
  backgroundUrl?: string;
  backgroundPlaybackSpeed?: number;
  reelColor?: string;
  musicEnabled?: boolean;
  visualEffects: VisualEffectsConfig;
  audio: AudioConfig;
  animation: AnimationConfig;
}

export const DEFAULT_SYMBOLS: SymbolDef[] = [
  { id: "h1", name: "H1", type: "high", color: "#E74C3C", paytable: { 5: 2.0, 6: 5.0, 7: 10.0, 8: 20.0, 9: 50.0 } },
  { id: "h2", name: "H2", type: "high", color: "#E67E22", paytable: { 5: 1.5, 6: 4.0, 7: 8.0, 8: 15.0, 9: 40.0 } },
  { id: "h3", name: "H3", type: "high", color: "#9B59B6", paytable: { 5: 1.2, 6: 3.0, 7: 6.0, 8: 12.0, 9: 30.0 } },
  { id: "h4", name: "H4", type: "high", color: "#F1C40F", paytable: { 5: 1.0, 6: 2.5, 7: 5.0, 8: 10.0, 9: 25.0 } },
  { id: "l1", name: "L1", type: "low", color: "#3498DB", paytable: { 5: 0.5, 6: 1.5, 7: 3.0, 8: 6.0, 9: 15.0 } },
  { id: "l2", name: "L2", type: "low", color: "#2ECC71", paytable: { 5: 0.4, 6: 1.2, 7: 2.5, 8: 5.0, 9: 12.0 } },
  { id: "l3", name: "L3", type: "low", color: "#1ABC9C", paytable: { 5: 0.3, 6: 1.0, 7: 2.0, 8: 4.0, 9: 10.0 } },
  { id: "l4", name: "L4", type: "low", color: "#00BCD4", paytable: { 5: 0.2, 6: 0.8, 7: 1.5, 8: 3.0, 9: 8.0 } },
  { id: "l5", name: "L5", type: "low", color: "#607D8B", paytable: { 5: 0.1, 6: 0.5, 7: 1.0, 8: 2.0, 9: 5.0 } },
  { id: "wild", name: "WILD", type: "wild", color: "#F5A623", paytable: {} },
  { id: "scatter", name: "SCATTER", type: "scatter", color: "#00D4FF", paytable: {} },
];

export const DEFAULT_VISUAL_EFFECTS: VisualEffectsConfig = {
  particleEffect: "confetti",
  particleIntensity: 50,
  glowEnabled: true,
  glowColor: "#FFD700",
  glowIntensity: 60,
  celebrationStyle: "classic",
  celebrationThreshold: 10,
  winLineColor: "#FFD700",
  winLineWidth: 2,
  symbolAnimation: "pulse",
  gridBorderStyle: "glow",
  gridBorderColor: "#FFD700",
};

export const DEFAULT_AUDIO: AudioConfig = {
  enabled: true,
  musicUrl: "",
  musicVolume: 30,
  sfxVolume: 70,
  spinSound: true,
  reelStopSound: true,
  winSound: true,
  bigWinSound: true,
  freeSpinsTriggerSound: true,
  freeSpinsWinSound: true,
  bonusBuySound: true,
  nearMissSound: false,
  multiplierSound: true,
  ambientSound: false,
  buttonClickSound: true,
  masterMuteAvailable: true,
};

export const DEFAULT_ANIMATION: AnimationConfig = {
  reelAnimation: "cascade",
  speed: 1,
  cascadeDelay: 200,
  anticipationEnabled: true,
  anticipationReels: 2,
  bounceEnabled: true,
  turboMode: false,
  winAnimationDuration: 2000,
  symbolScale: 1,
};

export const DEFAULT_SKIN: SkinConfigFront = {
  tokens: {
    gold: "#FFD700",
    text: "rgba(255,255,255,0.92)",
    mutedText: "rgba(255,255,255,0.65)",
    cardBg: "rgba(0,0,0,0.35)",
  },
  header: {
    showGameNameBadge: true,
    showClockBadge: true,
    builderBadgeVariantName: "secondary",
    builderBadgeVariantClock: "outline",
    exportBadgeVariantName: "secondary",
    exportBadgeVariantClock: "outline",
  },
  grid: {
    gapPx: 8,
    // Réserve autour de la grille (padding, bordures, glow). Plus petit = zone de grille plus grande.
    paddingAllowancePx: 30,
    // Petite marge pour éviter que ça touche les bords tout en gardant de grosses cases.
    safetyPx: 1,
    minCellPx: 44,
    maxCellPx: 140,
    gridOffsetDesktopX: 0,
    gridOffsetDesktopY: 0,
    gridScalePercent: 100,
  },
  symbols: {
    imageFit: "contain",
    imagePaddingPct: 0,
  },
  banners: {
    // Hauteur mini de la bannière free-spins / scatter au-dessus de la grille
    topBannerMinHeightPx: 40,
  },
};

export const DEFAULT_CONFIG: GameConfig = {
  gameName: "Cluster Example",
  gameId: "0_0_cluster",
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
    scatterAwards: { 3: 10, 4: 15, 5: 20 },
    multiplier: "none",
    retrigger: false,
  },
  backgroundImage: "",
  reelColor: "#1a1c23",
  musicEnabled: false,
  visualEffects: DEFAULT_VISUAL_EFFECTS,
  audio: DEFAULT_AUDIO,
  animation: DEFAULT_ANIMATION,
  skin: DEFAULT_SKIN,
  autoUX: {
    mode: "auto",
    mobileBreakpointPx: 768,
  },
};
