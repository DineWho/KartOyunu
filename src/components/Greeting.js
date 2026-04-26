import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { rf } from '../utils/responsive';

function timeOfDay(hour) {
  if (hour < 6) return 'İyi geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function Greeting({ name }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);

  if (!name || !String(name).trim()) return null;

  const phrase = timeOfDay(new Date().getHours());
  return <Text style={s.text}>{`👋 ${phrase} ${name.trim()}`}</Text>;
}

const makeStyles = (theme) =>
  StyleSheet.create({
    text: {
      fontSize: rf(14),
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 6,
      letterSpacing: 0.1,
    },
  });
