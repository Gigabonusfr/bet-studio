import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameConfig } from "@/context/GameConfigContext";
import { StepSidebar } from "./StepSidebar";
import { SlotPreview } from "./SlotPreview";
import { Step1GameIdentity } from "./steps/Step1GameIdentity";
import { Step2Symbols } from "./steps/Step2Symbols";
import { Step3GameModes } from "./steps/Step3GameModes";
import { Step6UXEffects } from "./steps/Step6UXEffects";
import { Step8UXControls } from "./steps/Step8UXControls";
import { Step6Assets } from "./steps/Step6Assets";
import { Step9Skin } from "./steps/Step9Skin";
import { MathPublicationTab } from "@/components/math/MathPublicationTab";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, ExternalLink, Sliders, Calculator, Eye, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [Step1GameIdentity, Step2Symbols, Step3GameModes, Step6UXEffects, Step6Assets, Step8UXControls, Step9Skin];
const STEP_COUNT = STEPS.length;

const STEP_LABELS = [
  { label: "Identité", icon: "🎰" },
  { label: "Symboles", icon: "💎" },
  { label: "Modes", icon: "⚙️" },
  { label: "Effets", icon: "✨" },
  { label: "Assets", icon: "🎨" },
  { label: "Contrôles", icon: "🎮" },
  { label: "Skin", icon: "🧩" },
];

export function BuilderLayout() {
  const { currentStep, setCurrentStep, resetConfig } = useGameConfig();
  const [activeTab, setActiveTab] = useState<"builder" | "math">("builder");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const safeStep = Math.max(0, Math.min(currentStep, STEP_COUNT - 1));
  const StepComponent = STEPS[safeStep];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <div className="h-12 shrink-0 flex items-center justify-between px-2 sm:px-4 border-b border-border bg-card/50 z-20">
        {/* Logo + mobile menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-accent text-muted-foreground"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm sm:text-base font-bold">
            <span className="text-primary">🎰</span>{" "}
            <span className="text-foreground hidden sm:inline">Stake Engine Builder</span>
            <span className="text-foreground sm:hidden">Builder</span>
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-lg p-0.5 sm:p-1">
          <button
            onClick={() => setActiveTab("builder")}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
              activeTab === "builder"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Builder</span>
          </button>
          <button
            onClick={() => setActiveTab("math")}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
              activeTab === "math"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">⚙️ Math & Publication</span>
            <span className="sm:hidden">Math</span>
          </button>
        </div>

        {/* Right side: preview toggle on mobile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {activeTab === "builder" && (
            <button
              onClick={() => setMobileView(mobileView === "form" ? "preview" : "form")}
              className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground"
            >
              <Eye className="h-3.5 w-3.5" />
              {mobileView === "form" ? "Preview" : "Config"}
            </button>
          )}
          <a
            href="https://stakeengine.github.io/math-sdk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline hidden sm:inline-flex items-center gap-1"
          >
            📚 Docs <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "builder" ? (
          <div className="flex h-full w-full">
            {/* Sidebar: hidden on mobile, overlay when toggled */}
            <div className={cn(
              "lg:block",
              sidebarOpen
                ? "absolute inset-0 z-30 bg-background/80 backdrop-blur-sm lg:relative lg:bg-transparent lg:backdrop-blur-none"
                : "hidden"
            )}>
              <div className="h-full w-64" onClick={(e) => e.stopPropagation()}>
                <StepSidebar onStepClick={() => setSidebarOpen(false)} />
              </div>
              {/* Backdrop tap to close on mobile */}
              <div
                className="absolute inset-0 -z-10 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            </div>

            {/* Center: Slot Preview — hidden on mobile unless toggled */}
            <div className={cn(
              "flex-1 min-w-0 border-r border-border z-10 shadow-2xl relative bg-card/10",
              "hidden lg:block",
              mobileView === "preview" && "!block"
            )}>
              <SlotPreview />
            </div>

            {/* Right: Configuration Form — hidden on mobile when preview shown */}
            <main className={cn(
              "w-full lg:w-[450px] xl:w-[550px] shrink-0 flex flex-col overflow-hidden bg-background",
              mobileView === "preview" && "hidden lg:flex"
            )}>
              {/* Mobile step selector */}
              <div className="lg:hidden overflow-x-auto border-b border-border bg-card/30">
                <div className="flex p-1.5 gap-1 min-w-max">
                  {STEP_LABELS.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                        i === safeStep
                          ? "bg-primary text-primary-foreground"
                          : i < safeStep
                          ? "bg-accent/50 text-foreground"
                          : "text-muted-foreground hover:bg-accent/30"
                      )}
                    >
                      <span>{step.icon}</span>
                      <span className="hidden xs:inline">{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Top bar — desktop only */}
              <header className="hidden lg:flex h-14 items-center justify-between px-6 border-b border-border shrink-0 bg-card/30">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Étape {safeStep + 1} sur {STEP_COUNT}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: STEP_COUNT }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i <= safeStep ? "w-8 bg-primary" : "w-4 bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetConfig} className="text-muted-foreground hover:text-destructive">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Réinitialiser
                </Button>
              </header>

              {/* Example banner — compact on mobile */}
              <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-primary/20 bg-primary/5 shrink-0">
                <p className="text-[10px] sm:text-xs text-foreground">
                  🎰 <strong className="hidden sm:inline">Chargé depuis l'exemple SDK Stake Engine: 0_0_cluster</strong>
                  <strong className="sm:hidden">Exemple: 0_0_cluster</strong>
                  <span className="hidden sm:inline"> — Modifiez les valeurs et exportez.</span>
                  <a
                    href="https://stakeengine.github.io/math-sdk/math_docs/sample_section/sample_games/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
                  >
                    <span className="hidden sm:inline">Voir la source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <div className="max-w-3xl">
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
              </div>

              {/* Navigation */}
              <footer className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-t border-border shrink-0 bg-card/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(0, safeStep - 1))}
                  disabled={safeStep === 0}
                  className="text-muted-foreground text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-0.5 sm:mr-1" /> <span className="hidden sm:inline">Retour</span>
                </Button>

                {/* Mobile reset */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetConfig}
                  className="lg:hidden text-muted-foreground hover:text-destructive h-8 w-8"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    if (safeStep === STEP_COUNT - 1) {
                      setActiveTab("math");
                    } else {
                      setCurrentStep(Math.min(STEP_COUNT - 1, safeStep + 1));
                    }
                  }}
                  className="gradient-gold text-primary-foreground font-semibold hover:opacity-90 text-xs sm:text-sm"
                >
                  {safeStep === STEP_COUNT - 1 ? (
                    <><span className="hidden sm:inline">Aller au Math SDK</span><span className="sm:hidden">Math SDK</span> →</>
                  ) : (
                    <><span className="hidden sm:inline">Continuer</span><span className="sm:hidden">Suivant</span></>
                  )}
                  <ChevronRight className="h-4 w-4 ml-0.5 sm:ml-1" />
                </Button>
              </footer>
            </main>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <MathPublicationTab />
          </div>
        )}
      </div>
    </div>
  );
}
