import React, { createContext, useContext, useState } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

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
