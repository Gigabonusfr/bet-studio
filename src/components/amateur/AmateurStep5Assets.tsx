import { Step6Assets } from "@/components/builder/steps/Step6Assets";
import { StepGuide } from "./StepGuide";
import { useStepCompletion } from "@/hooks/useStepCompletion";

export function AmateurStep5Assets() {
  return (
    <div className="space-y-4">
      <StepGuide items={useStepCompletion().getStepItems(5)} />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Assets & Animations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Assignez des images et animations à vos symboles. Parcourez la bibliothèque ou importez vos propres fichiers.
        </p>
      </div>
      <Step6Assets />
    </div>
  );
}
