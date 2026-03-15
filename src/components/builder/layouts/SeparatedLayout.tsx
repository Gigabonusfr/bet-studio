import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus, Eye, EyeOff, ShoppingCart, ArrowLeftRight, Zap, Square, Volume2, VolumeX } from "lucide-react";
import type { GameConfig } from "@/types/game-config";
import type { SlotControlsConfig } from "@/types/slot-controls";
import { SpinButton } from "../SpinButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SeparatedLayoutProps {
  spinning: boolean;
  balance: number;
  bet: number;
  setBet: (bet: number | ((prev: number) => number)) => void;
  spin: () => void;
  turboMode: boolean;
  setTurboMode: (turbo: boolean) => void;
  buyBonus: () => void;
  stats: { spins: number; wagered: number; won: number };
  rtp: string;
  /** En mode local : libellé explicite (ex. "RTP (session mock)") */
  rtpLabel?: string;
  /** Alerte si RTP affiché n'est pas le RTP théorique (mode local sans RGS) */
  rtpWarning?: string;
  showPaylines: boolean;
  setShowPaylines: (show: boolean) => void;
  config: GameConfig;
  controlsConfig: SlotControlsConfig;
  autoSpinCount: number;
  startAutoSpin: (count: number) => void;
  stopAutoSpin: () => void;
  showStats?: boolean;
  masterMuted: boolean;
  toggleMute: () => void;
}

export function SeparatedLayout({
  spinning,
  balance,
  bet,
  setBet,
  spin,
  turboMode,
  setTurboMode,
  buyBonus,
  stats,
  rtp,
  rtpLabel,
  rtpWarning,
  showPaylines,
  setShowPaylines,
  config,
  controlsConfig,
  autoSpinCount,
  startAutoSpin,
  stopAutoSpin,
  showStats = true,
  masterMuted,
  toggleMute,
}: SeparatedLayoutProps) {
  const balanceFontSize = controlsConfig.balance.fontSize === "S" ? "text-sm" : controlsConfig.balance.fontSize === "L" ? "text-xl" : "text-base";
  const [autoOpen, setAutoOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 items-end">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Balance */}
          {controlsConfig.balance.visible && (
            <div 
              className={`p-3 rounded-lg border border-border ${balanceFontSize}`}
            >
              <span className="text-muted-foreground text-xs block">{controlsConfig.balance.label}</span>
              <span className="font-bold font-mono" style={{ color: controlsConfig.balance.color }}>
                ${balance.toFixed(2)}
              </span>
            </div>
          )}

          {/* Bet */}
          {controlsConfig.bet.visible && (
            <div className="p-3 rounded-lg border border-border">
              <span className="text-muted-foreground text-xs block">Mise</span>
              <div className="flex items-center justify-between mt-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={spinning || autoSpinCount > 0} onClick={() => setBet((b: number) => Math.max(0.1, b - 0.1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold font-mono" style={{ color: controlsConfig.bet.accentColor }}>${bet.toFixed(2)}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={spinning || autoSpinCount > 0} onClick={() => setBet((b: number) => b + 0.1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Buy Bonus */}
          {config.freeSpins.enabled && (
            <Button variant="outline" className="w-full gap-2" disabled={spinning || balance < bet * config.freeSpins.costMultiplier} onClick={buyBonus}>
              <ShoppingCart className="h-4 w-4" />
              BUY BONUS (${(bet * config.freeSpins.costMultiplier).toFixed(0)})
            </Button>
          )}
        </div>

        {/* Center - Spin */}
        <div className="flex flex-col items-center gap-4">
          <SpinButton
            spinning={spinning}
            disabled={spinning || balance < bet}
            onClick={spin}
            config={controlsConfig.spinButton}
          />

          {/* Paylines + Turbo */}
          <div className="flex items-center gap-4">
            {config.winMechanic === "lines" && (
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowPaylines(!showPaylines)}>
                {showPaylines ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                Lignes
              </Button>
            )}
            {controlsConfig.turbo.visible && (
              <div className="flex items-center gap-1">
                <Switch checked={turboMode} onCheckedChange={setTurboMode} disabled={spinning} />
                <span className="text-xs" style={{ color: turboMode ? controlsConfig.turbo.color : undefined }}>
                  <Zap className="h-3 w-3 inline" /> TURBO
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Auto-Spin */}
          {controlsConfig.autoSpin.visible && (
            autoSpinCount > 0 ? (
              <Button
                variant="outline"
                onClick={stopAutoSpin}
                className="w-full gap-2 animate-pulse"
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
                    disabled={spinning}
                    className="w-full gap-2"
                    style={{ borderColor: controlsConfig.autoSpin.color, color: controlsConfig.autoSpin.color }}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    AUTO-SPIN
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

          {/* Stats (builder/dev) */}
          {showStats && (
            <div className="p-3 rounded-lg border border-border space-y-2">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Tours</span>
                  <span className="font-bold">{stats.spins}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Misé</span>
                  <span className="font-bold">${stats.wagered.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Gagné</span>
                  <span className="font-bold text-emerald-400">${stats.won.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">{rtpLabel ?? "RTP"}</span>
                  <span className="font-bold">{rtp}%</span>
                </div>
              </div>
              {rtpWarning && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono" title={rtpWarning}>
                  ⚠️ {rtpWarning}
                </p>
              )}
            </div>
          )}

          {/* Master mute intégré à l'UX */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={toggleMute}
            aria-label="Toggle sound"
          >
            {masterMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span className="text-xs">Sound</span>
          </Button>
        </div>
      </div>
    </div>
  );
}