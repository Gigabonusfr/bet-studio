import { useGameConfig } from "@/context/GameConfigContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";

export function AmateurStep3Symbols() {
  const { config, updateConfig } = useGameConfig();
  const symbols = config.symbols;

  function updateSymbolColor(id: string, color: string) {
    updateConfig({
      symbols: symbols.map((s) => (s.id === id ? { ...s, color } : s)),
    });
  }

  function updateSymbolName(id: string, name: string) {
    updateConfig({
      symbols: symbols.map((s) => (s.id === id ? { ...s, name } : s)),
    });
  }

  function updateSymbolImage(id: string, file: File) {
    const url = URL.createObjectURL(file);
    updateConfig({
      symbols: symbols.map((s) => (s.id === id ? { ...s, customImageUrl: url } : s)),
    });
  }

  const highSymbols = symbols.filter((s) => s.type === "high");
  const lowSymbols = symbols.filter((s) => s.type === "low");
  const specialSymbols = symbols.filter((s) => s.type === "wild" || s.type === "scatter");

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(3)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Personnalisez les Symboles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Les symboles et leur paytable sont pré-configurés par le template. Changez les couleurs, noms et images selon votre thème.
        </p>
      </div>

      {/* Special symbols */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">⭐ Symboles Spéciaux</h3>
        <div className="grid grid-cols-1 gap-3">
          {specialSymbols.map((sym) => (
            <SymbolCard
              key={sym.id}
              symbol={sym}
              onColorChange={(c) => updateSymbolColor(sym.id, c)}
              onNameChange={(n) => updateSymbolName(sym.id, n)}
              onImageChange={(f) => updateSymbolImage(sym.id, f)}
            />
          ))}
        </div>
      </div>

      {/* High pay */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">💰 Symboles High Pay</h3>
        <p className="text-xs text-muted-foreground">Les symboles qui rapportent le plus. Leurs gains sont déjà configurés.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {highSymbols.map((sym) => (
            <SymbolCard
              key={sym.id}
              symbol={sym}
              onColorChange={(c) => updateSymbolColor(sym.id, c)}
              onNameChange={(n) => updateSymbolName(sym.id, n)}
              onImageChange={(f) => updateSymbolImage(sym.id, f)}
            />
          ))}
        </div>
      </div>

      {/* Low pay */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">🃏 Symboles Low Pay</h3>
        <p className="text-xs text-muted-foreground">Symboles fréquents à faible gain.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lowSymbols.map((sym) => (
            <SymbolCard
              key={sym.id}
              symbol={sym}
              onColorChange={(c) => updateSymbolColor(sym.id, c)}
              onNameChange={(n) => updateSymbolName(sym.id, n)}
              onImageChange={(f) => updateSymbolImage(sym.id, f)}
            />
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p>💡 <strong className="text-foreground">Paytable :</strong> Les valeurs de gains sont automatiquement configurées par le template. Pour les modifier, utilisez le Mode Pro.</p>
      </div>
    </div>
  );
}

function SymbolCard({
  symbol,
  onColorChange,
  onNameChange,
  onImageChange,
}: {
  symbol: { id: string; name: string; type: string; color: string; customImageUrl?: string };
  onColorChange: (color: string) => void;
  onNameChange: (name: string) => void;
  onImageChange: (file: File) => void;
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
      <div className="flex items-center gap-2">
        {/* Color preview */}
        <div
          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: symbol.color + "30", color: symbol.color }}
        >
          {symbol.customImageUrl ? (
            <img src={symbol.customImageUrl} alt={symbol.name} className="w-full h-full object-contain rounded" />
          ) : (
            symbol.name
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Input
            value={symbol.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-8 text-sm bg-input border-border"
            placeholder="Nom"
          />
        </div>
        <Input
          type="color"
          value={symbol.color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-10 h-8 p-0.5 cursor-pointer bg-input border-border shrink-0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Image personnalisée</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageChange(file);
          }}
          className="h-7 text-[10px] bg-input border-border"
        />
      </div>
    </div>
  );
}
