import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { categories, mods, useLocalize, localize } from './index';

// ─── Group order (ID-based, language-agnostic) ────────────────────────────────

export const GROUP_ORDER = [
  'progress', 'favorites', 'share', 'explore',
  'games', 'variety', 'categories', 'levels',
];

// ─── Static badges (25) ───────────────────────────────────────────────────────
// title/desc resolved via i18n key `badges.static.<id>.title|desc`

export const STATIC_BADGES = [
  { id: 'progress_10',   groupKey: 'progress',  icon: 'arrow-right', color: '#6B4FA8', check: s => s.totalCards >= 10   },
  { id: 'progress_50',   groupKey: 'progress',  icon: 'eye',         color: '#2563EB', check: s => s.totalCards >= 50   },
  { id: 'progress_150',  groupKey: 'progress',  icon: 'layers',      color: '#7C3AED', check: s => s.totalCards >= 150  },
  { id: 'progress_300',  groupKey: 'progress',  icon: 'anchor',      color: '#0891B2', check: s => s.totalCards >= 300  },
  { id: 'progress_500',  groupKey: 'progress',  icon: 'shield',      color: '#EA580C', check: s => s.totalCards >= 500  },
  { id: 'progress_1000', groupKey: 'progress',  icon: 'award',       color: '#D4A843', check: s => s.totalCards >= 1000 },

  { id: 'fav_1',   groupKey: 'favorites', icon: 'heart',    color: '#E11D48', check: s => s.totalFavorited >= 1   },
  { id: 'fav_15',  groupKey: 'favorites', icon: 'bookmark', color: '#DB2777', check: s => s.totalFavorited >= 15  },
  { id: 'fav_50',  groupKey: 'favorites', icon: 'star',     color: '#9333EA', check: s => s.totalFavorited >= 50  },
  { id: 'fav_100', groupKey: 'favorites', icon: 'archive',  color: '#D97706', check: s => s.totalFavorited >= 100 },

  { id: 'share_1',  groupKey: 'share', icon: 'share-2', color: '#0D9488', check: s => s.questionsShared >= 1  },
  { id: 'share_10', groupKey: 'share', icon: 'users',   color: '#16A34A', check: s => s.questionsShared >= 10 },
  { id: 'share_50', groupKey: 'share', icon: 'globe',   color: '#059669', check: s => s.questionsShared >= 50 },

  { id: 'cats_3',  groupKey: 'explore', icon: 'compass', color: '#EA580C', check: s => s.categoriesPlayed >= 3  },
  { id: 'cats_8',  groupKey: 'explore', icon: 'map',     color: '#0284C7', check: s => s.categoriesPlayed >= 8  },
  { id: 'cats_15', groupKey: 'explore', icon: 'globe',   color: '#D4A843', check: s => s.categoriesPlayed >= 15 },

  { id: 'mods_5',  groupKey: 'explore', icon: 'shuffle',     color: '#7C3AED', check: s => s.modsPlayed >= 5  },
  { id: 'mods_15', groupKey: 'explore', icon: 'target',      color: '#2563EB', check: s => s.modsPlayed >= 15 },
  { id: 'mods_30', groupKey: 'explore', icon: 'flag',        color: '#16A34A', check: s => s.modsPlayed >= 30 },
  { id: 'mods_60', groupKey: 'explore', icon: 'trending-up', color: '#D4A843', check: s => s.modsPlayed >= 60 },

  { id: 'games_1',  groupKey: 'games', icon: 'play',     color: '#6B4FA8', check: s => s.totalGames >= 1  },
  { id: 'games_10', groupKey: 'games', icon: 'activity', color: '#2563EB', check: s => s.totalGames >= 10 },
  { id: 'games_30', groupKey: 'games', icon: 'zap',      color: '#D97706', check: s => s.totalGames >= 30 },

  { id: 'levels_5',      groupKey: 'variety', icon: 'sliders', color: '#0D9488', check: s => s.levelsPlayed >= 5 },
  { id: 'premium_first', groupKey: 'variety', icon: 'unlock',  color: '#D4A843', check: s => s.hasPremium       },
];

// ─── Level badge config (10 distinctive levels) ───────────────────────────────
// Key: TR canonical level name. Slug used as i18n key.

export const LEVEL_BADGE_CONFIG = {
  'Mahrem':     { slug: 'mahrem',     icon: 'lock',         color: '#7C5EBB' },
  'Yoğun':      { slug: 'yogun',      icon: 'zap',          color: '#6D28D9' },
  'İddialı':    { slug: 'iddiali',    icon: 'shield',       color: '#EA580C' },
  'Filtresiz':  { slug: 'filtresiz',  icon: 'eye',          color: '#DC2626' },
  'Kışkırtıcı': { slug: 'kiskirtici', icon: 'activity',     color: '#B91C1C' },
  'Kaotik':     { slug: 'kaotik',     icon: 'shuffle',      color: '#D97706' },
  'Flörtöz':    { slug: 'flortoz',    icon: 'heart',        color: '#DB2777' },
  'Katmanlı':   { slug: 'katmanli',   icon: 'layers',       color: '#4338CA' },
  'Cesur':      { slug: 'cesur',      icon: 'check-circle', color: '#0369A1' },
  'Düşündüren': { slug: 'dusunduren', icon: 'book-open',    color: '#047857' },
};

// ─── Generator functions ──────────────────────────────────────────────────────

export function buildCategoryBadges() {
  return categories.map(cat => ({
    id: `cat_${cat.id}`,
    groupKey: 'categories',
    categoryId: cat.id,
    categoryName: cat.name,
    icon: 'map-pin',
    color: cat.color,
    check: s => s.playedCategoryIds.has(cat.id),
  }));
}

export function buildLevelBadges() {
  // TR canonical level name → multilingual level object (from mods)
  const levelMap = {};
  mods.forEach(m => {
    const tr = m.level?.tr;
    if (tr && !levelMap[tr]) levelMap[tr] = m.level;
  });

  return Object.entries(LEVEL_BADGE_CONFIG).map(([levelTrName, cfg]) => ({
    id: `level_${cfg.slug}`,
    groupKey: 'levels',
    levelSlug: cfg.slug,
    levelName: levelMap[levelTrName] || { tr: levelTrName },
    icon: cfg.icon,
    color: cfg.color,
    check: s => s.playedLevelNames.has(levelTrName),
  }));
}

let _cache = null;
export function getAllBadges() {
  if (!_cache) _cache = [...STATIC_BADGES, ...buildCategoryBadges(), ...buildLevelBadges()];
  return _cache;
}

// ─── Label resolution (i18n) ──────────────────────────────────────────────────

export function getBadgeLabels(badge, t, lang) {
  const group = t(`badges.groups.${badge.groupKey}`);
  if (badge.categoryId) {
    const titleKey = `badges.categoryTitles.${badge.categoryId}`;
    const resolved = t(titleKey);
    const title = resolved === titleKey
      ? t('badges.categoryFallbackTitle', { category: localize(badge.categoryName, lang) })
      : resolved;
    const desc = t('badges.categoryDesc', { category: localize(badge.categoryName, lang) });
    return { title, desc, group };
  }
  if (badge.levelSlug) {
    return {
      title: t(`badges.levelTitles.${badge.levelSlug}`),
      desc: t('badges.levelDesc', { level: localize(badge.levelName, lang) }),
      group,
    };
  }
  return {
    title: t(`badges.static.${badge.id}.title`),
    desc: t(`badges.static.${badge.id}.desc`),
    group,
  };
}

export function useBadgeLabels() {
  const { t, i18n } = useTranslation();
  const localizeHook = useLocalize();
  return useCallback((badge) => {
    const group = t(`badges.groups.${badge.groupKey}`);
    if (badge.categoryId) {
      const titleKey = `badges.categoryTitles.${badge.categoryId}`;
      const resolved = t(titleKey);
      const title = resolved === titleKey
        ? t('badges.categoryFallbackTitle', { category: localizeHook(badge.categoryName) })
        : resolved;
      const desc = t('badges.categoryDesc', { category: localizeHook(badge.categoryName) });
      return { title, desc, group };
    }
    if (badge.levelSlug) {
      return {
        title: t(`badges.levelTitles.${badge.levelSlug}`),
        desc: t('badges.levelDesc', { level: localizeHook(badge.levelName) }),
        group,
      };
    }
    return {
      title: t(`badges.static.${badge.id}.title`),
      desc: t(`badges.static.${badge.id}.desc`),
      group,
    };
  }, [t, i18n.language, localizeHook]);
}
