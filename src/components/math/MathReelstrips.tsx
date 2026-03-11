import { useState, useMemo } from "react";
import { useMathConfig } from "@/context/MathConfigContext";
import { useGameConfig } from "@/context/GameConfigContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, Trash2, Wand2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAutoReelstrip, generateReelstripCSV } from "@/lib/stake-engine-generator";
import { toast } from "sonner";

export function MathReelstrips() {
  const { mathConfig, updateReelStrip, addReelStrip, removeReelStrip, updateMathConfig } = useMathConfig();
  const { config } = useGameConfig();
  const [activeMode, setActiveMode] = useState<"basegame" | "freegame">("basegame");
  const [activeStrip, setActiveStrip] = useState<string>("BR0");

  const strips = activeMode === "basegame" ? mathConfig.basegameStrips : mathConfig.freegameStrips;
  const currentStrip = strips.find((s) => s.id === activeStrip) || strips[0];

  const validSymbols = useMemo(() => {
    const names = config.symbols.map((s) => s.name);
    names.push("WILD", "SCATTER");
    return new Set(names);
  }, [config.symbols]);

  const handleCellChange = (reelIndex: number, rowIndex: number, value: string) => {
    if (!currentStrip) return;
    const newReels = currentStrip.reels.map((reel, ri) =>
      ri === reelIndex
        ? reel.map((sym, si) => (si === rowIndex ? value.toUpperCase() : sym))
        : [...reel]
    );
    updateReelStrip(activeMode, currentStrip.id, newReels);
  };

  const handleAddRow = (reelIndex: number) => {
    if (!currentStrip) return;
    const newReels = currentStrip.reels.map((reel, ri) =>
      ri === reelIndex ? [...reel, "L1"] : [...reel]
    );
    updateReelStrip(activeMode, currentStrip.id, newReels);
  };

  const handleRemoveRow = (reelIndex: number, rowIndex: number) => {
    if (!currentStrip) return;
    const newReels = currentStrip.reels.map((reel, ri) =>
      ri === reelIndex ? reel.filter((_, si) => si !== rowIndex) : [...reel]
    );
    updateReelStrip(activeMode, currentStrip.id, newReels);
  };

  const handleWeightChange = (stripId: string, weight: number) => {
    const key = activeMode === "basegame" ? "basegameStrips" : "freegameStrips";
    updateMathConfig({
      [key]: mathConfig[key].map((s) =>
        s.id === stripId ? { ...s, weight } : s
      ),
    });
  };

  const handleExportCSV = () => {
    if (!currentStrip) return;
    const csv = generateReelstripCSV(currentStrip.reels);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentStrip.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAuto = () => {
    if (!currentStrip) return;
    const reels = generateAutoReelstrip(config, activeMode, 50);
    updateReelStrip(activeMode, currentStrip.id, reels);
    toast.success(`Reelstrip ${currentStrip.id} générée (50 positions/reel, WILD+SCATTER garantis)`);
  };

  const handleAddStrip = () => {
    addReelStrip(activeMode);
  };

  const handleRemoveStrip = (stripId: string) => {
    removeReelStrip(activeMode, stripId);
    if (activeStrip === stripId) {
      setActiveStrip(strips[0]?.id || "");
    }
  };

  // Calculate frequencies + validation
  const { frequencies, validation } = useMemo(() => {
    if (!currentStrip) return { frequencies: {}, validation: { wildOnAll: true, scatterOnAll: true, minLength: 0 } };
    const counts: Record<string, number> = {};
    let total = 0;
    currentStrip.reels.forEach((reel) => {
      reel.forEach((sym) => {
        counts[sym] = (counts[sym] || 0) + 1;
        total++;
      });
    });

    const wildName = config.symbols.find(s => s.type === "wild")?.name || "WILD";
    const scatterName = config.symbols.find(s => s.type === "scatter")?.name || "SCATTER";
    const wildOnAll = currentStrip.reels.every(reel => reel.includes(wildName));
    const scatterOnAll = currentStrip.reels.every(reel => reel.includes(scatterName));
    const minLength = Math.min(...currentStrip.reels.map(r => r.length));

    return {
      frequencies: Object.fromEntries(
        Object.entries(counts).map(([sym, count]) => [sym, ((count / total) * 100).toFixed(1)])
      ),
      validation: { wildOnAll, scatterOnAll, minLength },
    };
  }, [currentStrip, config.symbols]);

  const maxRows = currentStrip ? Math.max(...currentStrip.reels.map((r) => r.length)) : 0;

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <Tabs value={activeMode} onValueChange={(v) => {
        setActiveMode(v as "basegame" | "freegame");
        setActiveStrip(v === "basegame" ? "BR0" : "FR0");
      }}>
        <TabsList>
          <TabsTrigger value="basegame">Basegame (BR)</TabsTrigger>
          <TabsTrigger value="freegame">Freegame (FR)</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Strip Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Bandes de rouleaux ({activeMode})</CardTitle>
            <Button size="sm" variant="outline" onClick={handleAddStrip}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter bande
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {strips.map((strip) => (
              <div
                key={strip.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors",
                  activeStrip === strip.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setActiveStrip(strip.id)}
              >
                <span className="font-mono text-sm">{strip.id}</span>
                <Input
                  type="number"
                  min={1}
                  value={strip.weight}
                  onChange={(e) => handleWeightChange(strip.id, parseInt(e.target.value) || 1)}
                  className="w-16 h-7 text-xs"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-muted-foreground">poids</span>
                {strips.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStrip(strip.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Checks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Validation reelstrip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            {validation.minLength >= 30 ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : validation.minLength >= 20 ? (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <span>Min positions/reel: {validation.minLength} {validation.minLength < 30 ? "(recommandé: 30+)" : "✓"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {validation.wildOnAll ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span>WILD sur chaque rouleau {validation.wildOnAll ? "✓" : "— manquant"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {validation.scatterOnAll ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span>SCATTER sur chaque rouleau {validation.scatterOnAll ? "✓" : "— manquant"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleGenerateAuto}>
          <Wand2 className="h-4 w-4 mr-2" /> Générer automatiquement
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" /> Exporter {currentStrip?.id}.csv
        </Button>
      </div>

      {/* Frequencies Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Fréquences calculées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(frequencies).map(([sym, freq]) => (
              <div
                key={sym}
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono",
                  validSymbols.has(sym) ? "bg-muted" : "bg-destructive/20 text-destructive"
                )}
              >
                {sym}: {freq}%
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reelstrip Editor Table */}
      {currentStrip && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Éditeur de bande : {currentStrip.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-xs text-muted-foreground p-2 text-left">#</th>
                    {currentStrip.reels.map((_, i) => (
                      <th key={i} className="text-xs text-muted-foreground p-2 text-center">
                        Reel {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxRows }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-border">
                      <td className="text-xs text-muted-foreground p-2">{rowIndex + 1}</td>
                      {currentStrip.reels.map((reel, reelIndex) => {
                        const sym = reel[rowIndex] || "";
                        const isValid = !sym || validSymbols.has(sym);
                        return (
                          <td key={reelIndex} className="p-1">
                            {rowIndex < reel.length ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  value={sym}
                                  onChange={(e) => handleCellChange(reelIndex, rowIndex, e.target.value)}
                                  className={cn(
                                    "h-8 w-20 text-xs text-center font-mono",
                                    !isValid && "border-destructive bg-destructive/10"
                                  )}
                                />
                                {!isValid && (
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => handleRemoveRow(reelIndex, rowIndex)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t border-border">
                    <td></td>
                    {currentStrip.reels.map((_, reelIndex) => (
                      <td key={reelIndex} className="p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-xs"
                          onClick={() => handleAddRow(reelIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Ajouter
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
