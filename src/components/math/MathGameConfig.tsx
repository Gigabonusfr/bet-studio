import { useMemo } from "react";
import { useMathConfig } from "@/context/MathConfigContext";
import { useGameConfig } from "@/context/GameConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { generateGameConfigPy } from "@/lib/stake-engine-generator";

export function MathGameConfig() {
  const { mathConfig, updateMathConfig } = useMathConfig();
  const { config } = useGameConfig();

  const generatedCode = useMemo(() => {
    return generateGameConfigPy(config, mathConfig);
  }, [config, mathConfig]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Code copié !");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_config.py";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Config Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Paramètres de configuration
            <a
              href="https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/configuration_section/config_overview/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wincap">Win Cap (max multiplier)</Label>
              <Input
                id="wincap"
                type="number"
                min={100}
                max={50000}
                value={mathConfig.wincap}
                onChange={(e) => updateMathConfig({ wincap: parseInt(e.target.value) || 5000 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="multipliers"
                checked={mathConfig.multiplierEnabled}
                onCheckedChange={(checked) => updateMathConfig({ multiplierEnabled: checked })}
              />
              <Label htmlFor="multipliers">Activer multiplicateurs</Label>
            </div>
          </div>

          {/* Freespin Triggers */}
          <div>
            <Label className="text-sm font-medium">Freespin Triggers (Basegame)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[3, 4, 5].map((count) => (
                <div key={count} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8">{count}×:</span>
                  <Input
                    type="number"
                    min={0}
                    value={mathConfig.freespinTriggers.basegame[count] || 0}
                    onChange={(e) =>
                      updateMathConfig({
                        freespinTriggers: {
                          ...mathConfig.freespinTriggers,
                          basegame: {
                            ...mathConfig.freespinTriggers.basegame,
                            [count]: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="h-8"
                  />
                  <span className="text-xs text-muted-foreground">FS</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Code */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">game_config.py généré</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" /> Copier
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Télécharger
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[500px] overflow-y-auto">
            {generatedCode}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
