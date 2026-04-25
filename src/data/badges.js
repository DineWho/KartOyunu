import { categories } from './index';

// ─── Static badges (25) ───────────────────────────────────────────────────────

export const STATIC_BADGES = [
  // İlerleme
  { id: 'progress_10',   group: 'İlerleme',   title: 'İlk Dokunuş',    desc: '10 kart gördün',              icon: 'arrow-right', color: '#6B4FA8', check: s => s.totalCards >= 10   },
  { id: 'progress_50',   group: 'İlerleme',   title: 'Meraklı',        desc: '50 kart gördün',              icon: 'eye',         color: '#2563EB', check: s => s.totalCards >= 50   },
  { id: 'progress_150',  group: 'İlerleme',   title: 'Tutkulu',        desc: '150 kart gördün',             icon: 'layers',      color: '#7C3AED', check: s => s.totalCards >= 150  },
  { id: 'progress_300',  group: 'İlerleme',   title: 'Kararlı',        desc: '300 kart gördün',             icon: 'anchor',      color: '#0891B2', check: s => s.totalCards >= 300  },
  { id: 'progress_500',  group: 'İlerleme',   title: 'Vazgeçmez',      desc: '500 kart gördün',             icon: 'shield',      color: '#EA580C', check: s => s.totalCards >= 500  },
  { id: 'progress_1000', group: 'İlerleme',   title: 'Efsane',         desc: '1000 kart gördün',            icon: 'award',       color: '#D4A843', check: s => s.totalCards >= 1000 },

  // Favoriler
  { id: 'fav_1',   group: 'Favoriler', title: 'İlk Favori',    desc: 'İlk soruyu favoriledin',    icon: 'heart',    color: '#E11D48', check: s => s.totalFavorited >= 1   },
  { id: 'fav_15',  group: 'Favoriler', title: 'Seçici',        desc: '15 soruyu favoriledin',     icon: 'bookmark', color: '#DB2777', check: s => s.totalFavorited >= 15  },
  { id: 'fav_50',  group: 'Favoriler', title: 'Koleksiyoncu',  desc: '50 soruyu favoriledin',     icon: 'star',     color: '#9333EA', check: s => s.totalFavorited >= 50  },
  { id: 'fav_100', group: 'Favoriler', title: 'Hazine Avcısı', desc: '100 soruyu favoriledin',    icon: 'archive',  color: '#D97706', check: s => s.totalFavorited >= 100 },

  // Paylaşım
  { id: 'share_1',  group: 'Paylaşım', title: 'Paylaşımcı', desc: 'İlk soruyu paylaştın',  icon: 'share-2', color: '#0D9488', check: s => s.questionsShared >= 1  },
  { id: 'share_10', group: 'Paylaşım', title: 'Sosyal',     desc: '10 soru paylaştın',     icon: 'users',   color: '#16A34A', check: s => s.questionsShared >= 10 },
  { id: 'share_50', group: 'Paylaşım', title: 'Büyükelçi',  desc: '50 soru paylaştın',     icon: 'globe',   color: '#059669', check: s => s.questionsShared >= 50 },

  // Keşif — kategoriler
  { id: 'cats_3',  group: 'Keşif', title: 'Kaşif',           desc: '3 kategori keşfettin',        icon: 'compass',     color: '#EA580C', check: s => s.categoriesPlayed >= 3  },
  { id: 'cats_8',  group: 'Keşif', title: 'Gezgin',          desc: '8 kategori keşfettin',        icon: 'map',         color: '#0284C7', check: s => s.categoriesPlayed >= 8  },
  { id: 'cats_15', group: 'Keşif', title: 'Dünya Vatandaşı', desc: 'Tüm kategorileri keşfettin',  icon: 'globe',       color: '#D4A843', check: s => s.categoriesPlayed >= 15 },

  // Keşif — modlar
  { id: 'mods_5',  group: 'Keşif', title: 'Deneyimci',    desc: '5 mod oynadın',   icon: 'shuffle',     color: '#7C3AED', check: s => s.modsPlayed >= 5  },
  { id: 'mods_15', group: 'Keşif', title: 'Derin Gezgin', desc: '15 mod oynadın',  icon: 'target',      color: '#2563EB', check: s => s.modsPlayed >= 15 },
  { id: 'mods_30', group: 'Keşif', title: 'Sohbet Ustası',desc: '30 mod oynadın',  icon: 'flag',        color: '#16A34A', check: s => s.modsPlayed >= 30 },
  { id: 'mods_60', group: 'Keşif', title: 'Perde Açık',   desc: '60 mod oynadın',  icon: 'trending-up', color: '#D4A843', check: s => s.modsPlayed >= 60 },

  // Oyunlar
  { id: 'games_1',  group: 'Oyunlar', title: 'Oyuncu',  desc: 'İlk oyunu tamamladın',  icon: 'play',     color: '#6B4FA8', check: s => s.totalGames >= 1  },
  { id: 'games_10', group: 'Oyunlar', title: 'Düzenli', desc: '10 oyun tamamladın',    icon: 'activity', color: '#2563EB', check: s => s.totalGames >= 10 },
  { id: 'games_30', group: 'Oyunlar', title: 'Adanmış', desc: '30 oyun tamamladın',    icon: 'zap',      color: '#D97706', check: s => s.totalGames >= 30 },

  // Çeşitlilik
  { id: 'levels_5',      group: 'Çeşitlilik', title: 'Çok Yönlü',  desc: '5 farklı seviyeyi dendin',   icon: 'sliders', color: '#0D9488', check: s => s.levelsPlayed >= 5 },
  { id: 'premium_first', group: 'Çeşitlilik', title: 'Pro Oyuncu', desc: 'İlk premium modu oynadın',   icon: 'unlock',  color: '#D4A843', check: s => s.hasPremium        },
];

// ─── Category badge titles ────────────────────────────────────────────────────

const CATEGORY_TITLES = {
  arkadaslar: 'Dost Canlısı',
  bulusma:    'Flört Dehası',
  ciftler:    'İlişki Uzmanı',
  aile:       'Aile Sıcaklığı',
  grup:       'Grup Dinamiği',
  burclar:    'Astro Meraklı',
  yemek:      'Gurme Sohbetçi',
  seyahat:    'Gezgin Ruh',
  evcil:      'Pet Parent',
  is:         'İş Yorumu',
  nostalji:   'Nostalji Özlemi',
  psikoloji:  'İç Dünya',
  viral:      'Viral Bağlantı',
  siyaset:    'Forum Sesi',
  kaos:       'Kaos Tanrısı',
};

// ─── Level badge config (10 distinctive levels) ───────────────────────────────
// Yeni seviye = bu objeye 1 satır ekle, rozet otomatik doğar

export const LEVEL_BADGE_CONFIG = {
  'Mahrem':     { title: 'Gizli Kapı',    icon: 'lock',         color: '#7C5EBB' },
  'Yoğun':      { title: 'Derinden',      icon: 'zap',          color: '#6D28D9' },
  'İddialı':    { title: 'Cesaret Ödülü', icon: 'shield',       color: '#EA580C' },
  'Filtresiz':  { title: 'Perde Yok',     icon: 'eye',          color: '#DC2626' },
  'Kışkırtıcı': { title: 'Ateşleyici',    icon: 'activity',     color: '#B91C1C' },
  'Kaotik':     { title: 'Kaos Teorisi',  icon: 'shuffle',      color: '#D97706' },
  'Flörtöz':    { title: 'Flört Ustası',  icon: 'heart',        color: '#DB2777' },
  'Katmanlı':   { title: 'Derinlikler',   icon: 'layers',       color: '#4338CA' },
  'Cesur':      { title: 'Cesaret Testi', icon: 'check-circle', color: '#0369A1' },
  'Düşündüren': { title: 'Düşünür',       icon: 'book-open',    color: '#047857' },
};

// ─── Generator functions ──────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ı/g, 'i').replace(/İ/g, 'i')
    .replace(/[^a-z0-9]/g, '_');
}

// Yeni kategori eklendiğinde categories[] array'ine girdiği an rozet otomatik doğar.
// CATEGORY_TITLES'a başlık eklemeyi unutma; yoksa "X Uzmanı" fallback kullanılır.
export function buildCategoryBadges() {
  return categories.map(cat => ({
    id: `cat_${cat.id}`,
    group: 'Kategoriler',
    title: CATEGORY_TITLES[cat.id] || `${cat.name} Uzmanı`,
    desc: `${cat.name} kategorisinden ilk modunu oynadın`,
    icon: 'map-pin',
    color: cat.color,
    check: s => s.playedCategoryIds.has(cat.id),
  }));
}

export function buildLevelBadges() {
  return Object.entries(LEVEL_BADGE_CONFIG).map(([level, cfg]) => ({
    id: `level_${slugify(level)}`,
    group: 'Seviyeler',
    title: cfg.title,
    desc: `"${level}" seviyesinde ilk modunu oynadın`,
    icon: cfg.icon,
    color: cfg.color,
    check: s => s.playedLevelNames.has(level),
  }));
}

let _cache = null;
export function getAllBadges() {
  if (!_cache) _cache = [...STATIC_BADGES, ...buildCategoryBadges(), ...buildLevelBadges()];
  return _cache;
}
