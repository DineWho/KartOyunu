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

  const addFavorite = (question, mod, catColor) => {
    setFavorites(prev => {
      if (prev.some(f => f.question === question && f.modId === mod.id)) return prev;
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
    setFavorites(prev => prev.filter(f => !(f.question === question && f.modId === modId)));
  };

  const isFavorite = (question, modId) =>
    favorites.some(f => f.question === question && f.modId === modId);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
