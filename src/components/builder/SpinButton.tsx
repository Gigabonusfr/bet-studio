import { Button } from "@/components/ui/button";
import { Play, ArrowLeftRight, Zap, Dices } from "lucide-react";
import type { SpinButtonConfig } from "@/types/slot-controls";

interface SpinButtonProps {
  spinning: boolean;
  disabled: boolean;
  onClick: () => void;
  config: SpinButtonConfig;
  /** Mode compact/mobile optionnel pour ajuster légèrement la taille. */
  compact?: boolean;
}

export function SpinButton({ spinning, disabled, onClick, config, compact = false }: SpinButtonProps) {
  const sizeMap = {
    S: "h-12 w-12 text-lg",
    M: "h-16 w-16 text-xl",
    L: "h-20 w-20 text-2xl",
    XL: "h-24 w-24 text-3xl",
  };

  const shapeMap = {
    round: "rounded-full",
    "rounded-square": "rounded-2xl",
    hexagon: "rounded-xl",
    pill: "rounded-full px-8",
  };

  const animationMap = {
    pulse: "hover:animate-pulse",
    bounce: "hover:animate-bounce",
    rotate: "hover:rotate-12",
    glow: "hover:shadow-2xl",
    none: "",
  };

  const getIcon = () => {
    // Garder le bouton choisi (pas de logo slot qui tourne pendant le spin)
    switch (config.icon) {
      case "arrow":
        return <ArrowLeftRight className="h-6 w-6" style={{ color: config.iconColor }} />;
      case "play":
        return <Play className="h-6 w-6 fill-current" style={{ color: config.iconColor }} />;
      case "lightning":
        return <Zap className="h-6 w-6 fill-current" style={{ color: config.iconColor }} />;
      case "text":
        return <span className="font-black" style={{ color: config.iconColor }}>SPIN</span>;
      case "dice":
        return <Dices className="h-6 w-6" style={{ color: config.iconColor }} />;
      default:
        return <Play className="h-6 w-6 fill-current" style={{ color: config.iconColor }} />;
    }
  };

  // Ajustement léger de la taille en mode compact/mobile sans modifier la config d'origine.
  const effectiveSize: SpinButtonConfig["size"] = compact
    ? (config.size === "XL" ? "L" : config.size === "L" ? "M" : config.size)
    : config.size;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${sizeMap[effectiveSize]} ${shapeMap[config.shape]} ${animationMap[config.animation]} shadow-xl transition-all`}
      style={{
        backgroundColor: config.backgroundColor,
      }}
    >
      {getIcon()}
    </Button>
  );
}
