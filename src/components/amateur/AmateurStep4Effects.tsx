import { useState, useRef } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { EFFECT_PRESETS } from "@/data/game-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { VisualEffectsConfig, ParticleEffect, CelebrationStyle } from "@/types/game-config";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";
import { Play, Upload, Download, Settings2 } from "lucide-react";

const PARTICLE_OPTIONS: { value: ParticleEffect; label: string }[] = [
  { value: "none", label: "Aucun" },
  { value: "confetti", label: "Confettis" },
  { value: "sparkles", label: "Étincelles" },
  { value: "coins", label: "Pièces" },
  { value: "stars", label: "Étoiles" },
  { value: "fire", label: "Feu" },
  { value: "bubbles", label: "Bulles" },
];

const CELEBRATION_OPTIONS: { value: CelebrationStyle; label: string }[] = [
  { value: "none", label: "Aucune" },
  { value: "classic", label: "Classique" },
  { value: "epic", label: "Épique" },
  { value: "neon", label: "Néon" },
  { value: "golden", label: "Dorée" },
];

const SYMBOL_ANIM_OPTIONS = [
  { value: "none", label: "Aucune" },
  { value: "pulse", label: "Pulse" },
  { value: "shake", label: "Shake" },
  { value: "flip", label: "Flip" },
  { value: "zoom", label: "Zoom" },
];

const GRID_BORDER_OPTIONS = [
  { value: "none", label: "Aucune" },
  { value: "solid", label: "Trait" },
  { value: "glow", label: "Lueur" },
  { value: "neon", label: "Néon" },
  { value: "gradient", label: "Dégradé" },
];

export function AmateurStep4Effects() {
  const { config, updateConfig, triggerEffectPreview } = useGameConfig();
  const ve = config.visualEffects;
  const [customSelected, setCustomSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyPreset(effects: VisualEffectsConfig) {
    setCustomSelected(false);
    updateConfig({ visualEffects: effects });
  }

  function applyCustom(partial: Partial<VisualEffectsConfig>) {
    updateConfig({ visualEffects: { ...ve, ...partial } });
  }

  const activePreset = customSelected
    ? "custom"
    : EFFECT_PRESETS.find(
        (p) =>
          p.effects.particleEffect === ve.particleEffect &&
          p.effects.celebrationStyle === ve.celebrationStyle &&
          p.effects.symbolAnimation === ve.symbolAnimation
      )?.id ?? null;

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (json && typeof json.particleEffect === "string") {
          updateConfig({ visualEffects: { ...ve, ...json } });
          setCustomSelected(true);
        }
      } catch {
        console.warn("Invalid effects JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(ve, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "effets-visuels.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(4)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Effets Visuels</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez un style ou personnalisez chaque effet. Prévisualisez directement sur la slot.
        </p>
      </div>

      {/* Presets + Personnalisé */}
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
        <button
          onClick={() => setCustomSelected(true)}
          className={cn(
            "relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all",
            activePreset === "custom"
              ? "border-primary bg-primary/5 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
              : "border-border bg-card hover:border-muted-foreground/40"
          )}
        >
          <span className="text-3xl block mb-2">🎨</span>
          <h3 className="text-sm font-bold text-foreground">Personnalisé</h3>
          <p className="text-[10px] text-muted-foreground mt-1">Choisir ou importer tous les effets à la carte.</p>
          {activePreset === "custom" && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[10px]">✓</span>
              </div>
          )}
        </button>
      </div>

      {/* Personnalisé : réglages détaillés */}
      {(activePreset === "custom" || customSelected) && (
        <div className="space-y-4 p-4 rounded-xl border-2 border-primary/30 bg-card/50">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Réglages personnalisés
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Particules</Label>
              <Select value={ve.particleEffect} onValueChange={(v) => applyCustom({ particleEffect: v as ParticleEffect })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PARTICLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Célébration</Label>
              <Select value={ve.celebrationStyle} onValueChange={(v) => applyCustom({ celebrationStyle: v as CelebrationStyle })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CELEBRATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Animation symbole</Label>
              <Select value={ve.symbolAnimation} onValueChange={(v) => applyCustom({ symbolAnimation: v as VisualEffectsConfig["symbolAnimation"] })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYMBOL_ANIM_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Bordure grille</Label>
              <Select value={ve.gridBorderStyle} onValueChange={(v) => applyCustom({ gridBorderStyle: v as VisualEffectsConfig["gridBorderStyle"] })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRID_BORDER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Intensité particules</Label>
              <span className="text-xs text-muted-foreground">{ve.particleIntensity}</span>
            </div>
            <Slider
              min={1}
              max={100}
              value={[ve.particleIntensity]}
              onValueChange={([v]) => applyCustom({ particleIntensity: v })}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs">Lueur sur gains</Label>
            <Switch checked={ve.glowEnabled} onCheckedChange={(v) => applyCustom({ glowEnabled: v })} />
          </div>
          {ve.glowEnabled && (
            <>
              <div className="flex gap-2 items-center">
                <Label className="text-xs shrink-0">Couleur lueur</Label>
                <Input
                  type="color"
                  value={ve.glowColor}
                  onChange={(e) => applyCustom({ glowColor: e.target.value })}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input value={ve.glowColor} onChange={(e) => applyCustom({ glowColor: e.target.value })} className="flex-1 h-9 font-mono text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Intensité lueur</Label>
                <Slider min={1} max={100} value={[ve.glowIntensity]} onValueChange={([v]) => applyCustom({ glowIntensity: v })} />
              </div>
            </>
          )}
          <div className="flex gap-2 items-center">
            <Label className="text-xs shrink-0">Couleur gain</Label>
            <Input type="color" value={ve.winLineColor} onChange={(e) => applyCustom({ winLineColor: e.target.value })} className="w-12 h-9 p-1 cursor-pointer" />
            <Input value={ve.winLineColor} onChange={(e) => applyCustom({ winLineColor: e.target.value })} className="flex-1 h-9 font-mono text-xs" />
          </div>
          <div className="flex gap-2 items-center">
            <Label className="text-xs shrink-0">Couleur bordure</Label>
            <Input type="color" value={ve.gridBorderColor} onChange={(e) => applyCustom({ gridBorderColor: e.target.value })} className="w-12 h-9 p-1 cursor-pointer" />
            <Input value={ve.gridBorderColor} onChange={(e) => applyCustom({ gridBorderColor: e.target.value })} className="flex-1 h-9 font-mono text-xs" />
          </div>

          {/* Import / Export */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
            <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              Importer un JSON
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              Exporter en JSON
            </Button>
          </div>
        </div>
      )}

      {/* Bouton preview sur la slot */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <Button onClick={triggerEffectPreview} className="gap-2 shrink-0" size="lg">
          <Play className="h-4 w-4" />
          Voir les effets sur la slot
        </Button>
        <p className="text-xs text-muted-foreground">
          Lance un aperçu (célébration + particules) dans le preview à gauche.
        </p>
      </div>

      {/* Résumé */}
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
    </div>
  );
}
