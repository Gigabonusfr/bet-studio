import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, RotateCcw, Save, Download } from "lucide-react";
import { useSlotControls } from "@/context/SlotControlsContext";
import { THEMES } from "@/types/slot-controls";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export function ControlsCustomizer() {
  const { config, updateConfig, applyTheme, resetToDefault, exportConfig } = useSlotControls();

  const handleExport = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slot-controls-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configuration exportée !");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          ⚙️ Personnaliser
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Personnalisation des Contrôles</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Thèmes Présets */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">🎨 Thèmes</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([key, theme]) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => applyTheme(key as keyof typeof THEMES)}
                  className="h-auto py-3 flex flex-col gap-1"
                >
                  <span className="font-semibold">{theme.name}</span>
                  <span className="text-xs text-muted-foreground">{theme.layout}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Layout Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">📐 Layout</Label>
            <Select
              value={config.layout}
              onValueChange={(value: any) => updateConfig({ layout: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="integrated">Barre Intégrée (Casino Mobile)</SelectItem>
                <SelectItem value="separated">Boutons Séparés (Arcade)</SelectItem>
                <SelectItem value="minimal">Minimal (Épuré)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Spin Button */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">🎯 Bouton SPIN</Label>
            
            <div className="space-y-2">
              <Label className="text-sm">Forme</Label>
              <Select
                value={config.spinButton.shape}
                onValueChange={(value: any) =>
                  updateConfig({ spinButton: { ...config.spinButton, shape: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Rond</SelectItem>
                  <SelectItem value="rounded-square">Carré arrondi</SelectItem>
                  <SelectItem value="hexagon">Hexagone</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Taille</Label>
              <Select
                value={config.spinButton.size}
                onValueChange={(value: any) =>
                  updateConfig({ spinButton: { ...config.spinButton, size: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Couleur de fond</Label>
              <Input
                type="color"
                value={config.spinButton.backgroundColor}
                onChange={(e) =>
                  updateConfig({ spinButton: { ...config.spinButton, backgroundColor: e.target.value } })
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Couleur de l'icône</Label>
              <Input
                type="color"
                value={config.spinButton.iconColor}
                onChange={(e) =>
                  updateConfig({ spinButton: { ...config.spinButton, iconColor: e.target.value } })
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Icône</Label>
              <Select
                value={config.spinButton.icon}
                onValueChange={(value: any) =>
                  updateConfig({ spinButton: { ...config.spinButton, icon: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrow">Flèche ↻</SelectItem>
                  <SelectItem value="play">Play ▶</SelectItem>
                  <SelectItem value="lightning">Éclair ⚡</SelectItem>
                  <SelectItem value="text">Texte "SPIN"</SelectItem>
                  <SelectItem value="dice">Dés 🎲</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Animation au clic</Label>
              <Select
                value={config.spinButton.animation}
                onValueChange={(value: any) =>
                  updateConfig({ spinButton: { ...config.spinButton, animation: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pulse">Pulse</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                  <SelectItem value="rotate">Rotate</SelectItem>
                  <SelectItem value="glow">Glow</SelectItem>
                  <SelectItem value="none">Aucune</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Balance */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">💰 Balance</Label>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Afficher</Label>
              <Switch
                checked={config.balance.visible}
                onCheckedChange={(checked) =>
                  updateConfig({ balance: { ...config.balance, visible: checked } })
                }
              />
            </div>

            {config.balance.visible && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Label</Label>
                  <Input
                    value={config.balance.label}
                    onChange={(e) =>
                      updateConfig({ balance: { ...config.balance, label: e.target.value } })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Couleur</Label>
                  <Input
                    type="color"
                    value={config.balance.color}
                    onChange={(e) =>
                      updateConfig({ balance: { ...config.balance, color: e.target.value } })
                    }
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Taille de police</Label>
                  <Select
                    value={config.balance.fontSize}
                    onValueChange={(value: any) =>
                      updateConfig({ balance: { ...config.balance, fontSize: value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Bet */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">💵 Mise (Bet)</Label>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Afficher</Label>
              <Switch
                checked={config.bet.visible}
                onCheckedChange={(checked) =>
                  updateConfig({ bet: { ...config.bet, visible: checked } })
                }
              />
            </div>

            {config.bet.visible && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Style</Label>
                  <Select
                    value={config.bet.style}
                    onValueChange={(value: any) =>
                      updateConfig({ bet: { ...config.bet, style: value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arrows">∧∨</SelectItem>
                      <SelectItem value="plusminus">+-</SelectItem>
                      <SelectItem value="slider">Slider</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Couleur accent</Label>
                  <Input
                    type="color"
                    value={config.bet.accentColor}
                    onChange={(e) =>
                      updateConfig({ bet: { ...config.bet, accentColor: e.target.value } })
                    }
                    className="h-10"
                  />
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Auto-Spin */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">🔁 Auto-Spin</Label>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Afficher</Label>
              <Switch
                checked={config.autoSpin.visible}
                onCheckedChange={(checked) =>
                  updateConfig({ autoSpin: { ...config.autoSpin, visible: checked } })
                }
              />
            </div>

            {config.autoSpin.visible && (
              <div className="space-y-2">
                <Label className="text-sm">Couleur</Label>
                <Input
                  type="color"
                  value={config.autoSpin.color}
                  onChange={(e) =>
                    updateConfig({ autoSpin: { ...config.autoSpin, color: e.target.value } })
                  }
                  className="h-10"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Turbo */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">⚡ Turbo</Label>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Afficher</Label>
              <Switch
                checked={config.turbo.visible}
                onCheckedChange={(checked) =>
                  updateConfig({ turbo: { ...config.turbo, visible: checked } })
                }
              />
            </div>

            {config.turbo.visible && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Couleur</Label>
                  <Input
                    type="color"
                    value={config.turbo.color}
                    onChange={(e) =>
                      updateConfig({ turbo: { ...config.turbo, color: e.target.value } })
                    }
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Vitesse turbo</Label>
                  <Select
                    value={config.turbo.speed.toString()}
                    onValueChange={(value: any) =>
                      updateConfig({ turbo: { ...config.turbo, speed: parseInt(value) as 2 | 3 | 5 } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">x2</SelectItem>
                      <SelectItem value="3">x3</SelectItem>
                      <SelectItem value="5">x5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Bar/Container */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">📦 Barre / Container</Label>
            
            <div className="space-y-2">
              <Label className="text-sm">Couleur de fond</Label>
              <Input
                type="color"
                value={config.bar.backgroundColor}
                onChange={(e) =>
                  updateConfig({ bar: { ...config.bar, backgroundColor: e.target.value } })
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Opacité: {config.bar.opacity}%</Label>
              <Slider
                value={[config.bar.opacity]}
                onValueChange={([value]) =>
                  updateConfig({ bar: { ...config.bar, opacity: value } })
                }
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Bordure</Label>
              <Select
                value={config.bar.border}
                onValueChange={(value: any) =>
                  updateConfig({ bar: { ...config.bar, border: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="thin">Fine</SelectItem>
                  <SelectItem value="glow">Glow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.bar.border !== "none" && (
              <div className="space-y-2">
                <Label className="text-sm">Couleur bordure</Label>
                <Input
                  type="color"
                  value={config.bar.borderColor}
                  onChange={(e) =>
                    updateConfig({ bar: { ...config.bar, borderColor: e.target.value } })
                  }
                  className="h-10"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Rayon des coins: {config.bar.borderRadius}px</Label>
              <Slider
                value={[config.bar.borderRadius]}
                onValueChange={([value]) =>
                  updateConfig({ bar: { ...config.bar, borderRadius: value } })
                }
                min={0}
                max={32}
                step={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Position</Label>
              <Select
                value={config.bar.position}
                onValueChange={(value: any) =>
                  updateConfig({ bar: { ...config.bar, position: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">Bas</SelectItem>
                  <SelectItem value="top">Haut</SelectItem>
                  <SelectItem value="floating">Flottante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={resetToDefault} variant="outline" className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleExport} variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
