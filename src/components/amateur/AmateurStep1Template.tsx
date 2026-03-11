import { useGameConfig } from "@/context/GameConfigContext";
import { GAME_TEMPLATES, type GameTemplate } from "@/data/game-templates";
import { OFFICIAL_TEMPLATES, OFFICIAL_TEMPLATE_IDS, isOfficialTemplate } from "@/data/official-stake-templates";
import { cn } from "@/lib/utils";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";

export function AmateurStep1Template() {
  const { config, updateConfig } = useGameConfig();

  function selectTemplate(template: GameTemplate) {
    updateConfig({ ...template.config });
  }

  function selectOfficialTemplate(templateId: keyof typeof OFFICIAL_TEMPLATES) {
    const t = OFFICIAL_TEMPLATES[templateId];
    updateConfig({
      gameId: t.gameId,
      numReels: t.grid[0],
      numRows: t.grid[1],
      winMechanic: t.mechanic,
      numPaylines: t.numPaylines,
      tumbleEnabled: t.tumbleEnabled,
    } as any);
  }

  const selectedId = GAME_TEMPLATES.find(
    (t) => t.config.winMechanic === config.winMechanic && t.config.numReels === config.numReels && t.config.numRows === config.numRows
  )?.id;
  const selectedOfficialId = isOfficialTemplate(config.gameId) ? config.gameId : null;

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(0)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choisissez un Template</h2>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>Templates officiels Stake Engine</strong> → export skin only (maths côté SDK). <strong>Templates personnalisés</strong> → export package math complet.
        </p>
      </div>

      {/* Templates officiels 0_0_* — export = skin_config.json uniquement */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">🎯 Officiels Stake (skin only)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OFFICIAL_TEMPLATE_IDS.map((id) => {
            const t = OFFICIAL_TEMPLATES[id];
            return (
              <button
                key={id}
                onClick={() => selectOfficialTemplate(id)}
                className={cn(
                  "relative rounded-xl border-2 p-4 text-left transition-all",
                  selectedOfficialId === id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/40"
                )}
              >
                <span className="text-2xl">🎰</span>
                <h4 className="font-bold text-foreground mt-1">{t.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono mt-2 inline-block">
                  {t.grid[0]}×{t.grid[1]} • {t.mechanic}
                </span>
                {selectedOfficialId === id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[10px]">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-foreground">Templates personnalisés (package math complet)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GAME_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => selectTemplate(template)}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all",
              selectedId === template.id
                ? "border-primary bg-primary/5 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
                : "border-border bg-card hover:border-muted-foreground/40"
            )}
          >
            {/* Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{template.icon}</span>
              <span className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                template.difficulty === "Facile" ? "bg-primary/10 text-primary" :
                template.difficulty === "Moyen" ? "bg-accent text-accent-foreground" :
                "bg-destructive/10 text-destructive"
              )}>
                {template.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1">{template.name}</h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{template.description}</p>

            {/* Preview specs */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono">
                {template.preview.reels}×{template.preview.rows}
              </span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded">
                {template.preview.mechanic}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-muted-foreground bg-background border border-border px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Selected indicator */}
            {selectedId === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Help box */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">💡 Quel template choisir ?</p>
        <ul className="space-y-1 text-xs">
          <li><strong>Classic Lines</strong> — Idéal pour débuter, comme Book of Dead ou Starburst</li>
          <li><strong>Ways to Win</strong> — Style Buffalo ou Bonanza, gains par adjacence</li>
          <li><strong>Cluster Tumble</strong> — Style Sugar Rush ou Sweet Bonanza, grille large</li>
          <li><strong>Scatter Pays</strong> — Style Gates of Olympus, pay-anywhere avec tumble</li>
        </ul>
      </div>
    </div>
  );
}
