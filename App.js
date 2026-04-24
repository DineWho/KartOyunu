import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/ThemeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import ModScreen from './src/screens/ModScreen';
import CardScreen from './src/screens/CardScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TabBar from './src/components/TabBar';

const TAB_SCREENS = ['home', 'favorites', 'settings', 'profile'];

function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const [screen, setScreen] = useState('home');
  const [selectedMod, setSelectedMod] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modSource, setModSource] = useState('home');
  const { theme, isDark } = useTheme();

  const navigate = (screenName, params = {}) => {
    if (params.mod) setSelectedMod(params.mod);
    if (params.category) setSelectedCategory(params.category);
    if (screenName === 'mod') setModSource(params.from || 'home');
    setScreen(screenName);
  };

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  const showTabBar = TAB_SCREENS.includes(screen);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {screen === 'home'      && <HomeScreen navigate={navigate} />}
      {screen === 'favorites' && <FavoritesScreen navigate={navigate} />}
      {screen === 'settings'  && <SettingsScreen />}
      {screen === 'profile'   && <ProfileScreen navigate={navigate} />}
      {screen === 'category'  && <CategoryScreen navigate={navigate} category={selectedCategory} />}
      {screen === 'mod'       && <ModScreen navigate={navigate} mod={selectedMod} from={modSource} />}
      {screen === 'cards'     && <CardScreen navigate={navigate} mod={selectedMod} />}

      {showTabBar && (
        <TabBar
          activeTab={screen}
          onTabChange={(tab) => setScreen(tab)}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </ThemeProvider>
  );
}
