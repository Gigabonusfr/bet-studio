/**
 * Maths alignées templates officiels Stake Engine (0_0_lines, 0_0_ways, 0_0_cluster, 0_0_scatter, 0_0_expwilds).
 * Réf. https://stakeengine.github.io/math-sdk/math_docs/sample_section/sample_games/
 * SymbolId (aligné front): 0-4 H1-H5, 5-8 L1-L4, 9 WILD, 10 SCATTER, 11 BONUS.
 * Scatter pay groups (sample 0_0_scatter): (8-8), (9-10), (11-13), (14-36). Lines/Ways/Cluster : sample readmes.
 */
const PAYTABLE_LINES_HIGH = { 3: 1.5, 4: 4, 5: 10 };
const PAYTABLE_LINES_LOW = { 3: 0.8, 4: 2, 5: 5 };
const PAYTABLE_WAYS_HIGH = { 3: 1, 4: 3, 5: 8 };
const PAYTABLE_WAYS_LOW = { 3: 0.5, 4: 1.5, 5: 4 };
const PAYTABLE_CLUSTER_HIGH = { 3: 0.8, 4: 2.5, 5: 6, 6: 12, 7: 20 };
const PAYTABLE_CLUSTER_LOW = { 3: 0.4, 4: 1.2, 5: 3, 6: 6, 7: 10 };
// Scatter : groupes (8-8), (9-10), (11-13), (14-36). Facteur 0.148 → RTP preview ~97% (simulate-rtp 100k base + 100k bonus).
const PAYTABLE_SCATTER_SCALE = 0.148;
const PAYTABLE_SCATTER_HIGH = {};
const PAYTABLE_SCATTER_LOW = {};
[3, 4, 5, 6, 7].forEach((n, i) => {
  PAYTABLE_SCATTER_HIGH[n] = ([0.2, 0.5, 1, 1.5, 2.5][i] || 0) * PAYTABLE_SCATTER_SCALE;
  PAYTABLE_SCATTER_LOW[n] = ([0.1, 0.25, 0.5, 0.75, 1.2][i] || 0) * PAYTABLE_SCATTER_SCALE;
});
PAYTABLE_SCATTER_HIGH[8] = 4 * PAYTABLE_SCATTER_SCALE;
PAYTABLE_SCATTER_LOW[8] = 2 * PAYTABLE_SCATTER_SCALE;
[9, 10].forEach(n => { PAYTABLE_SCATTER_HIGH[n] = 6 * PAYTABLE_SCATTER_SCALE; PAYTABLE_SCATTER_LOW[n] = 3 * PAYTABLE_SCATTER_SCALE; });
[11, 12, 13].forEach(n => { PAYTABLE_SCATTER_HIGH[n] = 10 * PAYTABLE_SCATTER_SCALE; PAYTABLE_SCATTER_LOW[n] = 5 * PAYTABLE_SCATTER_SCALE; });
for (let n = 14; n <= 36; n++) {
  PAYTABLE_SCATTER_HIGH[n] = 18 * PAYTABLE_SCATTER_SCALE;
  PAYTABLE_SCATTER_LOW[n] = 9 * PAYTABLE_SCATTER_SCALE;
}

const GAMES = {
  "0_0_lines": { grid: [5, 3], mechanic: "lines", numPaylines: 20, symbols: 12 },
  "0_0_ways": { grid: [5, 3], mechanic: "ways", numPaylines: 0, symbols: 12 },
  "0_0_cluster": { grid: [7, 7], mechanic: "cluster", numPaylines: 0, symbols: 12 },
  "0_0_scatter": { grid: [6, 5], mechanic: "scatter", numPaylines: 0, symbols: 12 },
  "0_0_expwilds": { grid: [5, 5], mechanic: "lines", numPaylines: 15, symbols: 12 },
};

// Poids par symbole (0-11) pour approcher RTP ~97%. BONUS rare pour limiter explosion du multiplicateur (tunable via npm run simulate-rtp).
const DEFAULT_WEIGHTS = [
  8, 8, 8, 8, 8,   // H1-H5
  14, 14, 14, 14,  // L1-L4
  6, 4, 1,         // WILD(9), SCATTER(10), BONUS(11)
];

function pickWeighted(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function generateBoard(numReels, numRows, symbols = 12, weights = DEFAULT_WEIGHTS) {
  const w = weights.slice(0, symbols);
  while (w.length < symbols) w.push(1);
  const board = [];
  for (let col = 0; col < numReels; col++) {
    const reel = [];
    for (let row = 0; row < numRows; row++) {
      reel.push(pickWeighted(w));
    }
    board.push(reel);
  }
  return board;
}

// Paylines pour 5x3 (20) ou 5x5 (15)
function getPaylines(numReels, numRows, numPaylines) {
  const lines = [];
  if (numRows === 3 && numReels === 5) {
    const all20 = [
      [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
      [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]], [[0, 1], [1, 2], [2, 2], [3, 2], [4, 1]], [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]],
      [[0, 2], [1, 1], [2, 1], [3, 1], [4, 2]], [[0, 0], [1, 0], [2, 1], [3, 2], [4, 2]], [[0, 2], [1, 2], [2, 1], [3, 0], [4, 0]],
      [[0, 1], [1, 1], [2, 0], [3, 1], [4, 1]], [[0, 1], [1, 1], [2, 2], [3, 1], [4, 1]], [[0, 0], [1, 0], [2, 0], [3, 1], [4, 2]],
      [[0, 2], [1, 2], [2, 2], [3, 1], [4, 0]], [[0, 1], [1, 0], [2, 1], [3, 0], [4, 1]], [[0, 1], [1, 2], [2, 1], [3, 2], [4, 1]],
      [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]], [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]], [[0, 0], [1, 0], [2, 1], [3, 0], [4, 0]],
      [[0, 2], [1, 2], [2, 1], [3, 2], [4, 2]], [[0, 1], [1, 0], [2, 0], [3, 1], [4, 2]],
    ];
    return all20.slice(0, Math.min(numPaylines || 20, 20));
  }
  if (numRows === 5 && numReels === 5) {
    for (let r = 0; r < 5; r++) lines.push([[0, r], [1, r], [2, r], [3, r], [4, r]]);
    for (let r = 0; r < 5; r++) lines.push([[0, r], [1, (r + 1) % 5], [2, (r + 2) % 5], [3, (r + 3) % 5], [4, (r + 4) % 5]]);
    for (let r = 0; r < 5; r++) lines.push([[0, (r + 4) % 5], [1, (r + 3) % 5], [2, (r + 2) % 5], [3, (r + 1) % 5], [4, r]]);
    return lines.slice(0, Math.min(numPaylines || 15, 15));
  }
  return lines;
}

function evaluateLines(board, numPaylines) {
  const [numReels, numRows] = [board.length, board[0].length];
  const paylines = getPaylines(numReels, numRows, numPaylines);
  const WILD = 9;
  let total = 0;
  const wins = [];
  const highIds = [0, 1, 2, 3, 4];
  const payHigh = numReels === 5 && numRows === 3 ? PAYTABLE_LINES_HIGH : PAYTABLE_LINES_HIGH;
  const payLow = numReels === 5 && numRows === 3 ? PAYTABLE_LINES_LOW : PAYTABLE_LINES_LOW;

  for (const line of paylines) {
    const symbols = line.map(([c, r]) => board[c][r]);
    for (let len = numReels; len >= 3; len--) {
      const slice = symbols.slice(0, len);
      const first = slice[0];
      if (first === WILD) continue;
      const isHigh = highIds.includes(first);
      const pay = isHigh ? payHigh : payLow;
      if (!pay[len]) continue;
      const allMatch = slice.every(s => s === first || s === WILD);
      if (allMatch) {
        const positions = line.slice(0, len).map(([c, r]) => [c, r]);
        total += pay[len];
        wins.push({ symbolId: first, multiplier: pay[len], positions });
        break;
      }
    }
  }
  return { total, wins };
}

function evaluateWays(board) {
  const numReels = board.length;
  const numRows = board[0].length;
  const WILD = 9;
  const payHigh = PAYTABLE_WAYS_HIGH;
  const payLow = PAYTABLE_WAYS_LOW;
  const highIds = [0, 1, 2, 3, 4];
  let total = 0;
  const wins = [];

  for (let symId = 0; symId <= 8; symId++) {
    if (symId === 9) continue;
    let consecutive = 0;
    const positions = [];
    for (let c = 0; c < numReels; c++) {
      let found = false;
      for (let r = 0; r < numRows; r++) {
        if (board[c][r] === symId || board[c][r] === WILD) {
          consecutive++;
          positions.push([c, r]);
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    if (consecutive >= 3) {
      const isHigh = highIds.includes(symId);
      const pay = isHigh ? payHigh : payLow;
      const mult = pay[consecutive] || 0;
      if (mult > 0) {
        total += mult;
        wins.push({ symbolId: symId, multiplier: mult, positions });
      }
    }
  }
  return { total, wins };
}

function findCluster(board, col, row, symId, visited, WILD = 9) {
  const key = `${col},${row}`;
  if (visited.has(key)) return [];
  const numReels = board.length;
  const numRows = board[0].length;
  const cell = board[col]?.[row];
  if (cell === undefined || (cell !== symId && cell !== WILD)) return [];
  visited.add(key);
  let positions = [[col, row]];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dc, dr] of dirs) {
    const nc = col + dc, nr = row + dr;
    if (nc >= 0 && nc < numReels && nr >= 0 && nr < numRows) {
      positions = positions.concat(findCluster(board, nc, nr, symId, visited, WILD));
    }
  }
  return positions;
}

function evaluateCluster(board) {
  const visited = new Set();
  const WILD = 9;
  const highIds = [0, 1, 2, 3, 4];
  let total = 0;
  const wins = [];

  for (let symId = 0; symId <= 8; symId++) {
    if (symId === 9) continue;
    for (let c = 0; c < board.length; c++) {
      for (let r = 0; r < board[0].length; r++) {
        const cluster = findCluster(board, c, r, symId, visited, WILD);
        if (cluster.length >= 3) {
          const isHigh = highIds.includes(symId);
          const pay = isHigh ? PAYTABLE_CLUSTER_HIGH : PAYTABLE_CLUSTER_LOW;
          const len = Math.min(cluster.length, 7);
          const mult = pay[len] || 0;
          if (mult > 0) {
            total += mult;
            wins.push({ symbolId: symId, multiplier: mult, positions: cluster });
          }
        }
      }
    }
  }
  return { total, wins };
}

// Valeurs multiplicateur BONUS par cellule (aligné sample Scatter-Pays : ajoutées au global avant évaluation finale)
const BONUS_MULTIPLIER_VALUES = [2, 5, 10];

function evaluateScatter(board) {
  const highIds = [0, 1, 2, 3, 4];
  const WILD = 9;
  const BONUS = 11;
  let total = 0;
  const wins = [];

  for (let symId = 0; symId <= 8; symId++) {
    if (symId === 9) continue;
    let count = 0;
    const positions = [];
    for (let c = 0; c < board.length; c++) {
      for (let r = 0; r < board[0].length; r++) {
        if (board[c][r] === symId || board[c][r] === WILD) {
          count++;
          positions.push([c, r]);
        }
      }
    }
    // Sample 0_0_scatter : payouts groupés (8-8), (9-10), (11-13), (14-36). Doc scatter_info : typiquement min 8 symboles.
    if (count >= 8) {
      const isHigh = highIds.includes(symId);
      const pay = isHigh ? PAYTABLE_SCATTER_HIGH : PAYTABLE_SCATTER_LOW;
      let mult = 0;
      for (let k = count; k >= 8 && !mult; k--) mult = pay[k] || 0;
      if (mult > 0) {
        total += mult;
        wins.push({ symbolId: symId, multiplier: mult, positions });
      }
    }
  }
  // Multiplicateurs BONUS : valeur X2/X5/X10 par cellule, ajoutées au global (doc sample : "added to the global multiplier before the final evaluation")
  const bonusCellMultipliers = {};
  let bonusSum = 0;
  for (let c = 0; c < board.length; c++) {
    for (let r = 0; r < board[0].length; r++) {
      if (board[c][r] === BONUS) {
        const val = BONUS_MULTIPLIER_VALUES[Math.floor(Math.random() * BONUS_MULTIPLIER_VALUES.length)];
        bonusCellMultipliers[`${c},${r}`] = val;
        bonusSum += val;
      }
    }
  }
  // Cap du multiplicateur global (1 + sum BONUS) pour garder un RTP preview raisonnable (~97% cible)
  if (bonusSum > 0 && total > 0) {
    const mult = Math.min(1 + bonusSum, 50);
    total *= mult;
  }
  return { total, wins, bonusCellMultipliers };
}

/**
 * @param {string} gameId
 * @param {number} bet - mise (entier 6 décimales, ex. 1_000_000 = 1.00)
 * @param {{ gameType?: 'basegame' | 'freegame' }} [options] - freegame = même évaluation que base en preview (tumble non implémenté)
 */
function runSpin(gameId, bet, options = {}) {
  const gameType = options.gameType || "basegame";
  const game = GAMES[gameId] || GAMES["0_0_scatter"];
  const [numReels, numRows] = game.grid;
  const betInt = Math.round(bet);
  const board = generateBoard(numReels, numRows, game.symbols);
  let result;
  if (game.mechanic === "lines") result = evaluateLines(board, game.numPaylines);
  else if (game.mechanic === "ways") result = evaluateWays(board);
  else if (game.mechanic === "cluster") result = evaluateCluster(board);
  else result = evaluateScatter(board);

  const winAmount = Math.round(result.total * betInt);
  const payoutMultiplier = result.total;

  const revealPayload = { type: "reveal", board, gameType };
  if (result.bonusCellMultipliers) revealPayload.bonusCellMultipliers = result.bonusCellMultipliers;

  const events = [
    revealPayload,
    { type: "winInfo", wins: result.wins.map(w => ({ symbolId: w.symbolId, multiplier: w.multiplier, positions: w.positions })) },
    { type: "setWin", amount: winAmount, gameType },
    { type: "finalWin", amount: winAmount, gameType },
  ];

  // Scatter Pays : bonus (free spins) déclenché avec 4 scatters ou plus (basegame uniquement).
  const SCATTER_SYMBOL_ID = 10;
  if (game.mechanic === "scatter" && gameType === "basegame") {
    let scatterCount = 0;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] === SCATTER_SYMBOL_ID) scatterCount++;
      }
    }
    if (scatterCount >= 4) {
      const freeSpinsAwarded = 2 * scatterCount;
      events.splice(1, 0, { type: "freeSpinsTrigger", scatterCount, freeSpinsAwarded });
    }
  }

  return { events, payoutMultiplier, winAmount };
}

module.exports = { GAMES, runSpin, generateBoard };
