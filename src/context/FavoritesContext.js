import React, { createContext, useContext, useState } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (question, deck, catColor) => {
    setFavorites(prev => {
      if (prev.some(f => f.question === question && f.deckId === deck.id)) return prev;
      return [...prev, {
        question,
        deckId: deck.id,
        deckTitle: deck.title,
        deckEmoji: deck.emoji,
        categoryId: deck.categoryId,
        catColor,
      }];
    });
  };

  const removeFavorite = (question, deckId) => {
    setFavorites(prev => prev.filter(f => !(f.question === question && f.deckId === deckId)));
  };

  const isFavorite = (question, deckId) =>
    favorites.some(f => f.question === question && f.deckId === deckId);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
