import { useState, useEffect, useCallback, useRef } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { useSlotControls } from "@/context/SlotControlsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Plus, Minus, Zap, ShoppingCart, Play, ArrowLeftRight, Dices, X, Search, Upload, Monitor, Smartphone } from "lucide-react";
import type { SymbolDef, VisualEffectsConfig } from "@/types/game-config";
import { ParticleSystem } from "./ParticleSystem";
import { CelebrationEffect } from "./CelebrationEffect";
import { Switch } from "@/components/ui/switch";
import { ControlsCustomizer } from "./ControlsCustomizer";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IntegratedLayout } from "./layouts/IntegratedLayout";
import { SeparatedLayout } from "./layouts/SeparatedLayout";
import { MinimalLayout } from "./layouts/MinimalLayout";
import { CURATED_ASSETS } from "@/data/curated-assets";
import type { AssetsConfig } from "@/types/asset-types";
import { DEFAULT_ASSETS_CONFIG } from "@/types/asset-types";
import { cn } from "@/lib/utils";
import { useRgsClient } from "@/context/RgsContext";
import type { RgsRoundEvent, RgsWinEvent } from "@/lib/rgs-client";
import { DEFAULT_SKIN } from "@/types/game-config";

/** Mapping symbolId (RGS) → nom affiché (aligné templates officiels 0_0_*) */
const DEFAULT_SYMBOL_ID_TO_NAME: Record<number, string> = {
  0: "H1", 1: "H2", 2: "H3", 3: "H4", 4: "H5",
  5: "L1", 6: "L2", 7: "L3", 8: "L4",
  9: "WILD", 10: "SCATTER", 11: "?",
};

function symbolIdBoardToString(board: number[][]): string[][] {
  return board.map((reel) =>
    reel.map((id) => DEFAULT_SYMBOL_ID_TO_NAME[id] ?? "?")
  );
}

function rgsWinsToWinData(wins: RgsWinEvent[]): WinData[] {
  return wins.map((w) => ({
    positions: (w.positions ?? []) as [number, number][],
    symbol: w.symbolId != null ? (DEFAULT_SYMBOL_ID_TO_NAME[w.symbolId] ?? "?") : "?",
    multiplier: w.multiplier ?? 0,
  }));
}

interface SpinResult {
  board: string[][];
  wins: WinData[];
  totalWin: number;
}

interface WinData {
  positions: [number, number][];
  symbol: string;
  multiplier: number;
}

export interface SlotPreviewProps {
  /** "rgs" = animateur pur (board/wins depuis JSON RGS), "local" = calcul mock */
  mode?: "rgs" | "local";
  /** En mode player (export): pas d’édition / pas de customizer */
  locked?: boolean;
}

export function SlotPreview({ mode = "local", locked = false }: SlotPreviewProps) {
  const { config, updateConfig } = useGameConfig();
  const { config: controlsConfig } = useSlotControls();
  const rgs = useRgsClient();
  const [now, setNow] = useState(() => new Date());
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([]);
  const [board, setBoard] = useState<string[][]>([]);
  const [wins, setWins] = useState<WinData[]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [balance, setBalance] = useState(100);
  const [bet, setBet] = useState(1);
  const [turboMode, setTurboMode] = useState(false);
  const [stats, setStats] = useState({ spins: 0, wagered: 0, won: 0 });
  const [showPaylines, setShowPaylines] = useState(false);
  const [scatterTriggered, setScatterTriggered] = useState(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [inFreeSpins, setInFreeSpins] = useState(false);
  const [freeSpinsTotalWin, setFreeSpinsTotalWin] = useState(0);
  const [showFreeSpinsSummary, setShowFreeSpinsSummary] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const autoSpinRef = useRef(autoSpinCount);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [masterMuted, setMasterMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<SymbolDef | null>(null);
  const [editingBackground, setEditingBackground] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  // Tumble state
  const [tumbling, setTumbling] = useState(false);
  const [tumbleCount, setTumbleCount] = useState(0);
  const [explodingPositions, setExplodingPositions] = useState<Set<string>>(new Set());
  const [cascadingPositions, setCascadingPositions] = useState<Set<string>>(new Set());
  const [tumbleTotalWin, setTumbleTotalWin] = useState(0);
  const gridAreaRef = useRef<HTMLDivElement | null>(null);
  const [cellPx, setCellPx] = useState(64);
  const skin = config.skin ?? DEFAULT_SKIN;
  const [showBonusConfirm, setShowBonusConfirm] = useState(false);
  const [bootLoading, setBootLoading] = useState(() => locked);

  const ve = config.visualEffects;
  const au = config.audio;
  const an = config.animation;
  const paySymbols = config.symbols.filter((s) => s.type !== "scatter");
  const allSymbols = config.symbols; // includes scatter for board generation

  /** En mode RGS : balance depuis session (6 décimales implicites) */
  const displayBalance = mode === "rgs" ? (rgs.session?.balance ?? 0) / 1_000_000 : balance;

  // Horloge (affichée surtout en mode player/export)
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Loader de démarrage (export / mode locked uniquement)
  useEffect(() => {
    if (!locked) return;
    setBootLoading(true);
    const t = window.setTimeout(() => {
      setBootLoading(false);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [locked]);

  // Prévisualisation du loader depuis le builder amateur
  useEffect(() => {
    if (!config.bootLoaderPreview) return;
    setBootLoading(true);
    const t = window.setTimeout(() => {
      setBootLoading(false);
      updateConfig({ bootLoaderPreview: false } as any);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [config.bootLoaderPreview, updateConfig]);

  // Suivi largeur viewport pour adapter automatiquement le mode en export/mobile
  useEffect(() => {
    const update = () => {
      setViewportWidth(window.innerWidth || 0);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Taille de cellule responsive: la grille doit toujours rentrer (pas de coupe)
  useEffect(() => {
    const el = gridAreaRef.current;
    if (!el) return;
    const gap = skin.grid.gapPx ?? 8;
    const paddingAllowance = skin.grid.paddingAllowancePx ?? 30;
    const safetyPx = skin.grid.safetyPx ?? 1;
    const minCell = skin.grid.minCellPx ?? 44;
    const maxCell = skin.grid.maxCellPx ?? 140;
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

    const compute = () => {
      const w = Math.max(0, el.clientWidth - paddingAllowance);
      const h = Math.max(0, el.clientHeight - paddingAllowance - 40); // réserve fixe pour bannières/HUD
      if (!w || !h) return;
      const cw = (w - gap * (config.numReels - 1)) / config.numReels;
      const ch = (h - gap * (config.numRows - 1)) / config.numRows;
      // On prend le plus petit des deux pour garantir que la grille rentre en largeur ET en hauteur.
      const next = Math.floor(clamp(Math.min(cw, ch) - safetyPx, minCell, maxCell));
      if (Number.isFinite(next) && next > 0) setCellPx(next);
    };

    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    config.numReels,
    config.numRows,
    skin.grid.gapPx,
    skin.grid.paddingAllowancePx,
    skin.grid.safetyPx,
    skin.grid.minCellPx,
    skin.grid.maxCellPx,
  ]);

  // RGS: authenticate on mount so session/balance are set
  useEffect(() => {
    if (mode === "rgs" && !rgs.session) {
      rgs.authenticate();
    }
  }, [mode, rgs.session, rgs.authenticate]);

  // Audio setup
  useEffect(() => {
    if (au.enabled && au.musicUrl && !audioRef.current) {
      audioRef.current = new Audio(au.musicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = au.musicVolume / 100;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [au.enabled, au.musicUrl, au.musicVolume]);

  // Appliquer le master mute sur la musique de fond
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = masterMuted;
    if (masterMuted) {
      audioRef.current.pause();
    } else if (au.enabled) {
      audioRef.current.play().catch(() => {
        // ignore autoplay restrictions
      });
    }
  }, [masterMuted, au.enabled]);

  // Initialize board and spinning reels state (local mode only; RGS mode waits for reveal events)
  useEffect(() => {
    if (mode === "rgs") {
      const emptyBoard = Array.from({ length: config.numReels }, () =>
        Array(config.numRows).fill("?")
      );
      setBoard(emptyBoard);
      setSpinningReels(new Array(config.numReels).fill(false));
      return;
    }
    const newBoard: string[][] = [];
    for (let col = 0; col < config.numReels; col++) {
      const reel: string[] = [];
      for (let row = 0; row < config.numRows; row++) {
        reel.push(paySymbols[Math.floor(Math.random() * paySymbols.length)]?.name || "?");
      }
      newBoard.push(reel);
    }
    setBoard(newBoard);
    setSpinningReels(new Array(config.numReels).fill(false));
  }, [mode, config.numReels, config.numRows, paySymbols.length]);

  const evaluateWins = useCallback(
    (resultBoard: string[][]): SpinResult => {
      const foundWins: WinData[] = [];
      let totalMultiplier = 0;

      const wildSym = config.symbols.find((s) => s.type === "wild")?.name;
      const scatterSym = config.symbols.find((s) => s.type === "scatter")?.name;

      // Scatter check — trigger free spins
      if (scatterSym && config.freeSpins.enabled) {
        let scatterCount = 0;
        const scatterPos: [number, number][] = [];
        resultBoard.forEach((reel, colIdx) => {
          reel.forEach((sym, rowIdx) => {
            if (sym === scatterSym) {
              scatterCount++;
              scatterPos.push([colIdx, rowIdx]);
            }
          });
        });
        if (scatterCount >= 3) {
          const spinsAwarded = config.freeSpins.scatterAwards[scatterCount] || 10;
          setScatterTriggered(true);
          setShowCelebration(true);
          setShowParticles(true);
          setTimeout(() => {
            setShowCelebration(false);
            setShowParticles(false);
            setFreeSpinsRemaining((prev) => prev + spinsAwarded);
            if (!inFreeSpins) setFreeSpinsTotalWin(0);
            setInFreeSpins(true);
          }, 2000);
        }
      }

      if (config.winMechanic === "lines") {
        // Lines evaluation
        const paylines = generatePaylines(config.numReels, config.numRows, config.numPaylines);
        paylines.forEach((line) => {
          const symbols: string[] = [];
          const positions: [number, number][] = [];
          line.forEach(([col, row]) => {
            const sym = resultBoard[col]?.[row];
            if (sym) {
              symbols.push(sym);
              positions.push([col, row]);
            }
          });

          // Check for matching symbols
          for (let matchLen = config.numReels; matchLen >= 3; matchLen--) {
            const checkSyms = symbols.slice(0, matchLen);
            const firstSym = checkSyms[0];
            const symDef = config.symbols.find((s) => s.name === firstSym);
            if (!symDef || symDef.type === "scatter") continue;

            const allMatch = checkSyms.every((s) => s === firstSym || s === wildSym);
            if (allMatch && symDef.paytable[matchLen]) {
              foundWins.push({
                positions: positions.slice(0, matchLen),
                symbol: firstSym,
                multiplier: symDef.paytable[matchLen],
              });
              totalMultiplier += symDef.paytable[matchLen];
              break;
            }
          }
        });
      } else if (config.winMechanic === "ways") {
        // Ways evaluation (left to right, any position per reel)
        const paySymbolsOnly = config.symbols.filter((s) => s.type === "high" || s.type === "low");
        paySymbolsOnly.forEach((symDef) => {
          let consecutiveReels = 0;
          const matchPositions: [number, number][] = [];
          for (let col = 0; col < config.numReels; col++) {
            const hasSymbol = resultBoard[col].some((s, rowIdx) => {
              if (s === symDef.name || s === wildSym) {
                matchPositions.push([col, rowIdx]);
                return true;
              }
              return false;
            });
            if (hasSymbol) {
              consecutiveReels++;
            } else {
              break;
            }
          }
          if (consecutiveReels >= 3 && symDef.paytable[consecutiveReels]) {
            foundWins.push({
              positions: matchPositions.slice(0, consecutiveReels * config.numRows),
              symbol: symDef.name,
              multiplier: symDef.paytable[consecutiveReels],
            });
            totalMultiplier += symDef.paytable[consecutiveReels];
          }
        });
      } else if (config.winMechanic === "cluster") {
        // Cluster evaluation (simplified: 3+ adjacent symbols)
        const visited = new Set<string>();
        const allSymbols = config.symbols.filter((s) => s.type === "high" || s.type === "low");
        allSymbols.forEach((symDef) => {
          resultBoard.forEach((reel, col) => {
            reel.forEach((sym, row) => {
              const key = `${col},${row}`;
              if (visited.has(key) || sym !== symDef.name) return;
              const cluster = findCluster(resultBoard, col, row, symDef.name, wildSym);
              if (cluster.length >= 3) {
                cluster.forEach((pos) => visited.add(`${pos[0]},${pos[1]}`));
                const mult = symDef.paytable[Math.min(cluster.length, 5)] || 0;
                if (mult > 0) {
                  foundWins.push({ positions: cluster, symbol: symDef.name, multiplier: mult });
                  totalMultiplier += mult;
                }
              }
            });
          });
        });
      } else if (config.winMechanic === "scatter") {
        // Scatter count-based wins
        const allSymbols = config.symbols.filter((s) => s.type === "high" || s.type === "low");
        allSymbols.forEach((symDef) => {
          const positions: [number, number][] = [];
          resultBoard.forEach((reel, col) => {
            reel.forEach((sym, row) => {
              if (sym === symDef.name || sym === wildSym) {
                positions.push([col, row]);
              }
            });
          });
          if (positions.length >= 3 && symDef.paytable[positions.length]) {
            foundWins.push({
              positions,
              symbol: symDef.name,
              multiplier: symDef.paytable[positions.length],
            });
            totalMultiplier += symDef.paytable[positions.length];
          }
        });
      }

      return { board: resultBoard, wins: foundWins, totalWin: totalMultiplier };
    },
    [config]
  );

  // Helper to generate a random board with scatter probability
  const generateBoard = useCallback((forceScatters?: number) => {
    const scatterSym = config.symbols.find((s) => s.type === "scatter");
    const newBoard: string[][] = [];
    
    // For bonus buy, force scatter symbols onto the board
    const forcedScatterPositions = new Set<string>();
    if (forceScatters && forceScatters > 0 && scatterSym) {
      const allPositions: string[] = [];
      for (let col = 0; col < config.numReels; col++) {
        for (let row = 0; row < config.numRows; row++) {
          allPositions.push(`${col},${row}`);
        }
      }
      // Shuffle and pick
      for (let i = allPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
      }
      for (let i = 0; i < Math.min(forceScatters, allPositions.length); i++) {
        forcedScatterPositions.add(allPositions[i]);
      }
    }

    for (let col = 0; col < config.numReels; col++) {
      const reel: string[] = [];
      for (let row = 0; row < config.numRows; row++) {
        if (forcedScatterPositions.has(`${col},${row}`) && scatterSym) {
          reel.push(scatterSym.name);
        } else {
          // Scatter probability scales with grid size: ~0.4 scatters per spin on average
          const totalCells = config.numReels * config.numRows;
          const scatterProb = 0.4 / totalCells;
          if (scatterSym && config.freeSpins.enabled && Math.random() < scatterProb) {
            reel.push(scatterSym.name);
          } else {
            reel.push(paySymbols[Math.floor(Math.random() * paySymbols.length)]?.name || "?");
          }
        }
      }
      newBoard.push(reel);
    }
    return newBoard;
  }, [config, paySymbols]);

  // Tumble: remove winning positions and drop new symbols
  const tumbleBoard = useCallback((currentBoard: string[][], winPositions: Set<string>): string[][] => {
    const scatterSym = config.symbols.find((s) => s.type === "scatter");
    const newBoard: string[][] = [];
    
    for (let col = 0; col < config.numReels; col++) {
      const reel = [...currentBoard[col]];
      // Remove winning symbols (mark as null)
      const remaining: (string | null)[] = reel.map((sym, row) => 
        winPositions.has(`${col},${row}`) ? null : sym
      );
      
      // Gravity: compact non-null symbols to bottom
      const compacted = remaining.filter((s) => s !== null) as string[];
      const emptySlots = config.numRows - compacted.length;
      
      // Fill from top with new random symbols
      const newSymbols: string[] = [];
      for (let i = 0; i < emptySlots; i++) {
        if (scatterSym && config.freeSpins.enabled && Math.random() < (0.3 / (config.numReels * config.numRows))) {
          newSymbols.push(scatterSym.name);
        } else {
          newSymbols.push(paySymbols[Math.floor(Math.random() * paySymbols.length)]?.name || "?");
        }
      }
      
      newBoard.push([...newSymbols, ...compacted]);
    }
    return newBoard;
  }, [config, paySymbols]);

  // Run a tumble cascade sequence
  const runTumbleCascade = useCallback((currentBoard: string[][], currentWins: WinData[], accumulatedWin: number, cascadeNum: number) => {
    if (currentWins.length === 0 || !config.tumbleEnabled) {
      // No more wins or tumble disabled — end cascade
      setTumbling(false);
      setExplodingPositions(new Set());
      setCascadingPositions(new Set());
      setSpinning(false);
      
      // Handle free spins countdown
      if (inFreeSpins) {
        setFreeSpinsRemaining((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setInFreeSpins(false);
            setScatterTriggered(false);
            setShowFreeSpinsSummary(true);
          }
          return next;
        });
      }
      
      // Auto-spin continuation
      if (autoSpinRef.current > 0) {
        setAutoSpinCount((prev) => {
          const next = prev - 1;
          autoSpinRef.current = next;
          return next;
        });
      }
      return;
    }

    // Collect all winning positions
    const winPosSet = new Set<string>();
    currentWins.forEach((w) => w.positions.forEach(([c, r]) => winPosSet.add(`${c},${r}`)));
    
    // Phase 1: Show explosion animation
    setExplodingPositions(winPosSet);
    setShowParticles(true);
    
    const explodeDuration = turboMode ? 300 : 600;
    
    setTimeout(() => {
      setExplodingPositions(new Set());
      setShowParticles(false);
      
      // Phase 2: Tumble — remove and drop
      const newBoard = tumbleBoard(currentBoard, winPosSet);
      
      // Mark new positions as cascading
      const cascadeSet = new Set<string>();
      for (let col = 0; col < config.numReels; col++) {
        const removedInCol = [...winPosSet].filter((p) => p.startsWith(`${col},`)).length;
        for (let row = 0; row < removedInCol; row++) {
          cascadeSet.add(`${col},${row}`);
        }
      }
      setCascadingPositions(cascadeSet);
      setBoard(newBoard);
      setTumbleCount(cascadeNum);
      
      const dropDuration = turboMode ? 200 : 400;
      
      setTimeout(() => {
        setCascadingPositions(new Set());
        
        // Phase 3: Re-evaluate wins
        const result = evaluateWins(newBoard);
        setWins(result.wins);
        
        if (result.totalWin > 0) {
          let multiplier = 1;
          if (inFreeSpins && config.freeSpins.multiplier !== "none") {
            if (config.freeSpins.multiplier === "2x") multiplier = 2;
            else if (config.freeSpins.multiplier === "3x") multiplier = 3;
            else if (config.freeSpins.multiplier === "5x") multiplier = 5;
            else if (config.freeSpins.multiplier === "random") multiplier = [2, 3, 5][Math.floor(Math.random() * 3)];
          }
          const winAmount = result.totalWin * bet * multiplier;
          const newAccum = accumulatedWin + winAmount;
          setTumbleTotalWin(newAccum);
          setTotalWin(result.totalWin);
          setBalance((b) => b + winAmount);
          setStats((s) => ({ ...s, won: s.won + winAmount }));
          if (inFreeSpins) setFreeSpinsTotalWin((prev) => prev + winAmount);
          
          // Celebration on big tumble chains
          if (cascadeNum >= 2 || result.totalWin >= ve.celebrationThreshold) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), an.winAnimationDuration);
          }
          
          // Continue cascade
          const nextDelay = turboMode ? 400 : 800;
          setTimeout(() => {
            runTumbleCascade(newBoard, result.wins, newAccum, cascadeNum + 1);
          }, nextDelay);
        } else {
          setWins([]);
          setTotalWin(0);
          // End cascade
          runTumbleCascade(newBoard, [], accumulatedWin, cascadeNum);
        }
      }, dropDuration);
    }, explodeDuration);
  }, [config, tumbleBoard, evaluateWins, bet, ve, an, turboMode, inFreeSpins]);

  const spin = useCallback(async () => {
    if (spinning || tumbling) return;

    // ——— Mode RGS : animateur pur, pas de generateBoard/evaluateWins ———
    if (mode === "rgs") {
      const rgsBalance = (rgs.session?.balance ?? 0) / 1_000_000;
      if (rgsBalance < bet) return;
      setSpinning(true);
      setSpinningReels(new Array(config.numReels).fill(true));
      setWins([]);
      setTotalWin(0);
      const betAmount = Math.round(bet * 1_000_000);
      const res = await rgs.play(betAmount);
      setSpinning(false);
      setSpinningReels(new Array(config.numReels).fill(false));
      if (!res?.events?.length) return;
      for (const e of res.events as RgsRoundEvent[]) {
        if (e.type === "reveal" && e.board) {
          setBoard(symbolIdBoardToString(e.board));
        }
        if (e.type === "winInfo" && e.wins) {
          setWins(rgsWinsToWinData(e.wins));
        }
        if (e.type === "setWin" || e.type === "finalWin") {
          if (e.amount != null) setTotalWin(e.amount / 1_000_000);
        }
      }
      if (res.payoutMultiplier != null) setTotalWin(res.payoutMultiplier * bet);

      // Auto-spin continuation (mode RGS)
      if (autoSpinRef.current > 0) {
        setAutoSpinCount((prev) => {
          const next = prev - 1;
          autoSpinRef.current = next;
          return next;
        });
      }
      return;
    }

    // ——— Mode local (mock) ———
    if (!inFreeSpins && balance < bet) return;
    setSpinning(true);
    setTumbling(false);
    setTumbleCount(0);
    setTumbleTotalWin(0);
    setSpinningReels(new Array(config.numReels).fill(true));
    setWins([]);
    setTotalWin(0);
    setExplodingPositions(new Set());
    setCascadingPositions(new Set());
    
    if (!inFreeSpins) {
      setBalance((b) => b - bet);
      setStats((s) => ({ ...s, spins: s.spins + 1, wagered: s.wagered + bet }));
    } else {
      setStats((s) => ({ ...s, spins: s.spins + 1 }));
    }

    const newBoard = generateBoard();

    // Cascading stop effect
    for (let i = 0; i < config.numReels; i++) {
      setTimeout(() => {
        setSpinningReels((prev) => {
          const next = [...prev];
          next[i] = false;
          return next;
        });
      }, 500 + i * (turboMode ? 100 : 200));
    }

    const totalSpinTime = 500 + config.numReels * (turboMode ? 100 : 200);

    setTimeout(() => {
      setBoard(newBoard);
      const result = evaluateWins(newBoard);
      setWins(result.wins);
      setTotalWin(result.totalWin);
      
      // Apply free spin multiplier
      let multiplier = 1;
      if (inFreeSpins && config.freeSpins.multiplier !== "none") {
        if (config.freeSpins.multiplier === "2x") multiplier = 2;
        else if (config.freeSpins.multiplier === "3x") multiplier = 3;
        else if (config.freeSpins.multiplier === "5x") multiplier = 5;
        else if (config.freeSpins.multiplier === "random") multiplier = [2, 3, 5][Math.floor(Math.random() * 3)];
      }
      
      const winAmount = result.totalWin * bet * multiplier;
      setBalance((b) => b + winAmount);
      setStats((s) => ({ ...s, won: s.won + winAmount }));
      if (inFreeSpins) setFreeSpinsTotalWin((prev) => prev + winAmount);

      // Trigger effects for initial win
      if (result.totalWin >= ve.celebrationThreshold) {
        setShowCelebration(true);
        setShowParticles(true);
        setTimeout(() => {
          setShowCelebration(false);
          setShowParticles(false);
        }, an.winAnimationDuration);
      }

      // If tumble enabled and there are wins, start cascade
      if (config.tumbleEnabled && result.wins.length > 0) {
        setTumbling(true);
        setTumbleTotalWin(winAmount);
        const cascadeDelay = turboMode ? 600 : 1200;
        setTimeout(() => {
          runTumbleCascade(newBoard, result.wins, winAmount, 1);
        }, cascadeDelay);
      } else {
        setSpinning(false);
        
        // Handle free spins countdown
        if (inFreeSpins) {
          setFreeSpinsRemaining((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setInFreeSpins(false);
              setScatterTriggered(false);
              setShowFreeSpinsSummary(true);
            }
            return next;
          });
        }
        
        // Auto-spin continuation
        if (autoSpinRef.current > 0) {
          setAutoSpinCount((prev) => {
            const next = prev - 1;
            autoSpinRef.current = next;
            return next;
          });
        }
      }
    }, totalSpinTime);
  }, [mode, spinning, tumbling, balance, bet, config, paySymbols, evaluateWins, ve.celebrationThreshold, an.winAnimationDuration, turboMode, inFreeSpins, generateBoard, runTumbleCascade, rgs]);
  

  const executeBuyBonus = useCallback(() => {
    if (spinning || !config.freeSpins.enabled) return;
    const cost = bet * config.freeSpins.costMultiplier;
    if (balance < cost) return;
    
    setBalance((b) => b - cost);
    
    // Trigger free spins with forced scatters on the board
    const scatterCount = 3;
    const spinsAwarded = config.freeSpins.scatterAwards[scatterCount] || 10;
    const forcedBoard = generateBoard(scatterCount);
    setBoard(forcedBoard);
    setScatterTriggered(true);
    setShowCelebration(true);
    setShowParticles(true);
    
    setTimeout(() => {
      setShowCelebration(false);
      setShowParticles(false);
      setFreeSpinsRemaining(spinsAwarded);
      setFreeSpinsTotalWin(0);
      setInFreeSpins(true);
    }, 2000);
  }, [spinning, balance, bet, config.freeSpins, generateBoard]);

  const requestBuyBonus = useCallback(() => {
    if (spinning || !config.freeSpins.enabled) return;
    const cost = bet * config.freeSpins.costMultiplier;
    if (balance < cost) return;
    setShowBonusConfirm(true);
  }, [spinning, config.freeSpins, bet, balance]);

  // Keep ref in sync
  useEffect(() => {
    autoSpinRef.current = autoSpinCount;
  }, [autoSpinCount]);

  // Free spins auto-play
  useEffect(() => {
    if (inFreeSpins && freeSpinsRemaining > 0 && !spinning) {
      const timer = setTimeout(() => spin(), 800);
      return () => clearTimeout(timer);
    }
  }, [inFreeSpins, freeSpinsRemaining, spinning, spin]);

  // Auto-spin: trigger next spin when count > 0 and not spinning
  useEffect(() => {
    // En mode RGS, le solde affiché vient de la session (pas du state local `balance`)
    if (!inFreeSpins && autoSpinCount > 0 && !spinning && displayBalance >= bet) {
      const timer = setTimeout(() => spin(), 500);
      return () => clearTimeout(timer);
    }
    if (autoSpinCount > 0 && displayBalance < bet) {
      setAutoSpinCount(0);
      autoSpinRef.current = 0;
    }
  }, [autoSpinCount, spinning, displayBalance, bet, spin, inFreeSpins]);

  const startAutoSpin = useCallback((count: number) => {
    setAutoSpinCount(count);
    autoSpinRef.current = count;
  }, []);

  const stopAutoSpin = useCallback(() => {
    setAutoSpinCount(0);
    autoSpinRef.current = 0;
  }, []);

  const rtp = stats.wagered > 0 ? ((stats.won / stats.wagered) * 100).toFixed(2) : "0.00";

  // Video playback speed
  useEffect(() => {
    if (videoRef.current && config.backgroundPlaybackSpeed) {
      videoRef.current.playbackRate = config.backgroundPlaybackSpeed;
    }
  }, [config.backgroundPlaybackSpeed]);

  // Détermination du mode UX courant (desktop / mobile) à partir de la config et de la largeur viewport.
  const autoUx = config.autoUX ?? { mode: "auto", mobileBreakpointPx: 768 };
  const isMobileViewport =
    (viewportWidth ?? 0) > 0 && (viewportWidth ?? 0) <= (autoUx.mobileBreakpointPx || 768);

  const currentUxMode: "desktop" | "mobile" = (() => {
    switch (autoUx.mode) {
      case "desktop":
        return "desktop";
      case "mobile":
        return "mobile";
      case "off":
        // En mode off : en builder on respecte le toggle Desktop/Mobile,
        // en export on reste en desktop pour éviter les surprises.
        if (!locked) return previewDevice;
        return "desktop";
      case "auto":
      default: {
        if (locked) {
          // Export : on suit le viewport uniquement.
          return isMobileViewport ? "mobile" : "desktop";
        }
        // Builder : toggle Desktop/Mobile prioritaire, mais si la fenêtre est vraiment petite on force mobile.
        if (previewDevice === "mobile" || isMobileViewport) return "mobile";
        return "desktop";
      }
    }
  })();

  const shouldUseMobileFrame = currentUxMode === "mobile";

  return (
    <aside 
      className={cn(
        "w-full h-full flex flex-col relative bg-card/50 overflow-hidden",
        shouldUseMobileFrame && "max-w-[480px] mx-auto aspect-[9/16] rounded-3xl border border-border shadow-2xl"
      )}
      style={!config.backgroundUrl && config.backgroundImage ? { 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${config.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      } : {}}
    >
      {/* Loader de démarrage (export + preview depuis l'étape Loading) */}
      {bootLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6">
          {config.bootLoaderBackgroundUrl && (
            <div
              className="absolute inset-0 -z-10 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(${config.bootLoaderBackgroundUrl})`,
              }}
            />
          )}
          <div
            className="w-full max-w-xs rounded-2xl border shadow-xl px-4 py-5 bg-background/90 backdrop-blur-md"
            style={{
              borderColor: controlsConfig.autoSpin.color,
              boxShadow: `0 0 28px ${controlsConfig.autoSpin.color}40`,
            }}
          >
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Chargement de la machine…
            </div>
            <div className="text-sm font-semibold mb-3" style={{ color: controlsConfig.autoSpin.color }}>
              {config.gameName || "Slot"}
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden"
                 style={{ backgroundColor: `${controlsConfig.bar.backgroundColor}40` }}>
              <div
                className="h-full rounded-full animate-[loader-bar_1.4s_ease-in-out_infinite]"
                style={{
                  backgroundColor: controlsConfig.autoSpin.color,
                  boxShadow: `0 0 12px ${controlsConfig.autoSpin.color}80`,
                  width: "60%",
                }}
              />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Initialisation des symboles et des contrôles…
            </div>
          </div>
        </div>
      )}
      {/* Custom Background - clickable to edit */}
      {config.backgroundUrl && config.backgroundType === "video" && (
        <video
          ref={videoRef}
          src={config.backgroundUrl}
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover -z-10 cursor-pointer"
          style={{ filter: 'brightness(0.5)' }}
          onClick={() => setEditingBackground(true)}
        />
      )}
      {config.backgroundUrl && config.backgroundType === "image" && (
        <div
          className="absolute inset-0 w-full h-full -z-10 cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${config.backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={() => setEditingBackground(true)}
        />
      )}
      {/* No background set - show clickable placeholder zone */}
      {!config.backgroundUrl && !config.backgroundImage && (
        <div
          className="absolute inset-0 w-full h-full -z-10 cursor-pointer hover:bg-accent/10 transition-colors"
          onClick={() => { if (!locked) setEditingBackground(true); }}
        />
      )}
      {/* Header builder (preview) — on retire la grosse barre pour gagner de la hauteur,
          on garde uniquement les badges discrets sous la barre d’outils globale + le toggle device. */}
      {!locked && (
        <div className="px-4 pt-2 flex items-center justify-between gap-2 z-10">
          {(skin.header.showGameNameBadge || skin.header.showClockBadge) && (
            <div className="flex items-center gap-2">
              {skin.header.showGameNameBadge && (
                <Badge variant={skin.header.builderBadgeVariantName} className="cursor-default select-none">
                  {config.gameName || "Slot"}
                </Badge>
              )}
              {skin.header.showClockBadge && (
                <Badge variant={skin.header.builderBadgeVariantClock} className="font-mono cursor-default select-none">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-1 py-0.5 text-[11px] shadow-sm">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors",
                previewDevice === "desktop"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/40"
              )}
            >
              <Monitor className="h-3 w-3" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors",
                previewDevice === "mobile"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/40"
              )}
            >
              <Smartphone className="h-3 w-3" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      )}

      {/* Header export (player): overlay top-left (nom + heure uniquement) */}
      {locked && (
        <div className="absolute top-3 left-3 z-30 rounded-xl border border-border/50 bg-background/70 backdrop-blur-md px-3 py-2">
          <div className="flex items-center gap-2">
            {skin.header.showGameNameBadge && (
              <Badge variant={skin.header.exportBadgeVariantName} className="cursor-default select-none">
                {config.gameName || "Slot"}
              </Badge>
            )}
            {skin.header.showClockBadge && (
              <Badge variant={skin.header.exportBadgeVariantClock} className="font-mono cursor-default select-none">
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Grid + overlays */}
      <div
        ref={gridAreaRef}
        className={cn(
          "flex-1 overflow-hidden px-4 py-2 flex flex-col items-center relative",
          shouldUseMobileFrame ? "justify-center" : "justify-start"
        )}
      >
        {/* Zone bannière FREE SPINS / SCATTER, en overlay sous la grille */}
        <div className="pointer-events-none absolute top-full left-0 right-0 mt-2 flex items-center justify-center z-30">
          {inFreeSpins && (
            <div className="pointer-events-auto px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 text-center">
              <span className="text-sm font-bold text-primary">🎰 FREE SPINS — {freeSpinsRemaining} restants</span>
              {config.freeSpins.multiplier !== "none" && (
                <span className="ml-2 text-xs text-primary/80">({config.freeSpins.multiplier} multiplicateur)</span>
              )}
              {freeSpinsTotalWin > 0 && (
                <div className="text-xs text-primary/90 mt-1 font-semibold">
                  Gains accumulés: <span className="text-primary font-bold">{freeSpinsTotalWin.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {scatterTriggered && !inFreeSpins && (
            <div className="pointer-events-auto px-4 py-2 rounded-lg bg-gold/20 border border-gold/40 text-center animate-pulse">
              <span className="text-sm font-bold text-gold">✨ SCATTER TRIGGERED! Free Spins activés!</span>
            </div>
          )}
        </div>

        {/* Tumble Counter Banner — overlay au‑dessus de la grille */}
        {config.tumbleEnabled && tumbling && tumbleCount > 0 && (
          <div className="pointer-events-none absolute -bottom-10 left-0 right-0 flex items-center justify-center z-30">
            <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary/40 text-center">
              <span className="text-sm font-bold text-secondary">💥 TUMBLE x{tumbleCount}</span>
              <span className="ml-2 text-xs text-secondary/80">+{tumbleTotalWin.toFixed(2)}</span>
            </div>
          </div>
        )}

        <ParticleSystem
          active={showParticles}
          effect={ve.particleEffect}
          intensity={ve.particleIntensity}
          originX={50}
          originY={50}
        />
        <CelebrationEffect
          active={showCelebration}
          multiplier={totalWin}
          style={ve.celebrationStyle}
          bet={bet}
        />

        {/* Résumé Free Spins en overlay (ne déplace pas la grille) */}
        {showFreeSpinsSummary && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-4 pointer-events-auto">
            <div
              className="w-full max-w-md p-4 rounded-xl text-center shadow-lg animate-in fade-in zoom-in-95 duration-500 border-2"
              style={{
                backgroundColor: `${controlsConfig.bar.backgroundColor}F2`,
                borderColor: controlsConfig.autoSpin.color,
                boxShadow: `0 0 24px ${controlsConfig.autoSpin.color}40`,
              }}
            >
              <div
                className="text-lg font-bold mb-1 flex items-center justify-center gap-1"
                style={{ color: controlsConfig.autoSpin.color }}
              >
                <span>🎉</span>
                <span>FREE SPINS TERMINÉS</span>
              </div>
              <div className="text-2xl font-black text-foreground my-2">
                +{freeSpinsTotalWin.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Gains totaux pendant la session</p>
              <button
                onClick={() => setShowFreeSpinsSummary(false)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors"
                style={{ backgroundColor: controlsConfig.autoSpin.color, color: "#0f172a" }}
              >
                Continuer
              </button>
            </div>
          </div>
        )}
        {/* Cadre de grille fixe (taille calculée à partir de cellPx / numReels / numRows)
            avec un petit padding interne pour éviter que les cases collent au bord bleu. */}
        <div
          className={`relative rounded-xl shadow-2xl transition-all p-2 ${
            ve.gridBorderStyle === "glow" ? "border-2 glow-gold" :
            ve.gridBorderStyle === "neon" ? "border-4 border-gold" :
            ve.gridBorderStyle === "gradient" ? "border-4 border-transparent bg-gradient-to-br from-gold/50 to-cyan/50" :
            ve.gridBorderStyle === "solid" ? "border-2" : "border-2 border-border/50"
          }`}
          style={{
            backgroundColor: config.reelColor || 'hsl(220 18% 9%)',
            borderColor: ve.gridBorderStyle !== "none" ? ve.gridBorderColor : undefined,
          }}
        >
          <div
            className="grid mx-auto relative"
            style={{
              gridTemplateColumns: `repeat(${config.numReels}, ${cellPx}px)`,
              columnGap: `${skin.grid.gapPx ?? 8}px`,
              rowGap: `${skin.grid.gapPx ?? 8}px`,
            }}
          >
            {board.map((reel, colIdx) => {
              const isSpinningReel = spinningReels[colIdx];
              return reel.map((sym, rowIdx) => {
                const symDef = config.symbols.find((s) => s.name === sym);
                const isWinning = wins.some((w) => w.positions.some(([c, r]) => c === colIdx && r === rowIdx));
                const posKey = `${colIdx},${rowIdx}`;
                const isExploding = explodingPositions.has(posKey);
                const isCascading = cascadingPositions.has(posKey);
                
                let animationClass = isSpinningReel ? an.reelAnimation === "blur" ? "spin-vertical" : "" : "";
                if (isExploding) {
                  animationClass = "tumble-explode";
                } else if (isCascading) {
                  animationClass = "tumble-drop";
                } else {
                  if (!isSpinningReel && isWinning && ve.symbolAnimation !== "none") {
                    animationClass += ` symbol-${ve.symbolAnimation}`;
                  }
                  if (!isSpinningReel && an.reelAnimation === "bounce") animationClass += " bounce-stop";
                  if (!isSpinningReel && an.reelAnimation === "elastic") animationClass += " elastic-stop";
                  if (!isSpinningReel && an.reelAnimation === "cascade") animationClass += " cascade-stop";
                }

                return (
                  <div
                    key={`${colIdx}-${rowIdx}`}
                    onClick={() => { if (!locked && !spinning && !tumbling && symDef) setEditingSymbol(symDef); }}
                    className={cn(
                      `rounded-lg flex items-center justify-center text-xs font-bold border-2 will-change-transform`,
                      animationClass,
                      isWinning && !isExploding ? "z-10" : "",
                      !locked && !spinning && !tumbling && "cursor-pointer"
                    )}
                    style={{
                      width: `${cellPx}px`,
                      height: `${cellPx}px`,
                      backgroundColor: symDef?.customImageUrl ? "transparent" : symDef?.color + "30",
                      color: symDef?.color,
                      transform: isExploding ? "scale(0)" : `scale(${an.symbolScale})`,
                      borderColor: isWinning && !isExploding ? ve.winLineColor : undefined,
                      // Glow uniquement visuel, ne change pas la boîte de layout
                      boxShadow: isWinning && ve.glowEnabled && !isExploding ? `0 0 ${ve.glowIntensity / 5}px ${ve.glowColor}` : undefined,
                      opacity: isExploding ? 0 : 1,
                    }}
                  >
                    {/* Check for assigned asset from assets config */}
                    {(() => {
                      const assetsConfig = (config as any).assetsConfig;
                      const assignedUrl = assetsConfig?.symbolAssets?.[symDef?.id || ""];
                      const pad = Math.max(0, Math.min(20, skin.symbols.imagePaddingPct ?? 0));
                      const inner = pad > 0 ? `${100 - pad}%` : "100%";
                      if (assignedUrl) {
                        return (
                          <img
                            src={assignedUrl}
                            alt={sym}
                            className="rounded"
                            style={{ width: inner, height: inner, objectFit: skin.symbols.imageFit ?? "contain" }}
                          />
                        );
                      }
                      if (symDef?.customImageUrl) {
                        return (
                          <img
                            src={symDef.customImageUrl}
                            alt={sym}
                            className="rounded"
                            style={{ width: inner, height: inner, objectFit: skin.symbols.imageFit ?? "contain" }}
                          />
                        );
                      }
                      if (symDef?.image) {
                        return (
                          <img
                            src={symDef.image}
                            alt={sym}
                            className="rounded"
                            style={{ width: inner, height: inner, objectFit: skin.symbols.imageFit ?? "contain" }}
                          />
                        );
                      }
                      return sym;
                    })()}
                  </div>
                );
              });
            })}
          </div>

          {showPaylines && config.winMechanic === "lines" && (
            <PaylineOverlay numReels={config.numReels} numRows={config.numRows} numLines={config.numPaylines} visualEffects={ve} />
          )}
        </div>

        {/* Bannière Free Spins (déclenchement) */}
        {scatterTriggered && (
          shouldUseMobileFrame ? (
            // En mobile: overlay à l'intérieur de la zone grille, juste au‑dessus de l'UX, sans déplacer la grille
            <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex items-center justify-center z-30">
              <div
                className="pointer-events-auto rounded-xl px-4 py-3 text-center text-xs font-bold shadow-[0_0_18px_rgba(0,0,0,0.5)] border inline-block"
                style={{
                  borderColor: controlsConfig.autoSpin.color,
                  backgroundColor: `${controlsConfig.bar.backgroundColor}F2`,
                  color: controlsConfig.autoSpin.color,
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>🎉</span>
                  <span>TOURS GRATUITS DÉCLENCHÉS !</span>
                </div>
                {freeSpinsRemaining > 0 && (
                  <div className="mt-1 text-[11px] font-medium">
                    {freeSpinsRemaining} tours restants
                  </div>
                )}
                {freeSpinsTotalWin > 0 && (
                  <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                    Gain total bonus:&nbsp;
                    <span className="font-semibold" style={{ color: controlsConfig.autoSpin.color }}>
                      {freeSpinsTotalWin.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // En desktop: comportement d'origine, sous la grille avec un margin contrôlé (ne casse pas la grille)
            <div className="mt-3 flex items-center justify-center">
              <div
                className="rounded-xl px-4 py-3 text-center text-xs font-bold shadow-[0_0_18px_rgba(0,0,0,0.5)] border inline-block"
                style={{
                  borderColor: controlsConfig.autoSpin.color,
                  backgroundColor: `${controlsConfig.bar.backgroundColor}F2`,
                  color: controlsConfig.autoSpin.color,
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>🎉</span>
                  <span>TOURS GRATUITS DÉCLENCHÉS !</span>
                </div>
                {freeSpinsRemaining > 0 && (
                  <div className="mt-1 text-[11px] font-medium">
                    {freeSpinsRemaining} tours restants
                  </div>
                )}
                {freeSpinsTotalWin > 0 && (
                  <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                    Gain total bonus:&nbsp;
                    <span className="font-semibold" style={{ color: controlsConfig.autoSpin.color }}>
                      {freeSpinsTotalWin.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Espace réservé pour éviter que la grille bouge quand le gain apparaît/disparaît */}
        <div
          className={cn(
            "min-h-[4rem] flex items-center justify-center",
            shouldUseMobileFrame ? "mt-4" : "mt-1 mb-3"
          )}
        >
          {totalWin > 0 && (
            <div className="text-center animate-scale-in">
              <p
                className="text-2xl font-black drop-shadow-md"
                style={{ color: controlsConfig.autoSpin.color }}
              >
                GAIN: {totalWin.toFixed(1)}x
              </p>
              <p className="text-sm font-medium text-foreground">
                ${(totalWin * bet).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slot Control Bar */}
      <div 
        className={cn(
          "backdrop-blur-md z-10 transition-all origin-bottom",
          controlsConfig.bar.position === "floating"
            ? "absolute bottom-3 left-2 right-2"
            : controlsConfig.bar.position === "top"
              ? "border-b"
              : "border-t"
        )}
        style={{
          backgroundColor: `${controlsConfig.bar.backgroundColor}${Math.round(controlsConfig.bar.opacity * 2.55).toString(16).padStart(2, '0')}`,
          borderColor: controlsConfig.bar.border !== "none" ? controlsConfig.bar.borderColor : "transparent",
          borderWidth: controlsConfig.bar.border === "thin" ? "1px" : controlsConfig.bar.border === "glow" ? "2px" : "0",
          boxShadow: controlsConfig.bar.border === "glow" ? `0 0 20px ${controlsConfig.bar.borderColor}` : "none",
          borderRadius: `${controlsConfig.bar.borderRadius}px`,
        }}
      >
        {(() => {
          // Fallback de layout en mobile: on privilégie le layout intégré, mais
          // sans modifier la config d'origine.
          const baseLayout = controlsConfig.layout;
          const effectiveLayout =
            currentUxMode === "mobile" && baseLayout === "separated"
              ? "integrated"
              : baseLayout;

          return (
            <>
        {effectiveLayout === "integrated" && (
          <IntegratedLayout 
            spinning={spinning}
            balance={displayBalance}
            bet={bet}
            setBet={setBet}
            spin={spin}
            turboMode={turboMode}
            setTurboMode={setTurboMode}
            buyBonus={requestBuyBonus}
            stats={stats}
            rtp={rtp}
            showPaylines={showPaylines}
            setShowPaylines={setShowPaylines}
            config={config}
            controlsConfig={controlsConfig}
            autoSpinCount={autoSpinCount}
            startAutoSpin={startAutoSpin}
            stopAutoSpin={stopAutoSpin}
            showStats={!locked}
            masterMuted={masterMuted}
            toggleMute={() => setMasterMuted((v) => !v)}
            compact={shouldUseMobileFrame}
          />
        )}
        {effectiveLayout === "separated" && (
          <SeparatedLayout 
            spinning={spinning}
            balance={displayBalance}
            bet={bet}
            setBet={setBet}
            spin={spin}
            turboMode={turboMode}
            setTurboMode={setTurboMode}
            buyBonus={requestBuyBonus}
            stats={stats}
            rtp={rtp}
            showPaylines={showPaylines}
            setShowPaylines={setShowPaylines}
            config={config}
            controlsConfig={controlsConfig}
            autoSpinCount={autoSpinCount}
            startAutoSpin={startAutoSpin}
            stopAutoSpin={stopAutoSpin}
            showStats={!locked}
            masterMuted={masterMuted}
            toggleMute={() => setMasterMuted((v) => !v)}
          />
        )}
        {effectiveLayout === "minimal" && (
          <MinimalLayout 
            spinning={spinning}
            balance={displayBalance}
            bet={bet}
            setBet={setBet}
            spin={spin}
            turboMode={turboMode}
            setTurboMode={setTurboMode}
            config={config}
            controlsConfig={controlsConfig}
            autoSpinCount={autoSpinCount}
            startAutoSpin={startAutoSpin}
            stopAutoSpin={stopAutoSpin}
            masterMuted={masterMuted}
            toggleMute={() => setMasterMuted((v) => !v)}
          />
        )}
            </>
          );
        })()}
      </div>

      {/* Confirmation d'achat Bonus Buy (preview + export), harmonisée avec l'UX choisie */}
      {config.freeSpins.enabled && showBonusConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          {controlsConfig.layout === "integrated" && (
            <div className="w-full max-w-md mb-28 lg:mb-32 flex justify-center">
              <div
                className="flex-1 rounded-xl border shadow-xl text-left"
                style={{
                  backgroundColor: controlsConfig.bar.backgroundColor,
                  borderColor: controlsConfig.bar.borderColor,
                }}
              >
                <div className="px-4 py-3 border-b border-border/40 text-xs font-semibold flex items-center justify-between">
                  <span style={{ color: controlsConfig.autoSpin.color }}>Confirmer l'achat du Bonus</span>
                  <span className="font-mono" style={{ color: controlsConfig.autoSpin.color }}>
                    ${(bet * config.freeSpins.costMultiplier).toFixed(2)}
                  </span>
                </div>
                <div className="px-4 py-3 text-[11px] text-muted-foreground">
                  Cette action déclenche directement les free spins. Vérifiez bien votre mise avant de confirmer.
                </div>
                <div className="px-4 py-3 flex justify-end gap-2 bg-background/40 rounded-b-xl">
                  <button
                    onClick={() => setShowBonusConfirm(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground bg-background/80 hover:bg-background"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      executeBuyBonus();
                      setShowBonusConfirm(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                    style={{ backgroundColor: controlsConfig.autoSpin.color, color: "#0f172a" }}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}

          {controlsConfig.layout === "separated" && (
            <div className="w-full max-w-lg mb-32 flex justify-end">
              <div
                className="w-72 rounded-xl bg-card border p-4 text-left shadow-lg"
                style={{ borderColor: controlsConfig.autoSpin.color, boxShadow: `0 0 20px ${controlsConfig.autoSpin.color}40` }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: controlsConfig.autoSpin.color }}>
                  Acheter le Bonus ?
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Coût:{" "}
                  <span className="font-bold" style={{ color: controlsConfig.autoSpin.color }}>
                    ${(bet * config.freeSpins.costMultiplier).toFixed(2)}
                  </span>
                  . Cette action ne peut pas être annulée une fois confirmée.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowBonusConfirm(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground bg-background/80 hover:bg-background"
                  >
                    Non
                  </button>
                  <button
                    onClick={() => {
                      executeBuyBonus();
                      setShowBonusConfirm(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                    style={{ backgroundColor: controlsConfig.autoSpin.color, color: "#0f172a" }}
                  >
                    Oui, acheter
                  </button>
                </div>
              </div>
            </div>
          )}

          {controlsConfig.layout === "minimal" && (
            <div className="w-full max-w-sm flex justify-center">
              <div className="rounded-2xl bg-card/95 border px-4 py-3 text-center shadow-lg"
                   style={{ borderColor: controlsConfig.autoSpin.color, boxShadow: `0 0 18px ${controlsConfig.autoSpin.color}40` }}>
                <div className="text-xs font-semibold mb-1" style={{ color: controlsConfig.autoSpin.color }}>
                  Bonus Buy
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Acheter le bonus pour{" "}
                  <span className="font-bold" style={{ color: controlsConfig.autoSpin.color }}>
                    ${(bet * config.freeSpins.costMultiplier).toFixed(2)}
                  </span>
                  ?
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => setShowBonusConfirm(false)}
                    className="px-3 py-1.5 rounded-full border border-border text-[11px] font-medium text-muted-foreground bg-background/80 hover:bg-background"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      executeBuyBonus();
                      setShowBonusConfirm(false);
                    }}
                    className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Symbol Asset Edit Dialog */}
      {!locked && (
        <Dialog open={!!editingSymbol} onOpenChange={(open) => { if (!open) { setEditingSymbol(null); setAssetSearch(""); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingSymbol && (
                  <span
                    className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold border"
                    style={{
                      backgroundColor: editingSymbol.color + "30",
                      color: editingSymbol.color,
                      borderColor: editingSymbol.color + "50",
                    }}
                  >
                    {editingSymbol.name}
                  </span>
                )}
                Changer l'asset de {editingSymbol?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {/* Current asset */}
              {editingSymbol && (() => {
                const ac: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
                const currentUrl = ac.symbolAssets[editingSymbol.id];
                return currentUrl ? (
                  <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card/50">
                    <img src={currentUrl} alt={editingSymbol.name} className="w-12 h-12 rounded object-contain bg-muted/50" />
                    <span className="text-xs text-foreground flex-1">Asset actuel</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        const ac: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
                        updateConfig({ assetsConfig: { ...ac, symbolAssets: { ...ac.symbolAssets, [editingSymbol.id]: null } } } as any);
                        setEditingSymbol(null);
                      }}
                    >
                      <X className="h-3 w-3 mr-1" /> Retirer
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-2">Aucun asset assigné</p>
                );
              })()}

              {/* Upload custom file */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-9"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".png,.jpg,.jpeg,.gif,.svg,.webp";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { alert("Fichier trop volumineux (max 2MB)"); return; }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (editingSymbol) {
                          const ac: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
                          updateConfig({ assetsConfig: { ...ac, symbolAssets: { ...ac.symbolAssets, [editingSymbol.id]: reader.result as string } } } as any);
                          setEditingSymbol(null);
                          setAssetSearch("");
                        }
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Importer un fichier
                </Button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Asset grid */}
              <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {CURATED_ASSETS
                  .filter((a) => a.category === "symbols")
                  .filter((a) => !assetSearch || a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(assetSearch.toLowerCase())))
                  .map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        if (editingSymbol) {
                          const ac: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
                          updateConfig({ assetsConfig: { ...ac, symbolAssets: { ...ac.symbolAssets, [editingSymbol.id]: asset.url } } } as any);
                          setEditingSymbol(null);
                          setAssetSearch("");
                        }
                      }}
                      className="rounded-lg border border-border bg-card p-1.5 hover:border-primary hover:bg-primary/10 transition-all"
                    >
                      <div className="aspect-square rounded-md bg-muted/50 flex items-center justify-center overflow-hidden">
                        <img
                          src={asset.thumbnailUrl || asset.url}
                          alt={asset.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-[9px] font-medium text-foreground truncate mt-1 text-center">{asset.name}</p>
                    </button>
                  ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Background Edit Dialog */}
      {!locked && (
        <Dialog open={editingBackground} onOpenChange={(open) => { if (!open) { setEditingBackground(false); setAssetSearch(""); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                🖼️ Changer le Background
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {/* Current background */}
              {config.backgroundUrl ? (
                <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card/50">
                  <img src={config.backgroundUrl} alt="Background" className="w-16 h-10 rounded object-cover bg-muted/50" />
                  <span className="text-xs text-foreground flex-1">Background actuel</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      updateConfig({ backgroundUrl: "", backgroundType: undefined } as any);
                      const ac: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
                      updateConfig({ assetsConfig: { ...ac, backgroundAsset: null } } as any);
                      setEditingBackground(false);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" /> Retirer
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-2">Aucun background assigné</p>
              )}

              {/* Upload + Search */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-9"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".png,.jpg,.jpeg,.gif,.svg,.webp";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { alert("Fichier trop volumineux (max 5MB)"); return; }
                      const reader = new FileReader();
                      reader.onload = () => {
                        const url = reader.result as string;
                        updateConfig({ backgroundUrl: url, backgroundType: "image" } as any);
                        const ac: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
                        updateConfig({ assetsConfig: { ...ac, backgroundAsset: url } } as any);
                        setEditingBackground(false);
                        setAssetSearch("");
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Importer un fichier
                </Button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Background asset grid */}
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {CURATED_ASSETS
                  .filter((a) => a.category === "backgrounds")
                  .filter((a) => !assetSearch || a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(assetSearch.toLowerCase())))
                  .map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        updateConfig({ backgroundUrl: asset.url, backgroundType: "image" } as any);
                        const ac: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
                        updateConfig({ assetsConfig: { ...ac, backgroundAsset: asset.url } } as any);
                        setEditingBackground(false);
                        setAssetSearch("");
                      }}
                      className="rounded-lg border border-border bg-card p-1.5 hover:border-primary hover:bg-primary/10 transition-all"
                    >
                      <div className="aspect-video rounded-md bg-muted/50 flex items-center justify-center overflow-hidden">
                        <img
                          src={asset.thumbnailUrl || asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-[9px] font-medium text-foreground truncate mt-1 text-center">{asset.name}</p>
                    </button>
                  ))}
                {CURATED_ASSETS.filter(a => a.category === "backgrounds").length === 0 && (
                  <p className="col-span-3 text-xs text-muted-foreground text-center py-6">
                    Aucun background dans la bibliothèque. Importez le vôtre !
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  );
}


function PaylineOverlay({ numReels, numRows, numLines, visualEffects }: { numReels: number; numRows: number; numLines: number; visualEffects: VisualEffectsConfig }) {
  const lines = generatePaylines(numReels, numRows, numLines).slice(0, 5); // Show first 5
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      {lines.map((line, i) => {
        const pathData = line.map(([col, row], idx) => {
          const x = (col + 0.5) * (100 / numReels);
          const y = (row + 0.5) * (100 / numRows);
          return `${idx === 0 ? "M" : "L"} ${x}% ${y}%`;
        }).join(" ");
        return (
          <path
            key={i}
            d={pathData}
            stroke={visualEffects.winLineColor}
            strokeWidth={visualEffects.winLineWidth}
            fill="none"
            opacity="0.7"
            style={{ filter: `drop-shadow(0 0 4px ${visualEffects.winLineColor})` }}
          />
        );
      })}
    </svg>
  );
}

function generatePaylines(numReels: number, numRows: number, numLines: number): [number, number][][] {
  const lines: [number, number][][] = [];
  // Straight lines
  for (let row = 0; row < Math.min(numRows, numLines); row++) {
    lines.push(Array.from({ length: numReels }, (_, col) => [col, row]));
  }
  // Zigzag patterns
  if (numRows >= 3 && lines.length < numLines) {
    lines.push(Array.from({ length: numReels }, (_, col) => [col, col % 2 === 0 ? 0 : 2]));
  }
  if (numRows >= 3 && lines.length < numLines) {
    lines.push(Array.from({ length: numReels }, (_, col) => [col, col % 2 === 0 ? 2 : 0]));
  }
  return lines.slice(0, numLines);
}

function findCluster(
  board: string[][],
  startCol: number,
  startRow: number,
  targetSym: string,
  wildSym?: string
): [number, number][] {
  const visited = new Set<string>();
  const cluster: [number, number][] = [];
  const queue: [number, number][] = [[startCol, startRow]];

  while (queue.length > 0) {
    const [col, row] = queue.shift()!;
    const key = `${col},${row}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const sym = board[col]?.[row];
    if (sym !== targetSym && sym !== wildSym) continue;

    cluster.push([col, row]);

    // Check adjacent (up, down, left, right)
    [[col - 1, row], [col + 1, row], [col, row - 1], [col, row + 1]].forEach(([c, r]) => {
      if (c >= 0 && c < board.length && r >= 0 && r < board[0].length && !visited.has(`${c},${r}`)) {
        queue.push([c, r]);
      }
    });
  }

  return cluster;
}
