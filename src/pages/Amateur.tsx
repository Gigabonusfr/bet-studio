import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GameConfigProvider, useGameConfig } from "@/context/GameConfigContext";
import { MathConfigProvider } from "@/context/MathConfigContext";
import { SlotPreview } from "@/components/builder/SlotPreview";
import { AmateurStep1Template } from "@/components/amateur/AmateurStep1Template";
import { AmateurStep2Identity } from "@/components/amateur/AmateurStep2Identity";
import { AmateurStep3Loading } from "@/components/amateur/AmateurStep3Loading";
import { AmateurStep3Symbols } from "@/components/amateur/AmateurStep3Symbols";
import { AmateurStep4Effects } from "@/components/amateur/AmateurStep4Effects";
import { AmateurStep5Assets } from "@/components/amateur/AmateurStep5Assets";
import { AmateurStep6UXControls } from "@/components/amateur/AmateurStep6UXControls";
import { AmateurStep7Export } from "@/components/amateur/AmateurStep7Export";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home, Eye, Settings2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStepCompletion } from "@/hooks/useStepCompletion";

const AMATEUR_STEPS = [
  { label: "Template", icon: "📋", component: AmateurStep1Template },
  { label: "Identité", icon: "🎨", component: AmateurStep2Identity },
  { label: "Loading", icon: "⏳", component: AmateurStep3Loading },
  { label: "Symboles", icon: "💎", component: AmateurStep3Symbols },
  { label: "Effets", icon: "✨", component: AmateurStep4Effects },
  { label: "Assets", icon: "🖼️", component: AmateurStep5Assets },
  { label: "Interface", icon: "🎮", component: AmateurStep6UXControls },
  { label: "Export", icon: "📦", component: AmateurStep7Export },
];

function AmateurBuilderInner() {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep } = useGameConfig();
  const { isStepComplete } = useStepCompletion();
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const safeStep = Math.max(0, Math.min(currentStep, AMATEUR_STEPS.length - 1));
  const StepComponent = AMATEUR_STEPS[safeStep].component;
  const currentStepDone = isStepComplete(safeStep);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Header */}
      <div className="h-12 shrink-0 flex items-center justify-between px-3 sm:px-4 border-b border-border bg-card/50 z-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/welcome")}>
            <Home className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold text-foreground">
            <span className="text-primary">🎰</span> Mode Amateur
          </span>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full hidden sm:inline">Guidé</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileView(mobileView === "form" ? "preview" : "form")}
            className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground"
          >
            {mobileView === "form" ? <Eye className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}
            {mobileView === "form" ? "Preview" : "Config"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted shrink-0">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((safeStep + 1) / AMATEUR_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Preview */}
        <div className={cn(
          "flex-1 min-w-0 border-r border-border z-10 shadow-2xl relative bg-card/10",
          "hidden lg:block",
          mobileView === "preview" && "!block"
        )}>
          <SlotPreview mode="local" />
        </div>

        {/* Form */}
        <main className={cn(
          "w-full lg:w-[500px] xl:w-[600px] shrink-0 flex flex-col overflow-hidden bg-background",
          mobileView === "preview" && "hidden lg:flex"
        )}>
          {/* Step tabs */}
          <div className="overflow-x-auto border-b border-border bg-card/30 shrink-0">
            <div className="flex p-1.5 gap-1 min-w-max">
              {AMATEUR_STEPS.map((step, i) => {
                const done = isStepComplete(i);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                      i === safeStep
                        ? "bg-primary text-primary-foreground"
                        : done
                        ? "bg-primary/15 text-primary"
                        : i < safeStep
                        ? "bg-accent/50 text-foreground"
                        : "text-muted-foreground hover:bg-accent/30"
                    )}
                  >
                    {done && i !== safeStep ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step info bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-primary/20 bg-primary/5 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground">
                <strong>Étape {safeStep + 1}/{AMATEUR_STEPS.length}</strong> — {AMATEUR_STEPS[safeStep].label}
              </p>
              <div className="flex gap-1">
                {AMATEUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i <= safeStep ? "w-6 bg-primary" : "w-3 bg-border"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <footer className="h-16 flex items-center justify-between px-4 sm:px-6 border-t border-border shrink-0 bg-card/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, safeStep - 1))}
              disabled={safeStep === 0}
              className="text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Retour
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (safeStep < AMATEUR_STEPS.length - 1) {
                  setCurrentStep(safeStep + 1);
                }
              }}
              disabled={safeStep === AMATEUR_STEPS.length - 1}
              className={cn(
                "font-semibold hover:opacity-90 transition-all",
                currentStepDone
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStepDone ? (
                <>Étape complète ! <ChevronRight className="h-4 w-4 ml-1" /></>
              ) : (
                <>Continuer <ChevronRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function Amateur() {
  return (
    <GameConfigProvider>
      <MathConfigProvider>
        <AmateurBuilderInner />
      </MathConfigProvider>
    </GameConfigProvider>
  );
}
