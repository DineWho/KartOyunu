import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Switch,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { useStats } from '../context/StatsContext';

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
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rowSublabel: {
    fontSize: 12,
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
  const { getTotalStats, clearStats } = useStats();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const stats = getTotalStats();

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
        </SettingsGroup>

        <SettingsGroup title="İSTATİSTİKLER" theme={theme}>
          <View style={s.statsGrid}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{stats.totalCards}</Text>
              <Text style={[s.statLabel, { color: theme.colors.textMuted }]}>Kart Oynanmış</Text>
            </View>
            <View style={[s.statItem, { borderLeftWidth: 1, borderLeftColor: theme.colors.border }]}>
              <Text style={s.statValue}>{stats.totalFavorited}</Text>
              <Text style={[s.statLabel, { color: theme.colors.textMuted }]}>Favori</Text>
            </View>
            <View style={[s.statItem, { borderLeftWidth: 1, borderLeftColor: theme.colors.border }]}>
              <Text style={s.statValue}>{stats.modsPlayed}</Text>
              <Text style={[s.statLabel, { color: theme.colors.textMuted }]}>Mod Oynanmış</Text>
            </View>
          </View>
          {stats.totalCards > 0 && (
            <View style={[s.statsFooter, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity onPress={clearStats} activeOpacity={0.7}>
                <Text style={[s.clearStatsText, { color: '#E74C3C' }]}>İstatistikleri Sıfırla</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
  },
  statsFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearStatsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
});
