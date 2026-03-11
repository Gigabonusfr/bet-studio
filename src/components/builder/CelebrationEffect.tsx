import { motion, AnimatePresence } from "framer-motion";
import type { CelebrationStyle } from "@/types/game-config";

interface Props {
  active: boolean;
  multiplier: number;
  style: CelebrationStyle;
  bet: number;
}

function getWinTier(multiplier: number): { label: string; emoji: string } {
  if (multiplier >= 50) return { label: "EPIC WIN", emoji: "👑" };
  if (multiplier >= 20) return { label: "MEGA WIN", emoji: "🔥" };
  if (multiplier >= 10) return { label: "BIG WIN", emoji: "🎉" };
  return { label: "WIN", emoji: "✨" };
}

const STYLE_CLASSES: Record<CelebrationStyle, string> = {
  none: "",
  classic: "from-yellow-500/90 via-amber-500/90 to-orange-500/90 text-white",
  epic: "from-purple-600/90 via-pink-500/90 to-red-500/90 text-white",
  neon: "from-cyan-400/90 via-blue-500/90 to-purple-600/90 text-white",
  golden: "from-yellow-600/90 via-yellow-400/90 to-yellow-600/90 text-yellow-950",
};

export function CelebrationEffect({ active, multiplier, style, bet }: Props) {
  if (style === "none" || !active) return null;
  const tier = getWinTier(multiplier);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="absolute top-full left-0 right-0 mt-4 z-40 flex justify-center pointer-events-none"
        >
          <div className={`bg-gradient-to-br ${STYLE_CLASSES[style]} rounded-2xl px-6 py-4 shadow-2xl text-center pointer-events-auto`}>
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-3xl mb-1"
            >
              {tier.emoji}
            </motion.div>
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-xl font-black tracking-wider drop-shadow-lg"
            >
              {tier.label}
            </motion.p>
            <p className="text-2xl font-black mt-2 drop-shadow-md">
              {multiplier.toFixed(1)}x
            </p>
            <p className="text-sm font-bold mt-1 opacity-80">
              ${(multiplier * bet).toFixed(2)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
