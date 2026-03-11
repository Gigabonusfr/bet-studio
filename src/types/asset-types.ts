export type AssetCategory = "animations" | "sprites" | "symbols" | "backgrounds" | "effects" | "sounds";
export type AssetSource = "lottie" | "opengameart" | "kenney" | "custom";
export type AssetLicense = "FREE" | "CC0" | "Attribution";
export type AssetFileType = "png" | "jpg" | "gif" | "svg" | "webp" | "lottie" | "mp3";

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  source: AssetSource;
  license: AssetLicense;
  type: AssetFileType;
  url: string;         // direct URL or lottie JSON URL
  thumbnailUrl: string; // preview thumbnail
  tags: string[];
}

export type WinTier = "win" | "bigwin" | "megawin" | "freespins";

export interface WinAnimationConfig {
  tier: WinTier;
  animationId: string | null; // references AssetItem id or built-in
  builtIn: string;            // built-in animation name
  duration: number;           // seconds
  intensity: "low" | "medium" | "overthetop";
}

export interface ParticleEffectConfig {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  density: number; // 1-100
}

export interface AssetsConfig {
  symbolAssets: Record<string, string | null>; // symbolId -> assetUrl
  winAnimations: WinAnimationConfig[];
  particleEffects: ParticleEffectConfig[];
  customAssets: AssetItem[];
  backgroundAsset: string | null;
}

export const DEFAULT_WIN_ANIMATIONS: WinAnimationConfig[] = [
  { tier: "win", animationId: null, builtIn: "coins_fall", duration: 1.5, intensity: "low" },
  { tier: "bigwin", animationId: null, builtIn: "coin_explosion", duration: 3, intensity: "medium" },
  { tier: "megawin", animationId: null, builtIn: "fireworks", duration: 4, intensity: "overthetop" },
  { tier: "freespins", animationId: null, builtIn: "banner_animated", duration: 2.5, intensity: "medium" },
];

export const DEFAULT_PARTICLE_EFFECTS: ParticleEffectConfig[] = [
  { id: "sparkles", name: "✨ Étincelles dorées", enabled: true, color: "#FFD700", density: 50 },
  { id: "stars", name: "🌟 Étoiles filantes", enabled: false, color: "#FFFFFF", density: 30 },
  { id: "gems", name: "💎 Pluie de gemmes", enabled: false, color: "#00D4FF", density: 40 },
  { id: "confetti", name: "🎊 Confettis", enabled: false, color: "#FF6B6B", density: 60 },
  { id: "flames", name: "🔥 Flammes", enabled: false, color: "#FF4500", density: 45 },
  { id: "snow", name: "❄️ Flocons", enabled: false, color: "#E0F0FF", density: 35 },
];

export const DEFAULT_ASSETS_CONFIG: AssetsConfig = {
  symbolAssets: {},
  winAnimations: DEFAULT_WIN_ANIMATIONS,
  particleEffects: DEFAULT_PARTICLE_EFFECTS,
  customAssets: [],
  backgroundAsset: null,
};
