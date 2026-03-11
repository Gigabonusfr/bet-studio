import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Square, Volume2, VolumeX } from "lucide-react";
import type { GameConfig } from "@/types/game-config";
import type { SlotControlsConfig } from "@/types/slot-controls";
import { SpinButton } from "../SpinButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MinimalLayoutProps {
  spinning: boolean;
  balance: number;
  bet: number;
  setBet: (bet: number | ((prev: number) => number)) => void;
  spin: () => void;
  turboMode: boolean;
  setTurboMode: (turbo: boolean) => void;
  config: GameConfig;
  controlsConfig: SlotControlsConfig;
  autoSpinCount: number;
  startAutoSpin: (count: number) => void;
  stopAutoSpin: () => void;
  masterMuted: boolean;
  toggleMute: () => void;
}

export function MinimalLayout({
  spinning,
  balance,
  bet,
  spin,
  config,
  controlsConfig,
  autoSpinCount,
  startAutoSpin,
  stopAutoSpin,
  masterMuted,
  toggleMute,
}: MinimalLayoutProps) {
  const balanceFontSize = controlsConfig.balance.fontSize === "S" ? "text-xs" : controlsConfig.balance.fontSize === "L" ? "text-base" : "text-sm";
  const [autoOpen, setAutoOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto flex flex-col items-center gap-3">
        {/* Balance (if visible) */}
        {controlsConfig.balance.visible && (
          <div className={`${balanceFontSize} text-muted-foreground`}>
            <span>{controlsConfig.balance.label}: </span>
            <span className="font-bold font-mono" style={{ color: controlsConfig.balance.color }}>
              ${balance.toFixed(2)}
            </span>
          </div>
        )}

        {/* Spin Button */}
        <SpinButton
          spinning={spinning}
          disabled={spinning || balance < bet}
          onClick={spin}
          config={controlsConfig.spinButton}
        />

        {/* Auto-Spin */}
        {controlsConfig.autoSpin.visible && (
          autoSpinCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stopAutoSpin}
              className="gap-1 animate-pulse"
              style={{ borderColor: controlsConfig.autoSpin.color, color: controlsConfig.autoSpin.color }}
            >
              <Square className="h-3 w-3" />
              STOP ({autoSpinCount})
            </Button>
          ) : (
            <Popover open={autoOpen} onOpenChange={setAutoOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={spinning}
                  className="gap-1"
                  style={{ borderColor: controlsConfig.autoSpin.color, color: controlsConfig.autoSpin.color }}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  AUTO
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="center">
                <div className="flex gap-1">
                  {controlsConfig.autoSpin.options.map((count) => (
                    <Button
                      key={count}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => { startAutoSpin(count); setAutoOpen(false); }}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )
        )}

        {/* Bet (if visible) */}
        {controlsConfig.bet.visible && (
          <div className="text-xs text-muted-foreground">
            <span>Mise: </span>
            <span className="font-bold font-mono" style={{ color: controlsConfig.bet.accentColor }}>
              ${bet.toFixed(2)}
            </span>
          </div>
        )}

        {/* Master mute intégré à l'UX */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleMute}
          aria-label="Toggle sound"
        >
          {masterMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}