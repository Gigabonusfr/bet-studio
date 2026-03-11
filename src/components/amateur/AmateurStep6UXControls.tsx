import { useSlotControls } from "@/context/SlotControlsContext";
import { THEMES } from "@/types/slot-controls";
import { cn } from "@/lib/utils";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";
import { ControlsCustomizer } from "@/components/builder/ControlsCustomizer";
import { useGameConfig } from "@/context/GameConfigContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const THEME_LIST = Object.entries(THEMES).map(([key, theme]) => ({
  id: key,
  ...theme,
}));

export function AmateurStep6UXControls() {
  const { config, applyTheme } = useSlotControls();
  const { config: gameConfig, updateConfig } = useGameConfig();

  // Find current active theme
  const activeTheme = THEME_LIST.find(
    (t) =>
      t.spinButton.backgroundColor === config.spinButton.backgroundColor &&
      t.layout === config.layout
  )?.id;

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(6)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Style de l'Interface</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez un thème UX pour les contrôles du jeu (bouton spin, balance, mise, etc.). Le preview se met à jour en direct.
        </p>
      </div>

      {/* Comportement Auto/Desktop/Mobile */}
      <div className="p-4 rounded-lg border border-border bg-card/40 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Comportement selon la taille d&apos;écran</h3>
        <p className="text-xs text-muted-foreground">
          Choisissez comment l&apos;interface s&apos;adapte : auto (recommandé), ou forcer un rendu Desktop / Mobile quelle que soit la taille de l&apos;écran.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Mode</Label>
            <Select
              value={gameConfig.autoUX?.mode ?? "auto"}
              onValueChange={(value: "auto" | "desktop" | "mobile" | "off") =>
                updateConfig({ autoUX: { ...(gameConfig.autoUX ?? { mobileBreakpointPx: 768 }), mode: value } } as any)
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (recommandé)</SelectItem>
                <SelectItem value="desktop">Toujours Desktop</SelectItem>
                <SelectItem value="mobile">Toujours Mobile</SelectItem>
                <SelectItem value="off">Désactivé (manuel)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Largeur max mobile (px)</Label>
            <Input
              type="number"
              min={320}
              max={1400}
              className="h-8 text-xs"
              value={gameConfig.autoUX?.mobileBreakpointPx ?? 768}
              onChange={(e) =>
                updateConfig({
                  autoUX: {
                    mode: gameConfig.autoUX?.mode ?? "auto",
                    mobileBreakpointPx: Number(e.target.value) || 768,
                  },
                } as any)
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEME_LIST.map((theme) => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id as keyof typeof THEMES)}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all",
              activeTheme === theme.id
                ? "border-primary bg-primary/5 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
                : "border-border bg-card hover:border-muted-foreground/40"
            )}
          >
            {/* Mini preview */}
            <div className="flex items-center gap-3 mb-3">
              {/* Spin button preview */}
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center text-xs font-bold shrink-0",
                  theme.spinButton.shape === "round" ? "rounded-full" :
                  theme.spinButton.shape === "pill" ? "rounded-full px-3" :
                  theme.spinButton.shape === "hexagon" ? "rounded-lg rotate-45" :
                  "rounded-lg"
                )}
                style={{
                  backgroundColor: theme.spinButton.backgroundColor,
                  color: theme.spinButton.iconColor,
                }}
              >
                <span className={theme.spinButton.shape === "hexagon" ? "-rotate-45" : ""}>▶</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">{theme.name}</h3>
                <span className="text-[10px] text-muted-foreground capitalize">{theme.layout}</span>
              </div>
            </div>

            {/* Color bar preview */}
            <div
              className="h-8 rounded-md flex items-center justify-between px-3"
              style={{
                backgroundColor: theme.bar.backgroundColor,
                borderColor: theme.bar.borderColor,
                borderWidth: theme.bar.border === "none" ? 0 : 1,
                borderStyle: "solid",
                borderRadius: `${Math.min(theme.bar.borderRadius, 12)}px`,
              }}
            >
              <span className="text-[9px] font-mono" style={{ color: theme.balance.color }}>$100.00</span>
              <span className="text-[9px] font-mono" style={{ color: theme.bet.accentColor }}>$1.00</span>
              {theme.autoSpin.visible && (
                <span className="text-[9px]" style={{ color: theme.autoSpin.color }}>AUTO</span>
              )}
            </div>

            {/* Selected indicator */}
            {activeTheme === theme.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[10px]">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Personnalisation avancée */}
      <div className="p-4 rounded-lg border border-border bg-card/50 space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Personnaliser finement l&apos;UX</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Optionnel</span>
        </h4>
        <p className="text-xs text-muted-foreground">
          Si les thèmes ne suffisent pas, utilisez le configurateur avancé pour ajuster le layout, le bouton SPIN, les labels, les couleurs,
          l&apos;auto-spin, etc.
        </p>
        <ControlsCustomizer />
      </div>

      {/* Current config summary */}
      <div className="p-4 rounded-lg border border-border bg-card/50 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Configuration active</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Layout</span>
            <span className="font-mono text-foreground capitalize">{config.layout}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Bouton</span>
            <span className="font-mono text-foreground capitalize">{config.spinButton.shape}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Auto-Spin</span>
            <span className="font-mono text-foreground">{config.autoSpin.visible ? "Oui" : "Non"}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-background">
            <span className="text-muted-foreground">Turbo</span>
            <span className="font-mono text-foreground">{config.turbo.visible ? "Oui" : "Non"}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p>💡 <strong className="text-foreground">Astuce :</strong> Regardez le preview à gauche pour voir le rendu en temps réel. Pour personnaliser chaque détail, passez en Mode Pro.</p>
      </div>
    </div>
  );
}
