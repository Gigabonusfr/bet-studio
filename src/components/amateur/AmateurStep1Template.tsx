import { useGameConfig } from "@/context/GameConfigContext";
import { OFFICIAL_TEMPLATES, OFFICIAL_TEMPLATE_IDS, getOfficialSymbolsForTemplate, isOfficialTemplate } from "@/data/official-stake-templates";
import { cn } from "@/lib/utils";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";

export function AmateurStep1Template() {
  const { config, updateConfig } = useGameConfig();

  function selectOfficialTemplate(templateId: keyof typeof OFFICIAL_TEMPLATES) {
    const t = OFFICIAL_TEMPLATES[templateId];
    updateConfig({
      gameId: t.gameId,
      numReels: t.grid[0],
      numRows: t.grid[1],
      winMechanic: t.mechanic,
      numPaylines: t.numPaylines,
      tumbleEnabled: t.tumbleEnabled,
      symbols: getOfficialSymbolsForTemplate(templateId),
      rtpTarget: 96,
      baseBetMode: { name: "base", cost: 1.0 },
      ...(config.freeSpins?.enabled && {
        freeSpins: { ...config.freeSpins, modeName: "freegame" },
      }),
      gameVersion: config.gameVersion || "1.0.0",
    } as any);
  }

  const selectedOfficialId = isOfficialTemplate(config.gameId) ? config.gameId : null;

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(0)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choisissez un Template</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Templates officiels Stake Engine — math géré côté SDK, export skin only (pas de package math à gérer).
        </p>
      </div>

      <div>
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

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">💡 Quel template choisir ?</p>
        <ul className="space-y-1 text-xs">
          <li><strong>Lines (5×3)</strong> — Slot classique 20 lignes, idéal pour débuter</li>
          <li><strong>Ways (5×3)</strong> — 243 ways, gains par adjacence</li>
          <li><strong>Cluster (7×7)</strong> — Grille large avec tumble</li>
          <li><strong>Scatter Pays (6×5)</strong> — Pay-anywhere avec tumble</li>
          <li><strong>Expanding Wilds (5×5)</strong> — Wilds expansifs en Free Spins</li>
        </ul>
      </div>
    </div>
  );
}
