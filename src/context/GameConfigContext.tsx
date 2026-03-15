import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { GameConfig, DEFAULT_CONFIG } from "@/types/game-config";
import { DEFAULT_ASSETS_CONFIG } from "@/types/asset-types";

interface GameConfigContextType {
  config: GameConfig;
  updateConfig: (partial: Partial<GameConfig>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetConfig: () => void;
  /** Déclenche un aperçu des effets (célébration + particules) sur la slot. Non persisté. */
  triggerEffectPreview: () => void;
  /** Incrémenté à chaque appel à triggerEffectPreview (pour que le preview réagisse). */
  effectPreviewRequest: number;
}

const GameConfigContext = createContext<GameConfigContextType | null>(null);

const STORAGE_KEY = "stake-engine-builder";

// Helper to check if a string is a data URL (base64 encoded)
const isDataUrl = (url: string | undefined | null): boolean => {
  return typeof url === "string" && url.startsWith("data:");
};

// Strip data URLs from config to avoid localStorage quota issues
const stripDataUrlsForStorage = (config: GameConfig): GameConfig => {
  const cleanSymbols = config.symbols.map(s => ({
    ...s,
    customImageUrl: isDataUrl(s.customImageUrl) ? undefined : s.customImageUrl,
  }));

  // Clean assetsConfig if present
  let cleanAssetsConfig = config.assetsConfig;
  if (config.assetsConfig) {
    // Strip data URLs from symbolAssets
    const cleanSymbolAssets: Record<string, string | null> = {};
    if (config.assetsConfig.symbolAssets) {
      Object.entries(config.assetsConfig.symbolAssets as Record<string, string | null>).forEach(([key, value]) => {
        if (value && !isDataUrl(value)) {
          cleanSymbolAssets[key] = value;
        }
      });
    }

    // Strip data URLs from customAssets
    const cleanCustomAssets = (config.assetsConfig.customAssets || []).filter(
      (asset: any) => !isDataUrl(asset.url) && !isDataUrl(asset.thumbnailUrl)
    );

    // Strip data URL from backgroundAsset
    const cleanBackgroundAsset = isDataUrl(config.assetsConfig.backgroundAsset) 
      ? null 
      : config.assetsConfig.backgroundAsset;

    cleanAssetsConfig = {
      ...config.assetsConfig,
      symbolAssets: cleanSymbolAssets,
      customAssets: cleanCustomAssets,
      backgroundAsset: cleanBackgroundAsset,
    };
  }

  // Strip data URLs from audio config
  const cleanAudio = { ...config.audio };
  const audioUrlKeys = [
    'musicUrl', 'basegameMusicUrl', 'freespinMusicUrl',
    'spinSoundUrl', 'reelStopSoundUrl', 'winSoundUrl', 'bigWinSoundUrl',
    'freeSpinsTriggerSoundUrl', 'freeSpinsWinSoundUrl', 'bonusBuySoundUrl',
    'nearMissSoundUrl', 'multiplierSoundUrl', 'ambientSoundUrl', 'buttonClickSoundUrl',
  ] as const;
  for (const key of audioUrlKeys) {
    if (isDataUrl((cleanAudio as any)[key])) {
      (cleanAudio as any)[key] = undefined;
    }
  }

  return {
    ...config,
    backgroundUrl: isDataUrl(config.backgroundUrl) ? undefined : config.backgroundUrl,
    backgroundImage: isDataUrl(config.backgroundImage) ? undefined : config.backgroundImage,
    symbols: cleanSymbols,
    assetsConfig: cleanAssetsConfig,
    audio: cleanAudio,
  };
};

function loadFromStorage(): { config: GameConfig; step: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const step = typeof parsed.step === "number" ? Math.max(0, Math.min(parsed.step, 7)) : 0;
      
      // Merge assetsConfig with defaults to ensure all fields exist
      const loadedAssetsConfig = parsed.config?.assetsConfig;
      const mergedAssetsConfig = loadedAssetsConfig 
        ? {
            ...DEFAULT_ASSETS_CONFIG,
            ...loadedAssetsConfig,
            winAnimations: loadedAssetsConfig.winAnimations || DEFAULT_ASSETS_CONFIG.winAnimations,
            particleEffects: loadedAssetsConfig.particleEffects || DEFAULT_ASSETS_CONFIG.particleEffects,
          }
        : DEFAULT_ASSETS_CONFIG;

      return { 
        config: { 
          ...DEFAULT_CONFIG, 
          ...parsed.config,
          assetsConfig: mergedAssetsConfig,
        }, 
        step 
      };
    }
  } catch (e) {
    console.warn("Failed to load config from localStorage, resetting", e);
    localStorage.removeItem(STORAGE_KEY);
  }
  return { config: DEFAULT_CONFIG, step: 0 };
}

export function GameConfigProvider({ children }: { children: React.ReactNode }) {
  const [saved] = useState(loadFromStorage);
  const [config, setConfig] = useState<GameConfig>(saved.config);
  const [currentStep, setCurrentStep] = useState(saved.step);
  const [effectPreviewRequest, setEffectPreviewRequest] = useState(0);

  const triggerEffectPreview = useCallback(() => {
    setEffectPreviewRequest((n) => n + 1);
  }, []);

  useEffect(() => {
    try {
      // Strip large data URLs before persisting to avoid quota errors
      const persistConfig = stripDataUrlsForStorage(config);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ config: persistConfig, step: currentStep }));
    } catch (e) {
      console.warn("Failed to persist config to localStorage", e);
    }
  }, [config, currentStep]);

  const updateConfig = useCallback((partial: Partial<GameConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setCurrentStep(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <GameConfigContext.Provider value={{ config, updateConfig, currentStep, setCurrentStep, resetConfig, triggerEffectPreview, effectPreviewRequest }}>
      {children}
    </GameConfigContext.Provider>
  );
}

export function useGameConfig() {
  const ctx = useContext(GameConfigContext);
  if (!ctx) throw new Error("useGameConfig must be used within GameConfigProvider");
  return ctx;
}
