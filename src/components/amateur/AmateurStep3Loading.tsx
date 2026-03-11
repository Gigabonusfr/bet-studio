import { useGameConfig } from "@/context/GameConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";

export function AmateurStep3Loading() {
  const { config, updateConfig } = useGameConfig();

  return (
    <div className="space-y-6">
      <StepGuide items={useStepCompletion().getStepItems(2)} />

      <div>
        <h2 className="text-2xl font-bold text-foreground">Écran de Chargement</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Avant que la slot démarre, un petit écran de chargement rassure le joueur et laisse le temps à l&apos;interface de se mettre en place.
          La barre de progression reprend automatiquement les couleurs de votre UX (barre et bouton AUTO).
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary">Preview dans le builder</h3>
        <p className="text-xs text-muted-foreground">
          Cliquez sur le bouton ci-dessous pour afficher le loader pendant quelques secondes dans le preview de droite, sans affecter le
          fonctionnement réel du jeu.
        </p>
        <Button
          size="sm"
          onClick={() => updateConfig({ ...config, bootLoaderPreview: true })}
          className="w-fit"
        >
          Voir le loader maintenant
        </Button>
      </div>

      {/* Background spécifique pour le chargement */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary">Background pendant le chargement</h3>
        <p className="text-xs text-muted-foreground">
          Optionnel : vous pouvez afficher une image dédiée (logo studio, écran d&apos;intro, illustration fixe) uniquement pendant le chargement.
          Si rien n&apos;est défini, le jeu utilise simplement le background normal.
        </p>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Image de fond (PNG/JPG/GIF)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              updateConfig({ ...config, bootLoaderBackgroundUrl: url });
            }}
            className="bg-input border-border"
          />
          {config.bootLoaderBackgroundUrl && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-md border border-border bg-cover bg-center"
                  style={{ backgroundImage: `url(${config.bootLoaderBackgroundUrl})` }}
                />
                <span className="text-[11px] text-muted-foreground">Background de loader défini</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => updateConfig({ ...config, bootLoaderBackgroundUrl: undefined })}
              >
                Effacer
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p>
          💡 <strong className="text-foreground">En export :</strong> le loader apparaît automatiquement au démarrage de la machine,
          puis disparaît dès que tout est prêt. Vous n&apos;avez rien d&apos;autre à configurer.
        </p>
      </div>
    </div>
  );
}

