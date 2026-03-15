import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Upload, Shuffle, X, Image, Sparkles, Palette, Eye, Play, ExternalLink, Plus, MousePointer, Zap } from "lucide-react";
import { CURATED_ASSETS, ASSET_CATEGORIES, WIN_ANIMATION_OPTIONS } from "@/data/curated-assets";
import type { AssetItem, WinTier, AssetsConfig, ParticleEffectConfig, DecorativeOverlayConfig } from "@/types/asset-types";
import { DEFAULT_ASSETS_CONFIG, DEFAULT_PARTICLE_EFFECTS, DEFAULT_DECORATIVE_OVERLAY_LEFT, DEFAULT_DECORATIVE_OVERLAY_RIGHT } from "@/types/asset-types";
import { cn } from "@/lib/utils";
import { HelpBanner } from "@/components/builder/HelpBanner";
import Lottie from "lottie-react";

// ─── PARTICLE CANVAS PREVIEW ────────────────────────────────────────────
function ParticleCanvasPreview({ effects }: { effects: ParticleEffectConfig[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; alpha: number; type: string;
    rotation: number; rotationSpeed: number;
  }>>([]);

  const activeEffects = useMemo(() => effects.filter(e => e.enabled), [effects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Initialize particles based on active effects
    const initParticles = () => {
      const particles: typeof particlesRef.current = [];
      activeEffects.forEach(effect => {
        const count = Math.floor(effect.density / 5);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * (effect.id === "confetti" ? 2 : 1),
            vy: effect.id === "flames" ? -(0.5 + Math.random() * 1.5) :
                effect.id === "snow" ? 0.3 + Math.random() * 0.7 :
                (Math.random() - 0.5) * 1.5,
            size: effect.id === "gems" ? 4 + Math.random() * 4 :
                  effect.id === "snow" ? 2 + Math.random() * 3 :
                  2 + Math.random() * 3,
            color: effect.color,
            alpha: 0.4 + Math.random() * 0.6,
            type: effect.id,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
          });
        }
      });
      particlesRef.current = particles;
    };

    initParticles();

    const shapes: Record<string, string> = {
      sparkles: "✨", stars: "⭐", gems: "💎",
      confetti: "🎊", flames: "🔥", snow: "❄️",
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      // Dark background
      ctx.fillStyle = "rgba(15, 15, 25, 1)";
      ctx.fillRect(0, 0, W, H);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha = 0.3 + Math.abs(Math.sin(Date.now() * 0.002 + p.x * 0.01)) * 0.7;

        // Wrap around
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size * 2.5}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(shapes[p.type] || "✨", 0, 0);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeEffects]);

  if (activeEffects.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 h-32 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Activez un effet pour voir l'aperçu</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={140}
      className="w-full h-[140px] rounded-xl border border-border"
    />
  );
}

// ─── ASSET PREVIEW MODAL ────────────────────────────────────────────────
function AssetPreviewModal({
  asset, open, onClose,
}: {
  asset: AssetItem | null; open: boolean; onClose: () => void;
}) {
  const [lottieData, setLottieData] = useState<any>(null);
  const [loadingLottie, setLoadingLottie] = useState(false);
  const [lottieError, setLottieError] = useState(false);

  useEffect(() => {
    if (asset?.type === "lottie" && asset.url && open) {
      setLoadingLottie(true); setLottieError(false); setLottieData(null);
      fetch(asset.url)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => { setLottieData(data); setLoadingLottie(false); })
        .catch(() => { setLottieError(true); setLoadingLottie(false); });
    } else {
      setLottieData(null); setLottieError(false);
    }
  }, [asset?.id, asset?.url, open]);

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Aperçu: {asset.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-square max-h-[300px] rounded-xl bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
            {asset.type === "lottie" ? (
              loadingLottie ? (
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Chargement...</p>
                </div>
              ) : lottieError ? (
                <div className="text-center p-4">
                  <span className="text-4xl mb-2 block">⚠️</span>
                  <p className="text-xs text-muted-foreground">Impossible de charger l'animation</p>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
                    Ouvrir l'URL <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : lottieData ? (
                <Lottie animationData={lottieData} loop autoplay className="w-full h-full" />
              ) : (
                <div className="text-6xl animate-pulse">🎬</div>
              )
            ) : (
              <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-6xl">🖼️</span>';
                }}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Type</span>
              <p className="font-medium text-foreground">{asset.type === "lottie" ? "🎬 Lottie" : `🖼️ ${asset.type.toUpperCase()}`}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Source</span>
              <p className="font-medium text-foreground">{asset.source}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Licence</span>
              <Badge variant="outline" className="text-[10px]">{asset.license}</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Catégorie</span>
              <p className="font-medium text-foreground capitalize">{asset.category}</p>
            </div>
          </div>
          {asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {asset.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <ExternalLink className="h-3 w-3 mr-1" /> Ouvrir l'URL
              </Button>
            </a>
            <Button variant="default" size="sm" className="flex-1 text-xs" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { WinAnimationContent } from "@/components/builder/win-animation-variants";

function WinAnimationPreview({ animId, intensity }: { animId: string; intensity: "low" | "medium" | "overthetop" }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      <WinAnimationContent animId={animId} intensity={intensity} fullScreen={false} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function Step6Assets() {
  const { config, updateConfig } = useGameConfig();
  const assetsConfig: AssetsConfig = (config as any).assetsConfig || DEFAULT_ASSETS_CONFIG;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const updateAssets = useCallback((partial: Partial<AssetsConfig>) => {
    updateConfig({ assetsConfig: { ...assetsConfig, ...partial } } as any);
  }, [assetsConfig, updateConfig]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">🎨 Assets & Visuels</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez vos symboles, animations de gain et effets de particules.
        </p>
      </div>

      <HelpBanner id="pro-step6-assets">
        💡 Assignez des images à chaque symbole depuis la bibliothèque ou par import. Configurez les animations de gain par palier (small/medium/big/mega) et les effets de particules.
      </HelpBanner>

      {/* Selected slot indicator */}
      {selectedSlot && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
          <MousePointer className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-xs text-primary font-medium">
            Slot : <strong>{selectedSlot === "__background__" ? "Background" : selectedSlot === "__decorative_overlay_left__" ? "Personnage gauche" : selectedSlot === "__decorative_overlay_right__" ? "Personnage droite" : selectedSlot === "__multiplier_video__" ? "Vidéo multiplicateur" : selectedSlot.toUpperCase()}</strong>
          </span>
          <span className="text-[10px] text-muted-foreground">— Cliquez sur un asset</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => setSelectedSlot(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* ─── 1. IMAGES (Symboles + fond + upload) ─── */}
      <section className="rounded-xl border-2 border-border bg-card/50 p-5 space-y-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Image className="h-5 w-5" /> 1. Images
        </h3>
        <p className="text-sm text-muted-foreground -mt-3">
          Assignez des images aux symboles et au fond. Bibliothèque intégrée et imports depuis votre PC.
        </p>
        <AssetLibraryTab
          assetsConfig={assetsConfig}
          updateAssets={updateAssets}
          symbols={config.symbols}
          onPreview={setPreviewAsset}
          onUpdateConfig={updateConfig}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />
        <div className="border-t border-border pt-5">
          <CustomUploadTab
            assetsConfig={assetsConfig}
            updateAssets={updateAssets}
            fileInputRef={fileInputRef}
            onPreview={setPreviewAsset}
          />
        </div>
      </section>

      {/* ─── 2. ANIMATIONS DE GAIN ─── */}
      <section className="rounded-xl border-2 border-border bg-card/50 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> 2. Animations de gain
        </h3>
        <p className="text-sm text-muted-foreground -mt-3">
          Configurez l’animation, la durée et l’intensité pour chaque palier (Win, Big Win, Mega Win, Free Spins).
        </p>
        <WinAnimationsTab assetsConfig={assetsConfig} updateAssets={updateAssets} />
      </section>

      {/* ─── 3. PARTICULES ─── */}
      <section className="rounded-xl border-2 border-border bg-card/50 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5" /> 3. Particules
        </h3>
        <p className="text-sm text-muted-foreground -mt-3">
          Activez et personnalisez les effets de particules (étincelles, confettis, etc.) affichés en jeu.
        </p>
        <ParticleEffectsTab assetsConfig={assetsConfig} updateAssets={updateAssets} />
      </section>

      <AssetPreviewModal asset={previewAsset} open={!!previewAsset} onClose={() => setPreviewAsset(null)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 1: ASSET LIBRARY (Symboles & Background)
// ═══════════════════════════════════════════════════════════════════════
function AssetLibraryTab({
  assetsConfig, updateAssets, symbols, onPreview, onUpdateConfig, selectedSlot, onSelectSlot,
}: {
  assetsConfig: AssetsConfig;
  updateAssets: (p: Partial<AssetsConfig>) => void;
  symbols: any[];
  onPreview: (asset: AssetItem) => void;
  onUpdateConfig: (p: any) => void;
  selectedSlot: string | null;
  onSelectSlot: (slot: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [draggedAsset, setDraggedAsset] = useState<AssetItem | null>(null);

  const allAssets = [...CURATED_ASSETS, ...assetsConfig.customAssets];
  const filtered = allAssets.filter(a => {
    const matchCat = category === "all" || a.category === category;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const assignAsset = (symbolId: string, url: string | null) => {
    updateAssets({ symbolAssets: { ...assetsConfig.symbolAssets, [symbolId]: url } });
  };

  const autoAssign = () => {
    const symbolAssets = { ...assetsConfig.symbolAssets };
    const candidates = allAssets.filter(a => a.category === "symbols");
    symbols.forEach((sym, i) => {
      if (!symbolAssets[sym.id] && candidates.length > 0) {
        symbolAssets[sym.id] = candidates[i % candidates.length].url;
      }
    });
    updateAssets({ symbolAssets });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      {/* LEFT: Browser */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">📦 Explorateur</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9" />
        </div>

        <div className="flex flex-wrap gap-1">
          {ASSET_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={cn("px-2 py-1 rounded-md text-xs transition-all",
                category === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="col-span-3 text-xs text-muted-foreground text-center py-8">Aucun asset trouvé</p>
          )}
          {filtered.map(asset => (
            <div key={asset.id} draggable
              onDragStart={() => setDraggedAsset(asset)}
              onDragEnd={() => setDraggedAsset(null)}
              onClick={() => {
                if (selectedSlot) {
                  if (selectedSlot === "__background__") {
                    if (asset.category === "backgrounds" || asset.type !== "lottie") {
                      updateAssets({ backgroundAsset: asset.url });
                      onUpdateConfig({ backgroundUrl: asset.url, backgroundType: "image" });
                      onSelectSlot(null);
                    }
                  } else if (selectedSlot === "__decorative_overlay_left__") {
                    if (asset.type !== "lottie") {
                      const isVideo = asset.type === "mp4" || asset.type === "webm" || /\.(mp4|webm)$/i.test(asset.url);
                      updateAssets({
                        decorativeOverlayLeft: {
                          ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT),
                          url: asset.url,
                          type: isVideo ? "video" : "image",
                          ...(isVideo ? { chromaKeyBlack: true, chromaKeyThreshold: 55 } : {}),
                        },
                      });
                      onSelectSlot(null);
                    }
                  } else if (selectedSlot === "__decorative_overlay_right__") {
                    if (asset.type !== "lottie") {
                      const isVideo = asset.type === "mp4" || asset.type === "webm" || /\.(mp4|webm)$/i.test(asset.url);
                      updateAssets({
                        decorativeOverlayRight: {
                          ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT),
                          url: asset.url,
                          type: isVideo ? "video" : "image",
                          ...(isVideo ? { chromaKeyBlack: true, chromaKeyThreshold: 55 } : {}),
                        },
                      });
                      onSelectSlot(null);
                    }
                  } else if (selectedSlot === "__multiplier_video__") {
                    if (asset.type === "mp4" || asset.type === "webm" || /\.(mp4|webm)$/i.test(asset.url)) {
                      updateAssets({ multiplierRevealVideo: asset.url });
                      onSelectSlot(null);
                    }
                  } else {
                    assignAsset(selectedSlot, asset.url);
                    const currentIdx = symbols.findIndex(s => s.id === selectedSlot);
                    const next = symbols.find((s, i) => i > currentIdx && !assetsConfig.symbolAssets[s.id]);
                    onSelectSlot(next ? next.id : null);
                  }
                }
              }}
              className={cn(
                "group relative rounded-lg border bg-card p-2 transition-all",
                selectedSlot ? "cursor-pointer hover:border-primary hover:bg-primary/10 hover:scale-105" : "cursor-grab hover:border-primary/50 hover:bg-accent/30",
                "border-border"
              )}
            >
              <div className="aspect-square rounded-md bg-muted/50 flex items-center justify-center overflow-hidden mb-1.5 relative">
                {asset.type === "lottie" ? (
                  <div className="text-2xl animate-pulse">🎬</div>
                ) : (
                  <img src={asset.thumbnailUrl || asset.url} alt={asset.name}
                    className="w-full h-full object-contain" loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl">🖼️</span>'; }}
                  />
                )}
                {!selectedSlot && (
                  <button onClick={e => { e.stopPropagation(); onPreview(asset); }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </button>
                )}
                {selectedSlot && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <Plus className="h-3 w-3" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-medium text-foreground truncate">{asset.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">{asset.license}</Badge>
                <span className="text-[8px] text-muted-foreground">{asset.source}</span>
              </div>
              {!selectedSlot && (
                <Button variant="outline" size="sm" className="w-full mt-1.5 h-6 text-[9px] lg:hidden"
                  onClick={e => {
                    e.stopPropagation();
                    const first = symbols.find(s => !assetsConfig.symbolAssets[s.id]);
                    if (first) { assignAsset(first.id, asset.url); }
                    else if (!assetsConfig.backgroundAsset && (asset.category === "backgrounds" || asset.type !== "lottie")) {
                      updateAssets({ backgroundAsset: asset.url });
                      onUpdateConfig({ backgroundUrl: asset.url, backgroundType: "image" });
                    }
                  }}>
                  <Plus className="h-3 w-3 mr-0.5" /> Assigner
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Assignment Panel */}
      <div className="space-y-4">
        {/* Background */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">🖼️ Background</h3>
          <div
            onClick={() => onSelectSlot(selectedSlot === "__background__" ? null : "__background__")}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (draggedAsset && (draggedAsset.category === "backgrounds" || draggedAsset.type !== "lottie")) {
                updateAssets({ backgroundAsset: draggedAsset.url });
                onUpdateConfig({ backgroundUrl: draggedAsset.url, backgroundType: "image" });
                setDraggedAsset(null);
              }
            }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
              selectedSlot === "__background__" ? "border-primary bg-primary/10 ring-2 ring-primary/30" :
              draggedAsset ? "border-dashed border-primary/50 bg-primary/5" : "border-border bg-card/50 hover:border-primary/30"
            )}
          >
            {assetsConfig.backgroundAsset ? (
              <>
                <img src={assetsConfig.backgroundAsset} alt="BG" className="w-16 h-10 rounded object-cover bg-muted/50"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="text-xs text-foreground flex-1 truncate">Background assigné</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                  onClick={e => { e.stopPropagation(); updateAssets({ backgroundAsset: null }); onUpdateConfig({ backgroundUrl: "", backgroundType: undefined }); }}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic w-full text-center py-2">
                {selectedSlot === "__background__" ? "🎯 Cliquez sur un asset" : draggedAsset ? "↓ Déposer ici" : "Cliquer pour sélectionner"}
              </p>
            )}
          </div>
        </div>

        {/* Personnage à GAUCHE : PNG ou MP4 breathe, position réglable */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">⬅️ Personnage à gauche</h3>
          <p className="text-[10px] text-muted-foreground">Image ou vidéo (breathe). Optionnel — tu peux n’en mettre qu’à droite, qu’à gauche, ou les deux.</p>
          <div
            onClick={() => onSelectSlot(selectedSlot === "__decorative_overlay_left__" ? null : "__decorative_overlay_left__")}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (draggedAsset && draggedAsset.type !== "lottie") {
                const isVideo = draggedAsset.type === "mp4" || draggedAsset.type === "webm" || /\.(mp4|webm)$/i.test(draggedAsset.url);
                updateAssets({
                  decorativeOverlayLeft: {
                    ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT),
                    url: draggedAsset.url,
                    type: isVideo ? "video" : "image",
                    ...(isVideo ? { chromaKeyBlack: true, chromaKeyThreshold: 55 } : {}),
                  },
                });
                setDraggedAsset(null);
              }
            }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
              selectedSlot === "__decorative_overlay_left__" ? "border-primary bg-primary/10 ring-2 ring-primary/30" :
              draggedAsset ? "border-dashed border-primary/50 bg-primary/5" : "border-border bg-card/50 hover:border-primary/30"
            )}
          >
            {assetsConfig.decorativeOverlayLeft?.url ? (
              <>
                {assetsConfig.decorativeOverlayLeft.type === "video" ? (
                  <span className="w-16 h-10 rounded flex items-center justify-center bg-muted/50 text-lg">🎬</span>
                ) : (
                  <img src={assetsConfig.decorativeOverlayLeft.url} alt="Gauche" className="w-16 h-10 rounded object-contain bg-muted/50"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <span className="text-xs text-foreground flex-1 truncate">{assetsConfig.decorativeOverlayLeft.type === "video" ? "Vidéo" : "Image"}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                  onClick={e => { e.stopPropagation(); updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), url: null } }); }}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic w-full text-center py-2">
                {selectedSlot === "__decorative_overlay_left__" ? "🎯 Cliquez sur une image ou vidéo" : draggedAsset ? "↓ Déposer ici" : "Cliquer pour sélectionner"}
              </p>
            )}
          </div>
          {assetsConfig.decorativeOverlayLeft?.url && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Position X (%)</Label>
                  <Slider
                    min={0}
                    max={100}
                    value={[assetsConfig.decorativeOverlayLeft?.positionX ?? DEFAULT_DECORATIVE_OVERLAY_LEFT.positionX]}
                    onValueChange={([v]) => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), positionX: v } })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Position Y (%)</Label>
                  <Slider
                    min={0}
                    max={100}
                    value={[assetsConfig.decorativeOverlayLeft?.positionY ?? DEFAULT_DECORATIVE_OVERLAY_LEFT.positionY]}
                    onValueChange={([v]) => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), positionY: v } })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Taille (%)</Label>
                <Slider
                  min={50}
                  max={800}
                  value={[assetsConfig.decorativeOverlayLeft?.scale ?? DEFAULT_DECORATIVE_OVERLAY_LEFT.scale]}
                  onValueChange={([v]) => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), scale: v } })}
                />
              </div>
              {assetsConfig.decorativeOverlayLeft?.type === "video" && (
                <div className="space-y-2 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-[10px] text-muted-foreground">Fond noir transparent</Label>
                    <Switch
                      checked={!!assetsConfig.decorativeOverlayLeft?.chromaKeyBlack}
                      onCheckedChange={(v) => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), chromaKeyBlack: v } })}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-[10px] text-muted-foreground">Fond blanc transparent</Label>
                    <Switch
                      checked={!!assetsConfig.decorativeOverlayLeft?.chromaKeyWhite}
                      onCheckedChange={(v) => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), chromaKeyWhite: v } })}
                    />
                  </div>
                  {(!!assetsConfig.decorativeOverlayLeft?.chromaKeyBlack || !!assetsConfig.decorativeOverlayLeft?.chromaKeyWhite) && (
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Seuil (bas = personnage opaque, haut = fond bien enlevé)</Label>
                      <Slider
                        min={5}
                        max={120}
                        value={[assetsConfig.decorativeOverlayLeft?.chromaKeyThreshold ?? 55]}
                        onValueChange={([v]) => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), chromaKeyThreshold: v } })}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Vitesse vidéo ({(assetsConfig.decorativeOverlayLeft?.videoPlaybackRate ?? 1).toFixed(2)}×)</Label>
                    <Slider
                      min={25}
                      max={200}
                      value={[Math.round((assetsConfig.decorativeOverlayLeft?.videoPlaybackRate ?? 1) * 100)]}
                      onValueChange={([v]) => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), videoPlaybackRate: v / 100 } })}
                    />
                  </div>
                </div>
              )}
              {assetsConfig.decorativeOverlayLeft?.url && (
                <div className="space-y-1 pt-1 border-t border-border/50">
                  <Label className="text-[10px] text-muted-foreground">Effet de lumière (incrustation)</Label>
                  <Select
                    value={assetsConfig.decorativeOverlayLeft?.lightEffect ?? "shadow_glow"}
                    onValueChange={(v: "none" | "shadow" | "glow" | "shadow_glow") => updateAssets({ decorativeOverlayLeft: { ...(assetsConfig.decorativeOverlayLeft ?? DEFAULT_DECORATIVE_OVERLAY_LEFT), lightEffect: v } })}
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">Aucun</SelectItem>
                      <SelectItem value="shadow" className="text-xs">Ombre portée</SelectItem>
                      <SelectItem value="glow" className="text-xs">Lueur</SelectItem>
                      <SelectItem value="shadow_glow" className="text-xs">Ombre + lueur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Personnage à DROITE : PNG ou MP4 breathe, position réglable */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">➡️ Personnage à droite</h3>
          <p className="text-[10px] text-muted-foreground">Image ou vidéo (breathe). Optionnel.</p>
          <div
            onClick={() => onSelectSlot(selectedSlot === "__decorative_overlay_right__" ? null : "__decorative_overlay_right__")}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (draggedAsset && draggedAsset.type !== "lottie") {
                const isVideo = draggedAsset.type === "mp4" || draggedAsset.type === "webm" || /\.(mp4|webm)$/i.test(draggedAsset.url);
                updateAssets({
                  decorativeOverlayRight: {
                    ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT),
                    url: draggedAsset.url,
                    type: isVideo ? "video" : "image",
                    ...(isVideo ? { chromaKeyBlack: true, chromaKeyThreshold: 55 } : {}),
                  },
                });
                setDraggedAsset(null);
              }
            }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
              selectedSlot === "__decorative_overlay_right__" ? "border-primary bg-primary/10 ring-2 ring-primary/30" :
              draggedAsset ? "border-dashed border-primary/50 bg-primary/5" : "border-border bg-card/50 hover:border-primary/30"
            )}
          >
            {assetsConfig.decorativeOverlayRight?.url ? (
              <>
                {assetsConfig.decorativeOverlayRight.type === "video" ? (
                  <span className="w-16 h-10 rounded flex items-center justify-center bg-muted/50 text-lg">🎬</span>
                ) : (
                  <img src={assetsConfig.decorativeOverlayRight.url} alt="Droite" className="w-16 h-10 rounded object-contain bg-muted/50"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <span className="text-xs text-foreground flex-1 truncate">{assetsConfig.decorativeOverlayRight.type === "video" ? "Vidéo" : "Image"}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                  onClick={e => { e.stopPropagation(); updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), url: null } }); }}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic w-full text-center py-2">
                {selectedSlot === "__decorative_overlay_right__" ? "🎯 Cliquez sur une image ou vidéo" : draggedAsset ? "↓ Déposer ici" : "Cliquer pour sélectionner"}
              </p>
            )}
          </div>
          {assetsConfig.decorativeOverlayRight?.url && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Position X (%)</Label>
                  <Slider
                    min={0}
                    max={100}
                    value={[assetsConfig.decorativeOverlayRight?.positionX ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT.positionX]}
                    onValueChange={([v]) => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), positionX: v } })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Position Y (%)</Label>
                  <Slider
                    min={0}
                    max={100}
                    value={[assetsConfig.decorativeOverlayRight?.positionY ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT.positionY]}
                    onValueChange={([v]) => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), positionY: v } })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Taille (%)</Label>
                <Slider
                  min={50}
                  max={800}
                  value={[assetsConfig.decorativeOverlayRight?.scale ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT.scale]}
                  onValueChange={([v]) => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), scale: v } })}
                />
              </div>
              {assetsConfig.decorativeOverlayRight?.type === "video" && (
                <div className="space-y-2 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-[10px] text-muted-foreground">Fond noir transparent</Label>
                    <Switch
                      checked={!!assetsConfig.decorativeOverlayRight?.chromaKeyBlack}
                      onCheckedChange={(v) => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), chromaKeyBlack: v } })}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-[10px] text-muted-foreground">Fond blanc transparent</Label>
                    <Switch
                      checked={!!assetsConfig.decorativeOverlayRight?.chromaKeyWhite}
                      onCheckedChange={(v) => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), chromaKeyWhite: v } })}
                    />
                  </div>
                  {(!!assetsConfig.decorativeOverlayRight?.chromaKeyBlack || !!assetsConfig.decorativeOverlayRight?.chromaKeyWhite) && (
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Seuil (bas = personnage opaque, haut = fond bien enlevé)</Label>
                      <Slider
                        min={5}
                        max={120}
                        value={[assetsConfig.decorativeOverlayRight?.chromaKeyThreshold ?? 55]}
                        onValueChange={([v]) => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), chromaKeyThreshold: v } })}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Vitesse vidéo ({(assetsConfig.decorativeOverlayRight?.videoPlaybackRate ?? 1).toFixed(2)}×)</Label>
                    <Slider
                      min={25}
                      max={200}
                      value={[Math.round((assetsConfig.decorativeOverlayRight?.videoPlaybackRate ?? 1) * 100)]}
                      onValueChange={([v]) => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), videoPlaybackRate: v / 100 } })}
                    />
                  </div>
                </div>
              )}
              {assetsConfig.decorativeOverlayRight?.url && (
                <div className="space-y-1 pt-1 border-t border-border/50">
                  <Label className="text-[10px] text-muted-foreground">Effet de lumière (incrustation)</Label>
                  <Select
                    value={assetsConfig.decorativeOverlayRight?.lightEffect ?? "shadow_glow"}
                    onValueChange={(v: "none" | "shadow" | "glow" | "shadow_glow") => updateAssets({ decorativeOverlayRight: { ...(assetsConfig.decorativeOverlayRight ?? DEFAULT_DECORATIVE_OVERLAY_RIGHT), lightEffect: v } })}
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">Aucun</SelectItem>
                      <SelectItem value="shadow" className="text-xs">Ombre portée</SelectItem>
                      <SelectItem value="glow" className="text-xs">Lueur</SelectItem>
                      <SelectItem value="shadow_glow" className="text-xs">Ombre + lueur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vidéo multiplicateur (MP4) : jouée quand un gain tombe sur la grille (ex. Zeus lance des éclairs) */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">⚡ Vidéo multiplicateur (MP4)</h3>
          <p className="text-[10px] text-muted-foreground">Vidéo jouée une fois quand un multiplicateur / gain tombe (ex. Gates of Olympus – éclairs).</p>
          <div
            onClick={() => onSelectSlot(selectedSlot === "__multiplier_video__" ? null : "__multiplier_video__")}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              const isVideo = draggedAsset && (draggedAsset.type === "mp4" || draggedAsset.type === "webm" || /\.(mp4|webm)$/i.test(draggedAsset.url));
              if (isVideo) {
                updateAssets({ multiplierRevealVideo: draggedAsset!.url });
                setDraggedAsset(null);
              }
            }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
              selectedSlot === "__multiplier_video__" ? "border-primary bg-primary/10 ring-2 ring-primary/30" :
              draggedAsset && (draggedAsset.type === "mp4" || draggedAsset.type === "webm" || /\.(mp4|webm)$/i.test(draggedAsset.url)) ? "border-dashed border-primary/50 bg-primary/5" : "border-border bg-card/50 hover:border-primary/30"
            )}
          >
            {assetsConfig.multiplierRevealVideo ? (
              <>
                <span className="w-16 h-10 rounded flex items-center justify-center bg-muted/50 text-lg">🎬</span>
                <span className="text-xs text-foreground flex-1 truncate">Vidéo assignée</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                  onClick={e => { e.stopPropagation(); updateAssets({ multiplierRevealVideo: null }); }}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic w-full text-center py-2">
                {selectedSlot === "__multiplier_video__" ? "🎯 Cliquez sur une vidéo MP4" : draggedAsset && (draggedAsset.type === "mp4" || draggedAsset.type === "webm" || /\.(mp4|webm)$/i.test(draggedAsset.url)) ? "↓ Déposer ici" : "Cliquer (MP4 uniquement)"}
              </p>
            )}
          </div>
        </div>

        {/* Symbols */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">🎴 Symboles</h3>
            <Button variant="outline" size="sm" onClick={autoAssign} className="text-xs h-7">
              <Shuffle className="h-3 w-3 mr-1" /> Auto
            </Button>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {symbols.map(sym => {
              const url = assetsConfig.symbolAssets[sym.id];
              return (
                <div key={sym.id}
                  onClick={() => onSelectSlot(selectedSlot === sym.id ? null : sym.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (draggedAsset) { assignAsset(sym.id, draggedAsset.url); setDraggedAsset(null); } }}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer",
                    selectedSlot === sym.id ? "border-primary bg-primary/10 ring-2 ring-primary/30" :
                    draggedAsset ? "border-dashed border-primary/50 bg-primary/5" : "border-border bg-card/50 hover:border-primary/30"
                  )}
                >
                  <div className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border"
                    style={{ backgroundColor: sym.color + "30", color: sym.color, borderColor: sym.color + "50" }}>
                    {sym.name}
                  </div>
                  <div className="flex-1 min-w-0">
                    {url ? (
                      <div className="flex items-center gap-2">
                        <img src={url} alt={sym.name} className="w-8 h-8 rounded object-contain bg-muted/50"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <span className="text-xs text-foreground truncate flex-1">Assigné</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {selectedSlot === sym.id ? "🎯 Cliquez un asset" : "Cliquer pour sélectionner"}
                      </p>
                    )}
                  </div>
                  {url && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                      onClick={e => { e.stopPropagation(); assignAsset(sym.id, null); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 2: WIN ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════
function WinAnimationsTab({
  assetsConfig, updateAssets,
}: {
  assetsConfig: AssetsConfig;
  updateAssets: (p: Partial<AssetsConfig>) => void;
}) {
  const tiers: WinTier[] = ["win", "bigwin", "megawin", "freespins"];
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const updateAnim = (tier: WinTier, field: string, value: any) => {
    const updated = assetsConfig.winAnimations.map(a => a.tier === tier ? { ...a, [field]: value } : a);
    updateAssets({ winAnimations: updated });
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">🎬 Animations de Win</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Configurez l'animation, la durée et l'intensité pour chaque palier de gain.
        </p>
      </div>

      {tiers.map(tier => {
        const anim = assetsConfig.winAnimations.find(a => a.tier === tier);
        const options = WIN_ANIMATION_OPTIONS[tier];
        if (!anim || !options) return null;

        return (
          <div key={tier} className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">{options.label}</h4>
              <Button variant="ghost" size="sm" className="h-7 text-xs"
                onClick={() => setShowPreview(showPreview === tier ? null : tier)}>
                <Play className="h-3 w-3 mr-1" /> {showPreview === tier ? "Masquer" : "Aperçu"}
              </Button>
            </div>

            {showPreview === tier && <WinAnimationPreview animId={anim.builtIn} intensity={anim.intensity} />}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Animation</label>
              <Select value={anim.builtIn} onValueChange={v => updateAnim(tier, "builtIn", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.options.map(opt => (
                    <SelectItem key={opt.id} value={opt.id} className="text-xs">{opt.icon} {opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Durée: {anim.duration}s</label>
                <Slider value={[anim.duration]} onValueChange={([v]) => updateAnim(tier, "duration", v)} min={0.5} max={5} step={0.5} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Intensité</label>
                <Select value={anim.intensity} onValueChange={v => updateAnim(tier, "intensity", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="text-xs">🔹 Low</SelectItem>
                    <SelectItem value="medium" className="text-xs">🔸 Medium</SelectItem>
                    <SelectItem value="overthetop" className="text-xs">🔥 Over the top</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 3: PARTICLE EFFECTS (rebuilt with canvas preview)
// ═══════════════════════════════════════════════════════════════════════
function ParticleEffectsTab({
  assetsConfig, updateAssets,
}: {
  assetsConfig: AssetsConfig;
  updateAssets: (p: Partial<AssetsConfig>) => void;
}) {
  // Always ensure we have effects (fix for empty array issue)
  const effects = (assetsConfig.particleEffects && assetsConfig.particleEffects.length > 0)
    ? assetsConfig.particleEffects
    : DEFAULT_PARTICLE_EFFECTS;

  // Initialize effects in config if they were missing
  useEffect(() => {
    if (!assetsConfig.particleEffects || assetsConfig.particleEffects.length === 0) {
      updateAssets({ particleEffects: DEFAULT_PARTICLE_EFFECTS });
    }
  }, []);

  const updateEffect = (id: string, field: string, value: any) => {
    const updated = effects.map(e => e.id === id ? { ...e, [field]: value } : e);
    updateAssets({ particleEffects: updated });
  };

  const enabledCount = effects.filter(e => e.enabled).length;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" /> Effets de Particules
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Activez et personnalisez les effets visuels. {enabledCount > 0 && <Badge variant="secondary" className="text-[10px] ml-1">{enabledCount} actif{enabledCount > 1 ? "s" : ""}</Badge>}
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-7"
          onClick={() => {
            const allEnabled = effects.every(e => e.enabled);
            updateAssets({ particleEffects: effects.map(e => ({ ...e, enabled: !allEnabled })) });
          }}>
          {effects.every(e => e.enabled) ? "Tout désactiver" : "Tout activer"}
        </Button>
      </div>

      {/* Live canvas preview */}
      <ParticleCanvasPreview effects={effects} />

      {/* Effect controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {effects.map(effect => (
          <div key={effect.id}
            className={cn(
              "p-3 rounded-xl border transition-all",
              effect.enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card/50 opacity-70"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{effect.name}</span>
              <Switch checked={effect.enabled} onCheckedChange={v => updateEffect(effect.id, "enabled", v)} />
            </div>

            {effect.enabled && (
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Couleur</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={effect.color}
                        onChange={e => updateEffect(effect.id, "color", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent" />
                      <span className="text-xs text-muted-foreground font-mono">{effect.color}</span>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Densité: {effect.density}%
                    </label>
                    <Slider value={[effect.density]} onValueChange={([v]) => updateEffect(effect.id, "density", v)}
                      min={5} max={100} step={5} />
                  </div>
                </div>

                {/* Mini color bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: effect.color + "20" }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${effect.density}%`, backgroundColor: effect.color }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 4: CUSTOM UPLOAD
// ═══════════════════════════════════════════════════════════════════════
function CustomUploadTab({
  assetsConfig, updateAssets, fileInputRef, onPreview,
}: {
  assetsConfig: AssetsConfig;
  updateAssets: (p: Partial<AssetsConfig>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPreview: (asset: AssetItem) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const ACCEPTED = ".png,.jpg,.jpeg,.gif,.svg,.webp,.json,.mp4,.webm";
  const MAX_SIZE_IMAGE = 2 * 1024 * 1024;   // 2 MB pour images / Lottie
  const MAX_SIZE_VIDEO = 50 * 1024 * 1024;  // 50 MB pour vidéos MP4/WebM

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const isVideo = ext === "mp4" || ext === "webm";
      const maxSize = isVideo ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE;
      if (file.size > maxSize) {
        alert(`${file.name} dépasse ${isVideo ? "50" : "2"}MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const isLottie = ext === "json";
        const type = isLottie ? "lottie" : (ext === "mp4" ? "mp4" : ext === "webm" ? "webm" : (ext as any));
        const newAsset: AssetItem = {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          category: isVideo ? "backgrounds" : "symbols",
          source: "custom",
          license: "FREE",
          type,
          url: dataUrl,
          thumbnailUrl: isLottie || isVideo ? "" : dataUrl,
          tags: ["custom", "uploaded"],
        };
        updateAssets({ customAssets: [...assetsConfig.customAssets, newAsset] });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCustom = (id: string) => {
    updateAssets({ customAssets: assetsConfig.customAssets.filter(a => a.id !== id) });
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">📤 Upload Custom</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Importez vos assets : images (PNG, JPG, GIF, SVG, WEBP), Lottie (JSON), vidéos (MP4, WebM). Images/Lottie max 2MB, vidéos max 50MB.
        </p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-accent/20"
        )}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-foreground font-medium">Glissez vos fichiers ici ou cliquez</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, SVG, WEBP, JSON, MP4, WebM — Images 2MB, vidéos 50MB</p>
        <input ref={fileInputRef} type="file" accept={ACCEPTED} multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {assetsConfig.customAssets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Mes Assets ({assetsConfig.customAssets.length})</h4>
          <div className="grid grid-cols-4 gap-2">
            {assetsConfig.customAssets.map(asset => (
              <div key={asset.id} className="relative group rounded-lg border border-border bg-card p-2">
                <div className="aspect-square rounded bg-muted/50 flex items-center justify-center overflow-hidden mb-1 relative cursor-pointer"
                  onClick={() => onPreview(asset)}>
                  {asset.type === "lottie" || asset.type === "mp4" || asset.type === "webm" ? (
                    <span className="text-xl">{asset.type === "lottie" ? "🎬" : "🎥"}</span>
                  ) : (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-[10px] truncate text-foreground">{asset.name}</p>
                <button onClick={() => removeCustom(asset.id)}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
