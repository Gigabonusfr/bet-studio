import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { RgsSession, RgsPlayResponse } from "@/lib/rgs-client";
import { MockRgsClient, RgsClient } from "@/lib/rgs-client";

type RgsClientInstance = InstanceType<typeof MockRgsClient> | RgsClient;

interface RgsContextType {
  client: RgsClientInstance | null;
  session: RgsSession | null;
  setClient: (client: RgsClientInstance | null) => void;
  authenticate: () => Promise<RgsSession | null>;
  play: (bet: number, gameId?: string) => Promise<RgsPlayResponse | null>;
  endRound: () => Promise<void>;
  isAuthenticated: boolean;
}

const RgsContext = createContext<RgsContextType | null>(null);

function getBootstrap() {
  const params = new URLSearchParams(window.location.search);
  const rgsUrl = (params.get("rgs_url") || "").replace(/\/$/, "");
  const sessionID = params.get("sessionID") || params.get("sessionId") || "";
  const demo = params.get("demo");
  const demoMode = demo === "1" || demo === "true" || (!!demo && !rgsUrl);
  return { rgsUrl, sessionID, demoMode };
}

function createDefaultClient(): RgsClientInstance {
  const { rgsUrl, sessionID, demoMode } = getBootstrap();
  // Dès que rgs_url est fourni (hors demo), on utilise le vrai RGS ; sessionID optionnel (créé par le serveur à l’auth).
  if (!demoMode && rgsUrl) {
    return new RgsClient({ baseUrl: rgsUrl, sessionId: sessionID || undefined });
  }
  return new MockRgsClient();
}

export function RgsProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<RgsClientInstance | null>(() => createDefaultClient());
  const [session, setSession] = useState<RgsSession | null>(null);

  const authenticate = useCallback(async () => {
    const c = client ?? defaultClient;
    const s = await c.authenticate();
    setSession(s);
    return s;
  }, [client]);

  const play = useCallback(
    async (bet: number, gameId?: string): Promise<RgsPlayResponse | null> => {
      const c = client ?? defaultClient;
      try {
        const res = await c.play(bet, gameId);
        if (res.balance != null) setSession((prev) => (prev ? { ...prev, balance: res.balance! } : null));
        return res;
      } catch (e) {
        console.error("RGS play error", e);
        return null;
      }
    },
    [client]
  );

  const endRound = useCallback(async () => {
    const c = client ?? defaultClient;
    await c.endRound();
  }, [client]);

  return (
    <RgsContext.Provider
      value={{
        client: client ?? createDefaultClient(),
        session,
        setClient,
        authenticate,
        play,
        endRound,
        isAuthenticated: session != null,
      }}
    >
      {children}
    </RgsContext.Provider>
  );
}

export function useRgsClient() {
  const ctx = useContext(RgsContext);
  if (!ctx) throw new Error("useRgsClient must be used within RgsProvider");
  return ctx;
}
