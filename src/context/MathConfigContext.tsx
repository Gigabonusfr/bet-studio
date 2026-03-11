import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface ReelStrip {
  id: string;
  name: string;
  weight: number;
  reels: string[][]; // 5 reels, each with array of symbols
}

export interface RunConfig {
  numThreads: number;
  rustThreads: number;
  batchingSize: number;
  compression: boolean;
  numSimBase: number;
  numSimBonus: number;
  runSims: boolean;
  runOptimization: boolean;
  runAnalysis: boolean;
  uploadData: boolean;
}

export interface FreespinTriggers {
  basegame: Record<number, number>; // scatter_count -> free_spins
  freegame: Record<number, number>;
}

export interface MathConfig {
  wincap: number;
  basegameStrips: ReelStrip[];
  freegameStrips: ReelStrip[];
  freespinTriggers: FreespinTriggers;
  multiplierEnabled: boolean;
  basegameMultipliers: Record<number, number>;
  freegameMultipliers: Record<number, number>;
  runConfig: RunConfig;
}

const DEFAULT_REELSTRIP: string[][] = [
  ["H1", "L1", "L2", "H2", "L3", "WILD", "L1", "H3", "L2", "SCATTER", "L1", "H1", "L3", "H2", "L2"],
  ["L1", "H2", "L3", "L1", "H1", "L2", "SCATTER", "L3", "H3", "L1", "WILD", "L2", "H2", "L1", "L3"],
  ["H3", "L2", "L1", "H1", "L3", "L2", "H2", "SCATTER", "L1", "L3", "WILD", "H1", "L2", "L1", "H3"],
  ["L1", "H1", "L2", "L3", "H2", "L1", "H3", "L2", "WILD", "L3", "SCATTER", "L1", "H1", "L2", "L3"],
  ["H2", "L3", "L1", "H1", "L2", "H3", "L1", "SCATTER", "L3", "WILD", "L2", "H2", "L1", "L3", "H1"],
];

const DEFAULT_MATH_CONFIG: MathConfig = {
  wincap: 5000,
  basegameStrips: [
    { id: "BR0", name: "BR0", weight: 1, reels: DEFAULT_REELSTRIP },
  ],
  freegameStrips: [
    { id: "FR0", name: "FR0", weight: 1, reels: DEFAULT_REELSTRIP },
  ],
  freespinTriggers: {
    basegame: { 3: 10, 4: 15, 5: 20 },
    freegame: { 2: 4, 3: 6, 4: 8, 5: 10 },
  },
  multiplierEnabled: true,
  basegameMultipliers: { 1: 100 },
  freegameMultipliers: { 2: 100, 3: 80, 4: 50, 5: 20, 10: 10, 20: 5, 50: 1 },
  runConfig: {
    numThreads: 10,
    rustThreads: 10,
    batchingSize: 1000,
    compression: true,
    numSimBase: 100000,
    numSimBonus: 100000,
    runSims: true,
    runOptimization: true,
    runAnalysis: true,
    uploadData: false,
  },
};

interface MathConfigContextType {
  mathConfig: MathConfig;
  updateMathConfig: (partial: Partial<MathConfig>) => void;
  updateRunConfig: (partial: Partial<RunConfig>) => void;
  updateReelStrip: (mode: "basegame" | "freegame", stripId: string, reels: string[][]) => void;
  addReelStrip: (mode: "basegame" | "freegame") => void;
  removeReelStrip: (mode: "basegame" | "freegame", stripId: string) => void;
  setDebugMode: () => void;
  resetMathConfig: () => void;
}

const MathConfigContext = createContext<MathConfigContextType | null>(null);

const STORAGE_KEY = "stake-engine-math-config";

function loadFromStorage(): MathConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_MATH_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_MATH_CONFIG;
}

export function MathConfigProvider({ children }: { children: React.ReactNode }) {
  const [mathConfig, setMathConfig] = useState<MathConfig>(loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mathConfig));
    } catch (e) {
      console.warn("Failed to persist math config", e);
    }
  }, [mathConfig]);

  const updateMathConfig = useCallback((partial: Partial<MathConfig>) => {
    setMathConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateRunConfig = useCallback((partial: Partial<RunConfig>) => {
    setMathConfig((prev) => ({
      ...prev,
      runConfig: { ...prev.runConfig, ...partial },
    }));
  }, []);

  const updateReelStrip = useCallback((mode: "basegame" | "freegame", stripId: string, reels: string[][]) => {
    setMathConfig((prev) => {
      const key = mode === "basegame" ? "basegameStrips" : "freegameStrips";
      return {
        ...prev,
        [key]: prev[key].map((strip) =>
          strip.id === stripId ? { ...strip, reels } : strip
        ),
      };
    });
  }, []);

  const addReelStrip = useCallback((mode: "basegame" | "freegame") => {
    setMathConfig((prev) => {
      const key = mode === "basegame" ? "basegameStrips" : "freegameStrips";
      const prefix = mode === "basegame" ? "BR" : "FR";
      const existingIds = prev[key].map((s) => s.id);
      let index = 0;
      while (existingIds.includes(`${prefix}${index}`)) index++;
      const newId = `${prefix}${index}`;
      return {
        ...prev,
        [key]: [
          ...prev[key],
          { id: newId, name: newId, weight: 1, reels: DEFAULT_REELSTRIP },
        ],
      };
    });
  }, []);

  const removeReelStrip = useCallback((mode: "basegame" | "freegame", stripId: string) => {
    setMathConfig((prev) => {
      const key = mode === "basegame" ? "basegameStrips" : "freegameStrips";
      if (prev[key].length <= 1) return prev;
      return {
        ...prev,
        [key]: prev[key].filter((s) => s.id !== stripId),
      };
    });
  }, []);

  const setDebugMode = useCallback(() => {
    setMathConfig((prev) => ({
      ...prev,
      runConfig: {
        ...prev.runConfig,
        numThreads: 1,
        compression: false,
        numSimBase: 100,
        numSimBonus: 100,
        runOptimization: false,
        runAnalysis: false,
      },
    }));
  }, []);

  const resetMathConfig = useCallback(() => {
    setMathConfig(DEFAULT_MATH_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <MathConfigContext.Provider
      value={{
        mathConfig,
        updateMathConfig,
        updateRunConfig,
        updateReelStrip,
        addReelStrip,
        removeReelStrip,
        setDebugMode,
        resetMathConfig,
      }}
    >
      {children}
    </MathConfigContext.Provider>
  );
}

export function useMathConfig() {
  const ctx = useContext(MathConfigContext);
  if (!ctx) throw new Error("useMathConfig must be used within MathConfigProvider");
  return ctx;
}
