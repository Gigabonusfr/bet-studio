import type { AssetItem } from "@/types/asset-types";

// === HD Background Imports ===
import bgEgyptHd from "@/assets/backgrounds/egypt-pyramids.jpg";
import bgOceanHd from "@/assets/backgrounds/ocean-underwater.jpg";
import bgFantasyHd from "@/assets/backgrounds/fantasy-forest.jpg";
import bgNeonHd from "@/assets/backgrounds/neon-cyberpunk.jpg";

// === Generated Slot Symbol Imports ===
import wildGold from "@/assets/slot-symbols/wild-gold.png";
import scatterCrystal from "@/assets/slot-symbols/scatter-crystal.png";
import diamondBlue from "@/assets/slot-symbols/diamond-blue.png";
import crownRoyal from "@/assets/slot-symbols/crown-royal.png";
import luckySeven from "@/assets/slot-symbols/lucky-seven.png";
import pharaohMask from "@/assets/slot-symbols/pharaoh-mask.png";
import eyeOfHorus from "@/assets/slot-symbols/eye-of-horus.png";
import rubyRed from "@/assets/slot-symbols/ruby-red.png";
import emeraldGreen from "@/assets/slot-symbols/emerald-green.png";
import goldCoins from "@/assets/slot-symbols/gold-coins.png";
import dragonAsian from "@/assets/slot-symbols/dragon-asian.png";
import treasureChest from "@/assets/slot-symbols/treasure-chest.png";
import cherryClassic from "@/assets/slot-symbols/cherry-classic.png";
import bellGold from "@/assets/slot-symbols/bell-gold.png";
import barClassic from "@/assets/slot-symbols/bar-classic.png";
import watermelon from "@/assets/slot-symbols/watermelon.png";
import amethystPurple from "@/assets/slot-symbols/amethyst-purple.png";
import anubisHead from "@/assets/slot-symbols/anubis-head.png";
import ankhGold from "@/assets/slot-symbols/ankh-gold.png";
import orangeFruit from "@/assets/slot-symbols/orange-fruit.png";
import grapesPurple from "@/assets/slot-symbols/grapes-purple.png";
import lemonYellow from "@/assets/slot-symbols/lemon-yellow.png";
import plumPurple from "@/assets/slot-symbols/plum-purple.png";
import horseshoeLuck from "@/assets/slot-symbols/horseshoe-luck.png";
import phoenixFire from "@/assets/slot-symbols/phoenix-fire.png";
import tigerGold from "@/assets/slot-symbols/tiger-gold.png";
import multiplierX2 from "@/assets/slot-symbols/multiplier-x2.png";
import freeSpinsBanner from "@/assets/slot-symbols/free-spins-banner.png";

// Curated free assets with VERIFIED working Lottie URLs
// Using direct lottie.host and assets.lottiefiles.com CDN links
export const CURATED_ASSETS: AssetItem[] = [
  // === LOTTIE ANIMATIONS - Verified working URLs ===
  {
    id: "lottie-confetti-1",
    name: "Confetti Party",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets10.lottiefiles.com/packages/lf20_rovf9gpa.json",
    thumbnailUrl: "",
    tags: ["confetti", "celebration", "party", "win"],
  },
  {
    id: "lottie-fireworks-1",
    name: "Fireworks Show",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets3.lottiefiles.com/packages/lf20_xbf1be8x.json",
    thumbnailUrl: "",
    tags: ["fireworks", "celebration", "mega", "win"],
  },
  {
    id: "lottie-coins-1",
    name: "Flying Coins",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets6.lottiefiles.com/packages/lf20_myejiggj.json",
    thumbnailUrl: "",
    tags: ["coin", "money", "gold", "jackpot"],
  },
  {
    id: "lottie-stars-1",
    name: "Star Sparkle",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets9.lottiefiles.com/packages/lf20_xlkxtmul.json",
    thumbnailUrl: "",
    tags: ["star", "sparkle", "shine", "effect"],
  },
  {
    id: "lottie-trophy-1",
    name: "Trophy Win",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets4.lottiefiles.com/packages/lf20_touohxv0.json",
    thumbnailUrl: "",
    tags: ["trophy", "win", "champion", "gold"],
  },
  {
    id: "lottie-loading-coins",
    name: "Spinning Coin",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets8.lottiefiles.com/packages/lf20_kyu7xb1v.json",
    thumbnailUrl: "",
    tags: ["coin", "spin", "loading", "gold"],
  },
  {
    id: "lottie-celebration",
    name: "Celebration",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets2.lottiefiles.com/packages/lf20_u4yrau.json",
    thumbnailUrl: "",
    tags: ["celebration", "confetti", "party", "joy"],
  },
  {
    id: "lottie-gift-box",
    name: "Gift Box",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets5.lottiefiles.com/packages/lf20_1pxqjqps.json",
    thumbnailUrl: "",
    tags: ["gift", "box", "bonus", "surprise"],
  },
  {
    id: "lottie-success",
    name: "Success Check",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets1.lottiefiles.com/packages/lf20_jbrw3hcz.json",
    thumbnailUrl: "",
    tags: ["success", "check", "win", "complete"],
  },
  {
    id: "lottie-heart-burst",
    name: "Heart Burst",
    category: "animations",
    source: "lottie",
    license: "FREE",
    type: "lottie",
    url: "https://assets7.lottiefiles.com/packages/lf20_qp1spzqv.json",
    thumbnailUrl: "",
    tags: ["heart", "love", "burst", "effect"],
  },

  // === EMOJI-BASED SYMBOLS (100% reliable, no external fetch) ===
  // High Pay Symbols
  {
    id: "sym-diamond",
    name: "💎 Diamant",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💎%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💎%3C/text%3E%3C/svg%3E",
    tags: ["diamond", "gem", "high", "precious"],
  },
  {
    id: "sym-crown",
    name: "👑 Couronne",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E👑%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E👑%3C/text%3E%3C/svg%3E",
    tags: ["crown", "gold", "high", "royal"],
  },
  {
    id: "sym-ruby",
    name: "❤️ Rubis",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E❤️%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E❤️%3C/text%3E%3C/svg%3E",
    tags: ["ruby", "red", "high", "gem"],
  },
  {
    id: "sym-emerald",
    name: "💚 Émeraude",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💚%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💚%3C/text%3E%3C/svg%3E",
    tags: ["emerald", "green", "high", "gem"],
  },
  {
    id: "sym-sapphire",
    name: "💙 Saphir",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💙%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💙%3C/text%3E%3C/svg%3E",
    tags: ["sapphire", "blue", "high", "gem"],
  },
  {
    id: "sym-gold",
    name: "🪙 Pièce d'Or",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🪙%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🪙%3C/text%3E%3C/svg%3E",
    tags: ["coin", "gold", "high", "money"],
  },

  // Low Pay Symbols (Card values)
  {
    id: "sym-ace",
    name: "🅰️ As",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🅰️%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🅰️%3C/text%3E%3C/svg%3E",
    tags: ["card", "ace", "low", "A"],
  },
  {
    id: "sym-king",
    name: "🤴 Roi",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🤴%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🤴%3C/text%3E%3C/svg%3E",
    tags: ["card", "king", "low", "K"],
  },
  {
    id: "sym-queen",
    name: "👸 Reine",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E👸%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E👸%3C/text%3E%3C/svg%3E",
    tags: ["card", "queen", "low", "Q"],
  },
  {
    id: "sym-jack",
    name: "🃏 Valet",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🃏%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🃏%3C/text%3E%3C/svg%3E",
    tags: ["card", "jack", "low", "J"],
  },
  {
    id: "sym-10",
    name: "🔟 Dix",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔟%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔟%3C/text%3E%3C/svg%3E",
    tags: ["card", "10", "low", "ten"],
  },

  // Special Symbols
  {
    id: "sym-wild",
    name: "⭐ Wild",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E⭐%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E⭐%3C/text%3E%3C/svg%3E",
    tags: ["wild", "star", "special", "gold"],
  },
  {
    id: "sym-scatter",
    name: "💫 Scatter",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💫%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💫%3C/text%3E%3C/svg%3E",
    tags: ["scatter", "sparkle", "special", "bonus"],
  },
  {
    id: "sym-bonus",
    name: "🎁 Bonus",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🎁%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🎁%3C/text%3E%3C/svg%3E",
    tags: ["bonus", "gift", "special", "reward"],
  },
  {
    id: "sym-seven",
    name: "7️⃣ Lucky 7",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E7️⃣%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E7️⃣%3C/text%3E%3C/svg%3E",
    tags: ["seven", "lucky", "high", "classic"],
  },
  {
    id: "sym-cherry",
    name: "🍒 Cerises",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🍒%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🍒%3C/text%3E%3C/svg%3E",
    tags: ["cherry", "fruit", "classic", "red"],
  },
  {
    id: "sym-bell",
    name: "🔔 Cloche",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔔%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔔%3C/text%3E%3C/svg%3E",
    tags: ["bell", "gold", "classic", "liberty"],
  },
  {
    id: "sym-dragon",
    name: "🐉 Dragon",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐉%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐉%3C/text%3E%3C/svg%3E",
    tags: ["dragon", "asia", "theme", "power"],
  },
  {
    id: "sym-unicorn",
    name: "🦄 Licorne",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🦄%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🦄%3C/text%3E%3C/svg%3E",
    tags: ["unicorn", "fantasy", "theme", "magic"],
  },
  {
    id: "sym-fire",
    name: "🔥 Feu",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔥%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔥%3C/text%3E%3C/svg%3E",
    tags: ["fire", "hot", "wild", "effect"],
  },
  {
    id: "sym-money-bag",
    name: "💰 Sac d'Or",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💰%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E💰%3C/text%3E%3C/svg%3E",
    tags: ["money", "bag", "gold", "jackpot"],
  },
  {
    id: "sym-clover",
    name: "🍀 Trèfle",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🍀%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🍀%3C/text%3E%3C/svg%3E",
    tags: ["clover", "luck", "irish", "green"],
  },
  {
    id: "sym-horseshoe",
    name: "🧲 Fer à Cheval",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧲%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧲%3C/text%3E%3C/svg%3E",
    tags: ["horseshoe", "luck", "classic", "metal"],
  },

  // === Backgrounds (SVG gradients - always work) ===
  {
    id: "bg-space",
    name: "🌌 Espace",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23000428'/%3E%3Cstop offset='100%25' style='stop-color:%23004e92'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g1)' width='200' height='150'/%3E%3Ccircle fill='white' cx='30' cy='20' r='1'/%3E%3Ccircle fill='white' cx='70' cy='40' r='1.5'/%3E%3Ccircle fill='white' cx='150' cy='30' r='1'/%3E%3Ccircle fill='white' cx='120' cy='80' r='2'/%3E%3Ccircle fill='white' cx='180' cy='100' r='1'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23000428'/%3E%3Cstop offset='100%25' style='stop-color:%23004e92'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g1)' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "space", "dark", "stars"],
  },
  {
    id: "bg-jungle",
    name: "🌴 Jungle",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231a472a'/%3E%3Cstop offset='100%25' style='stop-color:%232d5a27'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g2)' width='200' height='150'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231a472a'/%3E%3Cstop offset='100%25' style='stop-color:%232d5a27'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g2)' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "jungle", "nature", "green"],
  },
  {
    id: "bg-egypt",
    name: "🏛️ Egypte HD",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "jpg",
    url: bgEgyptHd,
    thumbnailUrl: bgEgyptHd,
    tags: ["background", "egypt", "desert", "pyramid", "hd"],
  },
  {
    id: "bg-neon",
    name: "🌃 Neon Cyberpunk HD",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "jpg",
    url: bgNeonHd,
    thumbnailUrl: bgNeonHd,
    tags: ["background", "neon", "city", "cyberpunk", "hd"],
  },
  {
    id: "bg-ocean",
    name: "🌊 Océan HD",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "jpg",
    url: bgOceanHd,
    thumbnailUrl: bgOceanHd,
    tags: ["background", "ocean", "water", "blue", "underwater", "hd"],
  },
  {
    id: "bg-fantasy-forest",
    name: "🌲 Forêt Fantasy HD",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "jpg",
    url: bgFantasyHd,
    thumbnailUrl: bgFantasyHd,
    tags: ["background", "fantasy", "forest", "magic", "hd"],
  },
  {
    id: "bg-fire",
    name: "🔥 Feu",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g6' x1='0%25' y1='100%25' x2='0%25' y2='0%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff0000'/%3E%3Cstop offset='50%25' style='stop-color:%23ff6600'/%3E%3Cstop offset='100%25' style='stop-color:%23ffcc00'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g6)' width='200' height='150'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g6' x1='0%25' y1='100%25' x2='0%25' y2='0%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff0000'/%3E%3Cstop offset='50%25' style='stop-color:%23ff6600'/%3E%3Cstop offset='100%25' style='stop-color:%23ffcc00'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g6)' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "fire", "hot", "red"],
  },
  {
    id: "bg-gold",
    name: "✨ Gold Luxury",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g7' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23462523'/%3E%3Cstop offset='25%25' style='stop-color:%23c8a860'/%3E%3Cstop offset='50%25' style='stop-color:%23f5d689'/%3E%3Cstop offset='75%25' style='stop-color:%23c8a860'/%3E%3Cstop offset='100%25' style='stop-color:%23462523'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g7)' width='200' height='150'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='g7' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23462523'/%3E%3Cstop offset='50%25' style='stop-color:%23f5d689'/%3E%3Cstop offset='100%25' style='stop-color:%23462523'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g7)' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "gold", "luxury", "premium"],
  },

  // === GENERATED HD SLOT SYMBOLS - Professional quality ===
  // Special Symbols
  {
    id: "hd-wild-gold",
    name: "Wild Gold",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: wildGold,
    thumbnailUrl: wildGold,
    tags: ["wild", "gold", "special", "premium", "hd"],
  },
  {
    id: "hd-scatter-crystal",
    name: "Scatter Crystal",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: scatterCrystal,
    thumbnailUrl: scatterCrystal,
    tags: ["scatter", "crystal", "purple", "special", "hd"],
  },
  {
    id: "hd-free-spins",
    name: "Free Spins Banner",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: freeSpinsBanner,
    thumbnailUrl: freeSpinsBanner,
    tags: ["free-spins", "banner", "bonus", "special", "hd"],
  },
  {
    id: "hd-multiplier-x2",
    name: "Multiplicateur x2",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: multiplierX2,
    thumbnailUrl: multiplierX2,
    tags: ["multiplier", "x2", "bonus", "special", "hd"],
  },

  // High Pay Gems
  {
    id: "hd-diamond-blue",
    name: "Diamant Bleu HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: diamondBlue,
    thumbnailUrl: diamondBlue,
    tags: ["diamond", "blue", "gem", "high", "hd"],
  },
  {
    id: "hd-ruby-red",
    name: "Rubis Rouge HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: rubyRed,
    thumbnailUrl: rubyRed,
    tags: ["ruby", "red", "gem", "high", "hd"],
  },
  {
    id: "hd-emerald-green",
    name: "Émeraude HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: emeraldGreen,
    thumbnailUrl: emeraldGreen,
    tags: ["emerald", "green", "gem", "high", "hd"],
  },
  {
    id: "hd-amethyst",
    name: "Améthyste HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: amethystPurple,
    thumbnailUrl: amethystPurple,
    tags: ["amethyst", "purple", "gem", "high", "hd"],
  },
  {
    id: "hd-crown",
    name: "Couronne Royale HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: crownRoyal,
    thumbnailUrl: crownRoyal,
    tags: ["crown", "royal", "gold", "high", "hd"],
  },

  // Classic Slot Symbols
  {
    id: "hd-seven",
    name: "Lucky 777 HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: luckySeven,
    thumbnailUrl: luckySeven,
    tags: ["seven", "lucky", "777", "classic", "hd"],
  },
  {
    id: "hd-bar",
    name: "BAR Classic HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: barClassic,
    thumbnailUrl: barClassic,
    tags: ["bar", "classic", "retro", "hd"],
  },
  {
    id: "hd-bell",
    name: "Cloche Dorée HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: bellGold,
    thumbnailUrl: bellGold,
    tags: ["bell", "gold", "classic", "liberty", "hd"],
  },
  {
    id: "hd-cherry",
    name: "Cerises HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: cherryClassic,
    thumbnailUrl: cherryClassic,
    tags: ["cherry", "fruit", "classic", "red", "hd"],
  },
  {
    id: "hd-gold-coins",
    name: "Machine à Sous HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: goldCoins,
    thumbnailUrl: goldCoins,
    tags: ["coins", "gold", "jackpot", "machine", "hd"],
  },
  {
    id: "hd-treasure",
    name: "Coffre au Trésor HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: treasureChest,
    thumbnailUrl: treasureChest,
    tags: ["treasure", "chest", "gold", "pirate", "hd"],
  },
  {
    id: "hd-horseshoe",
    name: "Fer à Cheval HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: horseshoeLuck,
    thumbnailUrl: horseshoeLuck,
    tags: ["horseshoe", "luck", "gold", "classic", "hd"],
  },

  // Fruit Symbols
  {
    id: "hd-watermelon",
    name: "Pastèque HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: watermelon,
    thumbnailUrl: watermelon,
    tags: ["watermelon", "fruit", "green", "red", "hd"],
  },
  {
    id: "hd-grapes",
    name: "Raisin HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: grapesPurple,
    thumbnailUrl: grapesPurple,
    tags: ["grapes", "fruit", "purple", "hd"],
  },
  {
    id: "hd-lemon",
    name: "Citron HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: lemonYellow,
    thumbnailUrl: lemonYellow,
    tags: ["lemon", "fruit", "yellow", "hd"],
  },
  {
    id: "hd-orange",
    name: "Orange HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: orangeFruit,
    thumbnailUrl: orangeFruit,
    tags: ["orange", "fruit", "citrus", "hd"],
  },
  {
    id: "hd-plum",
    name: "Prune HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: plumPurple,
    thumbnailUrl: plumPurple,
    tags: ["plum", "fruit", "purple", "hd"],
  },

  // Egyptian Theme
  {
    id: "hd-pharaoh",
    name: "Pharaon HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: pharaohMask,
    thumbnailUrl: pharaohMask,
    tags: ["pharaoh", "egypt", "gold", "mask", "hd"],
  },
  {
    id: "hd-eye-horus",
    name: "Œil d'Horus HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: eyeOfHorus,
    thumbnailUrl: eyeOfHorus,
    tags: ["horus", "eye", "egypt", "mystical", "hd"],
  },
  {
    id: "hd-anubis",
    name: "Anubis HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: anubisHead,
    thumbnailUrl: anubisHead,
    tags: ["anubis", "egypt", "god", "jackal", "hd"],
  },
  {
    id: "hd-ankh",
    name: "Ankh Doré HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: ankhGold,
    thumbnailUrl: ankhGold,
    tags: ["ankh", "egypt", "gold", "cross", "hd"],
  },

  // Mythical Theme
  {
    id: "hd-dragon",
    name: "Dragon Asiatique HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: dragonAsian,
    thumbnailUrl: dragonAsian,
    tags: ["dragon", "asian", "red", "gold", "hd"],
  },
  {
    id: "hd-phoenix",
    name: "Phoenix HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: phoenixFire,
    thumbnailUrl: phoenixFire,
    tags: ["phoenix", "fire", "bird", "mythical", "hd"],
  },
  {
    id: "hd-tiger",
    name: "Tigre Doré HD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: tigerGold,
    thumbnailUrl: tigerGold,
    tags: ["tiger", "gold", "asian", "power", "hd"],
  },

  // === ADDITIONAL THEMED EMOJI SYMBOLS ===
  // Asian Theme
  {
    id: "sym-koi",
    name: "🐟 Carpe Koï",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐟%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐟%3C/text%3E%3C/svg%3E",
    tags: ["koi", "fish", "asian", "luck"],
  },
  {
    id: "sym-lantern",
    name: "🏮 Lanterne",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🏮%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🏮%3C/text%3E%3C/svg%3E",
    tags: ["lantern", "red", "asian", "chinese"],
  },
  {
    id: "sym-bamboo",
    name: "🎋 Bambou",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🎋%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🎋%3C/text%3E%3C/svg%3E",
    tags: ["bamboo", "nature", "asian", "green"],
  },
  {
    id: "sym-fan",
    name: "🪭 Éventail",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🪭%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🪭%3C/text%3E%3C/svg%3E",
    tags: ["fan", "asian", "japanese", "elegant"],
  },

  // Ocean Theme
  {
    id: "sym-octopus",
    name: "🐙 Pieuvre",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐙%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐙%3C/text%3E%3C/svg%3E",
    tags: ["octopus", "ocean", "sea", "creature"],
  },
  {
    id: "sym-trident",
    name: "🔱 Trident",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔱%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔱%3C/text%3E%3C/svg%3E",
    tags: ["trident", "ocean", "poseidon", "power"],
  },
  {
    id: "sym-shell",
    name: "🐚 Coquillage",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐚%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐚%3C/text%3E%3C/svg%3E",
    tags: ["shell", "ocean", "beach", "pearl"],
  },
  {
    id: "sym-whale",
    name: "🐋 Baleine",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐋%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🐋%3C/text%3E%3C/svg%3E",
    tags: ["whale", "ocean", "big", "deep"],
  },

  // Fantasy Theme
  {
    id: "sym-wizard",
    name: "🧙 Mage",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧙%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧙%3C/text%3E%3C/svg%3E",
    tags: ["wizard", "magic", "fantasy", "mage"],
  },
  {
    id: "sym-fairy",
    name: "🧚 Fée",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧚%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧚%3C/text%3E%3C/svg%3E",
    tags: ["fairy", "magic", "fantasy", "wings"],
  },
  {
    id: "sym-crystal-ball",
    name: "🔮 Boule de Cristal",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔮%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔮%3C/text%3E%3C/svg%3E",
    tags: ["crystal", "magic", "fortune", "mystical"],
  },
  {
    id: "sym-sword",
    name: "⚔️ Épées",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E⚔️%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E⚔️%3C/text%3E%3C/svg%3E",
    tags: ["sword", "weapon", "knight", "fantasy"],
  },
  {
    id: "sym-shield",
    name: "🛡️ Bouclier",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🛡️%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🛡️%3C/text%3E%3C/svg%3E",
    tags: ["shield", "defense", "knight", "fantasy"],
  },
  {
    id: "sym-potion",
    name: "🧪 Potion",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧪%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧪%3C/text%3E%3C/svg%3E",
    tags: ["potion", "magic", "alchemy", "fantasy"],
  },

  // Western Theme
  {
    id: "sym-cowboy",
    name: "🤠 Cowboy",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🤠%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🤠%3C/text%3E%3C/svg%3E",
    tags: ["cowboy", "western", "hat", "wild-west"],
  },
  {
    id: "sym-cactus",
    name: "🌵 Cactus",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🌵%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🌵%3C/text%3E%3C/svg%3E",
    tags: ["cactus", "western", "desert", "nature"],
  },
  {
    id: "sym-dynamite",
    name: "🧨 Dynamite",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧨%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🧨%3C/text%3E%3C/svg%3E",
    tags: ["dynamite", "western", "explosive", "tnt"],
  },

  // Space Theme
  {
    id: "sym-rocket",
    name: "🚀 Fusée",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🚀%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🚀%3C/text%3E%3C/svg%3E",
    tags: ["rocket", "space", "scifi", "launch"],
  },
  {
    id: "sym-alien",
    name: "👽 Alien",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E👽%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E👽%3C/text%3E%3C/svg%3E",
    tags: ["alien", "space", "scifi", "ufo"],
  },
  {
    id: "sym-planet",
    name: "🪐 Planète",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🪐%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🪐%3C/text%3E%3C/svg%3E",
    tags: ["planet", "space", "saturn", "rings"],
  },
  {
    id: "sym-meteor",
    name: "☄️ Météore",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E☄️%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E☄️%3C/text%3E%3C/svg%3E",
    tags: ["meteor", "space", "fire", "comet"],
  },

  // Additional Backgrounds
  {
    id: "bg-casino-red",
    name: "🎰 Casino Rouge",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3CradialGradient id='gc1' cx='50%25' cy='50%25' r='70%25'%3E%3Cstop offset='0%25' style='stop-color:%23660000'/%3E%3Cstop offset='100%25' style='stop-color:%23220000'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23gc1)' width='200' height='150'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect fill='%23440000' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "casino", "red", "dark"],
  },
  {
    id: "bg-arctic",
    name: "❄️ Arctique",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='ga' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e0f7ff'/%3E%3Cstop offset='100%25' style='stop-color:%23a0d4e8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23ga)' width='200' height='150'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect fill='%23c0e8f8' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "arctic", "ice", "winter"],
  },
  {
    id: "bg-asian",
    name: "🏮 Asie",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3ClinearGradient id='gas' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238B0000'/%3E%3Cstop offset='100%25' style='stop-color:%23FFD700'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23gas)' width='200' height='150'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect fill='%238B0000' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "asian", "red", "gold"],
  },
  {
    id: "bg-purple-magic",
    name: "🔮 Magie Violette",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3CradialGradient id='gm' cx='50%25' cy='50%25' r='70%25'%3E%3Cstop offset='0%25' style='stop-color:%236B21A8'/%3E%3Cstop offset='100%25' style='stop-color:%231a0533'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23gm)' width='200' height='150'/%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect fill='%234a1580' width='200' height='150'/%3E%3C/svg%3E",
    tags: ["background", "purple", "magic", "fantasy"],
  },

  // Additional Effects
  {
    id: "fx-fire-circle",
    name: "🔥 Cercle de Feu",
    category: "effects",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23FF4500' stroke-width='4' opacity='0.8'/%3E%3Ccircle cx='50' cy='50' r='35' fill='none' stroke='%23FFD700' stroke-width='2' opacity='0.6'/%3E%3Ctext y='60' x='25' font-size='30'%3E🔥%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🔥%3C/text%3E%3C/svg%3E",
    tags: ["effect", "fire", "circle", "hot"],
  },
  {
    id: "fx-ice-crystal",
    name: "❄️ Cristal de Glace",
    category: "effects",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E❄️%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E❄️%3C/text%3E%3C/svg%3E",
    tags: ["effect", "ice", "frost", "cold"],
  },
  {
    id: "fx-magic-dust",
    name: "🌟 Poussière Magique",
    category: "effects",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🌟%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🌟%3C/text%3E%3C/svg%3E",
    tags: ["effect", "magic", "dust", "sparkle"],
  },
  {
    id: "fx-coin-rain",
    name: "🪙 Pluie de Pièces",
    category: "effects",
    source: "custom",
    license: "FREE",
    type: "png",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='35' x='10' font-size='25'%3E🪙%3C/text%3E%3Ctext y='55' x='50' font-size='25'%3E🪙%3C/text%3E%3Ctext y='75' x='30' font-size='25'%3E🪙%3C/text%3E%3Ctext y='95' x='60' font-size='25'%3E🪙%3C/text%3E%3C/svg%3E",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='80'%3E🪙%3C/text%3E%3C/svg%3E",
    tags: ["effect", "coin", "rain", "money"],
  },

  // === BETSTUDIO VECTOR PACK (export-friendly: SVG data URLs) ===
  // Symbols (vector, no external fetch, crisp scaling)
  {
    id: "bs-sym-gem-teal",
    name: "BetStudio Gem Teal",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
          "<stop offset='0' stop-color='#22d3ee'/><stop offset='1' stop-color='#0ea5e9'/>" +
          "</linearGradient></defs>" +
          "<rect width='128' height='128' rx='28' fill='#0b1220'/>" +
          "<path d='M20 44 44 20h40l24 24-32 64H52Z' fill='url(#g)' opacity='0.95'/>" +
          "<path d='M20 44h88L76 108H52Z' fill='#67e8f9' opacity='0.18'/>" +
          "<path d='M44 20l20 24 20-24' fill='#a5f3fc' opacity='0.25'/>" +
          "<path d='M64 44v64' stroke='#e0f2fe' stroke-width='3' opacity='0.22'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='28' fill='#0b1220'/><path d='M20 44 44 20h40l24 24-32 64H52Z' fill='#22d3ee'/></svg>"
      ),
    tags: ["betstudio", "gem", "teal", "vector", "export-safe"],
  },
  {
    id: "bs-sym-gem-violet",
    name: "BetStudio Gem Violet",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='1' x2='1' y2='0'>" +
          "<stop offset='0' stop-color='#a78bfa'/><stop offset='1' stop-color='#f472b6'/>" +
          "</linearGradient></defs>" +
          "<rect width='128' height='128' rx='28' fill='#120b1f'/>" +
          "<path d='M18 50 44 18h40l26 32-28 60H46Z' fill='url(#g)'/>" +
          "<path d='M18 50h92l-28 60H46Z' fill='#fff' opacity='0.08'/>" +
          "<circle cx='92' cy='40' r='10' fill='#fff' opacity='0.12'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='28' fill='#120b1f'/><path d='M18 50 44 18h40l26 32-28 60H46Z' fill='#a78bfa'/></svg>"
      ),
    tags: ["betstudio", "gem", "violet", "vector", "export-safe"],
  },
  {
    id: "bs-sym-coin-gold",
    name: "BetStudio Coin Gold",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><radialGradient id='r' cx='35%' cy='30%' r='80%'>" +
          "<stop offset='0' stop-color='#fff3c4'/><stop offset='0.45' stop-color='#fbbf24'/>" +
          "<stop offset='1' stop-color='#92400e'/>" +
          "</radialGradient></defs>" +
          "<rect width='128' height='128' rx='28' fill='#0f172a'/>" +
          "<circle cx='64' cy='64' r='44' fill='url(#r)'/>" +
          "<circle cx='64' cy='64' r='36' fill='none' stroke='#fde68a' stroke-width='6' opacity='0.9'/>" +
          "<path d='M48 74c6 8 26 8 32 0M50 56c6-10 22-10 28 0' stroke='#78350f' stroke-width='6' fill='none' stroke-linecap='round' opacity='0.55'/>" +
          "<path d='M64 38v52' stroke='#78350f' stroke-width='6' opacity='0.35'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='28' fill='#0f172a'/><circle cx='64' cy='64' r='44' fill='#fbbf24'/></svg>"
      ),
    tags: ["betstudio", "coin", "gold", "vector", "export-safe"],
  },
  {
    id: "bs-sym-wild-star",
    name: "BetStudio WILD",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
          "<stop offset='0' stop-color='#fde68a'/><stop offset='1' stop-color='#f59e0b'/>" +
          "</linearGradient></defs>" +
          "<rect width='128' height='128' rx='28' fill='#0b1220'/>" +
          "<path d='M64 20 76 50l32 2-25 20 8 31-27-16-27 16 8-31-25-20 32-2Z' fill='url(#g)'/>" +
          "<text x='64' y='118' font-size='22' font-weight='900' text-anchor='middle' fill='#fef3c7' style='letter-spacing:2px'>WILD</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='28' fill='#0b1220'/><path d='M64 20 76 50l32 2-25 20 8 31-27-16-27 16 8-31-25-20 32-2Z' fill='#f59e0b'/></svg>"
      ),
    tags: ["betstudio", "wild", "star", "vector", "export-safe"],
  },
  {
    id: "bs-sym-scatter-orb",
    name: "BetStudio SCATTER",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><radialGradient id='r' cx='35%' cy='30%' r='80%'>" +
          "<stop offset='0' stop-color='#cffafe'/><stop offset='0.55' stop-color='#38bdf8'/><stop offset='1' stop-color='#1d4ed8'/>" +
          "</radialGradient></defs>" +
          "<rect width='128' height='128' rx='28' fill='#081018'/>" +
          "<circle cx='64' cy='62' r='42' fill='url(#r)'/>" +
          "<circle cx='48' cy='48' r='10' fill='#fff' opacity='0.25'/>" +
          "<path d='M30 104c14-10 54-10 68 0' stroke='#93c5fd' stroke-width='6' opacity='0.35' fill='none'/>" +
          "<text x='64' y='120' font-size='18' font-weight='900' text-anchor='middle' fill='#e0f2fe' style='letter-spacing:1px'>SCATTER</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='28' fill='#081018'/><circle cx='64' cy='62' r='42' fill='#38bdf8'/></svg>"
      ),
    tags: ["betstudio", "scatter", "orb", "vector", "export-safe"],
  },

  // Backgrounds (vector gradients; export-safe)
  {
    id: "bs-bg-neon-grid",
    name: "BetStudio Neon Grid",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>" +
          "<defs>" +
            "<linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>" +
              "<stop offset='0' stop-color='#09071a'/>" +
              "<stop offset='1' stop-color='#0b2b3a'/>" +
            "</linearGradient>" +
            "<linearGradient id='glow' x1='0' y1='1' x2='1' y2='0'>" +
              "<stop offset='0' stop-color='#a78bfa' stop-opacity='0.9'/>" +
              "<stop offset='1' stop-color='#22d3ee' stop-opacity='0.9'/>" +
            "</linearGradient>" +
          "</defs>" +
          "<rect width='800' height='450' fill='url(#bg)'/>" +
          "<g opacity='0.35'>" +
            "<path d='M0 360H800' stroke='url(#glow)' stroke-width='3'/>" +
            "<path d='M0 300H800' stroke='url(#glow)' stroke-width='2'/>" +
            "<path d='M0 240H800' stroke='url(#glow)' stroke-width='1.5'/>" +
            "<path d='M0 180H800' stroke='url(#glow)' stroke-width='1.2'/>" +
            "<path d='M0 120H800' stroke='url(#glow)' stroke-width='1'/>" +
            "<path d='M120 0V450' stroke='url(#glow)' stroke-width='1'/>" +
            "<path d='M240 0V450' stroke='url(#glow)' stroke-width='1'/>" +
            "<path d='M360 0V450' stroke='url(#glow)' stroke-width='1'/>" +
            "<path d='M480 0V450' stroke='url(#glow)' stroke-width='1'/>" +
            "<path d='M600 0V450' stroke='url(#glow)' stroke-width='1'/>" +
            "<path d='M720 0V450' stroke='url(#glow)' stroke-width='1'/>" +
          "</g>" +
          "<circle cx='640' cy='120' r='140' fill='#22d3ee' opacity='0.08'/>" +
          "<circle cx='160' cy='80' r='120' fill='#a78bfa' opacity='0.08'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'><rect width='200' height='150' fill='#09071a'/><path d='M0 110H200' stroke='#22d3ee' opacity='0.6'/><path d='M60 0V150' stroke='#a78bfa' opacity='0.45'/></svg>"
      ),
    tags: ["betstudio", "background", "neon", "grid", "export-safe"],
  },
  {
    id: "bs-bg-gold-velvet",
    name: "BetStudio Gold Velvet",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>" +
          "<defs>" +
            "<radialGradient id='r' cx='35%' cy='30%' r='85%'>" +
              "<stop offset='0' stop-color='#fef3c7' stop-opacity='0.65'/>" +
              "<stop offset='0.25' stop-color='#f59e0b' stop-opacity='0.25'/>" +
              "<stop offset='1' stop-color='#1a0f07'/>" +
            "</radialGradient>" +
          "</defs>" +
          "<rect width='800' height='450' fill='#120a05'/>" +
          "<rect width='800' height='450' fill='url(#r)'/>" +
          "<path d='M0 360C160 300 320 410 480 360S640 260 800 330V450H0Z' fill='#fbbf24' opacity='0.12'/>" +
          "<path d='M0 400C200 320 400 460 600 380S720 320 800 360V450H0Z' fill='#fde68a' opacity='0.08'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'><rect width='200' height='150' fill='#120a05'/><circle cx='70' cy='50' r='80' fill='#f59e0b' opacity='0.25'/></svg>"
      ),
    tags: ["betstudio", "background", "gold", "luxury", "export-safe"],
  },

  // === BETSTUDIO EXTRA PACK (more export-safe SVG assets) ===
  // Card-value styled symbols (A K Q J 10 9) - vector, crisp
  {
    id: "bs-sym-card-a",
    name: "BetStudio Card A",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#38bdf8'/><stop offset='1' stop-color='#22c55e'/></linearGradient></defs>" +
          "<rect width='128' height='128' rx='24' fill='#0b1220'/>" +
          "<rect x='14' y='14' width='100' height='100' rx='18' fill='url(#g)' opacity='0.16'/>" +
          "<path d='M34 92 52 36h24l18 56h-18l-3-12H55l-3 12Z' fill='#e2e8f0'/>" +
          "<path d='M59 66h10l-5-18Z' fill='#94a3b8'/>" +
          "<text x='18' y='28' font-size='16' font-weight='900' fill='#93c5fd'>A</text>" +
          "<text x='110' y='118' font-size='16' font-weight='900' fill='#86efac' text-anchor='end'>A</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#0b1220'/><text x='64' y='82' font-size='64' font-weight='900' fill='#e2e8f0' text-anchor='middle'>A</text></svg>"
      ),
    tags: ["betstudio", "card", "A", "vector", "export-safe"],
  },
  {
    id: "bs-sym-card-k",
    name: "BetStudio Card K",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='1' x2='1' y2='0'><stop offset='0' stop-color='#f472b6'/><stop offset='1' stop-color='#a78bfa'/></linearGradient></defs>" +
          "<rect width='128' height='128' rx='24' fill='#120b1f'/>" +
          "<rect x='14' y='14' width='100' height='100' rx='18' fill='url(#g)' opacity='0.16'/>" +
          "<path d='M40 34h18v26l22-26h22L80 66l26 28H82L58 68v26H40Z' fill='#f1f5f9'/>" +
          "<text x='18' y='28' font-size='16' font-weight='900' fill='#fda4af'>K</text>" +
          "<text x='110' y='118' font-size='16' font-weight='900' fill='#c4b5fd' text-anchor='end'>K</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#120b1f'/><text x='64' y='82' font-size='64' font-weight='900' fill='#f1f5f9' text-anchor='middle'>K</text></svg>"
      ),
    tags: ["betstudio", "card", "K", "vector", "export-safe"],
  },
  {
    id: "bs-sym-card-q",
    name: "BetStudio Card Q",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fbbf24'/><stop offset='1' stop-color='#fb7185'/></linearGradient></defs>" +
          "<rect width='128' height='128' rx='24' fill='#0f172a'/>" +
          "<rect x='14' y='14' width='100' height='100' rx='18' fill='url(#g)' opacity='0.16'/>" +
          "<path d='M64 34c-15 0-26 12-26 30s11 30 26 30c3 0 6-1 9-2l11 10 10-10-10-10c4-5 6-11 6-18 0-18-11-30-26-30Zm0 16c7 0 12 6 12 14s-5 14-12 14-12-6-12-14 5-14 12-14Z' fill='#f8fafc'/>" +
          "<text x='18' y='28' font-size='16' font-weight='900' fill='#fde68a'>Q</text>" +
          "<text x='110' y='118' font-size='16' font-weight='900' fill='#fda4af' text-anchor='end'>Q</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#0f172a'/><text x='64' y='82' font-size='64' font-weight='900' fill='#f8fafc' text-anchor='middle'>Q</text></svg>"
      ),
    tags: ["betstudio", "card", "Q", "vector", "export-safe"],
  },
  {
    id: "bs-sym-card-j",
    name: "BetStudio Card J",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='1' x2='1' y2='0'><stop offset='0' stop-color='#22c55e'/><stop offset='1' stop-color='#38bdf8'/></linearGradient></defs>" +
          "<rect width='128' height='128' rx='24' fill='#081018'/>" +
          "<rect x='14' y='14' width='100' height='100' rx='18' fill='url(#g)' opacity='0.16'/>" +
          "<path d='M78 34h18v44c0 18-12 28-30 28-14 0-24-7-28-18l16-8c2 6 6 10 12 10 8 0 12-5 12-12Z' fill='#e2e8f0'/>" +
          "<text x='18' y='28' font-size='16' font-weight='900' fill='#86efac'>J</text>" +
          "<text x='110' y='118' font-size='16' font-weight='900' fill='#93c5fd' text-anchor='end'>J</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#081018'/><text x='64' y='82' font-size='64' font-weight='900' fill='#e2e8f0' text-anchor='middle'>J</text></svg>"
      ),
    tags: ["betstudio", "card", "J", "vector", "export-safe"],
  },
  {
    id: "bs-sym-card-10",
    name: "BetStudio Card 10",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#60a5fa'/><stop offset='1' stop-color='#34d399'/></linearGradient></defs>" +
          "<rect width='128' height='128' rx='24' fill='#0b1220'/>" +
          "<rect x='14' y='14' width='100' height='100' rx='18' fill='url(#g)' opacity='0.14'/>" +
          "<text x='64' y='86' font-size='58' font-weight='900' fill='#f1f5f9' text-anchor='middle'>10</text>" +
          "<text x='18' y='28' font-size='16' font-weight='900' fill='#93c5fd'>10</text>" +
          "<text x='110' y='118' font-size='16' font-weight='900' fill='#86efac' text-anchor='end'>10</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#0b1220'/><text x='64' y='84' font-size='58' font-weight='900' fill='#f1f5f9' text-anchor='middle'>10</text></svg>"
      ),
    tags: ["betstudio", "card", "10", "vector", "export-safe"],
  },
  {
    id: "bs-sym-card-9",
    name: "BetStudio Card 9",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<defs><linearGradient id='g' x1='0' y1='1' x2='1' y2='0'><stop offset='0' stop-color='#fb7185'/><stop offset='1' stop-color='#fbbf24'/></linearGradient></defs>" +
          "<rect width='128' height='128' rx='24' fill='#0f172a'/>" +
          "<rect x='14' y='14' width='100' height='100' rx='18' fill='url(#g)' opacity='0.14'/>" +
          "<text x='64' y='86' font-size='64' font-weight='900' fill='#f8fafc' text-anchor='middle'>9</text>" +
          "<text x='18' y='28' font-size='16' font-weight='900' fill='#fda4af'>9</text>" +
          "<text x='110' y='118' font-size='16' font-weight='900' fill='#fde68a' text-anchor='end'>9</text>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#0f172a'/><text x='64' y='86' font-size='64' font-weight='900' fill='#f8fafc' text-anchor='middle'>9</text></svg>"
      ),
    tags: ["betstudio", "card", "9", "vector", "export-safe"],
  },

  // Extra themed symbols (vector icons)
  {
    id: "bs-sym-sword",
    name: "BetStudio Sword",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<rect width='128' height='128' rx='24' fill='#0b1220'/>" +
          "<path d='M86 22 44 64l-6-6L80 16Z' fill='#e2e8f0'/>" +
          "<path d='M44 64 30 78l20 20 14-14Z' fill='#94a3b8'/>" +
          "<path d='M28 80l-8 8 20 20 8-8Z' fill='#f59e0b'/>" +
          "<path d='M98 34 56 76l-6-6 42-42Z' fill='#cbd5e1' opacity='0.9'/>" +
          "<circle cx='28' cy='100' r='6' fill='#fde68a' opacity='0.65'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#0b1220'/><path d='M92 28 44 76l-8-8 48-48Z' fill='#e2e8f0'/></svg>"
      ),
    tags: ["betstudio", "sword", "fantasy", "vector", "export-safe"],
  },
  {
    id: "bs-sym-shield",
    name: "BetStudio Shield",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<rect width='128' height='128' rx='24' fill='#081018'/>" +
          "<path d='M64 18 96 32v34c0 22-12 38-32 44C44 104 32 88 32 66V32Z' fill='#38bdf8' opacity='0.2'/>" +
          "<path d='M64 22 90 34v30c0 18-10 32-26 38-16-6-26-20-26-38V34Z' fill='#e2e8f0' opacity='0.9'/>" +
          "<path d='M64 34v62' stroke='#0ea5e9' stroke-width='6' opacity='0.35'/>" +
          "<path d='M44 58h40' stroke='#0ea5e9' stroke-width='6' opacity='0.35'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#081018'/><path d='M64 22 90 34v30c0 18-10 32-26 38-16-6-26-20-26-38V34Z' fill='#e2e8f0'/></svg>"
      ),
    tags: ["betstudio", "shield", "fantasy", "vector", "export-safe"],
  },
  {
    id: "bs-sym-rocket",
    name: "BetStudio Rocket",
    category: "symbols",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>" +
          "<rect width='128' height='128' rx='24' fill='#0b1220'/>" +
          "<path d='M78 18c16 10 26 28 26 46l-30 30c-18 0-36-10-46-26l18-18 10 10 18-18-10-10Z' fill='#e2e8f0'/>" +
          "<circle cx='78' cy='50' r='8' fill='#38bdf8'/>" +
          "<path d='M34 94c-4 10-2 18-2 18s8 2 18-2l-16-16Z' fill='#f59e0b'/>" +
          "<path d='M42 86l8 8' stroke='#fb7185' stroke-width='6' stroke-linecap='round'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='24' fill='#0b1220'/><path d='M78 18c16 10 26 28 26 46l-30 30c-18 0-36-10-46-26l18-18 10 10 18-18-10-10Z' fill='#e2e8f0'/></svg>"
      ),
    tags: ["betstudio", "rocket", "space", "vector", "export-safe"],
  },

  // Extra backgrounds (vector gradients)
  {
    id: "bs-bg-ocean-glow",
    name: "BetStudio Ocean Glow",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>" +
          "<defs>" +
            "<linearGradient id='b' x1='0' y1='0' x2='0' y2='1'>" +
              "<stop offset='0' stop-color='#021b2d'/>" +
              "<stop offset='1' stop-color='#052f3f'/>" +
            "</linearGradient>" +
            "<radialGradient id='g' cx='50%' cy='30%' r='70%'>" +
              "<stop offset='0' stop-color='#22d3ee' stop-opacity='0.35'/>" +
              "<stop offset='1' stop-color='#22d3ee' stop-opacity='0'/>" +
            "</radialGradient>" +
          "</defs>" +
          "<rect width='800' height='450' fill='url(#b)'/>" +
          "<rect width='800' height='450' fill='url(#g)'/>" +
          "<path d='M0 330c120-30 240 10 360-10s240-70 440-20v150H0Z' fill='#0ea5e9' opacity='0.12'/>" +
          "<path d='M0 360c140-40 280 10 420-12s220-50 380-16v118H0Z' fill='#67e8f9' opacity='0.08'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'><rect width='200' height='150' fill='#021b2d'/><circle cx='110' cy='40' r='55' fill='#22d3ee' opacity='0.18'/></svg>"
      ),
    tags: ["betstudio", "background", "ocean", "blue", "export-safe"],
  },
  {
    id: "bs-bg-forest-mist",
    name: "BetStudio Forest Mist",
    category: "backgrounds",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>" +
          "<defs>" +
            "<linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'>" +
              "<stop offset='0' stop-color='#061a12'/>" +
              "<stop offset='1' stop-color='#0b2a1d'/>" +
            "</linearGradient>" +
          "</defs>" +
          "<rect width='800' height='450' fill='url(#bg)'/>" +
          "<path d='M0 340c120-90 260-70 380-140s220-110 420-70v320H0Z' fill='#22c55e' opacity='0.08'/>" +
          "<path d='M0 380c170-70 330-60 480-110s210-90 320-60v240H0Z' fill='#86efac' opacity='0.06'/>" +
          "<rect width='800' height='450' fill='#fff' opacity='0.03'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'><rect width='200' height='150' fill='#061a12'/><path d='M0 110c60-40 110-30 200-60v100H0Z' fill='#22c55e' opacity='0.12'/></svg>"
      ),
    tags: ["betstudio", "background", "forest", "green", "export-safe"],
  },

  // Extra effects (can be used as overlays/UI accents in builder)
  {
    id: "bs-fx-glow-ring",
    name: "BetStudio Glow Ring",
    category: "effects",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'>" +
          "<defs><radialGradient id='r' cx='50%' cy='50%' r='50%'>" +
            "<stop offset='0' stop-color='#ffd700' stop-opacity='0.0'/>" +
            "<stop offset='0.6' stop-color='#ffd700' stop-opacity='0.25'/>" +
            "<stop offset='1' stop-color='#ffd700' stop-opacity='0.0'/>" +
          "</radialGradient></defs>" +
          "<rect width='256' height='256' fill='none'/>" +
          "<circle cx='128' cy='128' r='96' fill='none' stroke='#ffd700' stroke-width='10' opacity='0.7'/>" +
          "<circle cx='128' cy='128' r='120' fill='url(#r)'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='34' fill='none' stroke='#ffd700' stroke-width='6' opacity='0.8'/></svg>"
      ),
    tags: ["betstudio", "effect", "glow", "ring", "export-safe"],
  },
  {
    id: "bs-fx-burst",
    name: "BetStudio Burst",
    category: "effects",
    source: "custom",
    license: "FREE",
    type: "svg",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'>" +
          "<rect width='256' height='256' fill='none'/>" +
          "<g fill='none' stroke='#22d3ee' stroke-width='10' stroke-linecap='round' opacity='0.75'>" +
            "<path d='M128 18v40'/><path d='M128 198v40'/>" +
            "<path d='M18 128h40'/><path d='M198 128h40'/>" +
            "<path d='M46 46l28 28'/><path d='M182 182l28 28'/>" +
            "<path d='M210 46l-28 28'/><path d='M74 182l-28 28'/>" +
          "</g>" +
          "<circle cx='128' cy='128' r='44' fill='#22d3ee' opacity='0.12'/>" +
          "<circle cx='128' cy='128' r='22' fill='#a78bfa' opacity='0.18'/>" +
        "</svg>"
      ),
    thumbnailUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 10v18M50 72v18M10 50h18M72 50h18' stroke='#22d3ee' stroke-width='6' stroke-linecap='round'/></svg>"
      ),
    tags: ["betstudio", "effect", "burst", "sparkle", "export-safe"],
  },
];

export const ASSET_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "Tous", icon: "📦" },
  { id: "animations", label: "Animations", icon: "🎬" },
  { id: "symbols", label: "Symboles Slot", icon: "🎴" },
  { id: "backgrounds", label: "Backgrounds", icon: "🌄" },
  { id: "effects", label: "Effets & UI", icon: "✨" },
];

export const WIN_ANIMATION_OPTIONS: Record<string, { label: string; options: { id: string; label: string; icon: string }[] }> = {
  win: {
    label: "🏆 WIN (< 5x)",
    options: [
      { id: "coins_fall", label: "Pièces qui tombent", icon: "🪙" },
      { id: "golden_flash", label: "Flash doré", icon: "⚡" },
      { id: "stars_burst", label: "Étoiles qui éclatent", icon: "⭐" },
      { id: "win_text", label: "Texte 'WIN!' animé", icon: "🏆" },
    ],
  },
  bigwin: {
    label: "💰 BIG WIN (5x - 20x)",
    options: [
      { id: "coin_explosion", label: "Explosion de pièces", icon: "💥" },
      { id: "confetti_color", label: "Confettis colorés", icon: "🎊" },
      { id: "light_rays", label: "Rayons de lumière", icon: "🌟" },
      { id: "counter_frenzy", label: "Compteur qui s'emballe", icon: "🔢" },
    ],
  },
  megawin: {
    label: "🎉 MEGA WIN (> 20x)",
    options: [
      { id: "fireworks", label: "Feux d'artifice", icon: "🎆" },
      { id: "gem_rain", label: "Pluie de gemmes", icon: "💎" },
      { id: "epic_flash", label: "Animation épique + flash", icon: "🌈" },
    ],
  },
  freespins: {
    label: "🎰 FREE SPINS TRIGGER",
    options: [
      { id: "banner_animated", label: "Bannière 'FREE SPINS!'", icon: "🏷️" },
      { id: "scatter_pulse", label: "Scatter qui pulsent", icon: "💫" },
      { id: "scene_transition", label: "Transition de scène", icon: "🎬" },
    ],
  },
};
