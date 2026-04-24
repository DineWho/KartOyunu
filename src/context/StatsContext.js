import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StatsContext = createContext();

const STORAGE_KEY = '@kartoyunu_stats';

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
          computeModStats(loaded);
        } catch (e) {
          console.warn('Failed to parse stats:', e);
        }
      }
    });
  }, []);

  const computeModStats = (statsList) => {
    const computed = {};
    statsList.forEach((stat) => {
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

  const addStat = (cardId, modId, action) => {
    const newStat = {
      cardId,
      modId,
      action, // 'skip', 'favorite'
      timestamp: new Date().toISOString(),
    };

    const updated = [...stats, newStat];
    setStats(updated);
    computeModStats(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getStatsByMod = (modId) => {
    return modStats[modId] || { attempted: 0, favorited: 0 };
  };

  const getTotalStats = () => {
    return {
      totalCards: stats.length,
      totalFavorited: stats.filter((s) => s.action === 'favorite').length,
      modsPlayed: Object.keys(modStats).length,
    };
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
