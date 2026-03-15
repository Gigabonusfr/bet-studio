import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus, Eye, EyeOff, ShoppingCart, Play, ArrowLeftRight, Zap, Dices, Square, Volume2, VolumeX } from "lucide-react";
import type { GameConfig } from "@/types/game-config";
import type { SlotControlsConfig } from "@/types/slot-controls";
import { SpinButton } from "../SpinButton";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface IntegratedLayoutProps {
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
  compact?: boolean;
}

export function IntegratedLayout({
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
  compact = false,
}: IntegratedLayoutProps) {
  const balanceFontSize = controlsConfig.balance.fontSize === "S" ? "text-xs" : controlsConfig.balance.fontSize === "L" ? "text-base" : "text-sm";
  const [autoOpen, setAutoOpen] = useState(false);

  // Version compacte pensée pour le mobile (frame téléphone)
  if (compact) {
    return (
      <div className="px-3 pt-2 pb-3">
        <div className="flex flex-col gap-2 text-[11px]">
          {/* Ligne infos (balance + mise) */}
          <div className="flex items-center justify-between gap-3">
            {controlsConfig.balance.visible && (
              <div className={cn("flex items-baseline gap-1", balanceFontSize)}>
                <span className="text-muted-foreground font-medium">{controlsConfig.balance.label}</span>
                <span className="font-bold font-mono" style={{ color: controlsConfig.balance.color }}>
                  ${balance.toFixed(2)}
                </span>
              </div>
            )}
            {controlsConfig.bet.visible && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-background/60 text-xs"
                  disabled={spinning || autoSpinCount > 0}
                  onClick={() => setBet((b: number) => Math.max(0.1, b - 0.1))}
                >
                  -
                </button>
                <div className="text-center min-w-[56px]">
                  <span className="block text-[11px] text-muted-foreground">Mise</span>
                  <span className="font-bold font-mono text-sm" style={{ color: controlsConfig.bet.accentColor }}>
                    ${bet.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-background/60 text-xs"
                  disabled={spinning || autoSpinCount > 0}
                  onClick={() => setBet((b: number) => b + 0.1)}
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Spin centré */}
          <div className="flex justify-center pt-1 pb-0.5">
            <SpinButton
              spinning={spinning}
              disabled={spinning || balance < bet}
              onClick={spin}
              config={controlsConfig.spinButton}
              compact
            />
          </div>

          {/* Rangée de commandes secondaires */}
          <div className="flex items-center justify-between gap-2">
            {/* Auto-spin */}
            {controlsConfig.autoSpin.visible && (
              autoSpinCount > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopAutoSpin}
                  className="h-8 px-3 gap-1 flex-1 min-w-0 justify-center truncate animate-pulse"
                  style={{ borderColor: controlsConfig.autoSpin.color, color: controlsConfig.autoSpin.color }}
                >
                  <Square className="h-3 w-3" />
                  <span className="text-[10px]">STOP ({autoSpinCount})</span>
                </Button>
              ) : (
                <Popover open={autoOpen} onOpenChange={setAutoOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={spinning}
                      className="h-8 px-3 gap-1 flex-1 min-w-0 justify-center truncate"
                      style={{ borderColor: controlsConfig.autoSpin.color, color: controlsConfig.autoSpin.color }}
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                      <span className="text-[10px]">AUTO</span>
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
                          onClick={() => {
                            startAutoSpin(count);
                            setAutoOpen(false);
                          }}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )
            )}

            {/* Turbo */}
            {controlsConfig.turbo.visible && (
              <div className="flex items-center gap-1">
                <Switch
                  checked={turboMode}
                  onCheckedChange={setTurboMode}
                  disabled={spinning}
                  id="turbo-mode-mobile"
                  className="scale-90"
                />
                <label
                  htmlFor="turbo-mode-mobile"
                  className="text-[10px] font-medium cursor-pointer flex items-center gap-0.5"
                  style={{ color: turboMode ? controlsConfig.turbo.color : undefined }}
                >
                  <Zap className="h-3 w-3" />
                  TURBO
                </label>
              </div>
            )}

            {/* Buy Bonus */}
            {config.freeSpins.enabled && (
              <Button
                variant="outline"
                size="sm"
                  className="h-8 px-3 gap-1 text-[11px]"
                disabled={spinning || balance < bet * config.freeSpins.costMultiplier}
                onClick={buyBonus}
              >
                <ShoppingCart className="h-3 w-3" />
                BUY
              </Button>
            )}

            {/* Mute */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
              aria-label="Toggle sound"
            >
              {masterMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "px-2 pt-2 pb-3" : "p-4"}>
      <div
        className={cn(
          "max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4",
          compact && "gap-2 text-[11px]"
        )}
      >
        {/* Balance */}
        {controlsConfig.balance.visible && (
          <div className={`flex items-center gap-2 ${balanceFontSize}`}>
            <span className="text-muted-foreground font-medium">{controlsConfig.balance.label}</span>
            <span className="font-bold font-mono" style={{ color: controlsConfig.balance.color }}>
              ${balance.toFixed(2)}
            </span>
          </div>
        )}

        {/* Bet Controls */}
        {controlsConfig.bet.visible && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={spinning || autoSpinCount > 0} onClick={() => setBet((b: number) => Math.max(0.1, b - 0.1))}>
              {controlsConfig.bet.style === "plusminus" ? <Minus className="h-4 w-4" /> : <span>∨</span>}
            </Button>
            <div className="text-center min-w-[60px]">
              <span className="text-xs text-muted-foreground">Mise</span>
              <div className="font-bold font-mono text-sm" style={{ color: controlsConfig.bet.accentColor }}>${bet.toFixed(2)}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={spinning || autoSpinCount > 0} onClick={() => setBet((b: number) => b + 0.1)}>
              {controlsConfig.bet.style === "plusminus" ? <Plus className="h-4 w-4" /> : <span>∧</span>}
            </Button>
          </div>
        )}

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

        {/* Turbo */}
        {controlsConfig.turbo.visible && (
          <div className="flex items-center gap-2">
            <Switch
              checked={turboMode}
              onCheckedChange={setTurboMode}
              disabled={spinning}
              id="turbo-mode"
            />
            <label 
              htmlFor="turbo-mode" 
              className="text-xs font-medium cursor-pointer flex items-center gap-1"
              style={{ color: turboMode ? controlsConfig.turbo.color : undefined }}
            >
              <Zap className="h-3 w-3" />
              TURBO
            </label>
          </div>
        )}

        {/* Spin Button */}
        <SpinButton
          spinning={spinning}
          disabled={spinning || balance < bet}
          onClick={spin}
          config={controlsConfig.spinButton}
        />

        {/* Extra Controls */}
        <div className="flex items-center gap-2">
          {config.winMechanic === "lines" && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPaylines(!showPaylines)}>
              {showPaylines ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
          {config.freeSpins.enabled && (
            <Button variant="outline" size="sm" className="gap-1 text-xs" disabled={spinning || balance < bet * config.freeSpins.costMultiplier} onClick={buyBonus}>
              <ShoppingCart className="h-3 w-3" />
              BUY (${(bet * config.freeSpins.costMultiplier).toFixed(0)})
            </Button>
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

      {/* Stats (builder/dev) */}
      {showStats && (
        <div className="max-w-5xl mx-auto mt-2 flex flex-col gap-1">
          <div className="flex gap-4 text-xs text-muted-foreground font-mono">
            <span>Tours: {stats.spins}</span>
            <span>Misé: ${stats.wagered.toFixed(2)}</span>
            <span>Gagné: ${stats.won.toFixed(2)}</span>
            <span>{rtpLabel ?? "RTP"}: {rtp}%</span>
          </div>
          {rtpWarning && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono max-w-xl" title={rtpWarning}>
              ⚠️ {rtpWarning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}