import React from "react";
import { cn } from "@/lib/utils";

export type WinAnimationIntensity = "low" | "medium" | "overthetop";

interface WinAnimationContentProps {
  animId: string;
  intensity: WinAnimationIntensity;
  /** When true, content fills the container (e.g. fullscreen overlay). When false, compact preview. */
  fullScreen?: boolean;
  className?: string;
}

const COUNT_BY_INTENSITY: Record<WinAnimationIntensity, number> = {
  low: 5,
  medium: 10,
  overthetop: 20,
};

/**
 * Shared visual variants for win animations (config preview + in-game overlay).
 * Used by Step6Assets WinAnimationPreview and by WinAnimationOverlay in SlotPreview.
 */
export function WinAnimationContent({ animId, intensity, fullScreen = false, className }: WinAnimationContentProps) {
  const count = COUNT_BY_INTENSITY[intensity];
  const containerClass = fullScreen
    ? "absolute inset-0 overflow-hidden"
    : "relative h-20 w-full overflow-hidden";

  const animations: Record<string, React.ReactNode> = {
    coins_fall: (
      <div className={cn("relative w-full overflow-hidden", fullScreen ? "h-full" : "h-20")}>
        {[...Array(count)].map((_, i) => (
          <span
            key={i}
            className="absolute text-xl animate-bounce"
            style={{
              left: `${Math.random() * 90}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
              ...(fullScreen && { fontSize: "clamp(1rem, 4vw, 2rem)" }),
            }}
          >
            🪙
          </span>
        ))}
      </div>
    ),
    golden_flash: (
      <div
        className={cn(
          "w-full rounded-lg animate-pulse",
          fullScreen ? "h-full" : "h-20",
          intensity === "overthetop"
            ? "bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400"
            : intensity === "medium"
              ? "bg-gradient-to-r from-yellow-500/70 to-amber-400/70"
              : "bg-gradient-to-r from-yellow-600/50 to-amber-500/50"
        )}
      />
    ),
    stars_burst: (
      <div className={cn("relative w-full flex items-center justify-center", fullScreen ? "h-full" : "h-20")}>
        {[...Array(count)].map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-ping"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 0.3}s`,
              ...(fullScreen && { fontSize: "clamp(1.5rem, 6vw, 3rem)" }),
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    ),
    win_text: (
      <div className={cn("w-full flex items-center justify-center", fullScreen ? "h-full" : "h-20")}>
        <span
          className={cn(
            "font-black animate-pulse",
            intensity === "overthetop"
              ? "text-4xl text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
              : intensity === "medium"
                ? "text-3xl text-yellow-500"
                : "text-2xl text-yellow-600"
          )}
          style={fullScreen ? { fontSize: "clamp(2rem, 10vw, 6rem)" } : undefined}
        >
          WIN!
        </span>
      </div>
    ),
    coin_explosion: (
      <div className={cn("relative w-full overflow-hidden", fullScreen ? "h-full" : "h-20")}>
        {[...Array(count)].map((_, i) => (
          <span
            key={i}
            className="absolute text-lg"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%,-50%) translate(${(Math.random() - 0.5) * 150}px,${(Math.random() - 0.5) * 80}px)`,
              animation: "ping 0.8s ease-out infinite",
              animationDelay: `${Math.random() * 0.3}s`,
              ...(fullScreen && { fontSize: "clamp(1rem, 4vw, 2rem)" }),
            }}
          >
            🪙
          </span>
        ))}
      </div>
    ),
    confetti_color: (
      <div className={cn("relative w-full overflow-hidden", fullScreen ? "h-full" : "h-20")}>
        {["🎊", "🎉", "✨", "💫", "🌟"].flatMap((e, ei) =>
          [...Array(Math.ceil(count / 5))].map((_, i) => (
            <span
              key={`${ei}-${i}`}
              className="absolute text-xl animate-bounce"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 80}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                ...(fullScreen && { fontSize: "clamp(1rem, 4vw, 2rem)" }),
              }}
            >
              {e}
            </span>
          ))
        )}
      </div>
    ),
    light_rays: (
      <div className={cn("w-full flex items-center justify-center relative overflow-hidden", fullScreen ? "h-full" : "h-20")}>
        <div className="absolute inset-0 bg-gradient-radial from-yellow-300/50 to-transparent animate-pulse" />
        <span className="text-3xl z-10" style={fullScreen ? { fontSize: "clamp(2rem, 10vw, 5rem)" } : undefined}>
          🌟
        </span>
      </div>
    ),
    counter_frenzy: (
      <div className={cn("w-full flex items-center justify-center", fullScreen ? "h-full" : "h-20")}>
        <span
          className={cn(
            "font-mono font-black tabular-nums",
            intensity === "overthetop"
              ? "text-4xl text-green-400 animate-pulse"
              : intensity === "medium"
                ? "text-3xl text-green-500"
                : "text-2xl text-green-600"
          )}
          style={fullScreen ? { fontSize: "clamp(1.5rem, 8vw, 4rem)" } : undefined}
        >
          +$9,999
        </span>
      </div>
    ),
    fireworks: (
      <div className={cn("relative w-full overflow-hidden", fullScreen ? "h-full" : "h-20")}>
        {["🎆", "🎇", "✨"].flatMap((e, ei) =>
          [...Array(Math.ceil(count / 3))].map((_, i) => (
            <span
              key={`${ei}-${i}`}
              className="absolute text-2xl animate-ping"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 70}%`,
                animationDelay: `${Math.random() * 0.8}s`,
                ...(fullScreen && { fontSize: "clamp(1.5rem, 6vw, 3rem)" }),
              }}
            >
              {e}
            </span>
          ))
        )}
      </div>
    ),
    gem_rain: (
      <div className={cn("relative w-full overflow-hidden", fullScreen ? "h-full" : "h-20")}>
        {["💎", "💠", "🔷", "🔶"].flatMap((e, ei) =>
          [...Array(Math.ceil(count / 4))].map((_, i) => (
            <span
              key={`${ei}-${i}`}
              className="absolute text-xl animate-bounce"
              style={{
                left: `${Math.random() * 90}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                ...(fullScreen && { fontSize: "clamp(1rem, 4vw, 2rem)" }),
              }}
            >
              {e}
            </span>
          ))
        )}
      </div>
    ),
    epic_flash: (
      <div
        className={cn(
          "w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 animate-pulse rounded-lg flex items-center justify-center",
          fullScreen ? "h-full" : "h-20"
        )}
      >
        <span className="text-4xl" style={fullScreen ? { fontSize: "clamp(2rem, 12vw, 6rem)" } : undefined}>
          🎉
        </span>
      </div>
    ),
    banner_animated: (
      <div className={cn("w-full flex items-center justify-center", fullScreen ? "h-full" : "h-20")}>
        <div
          className={cn(
            "px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse",
            intensity === "overthetop" && "scale-110"
          )}
        >
          <span
            className="text-white font-black text-lg"
            style={fullScreen ? { fontSize: "clamp(1.25rem, 6vw, 3rem)" } : undefined}
          >
            FREE SPINS!
          </span>
        </div>
      </div>
    ),
    scatter_pulse: (
      <div className={cn("w-full flex items-center justify-center gap-2", fullScreen ? "h-full" : "h-20")}>
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="text-3xl animate-pulse"
            style={{ animationDelay: `${i * 0.2}s`, ...(fullScreen && { fontSize: "clamp(2rem, 8vw, 4rem)" }) }}
          >
            💫
          </span>
        ))}
      </div>
    ),
    scene_transition: (
      <div className={cn("w-full relative overflow-hidden rounded-lg", fullScreen ? "h-full" : "h-20")}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-white font-bold animate-bounce"
            style={fullScreen ? { fontSize: "clamp(1rem, 5vw, 2.5rem)" } : undefined}
          >
            🎬 TRANSITION
          </span>
        </div>
      </div>
    ),
  };

  const content = animations[animId] ?? (
    <div className={cn("w-full flex items-center justify-center text-muted-foreground text-sm", fullScreen ? "h-full" : "h-20")}>
      Aperçu non disponible
    </div>
  );

  return <div className={cn(containerClass, className)}>{content}</div>;
}
