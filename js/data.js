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
  DAMAGE: "31",
  SUPPORT: "32",
  FARM: "33",
  PET: "34",
  common: "36",
  uncommon: "31",
  rare: "35",
  legendary: "33",
  mythic: "37"
};

const ITEMS = [
  { name: "Machine Mortar", role: "DAMAGE", max: 8, rarity: "mythic",    hex: "#ffffff", img: "images/MortarMachine.png" },
  { name: "World Ender",    role: "DAMAGE", max: 7, rarity: "legendary", hex: "#facc15", img: "images/WorldEnder.png" },
  { name: "Railgun",        role: "DAMAGE", max: 7, rarity: "legendary", hex: "#facc15", img: "images/Railgun.png" },
  { name: "Lava Launcher",  role: "DAMAGE", max: 8, rarity: "legendary", hex: "#facc15", img: "images/LavaLauncher.png" },
  { name: "Ice Turret",     role: "DAMAGE", max: 7, rarity: "legendary", hex: "#facc15", img: "images/IceTurret.png" },
  { name: "Toxic Turret",   role: "DAMAGE", max: 8, rarity: "uncommon",  hex: "#f87171", img: "images/ToxicTurret.png" },
  { name: "Fire Spitter",   role: "DAMAGE", max: 8, rarity: "uncommon",  hex: "#f87171", img: "images/FireSpitter.png" },
  { name: "Ballista",       role: "DAMAGE", max: 8, rarity: "uncommon",  hex: "#f87171", img: "images/Ballista.png" },
  { name: "Mortar",         role: "DAMAGE", max: 8, rarity: "common",    hex: "#38bdf8", img: "images/Mortar.png" },
  { name: "Flamethrower",   role: "DAMAGE", max: 8, rarity: "common",    hex: "#38bdf8", img: "images/Flamethrower.png" },
  { name: "Tesla",          role: "DAMAGE", max: 8, rarity: "rare",      hex: "#c084fc", img: "images/Tesla.png" },
  { name: "Cannon",         role: "DAMAGE", max: 10, rarity: "common",   hex: "#38bdf8", img: "images/Cannon.png" },

  { name: "Medical Base",   role: "SUPPORT", max: 6, rarity: "rare",     hex: "#c084fc", img: "images/MedicalBase.png" },
  { name: "Military Base",  role: "SUPPORT", max: 6, rarity: "uncommon", hex: "#f87171", img: "images/MilitaryBase.png" },
  { name: "Protector Base", role: "SUPPORT", max: 6, rarity: "rare",     hex: "#c084fc", img: "images/ProtectorBase.png" },

  { name: "The Bank",       role: "FARM", max: 9, rarity: "mythic",    hex: "#ffffff", img: "images/TheBank.png" },
  { name: "Void Farm",      role: "FARM", max: 8, rarity: "legendary", hex: "#facc15", img: "images/VoidFarm.png" },
  { name: "Vault",          role: "FARM", max: 8, rarity: "rare",      hex: "#c084fc", img: "images/Vault.png" },
  { name: "Mining Cave",    role: "FARM", max: 8, rarity: "common",    hex: "#38bdf8", img: "images/MiningCave.png" },

  { name: "Unicorn",    role: "PET", max: 5, rarity: "mythic",    hex: "#ffffff", isPet: true, img: "images/Unicorn.png" },
  { name: "Lion",       role: "PET", max: 5, rarity: "mythic",    hex: "#ffffff", isPet: true, img: "images/Lion.png" },
  { name: "Dragon",     role: "PET", max: 5, rarity: "legendary", hex: "#facc15", isPet: true, img: "images/Dragon.png" },
  { name: "Turtle",     role: "PET", max: 5, rarity: "legendary", hex: "#facc15", isPet: true, img: "images/Turtle.png" },
  { name: "Elephant",   role: "PET", max: 5, rarity: "legendary", hex: "#facc15", isPet: true, img: "images/Elephant.png" },
  { name: "Polar Bear", role: "PET", max: 5, rarity: "legendary", hex: "#facc15", isPet: true, img: "images/PolarBear.png" },
  { name: "Dino",       role: "PET", max: 5, rarity: "legendary", hex: "#facc15", isPet: true, img: "images/Dino.png" },
  { name: "Tiger",      role: "PET", max: 5, rarity: "legendary", hex: "#facc15", isPet: true, img: "images/Tiger.png" },
  { name: "Beaver",     role: "PET", max: 5, rarity: "rare",      hex: "#c084fc", isPet: true, img: "images/Beaver.png" },
  { name: "Penguin",    role: "PET", max: 5, rarity: "rare",      hex: "#c084fc", isPet: true, img: "images/Penguin.png" },
  { name: "Hippo",      role: "PET", max: 5, rarity: "rare",      hex: "#c084fc", isPet: true, img: "images/Hippo.png" },
  { name: "Raccoon",    role: "PET", max: 5, rarity: "uncommon",  hex: "#f87171", isPet: true, img: "images/Raccoon.png" },
  { name: "Monkey",     role: "PET", max: 5, rarity: "uncommon",  hex: "#f87171", isPet: true, img: "images/Monkey.png" },
  { name: "Bunny",      role: "PET", max: 5, rarity: "uncommon",  hex: "#f87171", isPet: true, img: "images/Bunny.png" },
  { name: "Arctic Fox", role: "PET", max: 5, rarity: "uncommon",  hex: "#f87171", isPet: true, img: "images/ArcticFox.png" },
  { name: "Squirrel",   role: "PET", max: 5, rarity: "common",    hex: "#38bdf8", isPet: true, img: "images/Squirrel.png" },
  { name: "Dog",        role: "PET", max: 5, rarity: "common",    hex: "#38bdf8", isPet: true, img: "images/Dog.png" },
  { name: "Cat",        role: "PET", max: 5, rarity: "common",    hex: "#38bdf8", isPet: true, img: "images/Cat.png" },
  { name: "Bear",       role: "PET", max: 5, rarity: "common",    hex: "#38bdf8", isPet: true, img: "images/Bear.png" }
];

const CATEGORIES = [
  { id: "DAMAGE",  title: "⚔️ DAMAGE TOWERS",   cssClass: "cat-damage" },
  { id: "SUPPORT", title: "🛡️ SUPPORT BASES",    cssClass: "cat-support" },
  { id: "FARM",    title: "💰 ECONOMY & FARMS",  cssClass: "cat-farm" },
  { id: "PET",     title: "🐾 PETS",             cssClass: "cat-pet" }
];