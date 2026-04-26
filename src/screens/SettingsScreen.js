import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Switch,
} from 'react-native';
import { Linking, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAudio } from '../context/AudioContext';
import { useNotifications } from '../context/NotificationContext';
import { rs, rf } from '../utils/responsive';
import { openReview } from '../utils/reviewManager';
import SettingsRow, { SettingsRowDivider } from '../components/SettingsRow';
import SettingsGroup from '../components/SettingsGroup';

function ThemeSelector({ theme, themeMode, setThemeMode }) {
  const options = [
    { value: 'system', label: 'Sistem', icon: '⚙' },
    { value: 'light', label: 'Açık', icon: '☀' },
    { value: 'dark', label: 'Koyu', icon: '☽' },
  ];

  const currentIcon = '🎨';

  return (
    <View style={{ paddingHorizontal: rs(16), paddingTop: rs(13), paddingBottom: rs(12), gap: rs(10) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(12) }}>
        <View style={{
          width: rs(38), height: rs(38), borderRadius: rs(11),
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: theme.colors.surfaceElevated,
        }}>
          <Text style={{ fontSize: rf(18) }}>{currentIcon}</Text>
        </View>
        <Text style={{ fontSize: rf(15), fontWeight: '600', color: theme.colors.text }}>Tema</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: rs(6) }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setThemeMode(opt.value)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: rs(8),
              borderRadius: rs(10),
              alignItems: 'center',
              backgroundColor: themeMode === opt.value ? theme.colors.primary : theme.colors.surfaceElevated,
            }}
          >
            <Text style={{ fontSize: rf(13), fontWeight: '600', color: themeMode === opt.value ? '#fff' : theme.colors.textMuted }}>
              {opt.icon} {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { soundEnabled, toggleSound } = useAudio();
  const { notificationsEnabled, permissionGranted, toggleNotifications } = useNotifications();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const handleNotificationsToggle = async () => {
    const wasEnabled = notificationsEnabled;
    const result = await toggleNotifications();
    if (!wasEnabled && !result && !permissionGranted) {
      Alert.alert(
        'İzin Gerekli',
        'Bildirim göndermek için izin gerekli. Sistem ayarlarından açabilirsin.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <SettingsGroup title="TERCİHLER">
          <ThemeSelector theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} />
          <SettingsRowDivider />
          <SettingsRow
            icon={soundEnabled ? '🔊' : '🔇'}
            label="Ses Efektleri"
            sublabel={soundEnabled ? 'Açık' : 'Kapalı'}
            right={
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '88' }}
                thumbColor={soundEnabled ? theme.colors.primary : theme.colors.textMuted}
              />
            }
          />
          <SettingsRowDivider />
          <SettingsRow
            icon={notificationsEnabled ? '🔔' : '🔕'}
            label="Bildirimler"
            sublabel={notificationsEnabled ? 'Açık' : 'Kapalı'}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '88' }}
                thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.textMuted}
              />
            }
          />
        </SettingsGroup>

        <SettingsGroup title="UYGULAMA">
          <SettingsRow
            icon="🎯"
            label="Nasıl Oynanır?"
            sublabel="Kısa rehber"
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
          <SettingsRowDivider />
          <SettingsRow
            icon="⭐"
            label="Uygulamayı Oyla"
            sublabel="App Store'da değerlendir"
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={openReview}
          />
          <SettingsRowDivider />
          <SettingsRow
            icon="📣"
            label="Arkadaşına Anlat"
            sublabel="Paylaş ve kazan"
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="DESTEK">
          <SettingsRow
            icon="✉️"
            label="Bize Ulaş"
            sublabel="destek@cardwho.app"
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
          <SettingsRowDivider />
          <SettingsRow
            icon="📄"
            label="Gizlilik Politikası"
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
        </SettingsGroup>

        <Text style={s.version}>CardWho v1.0.0</Text>

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
