import { useSlotControls } from "@/context/SlotControlsContext";
import { HelpBanner } from "@/components/builder/HelpBanner";
import { THEMES } from "@/types/slot-controls";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Step8UXControls() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gold">🎮 UX Contrôles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personnalisez l'apparence et le comportement de tous les éléments de contrôle de la slot machine.
        </p>
      </div>

      <HelpBanner id="pro-step8-uxcontrols">
        💡 Personnalisez chaque détail : forme/couleur du bouton spin, barre de contrôle, balance, mise, auto-spin et turbo. Appliquez un preset ou ajustez manuellement.
      </HelpBanner>

      {/* Thèmes Présets */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">🎨 Thèmes Présets</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(THEMES).map(([key, theme]) => (
            <Button
              key={key}
              variant="outline"
              onClick={() => applyTheme(key as keyof typeof THEMES)}
              className="h-auto py-3 flex flex-col gap-1 hover:border-gold"
            >
              <span className="font-semibold text-xs">{theme.name}</span>
              <span className="text-[10px] text-muted-foreground">{theme.layout}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Layout */}
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

      <Accordion type="multiple" className="space-y-2">
        {/* Spin Button */}
        <AccordionItem value="spin" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">🎯 Bouton SPIN</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Forme</Label>
                <Select
                  value={config.spinButton.shape}
                  onValueChange={(value: any) =>
                    updateConfig({ spinButton: { ...config.spinButton, shape: value } })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Couleur de fond</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={config.spinButton.backgroundColor}
                    onChange={(e) =>
                      updateConfig({ spinButton: { ...config.spinButton, backgroundColor: e.target.value } })
                    }
                    className="h-10 w-14 p-1 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{config.spinButton.backgroundColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Couleur icône</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={config.spinButton.iconColor}
                    onChange={(e) =>
                      updateConfig({ spinButton: { ...config.spinButton, iconColor: e.target.value } })
                    }
                    className="h-10 w-14 p-1 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{config.spinButton.iconColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Icône</Label>
                <Select
                  value={config.spinButton.icon}
                  onValueChange={(value: any) =>
                    updateConfig({ spinButton: { ...config.spinButton, icon: value } })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
          </AccordionContent>
        </AccordionItem>

        {/* Balance */}
        <AccordionItem value="balance" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">💰 Balance</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
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
                  <Label className="text-sm">Label personnalisé</Label>
                  <Input
                    value={config.balance.label}
                    onChange={(e) =>
                      updateConfig({ balance: { ...config.balance, label: e.target.value } })
                    }
                    placeholder="BALANCE"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Couleur du montant</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={config.balance.color}
                        onChange={(e) =>
                          updateConfig({ balance: { ...config.balance, color: e.target.value } })
                        }
                        className="h-10 w-14 p-1 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-muted-foreground">{config.balance.color}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Taille de police</Label>
                    <Select
                      value={config.balance.fontSize}
                      onValueChange={(value: any) =>
                        updateConfig({ balance: { ...config.balance, fontSize: value } })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Bet */}
        <AccordionItem value="bet" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">💵 Mise (Bet)</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Style des flèches</Label>
                  <Select
                    value={config.bet.style}
                    onValueChange={(value: any) =>
                      updateConfig({ bet: { ...config.bet, style: value } })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={config.bet.accentColor}
                      onChange={(e) =>
                        updateConfig({ bet: { ...config.bet, accentColor: e.target.value } })
                      }
                      className="h-10 w-14 p-1 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{config.bet.accentColor}</span>
                  </div>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Auto-Spin */}
        <AccordionItem value="autospin" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">🔁 Auto-Spin</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
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
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={config.autoSpin.color}
                    onChange={(e) =>
                      updateConfig({ autoSpin: { ...config.autoSpin, color: e.target.value } })
                    }
                    className="h-10 w-14 p-1 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{config.autoSpin.color}</span>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Turbo */}
        <AccordionItem value="turbo" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">⚡ Turbo</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Couleur</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={config.turbo.color}
                      onChange={(e) =>
                        updateConfig({ turbo: { ...config.turbo, color: e.target.value } })
                      }
                      className="h-10 w-14 p-1 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{config.turbo.color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Vitesse</Label>
                  <Select
                    value={config.turbo.speed.toString()}
                    onValueChange={(value: any) =>
                      updateConfig({ turbo: { ...config.turbo, speed: parseInt(value) as 2 | 3 | 5 } })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">x2</SelectItem>
                      <SelectItem value="3">x3</SelectItem>
                      <SelectItem value="5">x5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Barre / Container */}
        <AccordionItem value="bar" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">📦 Barre / Container</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Couleur de fond</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={config.bar.backgroundColor}
                    onChange={(e) =>
                      updateConfig({ bar: { ...config.bar, backgroundColor: e.target.value } })
                    }
                    className="h-10 w-14 p-1 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{config.bar.backgroundColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Position</Label>
                <Select
                  value={config.bar.position}
                  onValueChange={(value: any) =>
                    updateConfig({ bar: { ...config.bar, position: value } })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom">Bas</SelectItem>
                    <SelectItem value="top">Haut</SelectItem>
                    <SelectItem value="floating">Flottante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Bordure</Label>
                <Select
                  value={config.bar.border}
                  onValueChange={(value: any) =>
                    updateConfig({ bar: { ...config.bar, border: value } })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={config.bar.borderColor}
                      onChange={(e) =>
                        updateConfig({ bar: { ...config.bar, borderColor: e.target.value } })
                      }
                      className="h-10 w-14 p-1 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={resetToDefault} variant="outline" className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset (Ocean)
        </Button>
        <Button onClick={handleExport} variant="outline" className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Sauvegarder JSON
        </Button>
      </div>
    </div>
  );
}
