/**
 * Client RGS Stake Engine — /wallet/authenticate, /wallet/play, /wallet/end-round
 * Front = animateur uniquement : reçoit les events JSON et affiche, ne recalcule pas.
 */

/** Session retournée par /wallet/authenticate */
export interface RgsSession {
  sessionId: string;
  balance: number; // entier 6 décimales implicites (1000000 = 1.00)
  minBet: number;
  maxBet: number;
  stepBet: number;
  currency: string;
}

/** Un gain (ligne/cluster) dans winInfo */
export interface RgsWinEvent {
  symbolId?: number;
  positions?: [number, number][];
  multiplier?: number;
  [key: string]: unknown;
}

/** Event d'un round (reveal, winInfo, setWin, finalWin, freeSpinsTrigger) */
export interface RgsRoundEvent {
  type: "reveal" | "winInfo" | "setWin" | "finalWin" | "freeSpinsTrigger";
  /** Board avec symbolId numériques [reel][row] */
  board?: number[][];
  wins?: RgsWinEvent[];
  /** Montant (setWin/finalWin) */
  amount?: number;
  balance?: number;
  gameType?: "basegame" | "freegame";
  /** freeSpinsTrigger : nombre de scatters et free spins accordés (4 scatters min → 2 par scatter) */
  scatterCount?: number;
  freeSpinsAwarded?: number;
  [key: string]: unknown;
}

/** Réponse /wallet/play = liste d'events du round */
export interface RgsPlayResponse {
  events: RgsRoundEvent[];
  payoutMultiplier?: number;
  balance?: number;
}

export interface RgsClientConfig {
  baseUrl: string;
  sessionId?: string;
}

/**
 * Client RGS — appels réels /wallet/authenticate, /wallet/play, /wallet/end-round
 */
export class RgsClient {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(config: RgsClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    if (config.sessionId) this.sessionId = config.sessionId;
  }

  async authenticate(): Promise<RgsSession> {
    const res = await fetch(`${this.baseUrl}/wallet/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionID: this.sessionId ?? undefined,
        lang: "en",
        device: "desktop",
      }),
    });
    if (!res.ok) throw new Error(`RGS authenticate failed: ${res.status}`);
    const data = await res.json();
    this.sessionId = data.sessionId ?? data.sessionID ?? this.sessionId ?? "";
    return {
      sessionId: this.sessionId,
      balance: data.balance ?? 0,
      minBet: data.minBet ?? 1,
      maxBet: data.maxBet ?? 100,
      stepBet: data.stepBet ?? 1,
      currency: data.currency ?? "USD",
    };
  }

  async play(bet: number, gameId?: string): Promise<RgsPlayResponse> {
    if (!this.sessionId) throw new Error("Not authenticated");
    const body: { sessionID: string; bet: number; gameId?: string } = {
      sessionID: this.sessionId,
      bet,
    };
    if (gameId) body.gameId = gameId;
    const res = await fetch(`${this.baseUrl}/wallet/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`RGS play failed: ${res.status}`);
    const data = await res.json();
    return {
      events: data.events ?? [],
      payoutMultiplier: data.payoutMultiplier,
      balance: data.balance,
    };
  }

  async endRound(): Promise<void> {
    if (!this.sessionId) return;
    await fetch(`${this.baseUrl}/wallet/end-round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionID: this.sessionId }),
    });
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

/**
 * Mock RGS — pour dev sans backend. Génère des events cohérents (reveal + winInfo + setWin + finalWin).
 */
export class MockRgsClient {
  private balance = 100 * 1_000_000; // 100.00
  private sessionId = "mock-session-" + Date.now();

  async authenticate(): Promise<RgsSession> {
    return {
      sessionId: this.sessionId,
      balance: this.balance,
      minBet: 1_000_000, // 1.00
      maxBet: 100 * 1_000_000,
      stepBet: 1_000_000,
      currency: "USD",
    };
  }

  async play(bet: number, _gameId?: string): Promise<RgsPlayResponse> {
    if (bet > this.balance) {
      throw new Error("ERR_IPB"); // Insufficient Player Balance
    }
    this.balance -= bet;

    // Board 5x3 avec symbolIds 0-11 (mock)
    const numReels = 5;
    const numRows = 3;
    const board: number[][] = [];
    for (let c = 0; c < numReels; c++) {
      const reel: number[] = [];
      for (let r = 0; r < numRows; r++) {
        reel.push(Math.floor(Math.random() * 12));
      }
      board.push(reel);
    }

    // Gain mock (0-20x)
    const payoutMultiplier = Math.floor(Math.random() * 21);
    const winAmount = Math.floor((bet * payoutMultiplier) / 1_000_000) * 1_000_000;
    this.balance += winAmount;

    const events: RgsRoundEvent[] = [
      { type: "reveal", board, gameType: "basegame" },
      { type: "winInfo", wins: [], balance: this.balance },
      { type: "setWin", amount: winAmount, balance: this.balance },
      { type: "finalWin", amount: winAmount, balance: this.balance },
    ];

    return {
      events,
      payoutMultiplier,
      balance: this.balance,
    };
  }

  async endRound(): Promise<void> {
    // no-op mock
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}
