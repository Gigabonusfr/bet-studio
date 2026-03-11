import { useGameConfig } from "@/context/GameConfigContext";
import { HelpBanner } from "@/components/builder/HelpBanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ParticleEffect, CelebrationStyle, ReelAnimation } from "@/types/game-config";

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 casino-card p-5 border-gold/20">
      <h3 className="text-lg font-semibold text-gold flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-9 p-0.5 cursor-pointer bg-input border-border" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-input border-border font-mono text-xs" />
      </div>
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step, suffix }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-foreground text-xs">{label}</Label>
        <span className="text-xs font-mono text-muted-foreground">{value}{suffix}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="w-full" />
    </div>
  );
}

export function Step6UXEffects() {
  const { config, updateConfig } = useGameConfig();
  const ve = config.visualEffects;
  const au = config.audio;
  const an = config.animation;

  const setVE = (partial: Partial<typeof ve>) => updateConfig({ visualEffects: { ...ve, ...partial } });
  const setAU = (partial: Partial<typeof au>) => updateConfig({ audio: { ...au, ...partial } });
  const setAN = (partial: Partial<typeof an>) => updateConfig({ animation: { ...an, ...partial } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Effets UX & Audio</h2>
        <p className="text-sm text-muted-foreground mt-1">Personnalisez l'expérience visuelle et sonore de votre slot</p>
      </div>

      <HelpBanner id="pro-step6-uxeffects">
        💡 Réglez finement les particules, lueurs, célébrations et animations. Chaque paramètre est exporté dans <code className="bg-muted px-1 rounded">design_config.json</code> pour le client.
      </HelpBanner>

      {/* Visual Effects */}
      <Section title="Effets Visuels" icon="✨">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Effet de Particules</Label>
            <Select value={ve.particleEffect} onValueChange={(v) => setVE({ particleEffect: v as ParticleEffect })}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {(["none", "confetti", "sparkles", "coins", "stars", "fire"] as ParticleEffect[]).map((e) => (
                  <SelectItem key={e} value={e} className="capitalize">{e === "none" ? "Aucun" : e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SliderField label="Intensité Particules" value={ve.particleIntensity} onChange={(v) => setVE({ particleIntensity: v })} min={10} max={100} step={5} suffix="%" />
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Animation Symboles</Label>
            <Select value={ve.symbolAnimation} onValueChange={(v) => setVE({ symbolAnimation: v as typeof ve.symbolAnimation })}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["none", "pulse", "shake", "flip", "zoom"].map((a) => (
                  <SelectItem key={a} value={a} className="capitalize">{a === "none" ? "Aucune" : a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Style Célébration</Label>
            <Select value={ve.celebrationStyle} onValueChange={(v) => setVE({ celebrationStyle: v as CelebrationStyle })}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {(["none", "classic", "epic", "neon", "golden"] as CelebrationStyle[]).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s === "none" ? "Aucun" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SliderField label="Seuil Célébration (multiplicateur)" value={ve.celebrationThreshold} onChange={(v) => setVE({ celebrationThreshold: v })} min={2} max={100} step={1} suffix="x" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <Label className="text-foreground text-xs">Lueur (Glow)</Label>
            <Switch checked={ve.glowEnabled} onCheckedChange={(v) => setVE({ glowEnabled: v })} />
          </div>
          <SliderField label="Intensité Lueur" value={ve.glowIntensity} onChange={(v) => setVE({ glowIntensity: v })} min={10} max={100} step={5} suffix="%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorInput label="Couleur Lueur" value={ve.glowColor} onChange={(v) => setVE({ glowColor: v })} />
          <ColorInput label="Couleur Ligne de Gain" value={ve.winLineColor} onChange={(v) => setVE({ winLineColor: v })} />
          <ColorInput label="Couleur Bordure Grille" value={ve.gridBorderColor} onChange={(v) => setVE({ gridBorderColor: v })} />
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Style Bordure Grille</Label>
            <Select value={ve.gridBorderStyle} onValueChange={(v) => setVE({ gridBorderStyle: v as typeof ve.gridBorderStyle })}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["none", "solid", "glow", "neon", "gradient"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s === "none" ? "Aucun" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SliderField label="Épaisseur Ligne de Gain" value={ve.winLineWidth} onChange={(v) => setVE({ winLineWidth: v })} min={1} max={6} step={0.5} suffix="px" />
      </Section>

      {/* Animation */}
      <Section title="Animations" icon="🎬">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Animation des Rouleaux</Label>
            <Select value={an.reelAnimation} onValueChange={(v) => setAN({ reelAnimation: v as ReelAnimation })}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {(["instant", "cascade", "bounce", "elastic", "blur"] as ReelAnimation[]).map((a) => (
                  <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SliderField label="Vitesse" value={an.speed} onChange={(v) => setAN({ speed: v })} min={0.5} max={3} step={0.1} suffix="x" />
          <SliderField label="Délai Cascade" value={an.cascadeDelay} onChange={(v) => setAN({ cascadeDelay: v })} min={50} max={500} step={25} suffix="ms" />
          <SliderField label="Durée Animation Gain" value={an.winAnimationDuration} onChange={(v) => setAN({ winAnimationDuration: v })} min={500} max={5000} step={250} suffix="ms" />
          <SliderField label="Échelle Symboles" value={an.symbolScale} onChange={(v) => setAN({ symbolScale: v })} min={0.5} max={2} step={0.1} suffix="x" />
          <SliderField label="Rouleaux Anticipation" value={an.anticipationReels} onChange={(v) => setAN({ anticipationReels: v })} min={0} max={4} step={1} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {([
            ["Anticipation", an.anticipationEnabled, (v: boolean) => setAN({ anticipationEnabled: v })],
            ["Rebond", an.bounceEnabled, (v: boolean) => setAN({ bounceEnabled: v })],
            ["Mode Turbo", an.turboMode, (v: boolean) => setAN({ turboMode: v })],
          ] as const).map(([label, checked, onChange]) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
              <Label className="text-foreground text-xs">{label}</Label>
              <Switch checked={checked} onCheckedChange={onChange} />
            </div>
          ))}
        </div>
      </Section>

      {/* Audio */}
      <Section title="Audio & Sons" icon="🔊">
        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
          <Label className="text-foreground">Audio Activé</Label>
          <Switch checked={au.enabled} onCheckedChange={(v) => setAU({ enabled: v })} />
        </div>

        {au.enabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">🎵 Musique Base Game</Label>
                <Input
                  value={au.basegameMusicUrl || ""}
                  onChange={(e) => setAU({ basegameMusicUrl: e.target.value })}
                  placeholder="https://example.com/basegame-music.mp3"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">🎶 Musique Free Spins</Label>
                <Input
                  value={au.freespinMusicUrl || ""}
                  onChange={(e) => setAU({ freespinMusicUrl: e.target.value })}
                  placeholder="https://example.com/freespin-music.mp3"
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SliderField label="Volume Musique" value={au.musicVolume} onChange={(v) => setAU({ musicVolume: v })} min={0} max={100} step={5} suffix="%" />
              <SliderField label="Volume SFX" value={au.sfxVolume} onChange={(v) => setAU({ sfxVolume: v })} min={0} max={100} step={5} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                ["Son Spin", au.spinSound, (v: boolean) => setAU({ spinSound: v })],
                ["Son Gain", au.winSound, (v: boolean) => setAU({ winSound: v })],
                ["Son Big Win", au.bigWinSound, (v: boolean) => setAU({ bigWinSound: v })],
                ["Son Arrêt Rouleau", au.reelStopSound, (v: boolean) => setAU({ reelStopSound: v })],
                ["Son Bouton", au.buttonClickSound, (v: boolean) => setAU({ buttonClickSound: v })],
              ] as const).map(([label, checked, onChange]) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <Label className="text-foreground text-xs">{label}</Label>
                  <Switch checked={checked} onCheckedChange={onChange} />
                </div>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* Background & Assets */}
      <Section title="Arrière-plan & Assets" icon="🖼️">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Image de Fond (URL)</Label>
            <Input
              value={config.backgroundImage || ""}
              onChange={(e) => updateConfig({ backgroundImage: e.target.value })}
              placeholder="https://example.com/background.jpg"
              className="bg-input border-border text-foreground"
            />
          </div>
          <ColorInput label="Couleur Grille" value={config.reelColor || "#1a1c23"} onChange={(v) => updateConfig({ reelColor: v })} />
        </div>
      </Section>
    </div>
  );
}
