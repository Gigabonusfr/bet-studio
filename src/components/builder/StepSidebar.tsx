import { useGameConfig } from "@/context/GameConfigContext";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Identité du Jeu", icon: "🎰" },
  { label: "Symboles & Gains", icon: "💎" },
  { label: "Modes de Jeu", icon: "⚙️" },
  { label: "Effets UX", icon: "✨" },
  { label: "Assets & Animations", icon: "🎨" },
  { label: "UX Contrôles", icon: "🎮" },
  { label: "Skin (Front)", icon: "🧩" },
];

interface StepSidebarProps {
  onStepClick?: () => void;
}

export function StepSidebar({ onStepClick }: StepSidebarProps) {
  const { currentStep, setCurrentStep } = useGameConfig();

  return (
    <aside className="w-64 shrink-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-gold tracking-tight">Stake Engine</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Constructeur de Slot</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <button
              key={i}
              onClick={() => {
                setCurrentStep(i);
                onStepClick?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                isActive && "bg-accent text-gold glow-gold",
                isDone && "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                !isActive && !isDone && "text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/30"
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 border transition-all",
                isActive && "border-gold bg-gold/10 text-gold",
                isDone && "border-muted-foreground/30 bg-muted text-foreground",
                !isActive && !isDone && "border-border bg-transparent text-muted-foreground/50"
              )}>
                {isDone ? <Check className="h-3.5 w-3.5" /> : <span>{step.icon}</span>}
              </span>
              <span className="flex-1 truncate">{step.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 text-gold/60" />}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <a
          href="https://stakeengine.github.io/math-sdk/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gold hover:bg-gold/10 transition-colors"
        >
          📚 Stake Engine Docs
        </a>
      </div>
    </aside>
  );
}
