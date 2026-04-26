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
  const { permissionGranted, requestPermission } = useNotifications();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const handleNotificationsPress = async () => {
    if (permissionGranted) {
      Alert.alert(
        'Bildirimler',
        'Bildirimler zaten açık. Kapatmak için sistem ayarlarına gidebilirsin.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'İzin Reddedildi',
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

        <SettingsGroup title="TERCİHLER" theme={theme}>
          <ThemeSelector theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} />
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
          <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 66 }} />
          <SettingRow
            icon="🔔"
            label="Bildirimler"
            sublabel={permissionGranted ? 'Açık' : 'Kapalı — yeni paketler ve hatırlatıcılar'}
            theme={theme}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={handleNotificationsPress}
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
            onPress={openReview}
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
            sublabel="destek@cardwho.app"
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
