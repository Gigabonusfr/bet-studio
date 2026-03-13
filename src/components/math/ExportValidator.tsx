import { useMemo } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { useMathConfig } from "@/context/MathConfigContext";
import { useSlotControls } from "@/context/SlotControlsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Shield, ExternalLink, FileText } from "lucide-react";
import { validateExport, hasBlockingErrors, type ValidationResult, type ValidationLevel } from "@/lib/stake-engine-validator";
import { DOCS } from "@/constants/docs-links";

const CATEGORY_LABELS: Record<string, string> = {
  math: "🔢 Validation Math",
  betmodes: "🎰 BetModes",
  files: "📁 Fichiers",
  rgs: "🌐 RGS & Publication",
  frontend: "🎨 Front & Skin",
};

const LEVEL_ICONS: Record<ValidationLevel, typeof CheckCircle> = {
  pass: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const LEVEL_COLORS: Record<ValidationLevel, string> = {
  pass: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-destructive",
};

export function ExportValidator({ onValidation }: { onValidation?: (hasErrors: boolean) => void }) {
  const { config } = useGameConfig();
  const { mathConfig } = useMathConfig();
  const { config: controlsConfig } = useSlotControls();

  const results = useMemo(() => {
    const r = validateExport(config, mathConfig, controlsConfig);
    onValidation?.(hasBlockingErrors(r));
    return r;
  }, [config, mathConfig, controlsConfig, onValidation]);

  const grouped = useMemo(() => {
    const groups: Record<string, ValidationResult[]> = {};
    results.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [results]);

  const errorCount = results.filter((r) => r.level === "error").length;
  const warningCount = results.filter((r) => r.level === "warning").length;
  const passCount = results.filter((r) => r.level === "pass").length;

  return (
    <div className="space-y-4">
      {/* Doc link */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <a
          href={DOCS.hub}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Documentation Stake Engine
        </a>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Checklist complète : <code className="text-[10px] bg-muted px-1 rounded">docs/STAKE_ENGINE.md</code>
        </span>
      </div>

      {/* Summary */}
      <Card className={errorCount > 0 ? "border-destructive/50" : warningCount > 0 ? "border-amber-500/50" : "border-emerald-500/50"}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Shield className={`h-6 w-6 ${errorCount > 0 ? "text-destructive" : warningCount > 0 ? "text-amber-500" : "text-emerald-500"}`} />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {errorCount > 0
                  ? `⛔ ${errorCount} erreur(s) bloquante(s) — export impossible`
                  : warningCount > 0
                  ? `⚠️ ${warningCount} avertissement(s) — export possible`
                  : "✅ Toutes les validations passent — prêt pour l'export"}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">✅ {passCount}</Badge>
              {warningCount > 0 && <Badge variant="outline" className="text-amber-500 border-amber-500/30">⚠️ {warningCount}</Badge>}
              {errorCount > 0 && <Badge variant="outline" className="text-destructive border-destructive/30">❌ {errorCount}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results by category */}
      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{CATEGORY_LABELS[category] || category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => {
              const Icon = LEVEL_ICONS[item.level];
              return (
                <div key={item.id} className="flex items-start gap-2 text-sm">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${LEVEL_COLORS[item.level]}`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
