import { createRoot } from "react-dom/client";
import "@/index.css";
import { GameConfigProvider } from "@/context/GameConfigContext";
import { SlotControlsProvider } from "@/context/SlotControlsContext";
import { RgsProvider } from "@/context/RgsContext";
import { StakePlayerApp } from "./StakePlayerApp";

createRoot(document.getElementById("root")!).render(
  <GameConfigProvider>
    <SlotControlsProvider>
      <RgsProvider>
        <StakePlayerApp />
      </RgsProvider>
    </SlotControlsProvider>
  </GameConfigProvider>
);

