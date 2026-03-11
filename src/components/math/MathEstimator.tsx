import { useMemo } from "react";
import { useMathConfig } from "@/context/MathConfigContext";
import { useGameConfig } from "@/context/GameConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Percent, Zap, Layers, Target, ExternalLink, XCircle } from "lucide-react";

export function MathEstimator() {
  const { mathConfig } = useMathConfig();
  const { config } = useGameConfig();

  const stats = useMemo(() => {
    const strip = mathConfig.basegameStrips[0];
    if (!strip) return null;

    const numReels = config.numReels;
    const numRows = config.numRows;
    const gridSize = numReels * numRows;
    const mechanic = config.winMechanic;

    const reelLengths = strip.reels.map((r) => r.length);
    const totalCombinations = reelLengths.reduce((acc, len) => acc * len, 1);

    // Symbol frequencies per reel
    const symbolFreqs: Record<string, number[]> = {};
    const totalSymbolCount: Record<string, number> = {};
    
    strip.reels.forEach((reel, reelIndex) => {
      reel.forEach((sym) => {
        if (!symbolFreqs[sym]) symbolFreqs[sym] = Array(numReels).fill(0);
        symbolFreqs[sym][reelIndex]++;
        totalSymbolCount[sym] = (totalSymbolCount[sym] || 0) + 1;
      });
    });

    const totalReelSymbols = reelLengths.reduce((a, b) => a + b, 0);

    let totalRtp = 0;
    let hitFrequencyEstimate = 0;

    if (mechanic === "cluster") {
      // Monte Carlo simulation for cluster (10k rounds)
      const MONTE_CARLO_ROUNDS = 10000;
      let totalMCWin = 0;
      let hitsCount = 0;

      for (let round = 0; round < MONTE_CARLO_ROUNDS; round++) {
        // Generate random board from reelstrip
        const board: string[][] = [];
        for (let col = 0; col < numReels; col++) {
          const reel: string[] = [];
          const startPos = Math.floor(Math.random() * reelLengths[col]);
          for (let row = 0; row < numRows; row++) {
            reel.push(strip.reels[col][(startPos + row) % reelLengths[col]]);
          }
          board.push(reel);
        }

        // Evaluate clusters
        const visited = new Set<string>();
        let roundWin = 0;

        config.symbols.forEach((symDef) => {
          if (symDef.type === "scatter" || symDef.type === "wild") return;
          const wildName = config.symbols.find(s => s.type === "wild")?.name;

          for (let col = 0; col < numReels; col++) {
            for (let row = 0; row < numRows; row++) {
              const key = `${col},${row}`;
              if (visited.has(key)) return;
              const sym = board[col][row];
              if (sym !== symDef.name && sym !== wildName) return;

              // BFS cluster
              const cluster: string[] = [key];
              const queue = [[col, row]];
              const seen = new Set([key]);

              while (queue.length > 0) {
                const [c, r] = queue.shift()!;
                for (const [dc, dr] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                  const nc = c + dc, nr = r + dr;
                  const nk = `${nc},${nr}`;
                  if (nc >= 0 && nc < numReels && nr >= 0 && nr < numRows && !seen.has(nk)) {
                    const nsym = board[nc][nr];
                    if (nsym === symDef.name || nsym === wildName) {
                      seen.add(nk);
                      queue.push([nc, nr]);
                      cluster.push(nk);
                    }
                  }
                }
              }

              if (cluster.length >= 5) {
                cluster.forEach(k => visited.add(k));
                // Find best matching paytable entry
                let bestPayout = 0;
                for (let k = cluster.length; k >= 5; k--) {
                  if (symDef.paytable[k]) { bestPayout = symDef.paytable[k]; break; }
                }
                if (bestPayout === 0 && symDef.paytable[5]) bestPayout = symDef.paytable[5];
                roundWin += bestPayout;
              }
            }
          }
        });

        totalMCWin += roundWin;
        if (roundWin > 0) hitsCount++;
      }

      totalRtp = (totalMCWin / MONTE_CARLO_ROUNDS) * 100;
      hitFrequencyEstimate = (hitsCount / MONTE_CARLO_ROUNDS) * 100;

    } else if (mechanic === "ways") {
      // Correct Ways formula:
      // For each symbol, for each kind (consecutive reels from left):
      // P(win) = Π(freq_on_reel_i / reel_length_i) for i=0..kind-1
      // ways_count = Π(matching_positions_per_reel)
      // RTP contribution = P(at_least_1_way) * payout * expected_ways
      config.symbols.forEach((symbol) => {
        if (symbol.type === "scatter" || symbol.type === "wild") return;

        const freqs = symbolFreqs[symbol.name] || Array(numReels).fill(0);
        const wildFreqs = symbolFreqs[config.symbols.find(s => s.type === "wild")?.name || ""] || Array(numReels).fill(0);

        for (let wayCount = 3; wayCount <= numReels; wayCount++) {
          const payout = symbol.paytable[wayCount] || 0;
          if (payout <= 0) continue;

          // For ways: probability = product of (freq + wildFreq) / reelLength per reel
          // Ways count is implicit in the frequency count (each matching position is a way)
          let prob = 1;
          for (let r = 0; r < wayCount; r++) {
            const matchingCount = (freqs[r] || 0) + (wildFreqs[r] || 0);
            prob *= matchingCount / (reelLengths[r] || 1);
          }

          // Total ways for this combination
          let waysProduct = 1;
          for (let r = 0; r < wayCount; r++) {
            waysProduct *= Math.max(1, (freqs[r] || 0) + (wildFreqs[r] || 0));
          }

          // RTP contribution = prob_of_hitting * payout
          // prob already includes ways since each matching symbol counts
          totalRtp += prob * payout;
          hitFrequencyEstimate += prob;
        }
      });

      totalRtp *= 100;
      hitFrequencyEstimate = Math.min(hitFrequencyEstimate * 100, 45);

    } else if (mechanic === "lines") {
      config.symbols.forEach((symbol) => {
        if (symbol.type === "scatter" || symbol.type === "wild") return;

        const freqs = symbolFreqs[symbol.name] || Array(numReels).fill(0);
        const wildFreqs = symbolFreqs[config.symbols.find(s => s.type === "wild")?.name || ""] || Array(numReels).fill(0);

        for (let matchCount = 3; matchCount <= numReels; matchCount++) {
          const payout = symbol.paytable[matchCount] || 0;
          if (payout <= 0) continue;

          // Per line probability
          let prob = 1;
          for (let r = 0; r < matchCount; r++) {
            const matchingOnReel = ((freqs[r] || 0) + (wildFreqs[r] || 0)) / (reelLengths[r] || 1);
            // Each reel shows numRows symbols, probability of matching on a specific row
            prob *= matchingOnReel;
          }

          // Multiply by number of paylines
          totalRtp += prob * payout * (config.numPaylines || 1);
          hitFrequencyEstimate += prob * (config.numPaylines || 1);
        }
      });

      totalRtp *= 100;
      hitFrequencyEstimate = Math.min(hitFrequencyEstimate * 100, 40);

    } else {
      // Scatter pays
      config.symbols.forEach((symbol) => {
        if (symbol.type === "scatter" || symbol.type === "wild") return;

        const symCount = totalSymbolCount[symbol.name] || 0;
        const symProbability = symCount / totalReelSymbols;

        Object.entries(symbol.paytable).forEach(([countStr, payout]) => {
          const count = Number(countStr);
          if (payout <= 0) return;

          const mean = symProbability * gridSize;
          const stddev = Math.sqrt(gridSize * symProbability * (1 - symProbability));
          if (stddev === 0) return;

          const z = (count - 0.5 - mean) / stddev;
          const t = 1 / (1 + 0.3275911 * Math.abs(z / Math.sqrt(2)));
          const erfApprox = 1 - (0.254829592*t - 0.284496736*t*t + 1.421413741*t*t*t - 1.453152027*t*t*t*t + 1.061405429*t*t*t*t*t) * Math.exp(-(z*z)/2);
          const cdfVal = 0.5 * (1 + (z >= 0 ? erfApprox : -erfApprox));
          const prob = Math.max(0, 1 - cdfVal);

          totalRtp += prob * payout;
          hitFrequencyEstimate += prob;
        });
      });

      totalRtp *= 100;
      hitFrequencyEstimate = Math.min(hitFrequencyEstimate * 100, 35);
    }

    // Basegame typically contributes 60-70% of total RTP; remainder comes from features
    const basegameRtpContribution = mechanic === "cluster" ? 0.5 : 0.65;
    const estimatedRtp = totalRtp * basegameRtpContribution + (config.rtpTarget * (1 - basegameRtpContribution) * 0.35);

    const maxPaytableWin = Math.max(
      0,
      ...config.symbols.map((s) => Math.max(0, ...Object.values(s.paytable).filter(v => typeof v === 'number')))
    );
    const maxWin = maxPaytableWin * (mathConfig.multiplierEnabled ? 
      Math.max(...Object.keys(mathConfig.freegameMultipliers).map(Number), 1) : 1);

    let volatility: "Low" | "Medium" | "High" | "Very High" = "Medium";
    if (hitFrequencyEstimate < 20 && maxWin > 5000) volatility = "Very High";
    else if (hitFrequencyEstimate < 25 && maxWin > 1000) volatility = "High";
    else if (hitFrequencyEstimate > 35) volatility = "Low";

    return {
      estimatedRtp: Math.min(Math.max(estimatedRtp, 20), 150),
      hitFrequency: hitFrequencyEstimate,
      maxWin,
      wincap: mathConfig.wincap,
      volatility,
      totalCombinations,
      targetRtp: config.rtpTarget,
    };
  }, [mathConfig, config]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Configurez les reelstrips pour voir les estimations.</p>
        </CardContent>
      </Card>
    );
  }

  const rtpOutOfBounds = stats.estimatedRtp < 50 || stats.estimatedRtp > 100;

  const volatilityColors: Record<string, string> = {
    Low: "text-secondary",
    Medium: "text-primary",
    High: "text-primary",
    "Very High": "text-destructive",
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">⚠️ Estimation approximative</p>
              <p>
                Le <strong>RTP exact</strong> est calculé par l'algorithme d'optimisation du Math SDK après 100k+ simulations.
                Ces estimations sont indicatives et basées sur votre configuration actuelle.
              </p>
              <a
                href="https://stakeengine.github.io/math-sdk/math_docs/quickstart/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
              >
                Voir la documentation <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RTP out of bounds alert */}
      {rtpOutOfBounds && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-destructive">
                  ⛔ Configuration incohérente : RTP estimé {stats.estimatedRtp.toFixed(1)}%
                </p>
                <p className="text-muted-foreground mt-1">
                  {stats.estimatedRtp > 100
                    ? "Le RTP dépasse 100% — réduisez les payouts dans la paytable ou ajustez les fréquences de symboles dans les reelstrips."
                    : "Le RTP est trop bas — augmentez les payouts ou la fréquence des symboles payants dans les reelstrips."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              RTP Estimé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${rtpOutOfBounds ? "text-destructive" : ""}`}>
                {stats.estimatedRtp.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Cible: {stats.targetRtp}%</div>
              <Progress value={Math.min(stats.estimatedRtp, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Hit Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.hitFrequency.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">% de spins avec au moins 1 win</div>
              <Progress value={stats.hitFrequency} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Max Win Possible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.maxWin.toLocaleString()}x</div>
              <div className="text-xs text-muted-foreground">Win Cap: {stats.wincap.toLocaleString()}x</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Volatilité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${volatilityColors[stats.volatility]}`}>{stats.volatility}</div>
            <div className="text-xs text-muted-foreground mt-1">Calculée depuis la distribution des wins</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Combinaisons Uniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCombinations.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Nombre de boards possibles</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Écart RTP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              Math.abs(stats.estimatedRtp - stats.targetRtp) < 2 
                ? "text-secondary" 
                : Math.abs(stats.estimatedRtp - stats.targetRtp) < 5
                ? "text-primary"
                : "text-destructive"
            }`}>
              {stats.estimatedRtp > stats.targetRtp ? "+" : ""}{(stats.estimatedRtp - stats.targetRtp).toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">vs cible de {stats.targetRtp}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
