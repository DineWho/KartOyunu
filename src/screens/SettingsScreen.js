import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Switch,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAudio } from '../context/AudioContext';
import { rs, rf } from '../utils/responsive';

function SettingRow({ icon, label, sublabel, right, onPress, theme }) {
  const s = useMemo(() => rowStyles(theme), [theme]);
  const Inner = (
    <View style={s.row}>
      <View style={[s.iconWrap, { backgroundColor: theme.colors.surfaceElevated }]}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowLabel}>{label}</Text>
        {sublabel ? <Text style={s.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {right && <View style={s.rowRight}>{right}</View>}
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

const rowStyles = (theme) => StyleSheet.create({
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

function SettingsGroup({ title, children, theme }) {
  return (
    <View style={{ marginBottom: 24 }}>
      {title && (
        <Text style={{
          fontSize: 11,
          fontWeight: '700',
          color: theme.colors.textMuted,
          letterSpacing: 1.2,
          marginBottom: 8,
          marginLeft: 4,
        }}>
          {title}
        </Text>
      )}
      <View style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
      }}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound } = useAudio();
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <SettingsGroup title="GÖRÜNÜM" theme={theme}>
          <SettingRow
            icon={isDark ? '☀' : '☽'}
            label="Karanlık Mod"
            sublabel={isDark ? 'Açık' : 'Kapalı'}
            theme={theme}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '88' }}
                thumbColor={isDark ? theme.colors.primary : theme.colors.textMuted}
              />
            }
          />
          <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 66 }} />
          <SettingRow
            icon={soundEnabled ? '🔊' : '🔇'}
            label="Ses Efektleri"
            sublabel={soundEnabled ? 'Açık' : 'Kapalı'}
            theme={theme}
            right={
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '88' }}
                thumbColor={soundEnabled ? theme.colors.primary : theme.colors.textMuted}
              />
            }
          />
        </SettingsGroup>

        <SettingsGroup title="UYGULAMA" theme={theme}>
          <SettingRow
            icon="🎯"
            label="Nasıl Oynanır?"
            sublabel="Kısa rehber"
            theme={theme}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
          <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 66 }} />
          <SettingRow
            icon="⭐"
            label="Uygulamayı Oyla"
            sublabel="App Store'da değerlendir"
            theme={theme}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
          <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 66 }} />
          <SettingRow
            icon="📣"
            label="Arkadaşına Anlat"
            sublabel="Paylaş ve kazan"
            theme={theme}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="DESTEK" theme={theme}>
          <SettingRow
            icon="✉️"
            label="Bize Ulaş"
            sublabel="destek@kartoyunu.app"
            theme={theme}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
          <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 66 }} />
          <SettingRow
            icon="📄"
            label="Gizlilik Politikası"
            theme={theme}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
        </SettingsGroup>

        <Text style={s.version}>KartOyunu v1.0.0</Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: rs(20),
    paddingTop: rs(22),
    paddingBottom: rs(16),
  },
  headerTitle: {
    fontSize: rf(28),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  scroll: {
    paddingHorizontal: rs(16),
    paddingTop: rs(4),
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
});
