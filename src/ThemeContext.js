import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from './theme';

const STORAGE_KEY = '@cardwho_theme';

const ThemeContext = createContext({ theme: darkTheme, isDark: true, themeMode: 'dark', setThemeMode: () => {} });

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setThemeModeState(saved);
      } else if (saved !== null) {
        // eski kayıt: 'dark' veya 'light' dışında bir şey gelirse system'e çek
        setThemeModeState('system');
      }
    }).catch(() => {});
  }, []);

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  };

  const systemIsDark = systemScheme === 'dark';
  const isDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
