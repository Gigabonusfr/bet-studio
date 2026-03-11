import { useState, useMemo, useCallback } from "react";
import JSZip from "jszip";
import { useMathConfig } from "@/context/MathConfigContext";
import { useGameConfig } from "@/context/GameConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Download, FileCode, FolderOpen, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ExportValidator } from "./ExportValidator";
import {
  generateGameConfigPy,
  generateGamestatePy,
  generateRunPy,
  generateIndexJson,
  generateReelstripCSV,
  generateNextSteps,
  generateReadme,
  generateDesignJson,
  generateAutoReelstrip,
} from "@/lib/stake-engine-generator";

export function MathExportPackage() {
  const { mathConfig } = useMathConfig();
  const { config } = useGameConfig();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasBlockingErrors, setHasBlockingErrors] = useState(false);

  const gameId = useMemo(() => {
    return config.gameId || config.gameName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "my_slot_game";
  }, [config.gameName, config.gameId]);

  const files = useMemo(() => [
    { name: "game_config.py", type: "python", desc: "Configuration SDK complète" },
    { name: "run.py", type: "python", desc: "Script d'exécution" },
    { name: "gamestate.py", type: "python", desc: `GameState (${config.winMechanic})` },
    { name: "game_executables.py", type: "python", desc: "Template (vide)" },
    { name: "game_calculations.py", type: "python", desc: "Template (vide)" },
    { name: "game_events.py", type: "python", desc: "Template (vide)" },
    { name: "game_override.py", type: "python", desc: "Template (vide)" },
    ...mathConfig.basegameStrips.map(s => ({ name: `reels/${s.id}.csv`, type: "csv", desc: `Reelstrip basegame (${s.id})` })),
    ...mathConfig.freegameStrips.map(s => ({ name: `reels/${s.id}.csv`, type: "csv", desc: `Reelstrip freegame (${s.id})` })),
    { name: "index.json", type: "json", desc: "Manifest publication" },
    { name: "readme.txt", type: "text", desc: "Description du jeu" },
    { name: "NEXT_STEPS.md", type: "markdown", desc: "Guide de publication" },
    { name: "design_config.json", type: "json", desc: "Config visuelle" },
    { name: "library/.gitkeep", type: "text", desc: "Dossier output SDK" },
  ], [mathConfig.basegameStrips, mathConfig.freegameStrips, config.winMechanic]);

  const handleValidation = useCallback((hasErrors: boolean) => {
    setHasBlockingErrors(hasErrors);
  }, []);

  const handleExport = async () => {
    if (hasBlockingErrors) {
      toast.error("Corrigez les erreurs bloquantes avant d'exporter.");
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(gameId);
      if (!folder) throw new Error("Failed to create folder");

      // Python files using unified generator
      folder.file("game_config.py", generateGameConfigPy(config, mathConfig));
      folder.file("run.py", generateRunPy(config, mathConfig));
      folder.file("gamestate.py", generateGamestatePy(config));
      folder.file("game_executables.py", '"""Game executables - customize as needed."""\n');
      folder.file("game_calculations.py", '"""Game calculations - customize as needed."""\n');
      folder.file("game_events.py", '"""Game events - customize as needed."""\n');
      folder.file("game_override.py", '"""Game overrides - customize as needed."""\n');

      // Reelstrips
      const reelsFolder = folder.folder("reels");
      mathConfig.basegameStrips.forEach(strip => {
        reelsFolder?.file(`${strip.id}.csv`, generateReelstripCSV(strip.reels));
      });
      mathConfig.freegameStrips.forEach(strip => {
        reelsFolder?.file(`${strip.id}.csv`, generateReelstripCSV(strip.reels));
      });

      // If FR0 missing but freespins enabled, auto-generate
      if (config.freeSpins.enabled && !mathConfig.freegameStrips.some(s => s.id === "FR0")) {
        const frReels = generateAutoReelstrip(config, "freegame");
        reelsFolder?.file("FR0.csv", generateReelstripCSV(frReels));
      }

      // Manifest & docs
      folder.file("index.json", generateIndexJson(config));
      folder.file("readme.txt", generateReadme(config, mathConfig));
      folder.file("NEXT_STEPS.md", generateNextSteps(config));
      folder.file("design_config.json", generateDesignJson(config));

      const libraryFolder = folder.folder("library");
      libraryFolder?.file(".gitkeep", "");

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${gameId}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Package exporté avec succès !");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Report */}
      <ExportValidator onValidation={handleValidation} />

      {/* Export Button */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Package className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">📦 Exporter le Game Package Complet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Téléchargez un fichier ZIP contenant toute la structure du jeu prête pour le Math SDK
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleExport}
              disabled={isGenerating || hasBlockingErrors}
              className="gradient-gold text-primary-foreground"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Télécharger {gameId}.zip
                </>
              )}
            </Button>
            {hasBlockingErrors && (
              <p className="text-xs text-destructive">⛔ Corrigez les erreurs ci-dessus avant d'exporter</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Contenu du package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="text-muted-foreground">{gameId}/</div>
            {files.map((file) => (
              <div key={file.name} className="flex items-center gap-3 pl-4">
                <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{file.name}</span>
                <Badge variant="outline" className="text-xs">
                  {file.desc}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">📚 Ressources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: "Math SDK Documentation", url: "https://stakeengine.github.io/math-sdk/" },
              { label: "RGS Data Format", url: "https://stakeengine.github.io/math-sdk/rgs_docs/data_format/" },
              { label: "Frontend Web SDK", url: "https://stakeengine.github.io/math-sdk/fe_docs/get_started/" },
              { label: "GitHub Repository", url: "https://github.com/StakeEngine/math-sdk" },
            ].map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-primary" />
                <span className="text-sm">{link.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
