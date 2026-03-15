import { useState, useCallback, useEffect } from "react";
import JSZip from "jszip";
import { useGameConfig } from "@/context/GameConfigContext";
import { useMathConfig } from "@/context/MathConfigContext";
import { useSlotControls } from "@/context/SlotControlsContext";
import { Button } from "@/components/ui/button";
import { Download, Package, Loader2, Check, FileCode, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ExportValidator } from "@/components/math/ExportValidator";
import {
  generateGameConfigPy,
  generateGamestatePy,
  generateRunPy,
  generateIndexJson,
  generateReelstripCSV,
  generateAutoReelstrip,
  generateDesignJson,
  generateStakeEnginePy,
  generateConfigFeJson,
} from "@/lib/stake-engine-generator";
import { isOfficialTemplate } from "@/data/official-stake-templates";
import type { OfficialTemplateId } from "@/data/official-stake-templates";
import type { SkinConfig } from "@/types/skin-config";
import type { GameConfig } from "@/types/game-config";

/** Ordre des symbolIds officiels (aligné SDK : H1-H5, L1-L4, WILD, SCATTER, BONUS — pas de L5). */
const SYMBOL_ID_TO_CONFIG_ID: (string | null)[] = [
  "h1", "h2", "h3", "h4", "h5", "l1", "l2", "l3", "l4", "wild", "scatter", "bonus",
];

/** Ordre symbolId (RGS) -> nom pour fallback / debug côté front */
const SYMBOL_ID_TO_NAME: (string | null)[] = [
  "H1", "H2", "H3", "H4", "H5", "L1", "L2", "L3", "L4", "WILD", "SCATTER", "BONUS",
];

/** Génère le script Node prepare-publish.js (à exécuter après les simuls Math SDK) */
function getPreparePublishScript(gameId: string): string {
  return `#!/usr/bin/env node
/**
 * Prépare le dossier upload_math/ pour la publication ACP Stake Engine.
 * À exécuter APRÈS avoir lancé les simulations (make run GAME=${gameId}).
 * Usage: node prepare-publish.js [chemin-vers-math-sdk]
 *        ou définir MATH_SDK_PATH
 */
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "publish-config.json");
if (!fs.existsSync(configPath)) {
  console.error("publish-config.json introuvable. Exécutez ce script depuis le dossier d'export.");
  process.exit(1);
}
const { gameId } = JSON.parse(fs.readFileSync(configPath, "utf8"));
const mathSdkPath = process.argv[2] || process.env.MATH_SDK_PATH;
if (!mathSdkPath || !fs.existsSync(mathSdkPath)) {
  console.error("Usage: node prepare-publish.js <chemin-math-sdk>");
  console.error("  ou:  MATH_SDK_PATH=<chemin> node prepare-publish.js");
  process.exit(1);
}

const libraryPath = path.join(mathSdkPath, "games", gameId, "library");
const uploadPath = path.join(__dirname, "upload_math");
if (!fs.existsSync(libraryPath)) {
  console.error("Dossier library introuvable:", libraryPath);
  console.error("Copiez d'abord math/ dans math-sdk/games/" + gameId + "/ puis lancez les simulations.");
  process.exit(1);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

const dirs = [
  { from: "configs", to: "Configs" },
  { from: "books_compressed", to: "books_compressed" },
  { from: "publish_files", to: "publish_files" },
  { from: "forces", to: "forces" },
];
if (fs.existsSync(path.join(libraryPath, "Forces"))) {
  dirs.push({ from: "Forces", to: "Forces" });
}

fs.mkdirSync(uploadPath, { recursive: true });
for (const { from, to } of dirs) {
  const src = path.join(libraryPath, from);
  const dest = path.join(uploadPath, to);
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
      copyRecursive(src, dest);
      console.log("Copié:", from, "-> upload_math/" + to);
    }
  }
}
console.log("Prêt. Uploadez le dossier upload_math/ pour la partie Math sur l'ACP.");
`;
}

/** Construit le skin_config.json (template officiel ou custom) pour le Web SDK */
function buildSkinConfigFromGameConfig(config: GameConfig): SkinConfig | Record<string, unknown> {
  const ac = (config as any).assetsConfig?.symbolAssets ?? {};
  const symbols: Record<number, string> = {};
  SYMBOL_ID_TO_CONFIG_ID.forEach((id, num) => {
    if (id && ac[id]) symbols[num] = ac[id];
  });
  const bg = (config as any).backgroundUrl ?? (config as any).assetsConfig?.backgroundAsset ?? "";
  return {
    templateId: config.gameId as OfficialTemplateId,
    symbols,
    backgrounds: { main: bg },
    version: config.gameVersion || "1.0.0",
  };
}

export function AmateurStep7Export() {
  const { config } = useGameConfig();
  const { mathConfig, updateMathConfig } = useMathConfig();
  const { config: controlsConfig } = useSlotControls();
  const [isGenerating, setIsGenerating] = useState(false);
  const [exported, setExported] = useState(false);
  const [hasBlockingErrors, setHasBlockingErrors] = useState(false);

  const gameId = config.gameId || config.gameName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "my_slot_game";

  // Pour les templates officiels : régénérer BR0/FR0 si symboles inconnus, mauvais nombre de rouleaux (ex. 5 au lieu de 6 pour Scatter Pays) ou reelstrips trop courtes (< 20)
  useEffect(() => {
    if (!isOfficialTemplate(config.gameId)) return;
    const strips = [...mathConfig.basegameStrips, ...mathConfig.freegameStrips];
    const paytableSymbols = new Set((config.symbols ?? []).map((s: { name: string }) => s.name));
    let unknownCount = 0;
    let wrongReelCount = false;
    let tooShort = false;
    strips.forEach((strip) => {
      if (strip.reels.length !== config.numReels) wrongReelCount = true;
      strip.reels.forEach((reel) => {
        if (reel.length < 20) tooShort = true;
        reel.forEach((sym) => { if (!paytableSymbols.has(sym)) unknownCount++; });
      });
    });
    if (unknownCount === 0 && !wrongReelCount && !tooShort) return;
    const brReels = generateAutoReelstrip(config, "basegame", 50);
    const frReels = config.freeSpins?.enabled ? generateAutoReelstrip(config, "freegame", 50) : brReels;
    updateMathConfig({
      basegameStrips: [{ id: "BR0", name: "BR0", weight: 1, reels: brReels }],
      freegameStrips: config.freeSpins?.enabled ? [{ id: "FR0", name: "FR0", weight: 1, reels: frReels }] : mathConfig.freegameStrips,
    });
  }, [config.gameId, config.symbols, config.numReels, config.freeSpins?.enabled]);

  const handleValidation = useCallback((hasErrors: boolean) => {
    setHasBlockingErrors(hasErrors);
  }, []);

  async function handleExport() {
    if (hasBlockingErrors) {
      toast.error("Corrigez les erreurs bloquantes avant d'exporter.");
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();
      const root = zip.folder(gameId);
      if (!root) throw new Error("Failed to create folder");

      // ——— Dossier math/ : tout le Math SDK (compatible Stake Engine) ———
      const mathFolder = root.folder("math");
      if (!mathFolder) throw new Error("Failed to create math folder");
      mathFolder.file("game_config.py", generateGameConfigPy(config, mathConfig));
      mathFolder.file("run.py", generateRunPy(config, mathConfig));
      mathFolder.file("gamestate.py", generateGamestatePy(config));
      mathFolder.file("stake_engine.py", generateStakeEnginePy());
      mathFolder.file("game_executables.py", '"""Game executables - customize as needed."""\n');
      mathFolder.file("game_calculations.py", '"""Game calculations - customize as needed."""\n');
      mathFolder.file("game_events.py", '"""Game events - customize as needed."""\n');
      mathFolder.file("game_override.py", '"""Game overrides - customize as needed."""\n');

      const reelsFolder = mathFolder.folder("reels");
      if (mathConfig.basegameStrips.length > 0) {
        mathConfig.basegameStrips.forEach(strip => {
          reelsFolder?.file(`${strip.id}.csv`, generateReelstripCSV(strip.reels));
        });
      } else {
        const brReels = generateAutoReelstrip(config, "basegame", 50);
        reelsFolder?.file("BR0.csv", generateReelstripCSV(brReels));
      }
      if (config.freeSpins.enabled) {
        if (mathConfig.freegameStrips.length > 0) {
          mathConfig.freegameStrips.forEach(strip => {
            reelsFolder?.file(`${strip.id}.csv`, generateReelstripCSV(strip.reels));
          });
        } else {
          const frReels = generateAutoReelstrip(config, "freegame", 50);
          reelsFolder?.file("FR0.csv", generateReelstripCSV(frReels));
        }
      }

      mathFolder.file("index.json", generateIndexJson(config));
      mathFolder.file("design_config.json", generateDesignJson(config));
      mathFolder.folder("library")?.file(".gitkeep", "");

      const mathReadme = `${config.gameName} — Dossier MATH (Stake Engine Math SDK)
${"=".repeat(50)}

Contenu : game_config.py, run.py, gamestate.py, stake_engine.py, reels/, index.json, design_config.json.

Publication (voir README à la racine) :
1. Copiez ce dossier dans math-sdk/games/${gameId}/
2. make run GAME=${gameId}
3. Exécutez prepare-publish.js pour remplir upload_math/
Pour que l'ACP trouve books_base.jsonl.zst, le mode de base doit s'appeler "base" (voir configuration des modes).
`;
      mathFolder.file("README.txt", mathReadme);

      // ——— Dossier front/ : structure ACP (Configs/ + config_fe) + skin + assets ———
      const frontFolder = root.folder("front");
      if (!frontFolder) throw new Error("Failed to create front folder");
      const configFeContent = generateConfigFeJson(config, mathConfig);
      frontFolder.file(`config_fe_${gameId}.json`, configFeContent);
      const frontConfigsFolder = frontFolder.folder("Configs");
      frontConfigsFolder?.file(`config_fe_${gameId}.json`, configFeContent);
      const skinConfig = buildSkinConfigFromGameConfig(config);
      frontFolder.file("skin_config.json", JSON.stringify(skinConfig, null, 2));
      const assetsFolder = frontFolder.folder("assets");
      assetsFolder?.file(".gitkeep", "");

      const origin = window.location.origin;
      const exportAssets: { backgroundUrl?: string | null; symbolIdToUrl?: (string | null)[] } = {};
      const assetUrls: { url: string; filename: string; isVideo?: boolean }[] = [];
      const isAbsoluteAssetUrl = (u: string) =>
        u.startsWith("http://") || u.startsWith("https://") || u.startsWith("blob:") || u.startsWith("data:");
      const toFetchableUrl = (u: string) => (isAbsoluteAssetUrl(u) ? u : origin + (u.startsWith("/") ? u : "/" + u));
      const bgUrl =
        (config as { backgroundUrl?: string }).backgroundUrl ??
        (config as { assetsConfig?: { backgroundAsset?: string } }).assetsConfig?.backgroundAsset;
      const backgroundType = (config as { backgroundType?: "image" | "video" }).backgroundType ?? "image";
      if (bgUrl && typeof bgUrl === "string") {
        const path = toFetchableUrl(bgUrl);
        const isVideoBg = backgroundType === "video" || /\.mp4(\?|$)/i.test(path) || /^data:video\/mp4/i.test(path);
        if (isVideoBg) {
          assetUrls.push({ url: path, filename: "background.mp4", isVideo: true });
        } else {
          const extFromPath = path.match(/\.(jpe?g|png|gif|webp|svg|bmp)(?:\?|$)/i)?.[1]?.toLowerCase();
          let extFromData: string | null = null;
          if (path.startsWith("data:")) {
            const m = path.match(/^data:image\/(\w+)/i);
            extFromData = m ? (m[1].toLowerCase() === "jpeg" ? "jpg" : m[1].toLowerCase()) : null;
          }
          const ext = extFromData || extFromPath || "jpg";
          assetUrls.push({ url: path, filename: `background.${ext === "jpeg" ? "jpg" : ext}` });
        }
      } else {
        exportAssets.backgroundUrl = null;
      }
      const symbolNames = config.symbols?.map((s: { name: string }) => s.name) ?? ["H1", "H2", "H3", "H4", "H5", "L1", "L2", "L3", "L4", "WILD", "SCATTER", "BONUS"];
      // On fusionne:
      //  - assetsConfig.symbolAssets (Step6 Assets, incl. assets importés depuis le PC)
      //  - customImageUrl des symboles (upload direct dans Step2 Symbols)
      const baseSymbolAssets =
        (config as { assetsConfig?: { symbolAssets?: Record<string, string | null> } }).assetsConfig?.symbolAssets ??
        {};
      const symbolAssetsMap: Record<string, string | null> = { ...baseSymbolAssets };
      (config.symbols || []).forEach((sym: any) => {
        const customUrl = sym?.customImageUrl as string | undefined;
        if (!customUrl) return;
        const keyId = sym.id?.toString() ?? "";
        const keyName = sym.name?.toString() ?? "";
        const keysToCheck = [keyId, keyId.toUpperCase(), keyId.toLowerCase(), keyName, keyName.toUpperCase(), keyName.toLowerCase()].filter(
          Boolean
        ) as string[];
        const alreadyHasKey = keysToCheck.some((k) => symbolAssetsMap[k] != null);
        if (alreadyHasKey) return;
        const storeKey = keyId || keyName;
        if (!storeKey) return;
        symbolAssetsMap[storeKey] = customUrl;
      });
      // Noms canoniques pour l'ordre officiel (embed symbolIdToUrl)
      const symbolIdToFilename: Record<string, string> = {};
      const addedUrls = new Set<string>();
      symbolNames.forEach((name) => {
        const url = symbolAssetsMap[name] ?? symbolAssetsMap[name.toLowerCase()] ?? null;
        if (url && typeof url === "string") {
          const path = toFetchableUrl(url);
          const dataM = path.startsWith("data:") ? path.match(/^data:image\/(\w+)/i) : null;
          const pathM = path.match(/\.(jpe?g|png|gif|webp|svg|bmp)(?:\?|$)/i);
          const extMatch = dataM ? (dataM[1].toLowerCase() === "jpeg" ? "jpg" : dataM[1].toLowerCase()) : pathM?.[1]?.toLowerCase();
          const ext = extMatch ? (extMatch === "jpeg" ? "jpg" : extMatch) : "png";
          const filename = `${name}.${ext}`;
          assetUrls.push({ url: path, filename });
          addedUrls.add(path);
          symbolIdToFilename[name] = filename;
          symbolIdToFilename[name.toLowerCase()] = filename;
        }
      });
      // Inclure tous les autres symboles du config (ids personnalisés, ex. cherry, lemon) pour que les assets importés soient bien exportés
      Object.entries(symbolAssetsMap).forEach(([symbolId, url]) => {
        if (!url || typeof url !== "string") return;
        const path = toFetchableUrl(url);
        if (addedUrls.has(path)) return;
        const safeId = symbolId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32) || "symbol";
        const dataM = path.startsWith("data:") ? path.match(/^data:image\/(\w+)/i) : null;
        const pathM = path.match(/\.(jpe?g|png|gif|webp|svg|bmp)(?:\?|$)/i);
        const extMatch = dataM ? (dataM[1].toLowerCase() === "jpeg" ? "jpg" : dataM[1].toLowerCase()) : pathM?.[1]?.toLowerCase();
        const ext = extMatch ? (extMatch === "jpeg" ? "jpg" : extMatch) : "png";
        const filename = `${safeId}.${ext}`;
        assetUrls.push({ url: path, filename });
        addedUrls.add(path);
        symbolIdToFilename[symbolId] = filename;
        symbolIdToFilename[symbolId.toLowerCase()] = filename;
      });

      const exportSymbolIdToUrl: (string | null)[] = symbolNames.map((name) => {
        const filename = symbolIdToFilename[name] ?? symbolIdToFilename[name.toLowerCase()];
        return filename ? `assets/${filename}` : null;
      });
      exportAssets.symbolIdToUrl = exportSymbolIdToUrl;

      // Personnages décoratifs gauche et droite (image ou MP4) — exportés en assets/character_left.* et assets/character_right.*
      const ac = (config as { assetsConfig?: { decorativeOverlayLeft?: { url?: string | null; type?: "image" | "video" }; decorativeOverlayRight?: { url?: string | null; type?: "image" | "video" } } }).assetsConfig;
      const decorativeLeftUrl = ac?.decorativeOverlayLeft?.url;
      const decorativeRightUrl = ac?.decorativeOverlayRight?.url;
      const exportDecorativePaths: { left: string | null; right: string | null } = { left: null, right: null };
      for (const [side, url] of [
        ["left", decorativeLeftUrl] as const,
        ["right", decorativeRightUrl] as const,
      ]) {
        if (!url || typeof url !== "string") continue;
        const path = toFetchableUrl(url);
        const type = side === "left" ? ac?.decorativeOverlayLeft?.type : ac?.decorativeOverlayRight?.type;
        const isVideo = type === "video" || /\.mp4(\?|$)/i.test(path) || /^data:video\/mp4/i.test(path);
        const ext = isVideo ? "mp4" : (path.match(/\.(jpe?g|png|gif|webp)(?:\?|$)/i)?.[1]?.toLowerCase() === "jpeg" ? "jpg" : path.match(/\.(jpe?g|png|gif|webp)(?:\?|$)/i)?.[1]?.toLowerCase() || "png");
        const filename = `character_${side}.${ext}`;
        assetUrls.push({ url: path, filename, isVideo: isVideo || undefined });
        exportDecorativePaths[side] = `assets/${filename}`;
      }

      function extFromContentType(ct: string | null): string {
        if (!ct) return "";
        const c = ct.toLowerCase().split(";")[0].trim();
        if (c.includes("jpeg") || c === "image/jpg") return "jpg";
        if (c.includes("png")) return "png";
        if (c.includes("gif")) return "gif";
        if (c.includes("webp")) return "webp";
        if (c.includes("svg")) return "svg";
        if (c.includes("bmp")) return "bmp";
        if (c.startsWith("image/")) return c.replace("image/", "").replace("x-", "").split("+")[0] || "png";
        return "";
      }
      function extFromDataUrl(dataUrl: string): string {
        const m = dataUrl.match(/^data:image\/(\w+)/i);
        if (!m) return "";
        const subtype = m[1].toLowerCase();
        return subtype === "jpeg" ? "jpg" : subtype;
      }
      /** Décode une data URL (ex. assets importés depuis le PC) en ArrayBuffer pour écriture directe dans le ZIP. */
      function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer | null {
        try {
          const comma = dataUrl.indexOf(",");
          if (comma === -1) return null;
          const base64 = dataUrl.slice(comma + 1);
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          return bytes.buffer;
        } catch {
          return null;
        }
      }
      function extFromUrlPath(pathOrUrl: string): string {
        const match = pathOrUrl.match(/\.(jpe?g|png|gif|webp|svg|bmp)(?:\?|$)/i);
        return match ? (match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase()) : "";
      }
      function looksLikeImageBytes(ext: string, bytes: Uint8Array): boolean {
        if (bytes.length < 4) return false;
        const b0 = bytes[0], b1 = bytes[1], b2 = bytes[2], b3 = bytes[3];
        if (ext === "png") return b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47; // ‰PNG
        if (ext === "jpg") return b0 === 0xff && b1 === 0xd8; // SOI
        if (ext === "gif") return b0 === 0x47 && b1 === 0x49 && b2 === 0x46 && b3 === 0x38; // GIF8
        if (ext === "bmp") return b0 === 0x42 && b1 === 0x4d; // BM
        if (ext === "webp") {
          // RIFF....WEBP
          if (!(b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46)) return false;
          if (bytes.length < 12) return false;
          return bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
        }
        if (ext === "svg") {
          const head = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 256)));
          return /<svg[\s>]|<\?xml[\s>]/i.test(head);
        }
        return true;
      }
      /** Convertit une data URL SVG en blob PNG pour compat d'affichage (img/canvas). */
      function svgDataUrlToPngBlob(dataUrl: string, size = 128): Promise<Blob | null> {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                resolve(null);
                return;
              }
              ctx.clearRect(0, 0, size, size);
              ctx.drawImage(img, 0, 0, size, size);
              canvas.toBlob(
                (blob) => resolve(blob),
                "image/png",
                0.95
              );
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = dataUrl;
        });
      }
      const savedFilenames: Map<string, string> = new Map();
      for (const { url, filename, isVideo } of assetUrls) {
        try {
          const base = filename.startsWith("background.") ? "background" : filename.replace(/\.[^.]+$/, "");
          const isDataUrl = url.startsWith("data:");
          const isVideoAsset = isVideo === true || filename.toLowerCase().endsWith(".mp4");

          if (isDataUrl) {
            // Assets importés depuis le PC (data URL) : décoder directement sans fetch pour fiabilité
            const buf = dataUrlToArrayBuffer(url);
            if (!buf) {
              if (filename.startsWith("background.")) exportAssets.backgroundUrl = null;
              continue;
            }
            if (isVideoAsset) {
              // Vidéo (background ou character left/right MP4 en data URL) : écrire avec le bon nom
              const videoOut = filename.startsWith("background.") ? "background.mp4" : filename;
              assetsFolder?.file(videoOut, buf);
              savedFilenames.set(filename, videoOut);
              if (filename.startsWith("background.")) exportAssets.backgroundUrl = "assets/background.mp4";
              continue;
            }
            const bytes = new Uint8Array(buf);
            let rawExt = extFromDataUrl(url) || filename.replace(/^.*\./, "").toLowerCase() || "png";
            let actualExt = rawExt === "jpeg" ? "jpg" : rawExt;
            let finalBuf: ArrayBuffer = buf;
            if (url.startsWith("data:image/svg+xml")) {
              const pngBlob = await svgDataUrlToPngBlob(url, 256);
              if (pngBlob) {
                finalBuf = await pngBlob.arrayBuffer();
                actualExt = "png";
              }
            }
            const safeExt = ["jpg", "png", "gif", "webp", "svg", "bmp"].includes(actualExt) ? actualExt : "png";
            const actualFilename = `${base}.${safeExt}`;
            if (!looksLikeImageBytes(safeExt, new Uint8Array(finalBuf))) {
              if (filename.startsWith("background.")) exportAssets.backgroundUrl = null;
              continue;
            }
            assetsFolder?.file(actualFilename, finalBuf);
            savedFilenames.set(filename, actualFilename);
            if (filename.startsWith("background.")) exportAssets.backgroundUrl = `assets/${actualFilename}`;
            continue;
          }

          const res = await fetch(url);
          if (!res.ok) {
            if (filename.startsWith("background.")) exportAssets.backgroundUrl = null;
            continue;
          }
          const blob = await res.blob();
          const contentType = res.headers.get("Content-Type") || blob.type || "";

          if (isVideoAsset || /^video\//i.test(contentType)) {
            // Vidéo (ex. background MP4 blob URL) : écrire telle quelle
            const buf = await blob.arrayBuffer();
            const ext = /^video\//i.test(contentType) ? (contentType.includes("mp4") ? "mp4" : "webm") : "mp4";
            const actualFilename = filename.startsWith("background.") ? `background.${ext}` : filename;
            assetsFolder?.file(actualFilename, buf);
            savedFilenames.set(filename, actualFilename);
            if (filename.startsWith("background.")) exportAssets.backgroundUrl = `assets/${actualFilename}`;
            continue;
          }

          const looksLikeImage =
            /^image\//i.test(contentType) ||
            (typeof blob.type === "string" && blob.type.startsWith("image/")) ||
            url.startsWith("data:image/") ||
            /\.(jpe?g|png|gif|webp|svg|bmp)(\?|$)/i.test(url) ||
            /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(filename);
          if (!looksLikeImage && blob.size === 0) {
            if (filename.startsWith("background.")) exportAssets.backgroundUrl = null;
            continue;
          }
          const ext =
            extFromContentType(contentType) ||
            (url.startsWith("data:") ? extFromDataUrl(url) : "") ||
            extFromUrlPath(url) ||
            filename.replace(/^.*\./, "").toLowerCase() ||
            "png";
          const safeExt = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext) ? (ext === "jpeg" ? "jpg" : ext) : "png";
          let finalBlob: Blob = blob;
          let actualExt = safeExt;
          if (safeExt === "svg" || url.startsWith("data:image/svg+xml")) {
            const dataUrl = url.startsWith("data:") ? url : await new Promise<string>((resolv) => {
              const r = new FileReader();
              r.onload = () => resolv(r.result as string);
              r.onerror = () => resolv("");
              r.readAsDataURL(blob);
            });
            if (dataUrl) {
              const pngBlob = await svgDataUrlToPngBlob(dataUrl, 128);
              if (pngBlob) {
                finalBlob = pngBlob;
                actualExt = "png";
              }
            }
          }
          const actualFilename = `${base}.${actualExt}`;
          const buf = await finalBlob.arrayBuffer();
          const bytes = new Uint8Array(buf);
          if (!looksLikeImageBytes(actualExt, bytes)) {
            if (filename.startsWith("background.")) exportAssets.backgroundUrl = null;
            continue;
          }
          assetsFolder?.file(actualFilename, buf);
          savedFilenames.set(filename, actualFilename);
          if (filename.startsWith("background.")) {
            exportAssets.backgroundUrl = `assets/${actualFilename}`;
          }
        } catch {
          if (filename.startsWith("background.")) exportAssets.backgroundUrl = null;
        }
      }
      const symbolNamesList = config.symbols?.map((s: { name: string }) => s.name) ?? ["H1", "H2", "H3", "H4", "H5", "L1", "L2", "L3", "L4", "WILD", "SCATTER", "BONUS"];
      symbolNamesList.forEach((name, i) => {
        const prev = exportAssets.symbolIdToUrl?.[i];
        if (!prev) return;
        const prevFilename = prev.replace("assets/", "");
        const actual = savedFilenames.get(prevFilename);
        if (actual && actual !== prevFilename && exportAssets.symbolIdToUrl) {
          exportAssets.symbolIdToUrl[i] = `assets/${actual}`;
        }
      });
      const bgKey = Array.from(savedFilenames.keys()).find((k) => k.startsWith("background."));
      if (bgKey && savedFilenames.get(bgKey)) {
        exportAssets.backgroundUrl = "assets/" + savedFilenames.get(bgKey)!;
      }
      const leftSaved = Array.from(savedFilenames.entries()).find(([k]) => k.startsWith("character_left."));
      const rightSaved = Array.from(savedFilenames.entries()).find(([k]) => k.startsWith("character_right."));
      if (leftSaved) exportDecorativePaths.left = "assets/" + leftSaved[1];
      if (rightSaved) exportDecorativePaths.right = "assets/" + rightSaved[1];

      // ——— Front React (player) publiable Stake Engine ———
      // 1) Embed config (consommée par le player: ./embed-config.json)
      const embedConfig = {
        gameName: config.gameName || "Slot",
        gameId,
        numReels: config.numReels,
        numRows: config.numRows,
        winMechanic: config.winMechanic || "cluster",
        defaultBetAmount: Math.round((config.baseBetMode.cost || 1) * 1_000_000),
        reelColor: config.reelColor ?? "#1a1c23",
        gridBorderStyle: config.visualEffects?.gridBorderStyle ?? "glow",
        gridBorderColor: config.visualEffects?.gridBorderColor ?? "#FFD700",
        bodyBackgroundUrl: exportAssets.backgroundUrl || null,
        backgroundUrl: exportAssets.backgroundUrl || null,
        backgroundType: backgroundType,
        symbolIdToUrl: exportAssets.symbolIdToUrl ?? [],
        symbolIdToName: SYMBOL_ID_TO_NAME,
        tumbleEnabled: config.tumbleEnabled ?? true,
        freeSpinsEnabled: config.freeSpins?.enabled ?? false,
        freeSpinsCostMultiplier: config.freeSpins?.costMultiplier ?? 100,
        // Player v2: patch pour reconstruire le rendu preview dans le front exporté
        controlsConfig,
        gameConfigPatch: {
          // Structure complète de la grille & des symboles pour que le player exporté
          // se comporte exactement comme le preview du builder.
          gameName: config.gameName,
          gameId,
          gameVersion: config.gameVersion,
          skin: (config as any).skin,
          numReels: config.numReels,
          numRows: config.numRows,
          numPaylines: config.numPaylines,
          winMechanic: config.winMechanic,
          symbols: config.symbols,
          reelColor: config.reelColor,
          tumbleEnabled: config.tumbleEnabled,
          freeSpins: config.freeSpins,
          visualEffects: config.visualEffects,
          animation: config.animation,
          audio: config.audio,
          // Force l'asset background et images vers les fichiers exportés (image ou vidéo MP4)
          backgroundType: backgroundType,
          backgroundUrl: exportAssets.backgroundUrl || "",
          assetsConfig: {
            ...(config as any).assetsConfig,
            backgroundAsset: exportAssets.backgroundUrl || null,
            decorativeOverlayLeft: {
              ...(config as any).assetsConfig?.decorativeOverlayLeft,
              url: exportDecorativePaths.left ?? (config as any).assetsConfig?.decorativeOverlayLeft?.url ?? null,
            },
            decorativeOverlayRight: {
              ...(config as any).assetsConfig?.decorativeOverlayRight,
              url: exportDecorativePaths.right ?? (config as any).assetsConfig?.decorativeOverlayRight?.url ?? null,
            },
            symbolAssets: (() => {
              const out: Record<string, string | null> = {};
              SYMBOL_ID_TO_CONFIG_ID.forEach((id, num) => {
                if (!id) return;
                const url = exportAssets.symbolIdToUrl?.[num] ?? null;
                out[id] = url;
              });
              return out;
            })(),
          },
        },
      };
      frontFolder.file("embed-config.json", JSON.stringify(embedConfig, null, 2));

      // 2) Copie du build statique (public/stake-react-front/) dans le ZIP.
      // On se base sur le manifest Vite pour récupérer les noms hashés des assets.
      type ViteManifestEntry = { file: string; css?: string[]; assets?: string[]; imports?: string[]; isEntry?: boolean };
      type ViteManifest = Record<string, ViteManifestEntry>;
      async function fetchTextOrThrow(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Front React introuvable: ${url}`);
        return await res.text();
      }
      async function fetchBlobOrThrow(url: string): Promise<Blob> {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Asset introuvable: ${url}`);
        return await res.blob();
      }

      const manifestUrl = `${origin}/stake-react-front/.vite/manifest.json`;
      const manifestText = await fetchTextOrThrow(manifestUrl);
      const manifest = JSON.parse(manifestText) as ViteManifest;
      const entry = manifest["index.html"];
      if (!entry?.file) throw new Error("Manifest stake-react-front invalide (index.html manquant)");
      const filesToCopy = new Set<string>();
      const visited = new Set<string>();
      const addRel = (rel?: string) => {
        if (!rel) return;
        filesToCopy.add(rel);
      };
      const walk = (key: string) => {
        if (visited.has(key)) return;
        visited.add(key);
        const e = manifest[key];
        if (!e) return;
        addRel(e.file);
        (e.css || []).forEach(addRel);
        (e.assets || []).forEach(addRel);
        (e.imports || []).forEach(walk);
      };
      walk("index.html");

      // Copie index.html
      frontFolder.file("index.html", await fetchTextOrThrow(`${origin}/stake-react-front/index.html`));
      // Copie JS/CSS hashés
      for (const rel of Array.from(filesToCopy)) {
        const blob = await fetchBlobOrThrow(`${origin}/stake-react-front/${rel}`);
        frontFolder.file(rel, await blob.arrayBuffer());
      }

      const frontReadme = `${config.gameName} — Dossier FRONT (Stake Engine)
${"=".repeat(50)}

Contenu :
- index.html : front React (statique) piloté par le RGS (aucune logique de jeu locale). Rend la grille en HTML/CSS + images.
- embed-config.json : paramètres embarqués (grille, mapping symbolId -> image, fond, couleurs).
- Configs/config_fe_${gameId}.json : pour publication ACP.
- config_fe_${gameId}.json, skin_config.json, assets/

Paramètres d'URL requis (fournis par l'URL du jeu sur Stake Engine) :
  ?sessionID=...&rgs_url=...
Optionnels : lang=..., device=...

Pour tester en local sans RGS (spins simulés, solde fictif) :
  ?demo=1

Important :
- Ouvrir index.html en file:// peut casser les appels réseau (CORS). Testez toujours via HTTP.
- Exemple local (dans le dossier front/) :
    npx serve .
  puis ouvrir :
    http://localhost:3000/index.html?demo=1

Le jeu doit être servi avec ces paramètres (ex. sur le CDN Stake Engine :
  https://{{TeamName}}.cdn.stake-engine.com/{{GameID}}/{{Version}}/index.html?sessionID=...&rgs_url=...&lang=...&device=...).

Pour publier : uploadez le contenu du dossier "front" dans "frontend files" sur l'ACP.
`;
      frontFolder.file("README.txt", frontReadme);

      // ——— Script + config pour préparer l'upload Math après les simuls ———
      root.file("prepare-publish.js", getPreparePublishScript(gameId));
      root.file("publish-config.json", JSON.stringify({ gameId }, null, 2));

      // ——— Dossier upload_math/ : rempli par prepare-publish.js après les simuls ———
      const uploadMathFolder = root.folder("upload_math");
      const uploadMathReadme = `${config.gameName} — Dossier MATH pour upload ACP
${"=".repeat(50)}

Ce dossier est vide à l'export. Il sera rempli automatiquement par le script prepare-publish.js APRÈS avoir exécuté les simulations du Math SDK.

Étapes :
1. Copiez le contenu de "math" dans math-sdk/games/${gameId}/
2. Lancez les simulations : make run GAME=${gameId} (ou python games/${gameId}/run.py)
3. Exécutez : node prepare-publish.js <chemin-vers-math-sdk>
4. Uploadez ce dossier "upload_math" pour la partie Math sur l'ACP.
5. Uploadez le dossier "front" pour la partie Front End.

Important : le mode de base doit s'appeler "base" pour que le fichier books_base.jsonl.zst soit généré (compatibilité ACP).
`;
      uploadMathFolder?.file("README.txt", uploadMathReadme);

      // ——— README racine : procédure unique ———
      const readme = `${config.gameName} — Publication Stake Engine (géré par le builder)
${"=".repeat(50)}

1. MATH — Copiez le contenu de "math" dans : math-sdk/games/${gameId}/
2. SIMULS — À la racine du Math SDK : make run GAME=${gameId}
3. PRÉPARER — Ici (dossier d'export) : node prepare-publish.js <chemin-math-sdk>
   → Le dossier "upload_math" sera rempli (Configs, books_compressed, publish_files, forces).
4. PUBLIER — Sur l'ACP Stake Engine :
   • Math : sélectionnez le dossier "upload_math"
   • Front End : sélectionnez le dossier "front"

Notes Front :
- Le dossier front/ est un front React statique (index.html + assets + embed-config.json + images).
- Pour tester en local, servez front/ en HTTP (ex: npx serve .) et utilisez ?demo=1 ou les paramètres Stake Engine.

Fichiers : math/ (sources), front/ (prêt à l'upload), upload_math/ (rempli par le script), prepare-publish.js, publish-config.json.
`;
      root.file("README.txt", readme);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${gameId}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setExported(true);
      toast.success("Package (math/ + front/) exporté — prêt pour Stake Engine !");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsGenerating(false);
    }
  }

  const FILES = [
    { name: "math/", desc: "Sources Math SDK (à copier dans math-sdk/games/)" },
    { name: "upload_math/", desc: "Rempli par prepare-publish.js → à uploader pour Math" },
    { name: "front/", desc: "Front End : index.html (React statique) + embed-config + Configs + skin" },
    { name: "front/index.html", desc: "Jeu autonome (front React piloté par RGS)" },
    { name: "front/embed-config.json", desc: "Mapping symbolId -> asset + paramètres visuels/grille" },
    { name: "prepare-publish.js", desc: "Script : prépare upload_math après les simuls" },
    { name: "publish-config.json", desc: "gameId pour le script" },
    { name: "README.txt", desc: "Procédure en 4 étapes" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Export Complet (math + front) 🎉</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Un ZIP avec 2 dossiers : <strong>maths d’origine</strong> du template — <code className="bg-muted px-1 rounded">math/</code> (Math SDK) et <code className="bg-muted px-1 rounded">front/</code> (front React statique piloté par le RGS). Simple à publier sur Stake Engine.
        </p>
      </div>

      {/* Validation */}
      <ExportValidator onValidation={handleValidation} />

      {/* Summary */}
      <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
        <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
          {config.gameName}
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {config.winMechanic} {config.numReels}×{config.numRows}
          </span>
        </h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Symboles</span>
            <p className="font-mono text-foreground">{config.symbols.length}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">RTP</span>
            <p className="font-mono text-foreground">{config.rtpTarget}%</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Volatilité</span>
            <p className="font-mono text-foreground capitalize">{config.volatility}</p>
          </div>
        </div>
      </div>

      {/* Files list */}
      <div className="p-4 rounded-lg border border-border bg-card/50 space-y-2">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Package className="h-4 w-4" />
          Contenu du package ({FILES.length} fichiers)
        </h4>
        <div className="space-y-1.5">
          {FILES.map((file) => (
            <div key={file.name} className="flex items-center gap-2 text-xs">
              <FileCode className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-mono text-foreground">{file.name}</span>
              <span className="text-muted-foreground">— {file.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export button */}
      <Button
        onClick={handleExport}
        disabled={isGenerating || hasBlockingErrors}
        size="lg"
        className="w-full gap-2"
      >
        {isGenerating ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Génération...</>
        ) : exported ? (
          <><Check className="h-5 w-5" /> Re-télécharger {gameId}.zip</>
        ) : (
          <><Download className="h-5 w-5" /> Télécharger {gameId}.zip</>
        )}
      </Button>
      {hasBlockingErrors && (
        <p className="text-xs text-destructive text-center">⛔ Corrigez les erreurs ci-dessus avant d'exporter</p>
      )}

      {/* Next steps */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">📚 Publication ACP (gérée par le builder)</h4>
        <p className="text-xs text-muted-foreground">
          Après export : copiez <code className="bg-muted px-1 rounded">math/</code> dans le Math SDK, lancez les simuls, puis exécutez <code className="bg-muted px-1 rounded">prepare-publish.js</code>. Uploadez <code className="bg-muted px-1 rounded">upload_math/</code> (Math) et <code className="bg-muted px-1 rounded">front/</code> (Front End) sur l&apos;ACP.
        </p>
        <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
          <li>Copiez <code className="bg-muted px-1 rounded">math/</code> → <code className="bg-muted px-1 rounded">math-sdk/games/{gameId}/</code></li>
          <li><code className="bg-muted px-1 rounded">make run GAME={gameId}</code></li>
          <li><code className="bg-muted px-1 rounded">node prepare-publish.js &lt;chemin-math-sdk&gt;</code></li>
          <li>Sur l&apos;ACP : Math = dossier <code className="bg-muted px-1 rounded">upload_math</code>, Front End = dossier <code className="bg-muted px-1 rounded">front</code></li>
        </ol>
        <a
          href="https://stakeengine.github.io/math-sdk/fe_home/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Doc Frontend SDK <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
