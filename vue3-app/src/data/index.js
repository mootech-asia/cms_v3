// Mock data for the games lobby

const PROVIDERS = [
  'Saba',
  'Bti',
  'Evolution',
  'Pragmatic Play',
  'PG Soft',
  'Microgaming',
  'Playtech',
  'NetEnt',
  'JDB',
  'CQ9',
  'Jili',
  'Spadegaming',
  'Habanero',
  'Yggdrasil',
  'Red Tiger',
  'NoLimit City',
  'Relax Gaming',
  'Hacksaw Gaming',
  'Spribe',
  'Ezugi',
];

const GAME_TAGS = ['Hot', 'New', '2x', 'Top', '⚡', 'Live', 'VIP'];
const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

function makeGames(category, count, hueBase, imagePrefix = 'game') {
  const titles = {
    slots: ['Neon Vault', 'Cosmic Drift', 'Sugar Rush 9000', 'Golden Hex', 'Wild Riders',
            'Volt Strike', 'Hyper Reels', 'Crown of Aether', 'Pixel Pirates', 'Mega Moon',
            'Inferno Coins', 'Polar Quest', 'Atlantic Loot', 'Skyline Spin', 'Zen Garden',
            'Phantom Cash', 'Diamond Forge', 'Bull Rush', 'Tiki Tides', 'Ronin Reels'],
    live: ['Lightning Roulette', 'Crazy Time Live', 'Blackjack VIP A', 'Mega Wheel', 'Baccarat Squeeze',
           'Speed Roulette', 'Dragon Tiger', 'Monopoly Live', 'Sic Bo', 'Hold\'em Royale',
           'Auto Roulette', 'XXXtreme Lightning'],
    originals: ['Crash 100', 'Mines', 'Plinko', 'Dice', 'Limbo',
                'Hilo', 'Keno', 'Wheel', 'Tower', 'Diamonds',
                'Roulette X', 'Coin Flip'],
    table: ['European Roulette', 'Single Deck Blackjack', 'Pai Gow', 'Texas Hold\'em',
            'Caribbean Stud', 'Three Card Poker', 'Casino War', 'Punto Banco',
            'Red Dog', 'High Card Flush', 'Let It Ride', 'Pontoon']
  };
  const arr = [];
  const list = titles[category];
  for (let i = 0; i < count; i++) {
    const t = list[i % list.length];
    const hue = (hueBase + i * 31) % 360;
    arr.push({
      id: `${category}-${i}`,
      title: t,
      category,
      provider: PROVIDERS[i % PROVIDERS.length],
      hue,
      tag: i % 3 === 0 ? GAME_TAGS[i % GAME_TAGS.length] : null,
      players: 80 + ((i * 137) % 4200),
      rtp: (94 + ((i * 7) % 6) + ((i * 13) % 100) / 100).toFixed(2),
      maxWin: `${500 + ((i * 91) % 50000)}x`,
      image: assetPath(`assets/mock/${imagePrefix}-${String((i % 12) + 1).padStart(2, '0')}.webp`),
    });
  }
  return arr;
}

const GAMES = {
  slots:     makeGames('slots',     24, 280),
  live:      makeGames('live',      12,  10, 'live'),
  originals: makeGames('originals', 12, 200),
  table:     makeGames('table',     12, 130),
};

const HERO_SLIDES = [
  { eyebrow: 'WEEKLY DROP',  title: '$250,000 Vault\nUnlock Saturday',  sub: 'Spin any qualifying slot to enter. The bigger you bet, the bigger your slice.', hue: 290, badge: 'LIVE NOW', image: assetPath('assets/mock/hero-1.webp') },
  { eyebrow: 'NEW ORIGINAL', title: 'Crash 100 is\nlive in beta',       sub: 'Our flagship original — provably fair multipliers up to 1,000,000×.',           hue: 200, badge: 'BETA', image: assetPath('assets/mock/hero-2.webp') },
  { eyebrow: 'TOURNAMENT',   title: 'Race for $50K\nin 72 hours',        sub: 'Top 100 players split the prize pool. Climb the leaderboard live.',              hue: 340, badge: 'ENDS 2D 14H', image: assetPath('assets/mock/hero-3.webp') }
];

const PROMOS = [
  { title: '100% First Deposit', sub: 'Up to 10,000 USDT',  icon: '◉', hue: 290 },
  { title: 'Daily Reload',       sub: '15% back, every day', icon: '◇', hue: 200 },
  { title: 'Refer a Friend',     sub: 'Earn 25% lifetime',   icon: '△', hue: 340 },
  { title: 'VIP Cashback',       sub: 'Up to 20% weekly',    icon: '◯', hue:  60 }
];

const WINNERS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  user: ['CryptoKing','Nova','Blackbird','Mira','V0idR4t','Hydra','Lupin','Aki','Echo','Kade',
         'Sable','Ronin','Qüip','Ferro','Zen0','Dax','Hush','Vex'][i],
  game: ['Sugar Rush 9000','Crash 100','Mega Moon','Lightning Roulette','Wild Riders','Mines',
         'Golden Hex','Plinko','Crazy Time Live','Volt Strike','Inferno Coins','Crown of Aether',
         'Sugar Rush 9000','Crash 100','Pixel Pirates','Phantom Cash','Diamond Forge','Hyper Reels'][i],
  bet:    (10 + (i * 7)  % 200).toFixed(2),
  mult:   (2  + (i * 13) % 480).toFixed(2),
  payout: ((10 + (i * 7) % 200) * (2 + (i * 13) % 480)).toFixed(2),
  hue: (i * 47) % 360
}));

const TOURNAMENTS = [
  { title: 'Saturday Slot Race', prize: '$50,000', endsIn: '2d 14h', players: 4129, hue: 290, tag: 'FEATURED' },
  { title: 'Crash Kings',        prize: '$25,000', endsIn: '6h 22m', players: 2104, hue: 200, tag: 'ENDS SOON' },
  { title: 'Live Casino Cup',    prize: '$15,000', endsIn: '4d 0h',  players:  870, hue: 340, tag: null }
];

const RECENTLY_PLAYED = [
  GAMES.slots[2], GAMES.originals[0], GAMES.slots[5],
  GAMES.live[0],  GAMES.slots[1],     GAMES.originals[2],
  GAMES.slots[7], GAMES.table[0]
];

export { PROVIDERS, GAMES, HERO_SLIDES, PROMOS, WINNERS, TOURNAMENTS, RECENTLY_PLAYED };
