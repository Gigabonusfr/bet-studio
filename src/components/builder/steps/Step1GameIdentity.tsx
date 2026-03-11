import { useGameConfig } from "@/context/GameConfigContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InfoTooltip } from "@/components/builder/InfoTooltip";
import { HelpBanner } from "@/components/builder/HelpBanner";
import { DocsLink } from "@/components/builder/DocsLink";
import { DOCS, WIN_MECHANIC_DOCS } from "@/constants/docs-links";
import type { WinMechanic, Theme } from "@/types/game-config";

function toKebab(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function Step1GameIdentity() {
  const { config, updateConfig } = useGameConfig();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Identité du Jeu</h2>
          <p className="text-sm text-muted-foreground mt-1">Définissez la structure de base et l'apparence</p>
        </div>
        <DocsLink href={DOCS.math.gameStructure} />
      </div>

      <HelpBanner id="pro-step1-identity">
        💡 Définissez le nom, la grille (reels × rows), la mécanique de gain et le thème visuel. Ces paramètres structurent le fichier <code className="bg-muted px-1 rounded">game_config.py</code>.
      </HelpBanner>

      {/* Visual Customization */}
      <div className="space-y-4 casino-card p-5 border-gold/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full -z-10" />
        <h3 className="text-lg font-semibold text-gold flex items-center gap-2">
          🎨 Apparence Visuelle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-foreground">Arrière-plan (PNG, GIF ou MP4)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/png,image/gif,video/mp4"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Use blob URL instead of data URL to avoid memory issues with large videos
                    const blobUrl = URL.createObjectURL(file);
                    const type = file.type.startsWith("video") ? "video" : "image";
                    updateConfig({ backgroundUrl: blobUrl, backgroundType: type });
                  }
                }}
                className="bg-input border-border flex-1"
              />
              {config.backgroundUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateConfig({ backgroundUrl: undefined, backgroundType: undefined })}
                  className="text-destructive hover:text-destructive"
                >
                  Effacer
                </Button>
              )}
            </div>
            {config.backgroundUrl && config.backgroundType === "video" && (
              <div className="space-y-2 pt-2">
                <Label className="text-foreground text-xs">Vitesse de lecture: {config.backgroundPlaybackSpeed || 1}x</Label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.backgroundPlaybackSpeed || 1}
                  onChange={(e) => updateConfig({ backgroundPlaybackSpeed: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Couleur de la Grille (Hex/RGB)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.reelColor || "#1a1c23"}
                onChange={(e) => updateConfig({ reelColor: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer bg-input border-border"
              />
              <Input
                value={config.reelColor || "#1a1c23"}
                onChange={(e) => updateConfig({ reelColor: e.target.value })}
                className="flex-1 bg-input border-border font-mono"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <Label className="text-foreground cursor-pointer" htmlFor="music-toggle">Musique de Fond</Label>
            <Switch
              id="music-toggle"
              checked={config.musicEnabled}
              onCheckedChange={(v) => updateConfig({ musicEnabled: v })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game Name */}
        <div className="space-y-2">
          <Label className="text-foreground">
            Nom du Jeu
            <InfoTooltip text="The display name of your game." docsUrl={DOCS.math.gameStructure} />
          </Label>
          <Input
            value={config.gameName}
            onChange={(e) => {
              const name = e.target.value;
              updateConfig({ gameName: name, gameId: config.gameId || toKebab(name) });
            }}
            placeholder="e.g. Dragon's Fortune"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Game ID */}
        <div className="space-y-2">
          <Label className="text-foreground">
            ID du Jeu
            <InfoTooltip
              text="Used in CDN URL: https://{TeamName}.cdn.stake-engine.com/{GameID}/{GameVersion}/index.html"
              docsUrl={DOCS.rgs.api}
            />
          </Label>
          <Input
            value={config.gameId}
            onChange={(e) => updateConfig({ gameId: toKebab(e.target.value) })}
            placeholder="dragons-fortune"
            className="bg-input border-border text-foreground font-mono text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Version */}
        <div className="space-y-2">
          <Label className="text-foreground">Version</Label>
          <Input
            value={config.gameVersion}
            onChange={(e) => updateConfig({ gameVersion: e.target.value })}
            placeholder="1.0.0"
            className="bg-input border-border text-foreground font-mono placeholder:text-muted-foreground"
          />
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label className="text-foreground">Thème</Label>
          <Select value={config.theme} onValueChange={(v) => updateConfig({ theme: v as Theme })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {["fantasy", "sci-fi", "egypt", "wild-west", "ocean", "custom"].map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t.replace("-", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reels */}
        <div className="space-y-2">
          <Label className="text-foreground">
            Colonnes (Reels)
            <InfoTooltip text="How many columns on the slot grid." docsUrl={DOCS.math.board} />
          </Label>
          <Select value={String(config.numReels)} onValueChange={(v) => updateConfig({ numReels: Number(v) })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} Colonnes</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          <Label className="text-foreground">
            Lignes (Rows)
            <InfoTooltip text="How many rows visible on the slot grid." docsUrl={DOCS.math.board} />
          </Label>
          <Select value={String(config.numRows)} onValueChange={(v) => updateConfig({ numRows: Number(v) })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} Lignes</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Win Mechanic */}
      <div className="space-y-3">
        <Label className="text-foreground text-base">
          Mécanique de Gain
          <InfoTooltip text="How winning combinations are calculated." docsUrl={DOCS.math.wins} />
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["lines", "ways", "cluster", "scatter"] as WinMechanic[]).map((mech) => (
            <button
              key={mech}
              onClick={() => updateConfig({ winMechanic: mech })}
              className={`casino-card p-4 text-center transition-all cursor-pointer ${
                config.winMechanic === mech
                  ? "border-gold glow-gold"
                  : "hover:border-muted-foreground/30"
              }`}
            >
              <span className="text-sm font-semibold capitalize text-foreground">{mech}</span>
              <a
                href={WIN_MECHANIC_DOCS[mech]}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[10px] text-gold mt-1 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                En savoir plus →
              </a>
            </button>
          ))}
        </div>
      </div>

      {/* Paylines (only for lines) */}
      {config.winMechanic === "lines" && (
        <div className="space-y-2">
          <Label className="text-foreground">
            Nombre de Lignes de Paiement
            <InfoTooltip text="Active paylines for line-based wins." docsUrl={DOCS.math.lines} />
          </Label>
          <Select value={String(config.numPaylines)} onValueChange={(v) => updateConfig({ numPaylines: Number(v) })}>
            <SelectTrigger className="bg-input border-border text-foreground w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {[5, 10, 20, 25, 40, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} Lignes</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tumble */}
      <div className="flex items-center gap-3 casino-card p-4">
        <Switch
          checked={config.tumbleEnabled}
          onCheckedChange={(v) => updateConfig({ tumbleEnabled: v })}
        />
        <div>
          <Label className="text-foreground">
            Activer Tumble / Cascade
            <InfoTooltip text="Winning symbols are removed and new ones fall in their place." docsUrl={DOCS.math.tumble} />
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">Les symboles gagnants disparaissent et de nouveaux tombent</p>
        </div>
      </div>
    </div>
  );
}
