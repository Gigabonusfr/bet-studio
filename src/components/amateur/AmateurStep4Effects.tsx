import { useGameConfig } from "@/context/GameConfigContext";
import { EFFECT_PRESETS } from "@/data/game-templates";
import { cn } from "@/lib/utils";
import type { VisualEffectsConfig } from "@/types/game-config";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";

export function AmateurStep4Effects() {
  const { config, updateConfig } = useGameConfig();
  const ve = config.visualEffects;

  function applyPreset(effects: VisualEffectsConfig) {
    updateConfig({ visualEffects: effects });
  }

  // Find active preset
  const activePreset = EFFECT_PRESETS.find(
    (p) =>
      p.effects.particleEffect === ve.particleEffect &&
      p.effects.celebrationStyle === ve.celebrationStyle &&
      p.effects.symbolAnimation === ve.symbolAnimation
  )?.id;

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(4)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Effets Visuels</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez un style d'effets visuels. Le preset s'applique aux particules, lueurs, célébrations et animations.
        </p>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-3">
        {EFFECT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.effects)}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all",
              activePreset === preset.id
                ? "border-primary bg-primary/5 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
                : "border-border bg-card hover:border-muted-foreground/40"
            )}
          >
            <span className="text-3xl block mb-2">{preset.icon}</span>
            <h3 className="text-sm font-bold text-foreground">{preset.name}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{preset.description}</p>

            {activePreset === preset.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[10px]">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Current settings summary */}
      <div className="p-4 rounded-lg border border-border bg-card/50 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Résumé des effets actifs</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Particules</span>
            <span className="font-mono text-foreground capitalize">{ve.particleEffect}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Célébration</span>
            <span className="font-mono text-foreground capitalize">{ve.celebrationStyle}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Animation symbole</span>
            <span className="font-mono text-foreground capitalize">{ve.symbolAnimation}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Lueur</span>
            <span className="font-mono text-foreground">{ve.glowEnabled ? "Oui" : "Non"}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Bordure grille</span>
            <span className="font-mono text-foreground capitalize">{ve.gridBorderStyle}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-background">
            <span className="text-muted-foreground">Couleur gain</span>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: ve.winLineColor }} />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p>💡 <strong className="text-foreground">Astuce :</strong> Lancez un spin dans le preview pour voir les effets en action ! Pour un réglage fin, passez en Mode Pro.</p>
      </div>
    </div>
  );
}
