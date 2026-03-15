import { motion, AnimatePresence } from "framer-motion";
import { WinAnimationContent, type WinAnimationIntensity } from "./win-animation-variants";

interface WinAnimationOverlayProps {
  active: boolean;
  builtIn: string;
  intensity: WinAnimationIntensity;
  /** Optional: used by SlotPreview to know how long to show the overlay (same as celebration timeout). */
  durationMs?: number;
}

/**
 * Fullscreen overlay that plays the configured win animation (coins_fall, fireworks, etc.)
 * when a win celebration is triggered. Shown alongside CelebrationEffect (banner).
 */
export function WinAnimationOverlay({ active, builtIn, intensity }: WinAnimationOverlayProps) {
  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-black/20" />
        <WinAnimationContent animId={builtIn} intensity={intensity} fullScreen className="absolute inset-0" />
      </motion.div>
    </AnimatePresence>
  );
}
