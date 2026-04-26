import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { rs, rf } from '../utils/responsive';

export default function ScreenHeader({ title, right, onClose }) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const handleClose = onClose || (() => navigation.goBack());

  return (
    <View style={s.header}>
      <TouchableOpacity onPress={handleClose} hitSlop={10} style={s.iconBtn} activeOpacity={0.7}>
        <Feather name="x" size={22} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={s.title} numberOfLines={1}>{title}</Text>
      <View style={s.iconBtn}>{right || null}</View>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: rs(16),
      paddingTop: rs(8),
      paddingBottom: rs(12),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    iconBtn: {
      width: rs(36),
      height: rs(36),
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: rf(17),
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: -0.2,
    },
  });
