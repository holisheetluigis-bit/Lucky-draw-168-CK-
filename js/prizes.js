// Prize Data Configuration for Lucky Draw 168
const PRIZES = [
  {
    id: 'cash_1',
    name: '$1 Cash',
    type: 'cash',
    value: 1,
    displayValue: '$1',
    label: '$1',
    icon: '💵',
    color: '#00D084', // Vibrant Green
    textColor: '#FFFFFF',
    accentColor: '#10B981',
    rarity: 'Common',
    chance: 0.25,
    description: 'Instant Starter Cash reward directly to your wallet.'
  },
  {
    id: 'cash_10',
    name: '$10 Cash',
    type: 'cash',
    value: 10,
    displayValue: '$10',
    label: '$10',
    icon: '💸',
    color: '#0066FF', // Vibrant Royal Blue
    textColor: '#FFFFFF',
    accentColor: '#38BDF8',
    rarity: 'Common',
    chance: 0.22,
    description: 'Lucky quick cash bonus prize for instant withdrawal.'
  },
  {
    id: 'cash_50',
    name: '$50 Cash',
    type: 'cash',
    value: 50,
    displayValue: '$50',
    label: '$50',
    icon: '💰',
    color: '#FF6500', // Electric Orange
    textColor: '#FFFFFF',
    accentColor: '#FFA500',
    rarity: 'Uncommon',
    chance: 0.18,
    description: 'Silver Tier Cash reward with instant digital redemption.'
  },
  {
    id: 'special_prize',
    name: 'SPECIAL PRIZE',
    type: 'special',
    value: 10000,
    displayValue: 'Mystery 🎁',
    label: 'SPECIAL 🎁',
    icon: '🎁',
    color: '#FF8E00', // Radiant Orange / Gold
    textColor: '#FFFFFF',
    accentColor: '#00D084',
    rarity: 'Mythic',
    chance: 0.08,
    isSpecial: true,
    description: 'Mystery Vault! Open to reveal either a Vespa 2025 or Honda ADV 750cc!',
    mysteryPool: ['vespa_2025', 'adv_750cc']
  },
  {
    id: 'cash_150',
    name: '$150 Cash',
    type: 'cash',
    value: 150,
    displayValue: '$150',
    label: '$150',
    icon: '🧧',
    color: '#059669', // Emerald Green
    textColor: '#FFFFFF',
    accentColor: '#34D399',
    rarity: 'Rare',
    chance: 0.12,
    description: 'Bronze Jackpot prize package for lucky winners.'
  },
  {
    id: 'cash_500',
    name: '$500 Cash',
    type: 'cash',
    value: 500,
    displayValue: '$500',
    label: '$500',
    icon: '💎',
    color: '#1E3E62', // Deep Sapphire Blue
    textColor: '#FFFFFF',
    accentColor: '#00D2FF',
    rarity: 'Epic',
    chance: 0.08,
    description: 'Gold Mega Prize! Significant cash jackpot.'
  },
  {
    id: 'ford_raptor',
    name: 'Ford Raptor 2025',
    type: 'vehicle',
    value: 75000,
    displayValue: 'RAPTOR 2025',
    label: 'RAPTOR 🚗',
    icon: '🚗',
    color: '#0047AB', // Intense Cobalt Blue
    textColor: '#FFFFFF',
    accentColor: '#FF6500',
    rarity: 'Legendary',
    chance: 0.03,
    image: 'assets/images/ford_raptor_2025.jpg',
    specs: {
      engine: '3.5L Twin-Turbo EcoBoost V6 High Output',
      horsepower: '450 HP / 510 lb-ft Torque',
      transmission: '10-Speed SelectShift Automatic',
      suspension: 'FOX Live Valve Internal Bypass Shocks',
      edition: '2025 Off-Road Performance Super Truck',
      msrp: '$78,500'
    },
    description: 'The Ultimate Grand Prize! 2025 Ford F-150 Raptor in Electric Blue with factory warranty and delivery.'
  },
  {
    id: 'cash_1500',
    name: '$1,500 Cash',
    type: 'cash',
    value: 1500,
    displayValue: '$1,500',
    label: '$1,500 💎',
    icon: '👑',
    color: '#00A86B', // Rich Mint Green
    textColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    rarity: 'Legendary',
    chance: 0.04,
    description: 'Diamond Jackpot Cash Prize! Top tier pure cash reward.'
  }
];

// Mystery Vault Reveal Pool for Special Prize
const SPECIAL_PRIZES = {
  vespa_2025: {
    id: 'vespa_2025',
    name: 'Vespa 2025 Super Sport',
    type: 'vehicle',
    value: 8500,
    displayValue: 'Vespa 2025',
    badge: 'SPECIAL UNBOXED',
    icon: '🛵',
    image: 'assets/images/vespa_2025.jpg',
    color: '#FF6500',
    accentColor: '#00D084',
    rarity: 'Mythic',
    specs: {
      engine: '300cc High Performance Engine (HPE)',
      topSpeed: '125 km/h (Smooth Italian Cruising)',
      brakes: 'Dual-Channel ABS + ASR Traction Control',
      finish: 'Pearl White with Tricolore Racing Livery',
      edition: '2025 GTS 300 Super Sport Special Edition',
      msrp: '$8,499'
    },
    description: 'Iconic Italian luxury styling meets modern power. Includes free registration, luxury helmet, and 2-year factory warranty.'
  },
  adv_750cc: {
    id: 'adv_750cc',
    name: 'Honda ADV 750cc (2025)',
    type: 'vehicle',
    value: 13500,
    displayValue: 'ADV 750cc',
    badge: 'SPECIAL UNBOXED',
    icon: '🏍️',
    image: 'assets/images/adv_750cc.jpg',
    color: '#0066FF',
    accentColor: '#FF6500',
    rarity: 'Mythic',
    specs: {
      engine: '745cc Liquid-Cooled Twin Cylinder 8-Valve',
      transmission: 'Dual Clutch Transmission (DCT) 6-Speed',
      driveModes: 'Standard, Sport, Rain, Gravel, and User',
      chassis: 'Inverted Front Forks & Off-Road Spoke Wheels',
      edition: '2025 X-ADV Rally Edition',
      msrp: '$13,200'
    },
    description: 'The King of Adventure Scooters! Supreme cross-over capability for city roads and extreme terrain with full digital smart dash.'
  }
};

// Expose on window
if (typeof window !== 'undefined') {
  window.PRIZES = PRIZES;
  window.SPECIAL_PRIZES = SPECIAL_PRIZES;
}
