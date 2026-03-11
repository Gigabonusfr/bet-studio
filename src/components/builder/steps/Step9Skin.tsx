import { useMemo } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { HelpBanner } from "@/components/builder/HelpBanner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SkinBadgeStyle, SkinConfigFront, SkinImageFit } from "@/types/game-config";
import { DEFAULT_SKIN } from "@/types/game-config";

function mergeSkin(partial?: SkinConfigFront): SkinConfigFront {
  return {
    ...DEFAULT_SKIN,
    ...partial,
    tokens: { ...DEFAULT_SKIN.tokens, ...(partial?.tokens || {}) },
    header: { ...DEFAULT_SKIN.header, ...(partial?.header || {}) },
    grid: { ...DEFAULT_SKIN.grid, ...(partial?.grid || {}) },
    symbols: { ...DEFAULT_SKIN.symbols, ...(partial?.symbols || {}) },
    banners: { ...DEFAULT_SKIN.banners, ...(partial?.banners || {}) },
  };
}

export function Step9Skin() {
  const { config, updateConfig } = useGameConfig();
  const skin = useMemo(() => mergeSkin(config.skin), [config.skin]);

  const setSkin = (next: Partial<SkinConfigFront>) => {
    updateConfig({ skin: mergeSkin({ ...skin, ...next } as SkinConfigFront) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gold">🧩 Skin (Front only)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personnalisez le rendu du front (preview + export) sans toucher au Math.
        </p>
      </div>

      <HelpBanner id="pro-step9-skin">
        💡 Tout ce qui est ici est exporté dans <code className="bg-muted px-1 rounded">embed-config.json</code> et appliqué côté player.
      </HelpBanner>

      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="grid">Grille</TabsTrigger>
          <TabsTrigger value="symbols">Symboles</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Couleur Gold</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={skin.tokens.gold || "#FFD700"}
                onChange={(e) => setSkin({ tokens: { ...skin.tokens, gold: e.target.value } })}
                className="h-10 w-14 p-1 cursor-pointer"
              />
              <Input
                value={skin.tokens.gold || "#FFD700"}
                onChange={(e) => setSkin({ tokens: { ...skin.tokens, gold: e.target.value } })}
                className="font-mono"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <Label className="text-sm">Badge Nom du jeu</Label>
              <p className="text-xs text-muted-foreground">Preview: sous la barre builder • Export: overlay top-left</p>
            </div>
            <Switch
              checked={skin.header.showGameNameBadge}
              onCheckedChange={(v) => setSkin({ header: { ...skin.header, showGameNameBadge: v } })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <Label className="text-sm">Badge Heure</Label>
              <p className="text-xs text-muted-foreground">Horloge live (1s)</p>
            </div>
            <Switch
              checked={skin.header.showClockBadge}
              onCheckedChange={(v) => setSkin({ header: { ...skin.header, showClockBadge: v } })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Style badge Nom (preview)</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={skin.header.builderBadgeVariantName}
                onChange={(e) =>
                  setSkin({ header: { ...skin.header, builderBadgeVariantName: e.target.value as SkinBadgeStyle } })
                }
              >
                <option value="secondary">secondary</option>
                <option value="outline">outline</option>
                <option value="default">default</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Style badge Heure (preview)</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={skin.header.builderBadgeVariantClock}
                onChange={(e) =>
                  setSkin({ header: { ...skin.header, builderBadgeVariantClock: e.target.value as SkinBadgeStyle } })
                }
              >
                <option value="outline">outline</option>
                <option value="secondary">secondary</option>
                <option value="default">default</option>
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Gap cellules: {skin.grid.gapPx}px</Label>
            <Slider
              value={[skin.grid.gapPx]}
              min={0}
              max={24}
              step={1}
              onValueChange={([v]) => setSkin({ grid: { ...skin.grid, gapPx: v } })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Marge sécurité (anti-coupe): {skin.grid.safetyPx}px</Label>
            <Slider
              value={[skin.grid.safetyPx]}
              min={0}
              max={12}
              step={1}
              onValueChange={([v]) => setSkin({ grid: { ...skin.grid, safetyPx: v } })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Padding allowance: {skin.grid.paddingAllowancePx}px</Label>
            <Slider
              value={[skin.grid.paddingAllowancePx]}
              min={40}
              max={240}
              step={5}
              onValueChange={([v]) => setSkin({ grid: { ...skin.grid, paddingAllowancePx: v } })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Min cell: {skin.grid.minCellPx}px</Label>
              <Slider
                value={[skin.grid.minCellPx]}
                min={24}
                max={80}
                step={1}
                onValueChange={([v]) => setSkin({ grid: { ...skin.grid, minCellPx: v } })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Max cell: {skin.grid.maxCellPx}px</Label>
              <Slider
                value={[skin.grid.maxCellPx]}
                min={40}
                max={140}
                step={1}
                onValueChange={([v]) => setSkin({ grid: { ...skin.grid, maxCellPx: v } })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="symbols" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Image fit</Label>
            <select
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={skin.symbols.imageFit}
              onChange={(e) => setSkin({ symbols: { ...skin.symbols, imageFit: e.target.value as SkinImageFit } })}
            >
              <option value="contain">contain</option>
              <option value="cover">cover</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Padding image: {skin.symbols.imagePaddingPct}%</Label>
            <Slider
              value={[skin.symbols.imagePaddingPct]}
              min={0}
              max={20}
              step={1}
              onValueChange={([v]) => setSkin({ symbols: { ...skin.symbols, imagePaddingPct: v } })}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

