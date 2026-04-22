import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/ThemeContext';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import DeckScreen from './src/screens/DeckScreen';
import CardScreen from './src/screens/CardScreen';

function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const [screen, setScreen] = useState('home');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { theme, isDark } = useTheme();

  const navigate = (screenName, params = {}) => {
    if (params.deck) setSelectedDeck(params.deck);
    if (params.category) setSelectedCategory(params.category);
    setScreen(screenName);
  };

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {screen === 'home' && <HomeScreen navigate={navigate} />}
      {screen === 'category' && <CategoryScreen navigate={navigate} category={selectedCategory} />}
      {screen === 'deck' && <DeckScreen navigate={navigate} deck={selectedDeck} />}
      {screen === 'cards' && <CardScreen navigate={navigate} deck={selectedDeck} />}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
