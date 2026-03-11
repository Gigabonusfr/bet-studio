import { useMemo } from "react";
import { useMathConfig } from "@/context/MathConfigContext";
import { useGameConfig } from "@/context/GameConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileJson, FileText, ExternalLink, CheckCircle } from "lucide-react";
import { generateSampleCSV, generateSampleBook } from "@/lib/stake-engine-generator";

export function MathPublishFiles() {
  const { mathConfig } = useMathConfig();
  const { config } = useGameConfig();

  const indexJson = useMemo(() => {
    const modes = [
      {
        name: config.baseBetMode.name,
        cost: config.baseBetMode.cost,
        events: `books_${config.baseBetMode.name}.jsonl.zst`,
        weights: `lookUpTable_${config.baseBetMode.name}_0.csv`,
      },
    ];
    if (config.freeSpins.enabled) {
      modes.push({
        name: config.freeSpins.modeName,
        cost: config.freeSpins.costMultiplier,
        events: `books_${config.freeSpins.modeName}.jsonl.zst`,
        weights: `lookUpTable_${config.freeSpins.modeName}_0.csv`,
      });
    }
    return { modes };
  }, [config]);

  const sampleCSV = useMemo(() => generateSampleCSV(), []);
  const sampleBookEvent = useMemo(() => JSON.parse(generateSampleBook(config)), [config]);

  const requiredFiles = useMemo(() => {
    const files = [
      { name: "index.json", desc: "Structure des modes de jeu", icon: FileJson, status: "ready" as const },
      { name: `books_${config.baseBetMode.name}.jsonl.zst`, desc: "Logique de jeu compressée (basegame)", icon: FileText, status: "sdk" as const },
      { name: `lookUpTable_${config.baseBetMode.name}_0.csv`, desc: "Poids + payouts (basegame)", icon: FileText, status: "sdk" as const },
    ];
    if (config.freeSpins.enabled) {
      files.push(
        { name: `books_${config.freeSpins.modeName}.jsonl.zst`, desc: "Logique de jeu compressée (bonus)", icon: FileText, status: "sdk" as const },
        { name: `lookUpTable_${config.freeSpins.modeName}_0.csv`, desc: "Poids + payouts (bonus)", icon: FileText, status: "sdk" as const },
      );
    }
    return files;
  }, [config]);

  return (
    <div className="space-y-6">
      {/* Required Files Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            📄 FICHIERS REQUIS POUR PUBLICATION
            <a
              href="https://stakeengine.github.io/math-sdk/rgs_docs/data_format/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {requiredFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <file.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-mono text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.desc}</p>
                  </div>
                </div>
                <Badge variant={file.status === "ready" ? "default" : "secondary"}>
                  {file.status === "ready" ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" /> Généré
                    </>
                  ) : (
                    "Généré par SDK"
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Warning */}
      <Card className="border-destructive/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-destructive text-sm">⚠️ Règle critique</p>
              <p className="text-sm text-muted-foreground mt-1">
                Le <code className="bg-muted px-1 rounded">payoutMultiplier</code> dans le CSV doit correspondre{" "}
                <strong>EXACTEMENT</strong> à celui dans le .jsonl.zst — ils sont hashés et vérifiés par Stake Engine.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* index.json Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preview: index.json</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
            {JSON.stringify(indexJson, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* lookUpTable.csv Preview (NO header) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Format: lookUpTable.csv</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">
            3 colonnes sans header : simulationID (uint64), weight (uint64), payoutMultiplier (uint64)
          </p>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">{sampleCSV}</pre>
        </CardContent>
      </Card>

      {/* Book Event Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Format: books (round individuel)
            <a
              href="https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/events_info/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[300px] overflow-y-auto">
            {JSON.stringify(sampleBookEvent, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
