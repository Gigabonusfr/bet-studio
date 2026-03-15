import { useGameConfig } from "@/context/GameConfigContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Theme } from "@/types/game-config";
import { DEFAULT_SKIN } from "@/types/game-config";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";

const THEMES: { value: Theme; label: string; emoji: string }[] = [
  { value: "fantasy", label: "Fantasy", emoji: "🐉" },
  { value: "sci-fi", label: "Sci-Fi", emoji: "🚀" },
  { value: "egypt", label: "Égypte", emoji: "🏺" },
  { value: "wild-west", label: "Western", emoji: "🤠" },
  { value: "ocean", label: "Océan", emoji: "🌊" },
  { value: "custom", label: "Custom", emoji: "🎨" },
];

export function AmateurStep2Identity() {
  const { config, updateConfig } = useGameConfig();

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(1)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Personnalisez votre Jeu</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Donnez un nom et une identité visuelle à votre slot. Ces paramètres n'affectent pas la mécanique de jeu.
        </p>
      </div>

      {/* Game Name */}
      <div className="space-y-2">
        <Label className="text-foreground">Nom du jeu</Label>
        <Input
          value={config.gameName}
          onChange={(e) => updateConfig({ gameName: e.target.value })}
          placeholder="Ex: Dragon's Fortune"
          className="bg-input border-border text-foreground text-lg"
        />
        <p className="text-xs text-muted-foreground">Ce nom sera affiché dans le jeu et dans les exports.</p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <Label className="text-foreground">Thème visuel</Label>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              onClick={() => updateConfig({ theme: theme.value })}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                config.theme === theme.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <span className="text-2xl block mb-1">{theme.emoji}</span>
              <span className="text-xs font-medium text-foreground">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Color */}
      <div className="space-y-2">
        <Label className="text-foreground">Couleur de la grille</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={config.reelColor || "#1a1c23"}
            onChange={(e) => updateConfig({ reelColor: e.target.value })}
            className="w-14 h-10 p-1 cursor-pointer bg-input border-border"
          />
          <Input
            value={config.reelColor || "#1a1c23"}
            onChange={(e) => updateConfig({ reelColor: e.target.value })}
            className="flex-1 bg-input border-border font-mono text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">Couleur de fond derrière les symboles.</p>
      </div>

      {/* Grid Border Color */}
      <div className="space-y-2">
        <Label className="text-foreground">Couleur du tour de la grille</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={config.visualEffects?.gridBorderColor ?? "#FFD700"}
            onChange={(e) =>
              updateConfig({
                visualEffects: { ...config.visualEffects, gridBorderColor: e.target.value },
              } as any)
            }
            className="w-14 h-10 p-1 cursor-pointer bg-input border-border"
          />
          <Input
            value={config.visualEffects?.gridBorderColor ?? "#FFD700"}
            onChange={(e) =>
              updateConfig({
                visualEffects: { ...config.visualEffects, gridBorderColor: e.target.value },
              } as any)
            }
            className="flex-1 bg-input border-border font-mono text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">Couleur du contour (bordure) autour de la grille de jeu.</p>
      </div>

      {/* Position de la grille (desktop uniquement) */}
      <div className="space-y-3">
        <Label className="text-foreground">Position de la grille (desktop)</Label>
        <p className="text-xs text-muted-foreground">
          Déplacez la grille sur l’écran. Sur mobile la grille reste à sa position par défaut.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Décalage horizontal (%)</Label>
            <Slider
              min={-50}
              max={50}
              step={1}
              value={[(config.skin ?? DEFAULT_SKIN).grid?.gridOffsetDesktopX ?? 0]}
              onValueChange={([v]) =>
                updateConfig({
                  skin: {
                    ...DEFAULT_SKIN,
                    ...config.skin,
                    grid: {
                      ...DEFAULT_SKIN.grid,
                      ...config.skin?.grid,
                      gridOffsetDesktopX: v,
                    },
                  },
                } as any)
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Décalage vertical (%)</Label>
            <Slider
              min={-50}
              max={50}
              step={1}
              value={[(config.skin ?? DEFAULT_SKIN).grid?.gridOffsetDesktopY ?? 0]}
              onValueChange={([v]) =>
                updateConfig({
                  skin: {
                    ...DEFAULT_SKIN,
                    ...config.skin,
                    grid: {
                      ...DEFAULT_SKIN.grid,
                      ...config.skin?.grid,
                      gridOffsetDesktopY: v,
                    },
                  },
                } as any)
              }
            />
          </div>
        </div>
      </div>

      {/* Taille de la grille */}
      <div className="space-y-3">
        <Label className="text-foreground">Taille de la grille</Label>
        <p className="text-xs text-muted-foreground">
          Réduire ou agrandir la grille par rapport à la taille automatique. 100 % = taille par défaut.
        </p>
        <div className="space-y-2">
          <Slider
            min={70}
            max={130}
            step={5}
            value={[(config.skin ?? DEFAULT_SKIN).grid?.gridScalePercent ?? 100]}
            onValueChange={([v]) =>
              updateConfig({
                skin: {
                  ...DEFAULT_SKIN,
                  ...config.skin,
                  grid: {
                    ...DEFAULT_SKIN.grid,
                    ...config.skin?.grid,
                    gridScalePercent: v,
                  },
                },
              } as any)
              }
            />
          <p className="text-xs text-muted-foreground text-center">
            {(config.skin ?? DEFAULT_SKIN).grid?.gridScalePercent ?? 100} %
          </p>
        </div>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <Label className="text-foreground">Arrière-plan (optionnel)</Label>
        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/png,image/gif,video/mp4"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const blobUrl = URL.createObjectURL(file);
                const type = file.type.startsWith("video") ? "video" : "image";
                updateConfig({ backgroundUrl: blobUrl, backgroundType: type });
              }
            }}
            className="bg-input border-border flex-1"
          />
          {config.backgroundUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateConfig({ backgroundUrl: undefined, backgroundType: undefined })}
              className="text-destructive"
            >
              Effacer
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG, GIF ou MP4. Sera affiché derrière la grille de jeu.</p>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p>💡 <strong className="text-foreground">Astuce :</strong> Le thème influence le style recommandé mais ne change pas la mécanique. Vous pouvez le changer à tout moment.</p>
      </div>
    </div>
  );
}
