import { useEffect, useMemo, useState } from "react";
import type { EmbedConfig } from "./types";
import { SlotPreview } from "@/components/builder/SlotPreview";
import { useGameConfig } from "@/context/GameConfigContext";
import { useSlotControls } from "@/context/SlotControlsContext";
import { getRgsBootstrap } from "./rgs";

type RichEmbedConfig = EmbedConfig & {
  gameConfigPatch?: Record<string, unknown>;
  controlsConfig?: unknown;
};

export function StakePlayerApp() {
  const { updateConfig } = useGameConfig();
  const slotControls = useSlotControls();
  const { demoMode } = useMemo(() => getRgsBootstrap(), []);

  const [embed, setEmbed] = useState<RichEmbedConfig | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("./embed-config.json", { cache: "no-store" });
        if (!res.ok) throw new Error("embed-config.json introuvable");
        const json = (await res.json()) as RichEmbedConfig;
        if (cancelled) return;
        setEmbed(json);
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

    // Patch GameConfig depuis l'export (visuels, FX, audio, etc.).
    if (embed.gameConfigPatch && typeof embed.gameConfigPatch === "object") {
      updateConfig(embed.gameConfigPatch as any);
    }

    // Config de la barre de contrôle (layout, theme, position, etc.).
    if (embed.controlsConfig) {
      try {
        slotControls.importConfig(JSON.stringify(embed.controlsConfig));
      } catch {
        // ignore
      }
    }
  }, [embed, updateConfig, slotControls]);

  if (err) return <div style={{ padding: 16, color: "white" }}>{err}</div>;
  if (!embed) return <div style={{ padding: 16, color: "white" }}>Chargement…</div>;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* SlotPreview en mode RGS (animateur), verrouillé (pas d’édition) */}
      <SlotPreview mode={demoMode ? "local" : "rgs"} locked />
    </div>
  );
}

