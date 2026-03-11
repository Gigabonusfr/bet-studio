export type LayoutMode = "integrated" | "separated" | "minimal";

export type SpinButtonShape = "round" | "rounded-square" | "hexagon" | "pill";
export type SpinButtonSize = "S" | "M" | "L" | "XL";
export type SpinButtonIcon = "arrow" | "play" | "lightning" | "text" | "dice";
export type SpinButtonAnimation = "pulse" | "bounce" | "rotate" | "glow" | "none";

export type BetStyle = "arrows" | "plusminus" | "slider" | "dropdown";
export type BarPosition = "bottom" | "top" | "floating";
export type BorderStyle = "none" | "thin" | "glow";

export interface BalanceConfig {
  visible: boolean;
  label: string;
  color: string;
  fontSize: "S" | "M" | "L";
}

export interface BetConfig {
  visible: boolean;
  style: BetStyle;
  accentColor: string;
  presets: readonly number[];
}

export interface AutoSpinConfig {
  visible: boolean;
  options: readonly number[];
  color: string;
}

export interface TurboConfig {
  visible: boolean;
  color: string;
  speed: 2 | 3 | 5;
}

export interface SpinButtonConfig {
  shape: SpinButtonShape;
  size: SpinButtonSize;
  backgroundColor: string;
  iconColor: string;
  icon: SpinButtonIcon;
  animation: SpinButtonAnimation;
}

export interface BarConfig {
  backgroundColor: string;
  opacity: number;
  border: BorderStyle;
  borderColor: string;
  borderRadius: number;
  position: BarPosition;
}

export interface SlotControlsConfig {
  layout: LayoutMode;
  spinButton: SpinButtonConfig;
  balance: BalanceConfig;
  bet: BetConfig;
  autoSpin: AutoSpinConfig;
  turbo: TurboConfig;
  bar: BarConfig;
}

export const THEMES = {
  ocean: {
    name: "Ocean",
    layout: "integrated" as LayoutMode,
    spinButton: {
      shape: "round" as SpinButtonShape,
      size: "L" as SpinButtonSize,
      backgroundColor: "#14B8A6",
      iconColor: "#FFFFFF",
      icon: "arrow" as SpinButtonIcon,
      animation: "pulse" as SpinButtonAnimation,
    },
    balance: {
      visible: true,
      label: "BALANCE",
      color: "#06B6D4",
      fontSize: "M" as const,
    },
    bet: {
      visible: true,
      style: "arrows" as BetStyle,
      accentColor: "#0891B2",
      presets: [0.1, 0.2, 0.5, 1, 2, 5],
    },
    autoSpin: {
      visible: true,
      options: [10, 25, 50, 100],
      color: "#14B8A6",
    },
    turbo: {
      visible: true,
      color: "#06B6D4",
      speed: 2 as const,
    },
    bar: {
      backgroundColor: "#0F172A",
      opacity: 95,
      border: "thin" as BorderStyle,
      borderColor: "#14B8A6",
      borderRadius: 12,
      position: "bottom" as BarPosition,
    },
  },
  neonVegas: {
    name: "Neon Vegas",
    layout: "separated" as LayoutMode,
    spinButton: {
      shape: "round" as SpinButtonShape,
      size: "XL" as SpinButtonSize,
      backgroundColor: "#A855F7",
      iconColor: "#FFFFFF",
      icon: "play" as SpinButtonIcon,
      animation: "pulse" as SpinButtonAnimation,
    },
    balance: {
      visible: true,
      label: "CREDITS",
      color: "#22C55E",
      fontSize: "L" as const,
    },
    bet: {
      visible: true,
      style: "plusminus" as BetStyle,
      accentColor: "#A855F7",
      presets: [0.5, 1, 2, 5, 10],
    },
    autoSpin: {
      visible: true,
      options: [10, 25, 50],
      color: "#A855F7",
    },
    turbo: {
      visible: true,
      color: "#EC4899",
      speed: 3 as const,
    },
    bar: {
      backgroundColor: "#000000",
      opacity: 90,
      border: "glow" as BorderStyle,
      borderColor: "#A855F7",
      borderRadius: 8,
      position: "bottom" as BarPosition,
    },
  },
  goldLuxury: {
    name: "Gold Luxury",
    layout: "integrated" as LayoutMode,
    spinButton: {
      shape: "pill" as SpinButtonShape,
      size: "L" as SpinButtonSize,
      backgroundColor: "#F5A623",
      iconColor: "#1A1A1A",
      icon: "text" as SpinButtonIcon,
      animation: "glow" as SpinButtonAnimation,
    },
    balance: {
      visible: true,
      label: "BALANCE",
      color: "#FEF3C7",
      fontSize: "M" as const,
    },
    bet: {
      visible: true,
      style: "dropdown" as BetStyle,
      accentColor: "#F5A623",
      presets: [1, 2, 5, 10, 20, 50],
    },
    autoSpin: {
      visible: true,
      options: [10, 25, 50, 100],
      color: "#F5A623",
    },
    turbo: {
      visible: false,
      color: "#F5A623",
      speed: 2 as const,
    },
    bar: {
      backgroundColor: "#1A1A1A",
      opacity: 95,
      border: "thin" as BorderStyle,
      borderColor: "#F5A623",
      borderRadius: 16,
      position: "bottom" as BarPosition,
    },
  },
  minimalDark: {
    name: "Minimal Dark",
    layout: "minimal" as LayoutMode,
    spinButton: {
      shape: "round" as SpinButtonShape,
      size: "XL" as SpinButtonSize,
      backgroundColor: "#FFFFFF",
      iconColor: "#1A1A2E",
      icon: "play" as SpinButtonIcon,
      animation: "none" as SpinButtonAnimation,
    },
    balance: {
      visible: true,
      label: "Balance",
      color: "#E5E7EB",
      fontSize: "S" as const,
    },
    bet: {
      visible: true,
      style: "slider" as BetStyle,
      accentColor: "#9CA3AF",
      presets: [0.1, 0.5, 1, 5, 10],
    },
    autoSpin: {
      visible: false,
      options: [10, 25, 50],
      color: "#9CA3AF",
    },
    turbo: {
      visible: false,
      color: "#9CA3AF",
      speed: 2 as const,
    },
    bar: {
      backgroundColor: "#1A1A2E",
      opacity: 100,
      border: "none" as BorderStyle,
      borderColor: "#FFFFFF",
      borderRadius: 0,
      position: "bottom" as BarPosition,
    },
  },
  cyberRed: {
    name: "Cyber Red",
    layout: "separated" as LayoutMode,
    spinButton: {
      shape: "hexagon" as SpinButtonShape,
      size: "L" as SpinButtonSize,
      backgroundColor: "#FF2D55",
      iconColor: "#FFFFFF",
      icon: "lightning" as SpinButtonIcon,
      animation: "glow" as SpinButtonAnimation,
    },
    balance: {
      visible: true,
      label: "CREDITS",
      color: "#FF2D55",
      fontSize: "M" as const,
    },
    bet: {
      visible: true,
      style: "plusminus" as BetStyle,
      accentColor: "#FF2D55",
      presets: [0.5, 1, 2, 5, 10, 20],
    },
    autoSpin: {
      visible: true,
      options: [10, 50, 100],
      color: "#FF2D55",
    },
    turbo: {
      visible: true,
      color: "#FF2D55",
      speed: 5 as const,
    },
    bar: {
      backgroundColor: "#0A0A0A",
      opacity: 95,
      border: "glow" as BorderStyle,
      borderColor: "#FF2D55",
      borderRadius: 4,
      position: "bottom" as BarPosition,
    },
  },
} as const;

export const DEFAULT_CONTROLS_CONFIG: SlotControlsConfig = THEMES.ocean;
