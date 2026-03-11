import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpBannerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const STORAGE_KEY = "dismissed-help-banners";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function HelpBanner({ id, children, className }: HelpBannerProps) {
  const [visible, setVisible] = useState(() => !getDismissed().includes(id));

  if (!visible) return null;

  function dismiss() {
    const list = getDismissed();
    if (!list.includes(id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, id]));
    }
    setVisible(false);
  }

  return (
    <div className={cn("p-3 rounded-lg bg-accent/50 border border-border text-xs text-muted-foreground relative pr-8", className)}>
      {children}
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground transition-colors"
        title="Ne plus afficher"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
