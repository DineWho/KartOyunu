import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import { rs } from '../utils/responsive';

export default function SettingsGroup({ title, children }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: rs(24) }}>
      {title ? (
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: theme.colors.textMuted,
            letterSpacing: 1.2,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
