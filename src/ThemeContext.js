import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from './theme';

const ThemeContext = createContext({ theme: darkTheme, isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme !== 'light');

  const toggleTheme = () => setIsDark(prev => !prev);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
