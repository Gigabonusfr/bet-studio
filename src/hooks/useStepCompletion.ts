import { useGameConfig } from "@/context/GameConfigContext";
import { useSlotControls } from "@/context/SlotControlsContext";
import { GAME_TEMPLATES, EFFECT_PRESETS } from "@/data/game-templates";
import { THEMES } from "@/types/slot-controls";
import { DEFAULT_ASSETS_CONFIG } from "@/types/asset-types";

export interface StepCheckItem {
  label: string;
  done: boolean;
}

export function useStepCompletion() {
  const { config } = useGameConfig();

  // Step 1: Template
  const templateSelected = GAME_TEMPLATES.some(
    (t) =>
      t.config.winMechanic === config.winMechanic &&
      t.config.numReels === config.numReels &&
      t.config.numRows === config.numRows
  );

  // Step 2: Identity
  const hasName = config.gameName.trim().length > 0 && config.gameName !== "Cluster Example";
  const hasTheme = !!config.theme;

  // Step 3: Loading (pas de prérequis fort pour l'instant)
  const hasLoaderConfig = true;

  // Step 4: Symbols
  const hasCustomSymbol = config.symbols.some(
    (s) => s.customImageUrl || (s.name !== s.id.toUpperCase() && s.name !== s.id)
  );

  // Step 5: Effects
  const hasEffectPreset = EFFECT_PRESETS.some(
    (p) =>
      p.effects.particleEffect === config.visualEffects.particleEffect &&
      p.effects.celebrationStyle === config.visualEffects.celebrationStyle &&
      p.effects.symbolAnimation === config.visualEffects.symbolAnimation
  );

  // Step 6: Assets
  const ac = config.assetsConfig || DEFAULT_ASSETS_CONFIG;
  const hasAssetAssigned = Object.values(ac.symbolAssets || {}).some((v) => !!v);

  // Step 7: UX Controls - always true if SlotControlsProvider est utilisé
  const hasUXTheme = true; // default theme is always applied

  const steps: Record<number, StepCheckItem[]> = {
    0: [{ label: "Choisir un template", done: templateSelected }],
    1: [
      { label: "Donner un nom au jeu", done: hasName },
      { label: "Sélectionner un thème visuel", done: hasTheme },
    ],
    2: [
      { label: "Comprendre l'écran de chargement", done: hasLoaderConfig },
    ],
    3: [
      { label: "Personnaliser au moins un symbole (nom ou image)", done: hasCustomSymbol },
    ],
    4: [{ label: "Choisir un preset d'effets visuels", done: hasEffectPreset }],
    5: [{ label: "Assigner un asset à au moins un symbole", done: hasAssetAssigned }],
    6: [{ label: "Choisir un thème d'interface", done: hasUXTheme }],
    7: [],
  };

  const isStepComplete = (step: number): boolean => {
    const items = steps[step];
    if (!items || items.length === 0) return true;
    return items.every((item) => item.done);
  };

  const getStepItems = (step: number): StepCheckItem[] => steps[step] || [];

  return { steps, isStepComplete, getStepItems };
}
