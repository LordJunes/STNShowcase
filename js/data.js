const ANSI_OPTIONS = [
  { code: "30", name: "Dark Gray (30)", hex: "#72767d" },
  { code: "31", name: "Red (31)",       hex: "#ed4245" },
  { code: "32", name: "Green (32)",     hex: "#57f287" },
  { code: "33", name: "Yellow (33)",    hex: "#fee75c" },
  { code: "34", name: "Blue (34)",      hex: "#5865f2" },
  { code: "35", name: "Magenta (35)",   hex: "#eb459e" },
  { code: "36", name: "Cyan (36)",      hex: "#00ffff" },
  { code: "37", name: "White (37)",     hex: "#ffffff" }
];

const DEFAULT_COLORS = {
  BANNER: "36",
  IGN: "32",
  CLAN: "33",
  DAMAGE: "31",
  SUPPORT: "32",
  FARM: "33",
  PET: "34",
  exclusive: "33",
  divine: "37",
  legendary: "33",
  mythic: "31",
  epic: "35",
  rare: "34",
  common: "32"
};

const RARITY_TIERS = [
  { key: "exclusive", label: "EXCLUSIVE (ORANGE)",  color: "#f97316", border: "#f97316", bg: "rgba(249,115,22,0.08)" },
  { key: "divine",    label: "DIVINE (WHITE)",      color: "#ffffff", border: "#f8fafc", bg: "rgba(255,255,255,0.08)" },
  { key: "legendary", label: "LEGENDARY (YELLOW)",  color: "#facc15", border: "#facc15", bg: "rgba(250,204,21,0.08)" },
  { key: "mythic",    label: "MYTHIC (RED)",        color: "#ef4444", border: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  { key: "epic",      label: "EPIC (PURPLE)",       color: "#a855f7", border: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  { key: "rare",      label: "RARE (BLUE)",         color: "#38bdf8", border: "#38bdf8", bg: "rgba(56,189,248,0.08)" },
  { key: "common",    label: "COMMON (GREEN)",      color: "#22c55e", border: "#22c55e", bg: "rgba(34,197,94,0.08)" }
];

const ITEMS = [
  { name: "Scarecrow",      role: "DAMAGE", max: 8, rarity: "exclusive", hex: "#f97316", img: "images/Scarecrow.png" },
  { name: "Juggernaut",     role: "DAMAGE", max: 9, rarity: "divine",    hex: "#ffffff", img: "images/Juggernaut.png" },
  { name: "Machine Mortar", role: "DAMAGE", max: 9, rarity: "divine",    hex: "#ffffff", img: "images/MortarMachine.png" },
  { name: "World Ender",    role: "DAMAGE", max: 8, rarity: "legendary", hex: "#f59e0b", img: "images/WorldEnder.png" },
  { name: "Samurai",        role: "DAMAGE", max: 8, rarity: "legendary", hex: "#f59e0b", img: "images/Samurai.png" },
  { name: "Railgun",        role: "DAMAGE", max: 8, rarity: "legendary", hex: "#f59e0b", img: "images/Railgun.png" },
  { name: "Lava Launcher",  role: "DAMAGE", max: 8, rarity: "legendary", hex: "#f59e0b", img: "images/LavaLauncher.png" },
  { name: "Ice Turret",     role: "DAMAGE", max: 8, rarity: "legendary", hex: "#f59e0b", img: "images/IceTurret.png" },
  { name: "Rocketeer",      role: "DAMAGE", max: 8, rarity: "epic",      hex: "#a855f7", img: "images/Rocketeer.png" },
  { name: "Tesla",          role: "DAMAGE", max: 8, rarity: "epic",      hex: "#a855f7", img: "images/Tesla.png" },
  { name: "Toxic Turret",   role: "DAMAGE", max: 8, rarity: "mythic",    hex: "#ef4444", img: "images/ToxicTurret.png" },
  { name: "Fire Spitter",   role: "DAMAGE", max: 8, rarity: "mythic",    hex: "#ef4444", img: "images/FireSpitter.png" },
  { name: "Ballista",       role: "DAMAGE", max: 8, rarity: "mythic",    hex: "#ef4444", img: "images/Ballista.png" },
  { name: "Mortar",         role: "DAMAGE", max: 8, rarity: "rare",      hex: "#38bdf8", img: "images/Mortar.png" },
  { name: "Flamethrower",   role: "DAMAGE", max: 8, rarity: "rare",      hex: "#38bdf8", img: "images/Flamethrower.png" },
  { name: "Cannon",         role: "DAMAGE", max: 10, rarity: "rare",     hex: "#38bdf8", img: "images/Cannon.png" },

  { name: "Medical Base",   role: "SUPPORT", max: 6, rarity: "epic",     hex: "#a855f7", img: "images/MedicalBase.png" },
  { name: "Military Base",  role: "SUPPORT", max: 6, rarity: "mythic",   hex: "#ef4444", img: "images/MilitaryBase.png" },
  { name: "Protector Base", role: "SUPPORT", max: 6, rarity: "epic",     hex: "#a855f7", img: "images/ProtectorBase.png" },

  { name: "The Bank",       role: "FARM", max: 9, rarity: "divine",    hex: "#ffffff", img: "images/TheBank.png" },
  { name: "Void Farm",      role: "FARM", max: 8, rarity: "legendary", hex: "#f59e0b", img: "images/VoidFarm.png" },
  { name: "Vault",          role: "FARM", max: 8, rarity: "epic",      hex: "#a855f7", img: "images/Vault.png" },
  { name: "Mining Cave",    role: "FARM", max: 8, rarity: "rare",      hex: "#38bdf8", img: "images/MiningCave.png" },

  { name: "Ghostie",    role: "PET", max: 5, rarity: "exclusive", hex: "#f97316", img: "images/Ghostie.png" },
  { name: "Jinx",       role: "PET", max: 5, rarity: "divine",    hex: "#ffffff", img: "images/Jinx.png" },
  { name: "Unicorn",    role: "PET", max: 5, rarity: "divine",    hex: "#ffffff", img: "images/Unicorn.png" },
  { name: "Lion",       role: "PET", max: 5, rarity: "divine",    hex: "#ffffff", img: "images/Lion.png" },
  { name: "Dragon",     role: "PET", max: 5, rarity: "legendary", hex: "#f59e0b", img: "images/Dragon.png" },
  { name: "Turtle",     role: "PET", max: 5, rarity: "legendary", hex: "#f59e0b", img: "images/Turtle.png" },
  { name: "Elephant",   role: "PET", max: 5, rarity: "legendary", hex: "#f59e0b", img: "images/Elephant.png" },
  { name: "Polar Bear", role: "PET", max: 5, rarity: "legendary", hex: "#f59e0b", img: "images/PolarBear.png" },
  { name: "Dino",       role: "PET", max: 5, rarity: "legendary", hex: "#f59e0b", img: "images/Dino.png" },
  { name: "Tiger",      role: "PET", max: 5, rarity: "legendary", hex: "#f59e0b", img: "images/Tiger.png" },
  { name: "Rhino",      role: "PET", max: 5, rarity: "mythic",    hex: "#ef4444", img: "images/Rhino.png" },
  { name: "Monkey",     role: "PET", max: 5, rarity: "mythic",    hex: "#ef4444", img: "images/Monkey.png" },
  { name: "Bunny",      role: "PET", max: 5, rarity: "mythic",    hex: "#ef4444", img: "images/Bunny.png" },
  { name: "Arctic Fox", role: "PET", max: 5, rarity: "mythic",    hex: "#ef4444", img: "images/ArcticFox.png" },
  { name: "Deer",       role: "PET", max: 5, rarity: "epic",      hex: "#a855f7", img: "images/Deer.png" },
  { name: "Beaver",     role: "PET", max: 5, rarity: "epic",      hex: "#a855f7", img: "images/Beaver.png" },
  { name: "Penguin",    role: "PET", max: 5, rarity: "epic",      hex: "#a855f7", img: "images/Penguin.png" },
  { name: "Hippo",      role: "PET", max: 5, rarity: "epic",      hex: "#a855f7", img: "images/Hippo.png" },
  { name: "Raccoon",    role: "PET", max: 5, rarity: "mythic",    hex: "#ef4444", img: "images/Raccoon.png" },
  { name: "Squirrel",   role: "PET", max: 5, rarity: "rare",      hex: "#38bdf8", img: "images/Squirrel.png" },
  { name: "Dog",        role: "PET", max: 5, rarity: "rare",      hex: "#38bdf8", img: "images/Dog.png" },
  { name: "Cat",        role: "PET", max: 5, rarity: "rare",      hex: "#38bdf8", img: "images/Cat.png" },
  { name: "Bear",       role: "PET", max: 5, rarity: "rare",      hex: "#38bdf8", img: "images/Bear.png" }
];

const CATEGORIES = [
  { id: "DAMAGE",  title: "⚔️ DAMAGE TOWERS",   cssClass: "cat-damage" },
  { id: "SUPPORT", title: "🛡️ SUPPORT BASES",    cssClass: "cat-support" },
  { id: "FARM",    title: "🌾 ECONOMY & FARMS",  cssClass: "cat-farm" },
  { id: "PET",     title: "🐾 PETS",             cssClass: "cat-pet" }
];

const IMAGE_VERSION = "2.1";
ITEMS.forEach(item => {
  if (item.img && !item.img.includes("?")) {
    item.img = `${item.img}?v=${IMAGE_VERSION}`;
  }
});