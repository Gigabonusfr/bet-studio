import { GameConfigProvider } from "@/context/GameConfigContext";
import { MathConfigProvider } from "@/context/MathConfigContext";
import { BuilderLayout } from "@/components/builder/BuilderLayout";

const Index = () => {
  return (
    <GameConfigProvider>
      <MathConfigProvider>
        <BuilderLayout />
      </MathConfigProvider>
    </GameConfigProvider>
  );
};

export default Index;

