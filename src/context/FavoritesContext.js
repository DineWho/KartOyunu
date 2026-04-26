import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cardwho_favorites';
const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const loaded = useRef(false);

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        loaded.current = true;
        if (raw) setFavorites(JSON.parse(raw));
      })
      .catch(() => { loaded.current = true; });
  }, []);

  // Persist on every change — skips initial empty render before load
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  // Stable identity for a card across language switches and serialization.
  // TR is always present (canonical) — multilingual cards: { tr, en, ... }.
  // Backward compatible with legacy string-only favorites stored before i18n migration.
  const cardKey = (q) => (typeof q === 'string' ? q : (q?.tr || ''));

  const addFavorite = (question, mod, catColor) => {
    const key = cardKey(question);
    setFavorites(prev => {
      if (prev.some(f => cardKey(f.question) === key && f.modId === mod.id)) return prev;
      return [...prev, {
        question,
        modId: mod.id,
        modTitle: mod.title,
        modEmoji: mod.emoji,
        categoryId: mod.categoryId,
        catColor,
      }];
    });
  };

  const removeFavorite = (question, modId) => {
    const key = cardKey(question);
    setFavorites(prev => prev.filter(f => !(cardKey(f.question) === key && f.modId === modId)));
  };

  const isFavorite = (question, modId) => {
    const key = cardKey(question);
    return favorites.some(f => cardKey(f.question) === key && f.modId === modId);
  };

  const clearFavorites = () => setFavorites([]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
