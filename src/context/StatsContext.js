import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mods } from '../data';

const StatsContext = createContext();

const STORAGE_KEY = '@cardwho_stats';
const CARDS_PER_GAME = 12;
const PLAY_ACTIONS = ['skip', 'favorite'];
const isPlayAction = (action) => PLAY_ACTIONS.includes(action);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState([]);
  const [modStats, setModStats] = useState({}); // { modId: { attempted, favorited } }
  const loadedRef = useRef(false);

  // Load stats from storage on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const loaded = JSON.parse(raw);
          setStats(loaded);
        } catch (e) {
          console.warn('Failed to parse stats:', e);
        }
      }
    });
  }, []);

  const computeModStats = (statsList) => {
    const computed = {};
    statsList.forEach((stat) => {
      if (!isPlayAction(stat.action)) return;

      if (!computed[stat.modId]) {
        computed[stat.modId] = { attempted: 0, favorited: 0 };
      }
      computed[stat.modId].attempted += 1;
      if (stat.action === 'favorite') {
        computed[stat.modId].favorited += 1;
      }
    });
    setModStats(computed);
  };

  useEffect(() => {
    computeModStats(stats);
  }, [stats]);

  const addStat = (cardId, modId, action) => {
    const newStat = {
      cardId,
      modId,
      action, // 'skip', 'favorite', 'share'
      timestamp: new Date().toISOString(),
    };

    setStats(prev => {
      const updated = [...prev, newStat];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const getStatsByMod = (modId) => {
    return modStats[modId] || { attempted: 0, favorited: 0 };
  };

  const getTotalStats = () => {
    const playStats = stats.filter((s) => isPlayAction(s.action));
    const playedModIds = new Set(playStats.map((s) => s.modId).filter(Boolean));
    const playedMods = Array.from(playedModIds)
      .map((modId) => mods.find((mod) => mod.id === modId))
      .filter(Boolean);

    return {
      totalCards: playStats.length,
      totalGames: Math.floor(playStats.length / CARDS_PER_GAME),
      totalFavorited: stats.filter((s) => s.action === 'favorite').length,
      categoriesPlayed: new Set(playedMods.map((mod) => mod.categoryId)).size,
      modsPlayed: playedModIds.size,
      levelsPlayed: new Set(playedMods.map((mod) => mod.level?.tr || mod.level).filter(Boolean)).size,
      questionsShared: stats.filter((s) => s.action === 'share').length,
    };
  };

  const getCompletedModsCount = () => {
    return Object.values(modStats).filter((s) => s.attempted >= CARDS_PER_GAME).length;
  };

  const getTotalFavoriteCount = () => {
    return stats.filter((s) => s.action === 'favorite').length;
  };

  const getTopCategories = (limit = 2) => {
    const categoryScore = {};
    Object.entries(modStats).forEach(([modId, s]) => {
      const mod = mods.find((m) => m.id === modId);
      if (!mod) return;
      categoryScore[mod.categoryId] = (categoryScore[mod.categoryId] || 0) + s.attempted;
    });
    return Object.entries(categoryScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([catId]) => catId);
  };

  const getRecommendedByCategory = (limit = 5) => {
    const topCats = getTopCategories(2);
    if (topCats.length === 0) return [];

    const completedModIds = new Set(
      Object.entries(modStats)
        .filter(([, s]) => s.attempted >= CARDS_PER_GAME)
        .map(([modId]) => modId),
    );

    return mods
      .filter((mod) => topCats.includes(mod.categoryId) && !completedModIds.has(mod.id))
      .slice(0, limit);
  };

  const getRecommendedByFavorites = (limit = 5) => {
    const favoritedModIds = Object.entries(modStats)
      .filter(([, s]) => s.favorited > 0)
      .map(([modId]) => modId);

    if (favoritedModIds.length === 0) return [];

    const favCategoryIds = new Set(
      favoritedModIds.map((modId) => mods.find((m) => m.id === modId)?.categoryId).filter(Boolean),
    );

    const interactedModIds = new Set(Object.keys(modStats));

    const unplayed = mods.filter(
      (mod) => favCategoryIds.has(mod.categoryId) && !interactedModIds.has(mod.id),
    );

    if (unplayed.length >= limit) return unplayed.slice(0, limit);

    const lowInteraction = mods
      .filter(
        (mod) =>
          favCategoryIds.has(mod.categoryId) &&
          !unplayed.includes(mod) &&
          (modStats[mod.id]?.attempted || 0) < CARDS_PER_GAME,
      )
      .sort((a, b) => (modStats[a.id]?.attempted || 0) - (modStats[b.id]?.attempted || 0));

    return [...unplayed, ...lowInteraction].slice(0, limit);
  };

  const clearStats = () => {
    setStats([]);
    setModStats({});
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StatsContext.Provider
      value={{
        stats,
        modStats,
        addStat,
        getStatsByMod,
        getTotalStats,
        getCompletedModsCount,
        getTotalFavoriteCount,
        getRecommendedByCategory,
        getRecommendedByFavorites,
        clearStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return ctx;
}
