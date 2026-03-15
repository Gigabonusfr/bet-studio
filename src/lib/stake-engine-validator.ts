/**
 * Stake Engine Export Validator
 * Runs all validation checks before allowing ZIP export
 */
import type { GameConfig } from "@/types/game-config";
import type { MathConfig } from "@/context/MathConfigContext";
import type { SlotControlsConfig } from "@/types/slot-controls";
import { isOfficialTemplate } from "@/data/official-stake-templates";

export type ValidationLevel = "pass" | "warning" | "error";

export interface ValidationResult {
  id: string;
  category: "math" | "betmodes" | "files" | "rgs" | "frontend";
  label: string;
  level: ValidationLevel;
  message: string;
}

export interface ValidateExportOptions {
  /** En mode strict, certaines règles recommandées deviennent bloquantes (noms de modes, FR0, reelstrip 30+). */
  strictForStake?: boolean;
}

const STRICT_ERROR_IDS = [
  "math-reelstrip-length",
  "math-fr0",
  "betmodes-base-name",
  "betmodes-bonus-name",
];

export function validateExport(
  config: GameConfig,
  mathConfig: MathConfig,
  controlsConfig?: SlotControlsConfig,
  options?: ValidateExportOptions
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // ═══ MATH VALIDATION ═══

  // 1. All reelstrip symbols exist in paytable or special_symbols
  const paytableSymbols = new Set(config.symbols.map((s) => s.name));
  const allReelSymbols = new Set<string>();
  [...mathConfig.basegameStrips, ...mathConfig.freegameStrips].forEach((strip) => {
    strip.reels.forEach((reel) => reel.forEach((sym) => allReelSymbols.add(sym)));
  });

  const unknownSymbols = [...allReelSymbols].filter((s) => !paytableSymbols.has(s));
  results.push({
    id: "math-symbols-valid",
    category: "math",
    label: "Symboles reelstrip valides",
    level: unknownSymbols.length > 0 ? "error" : "pass",
    message: unknownSymbols.length > 0
      ? `Symboles inconnus dans les reelstrips : ${unknownSymbols.join(", ")}. Ajoutez-les dans la paytable ou special_symbols.`
      : "Tous les symboles des reelstrips existent dans la configuration.",
  });

  // 2. WILD defined
  const hasWild = config.symbols.some((s) => s.type === "wild");
  results.push({
    id: "math-wild-defined",
    category: "math",
    label: "WILD défini",
    level: hasWild ? "pass" : "warning",
    message: hasWild ? "Un symbole WILD est configuré." : "Aucun symbole WILD — la plupart des slots en nécessitent un.",
  });

  // 3. Scatter if freespins enabled
  const hasScatter = config.symbols.some((s) => s.type === "scatter");
  if (config.freeSpins.enabled) {
    results.push({
      id: "math-scatter-required",
      category: "math",
      label: "SCATTER défini (freespins actifs)",
      level: hasScatter ? "pass" : "error",
      message: hasScatter ? "Scatter configuré pour déclencher les free spins." : "Free spins activés mais aucun symbole SCATTER — les free spins ne pourront jamais se déclencher.",
    });
  }

  // 4. Paytable kind minimum
  const minKindRequired = config.numReels >= 4 ? 2 : 3;
  const allKinds = config.symbols
    .filter((s) => s.type !== "wild" && s.type !== "scatter")
    .flatMap((s) => Object.keys(s.paytable).map(Number));
  const smallestKind = allKinds.length > 0 ? Math.min(...allKinds) : 0;
  results.push({
    id: "math-paytable-kind",
    category: "math",
    label: "Paytable kind cohérent",
    level: smallestKind >= minKindRequired ? "pass" : "warning",
    message: smallestKind >= minKindRequired
      ? `Kind minimum = ${smallestKind} (OK pour ${config.numReels} reels).`
      : `Kind minimum = ${smallestKind} très bas pour ${config.numReels} reels (recommandé: ${minKindRequired}+).`,
  });

  // 5. Wincap > max payout
  const maxPayout = Math.max(0, ...config.symbols.flatMap((s) => Object.values(s.paytable)));
  results.push({
    id: "math-wincap",
    category: "math",
    label: "Wincap cohérent",
    level: mathConfig.wincap > maxPayout ? "pass" : "error",
    message: mathConfig.wincap > maxPayout
      ? `Wincap (${mathConfig.wincap}x) > max payout (${maxPayout}x).`
      : `⛔ Wincap (${mathConfig.wincap}x) ≤ max payout (${maxPayout}x) — l'optimisation échouera.`,
  });

  // 6. RTP estimate bounds (rough check) — ignoré pour templates officiels (maths d'origine Stake)
  const isOfficial = isOfficialTemplate(config.gameId);
  const rtpEstimate = estimateRoughRTP(config, mathConfig);
  let rtpLevel: ValidationLevel = "pass";
  let rtpMessage: string;
  if (isOfficial) {
    rtpMessage = `Template officiel ${config.gameId} — maths d'origine Stake Engine, export autorisé.`;
  } else {
    if (rtpEstimate < 50 || rtpEstimate > 100) rtpLevel = "error";
    else if (Math.abs(rtpEstimate - config.rtpTarget) > 10) rtpLevel = "warning";
    rtpMessage =
      rtpLevel === "error"
        ? `⛔ RTP estimé ${rtpEstimate.toFixed(1)}% hors bornes [50%-100%]. Ajustez paytable ou reelstrips.`
        : rtpLevel === "warning"
        ? `RTP estimé ${rtpEstimate.toFixed(1)}% s'écarte de la cible ${config.rtpTarget}%. L'optimisation corrigera.`
        : `RTP estimé ~${rtpEstimate.toFixed(1)}%, proche de la cible ${config.rtpTarget}%.`;
  }
  results.push({
    id: "math-rtp-bounds",
    category: "math",
    label: "RTP estimé dans les bornes",
    level: rtpLevel,
    message: rtpMessage,
  });

  // 7. Reelstrip minimum positions (error < 20, warning 20–29)
  const allStrips = [...mathConfig.basegameStrips, ...mathConfig.freegameStrips];
  const stripsUnder20 = allStrips.filter((s) => s.reels.some((r) => r.length < 20));
  const stripsUnder30 = allStrips.filter((s) => s.reels.some((r) => r.length >= 20 && r.length < 30));
  results.push({
    id: "math-reelstrip-length",
    category: "math",
    label: "Longueur reelstrips (min 20)",
    level: stripsUnder20.length > 0 ? "error" : stripsUnder30.length > 0 ? "warning" : "pass",
    message: stripsUnder20.length > 0
      ? `Reelstrips trop courtes (< 20) : ${stripsUnder20.map((s) => s.id).join(", ")} — obligatoire 20+ positions/reel.`
      : stripsUnder30.length > 0
      ? `Reelstrips avec 20–29 positions : ${stripsUnder30.map((s) => s.id).join(", ")} — recommandé 30+ pour les simulations Stake.`
      : "Toutes les reelstrips ont une longueur suffisante (30+).",
  });

  // 7b. Nombre de rouleaux cohérent avec la grille (config.numReels)
  const stripsWrongReelCount = allStrips.filter((s) => s.reels.length !== config.numReels);
  results.push({
    id: "math-reelstrip-reel-count",
    category: "math",
    label: "Nombre de rouleaux (reelstrip = grille)",
    level: stripsWrongReelCount.length > 0 ? "error" : "pass",
    message: stripsWrongReelCount.length > 0
      ? `Reelstrip(s) avec un mauvais nombre de rouleaux : ${stripsWrongReelCount.map((s) => s.id).join(", ")} (${stripsWrongReelCount[0]?.reels.length ?? 0} au lieu de ${config.numReels}).`
      : `Toutes les reelstrips ont ${config.numReels} rouleau(x), conforme à la grille.`,
  });

  // 8. BR0 present
  const hasBR0 = mathConfig.basegameStrips.some((s) => s.id === "BR0");
  results.push({
    id: "math-br0",
    category: "math",
    label: "BR0.csv présent",
    level: hasBR0 ? "pass" : "error",
    message: hasBR0 ? "Reelstrip basegame BR0 configurée." : "⛔ Aucune reelstrip BR0 — obligatoire.",
  });

  // 9. FR0 if freespins
  if (config.freeSpins.enabled) {
    const hasFR0 = mathConfig.freegameStrips.some((s) => s.id === "FR0");
    results.push({
      id: "math-fr0",
      category: "math",
      label: "FR0.csv présent (freespins actifs)",
      level: hasFR0 ? "pass" : "warning",
      message: hasFR0 ? "Reelstrip freegame FR0 configurée." : "Pas de FR0 — une sera auto-générée à l'export avec +50% de WILDS.",
    });
  }

  // 10. Paylines defined when winMechanic is "lines"
  if (config.winMechanic === "lines") {
    const hasPaylines = typeof config.numPaylines === "number" && config.numPaylines > 0;
    results.push({
      id: "math-paylines-defined",
      category: "math",
      label: "Paylines défini (mode lines)",
      level: hasPaylines ? "pass" : "error",
      message: hasPaylines
        ? `${config.numPaylines} payline(s) configurée(s).`
        : "⛔ Mode paylines activé mais numPaylines absent ou ≤ 0 — obligatoire.",
    });
  }

  // 11. WILD and SCATTER on every reel of BR0
  const br0 = mathConfig.basegameStrips.find((s) => s.id === "BR0");
  if (br0 && hasWild) {
    const wildName = config.symbols.find((s) => s.type === "wild")?.name || "WILD";
    const reelsWithoutWild = br0.reels.filter((reel) => !reel.includes(wildName));
    results.push({
      id: "math-wild-on-all-reels",
      category: "math",
      label: "WILD sur chaque rouleau",
      level: reelsWithoutWild.length > 0 ? "warning" : "pass",
      message: reelsWithoutWild.length > 0
        ? `${reelsWithoutWild.length} rouleau(x) sans WILD dans BR0.`
        : "WILD présent sur tous les rouleaux de BR0.",
    });
  }

  // ═══ BETMODES VALIDATION ═══

  results.push({
    id: "betmodes-base",
    category: "betmodes",
    label: 'Mode "base" avec cost=1.0',
    level: config.baseBetMode.cost === 1.0 ? "pass" : "warning",
    message: config.baseBetMode.cost === 1.0
      ? "Mode base configuré avec cost=1.0."
      : `Mode base avec cost=${config.baseBetMode.cost} — standard est 1.0.`,
  });

  if (config.freeSpins.enabled) {
    results.push({
      id: "betmodes-bonus-cost",
      category: "betmodes",
      label: "Mode bonus cost > 1.0",
      level: config.freeSpins.costMultiplier > 1.0 ? "pass" : "error",
      message: config.freeSpins.costMultiplier > 1.0
        ? `Mode bonus configuré avec cost=${config.freeSpins.costMultiplier}x.`
        : `⛔ Mode bonus avec cost=${config.freeSpins.costMultiplier} — doit être > 1.0.`,
    });
  }

  // Noms de modes recommandés pour publication Stake (base, bonus/freegame)
  results.push({
    id: "betmodes-base-name",
    category: "betmodes",
    label: "Nom du mode base (recommandé)",
    level: config.baseBetMode.name === "base" ? "pass" : "warning",
    message: config.baseBetMode.name === "base"
      ? "Mode base nommé 'base' — conforme à l'exemple Stake."
      : "Pour une publication Stake, le mode base est recommandé avec le nom 'base'.",
  });
  if (config.freeSpins.enabled) {
    const bonusNameOk = ["bonus", "freegame"].includes(config.freeSpins.modeName);
    results.push({
      id: "betmodes-bonus-name",
      category: "betmodes",
      label: "Nom du mode bonus (recommandé)",
      level: bonusNameOk ? "pass" : "warning",
      message: bonusNameOk
        ? `Mode bonus nommé '${config.freeSpins.modeName}' — conforme à l'exemple Stake.`
        : "Pour une publication Stake, le mode bonus est recommandé avec le nom 'bonus' ou 'freegame'.",
    });
  }

  // ═══ FILES / RGS VALIDATION ═══

  // Game ID format
  const gameIdRegex = /^[a-z0-9_-]+$/;
  const gameId = config.gameId || config.gameName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  results.push({
    id: "files-game-id",
    category: "rgs",
    label: "Game ID valide",
    level: gameIdRegex.test(gameId) ? "pass" : "error",
    message: gameIdRegex.test(gameId)
      ? `Game ID "${gameId}" est valide.`
      : `⛔ Game ID "${gameId}" contient des caractères invalides. Utilisez uniquement a-z, 0-9, _, -.`,
  });

  // Version format
  const versionRegex = /^\d+\.\d+\.\d+$/;
  results.push({
    id: "files-version",
    category: "rgs",
    label: "Version semver",
    level: versionRegex.test(config.gameVersion) ? "pass" : "warning",
    message: versionRegex.test(config.gameVersion)
      ? `Version ${config.gameVersion} au format semver.`
      : `Version "${config.gameVersion}" n'est pas au format semver (ex: 1.0.0).`,
  });

  // ═══ FRONTEND / BRANDING CHECKS (Stake guidelines) ═══

  // 1) Titre ne contient pas de termes protégés (Megaways, Xways, etc.)
  const forbiddenTitleRegex = /(megaways|x[-\s]?ways)/i;
  const titleHasForbidden = forbiddenTitleRegex.test(config.gameName) || forbiddenTitleRegex.test(gameId);
  results.push({
    id: "frontend-title-forbidden",
    category: "frontend",
    label: "Titre sans marque protégée",
    level: titleHasForbidden ? "error" : "pass",
    message: titleHasForbidden
      ? "⛔ Le nom du jeu ou l'ID contient un terme protégé (Megaways, Xways, etc.). Choisissez un autre titre."
      : "Le titre ne contient pas de termes protégés (Megaways, Xways, ...).",
  });

  // 2) Background présent (pour éviter une tile trop vide)
  const hasBackground =
    !!config.backgroundUrl ||
    !!config.backgroundImage ||
    !!(config as any).assetsConfig?.backgroundAsset;
  results.push({
    id: "frontend-background-present",
    category: "frontend",
    label: "Background défini",
    level: hasBackground ? "pass" : "warning",
    message: hasBackground
      ? "Un background est défini pour le front (image ou vidéo)."
      : "Aucun background défini — la vignette / le front risquent d'être trop vides.",
  });

  // 3) Toggle audio recommandé si des sons sont actifs
  const anySoundEnabled =
    config.audio.enabled &&
    (config.audio.spinSound ||
      config.audio.reelStopSound ||
      config.audio.winSound ||
      config.audio.bigWinSound ||
      config.audio.freeSpinsTriggerSound ||
      config.audio.freeSpinsWinSound ||
      config.audio.bonusBuySound ||
      config.audio.nearMissSound ||
      config.audio.multiplierSound ||
      config.audio.ambientSound ||
      config.audio.buttonClickSound);
  const masterMuteFlag = (config.audio as any).masterMuteAvailable;
  const hasExplicitMuteOff = masterMuteFlag === false;
  results.push({
    id: "frontend-audio-toggle",
    category: "frontend",
    label: "Option pour couper les sons",
    level: anySoundEnabled ? (hasExplicitMuteOff ? "warning" : "pass") : "pass",
    message: !anySoundEnabled
      ? "Aucun son activé — bouton mute optionnel."
      : hasExplicitMuteOff
      ? "Des sons sont activés. Assurez-vous qu'un bouton UI permet de couper musique/sons conformément aux guidelines Stake."
      : "Des sons sont activés et l'UX inclut un bouton master mute (ou équivalent).",
  });

  // 4) Mots/expressions sensibles pour Stake.US dans les labels principaux
  const stakeUsForbiddenRegex = /\b(jackpot|lottery|raffle|stake\.us|stakeus|stake\.com|crypto|bitcoin|ether(eum)?|casino)\b/i;
  const stakeTextFields: { field: string; value: string }[] = [
    { field: "gameName", value: config.gameName || "" },
    { field: "freeSpins.modeName", value: config.freeSpins?.modeName || "" },
  ];
  const stakeUsHits = stakeTextFields
    .filter((t) => t.value && stakeUsForbiddenRegex.test(t.value))
    .map((t) => `${t.field}="${t.value}"`);

  results.push({
    id: "frontend-stakeus-forbidden-words",
    category: "frontend",
    label: "Mots sensibles Stake.US dans les labels",
    level: stakeUsHits.length > 0 ? "warning" : "pass",
    message:
      stakeUsHits.length === 0
        ? "Aucun mot sensible Stake.US détecté dans le nom du jeu ou les labels principaux."
        : `Certains labels contiennent des mots sensibles pour Stake.US (${stakeUsHits.join(
            ", "
          )}). Vérifiez la checklist Stake.US (remplacer ou prévoir des variantes).`,
  });

  // 5) Confirmation d'achat de bonus (bonus buy)
  const hasBonusBuyFrontend = config.freeSpins.enabled && config.freeSpins.costMultiplier > 1.0;
  results.push({
    id: "frontend-bonus-buy-confirmation",
    category: "frontend",
    label: "Confirmation d'achat de bonus",
    level: hasBonusBuyFrontend ? "pass" : "pass",
    message: hasBonusBuyFrontend
      ? "Le mode Bonus Buy est actif et l'UX du builder affiche un dialogue de confirmation avant l'achat (compatible Stake/Stake.US)."
      : "Aucun Bonus Buy configuré — pas de confirmation spécifique nécessaire.",
  });

  // 6) HUD / contrôles de base visibles (balance, mise, spin, turbo)
  const hudBalanceVisible = controlsConfig ? controlsConfig.balance?.visible !== false : true;
  const hudBetVisible = controlsConfig ? controlsConfig.bet?.visible !== false : true;
  const turboRelevant = config.animation?.turboMode;
  const turboToggleVisible = controlsConfig ? controlsConfig.turbo?.visible !== false : false;

  results.push({
    id: "frontend-hud-values",
    category: "frontend",
    label: "HUD: balance / mise visibles",
    level: hudBalanceVisible && hudBetVisible ? "pass" : "warning",
    message:
      hudBalanceVisible && hudBetVisible
        ? "Balance et mise sont affichées dans la barre de contrôle."
        : "Balance ou mise sont masquées dans la barre de contrôle — Stake recommande d'afficher clairement ces valeurs.",
  });

  results.push({
    id: "frontend-controls-spin",
    category: "frontend",
    label: "Bouton SPIN présent",
    level: "pass",
    message: "Le bouton SPIN est toujours présent dans les layouts actuels (non masquable via SlotControls).",
  });

  if (turboRelevant) {
    results.push({
      id: "frontend-controls-turbo",
      category: "frontend",
      label: "Toggle TURBO disponible",
      level: turboToggleVisible ? "pass" : "warning",
      message: turboToggleVisible
        ? "Le mode TURBO est activable/désactivable dans la barre de contrôle."
        : "Le mode TURBO est actif dans la config animation, mais aucun toggle n'est visible dans la barre. Vérifiez que l'utilisateur peut le contrôler.",
    });
  }

  // 7) Wording supplémentaire sur CTA / labels sensibles (hors Stake.US)
  const ctaForbiddenRegex = /\b(gamble|double or nothing|double-or-nothing|all in|all-in)\b/i;
  const ctaTextFields: { field: string; value: string }[] = [
    { field: "balance.label", value: controlsConfig?.balance?.label || "" },
    { field: "freeSpins.modeName", value: config.freeSpins?.modeName || "" },
  ];
  const ctaHits = ctaTextFields
    .filter((t) => t.value && ctaForbiddenRegex.test(t.value))
    .map((t) => `${t.field}="${t.value}"`);

  results.push({
    id: "frontend-cta-wording",
    category: "frontend",
    label: "Wording CTA sensible",
    level: ctaHits.length > 0 ? "warning" : "pass",
    message:
      ctaHits.length === 0
        ? "Aucun wording critique détecté dans les principaux labels CTA."
        : `Certains labels utilisent un wording sensible (${ctaHits.join(
            ", "
          )}). Vérifiez la checklist Stake/Stake.US (renommer ou contextualiser).`,
  });

  // Mode strict pour soumission Stake : certaines recommandations deviennent bloquantes
  if (options?.strictForStake) {
    return results.map((r) =>
      r.level === "warning" && STRICT_ERROR_IDS.includes(r.id) ? { ...r, level: "error" as const } : r
    );
  }
  return results;
}

export function hasBlockingErrors(results: ValidationResult[]): boolean {
  return results.some((r) => r.level === "error");
}

/**
 * Quick rough RTP estimate from basegame reelstrip + paytable
 */
function estimateRoughRTP(config: GameConfig, mathConfig: MathConfig): number {
  const strip = mathConfig.basegameStrips[0];
  if (!strip) return 96;

  const reelLengths = strip.reels.map((r) => r.length);
  const symbolFreqs: Record<string, number[]> = {};

  strip.reels.forEach((reel, reelIndex) => {
    reel.forEach((sym) => {
      if (!symbolFreqs[sym]) symbolFreqs[sym] = Array(config.numReels).fill(0);
      symbolFreqs[sym][reelIndex]++;
    });
  });

  let totalRtp = 0;

  if (config.winMechanic === "ways") {
    config.symbols.forEach((symbol) => {
      if (symbol.type === "scatter" || symbol.type === "wild") return;
      const freqs = symbolFreqs[symbol.name] || Array(config.numReels).fill(0);

      for (let wayCount = 3; wayCount <= config.numReels; wayCount++) {
        const payout = symbol.paytable[wayCount] || 0;
        if (payout <= 0) continue;

        // P(win) = Π(count_on_reel_i / reel_length_i) * numRows^(numReels - kind)
        let prob = 1;
        for (let r = 0; r < wayCount; r++) {
          prob *= (freqs[r] || 0) / (reelLengths[r] || 1);
        }
        // ways = product of matching rows per reel, but for RTP we multiply by numRows^(reels-kind)
        // since non-matching reels don't matter
        const waysOnMatchingReels = 1; // already accounted for in freq
        totalRtp += prob * payout * Math.pow(config.numRows, wayCount);
        // Divide by numRows^wayCount to normalize back per single position
        // Actually for ways: RTP = Σ prob_ways * payout where prob_ways includes the ways count
        // Simplified: each reel contributes freq/reelLen, ways = Π(freq_i), payout per way
      }
    });
    // Normalize: ways already has the multiplication factor from frequencies
    totalRtp *= 100;
  } else if (config.winMechanic === "lines") {
    config.symbols.forEach((symbol) => {
      if (symbol.type === "scatter" || symbol.type === "wild") return;
      const freqs = symbolFreqs[symbol.name] || Array(config.numReels).fill(0);

      for (let matchCount = 3; matchCount <= config.numReels; matchCount++) {
        const payout = symbol.paytable[matchCount] || 0;
        if (payout <= 0) continue;

        let prob = 1;
        for (let r = 0; r < matchCount; r++) {
          prob *= (freqs[r] || 0) / (reelLengths[r] || 1);
        }
        totalRtp += prob * payout * (config.numPaylines || 1);
      }
    });
    totalRtp *= 100;
  } else {
    // Cluster / scatter — use grid-based approximation
    const totalReelSymbols = reelLengths.reduce((a, b) => a + b, 0);
    const gridSize = config.numReels * config.numRows;

    config.symbols.forEach((symbol) => {
      if (symbol.type === "scatter" || symbol.type === "wild") return;
      const totalCount = Object.values(symbolFreqs[symbol.name] || {}).reduce((a: number, b: number) => a + b, 0);
      const symProb = totalCount / totalReelSymbols;
      const expectedOnGrid = symProb * gridSize;

      Object.entries(symbol.paytable).forEach(([countStr, payout]) => {
        const count = Number(countStr);
        if (payout <= 0) return;

        const mean = expectedOnGrid;
        const stddev = Math.sqrt(gridSize * symProb * (1 - symProb));
        if (stddev === 0) return;

        const z = (count - 0.5 - mean) / stddev;
        const t = 1 / (1 + 0.3275911 * Math.abs(z / Math.sqrt(2)));
        const erfApprox = 1 - (0.254829592 * t - 0.284496736 * t * t + 1.421413741 * t * t * t - 1.453152027 * t * t * t * t + 1.061405429 * t * t * t * t * t) * Math.exp(-(z * z) / 2);
        const cdfVal = 0.5 * (1 + (z >= 0 ? erfApprox : -erfApprox));
        const prob = Math.max(0, 1 - cdfVal);

        totalRtp += prob * payout;
      });
    });
    totalRtp *= 100;
  }

  // Basegame typically contributes 60-70% of total RTP
  return Math.min(Math.max(totalRtp * 0.65, 30), 120);
}
