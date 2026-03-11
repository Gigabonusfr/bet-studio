import { useState } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/builder/InfoTooltip";
import { DocsLink } from "@/components/builder/DocsLink";
import { HelpBanner } from "@/components/builder/HelpBanner";
import { DOCS } from "@/constants/docs-links";
import { Plus, Trash2, Upload } from "lucide-react";
import type { SymbolDef, SymbolType } from "@/types/game-config";
import { uploadAsset, deleteAsset } from "@/lib/storage-utils";
import { toast } from "sonner";

const COLORS = ["#E74C3C", "#E67E22", "#F1C40F", "#2ECC71", "#3498DB", "#9B59B6", "#1ABC9C", "#E91E63", "#FF5722", "#00BCD4", "#F5A623", "#00D4FF"];

export function Step2Symbols() {
  const { config, updateConfig } = useGameConfig();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingSymbol, setUploadingSymbol] = useState<string | null>(null);
  const symbols = config.symbols;

  // Contextual help for Pro mode — shown at top of the step

  const maxMatch = config.numReels;
  const matchCounts = Array.from({ length: maxMatch - 1 }, (_, i) => i + 2); // e.g. [2,3,4,5]

  function addSymbol() {
    if (symbols.length >= 12) return;
    const id = `sym_${Date.now()}`;
    const defaultPaytable: Record<number, number> = {};
    matchCounts.forEach((c) => (defaultPaytable[c] = 0));
    const newSym: SymbolDef = {
      id,
      name: `S${symbols.length + 1}`,
      type: "low",
      color: COLORS[symbols.length % COLORS.length],
      paytable: defaultPaytable,
    };
    updateConfig({ symbols: [...symbols, newSym] });
    setEditingId(id);
  }

  function removeSymbol(id: string) {
    if (symbols.length <= 6) return;
    updateConfig({ symbols: symbols.filter((s) => s.id !== id) });
  }

  function updateSymbol(id: string, partial: Partial<SymbolDef>) {
    updateConfig({
      symbols: symbols.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    });
  }

  function updatePaytable(id: string, matchCount: number, value: number) {
    const sym = symbols.find((s) => s.id === id);
    if (!sym) return;
    updateSymbol(id, { paytable: { ...sym.paytable, [matchCount]: value } });
  }

  async function handleImageUpload(id: string, file: File) {
    setUploadingSymbol(id);
    try {
      const url = await uploadAsset(file, "images");
      
      // Delete old image if exists
      const sym = symbols.find((s) => s.id === id);
      if (sym?.customImageUrl) {
        await deleteAsset(sym.customImageUrl);
      }
      
      updateSymbol(id, { customImageUrl: url });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploadingSymbol(null);
    }
  }

  async function handleImageRemove(id: string) {
    const sym = symbols.find((s) => s.id === id);
    if (sym?.customImageUrl) {
      await deleteAsset(sym.customImageUrl);
      updateSymbol(id, { customImageUrl: undefined });
      toast.success("Image removed");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Symbols & Paytable</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure 6–12 symbols with their payouts</p>
        </div>
        <DocsLink href={DOCS.math.symbols} />
      </div>

      <HelpBanner id="pro-step2-symbols">
        💡 Ajoutez 6 à 12 symboles avec leurs multiplicateurs par nombre de matchs. Les types (high/low/wild/scatter) influencent la distribution sur les reelstrips.
      </HelpBanner>

      {/* Symbol list */}
      <div className="space-y-3">
        {symbols.map((sym) => {
          const isEditing = editingId === sym.id;
          return (
            <div key={sym.id} className="casino-card p-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setEditingId(isEditing ? null : sym.id)}>
                <div className="w-8 h-8 rounded-md border border-border/50 shrink-0" style={{ backgroundColor: sym.color }} />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-foreground">{sym.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground capitalize">{sym.type}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {Object.entries(sym.paytable).map(([k, v]) => `${k}×${v}`).join(" ")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); removeSymbol(sym.id); }}
                  disabled={symbols.length <= 6}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {isEditing && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input
                        value={sym.name}
                        onChange={(e) => updateSymbol(sym.id, { name: e.target.value.toUpperCase() })}
                        className="bg-input border-border text-foreground h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <Select value={sym.type} onValueChange={(v) => updateSymbol(sym.id, { type: v as SymbolType })}>
                        <SelectTrigger className="bg-input border-border text-foreground h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {["high", "low", "wild", "scatter", "bonus"].map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Color</Label>
                      <div className="flex gap-1 flex-wrap">
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateSymbol(sym.id, { color: c })}
                            className={`w-5 h-5 rounded-sm border transition-all ${sym.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Image (PNG/JPG)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(sym.id, file);
                            }
                          }}
                          disabled={uploadingSymbol === sym.id}
                          className="bg-input border-border text-foreground h-8 text-xs"
                        />
                        {uploadingSymbol === sym.id && (
                          <div className="flex items-center px-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        )}
                      </div>
                      {sym.customImageUrl && (
                        <div className="flex gap-2 items-center">
                          <img src={sym.customImageUrl} alt={sym.name} className="w-8 h-8 object-cover rounded" />
                          <button
                            onClick={() => handleImageRemove(sym.id)}
                            className="text-[10px] text-destructive hover:underline"
                          >
                            Remove image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {sym.type !== "scatter" && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Paytable (multipliers)
                        <InfoTooltip text="Payout multiplier for N matching symbols." docsUrl={DOCS.math.wins} />
                      </Label>
                      <div className="flex gap-3">
                        {matchCounts.map((mc) => (
                          <div key={mc} className="space-y-1">
                            <span className="text-[10px] text-muted-foreground">{mc}× match</span>
                            <Input
                              type="number"
                              min={0}
                              step={0.5}
                              value={sym.paytable[mc] ?? 0}
                              onChange={(e) => updatePaytable(sym.id, mc, parseFloat(e.target.value) || 0)}
                              className="bg-input border-border text-foreground h-8 w-20 text-sm font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sym.type === "wild" && (
                    <p className="text-xs text-cyan">⚡ WILD substitutes for all pay symbols</p>
                  )}
                  {sym.type === "scatter" && (
                    <p className="text-xs text-cyan">⚡ SCATTER triggers bonus — configure in Step 3</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        onClick={addSymbol}
        disabled={symbols.length >= 12}
        variant="outline"
        className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Symbol ({symbols.length}/12)
      </Button>

      {/* Mini grid preview */}
      <div className="casino-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Grid Preview</h3>
        <div
          className="grid gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${config.numReels}, 1fr)`,
            maxWidth: `${config.numReels * 56}px`,
          }}
        >
          {Array.from({ length: config.numReels * config.numRows }).map((_, i) => {
            const sym = symbols[i % symbols.length];
            return (
              <div
                key={i}
                className="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold border border-border/50"
                style={{ backgroundColor: sym?.color + "25", color: sym?.color }}
              >
                {sym?.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
