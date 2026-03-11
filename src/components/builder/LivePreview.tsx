import { useGameConfig } from "@/context/GameConfigContext";

export function LivePreview() {
  const { config } = useGameConfig();

  const paySymbols = config.symbols.filter((s) => s.type !== "scatter" && s.type !== "bonus");

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card/50 overflow-y-auto hidden xl:flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-gold">Live Preview</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {config.gameName || "Untitled Game"} — v{config.gameVersion}
        </p>
      </div>

      {/* Grid preview */}
      <div className="p-4">
        <div className="casino-card p-4">
          <p className="text-xs text-muted-foreground mb-3">
            {config.numReels}×{config.numRows} Grid • {config.winMechanic}
          </p>
          <div
            className="grid gap-1.5 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${config.numReels}, 1fr)`,
              maxWidth: `${config.numReels * 48}px`,
            }}
          >
            {Array.from({ length: config.numReels * config.numRows }).map((_, i) => {
              const sym = config.symbols[i % config.symbols.length];
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md flex items-center justify-center text-[9px] font-bold border border-border/50"
                  style={{ backgroundColor: sym?.color + "30", color: sym?.color }}
                >
                  {sym?.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Config summary */}
      <div className="p-4 space-y-3 text-xs">
        <div className="casino-card p-3 space-y-2">
          <h4 className="text-gold font-semibold text-[11px] uppercase tracking-wider">Config</h4>
          <Row label="Theme" value={config.theme} />
          <Row label="Win Mechanic" value={config.winMechanic} />
          {config.winMechanic === "lines" && <Row label="Paylines" value={String(config.numPaylines)} />}
          <Row label="Tumble" value={config.tumbleEnabled ? "Yes" : "No"} />
          <Row label="RTP Target" value={`${config.rtpTarget}%`} />
          <Row label="Volatility" value={config.volatility} />
          <Row label="Symbols" value={String(config.symbols.length)} />
          <Row label="Free Spins" value={config.freeSpins.enabled ? "Yes" : "No"} />
        </div>

        {paySymbols.length > 0 && (
          <div className="casino-card p-3 space-y-1.5">
            <h4 className="text-gold font-semibold text-[11px] uppercase tracking-wider mb-2">Paytable</h4>
            {paySymbols.slice(0, 5).map((sym) => (
              <div key={sym.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: sym.color }} />
                <span className="text-muted-foreground flex-1">{sym.name}</span>
                <span className="text-foreground font-mono">
                  {Object.values(sym.paytable).join("/")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium capitalize">{value}</span>
    </div>
  );
}
