import { useGameConfig } from "@/context/GameConfigContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/builder/InfoTooltip";
import { HelpBanner } from "@/components/builder/HelpBanner";
import { DocsLink } from "@/components/builder/DocsLink";
import { DOCS } from "@/constants/docs-links";
import type { Volatility, FreeSpinMultiplier } from "@/types/game-config";

export function Step3GameModes() {
  const { config, updateConfig } = useGameConfig();
  const fs = config.freeSpins;

  function updateFS(partial: Partial<typeof fs>) {
    updateConfig({ freeSpins: { ...fs, ...partial } });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Modes de Jeu</h2>
          <p className="text-sm text-muted-foreground mt-1">Configurez les bet modes, RTP cible et fonctionnalités bonus</p>
        </div>
        <DocsLink href={DOCS.math.betMode} />
      </div>

      <HelpBanner id="pro-step3-gamemodes">
        💡 Configurez le RTP cible, la volatilité, les free spins et le bonus buy. Ces valeurs pilotent les simulations et l'optimisation mathématique.
      </HelpBanner>

      {/* Base game */}
      <div className="casino-card p-5 space-y-5">
        <h3 className="text-lg font-semibold text-gold">Base Game</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-foreground">
              Bet Mode Name
              <InfoTooltip text="Nom du mode de jeu par défaut." docsUrl={DOCS.math.betMode} />
            </Label>
            <Input
              value={config.baseBetMode.name}
              onChange={(e) => updateConfig({ baseBetMode: { ...config.baseBetMode, name: e.target.value } })}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">
              Cost Multiplier
              <InfoTooltip text="Débit joueur = Mise de base × Multiplicateur de coût" docsUrl={DOCS.math.betMode} />
            </Label>
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={config.baseBetMode.cost}
              onChange={(e) => updateConfig({ baseBetMode: { ...config.baseBetMode, cost: parseFloat(e.target.value) || 1 } })}
              className="bg-input border-border text-foreground font-mono"
            />
          </div>
        </div>

        <HelpBanner id="pro-step3-betmode" className="space-y-1">
          <p>💡 <strong className="text-foreground">Débit joueur</strong> = Mise de base × Cost multiplier</p>
          <p>💡 Les montants sont des entiers avec 6 décimales. Mise de $1 = passer 1000000.</p>
          <a href={DOCS.rgs.api} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">→ Documentation RGS API</a>
        </HelpBanner>

        {/* RTP */}
        <div className="space-y-3">
          <Label className="text-foreground">
            RTP Cible: <span className="text-gold font-semibold">{config.rtpTarget}%</span>
            <InfoTooltip text="Return to Player — le pourcentage théorique retourné sur le long terme." docsUrl={DOCS.math.distribution} />
          </Label>
          <Slider
            value={[config.rtpTarget]}
            onValueChange={([v]) => updateConfig({ rtpTarget: v })}
            min={85}
            max={98}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>85%</span><span>98%</span>
          </div>
        </div>

        {/* Volatility */}
        <div className="space-y-2">
          <Label className="text-foreground">Volatilité</Label>
          <div className="flex gap-3">
            {(["low", "medium", "high"] as Volatility[]).map((v) => (
              <button
                key={v}
                onClick={() => updateConfig({ volatility: v })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-all ${
                  config.volatility === v
                    ? "border-gold text-gold bg-gold/5"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50"
                }`}
              >
                {v === "low" ? "Basse" : v === "medium" ? "Moyenne" : "Haute"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Free Spins */}
      <div className="casino-card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gold">Bonus — Free Spins</h3>
          <Switch checked={fs.enabled} onCheckedChange={(v) => updateFS({ enabled: v })} />
        </div>

        {fs.enabled && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-foreground">Nom du Mode</Label>
                <Input
                  value={fs.modeName}
                  onChange={(e) => updateFS({ modeName: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Cost Multiplier (Bonus Buy)</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={fs.costMultiplier}
                  onChange={(e) => updateFS({ costMultiplier: parseFloat(e.target.value) || 100 })}
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Free Spins par Nombre de Scatters</Label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 4, 5].map((sc) => (
                  <div key={sc} className="space-y-1">
                    <span className="text-xs text-muted-foreground">{sc} Scatters</span>
                    <Input
                      type="number"
                      min={1}
                      value={fs.scatterAwards[sc] ?? 10}
                      onChange={(e) =>
                        updateFS({ scatterAwards: { ...fs.scatterAwards, [sc]: parseInt(e.target.value) || 0 } })
                      }
                      className="bg-input border-border text-foreground font-mono h-9"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-foreground">Multiplicateur Pendant Free Spins</Label>
                <Select value={fs.multiplier} onValueChange={(v) => updateFS({ multiplier: v as FreeSpinMultiplier })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {["none", "2x", "3x", "5x", "random"].map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">{m === "none" ? "Aucun" : m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={fs.retrigger} onCheckedChange={(v) => updateFS({ retrigger: v })} />
                <Label className="text-foreground">Autoriser Retrigger</Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">💡 Prochaines étapes</p>
        <p>
          Après avoir configuré vos modes de jeu, passez à l'onglet <strong className="text-gold">Math & Publication</strong> pour:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Configurer les reelstrips</li>
          <li>Générer le game_config.py compatible SDK</li>
          <li>Exporter le package complet</li>
        </ul>
      </div>
    </div>
  );
}
