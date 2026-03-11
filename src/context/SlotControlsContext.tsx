import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SlotControlsConfig, DEFAULT_CONTROLS_CONFIG, THEMES } from "@/types/slot-controls";

interface SlotControlsContextType {
  config: SlotControlsConfig;
  updateConfig: (updates: Partial<SlotControlsConfig>) => void;
  applyTheme: (themeName: keyof typeof THEMES) => void;
  resetToDefault: () => void;
  exportConfig: () => string;
  importConfig: (jsonConfig: string) => void;
}

const SlotControlsContext = createContext<SlotControlsContextType | undefined>(undefined);

const STORAGE_KEY = "slot-controls-config";

export function SlotControlsProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SlotControlsConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CONTROLS_CONFIG;
    } catch {
      return DEFAULT_CONTROLS_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<SlotControlsConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const applyTheme = (themeName: keyof typeof THEMES) => {
    setConfig(THEMES[themeName]);
  };

  const resetToDefault = () => {
    setConfig(DEFAULT_CONTROLS_CONFIG);
  };

  const exportConfig = () => {
    return JSON.stringify(config, null, 2);
  };

  const importConfig = (jsonConfig: string) => {
    try {
      const parsed = JSON.parse(jsonConfig);
      setConfig(parsed);
    } catch (error) {
      console.error("Invalid JSON config", error);
    }
  };

  return (
    <SlotControlsContext.Provider
      value={{ config, updateConfig, applyTheme, resetToDefault, exportConfig, importConfig }}
    >
      {children}
    </SlotControlsContext.Provider>
  );
}

export function useSlotControls() {
  const context = useContext(SlotControlsContext);
  if (!context) {
    throw new Error("useSlotControls must be used within SlotControlsProvider");
  }
  return context;
}
