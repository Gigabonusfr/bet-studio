/**
 * Génère un front PixiJS publiable sur Stake Engine.
 * Rendu aligné sur le preview du builder : fond pleine page, grille reelColor + bordure, HUD type IntegratedLayout.
 * Doc: https://stakeengine.github.io/math-sdk/rgs_docs/RGS/
 */
import type { GameConfig } from "@/types/game-config";
import type { MathConfig } from "@/context/MathConfigContext";
import { THEMES } from "@/types/slot-controls";

/** Ordre symbolId (RGS) → nom symbole (aligné config_fe / templates 0_0_*) */
const SYMBOL_ID_TO_NAME: (string | null)[] = [
  "H1", "H2", "H3", "H4", "H5", "L1", "L2", "L3", "L4", "WILD", "SCATTER", null,
];

export type PixiFrontExportAssets = {
  backgroundUrl?: string | null;
  symbolIdToUrl?: (string | null)[];
};

/** Thème visuel + contrôles pour l’export (sérialisable). */
export type PixiFrontExportTheme = {
  reelColor: string;
  gridBorderStyle: "none" | "solid" | "glow" | "neon" | "gradient";
  gridBorderColor: string;
  bodyBackgroundUrl: string | null;
  bar: { backgroundColor: string; opacity: number; border: string; borderColor: string; borderRadius: number; position: string };
  balance: { label: string; color: string; fontSize: string };
  bet: { accentColor: string };
  spinButton: { backgroundColor: string; iconColor: string; shape: string; size: string };
  freeSpinsEnabled: boolean;
  freeSpinsCostMultiplier: number;
  tumbleEnabled: boolean;
  symbolAnimation: "none" | "pulse" | "shake" | "flip" | "zoom";
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  winLineColor: string;
  explodeDuration: number;
  tumbleDropDuration: number;
};

const DEFAULT_EXPORT_THEME: PixiFrontExportTheme = {
  reelColor: "#1a1c23",
  gridBorderStyle: "glow",
  gridBorderColor: "#FFD700",
  bodyBackgroundUrl: null,
  bar: (THEMES as any).ocean.bar,
  balance: { label: "BALANCE", color: (THEMES as any).ocean.balance.color, fontSize: "M" },
  bet: { accentColor: (THEMES as any).ocean.bet.accentColor },
  spinButton: {
    backgroundColor: (THEMES as any).ocean.spinButton.backgroundColor,
    iconColor: (THEMES as any).ocean.spinButton.iconColor,
    shape: "round",
    size: "L",
  },
  freeSpinsEnabled: false,
  freeSpinsCostMultiplier: 100,
  tumbleEnabled: true,
  symbolAnimation: "pulse",
  glowEnabled: true,
  glowColor: "#FFD700",
  glowIntensity: 60,
  winLineColor: "#FFD700",
  explodeDuration: 500,
  tumbleDropDuration: 350,
};

export function generatePixiFrontHtml(
  config: GameConfig,
  mathConfig: MathConfig,
  exportAssets?: PixiFrontExportAssets | null,
  exportTheme?: PixiFrontExportTheme | null
): string {
  const gameId = config.gameId || config.gameName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "my_slot_game";
  const assetsConfig = (config as { assetsConfig?: { symbolAssets?: Record<string, string | null>; backgroundAsset?: string | null } }).assetsConfig;
  const symbolAssets = assetsConfig?.symbolAssets ?? {};
  const bgFromConfig = (config as { backgroundUrl?: string }).backgroundUrl ?? assetsConfig?.backgroundAsset ?? "";
  const symbolImageUrlsByKey: Record<string, string> = {};
  config.symbols.forEach((s) => {
    const url = symbolAssets[s.id] ?? symbolAssets[s.name?.toLowerCase()] ?? null;
    if (url) symbolImageUrlsByKey[s.name] = url;
  });
  const symbolIdToUrl: (string | null)[] = exportAssets?.symbolIdToUrl ?? SYMBOL_ID_TO_NAME.map((name) =>
    name ? symbolImageUrlsByKey[name] ?? null : null
  );
  const backgroundUrl = exportAssets?.backgroundUrl !== undefined ? exportAssets.backgroundUrl : (bgFromConfig || null);

  const theme = { ...DEFAULT_EXPORT_THEME, ...exportTheme };
  const bodyBackgroundUrl = theme.bodyBackgroundUrl ?? (backgroundUrl || null);

  const cellW = 64;
  const cellH = 64;
  const padding = 8;
  const gameWidth = config.numReels * (cellW + padding) + padding;
  const gameHeight = config.numRows * (cellH + padding) + padding;

  const embed = {
    gameName: config.gameName || "Slot",
    gameId,
    numReels: config.numReels,
    numRows: config.numRows,
    symbolIdToUrl,
    backgroundUrl,
    bodyBackgroundUrl,
    reelColor: theme.reelColor,
    gridBorderStyle: theme.gridBorderStyle,
    gridBorderColor: theme.gridBorderColor,
    defaultBetAmount: Math.round((config.baseBetMode.cost || 1) * 1_000_000),
    bar: theme.bar,
    balance: theme.balance,
    bet: theme.bet,
    spinButton: theme.spinButton,
    freeSpinsEnabled: theme.freeSpinsEnabled,
    freeSpinsCostMultiplier: theme.freeSpinsCostMultiplier,
    tumbleEnabled: theme.tumbleEnabled,
    symbolAnimation: theme.symbolAnimation,
    glowEnabled: theme.glowEnabled,
    glowColor: theme.glowColor,
    glowIntensity: theme.glowIntensity,
    winLineColor: theme.winLineColor,
    explodeDuration: theme.explodeDuration,
    tumbleDropDuration: theme.tumbleDropDuration,
    winMechanic: config.winMechanic || "cluster",
    scatterAwards: config.freeSpins?.enabled && config.freeSpins.scatterAwards && Object.keys(config.freeSpins.scatterAwards).length > 0
      ? config.freeSpins.scatterAwards
      : null,
  };

  const templateLabel =
    config.winMechanic === "cluster"
      ? "Cluster"
      : config.winMechanic === "ways"
        ? "Ways"
        : config.winMechanic === "scatter"
          ? "Scatter"
          : "Lines";
  const tumbleLabel = config.tumbleEnabled ? " • Tumble" : "";
  const scatterAwardsArr =
    config.freeSpins?.enabled && config.freeSpins.scatterAwards
      ? Object.entries(config.freeSpins.scatterAwards)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([count, fs]) => `${count} SCATTER = ${fs} FS`)
          .join(" | ")
      : "";
  const templateSubtitle = scatterAwardsArr ? `${templateLabel}${tumbleLabel} • ${scatterAwardsArr}` : `${templateLabel}${tumbleLabel}`;

  const configJson = JSON.stringify(embed).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  const barOpacityHex = Math.round((theme.bar.opacity / 100) * 255).toString(16).padStart(2, "0");
  const gridBorderBoxShadow =
    theme.gridBorderStyle === "glow"
      ? `0 0 24px ${theme.gridBorderColor}, 0 0 40px ${theme.gridBorderColor}40`
      : theme.gridBorderStyle === "neon"
        ? `0 0 12px ${theme.gridBorderColor}`
        : "none";
  const gridBorderCss =
    theme.gridBorderStyle === "none"
      ? "none"
      : theme.gridBorderStyle === "gradient"
        ? "4px solid transparent"
        : `2px solid ${theme.gridBorderColor}`;
  const wrapperBgGradient =
    theme.gridBorderStyle === "gradient"
      ? `background: linear-gradient(${theme.reelColor}, ${theme.reelColor}) padding-box, linear-gradient(135deg, ${theme.gridBorderColor}, #0ea5e9) border-box; border: 4px solid transparent;`
      : `background: ${theme.reelColor}; border: ${gridBorderCss};`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${config.gameName || "Slot"} — Stake Engine</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: system-ui, sans-serif; color: #eee;
      ${bodyBackgroundUrl ? `background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${bodyBackgroundUrl}) center/cover no-repeat;` : "background: #1a1a2e;"}
    }
    .game-wrapper {
      padding: 16px; border-radius: 16px; box-shadow: ${gridBorderBoxShadow};
      ${wrapperBgGradient}
    }
    #game { width: ${gameWidth}px; height: ${gameHeight}px; border-radius: 8px; overflow: hidden; display: block; }
    .control-bar {
      margin-top: 1.5rem; padding: 1rem 1.5rem; border-radius: ${theme.bar.borderRadius}px;
      background: ${theme.bar.backgroundColor}${barOpacityHex};
      border: ${theme.bar.border === "none" ? "none" : theme.bar.border === "glow" ? `2px solid ${theme.bar.borderColor}` : `1px solid ${theme.bar.borderColor}`};
      box-shadow: ${theme.bar.border === "glow" ? `0 0 20px ${theme.bar.borderColor}` : "none"};
      backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; gap: 1.5rem; flex-wrap: wrap; max-width: 90vw;
    }
    .control-bar .balance { font-size: 0.95rem; }
    .control-bar .balance span { font-weight: bold; color: ${theme.balance.color}; }
    .control-bar .bet-row { display: flex; align-items: center; gap: 0.25rem; }
    .control-bar .bet-row .val { font-weight: bold; color: ${theme.bet.accentColor}; min-width: 3.5rem; text-align: center; }
    .control-bar .bet-btn { width: 28px; height: 28px; border: 1px solid #666; border-radius: 6px; background: #333; color: #fff; cursor: pointer; font-size: 1rem; line-height: 1; }
    .control-bar .bet-btn:hover:not(:disabled) { background: #444; }
    .control-bar .bet-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    #spinBtn {
      width: 80px; height: 80px; border-radius: 50%; border: none; cursor: pointer; font-weight: bold;
      background: ${theme.spinButton.backgroundColor}; color: ${theme.spinButton.iconColor}; font-size: 1rem; display: flex; align-items: center; justify-content: center;
    }
    #spinBtn:hover:not(:disabled) { filter: brightness(1.15); transform: scale(1.02); }
    #spinBtn:disabled { opacity: 0.6; cursor: not-allowed; }
    #buyBonus { padding: 0.4rem 0.8rem; font-size: 0.8rem; border: 1px solid ${theme.bar.borderColor}; border-radius: 8px; background: transparent; color: #eee; cursor: pointer; }
    #buyBonus:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
    #buyBonus:disabled { opacity: 0.5; cursor: not-allowed; }
    .stats-row { margin-top: 0.5rem; font-size: 0.8rem; color: #94a3b8; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
    #win { font-size: 1.1rem; color: #fbbf24; min-height: 1.25rem; }
    #error { color: #f88; font-size: 0.9rem; max-width: 480px; margin-top: 0.5rem; text-align: center; }
  </style>
</head>
<body>
  <h1 style="margin-bottom: 0.25rem; font-size: 1.5rem;">${config.gameName || "Slot"}</h1>
  <p id="templateInfo" style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem; max-width: 90vw; text-align: center;">${templateSubtitle}</p>
  <p id="gameMode" style="font-size: 0.9rem; font-weight: bold; color: #fbbf24; min-height: 1.25rem; margin-bottom: 0.25rem;"></p>
  <div class="game-wrapper">
    <div id="game"></div>
  </div>
  <div class="control-bar">
    <div class="balance">${theme.balance.label} <span id="balance">—</span></div>
    <div class="bet-row">
      <button type="button" class="bet-btn" id="betMinus" aria-label="Diminuer mise">−</button>
      <div><div style="font-size:0.7rem;color:#94a3b8">Mise</div><div class="val" id="betDisplay">1.00</div></div>
      <button type="button" class="bet-btn" id="betPlus" aria-label="Augmenter mise">+</button>
    </div>
    <button type="button" id="spinBtn">SPIN</button>
    ${theme.freeSpinsEnabled ? `<button type="button" id="buyBonus">BUY ($<span id="buyCost">${theme.freeSpinsCostMultiplier}</span>)</button>` : ""}
    <span id="win"></span>
  </div>
  <div class="stats-row">
    <span>Tours: <strong id="statSpins">0</strong></span>
    <span>Misé: $<strong id="statWagered">0.00</strong></span>
    <span>Gagné: $<strong id="statWon">0.00</strong></span>
    <span>RTP: <strong id="statRtp">0</strong>%</span>
  </div>
  <div id="error"></div>
  <script src="pixi.min.js"><\/script>
  <script>
(function() {
  var gameEl = document.getElementById("game");
  if (typeof PIXI === "undefined") {
    gameEl.innerHTML = "<p style=\\"color:#f88\\">PixiJS non chargé.</p><p style=\\"color:#999;font-size:0.9rem;margin-top:8px\\">Assurez-vous que <strong>pixi.min.js</strong> est dans le même dossier que index.html (ré-exportez le jeu si besoin). Sinon ouvrez la page via un serveur HTTP.</p>";
    return;
  }
  function runGame() {
    var CONFIG = ${configJson};
  var params = {};
  (location.search || "").slice(1).split("&").forEach(function(p) {
    var kv = p.split("=");
    if (kv.length === 2) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
  });
  var rgsUrl = (params.rgs_url || "").replace(/\\/$/, "");
  var sessionID = params.sessionID || params.sessionId || "";
  var demoMode = params.demo === "1" || params.demo === "true" || (!rgsUrl && params.demo);
  var assetBase = (function() {
    var href = document.location.href.replace(/[#?].*$/, "");
    return href.lastIndexOf("/") >= 0 ? href.slice(0, href.lastIndexOf("/") + 1) : "";
  })();
  function resolveAssetUrl(url) {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return assetBase + url;
  }

  function formatAmount(n) {
    if (n == null || isNaN(n)) return "—";
    return (Number(n) / 1000000).toFixed(2);
  }

  function showError(msg) {
    var el = document.getElementById("error");
    if (el) el.textContent = msg || "";
  }

  if (!demoMode && (!rgsUrl || !sessionID)) {
    gameEl.innerHTML = "<p style=\\"color:#fbb\\">Chargez cette page avec les paramètres Stake Engine : <code>?sessionID=...&rgs_url=...</code></p><p style=\\"color:#9c9;margin-top:8px\\">Ou ajoutez <code>?demo=1</code> pour tester sans RGS (solde fictif, spins simulés).</p>";
    showError("Paramètres manquants : sessionID et rgs_url sont requis (fournis par l'URL du jeu sur Stake Engine).");
    return;
  }

  function hexToPixi(hex) {
    if (!hex || typeof hex !== "string") return 0x1a1c23;
    var h = hex.replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(h)) return parseInt(h, 16);
    return 0x1a1c23;
  }

  var cellW = 64, cellH = 64, padding = 8;
  var width = CONFIG.numReels * (cellW + padding) + padding;
  var height = CONFIG.numRows * (cellH + padding) + padding;
  var reelColorHex = hexToPixi(CONFIG.reelColor);
  var cellBgHex = 0x252830;
  var cellBorderHex = 0x1a1c23;
  var app = new PIXI.Application({ width: width, height: height, backgroundColor: reelColorHex });
  var balanceEl = document.getElementById("balance");
  var winEl = document.getElementById("win");
  var betDisplayEl = document.getElementById("betDisplay");
  var spinBtn = document.getElementById("spinBtn");
  var statSpinsEl = document.getElementById("statSpins");
  var statWageredEl = document.getElementById("statWagered");
  var statWonEl = document.getElementById("statWon");
  var statRtpEl = document.getElementById("statRtp");
  var gameModeEl = document.getElementById("gameMode");
  function updateGameMode(gameType) {
    if (gameModeEl) gameModeEl.textContent = gameType === "freegame" ? "FREE SPINS" : "";
  }

  var balanceAmount = demoMode ? 10000 * 1000000 : 0;
  var betAmount = CONFIG.defaultBetAmount;
  var spinning = false;
  var stats = { spins: 0, wagered: 0, won: 0 };
  function updateStats() {
    if (statSpinsEl) statSpinsEl.textContent = String(stats.spins);
    if (statWageredEl) statWageredEl.textContent = (stats.wagered / 1000000).toFixed(2);
    if (statWonEl) statWonEl.textContent = (stats.won / 1000000).toFixed(2);
    if (statRtpEl) statRtpEl.textContent = stats.wagered > 0 ? ((stats.won / stats.wagered) * 100).toFixed(2) : "0";
  }

  function symbolIdToDisplay(symbolId) {
    if (symbolId == null || symbolId === undefined) return "?";
    var names = ["H1","H2","H3","H4","H5","L1","L2","L3","L4","WILD","SCATTER"];
    return names[symbolId] != null ? names[symbolId] : String(symbolId);
  }

  function randomBoard(validIds) {
    var numSym = validIds.length;
    var b = [];
    for (var c = 0; c < CONFIG.numReels; c++) {
      b[c] = [];
      for (var r = 0; r < CONFIG.numRows; r++) {
        b[c][r] = validIds[Math.floor(Math.random() * numSym)];
      }
    }
    return b;
  }

  function runSpinAnimation(durationMs, validIds, onComplete) {
    if (validIds.length === 0) { onComplete(); return; }
    var interval = setInterval(function() {
      drawBoard(randomBoard(validIds));
    }, 70);
    setTimeout(function() {
      clearInterval(interval);
      onComplete();
    }, durationMs);
  }

  var currentGrid = null;
  function runExplodeAnimation(positionsSet, durationMs, onComplete) {
    if (!currentGrid || !CONFIG.tumbleEnabled || positionsSet.length === 0) {
      if (onComplete) setTimeout(onComplete, durationMs || 0);
      return;
    }
    var numRows = CONFIG.numRows;
    var cellsToAnimate = [];
    for (var i = 0; i < positionsSet.length; i++) {
      var key = positionsSet[i];
      var parts = key.indexOf(",") >= 0 ? key.split(",") : [key[0], key[1]];
      var c = parseInt(parts[0], 10);
      var r = parseInt(parts[1], 10);
      var idx = c * numRows + r;
      if (currentGrid.children && currentGrid.children[idx]) cellsToAnimate.push(currentGrid.children[idx]);
    }
    if (cellsToAnimate.length === 0) {
      if (onComplete) setTimeout(onComplete, 0);
      return;
    }
    var start = Date.now();
    function tick() {
      var elapsed = Date.now() - start;
      var t = durationMs <= 0 ? 1 : Math.min(1, elapsed / durationMs);
      var scale = 1 - t;
      for (var i = 0; i < cellsToAnimate.length; i++) {
        cellsToAnimate[i].scale.set(scale);
        cellsToAnimate[i].alpha = scale;
      }
      if (t >= 1) {
        app.ticker.remove(tick);
        if (onComplete) onComplete();
      }
    }
    app.ticker.add(tick);
  }

  function drawBoard(board, winPositions) {
    if (!app.stage) return;
    app.stage.removeChildren();
    currentGrid = null;
    if (CONFIG.backgroundUrl && !CONFIG.bodyBackgroundUrl) {
      var bgUrl = resolveAssetUrl(CONFIG.backgroundUrl);
      if (bgUrl) {
        var bg = PIXI.Sprite.from(bgUrl);
        bg.width = width;
        bg.height = height;
        bg.alpha = 0.9;
        app.stage.addChild(bg);
      }
    }
    var gridContainer = new PIXI.Container();
    for (var c = 0; c < CONFIG.numReels; c++) {
      for (var r = 0; r < CONFIG.numRows; r++) {
        var cellVal = board && board[c] && board[c][r];
        var symbolId = typeof cellVal === "object" && cellVal != null && cellVal.symbolId != null ? cellVal.symbolId : cellVal;
        var url = CONFIG.symbolIdToUrl && symbolId != null ? CONFIG.symbolIdToUrl[symbolId] : null;
        var resolvedUrl = url ? resolveAssetUrl(url) : null;
        var cell = new PIXI.Container();
        cell.x = c * (cellW + padding);
        cell.y = r * (cellH + padding);
        var g = new PIXI.Graphics();
        g.beginFill(cellBgHex, 0.98);
        g.lineStyle(1, cellBorderHex, 0.8);
        g.drawRoundedRect(0, 0, cellW, cellH, 6);
        g.endFill();
        cell.addChild(g);
        if (resolvedUrl) {
          var sprite = PIXI.Sprite.from(resolvedUrl);
          sprite.anchor.set(0.5);
          sprite.x = cellW / 2;
          sprite.y = cellH / 2;
          var scale = Math.min((cellW - 8) / sprite.width, (cellH - 8) / sprite.height);
          sprite.width = sprite.width * scale;
          sprite.height = sprite.height * scale;
          cell.addChild(sprite);
        } else {
          var text = new PIXI.Text("?", { fontSize: 18, fill: 0xffffff });
          text.anchor.set(0.5);
          text.x = cellW / 2;
          text.y = cellH / 2;
          cell.addChild(text);
        }
        gridContainer.addChild(cell);
      }
    }
    currentGrid = gridContainer;
    app.stage.addChild(gridContainer);
  }

  function updateBalance(amount) {
    if (amount != null && !isNaN(amount)) balanceAmount = Number(amount);
    balanceEl.textContent = formatAmount(balanceAmount);
  }
  function updateBetDisplay() {
    betDisplayEl.textContent = formatAmount(betAmount);
  }

  function authenticate() {
    showError("");
    if (demoMode) {
      updateBalance(10000 * 1000000);
      showError("Mode démo — spins simulés (pas de RGS). Testez SPIN et la grille.");
      return Promise.resolve();
    }
    return fetch(rgsUrl + "/wallet/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionID: sessionID,
        lang: params.lang || "en",
        device: params.device || "desktop"
      })
    }).then(function(res) { return res.json().then(function(data) {
      if (data.error || data.code) {
        showError("Authenticate: " + (data.error || data.code || res.status));
        return;
      }
      var bal = data.balance;
      var amt = bal && (bal.amount != null ? bal.amount : bal);
      updateBalance(amt);
      var cfg = data.config;
      if (cfg && (cfg.minBet != null || cfg.defaultBetLevel != null)) {
        betAmount = cfg.defaultBetLevel != null ? Number(cfg.defaultBetLevel) : (cfg.minBet != null ? Number(cfg.minBet) : betAmount);
        updateBetDisplay();
      }
    }); }).catch(function(e) {
      var msg = e && e.message === "Failed to fetch"
        ? "Impossible de joindre le RGS. Depuis file://, le navigateur bloque les appels réseau. Pour tester avec un vrai RGS, servez la page en HTTP (ex. npx serve)."
        : "Réseau / RGS: " + (e && e.message ? e.message : "authenticate failed");
      showError(msg);
    });
  }

  function play() {
    if (spinning) return;
    if (balanceAmount < betAmount) {
      showError("Solde insuffisant (ERR_IPB)");
      return;
    }
    showError("");
    spinning = true;
    spinBtn.disabled = true;
    winEl.textContent = "";
    if (demoMode) {
      balanceAmount -= betAmount;
      updateBalance(balanceAmount);
      stats.spins++;
      stats.wagered += betAmount;
      var numSym = validSymbolIds.length;
      var demoBoard = [];
      for (var c = 0; c < CONFIG.numReels; c++) {
        demoBoard[c] = [];
        for (var r = 0; r < CONFIG.numRows; r++) {
          demoBoard[c][r] = validSymbolIds[Math.floor(Math.random() * numSym)];
        }
      }
      var winAmount = Math.random() < 0.25 ? Math.floor(betAmount * (0.5 + Math.random() * 2)) : 0;
      if (winAmount > 0) {
        balanceAmount += winAmount;
        stats.won += winAmount;
        winEl.textContent = "Gain: " + formatAmount(winAmount);
      }
      runSpinAnimation(450, validSymbolIds, function() {
        drawBoard(demoBoard);
        if (CONFIG.tumbleEnabled && validSymbolIds.length > 0) {
          var numCells = CONFIG.numReels * CONFIG.numRows;
          var explodeCount = Math.min(5, Math.floor(numCells * 0.15));
          var posSet = [];
          var used = {};
          while (posSet.length < explodeCount) {
            var c = Math.floor(Math.random() * CONFIG.numReels);
            var r = Math.floor(Math.random() * CONFIG.numRows);
            var key = c + "," + r;
            if (!used[key]) { used[key] = true; posSet.push(key); }
          }
          runExplodeAnimation(posSet, CONFIG.explodeDuration, function() {
            for (var i = 0; i < posSet.length; i++) {
              var p = posSet[i].split(",");
              var col = parseInt(p[0], 10);
              var row = parseInt(p[1], 10);
              demoBoard[col][row] = validSymbolIds[Math.floor(Math.random() * validSymbolIds.length)];
            }
            drawBoard(demoBoard);
            updateBalance(balanceAmount);
            updateStats();
            spinning = false;
            spinBtn.disabled = false;
          });
        } else {
          updateBalance(balanceAmount);
          updateStats();
          spinning = false;
          spinBtn.disabled = false;
        }
      });
      return;
    }
    fetch(rgsUrl + "/wallet/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionID: sessionID,
        amount: betAmount,
        mode: "BASE"
      })
    }).then(function(res) { return res.json(); }).then(function(data) {
      if (data.error || data.code) {
        showError(data.error || data.code || "Play failed");
        spinning = false;
        spinBtn.disabled = false;
        return;
      }
      var round = data.round || data;
      var events = round.events || data.events || [];
      var lastWin = 0;
      var newBalance = balanceAmount;
      stats.spins++;
      stats.wagered += betAmount;
      runSpinAnimation(450, validSymbolIds, function() {
        var eventIndex = 0;
        function processNext() {
          if (eventIndex >= events.length) {
            updateBalance(newBalance);
            if (lastWin > 0) {
              stats.won += lastWin;
              winEl.textContent = "Gain: " + formatAmount(lastWin);
              fetch(rgsUrl + "/wallet/end-round", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionID: sessionID })
              }).then(function(r) { return r.json(); }).then(function(d) {
                if (d.balance != null) updateBalance(d.balance.amount != null ? d.balance.amount : d.balance);
              }).catch(function() {});
            }
            updateStats();
            spinning = false;
            spinBtn.disabled = false;
            return;
          }
          var ev = events[eventIndex];
          if (ev.gameType) updateGameMode(ev.gameType);
          if (ev.type === "reveal" && ev.board) {
            drawBoard(ev.board);
            eventIndex++;
            setTimeout(processNext, 0);
          } else if (ev.type === "winInfo" && ev.wins && CONFIG.tumbleEnabled) {
            var posSet = [];
            for (var w = 0; w < ev.wins.length; w++) {
              var pList = ev.wins[w].positions || [];
              for (var k = 0; k < pList.length; k++) posSet.push(String(pList[k][0]) + "," + String(pList[k][1]));
            }
            runExplodeAnimation(posSet, CONFIG.explodeDuration, function() {
              eventIndex++;
              setTimeout(processNext, CONFIG.tumbleDropDuration || 100);
            });
          } else if (ev.type === "winInfo") {
            eventIndex++;
            setTimeout(processNext, 0);
          } else if (ev.type === "setWin" || ev.type === "finalWin") {
            if (ev.amount != null) lastWin = ev.amount;
            if (ev.balance != null) newBalance = ev.balance;
            eventIndex++;
            processNext();
          } else {
            eventIndex++;
            setTimeout(processNext, 0);
          }
        }
        processNext();
      });
    }).catch(function(e) {
      showError("Play: " + (e.message || "network error"));
      spinning = false;
      spinBtn.disabled = false;
    });
  }

  gameEl.innerHTML = "";
  gameEl.appendChild(app.view);
  updateBetDisplay();
  updateStats();
  var validSymbolIds = [];
  if (CONFIG.symbolIdToUrl) {
    for (var i = 0; i < CONFIG.symbolIdToUrl.length; i++) {
      if (CONFIG.symbolIdToUrl[i]) validSymbolIds.push(i);
    }
  }
  if (validSymbolIds.length === 0) validSymbolIds = [0];
  var initialBoard = [];
  for (var c = 0; c < CONFIG.numReels; c++) {
    initialBoard[c] = [];
    for (var r = 0; r < CONFIG.numRows; r++) {
      initialBoard[c][r] = validSymbolIds[(c + r) % validSymbolIds.length];
    }
  }
  drawBoard(initialBoard);

  var betStep = 100000;
  var minBet = 100000;
  var maxBet = 100000000;
  function updateBuyCost() {
    var el = document.getElementById("buyCost");
    if (el) el.textContent = ((betAmount * (CONFIG.freeSpinsCostMultiplier || 100)) / 1000000).toFixed(0);
  }
  document.getElementById("betPlus") && document.getElementById("betPlus").addEventListener("click", function() {
    if (spinning) return;
    betAmount = Math.min(maxBet, betAmount + betStep);
    updateBetDisplay();
    updateBuyCost();
  });
  document.getElementById("betMinus") && document.getElementById("betMinus").addEventListener("click", function() {
    if (spinning) return;
    betAmount = Math.max(minBet, betAmount - betStep);
    updateBetDisplay();
    updateBuyCost();
  });

  var buyBtn = document.getElementById("buyBonus");
  if (buyBtn) {
    var buyCost = (betAmount * (CONFIG.freeSpinsCostMultiplier || 100)) / 1000000;
    document.getElementById("buyCost") && (document.getElementById("buyCost").textContent = buyCost.toFixed(0));
    buyBtn.addEventListener("click", function() {
      if (spinning || balanceAmount < betAmount * (CONFIG.freeSpinsCostMultiplier || 100)) return;
      play();
    });
  }

  authenticate().then(function() {
    spinBtn.addEventListener("click", play);
  });
  }
  runGame();
})();
  </script>
</body>
</html>
`;
}
