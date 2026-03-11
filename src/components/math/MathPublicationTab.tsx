import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MathReelstrips } from "./MathReelstrips";
import { MathGameConfig } from "./MathGameConfig";
import { MathRunPy } from "./MathRunPy";
import { MathPublishFiles } from "./MathPublishFiles";
import { MathEstimator } from "./MathEstimator";
import { MathExportPackage } from "./MathExportPackage";
import { AlertTriangle, ExternalLink } from "lucide-react";

export function MathPublicationTab() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Critical Rules Alert */}
      <div className="shrink-0 mx-6 mt-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-destructive">🔴 RÈGLES STAKE ENGINE NON NÉGOCIABLES :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Tous les résultats de jeu DOIVENT être pré-simulés et connus à la publication</li>
              <li>Minimum 100 000 simulations par mode pour la production</li>
              <li>Le payoutMultiplier dans le CSV doit correspondre EXACTEMENT au .jsonl.zst</li>
              <li>Aucun jackpot, aucune mécanique de gamble, aucun cashout anticipé</li>
              <li>Tous les outcomes sont statiques — sélectionnés aléatoirement depuis le lookup table</li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://stakeengine.github.io/math-sdk/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                📚 Documentation <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://stakeengine.github.io/math-sdk/rgs_docs/data_format/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                📦 Format RGS <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reelstrips" className="flex-1 flex flex-col overflow-hidden px-6 py-4">
        <TabsList className="shrink-0 grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="reelstrips" className="text-xs py-2">
            🎰 Reelstrips
          </TabsTrigger>
          <TabsTrigger value="gameconfig" className="text-xs py-2">
            🐍 game_config.py
          </TabsTrigger>
          <TabsTrigger value="runpy" className="text-xs py-2">
            ▶️ run.py
          </TabsTrigger>
          <TabsTrigger value="publish" className="text-xs py-2">
            📄 Publication
          </TabsTrigger>
          <TabsTrigger value="estimator" className="text-xs py-2">
            📊 Estimateur
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs py-2">
            📦 Export
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4">
          <TabsContent value="reelstrips" className="m-0 h-full">
            <MathReelstrips />
          </TabsContent>
          <TabsContent value="gameconfig" className="m-0 h-full">
            <MathGameConfig />
          </TabsContent>
          <TabsContent value="runpy" className="m-0 h-full">
            <MathRunPy />
          </TabsContent>
          <TabsContent value="publish" className="m-0 h-full">
            <MathPublishFiles />
          </TabsContent>
          <TabsContent value="estimator" className="m-0 h-full">
            <MathEstimator />
          </TabsContent>
          <TabsContent value="export" className="m-0 h-full">
            <MathExportPackage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
