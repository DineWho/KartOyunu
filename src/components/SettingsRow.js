import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { rs, rf } from '../utils/responsive';

export default function SettingsRow({ icon, label, sublabel, right, onPress, danger }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const labelColor = danger ? theme.colors.danger : theme.colors.text;

  const Inner = (
    <View style={s.row}>
      <View style={[s.iconWrap, { backgroundColor: theme.colors.surfaceElevated }]}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={[s.rowLabel, { color: labelColor }]}>{label}</Text>
        {sublabel ? <Text style={s.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {right ? <View style={s.rowRight}>{right}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
}

const makeStyles = (theme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(16),
    paddingVertical: rs(13),
    gap: rs(12),
  },
  iconWrap: {
    width: rs(38),
    height: rs(38),
    borderRadius: rs(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: rf(18) },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: rf(15),
    fontWeight: '600',
    color: theme.colors.text,
  },
  rowSublabel: {
    fontSize: rf(12),
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  rowRight: {},
});

export const SettingsRowDivider = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: rs(66),
      }}
    />
  );
};
