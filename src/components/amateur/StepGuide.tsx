import { CheckCircle2, Circle } from "lucide-react";
import type { StepCheckItem } from "@/hooks/useStepCompletion";
import { cn } from "@/lib/utils";

interface StepGuideProps {
  items: StepCheckItem[];
}

export function StepGuide({ items }: StepGuideProps) {
  if (items.length === 0) return null;

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 mb-4 transition-colors",
        allDone
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card/50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Guide
        </span>
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            allDone
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {doneCount}/{items.length}
        </span>
      </div>

      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            )}
            <span
              className={cn(
                "transition-colors",
                item.done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {allDone && (
        <p className="mt-2 text-xs text-primary font-medium">
          ✅ Bravo ! Passez à l'étape suivante.
        </p>
      )}
    </div>
  );
}
