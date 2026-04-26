import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { rf } from '../utils/responsive';

function timeOfDayKey(hour) {
  if (hour < 6) return 'greeting.night';
  if (hour < 12) return 'greeting.morning';
  if (hour < 18) return 'greeting.day';
  return 'greeting.evening';
}

export default function Greeting({ name }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);

  if (!name || !String(name).trim()) return null;

  const phrase = t(timeOfDayKey(new Date().getHours()));
  return <Text style={s.text}>{t('greeting.withName', { phrase, name: name.trim() })}</Text>;
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
