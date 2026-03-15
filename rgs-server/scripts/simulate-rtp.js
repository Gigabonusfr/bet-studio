/**
 * Simulation Monte Carlo pour estimer le RTP du serveur RGS (preview).
 * Usage: node scripts/simulate-rtp.js [gameId] [numSpins]
 *       node scripts/simulate-rtp.js [gameId] [numBase] [numBonus]
 *
 * - Si 2 args: gameId, numSpins → 1 mode (base uniquement), RTP = moyenne des payoutMultiplier.
 * - Si 3 args: gameId, numBase, numBonus → 100k base + 100k bonus (ex. 100000 100000).
 *   Pour cost 1.0, RTP% = avg(payoutMultiplier) * 100.
 *   En bonus (freegame), preview utilise la même évaluation que base (tumble non implémenté).
 */

const { runSpin, GAMES } = require("../game-math.js");

const gameId = process.argv[2] || "0_0_scatter";
const arg3 = process.argv[3];
const arg4 = process.argv[4];

// Mode double (base + bonus) si 3 arguments numériques
const numBase = arg4 != null ? Math.min(Number(arg3) || 100_000, 500_000) : null;
const numBonus = arg4 != null ? Math.min(Number(arg4) || 100_000, 500_000) : null;
const singleModeSpins = arg4 == null ? Math.min(Number(arg3) || 50_000, 500_000) : null;

if (!GAMES[gameId]) {
  console.error("Unknown gameId:", gameId, "\nAvailable:", Object.keys(GAMES).join(", "));
  process.exit(1);
}

const bet = 1_000_000; // 1.00

function runSimulation(n, options) {
  let sumMult = 0;
  for (let i = 0; i < n; i++) {
    const { payoutMultiplier } = runSpin(gameId, bet, options);
    sumMult += payoutMultiplier;
  }
  return sumMult / n;
}

if (numBase != null && numBonus != null) {
  // 100k base + 100k bonus
  console.log("--- Simulation RTP (preview) ---");
  console.log("Game:", gameId);
  console.log("Base spins:", numBase, "| Bonus spins:", numBonus);
  const avgBase = runSimulation(numBase, { gameType: "basegame" });
  const avgBonus = runSimulation(numBonus, { gameType: "freegame" });
  const rtpBase = avgBase * 100;
  const rtpBonus = avgBonus * 100;
  console.log("");
  console.log("Basegame  (cost 1x): avg multiplier =", avgBase.toFixed(4), "=> RTP (est.) =", rtpBase.toFixed(2) + "%");
  console.log("Freegame  (preview): avg multiplier =", avgBonus.toFixed(4), "=> RTP (est.) =", rtpBonus.toFixed(2) + "%");
  console.log("");
  console.log("Note: Stake Engine attend des modes base + freegame séparés (books, lookUpTable).");
  console.log("Le freegame officiel a tumble + multiplicateur global; ce preview utilise la même évaluation.");
} else {
  // Mode simple (base uniquement)
  const avgMult = runSimulation(singleModeSpins, { gameType: "basegame" });
  const rtpPct = avgMult * 100;
  console.log("Game:", gameId);
  console.log("Spins:", singleModeSpins);
  console.log("Avg payoutMultiplier:", avgMult.toFixed(4));
  console.log("RTP (est.):", rtpPct.toFixed(2) + "%");
}
