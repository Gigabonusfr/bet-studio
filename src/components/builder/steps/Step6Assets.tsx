import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Upload, Shuffle, X, Image, Sparkles, Palette, Eye, Play, ExternalLink, Plus, MousePointer, Zap } from "lucide-react";
import { CURATED_ASSETS, ASSET_CATEGORIES, WIN_ANIMATION_OPTIONS } from "@/data/curated-assets";
import type { AssetItem, WinTier, AssetsConfig, ParticleEffectConfig } from "@/types/asset-types";
import { DEFAULT_ASSETS_CONFIG, DEFAULT_PARTICLE_EFFECTS } from "@/types/asset-types";
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

// ─── WIN ANIMATION PREVIEW ──────────────────────────────────────────────
function WinAnimationPreview({ animId, intensity }: { animId: string; intensity: "low" | "medium" | "overthetop" }) {
  const count = intensity === "low" ? 5 : intensity === "medium" ? 10 : 20;
  const animations: Record<string, React.ReactNode> = {
    coins_fall: (
      <div className="relative h-20 w-full overflow-hidden">
        {[...Array(count)].map((_, i) => (
          <span key={i} className="absolute text-xl animate-bounce"
            style={{ left: `${Math.random() * 90}%`, animationDelay: `${Math.random() * 0.5}s`, animationDuration: `${0.5 + Math.random() * 0.5}s` }}>🪙</span>
        ))}
      </div>
    ),
    golden_flash: (
      <div className={cn("h-20 w-full rounded-lg animate-pulse",
        intensity === "overthetop" ? "bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400" :
        intensity === "medium" ? "bg-gradient-to-r from-yellow-500/70 to-amber-400/70" :
        "bg-gradient-to-r from-yellow-600/50 to-amber-500/50"
      )} />
    ),
    stars_burst: (
      <div className="relative h-20 w-full flex items-center justify-center">
        {[...Array(count)].map((_, i) => (
          <span key={i} className="absolute text-2xl animate-ping"
            style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%`, animationDelay: `${Math.random() * 0.3}s` }}>⭐</span>
        ))}
      </div>
    ),
    win_text: (
      <div className="h-20 w-full flex items-center justify-center">
        <span className={cn("font-black animate-pulse",
          intensity === "overthetop" ? "text-4xl text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" :
          intensity === "medium" ? "text-3xl text-yellow-500" : "text-2xl text-yellow-600"
        )}>WIN!</span>
      </div>
    ),
    coin_explosion: (
      <div className="relative h-20 w-full overflow-hidden">
        {[...Array(count)].map((_, i) => (
          <span key={i} className="absolute text-lg"
            style={{ left: "50%", top: "50%", transform: `translate(-50%,-50%) translate(${(Math.random()-0.5)*150}px,${(Math.random()-0.5)*80}px)`, animation: "ping 0.8s ease-out infinite", animationDelay: `${Math.random()*0.3}s` }}>🪙</span>
        ))}
      </div>
    ),
    confetti_color: (
      <div className="relative h-20 w-full overflow-hidden">
        {["🎊","🎉","✨","💫","🌟"].flatMap((e,ei) => [...Array(Math.ceil(count/5))].map((_,i) => (
          <span key={`${ei}-${i}`} className="absolute text-xl animate-bounce"
            style={{ left: `${Math.random()*90}%`, top: `${Math.random()*80}%`, animationDelay: `${Math.random()*0.5}s` }}>{e}</span>
        )))}
      </div>
    ),
    light_rays: (
      <div className="h-20 w-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-yellow-300/50 to-transparent animate-pulse" />
        <span className="text-3xl z-10">🌟</span>
      </div>
    ),
    counter_frenzy: (
      <div className="h-20 w-full flex items-center justify-center">
        <span className={cn("font-mono font-black tabular-nums",
          intensity === "overthetop" ? "text-4xl text-green-400 animate-pulse" :
          intensity === "medium" ? "text-3xl text-green-500" : "text-2xl text-green-600"
        )}>+$9,999</span>
      </div>
    ),
    fireworks: (
      <div className="relative h-20 w-full overflow-hidden">
        {["🎆","🎇","✨"].flatMap((e,ei) => [...Array(Math.ceil(count/3))].map((_,i) => (
          <span key={`${ei}-${i}`} className="absolute text-2xl animate-ping"
            style={{ left: `${10+Math.random()*80}%`, top: `${10+Math.random()*70}%`, animationDelay: `${Math.random()*0.8}s` }}>{e}</span>
        )))}
      </div>
    ),
    gem_rain: (
      <div className="relative h-20 w-full overflow-hidden">
        {["💎","💠","🔷","🔶"].flatMap((e,ei) => [...Array(Math.ceil(count/4))].map((_,i) => (
          <span key={`${ei}-${i}`} className="absolute text-xl animate-bounce"
            style={{ left: `${Math.random()*90}%`, animationDelay: `${Math.random()*0.5}s` }}>{e}</span>
        )))}
      </div>
    ),
    epic_flash: (
      <div className="h-20 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-4xl">🎉</span>
      </div>
    ),
    banner_animated: (
      <div className="h-20 w-full flex items-center justify-center">
        <div className={cn("px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse", intensity === "overthetop" && "scale-110")}>
          <span className="text-white font-black text-lg">FREE SPINS!</span>
        </div>
      </div>
    ),
    scatter_pulse: (
      <div className="h-20 w-full flex items-center justify-center gap-2">
        {[...Array(3)].map((_, i) => (
          <span key={i} className="text-3xl animate-pulse" style={{ animationDelay: `${i*0.2}s` }}>💫</span>
        ))}
      </div>
    ),
    scene_transition: (
      <div className="h-20 w-full relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold animate-bounce">🎬 TRANSITION</span>
        </div>
      </div>
    ),
  };

  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      {animations[animId] || <div className="h-20 w-full flex items-center justify-center text-muted-foreground text-sm">Aperçu non disponible</div>}
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
            Slot : <strong>{selectedSlot === "__background__" ? "Background" : selectedSlot.toUpperCase()}</strong>
          </span>
          <span className="text-[10px] text-muted-foreground">— Cliquez sur un asset</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => setSelectedSlot(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-10">
          <TabsTrigger value="library" className="text-xs gap-1"><Image className="h-3.5 w-3.5" />Symboles</TabsTrigger>
          <TabsTrigger value="animations" className="text-xs gap-1"><Sparkles className="h-3.5 w-3.5" />Animations</TabsTrigger>
          <TabsTrigger value="particles" className="text-xs gap-1"><Zap className="h-3.5 w-3.5" />Particules</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs gap-1"><Upload className="h-3.5 w-3.5" />Upload</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: SYMBOLES & BACKGROUND ── */}
        <TabsContent value="library">
          <AssetLibraryTab
            assetsConfig={assetsConfig}
            updateAssets={updateAssets}
            symbols={config.symbols}
            onPreview={setPreviewAsset}
            onUpdateConfig={updateConfig}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </TabsContent>

        {/* ── TAB 2: WIN ANIMATIONS ── */}
        <TabsContent value="animations">
          <WinAnimationsTab assetsConfig={assetsConfig} updateAssets={updateAssets} />
        </TabsContent>

        {/* ── TAB 3: PARTICULES ── */}
        <TabsContent value="particles">
          <ParticleEffectsTab assetsConfig={assetsConfig} updateAssets={updateAssets} />
        </TabsContent>

        {/* ── TAB 4: UPLOAD ── */}
        <TabsContent value="upload">
          <CustomUploadTab
            assetsConfig={assetsConfig}
            updateAssets={updateAssets}
            fileInputRef={fileInputRef}
            onPreview={setPreviewAsset}
          />
        </TabsContent>
      </Tabs>

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
  const ACCEPTED = ".png,.jpg,.jpeg,.gif,.svg,.webp,.json";
  const MAX_SIZE = 2 * 1024 * 1024;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > MAX_SIZE) { alert(`${file.name} dépasse 2MB`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const isLottie = ext === "json";
        const newAsset: AssetItem = {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          category: "symbols",
          source: "custom",
          license: "FREE",
          type: isLottie ? "lottie" : (ext as any),
          url: dataUrl,
          thumbnailUrl: isLottie ? "" : dataUrl,
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
          Importez vos assets (PNG, JPG, GIF, SVG, WEBP, JSON Lottie). Max 2MB.
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
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, SVG, WEBP, JSON — Max 2MB</p>
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
                  {asset.type === "lottie" ? (
                    <span className="text-xl">🎬</span>
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
