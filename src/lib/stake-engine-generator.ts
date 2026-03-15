/**
 * Unified Stake Engine file generator
 * Produces game_config.py, gamestate.py, run.py, index.json, reelstrips CSV
 * 100% compatible with Stake Engine Math SDK
 */
import type { GameConfig } from "@/types/game-config";
import type { MathConfig } from "@/context/MathConfigContext";

// ═══════════════════════════════════════════════════════
// game_config.py
// ═══════════════════════════════════════════════════════

export function generateGameConfigPy(config: GameConfig, mathConfig: MathConfig): string {
  const paytableEntries = config.symbols
    .filter((s) => s.type !== "scatter" && s.type !== "wild")
    .flatMap((s) => {
      const entries: string[] = [];
      Object.entries(s.paytable).forEach(([count, payout]) => {
        if (payout > 0) {
          entries.push(`        (${count}, "${s.name}"): ${payout.toFixed(1)},`);
        }
      });
      return entries;
    })
    .join("\n");

  // Scatter pays: include scatter in paytable if scatter mechanic
  const scatterPayEntries = config.winMechanic === "scatter"
    ? config.symbols
        .filter((s) => s.type === "scatter")
        .flatMap((s) =>
          Object.entries(s.paytable)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => `        (${k}, "${s.name}"): ${v.toFixed(1)},`)
        )
        .join("\n")
    : "";

  const wildSymbols = config.symbols.filter((s) => s.type === "wild").map((s) => `"${s.name}"`);
  const scatterSymbols = config.symbols.filter((s) => s.type === "scatter").map((s) => `"${s.name}"`);

  const basegameTriggersSource =
    config.freeSpins.enabled && config.freeSpins.scatterAwards && Object.keys(config.freeSpins.scatterAwards).length > 0
      ? config.freeSpins.scatterAwards
      : mathConfig.freespinTriggers.basegame;
  const basegameTriggers = Object.entries(basegameTriggersSource)
    .map(([count, spins]) => `${count}: ${spins}`)
    .join(", ");
  const freegameTriggers = Object.entries(mathConfig.freespinTriggers.freegame)
    .map(([count, spins]) => `${count}: ${spins}`)
    .join(", ");

  const reelFiles = [
    ...mathConfig.basegameStrips.map((s) => `"${s.id}": "${s.id}.csv"`),
    ...mathConfig.freegameStrips.map((s) => `"${s.id}": "${s.id}.csv"`),
  ].join(", ");

  const basegameWeights = mathConfig.basegameStrips
    .map((s) => `"${s.id}": ${s.weight}`)
    .join(", ");
  const freegameWeights = mathConfig.freegameStrips
    .map((s) => `"${s.id}": ${s.weight}`)
    .join(", ");

  const basegameMultStr = Object.entries(mathConfig.basegameMultipliers)
    .map(([m, w]) => `${m}: ${w}`)
    .join(", ");
  const freegameMultStr = Object.entries(mathConfig.freegameMultipliers)
    .map(([m, w]) => `${m}: ${w}`)
    .join(", ");

  // Build special_symbols dict
  const specialSymbolsLines: string[] = [];
  if (wildSymbols.length > 0) specialSymbolsLines.push(`            "wild": [${wildSymbols.join(", ")}],`);
  if (scatterSymbols.length > 0) specialSymbolsLines.push(`            "scatter": [${scatterSymbols.join(", ")}],`);

  // Build freespin_triggers + anticipation_triggers (requis par le SDK board.py)
  const freespinTriggersBlock = config.freeSpins.enabled
    ? `
        # Freespin Triggers - scatter_count: free_spins_awarded
        self.freespin_triggers = {
            self.basegame_type: {${basegameTriggers}},
${config.freeSpins.retrigger ? `            self.freegame_type: {${freegameTriggers}},` : ""}
        }
        self.anticipation_triggers = {
            self.basegame_type: min(self.freespin_triggers[self.basegame_type].keys()) - 1,
            self.freegame_type: ${config.freeSpins.retrigger ? "min(self.freespin_triggers[self.freegame_type].keys()) - 1" : "0"},
        }`
    : "";

  // Build multiplier block
  const multiplierBlock = mathConfig.multiplierEnabled
    ? `
        # Multipliers - value: weight
        self.multiplier_values = {
            "basegame": {${basegameMultStr}},
            "freegame": {${freegameMultStr}},
        }`
    : "";

  // Build BetModes — reel_weights doit inclure freegame pour les distros base quand free spins (SDK attend reel_weights[gametype] en freegame)
  const baseDistributions = config.freeSpins.enabled
    ? `
                    Distribution(
                        criteria="0win",
                        quota=0.3,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {${basegameWeights}},
                                self.freegame_type: {${freegameWeights}},
                            },
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.6,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {${basegameWeights}},
                                self.freegame_type: {${freegameWeights}},
                            },
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=self.wincap,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {${basegameWeights}},
                                self.freegame_type: {${freegameWeights}},
                            },
                            "force_wincap": True,
                            "force_freegame": False,
                        },
                    ),`
    : `
                    Distribution(
                        criteria="basegame",
                        quota=1.0,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {${basegameWeights}},
                            },
                        },
                    ),`;

  const bonusBetMode = config.freeSpins.enabled
    ? `
            BetMode(
                name="${config.freeSpins.modeName}",
                cost=${config.freeSpins.costMultiplier.toFixed(1)},
                rtp=self.rtp,
                max_win=self.wincap,
                auto_close_disabled=True,
                is_feature=False,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=self.wincap,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {${basegameWeights}},
                                self.freegame_type: {${freegameWeights}},
                            },${mathConfig.multiplierEnabled ? `
                            "mult_values": {
                                self.basegame_type: {${basegameMultStr}},
                                self.freegame_type: {${freegameMultStr}},
                            },` : ""}
                            "scatter_triggers": {${basegameTriggers}},
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.999,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {${basegameWeights}},
                                self.freegame_type: {${freegameWeights}},
                            },${mathConfig.multiplierEnabled ? `
                            "mult_values": {
                                self.basegame_type: {${basegameMultStr}},
                                self.freegame_type: {${freegameMultStr}},
                            },` : ""}
                            "scatter_triggers": {${basegameTriggers}},
                            "force_freegame": True,
                        },
                    ),
                ],
            ),`
    : "";

  return `import os
from stake_engine import GameConfig as BaseGameConfig, BetMode, Distribution


class GameConfig(BaseGameConfig):
    """
    ${config.gameName || "Untitled Game"} — Generated by Stake Engine Builder
    Game ID: ${config.gameId || "untitled"}
    Version: ${config.gameVersion}
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id = "${config.gameId || "untitled"}"
        self.construct_paths(self.game_id)
        # Export dans games/<id>/math/ : reels et library sont à côté de ce fichier
        _base = os.path.dirname(os.path.abspath(__file__))
        self.reels_path = os.path.join(_base, "reels")
        self.library_path = os.path.join(_base, "library")
        self.publish_path = os.path.join(_base, "library", "publish_files")

        # Grid Configuration (num_rows = list, one per reel, for SDK compatibility)
        self.num_reels = ${config.numReels}
        self.num_rows = [${config.numRows}] * self.num_reels
        self.rtp = ${(config.rtpTarget / 100).toFixed(4)}
        self.wincap = ${mathConfig.wincap}.0

        # Win Mechanic
        self.win_mechanic = "${config.winMechanic}"
${config.winMechanic === "lines" ? `        self.num_paylines = ${config.numPaylines}` : ""}
        self.tumble_enabled = ${config.tumbleEnabled ? "True" : "False"}

        # Paytable - format: (kind, symbol_name): payout_multiplier
        self.paytable = {
${paytableEntries}${scatterPayEntries ? "\n" + scatterPayEntries : ""}
        }

        # Special Symbols
        self.special_symbols = {
${specialSymbolsLines.join("\n")}
        }
${freespinTriggersBlock}

        # Reelstrips
        reels = {${reelFiles}}
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(str.join("/", [self.reels_path, f]))
${multiplierBlock}

        # BetModes Configuration
        self.bet_modes = [
            BetMode(
                name="${config.baseBetMode.name}",
                cost=${config.baseBetMode.cost.toFixed(1)},
                rtp=self.rtp,
                max_win=self.wincap,
                auto_close_disabled=${config.freeSpins.enabled ? "True" : "False"},
                is_feature=False,
                is_buybonus=False,
                distributions=[${baseDistributions}
                ],
            ),${bonusBetMode}
        ]
`;
}

// ═══════════════════════════════════════════════════════
// gamestate.py — 4 templates by win mechanic
// ═══════════════════════════════════════════════════════

export function generateGamestatePy(config: GameConfig): string {
  const mechanic = config.winMechanic;
  const hasFreespins = config.freeSpins.enabled;
  const hasTumble = config.tumbleEnabled;

  const header = `"""
GameState — ${config.gameName}
Win Mechanic: ${mechanic}
Generated by Stake Engine Builder
Docs: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/
"""

from stake_engine import GameState as BaseGameState


class GameState(BaseGameState):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.event_index = 0
        self.total_win = 0.0

    def add_event(self, event: dict):
        """Délègue au book du SDK (requis quand run_spin appelle add_event)."""
        if hasattr(self, "book") and self.book is not None:
            self.book.add_event(event)

    def assign_special_sym_function(self):
        """Requis par le Math SDK — pas de symboles spéciaux custom."""
        self.special_symbol_functions = {}
`;

  let evaluateMethod: string;
  let paylinesDef = "";

  if (mechanic === "lines") {
    paylinesDef = generatePaylinesDefinition(config.numReels, config.numRows, config.numPaylines);
    evaluateMethod = `
    def evaluate_wins(self, board):
        """Evaluate wins using paylines."""
        wins = []
        for line in self.paylines:
            symbols_on_line = [board[col][row] for col, row in line]
            first_sym = symbols_on_line[0]
            
            # Skip scatter
            if first_sym in self.config.special_symbols.get("scatter", []):
                continue
            
            wild_syms = self.config.special_symbols.get("wild", [])
            match_count = 1
            for i in range(1, len(symbols_on_line)):
                sym = symbols_on_line[i]
                if sym == first_sym or sym in wild_syms:
                    match_count += 1
                elif first_sym in wild_syms:
                    first_sym = sym
                    match_count += 1
                else:
                    break
            
            payout = self.config.paytable.get((match_count, first_sym), 0)
            if payout > 0:
                positions = [list(pos) for pos in line[:match_count]]
                wins.append({
                    "symbol": first_sym,
                    "kind": match_count,
                    "win": payout,
                    "positions": positions,
                    "meta": {},
                })
        return wins`;
  } else if (mechanic === "ways") {
    evaluateMethod = `
    def evaluate_wins(self, board):
        """Evaluate wins using all-ways (left to right adjacency)."""
        wins = []
        wild_syms = self.config.special_symbols.get("wild", [])
        scatter_syms = self.config.special_symbols.get("scatter", [])
        
        # Get unique pay symbols
        pay_symbols = set()
        for (kind, sym) in self.config.paytable:
            pay_symbols.add(sym)
        
        for target_sym in pay_symbols:
            if target_sym in scatter_syms:
                continue
            
            ways_count = 1
            consecutive_reels = 0
            positions = []
            
            for col in range(self.config.num_reels):
                matching_rows = []
                for row in range(self.config.num_rows[col]):
                    sym = board[col][row]
                    if sym == target_sym or sym in wild_syms:
                        matching_rows.append(row)
                
                if matching_rows:
                    consecutive_reels += 1
                    ways_count *= len(matching_rows)
                    for row in matching_rows:
                        positions.append([col, row])
                else:
                    break
            
            if consecutive_reels >= 3:
                payout = self.config.paytable.get((consecutive_reels, target_sym), 0)
                if payout > 0:
                    total_payout = payout * ways_count
                    wins.append({
                        "symbol": target_sym,
                        "kind": consecutive_reels,
                        "win": total_payout,
                        "positions": positions,
                        "meta": {"ways": ways_count},
                    })
        return wins`;
  } else if (mechanic === "cluster") {
    evaluateMethod = `
    def evaluate_wins(self, board):
        """Evaluate wins using cluster pays (adjacent groups of 5+)."""
        wins = []
        visited = set()
        wild_syms = self.config.special_symbols.get("wild", [])
        
        for col in range(self.config.num_reels):
            for row in range(self.config.num_rows[col]):
                if (col, row) in visited:
                    continue
                sym = board[col][row]
                if sym in self.config.special_symbols.get("scatter", []):
                    continue
                
                # BFS to find cluster
                cluster = []
                queue = [(col, row)]
                seen = {(col, row)}
                
                while queue:
                    c, r = queue.pop(0)
                    cluster.append([c, r])
                    
                    for dc, dr in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nc, nr = c + dc, r + dr
                        if (0 <= nc < self.config.num_reels and 
                            0 <= nr < self.config.num_rows[nc] and 
                            (nc, nr) not in seen):
                            nsym = board[nc][nr]
                            if nsym == sym or nsym in wild_syms:
                                seen.add((nc, nr))
                                queue.append((nc, nr))
                
                if len(cluster) >= 5:
                    for pos in cluster:
                        visited.add(tuple(pos))
                    
                    count = min(len(cluster), max(k for k, s in self.config.paytable if s == sym) if any(s == sym for _, s in self.config.paytable) else len(cluster))
                    payout = self.config.paytable.get((count, sym), 0)
                    
                    # Try exact count first, then closest lower
                    if payout == 0:
                        for k in range(len(cluster), 0, -1):
                            payout = self.config.paytable.get((k, sym), 0)
                            if payout > 0:
                                break
                    
                    if payout > 0:
                        wins.append({
                            "symbol": sym,
                            "kind": len(cluster),
                            "win": payout,
                            "positions": cluster,
                            "meta": {},
                        })
        return wins`;
  } else {
    // scatter pays
    evaluateMethod = `
    def evaluate_wins(self, board):
        """Evaluate wins using scatter/pay-anywhere (count symbols anywhere on board)."""
        wins = []
        wild_syms = self.config.special_symbols.get("wild", [])
        
        # Count each symbol on the board
        sym_positions = {}
        for col in range(self.config.num_reels):
            for row in range(self.config.num_rows[col]):
                sym = board[col][row]
                if sym not in sym_positions:
                    sym_positions[sym] = []
                sym_positions[sym].append([col, row])
        
        # Add wild positions to each pay symbol
        wild_positions = []
        for ws in wild_syms:
            wild_positions.extend(sym_positions.get(ws, []))
        
        checked = set()
        for (kind, sym) in self.config.paytable:
            if sym in checked:
                continue
            checked.add(sym)
            
            positions = sym_positions.get(sym, []) + wild_positions
            count = len(positions)
            
            # Find best matching payout
            best_payout = 0
            for k in range(count, 0, -1):
                p = self.config.paytable.get((k, sym), 0)
                if p > 0:
                    best_payout = p
                    break
            
            if best_payout > 0:
                wins.append({
                    "symbol": sym,
                    "kind": count,
                    "win": best_payout,
                    "positions": positions,
                    "meta": {},
                })
        return wins`;
  }

  const tumbleMethod = hasTumble
    ? `
    def tumble_board(self, board, win_positions):
        """Remove winning symbols and drop new ones from reelstrip. Dedup positions to avoid IndexError on pop."""
        import random
        seen = set()
        by_col = {}
        for c, r in win_positions:
            if (c, r) in seen:
                continue
            seen.add((c, r))
            if c not in by_col:
                by_col[c] = []
            by_col[c].append(r)
        for col in range(self.config.num_reels):
            if col not in by_col:
                continue
            remove_rows = sorted(set(by_col[col]), reverse=True)
            for row in remove_rows:
                if 0 <= row < len(board[col]):
                    board[col].pop(row)
            reel_key = list(self.config.reels.keys())[0]
            reel = self.config.reels[reel_key][col]
            while len(board[col]) < self.config.num_rows[col]:
                board[col].insert(0, random.choice(reel))
        return board`
    : "";

  // Flux SDK : run_spin(sim) appelle _run_spin_sdk(sim) (reset_seed, while repeat: reset_book, draw_board, _board_to_names, _emit_events_and_tumble, update_final_win, check_repeat, imprint_wins)
  const runSpin = `
    _MAX_REPEAT_ATTEMPTS = 5000

    def _board_to_names(self):
        """Convert SDK self.board (Symbol objects) to list of symbol names for evaluate_wins."""
        if not getattr(self, "board", None):
            return None
        return [[getattr(s, "name", str(s)) for s in col] for col in self.board]

    def run_spin(self, sim_or_game_type=None):
        """SDK appelle run_spin(sim: int). Legacy run_spin(game_type=\"basegame\")."""
        if isinstance(sim_or_game_type, int):
            self._run_spin_sdk(sim_or_game_type)
            return
        game_type = sim_or_game_type if sim_or_game_type is not None else "basegame"
        self._run_spin_legacy(game_type)

    def _run_spin_sdk(self, sim: int):
        """Flux identique au sample scatter : reset_seed, while repeat: reset_book, draw_board(), events, win_manager, update_final_win, check_repeat, imprint_wins."""
        self.reset_seed(sim)
        self.repeat = True
        attempts = 0
        while self.repeat:
            attempts += 1
            if attempts > self._MAX_REPEAT_ATTEMPTS:
                self.repeat = False
                break
            self.reset_book()
            self.gametype = self.config.basegame_type
            self.event_index = 0
            self.total_win = 0.0
            self.draw_board()
            board = self._board_to_names()
            if board is None:
                self.repeat = True
                continue
            self._emit_events_and_tumble(board, self.gametype)
            self.win_manager.set_spin_win(self.total_win)
            self.win_manager.update_gametype_wins(self.gametype)
            self.update_final_win()
            self.check_repeat()
        self.imprint_wins()

    def _emit_events_and_tumble(self, board, game_type):
        """Emet reveal, boucle tumble (evaluate_wins, winInfo, setWin, setTotalWin), finalWin. Met à jour self.total_win."""
        self.add_event({
            "index": self.event_index,
            "type": "reveal",
            "board": [list(col) for col in board],
            "paddingPositions": [],
            "gameType": game_type,
            "anticipation": [],
        })
        self.event_index += 1
        tumble_round = 0
        while True:
            wins = self.evaluate_wins(board)
            if not wins:
                break
            win_amount = sum(w["win"] for w in wins)
            self.total_win += win_amount
            if self.total_win >= self.config.wincap:
                self.total_win = self.config.wincap
            self.add_event({
                "index": self.event_index,
                "type": "winInfo",
                "totalWin": self.total_win,
                "wins": wins,
            })
            self.event_index += 1
            self.add_event({
                "index": self.event_index,
                "type": "setWin",
                "amount": win_amount,
                "winLevel": min(tumble_round + 1, 5),
            })
            self.event_index += 1
            self.add_event({
                "index": self.event_index,
                "type": "setTotalWin",
                "amount": self.total_win,
            })
            self.event_index += 1
            if self.total_win >= self.config.wincap:
                break
            win_positions = []
            for w in wins:
                win_positions.extend([(p[0], p[1]) for p in w["positions"]])
            board = self.tumble_board(board, win_positions)
            self.add_event({
                "index": self.event_index,
                "type": "reveal",
                "board": [list(col) for col in board],
                "paddingPositions": [],
                "gameType": game_type,
                "anticipation": [],
            })
            self.event_index += 1
            tumble_round += 1
        self.add_event({
            "index": self.event_index,
            "type": "finalWin",
            "amount": self.total_win,
        })

    def _run_spin_legacy(self, game_type="basegame"):
        """Legacy: draw_board() puis _emit_events_and_tumble (si besoin appel depuis run_freespin)."""
        self.event_index = 0
        self.total_win = 0.0
        self.gametype = game_type
        self.draw_board()
        board = self._board_to_names()
        if board is None:
            return 0.0
        self._emit_events_and_tumble(board, game_type)
        self.check_repeat()
        return self.total_win`;

  const freespinMethod = hasFreespins
    ? `
    def run_freespin(self):
        """Execute free spin rounds (legacy: run_spin freegame)."""
        return self.run_spin(game_type="freegame")`
    : "";

  return `${header}${paylinesDef}${evaluateMethod}
${tumbleMethod}
${runSpin}
${freespinMethod}
`;
}

function generatePaylinesDefinition(numReels: number, numRows: number, numPaylines: number): string {
  // Generate standard payline patterns
  const lines: number[][] = [];
  if (numRows === 3) {
    // Standard 20 paylines for 5x3
    const patterns = [
      [1, 1, 1, 1, 1], // middle
      [0, 0, 0, 0, 0], // top
      [2, 2, 2, 2, 2], // bottom
      [0, 1, 2, 1, 0], // V shape
      [2, 1, 0, 1, 2], // inverted V
      [0, 0, 1, 0, 0], // slight dip
      [2, 2, 1, 2, 2], // slight rise
      [1, 0, 0, 0, 1], // U shape
      [1, 2, 2, 2, 1], // inverted U
      [0, 1, 1, 1, 0], // shallow V
      [2, 1, 1, 1, 2], // shallow inverted V
      [1, 0, 1, 0, 1], // zigzag up
      [1, 2, 1, 2, 1], // zigzag down
      [0, 1, 0, 1, 0], // wave up
      [2, 1, 2, 1, 2], // wave down
      [0, 0, 1, 2, 2], // diagonal down
      [2, 2, 1, 0, 0], // diagonal up
      [1, 0, 1, 2, 1], // W shape
      [1, 2, 1, 0, 1], // M shape
      [0, 2, 0, 2, 0], // extreme zigzag
    ];
    for (let i = 0; i < Math.min(numPaylines, patterns.length); i++) {
      lines.push(patterns[i].slice(0, numReels));
    }
  } else {
    // For non-3-row grids, generate simple patterns
    for (let row = 0; row < Math.min(numPaylines, numRows); row++) {
      lines.push(new Array(numReels).fill(row));
    }
  }

  const linesStr = lines
    .map((line) => `            [${line.map((r, c) => `(${c}, ${r})`).join(", ")}],`)
    .join("\n");

  return `
        # Paylines definition
        self.paylines = [
${linesStr}
        ]
`;
}

// ═══════════════════════════════════════════════════════
// run.py
// ═══════════════════════════════════════════════════════

export function generateRunPy(config: GameConfig, mathConfig: MathConfig): string {
  const { runConfig } = mathConfig;
  const betModeNames = [config.baseBetMode.name];
  if (config.freeSpins.enabled) betModeNames.push(config.freeSpins.modeName);

  const simArgs = betModeNames
    .map((name, i) => `    "${name}": ${i === 0 ? runConfig.numSimBase : runConfig.numSimBonus},`)
    .join("\n");

  return `"""
Stake Engine Math SDK - Run Configuration
Generated by Stake Engine Builder
Documentation: https://stakeengine.github.io/math-sdk/math_docs/quickstart/
"""

from game_config import GameConfig
from gamestate import GameState

# Threading Configuration
num_threads = ${runConfig.numThreads}  # CPU threads for Python simulation
rust_threads = ${runConfig.rustThreads}  # Rust optimization threads (requires Cargo)
batching_size = ${runConfig.batchingSize}

# Output Configuration
compression = ${runConfig.compression ? "True" : "False"}  # True = .jsonl.zst (production), False = .json (debug)

# Simulation Arguments per BetMode
num_sim_args = {
${simArgs}
}

# Run Conditions
run_sims = ${runConfig.runSims ? "True" : "False"}  # Generate simulation data
run_optimization = ${runConfig.runOptimization ? "True" : "False"}  # Optimize weights via Rust (requires Cargo)
run_analysis = ${runConfig.runAnalysis ? "True" : "False"}  # Generate PAR sheet (.xlsx)
upload_data = ${runConfig.uploadData ? "True" : "False"}  # Upload to AWS S3

if __name__ == "__main__":
    config = GameConfig()

    if run_sims:
        from stake_engine import run_simulations
        run_simulations(
            config=config,
            gamestate_class=GameState,
            num_threads=num_threads,
            batching_size=batching_size,
            num_sim_args=num_sim_args,
            compression=compression,
        )

    if run_optimization:
        from stake_engine import run_rust_optimization
        run_rust_optimization(
            config=config,
            num_threads=rust_threads,
        )

    if run_analysis:
        from stake_engine import generate_par_sheet
        generate_par_sheet(config=config)

    if upload_data:
        from stake_engine import upload_to_s3
        upload_to_s3(config=config)
`;
}

// ═══════════════════════════════════════════════════════
// stake_engine.py — couche de compatibilité Math SDK
// ═══════════════════════════════════════════════════════

/** Génère stake_engine.py pour que game_config/gamestate/run.py s'exécutent dans math-sdk/games/<game_id>/ */
export function generateStakeEnginePy(): string {
  return `"""
Compatibility layer for Stake Engine Builder exports.

Provides a minimal "stake_engine" module API on top of the
current math-sdk codebase (src.config, src.state, ...), so
that game_config.py, gamestate.py and run.py generated by
the Builder can be executed directly in math-sdk/games/<GAME_ID>.
"""

import os
import sys

# Add math-sdk root (where src/ lives) to PYTHONPATH
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from src.config.config import Config as _GameConfig, BetMode  # type: ignore
from src.config.distributions import Distribution  # type: ignore
from src.calculations.board import Board as _BaseGameState  # type: ignore
from src.state.run_sims import create_books  # type: ignore
from src.write_data.write_configs import generate_configs  # type: ignore
from optimization_program.run_script import OptimizationExecution  # type: ignore
from utils.game_analytics.run_analysis import create_stat_sheet  # type: ignore
from utils.rgs_verification import execute_all_tests  # type: ignore


# Re-exported types expected by the Builder.
GameConfig = _GameConfig
GameState = _BaseGameState


def run_simulations(config, gamestate_class, num_threads, batching_size, num_sim_args, compression):
    """Rough equivalent of the old stake_engine.run_simulations."""
    profiling = False
    gamestate = gamestate_class(config)
    create_books(
        gamestate,
        config,
        num_sim_args,
        batching_size,
        num_threads,
        compression,
        profiling,
    )
    generate_configs(gamestate)
    execute_all_tests(config)


def run_rust_optimization(config, num_threads):
    """Adapter for the Rust optimisation pipeline."""
    try:
        target_modes = [bm.get_name() for bm in getattr(config, "bet_modes", [])]
    except Exception:
        target_modes = []
    if not target_modes:
        return
    OptimizationExecution().run_all_modes(config, target_modes, num_threads)


def generate_par_sheet(config):
    """Generate a simple PAR/stat sheet for the game."""
    try:
        from gamestate import GameState as GameStateClass  # local game module
    except Exception as exc:
        print("generate_par_sheet: unable to import gamestate:", exc)
        return
    gamestate = GameStateClass(config)
    custom_keys = [{"symbol": "scatter"}]
    create_stat_sheet(gamestate, custom_keys=custom_keys)


def upload_to_s3(config):  # noqa: ARG001
    """Placeholder: uploading is handled by Stake ACP, not locally."""
    print("upload_to_s3: no-op in local environment. Use Stake ACP to upload files.")
`;
}

// ═══════════════════════════════════════════════════════
// index.json
// ═══════════════════════════════════════════════════════

export function generateIndexJson(config: GameConfig): string {
  const modes: object[] = [
    {
      name: config.baseBetMode.name,
      cost: config.baseBetMode.cost,
      events: `books_${config.baseBetMode.name}.jsonl.zst`,
      weights: `lookUpTable_${config.baseBetMode.name}_0.csv`,
    },
  ];
  if (config.freeSpins.enabled) {
    modes.push({
      name: config.freeSpins.modeName,
      cost: config.freeSpins.costMultiplier,
      events: `books_${config.freeSpins.modeName}.jsonl.zst`,
      weights: `lookUpTable_${config.freeSpins.modeName}_0.csv`,
    });
  }
  return JSON.stringify({ modes }, null, 2);
}

// ═══════════════════════════════════════════════════════
// Reelstrip CSV generation
// ═══════════════════════════════════════════════════════

export function generateReelstripCSV(reels: string[][]): string {
  const maxLen = Math.max(...reels.map((r) => r.length));
  const rows: string[] = [];
  for (let i = 0; i < maxLen; i++) {
    rows.push(reels.map((reel) => reel[i % reel.length]).join(","));
  }
  return rows.join("\n");
}

/**
 * Generate balanced reelstrip from symbol config.
 * Guarantees: min 40 positions, WILD+SCATTER on every reel.
 */
export function generateAutoReelstrip(
  config: GameConfig,
  mode: "basegame" | "freegame" = "basegame",
  stripLength = 50
): string[][] {
  const paySymbols = config.symbols.filter((s) => s.type === "high" || s.type === "low");
  const wildSym = config.symbols.find((s) => s.type === "wild");
  const scatterSym = config.symbols.find((s) => s.type === "scatter");
  const highSymbols = paySymbols.filter((s) => s.type === "high");
  const lowSymbols = paySymbols.filter((s) => s.type === "low");

  const effectiveLength = Math.max(stripLength, 40);
  const reels: string[][] = [];

  // Freegame has more wilds
  const wildFreq = mode === "freegame" ? 0.075 : 0.05;
  const scatterFreq = 0.04;
  const highFreq = 0.25;

  for (let col = 0; col < config.numReels; col++) {
    const reel: string[] = [];
    let hasWild = false;
    let hasScatter = false;

    for (let i = 0; i < effectiveLength; i++) {
      const rand = Math.random();

      if (rand < wildFreq && wildSym) {
        reel.push(wildSym.name);
        hasWild = true;
      } else if (rand < wildFreq + scatterFreq && scatterSym) {
        reel.push(scatterSym.name);
        hasScatter = true;
      } else if (rand < wildFreq + scatterFreq + highFreq && highSymbols.length > 0) {
        reel.push(highSymbols[Math.floor(Math.random() * highSymbols.length)].name);
      } else if (lowSymbols.length > 0) {
        reel.push(lowSymbols[Math.floor(Math.random() * lowSymbols.length)].name);
      } else {
        reel.push(paySymbols[Math.floor(Math.random() * paySymbols.length)]?.name || "L1");
      }
    }

    // Guarantee WILD and SCATTER appear at least once per reel
    if (!hasWild && wildSym) {
      reel[Math.floor(Math.random() * reel.length)] = wildSym.name;
    }
    if (!hasScatter && scatterSym) {
      const pos = Math.floor(Math.random() * reel.length);
      if (reel[pos] !== wildSym?.name) reel[pos] = scatterSym.name;
      else reel[(pos + 1) % reel.length] = scatterSym.name;
    }

    reels.push(reel);
  }

  return reels;
}

// ═══════════════════════════════════════════════════════
// NEXT_STEPS.md
// ═══════════════════════════════════════════════════════

export function generateNextSteps(config: GameConfig): string {
  const gameId = config.gameId || config.gameName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "my_slot_game";

  return `# Étapes pour publier sur Stake Engine

## 1. Installer le Math SDK

\`\`\`bash
git clone https://github.com/StakeEngine/math-sdk
cd math-sdk
make setup  # Python 3.12+ requis
\`\`\`

Pour l'optimisation : installer Rust → https://rustup.rs

## 2. Placer ton jeu

\`\`\`bash
cp -r ${gameId}/ math-sdk/games/
\`\`\`

## 3. Debug rapide (100 sims, pas de compression)

Dans run.py, modifier :
- \`num_sim_args = {"${config.baseBetMode.name}": 100${config.freeSpins.enabled ? `, "${config.freeSpins.modeName}": 100` : ""}}\`
- \`compression = False\`

\`\`\`bash
make run GAME=${gameId}
\`\`\`

## 4. Production (100k+ sims + optimisation)

Dans run.py :
- \`num_sim_args = {"${config.baseBetMode.name}": 100000${config.freeSpins.enabled ? `, "${config.freeSpins.modeName}": 100000` : ""}}\`
- \`compression = True\`
- \`run_optimization = True\`
- \`run_analysis = True\`

\`\`\`bash
make run GAME=${gameId}
\`\`\`

## 5. Fichiers de publication

Récupérer dans : \`games/${gameId}/library/publish_files/\`
→ index.json + books_*.jsonl.zst + lookUpTable_*_0.csv

## 6. Frontend SDK

\`\`\`bash
git clone https://github.com/StakeEngine/web-sdk
\`\`\`

Guide : https://stakeengine.github.io/math-sdk/fe_docs/get_started/

## 7. RGS API Integration

### URL du jeu
\`\`\`
https://{TeamName}.cdn.stake-engine.com/${gameId}/${config.gameVersion}/index.html?sessionID={SessionID}&lang={Lang}&device={Device}&rgs_url={RgsUrl}
\`\`\`

### Valeurs monétaires (CRITIQUE)
Toutes les valeurs monétaires sont des **entiers avec 6 décimales implicites** :
- $1.00 = \`1000000\`
- $0.10 = \`100000\`
- $1000 = \`1000000000\`

### Bet Validation
- \`bet >= minBet\` (retourné par /wallet/authenticate)
- \`bet <= maxBet\`
- \`bet\` divisible par \`stepBet\`

### Flux API complet
1. **POST /wallet/authenticate** → valider session, récupérer config (minBet, maxBet, stepBet, balance)
2. **POST /wallet/play** → débiter bet, recevoir events du round
3. **POST /bet/event** → tracker actions en cours (pour reprise de session)
4. **POST /wallet/end-round** → créditer payout, fermer round

### Codes d'erreur à gérer
| Code | Description |
|------|-------------|
| ERR_IPB | Insufficient Player Balance |
| ERR_IS | Invalid Session / Timeout |
| ERR_GLE | Gambling Limits Exceeded |
| ERR_LOC | Invalid Player Location |

### Client TypeScript
- https://github.com/StakeEngine/ts-client
- API docs : https://stakeengine.github.io/math-sdk/rgs_docs/RGS/

## 8. Checklist avant soumission

- [ ] game_config.py placé dans games/${gameId}/
- [ ] Reelstrips BR0.csv (et FR0.csv si freespins) dans reels/
- [ ] Simulations run (100k+ par mode)
- [ ] RTP vérifié par le PAR sheet
- [ ] Optimisation run (run_optimization = True)
- [ ] Fichiers de publication dans library/publish_files/
- [ ] Le jeu est 100% stateless
- [ ] Pas de jackpots, gamble, early cashout ou progression
- [ ] Tous les outcomes sont pré-simulés
- [ ] RTP calculable depuis les poids CSV
`;
}

// ═══════════════════════════════════════════════════════
// Sample book event (correct format)
// ═══════════════════════════════════════════════════════

export function generateSampleBook(config: GameConfig): string {
  const board: string[][] = [];
  for (let col = 0; col < config.numReels; col++) {
    const reel: string[] = [];
    for (let row = 0; row < config.numRows; row++) {
      const paySyms = config.symbols.filter((s) => s.type !== "scatter");
      reel.push(paySyms[Math.floor(Math.random() * paySyms.length)]?.name || "L1");
    }
    board.push(reel);
  }

  return JSON.stringify(
    {
      id: 1,
      payoutMultiplier: 10,
      events: [
        {
          index: 0,
          type: "reveal",
          board,
          paddingPositions: [],
          gameType: "basegame",
          anticipation: [],
        },
        {
          index: 1,
          type: "winInfo",
          totalWin: 10.0,
          wins: [
            {
              symbol: board[0][0],
              kind: 3,
              win: 10.0,
              positions: [[0, 0], [1, 0], [2, 0]],
              meta: {},
            },
          ],
        },
        { index: 2, type: "setWin", amount: 10.0, winLevel: 1 },
        { index: 3, type: "setTotalWin", amount: 10.0 },
        { index: 4, type: "finalWin", amount: 10.0 },
      ],
    },
    null,
    2
  );
}

// ═══════════════════════════════════════════════════════
// Sample lookUpTable CSV (NO header)
// ═══════════════════════════════════════════════════════

export function generateSampleCSV(): string {
  return `1,199895486317,0
2,25668581149,20
3,15000000000,50
4,5000000000,100
5,1000000000,500`;
}

// ═══════════════════════════════════════════════════════
// config_fe_<gameId>.json — format attendu par Stake Engine frontend
// (aligné sur make_fe_config du Math SDK)
// ═══════════════════════════════════════════════════════

export function generateConfigFeJson(config: GameConfig, mathConfig: MathConfig): string {
  const gameId = config.gameId || config.gameName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "my_slot_game";
  const rtp = config.rtpTarget / 100;

  const betModes: Record<string, { cost: number; feature: boolean; buyBonus: boolean; rtp: number; max_win: number }> = {};
  betModes[config.baseBetMode.name] = {
    cost: config.baseBetMode.cost,
    feature: false,
    buyBonus: false,
    rtp,
    max_win: mathConfig.wincap,
  };
  if (config.freeSpins.enabled) {
    betModes[config.freeSpins.modeName] = {
      cost: config.freeSpins.costMultiplier,
      feature: true,
      buyBonus: true,
      rtp,
      max_win: mathConfig.wincap,
    };
  }

  const symbols: Record<string, { paytable?: Record<number, number>; special_properties?: string[] }>[] = [];
  for (const s of config.symbols) {
    const sym: Record<string, { paytable?: Record<number, number>; special_properties?: string[] }> = {
      [s.name]: {},
    };
    const val = sym[s.name]!;
    const special: string[] = [];
    if (s.type === "wild") special.push("wild");
    if (s.type === "scatter") special.push("scatter");
    if (special.length) val.special_properties = special;
    const paytable: Record<number, number> = {};
    for (const [k, v] of Object.entries(s.paytable)) {
      const count = Number(k);
      if (!Number.isNaN(count) && v > 0) paytable[count] = v;
    }
    if (Object.keys(paytable).length) val.paytable = paytable;
    symbols.push(sym);
  }

  let paylines: Record<string, number[]> | undefined;
  if (config.winMechanic === "lines" && config.numRows === 3 && config.numReels === 5) {
    const patterns = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [0, 1, 2, 1, 0],
      [2, 1, 0, 1, 2],
      [0, 0, 1, 2, 2],
      [2, 2, 1, 0, 0],
      [1, 0, 1, 2, 1],
      [1, 2, 1, 0, 1],
      [0, 1, 1, 1, 2],
      [2, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [2, 1, 2, 1, 2],
      [1, 0, 0, 0, 1],
      [1, 2, 2, 2, 1],
      [0, 0, 1, 0, 0],
      [2, 2, 1, 2, 2],
      [1, 0, 1, 0, 1],
      [1, 2, 1, 2, 1],
      [0, 2, 0, 2, 0],
    ];
    paylines = {};
    for (let i = 0; i < Math.min(config.numPaylines, patterns.length); i++) {
      paylines[String(i + 1)] = patterns[i]!.slice(0, config.numReels);
    }
  } else if (config.winMechanic === "lines") {
    paylines = {};
    for (let i = 0; i < config.numPaylines; i++) {
      const row = i % config.numRows;
      paylines[String(i + 1)] = new Array(config.numReels).fill(row);
    }
  }

  const numRowsArr = new Array(config.numReels).fill(config.numRows) as number[];

  const strip = mathConfig.basegameStrips[0];
  const paddingReels: Record<string, unknown[][]> = {};
  if (strip?.reels?.length) {
    const padded = strip.reels.map((col) => col.map((sym) => ({ name: sym })));
    paddingReels["0"] = padded;
  }

  const feConfig: Record<string, unknown> = {
    providerName: (config as { providerName?: string }).providerName ?? "stake",
    gameName: config.gameName || "Untitled Game",
    gameID: gameId,
    rtp,
    numReels: config.numReels,
    numRows: numRowsArr,
    winMechanic: config.winMechanic || "cluster",
    tumbleEnabled: config.tumbleEnabled ?? true,
    betModes,
    symbols,
    paddingReels,
  };
  if (paylines) feConfig.paylines = paylines;
  if (config.freeSpins?.enabled && config.freeSpins.scatterAwards && Object.keys(config.freeSpins.scatterAwards).length > 0) {
    feConfig.scatterAwards = config.freeSpins.scatterAwards;
  }

  return JSON.stringify(feConfig, null, 2);
}

// ═══════════════════════════════════════════════════════
// design_config.json
// ═══════════════════════════════════════════════════════

export function generateDesignJson(config: GameConfig): string {
  return JSON.stringify(config, null, 2);
}

// ═══════════════════════════════════════════════════════
// readme.txt
// ═══════════════════════════════════════════════════════

export function generateReadme(config: GameConfig, mathConfig: MathConfig): string {
  return `${config.gameName}
${"=".repeat(config.gameName.length)}

Generated by Stake Engine Builder
Date: ${new Date().toISOString().split("T")[0]}
Version: ${config.gameVersion}

Grid: ${config.numReels}x${config.numRows}
Win Mechanic: ${config.winMechanic}
RTP Target: ${config.rtpTarget}%
Win Cap: ${mathConfig.wincap}x
Volatility: ${config.volatility}

Symbols:
${config.symbols.map((s) => `- ${s.name} (${s.type})`).join("\n")}

Bet Modes:
- ${config.baseBetMode.name} (cost: ${config.baseBetMode.cost}x)
${config.freeSpins.enabled ? `- ${config.freeSpins.modeName} (cost: ${config.freeSpins.costMultiplier}x, bonus buy)` : ""}
`;
}
