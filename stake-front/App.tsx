import { useEffect, useMemo, useState } from "react";
import type { EmbedConfig, RgsRoundEvent } from "./types";
import { getRgsBootstrap, rgsAuthenticate, rgsEndRound, rgsPlay } from "./rgs";
import "./styles.css";

function formatAmount(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return (Number(n) / 1_000_000).toFixed(2);
}

function normalizeBoard(board: any, numReels: number, numRows: number): number[][] | null {
  if (!board) return null;
  if (Array.isArray(board) && Array.isArray(board[0]) && typeof board[0][0] === "number") {
    return board as number[][];
  }
  if (Array.isArray(board) && Array.isArray(board[0]) && board[0][0] && typeof board[0][0] === "object") {
    // board[col][row] = {symbolId}
    return (board as any[][]).map((col) => col.map((cell) => Number(cell?.symbolId ?? cell ?? 0)));
  }
  // Unknown format
  return Array.from({ length: numReels }, () => Array.from({ length: numRows }, () => 0));
}

export function App() {
  const [embed, setEmbed] = useState<EmbedConfig | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [bet, setBet] = useState<number>(1_000_000);
  const [minBet, setMinBet] = useState<number>(100_000);
  const [maxBet, setMaxBet] = useState<number>(100_000_000);
  const [stepBet, setStepBet] = useState<number>(100_000);
  const [board, setBoard] = useState<number[][] | null>(null);
  const [win, setWin] = useState<number | null>(null);
  const [gameType, setGameType] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  const { rgsUrl, sessionID, demoMode } = useMemo(() => getRgsBootstrap(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("./embed-config.json", { cache: "no-store" });
        if (!res.ok) throw new Error("embed-config.json introuvable");
        const json = (await res.json()) as EmbedConfig;
        if (!cancelled) {
          setEmbed(json);
          if (json.defaultBetAmount) setBet(json.defaultBetAmount);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Impossible de charger embed-config.json");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!embed) return;
    let cancelled = false;
    (async () => {
      try {
        setErr("");
        const s = await rgsAuthenticate();
        if (cancelled) return;
        setBalance(s.balance);
        setMinBet(s.minBet);
        setMaxBet(s.maxBet);
        setStepBet(s.stepBet);
        setBet((prev) => Math.min(s.maxBet, Math.max(s.minBet, prev || embed.defaultBetAmount || s.minBet)));
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Authenticate failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [embed]);

  async function spin() {
    if (!embed) return;
    if (!demoMode && (!rgsUrl || !sessionID)) {
      setErr("Paramètres manquants: ?sessionID=...&rgs_url=... (ou ?demo=1)");
      return;
    }
    if (balance != null && balance < bet) {
      setErr("Solde insuffisant (ERR_IPB)");
      return;
    }
    setBusy(true);
    setErr("");
    setWin(null);
    try {
      const res = await rgsPlay(bet);
      const events = res.events || [];
      applyEvents(events);
      await rgsEndRound();
    } catch (e: any) {
      setErr(e?.message || "Play failed");
    } finally {
      setBusy(false);
    }
  }

  function applyEvents(events: RgsRoundEvent[]) {
    if (!embed) return;
    for (const ev of events) {
      if (ev && typeof ev === "object" && (ev as any).gameType) setGameType(String((ev as any).gameType));
      if (ev.type === "reveal") {
        const nb = normalizeBoard((ev as any).board, embed.numReels, embed.numRows);
        if (nb) setBoard(nb);
      } else if (ev.type === "setWin" || ev.type === "finalWin") {
        if ((ev as any).amount != null) setWin(Number((ev as any).amount));
        if ((ev as any).balance != null) setBalance(Number((ev as any).balance));
      } else if (ev.type === "winInfo") {
        if ((ev as any).balance != null) setBalance(Number((ev as any).balance));
      }
    }
  }

  const gridStyle = useMemo(() => {
    if (!embed) return {};
    return { gridTemplateColumns: `repeat(${embed.numReels}, 72px)` };
  }, [embed]);

  const pageStyle = useMemo(() => {
    if (!embed?.bodyBackgroundUrl) return undefined;
    return {
      background: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.8)), url(${embed.bodyBackgroundUrl}) center/cover no-repeat`,
    } as const;
  }, [embed?.bodyBackgroundUrl]);

  const wrapperStyle = useMemo(() => {
    const borderColor = embed?.gridBorderColor || "#ffd700";
    const style = embed?.gridBorderStyle || "glow";
    const boxShadow =
      style === "glow"
        ? `0 0 22px ${borderColor}40, 0 0 44px ${borderColor}22`
        : style === "neon"
          ? `0 0 14px ${borderColor}55`
          : "0 0 22px rgba(255, 215, 0, 0.12)";
    const border = style === "none" ? "2px solid rgba(255,255,255,0.08)" : `2px solid ${borderColor}55`;
    return { border, boxShadow, background: embed?.reelColor ? `${embed.reelColor}22` : undefined } as const;
  }, [embed?.gridBorderColor, embed?.gridBorderStyle, embed?.reelColor]);

  const canRender = !!embed;

  return (
    <div className="page" style={pageStyle}>
      <h1 className="title">{embed?.gameName || "Slot"}</h1>
      <p className="subtitle">
        {demoMode ? "Mode démo — ?demo=1" : "Stake Engine — charge via ?sessionID=...&rgs_url=..."}
        {gameType ? ` • ${gameType}` : ""}
      </p>

      <div className="wrapper" style={wrapperStyle}>
        <div className="grid" style={gridStyle as any}>
          {canRender &&
            Array.from({ length: embed!.numReels }).flatMap((_, c) =>
              Array.from({ length: embed!.numRows }).map((__, r) => {
                const symbolId = board?.[c]?.[r] ?? null;
                const url = symbolId != null ? embed!.symbolIdToUrl?.[symbolId] ?? null : null;
                const name = symbolId != null ? embed!.symbolIdToName?.[symbolId] ?? null : null;
                return (
                  <div key={`${c}-${r}`} className="cell">
                    {url ? <img src={url} alt={name || String(symbolId)} /> : <span className="fallback">{name || "?"}</span>}
                  </div>
                );
              })
            )}
        </div>
      </div>

      <div className="hud">
        <div className="pill">
          <span className="label">BALANCE</span>
          <span className="value">{formatAmount(balance)}</span>
        </div>
        <div className="pill">
          <span className="label">BET</span>
          <span className="value">{formatAmount(bet)}</span>
        </div>
        <button className="btn" disabled={busy || bet <= minBet} onClick={() => setBet((b) => Math.max(minBet, b - stepBet))}>
          −
        </button>
        <button className="btn" disabled={busy || bet >= maxBet} onClick={() => setBet((b) => Math.min(maxBet, b + stepBet))}>
          +
        </button>
        <button className="btn btnPrimary" disabled={busy || !embed} onClick={spin}>
          {busy ? "SPIN..." : "SPIN"}
        </button>
        <div className="pill">
          <span className="label">WIN</span>
          <span className="value">{formatAmount(win)}</span>
        </div>
      </div>

      {err ? <div className="err">{err}</div> : null}
    </div>
  );
}

