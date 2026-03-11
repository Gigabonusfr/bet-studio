import type { RgsRoundEvent } from "./types";

export type RgsSession = {
  balance: number;
  minBet: number;
  maxBet: number;
  stepBet: number;
  currency: string;
};

export type RgsPlayResponse = {
  events: RgsRoundEvent[];
  balance?: number;
  payoutMultiplier?: number;
};

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  const rgsUrl = (params.get("rgs_url") || "").replace(/\/$/, "");
  const sessionID = params.get("sessionID") || params.get("sessionId") || "";
  const demo = params.get("demo");
  const demoMode = demo === "1" || demo === "true" || (!!demo && !rgsUrl);
  return { params, rgsUrl, sessionID, demoMode };
}

export function getRgsBootstrap() {
  return parseParams();
}

export async function rgsAuthenticate(): Promise<RgsSession> {
  const { rgsUrl, sessionID, demoMode } = parseParams();
  if (demoMode) {
    return { balance: 10_000 * 1_000_000, minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000, currency: "USD" };
  }
  if (!rgsUrl || !sessionID) throw new Error("Missing rgs_url or sessionID");
  const res = await fetch(`${rgsUrl}/wallet/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionID, lang: "en", device: "desktop" }),
  });
  if (!res.ok) throw new Error(`Authenticate failed: ${res.status}`);
  const data = await res.json();
  const bal = data.balance;
  const amount = bal && typeof bal === "object" && bal.amount != null ? Number(bal.amount) : Number(bal ?? 0);
  return {
    balance: Number.isFinite(amount) ? amount : 0,
    minBet: Number(data.minBet ?? data.config?.minBet ?? 100_000),
    maxBet: Number(data.maxBet ?? data.config?.maxBet ?? 100_000_000),
    stepBet: Number(data.stepBet ?? data.config?.stepBet ?? 100_000),
    currency: String(data.currency ?? "USD"),
  };
}

export async function rgsPlay(amount: number): Promise<RgsPlayResponse> {
  const { rgsUrl, sessionID, demoMode } = parseParams();
  if (demoMode) {
    const numReels = 5;
    const numRows = 3;
    const board: number[][] = Array.from({ length: numReels }, () =>
      Array.from({ length: numRows }, () => Math.floor(Math.random() * 12))
    );
    const win = Math.random() < 0.25 ? Math.floor(amount * (0.5 + Math.random() * 2)) : 0;
    const events: RgsRoundEvent[] = [
      { type: "reveal", board, gameType: "basegame" },
      { type: "winInfo", wins: [] },
      { type: "setWin", amount: win },
      { type: "finalWin", amount: win },
    ];
    return { events };
  }
  if (!rgsUrl || !sessionID) throw new Error("Missing rgs_url or sessionID");
  const res = await fetch(`${rgsUrl}/wallet/play`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionID, amount, mode: "BASE" }),
  });
  if (!res.ok) throw new Error(`Play failed: ${res.status}`);
  const data = await res.json();
  const round = data.round || data;
  return {
    events: (round.events ?? data.events ?? []) as RgsRoundEvent[],
    payoutMultiplier: data.payoutMultiplier,
    balance: data.balance,
  };
}

export async function rgsEndRound(): Promise<void> {
  const { rgsUrl, sessionID, demoMode } = parseParams();
  if (demoMode) return;
  if (!rgsUrl || !sessionID) return;
  await fetch(`${rgsUrl}/wallet/end-round`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionID }),
  }).catch(() => {});
}

