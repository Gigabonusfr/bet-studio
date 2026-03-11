import { useState, useEffect, useCallback, useRef } from "react";
import type { ParticleEffect } from "@/types/game-config";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  shape: string;
}

const EFFECT_CONFIGS: Record<ParticleEffect, { colors: string[]; shapes: string[]; gravity: number; spread: number }> = {
  none: { colors: [], shapes: [], gravity: 0, spread: 0 },
  confetti: {
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#FFD700", "#FF69B4", "#7B68EE"],
    shapes: ["■", "●", "▲", "★"],
    gravity: 0.15,
    spread: 8,
  },
  sparkles: {
    colors: ["#FFD700", "#FFF8DC", "#FFFACD", "#FFE4B5", "#FFFFFF"],
    shapes: ["✦", "✧", "⬥", "◆"],
    gravity: -0.05,
    spread: 3,
  },
  coins: {
    colors: ["#FFD700", "#DAA520", "#B8860B", "#FFA500"],
    shapes: ["🪙", "●", "◉"],
    gravity: 0.25,
    spread: 5,
  },
  stars: {
    colors: ["#FFD700", "#FF69B4", "#00CED1", "#9370DB", "#FF6347"],
    shapes: ["★", "☆", "✦", "⭐"],
    gravity: -0.02,
    spread: 4,
  },
  fire: {
    colors: ["#FF4500", "#FF6347", "#FF8C00", "#FFD700", "#FFA500"],
    shapes: ["🔥", "●", "▲"],
    gravity: -0.3,
    spread: 2,
  },
  bubbles: {
    colors: ["#7DD3FC", "#BAE6FD", "#E0F2FE", "#38BDF8"],
    shapes: ["●", "●", "●", "○"],
    gravity: -0.02,
    spread: 1.5,
  },
};

interface Props {
  active: boolean;
  effect: ParticleEffect;
  intensity: number;
  originX?: number;
  originY?: number;
}

export function ParticleSystem({ active, effect, intensity, originX = 50, originY = 50 }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const idCounter = useRef(0);

  const spawnParticles = useCallback(() => {
    if (effect === "none") return;
    const cfg = EFFECT_CONFIGS[effect];
    const count = Math.floor((intensity / 100) * 20) + 5;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: idCounter.current++,
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * cfg.spread,
        vy: -(Math.random() * cfg.spread + 2),
        size: Math.random() * 12 + 6,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        shape: cfg.shapes[Math.floor(Math.random() * cfg.shapes.length)],
      });
    }
    setParticles((prev) => [...prev.slice(-100), ...newParticles]);
  }, [effect, intensity, originX, originY]);

  useEffect(() => {
    if (!active || effect === "none") {
      setParticles([]);
      return;
    }

    spawnParticles();
    const burstInterval = setInterval(spawnParticles, 300);

    const animate = () => {
      const cfg = EFFECT_CONFIGS[effect];
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + cfg.gravity,
            rotation: p.rotation + p.rotationSpeed,
            life: p.life + 1,
            opacity: Math.max(0, 1 - p.life / p.maxLife),
          }))
          .filter((p) => p.life < p.maxLife)
      );
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(burstInterval);
      cancelAnimationFrame(frameRef.current);
    };
  }, [active, effect, spawnParticles]);

  if (!active || effect === "none" || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: p.color,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
            textShadow: `0 0 ${p.size / 2}px ${p.color}`,
            willChange: "transform, opacity",
          }}
        >
          {p.shape}
        </span>
      ))}
    </div>
  );
}
