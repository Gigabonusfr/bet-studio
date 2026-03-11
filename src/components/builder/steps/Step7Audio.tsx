import { useState } from "react";
import { useGameConfig } from "@/context/GameConfigContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadAsset, deleteAsset } from "@/lib/storage-utils";
import { toast } from "sonner";
import { Music, Volume2, Upload, Trash2 } from "lucide-react";

const AUDIO_EVENTS = [
  { key: "spin", label: "Spin Start", description: "Played when reels start spinning" },
  { key: "reelStop", label: "Reel Stop", description: "Played when each reel stops" },
  { key: "win", label: "Regular Win", description: "Played on normal wins" },
  { key: "bigWin", label: "Big Win", description: "Played on big wins (configurable threshold)" },
  { key: "freeSpinsTrigger", label: "Free Spins Trigger", description: "Played when entering free spins" },
  { key: "freeSpinsWin", label: "Free Spins Win", description: "Played during free spins wins" },
  { key: "bonusBuy", label: "Bonus Buy", description: "Played when buying bonus features" },
  { key: "nearMiss", label: "Near Miss", description: "Played on near-miss scenarios" },
  { key: "multiplier", label: "Multiplier", description: "Played when multipliers increase" },
  { key: "ambient", label: "Ambient Background", description: "Looping ambient sound" },
  { key: "buttonClick", label: "Button Click", description: "UI button interaction sound" },
] as const;

export function Step7Audio() {
  const { config, updateConfig } = useGameConfig();
  const [uploading, setUploading] = useState<string | null>(null);
  const audio = config.audio;

  async function handleAudioUpload(eventKey: string, file: File) {
    setUploading(eventKey);
    try {
      const url = await uploadAsset(file, "audio");
      
      // Delete old audio if exists
      const oldUrl = audio[`${eventKey}SoundUrl` as keyof typeof audio];
      if (oldUrl && typeof oldUrl === "string") {
        await deleteAsset(oldUrl);
      }
      
      updateConfig({
        audio: {
          ...audio,
          [`${eventKey}SoundUrl`]: url,
        },
      });
      toast.success("Audio uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload audio");
      console.error(error);
    } finally {
      setUploading(null);
    }
  }

  async function handleAudioRemove(eventKey: string) {
    const urlKey = `${eventKey}SoundUrl` as keyof typeof audio;
    const url = audio[urlKey];
    if (url && typeof url === "string") {
      await deleteAsset(url);
      updateConfig({
        audio: {
          ...audio,
          [urlKey]: undefined,
        },
      });
      toast.success("Audio removed");
    }
  }

  function toggleEvent(eventKey: string, enabled: boolean) {
    updateConfig({
      audio: {
        ...audio,
        [`${eventKey}Sound`]: enabled,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Audio Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure game sounds with default or custom audio</p>
      </div>

      {/* Master Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Master Audio Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Audio</Label>
            <Switch
              checked={audio.enabled}
              onCheckedChange={(enabled) => updateConfig({ audio: { ...audio, enabled } })}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Music Volume</Label>
              <span className="text-sm text-muted-foreground">{audio.musicVolume}%</span>
            </div>
            <Slider
              value={[audio.musicVolume]}
              onValueChange={([v]) => updateConfig({ audio: { ...audio, musicVolume: v } })}
              max={100}
              step={1}
              disabled={!audio.enabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>SFX Volume</Label>
              <span className="text-sm text-muted-foreground">{audio.sfxVolume}%</span>
            </div>
            <Slider
              value={[audio.sfxVolume]}
              onValueChange={([v]) => updateConfig({ audio: { ...audio, sfxVolume: v } })}
              max={100}
              step={1}
              disabled={!audio.enabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Background Music URL</Label>
            <Input
              type="url"
              value={audio.musicUrl}
              onChange={(e) => updateConfig({ audio: { ...audio, musicUrl: e.target.value } })}
              placeholder="https://example.com/music.mp3"
              disabled={!audio.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Sounds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Event Sounds
          </CardTitle>
          <CardDescription>Configure sounds for game events with default or custom audio files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AUDIO_EVENTS.map((event) => {
            const eventKey = event.key;
            const enabled = audio[`${eventKey}Sound` as keyof typeof audio] as boolean;
            const urlKey = `${eventKey}SoundUrl` as keyof typeof audio;
            const customUrl = audio[urlKey] as string | undefined;
            const isUploading = uploading === eventKey;

            return (
              <div key={eventKey} className="casino-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-semibold">{event.label}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(v) => toggleEvent(eventKey, v)}
                        disabled={!audio.enabled}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                  </div>
                </div>

                {enabled && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex gap-2 items-center">
                      <Input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAudioUpload(eventKey, file);
                          }
                        }}
                        disabled={isUploading}
                        className="text-xs"
                      />
                      {isUploading && (
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      )}
                    </div>

                    {customUrl && (
                      <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Custom audio uploaded</span>
                          <audio src={customUrl} controls className="h-8 max-w-[200px]" />
                        </div>
                        <button
                          onClick={() => handleAudioRemove(eventKey)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
