import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mods } from '../data';
import { useStats } from './StatsContext';
import { getAllBadges } from '../data/badges';

const BadgesContext = createContext();
const STORAGE_KEY = '@cardwho_badges';
const ALL_BADGES = getAllBadges();

export function BadgesProvider({ children }) {
  const { stats, modStats, getTotalStats } = useStats();
  const [earnedIds, setEarnedIds] = useState(new Set());
  const [badgesLoaded, setBadgesLoaded] = useState(false);
  const [badgeQueue, setBadgeQueue] = useState([]);
  // Ref mirrors earnedIds to avoid stale closure in the check effect
  const earnedIdsRef = useRef(new Set());

  // Load persisted badge IDs on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const idSet = new Set(JSON.parse(raw));
          earnedIdsRef.current = idSet;
          setEarnedIds(idSet);
        } catch {}
      }
      setBadgesLoaded(true);
    });
  }, []);

  // Derived stats needed for badge checks — recomputed when stats change
  const derivedStats = useMemo(() => {
    const totals = getTotalStats();
    const playedModIds = new Set(Object.keys(modStats));
    const playedMods = Array.from(playedModIds)
      .map(id => mods.find(m => m.id === id))
      .filter(Boolean);
    return {
      ...totals,
      playedCategoryIds: new Set(playedMods.map(m => m.categoryId)),
      playedLevelNames: new Set(playedMods.map(m => m.level).filter(Boolean)),
      playedModIds,
      hasPremium: playedMods.some(m => m.isPremium),
    };
  }, [stats, modStats]);

  // Check all badge conditions whenever stats change (only after badges are loaded)
  useEffect(() => {
    if (!badgesLoaded) return;

    const newlyEarned = ALL_BADGES.filter(
      b => !earnedIdsRef.current.has(b.id) && b.check(derivedStats),
    );
    if (!newlyEarned.length) return;

    const updated = new Set([...earnedIdsRef.current, ...newlyEarned.map(b => b.id)]);
    earnedIdsRef.current = updated;
    setEarnedIds(new Set(updated));
    setBadgeQueue(prev => [...prev, ...newlyEarned]);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...updated])).catch(() => {});
  }, [derivedStats, badgesLoaded]);

  const dismissTopBadge = useCallback(() => {
    setBadgeQueue(prev => prev.slice(1));
  }, []);

  const clearBadges = useCallback(() => {
    earnedIdsRef.current = new Set();
    setEarnedIds(new Set());
    setBadgeQueue([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return (
    <BadgesContext.Provider value={{ earnedIds, badgeQueue, dismissTopBadge, clearBadges, allBadges: ALL_BADGES }}>
      {children}
    </BadgesContext.Provider>
  );
}

export function useBadges() {
  const ctx = useContext(BadgesContext);
  if (!ctx) throw new Error('useBadges must be used within BadgesProvider');
  return ctx;
}
