/**
 * Serveur RGS (Remote Gaming Server) pour previews — maths d’origine (game-math.js).
 * Endpoints: POST /wallet/authenticate, /wallet/play, /wallet/end-round.
 * Balance et mises en entier 6 décimales (1.00 = 1_000_000).
 */

const express = require("express");
const cors = require("cors");
const { runSpin, GAMES } = require("./game-math.js");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3111;

// sessionId -> balance (entier 6 décimales)
const sessions = new Map();

const DEFAULT_BALANCE = 100 * 1_000_000; // 100.00
const MIN_BET = 1_000_000;
const MAX_BET = 100 * 1_000_000;
const STEP_BET = 1_000_000;

function getOrCreateSession(sessionID) {
  let sid = sessionID;
  if (!sid || typeof sid !== "string") {
    sid = "preview-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  }
  if (!sessions.has(sid)) {
    sessions.set(sid, { balance: DEFAULT_BALANCE });
  }
  return sid;
}

// POST /wallet/authenticate
app.post("/wallet/authenticate", (req, res) => {
  try {
    const { sessionID } = req.body || {};
    const sessionId = getOrCreateSession(sessionID);
    const { balance } = sessions.get(sessionId);
    res.json({
      sessionId,
      balance,
      minBet: MIN_BET,
      maxBet: MAX_BET,
      stepBet: STEP_BET,
      currency: "USD",
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

// POST /wallet/play — body: sessionID, bet, gameId (optionnel)
app.post("/wallet/play", (req, res) => {
  try {
    const { sessionID, bet, gameId } = req.body || {};
    console.log("[RGS play]", { sessionID: sessionID?.slice?.(0, 20), bet, gameId: gameId || "(default)" });
    if (!sessionID) {
      return res.status(400).json({ error: "sessionID required" });
    }
    const sessionId = getOrCreateSession(sessionID);
    const session = sessions.get(sessionId);
    const betInt = Math.round(Number(bet));
    if (betInt < MIN_BET || betInt > MAX_BET) {
      return res.status(400).json({ error: "Invalid bet" });
    }
    if (session.balance < betInt) {
      return res.status(400).json({ error: "ERR_IPB", code: "ERR_IPB" });
    }

    const id = gameId && GAMES[gameId] ? gameId : "0_0_scatter";
    const { events, payoutMultiplier, winAmount } = runSpin(id, betInt);
    session.balance = session.balance - betInt + winAmount;

    const balance = session.balance;
    const outEvents = events.map((ev) => {
      const e = { ...ev };
      if (e.type === "setWin" || e.type === "finalWin") e.balance = balance;
      return e;
    });

    res.json({
      events: outEvents,
      payoutMultiplier,
      balance,
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

// POST /wallet/end-round
app.post("/wallet/end-round", (req, res) => {
  try {
    const { sessionID } = req.body || {};
    if (sessionID) getOrCreateSession(sessionID);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

// GET /games — liste des gameId pour le front
app.get("/games", (req, res) => {
  res.json({ games: Object.keys(GAMES) });
});

app.listen(PORT, () => {
  console.log(`RGS server running at http://localhost:${PORT}`);
  console.log("  POST /wallet/authenticate, /wallet/play, /wallet/end-round");
  console.log("  GET  /games");
});
