import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Switch, Modal, FlatList, Animated,
} from 'react-native';
import { Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useAudio } from '../context/AudioContext';
import { useNotifications } from '../context/NotificationContext';
import { rs, rf } from '../utils/responsive';
import { openReview } from '../utils/reviewManager';
import SettingsRow, { SettingsRowDivider } from '../components/SettingsRow';
import SettingsGroup from '../components/SettingsGroup';
import SheetHandle, { useDismissibleSheet } from '../components/SheetHandle';
import { setLanguage, SUPPORTED_LANGUAGES, LANGUAGE_META } from '../i18n';
import { useUpperT } from '../i18n/upper';

function ThemeSelector({ theme, themeMode, setThemeMode, t }) {
  const options = [
    { value: 'system', label: t('settings.theme.system'), icon: '⚙' },
    { value: 'light', label: t('settings.theme.light'), icon: '☀' },
    { value: 'dark', label: t('settings.theme.dark'), icon: '☽' },
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
        <Text style={{ fontSize: rf(15), fontWeight: '600', color: theme.colors.text }}>{t('settings.themeLabel')}</Text>
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

function LanguagePickerModal({ visible, current, onClose, onSelect, t, theme }) {
  const s = useMemo(() => makePickerStyles(theme), [theme]);
  const { mounted, panHandlers, animatedStyle, overlayStyle, requestClose } = useDismissibleSheet(visible, onClose);
  const insets = useSafeAreaInsets();

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={requestClose} statusBarTranslucent>
      <Animated.View style={[s.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={requestClose} activeOpacity={1} />
        <Animated.View style={[s.sheet, { paddingBottom: rs(20) + insets.bottom }, animatedStyle]}>
          <SheetHandle panHandlers={panHandlers} />
          <View style={s.titleRow}>
            <Text style={s.title}>{t('settings.languagePickerTitle')}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={requestClose} activeOpacity={0.7}>
              <Feather name="x" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={SUPPORTED_LANGUAGES}
            keyExtractor={(code) => code}
            renderItem={({ item }) => {
              const sel = item === current;
              const meta = LANGUAGE_META[item] || { native: item, flags: [] };
              return (
                <TouchableOpacity
                  onPress={() => onSelect(item)}
                  activeOpacity={0.72}
                  style={[s.row, sel && { backgroundColor: theme.colors.primary + '14' }]}
                >
                  <View style={s.rowLabel}>
                    <Text style={[s.rowText, { color: theme.colors.text }, sel && { fontWeight: '700' }]}>
                      {meta.native}
                    </Text>
                    <Text style={s.flag}>{meta.flags.join(' ')}</Text>
                  </View>
                  {sel ? <Feather name="check" size={18} color={theme.colors.primary} /> : null}
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { t, i18n } = useTranslation();
  const tu = useUpperT();
  const { soundEnabled, toggleSound } = useAudio();
  const { notificationsEnabled, permissionGranted, toggleNotifications, fcmToken } = useNotifications();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);

  const handleNotificationsToggle = async () => {
    const wasEnabled = notificationsEnabled;
    const result = await toggleNotifications();
    if (!wasEnabled && !result && !permissionGranted) {
      Alert.alert(
        t('settings.notificationPermissionTitle'),
        t('settings.notificationPermissionDesc'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('settings.openSettings'), onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleLanguageSelect = async (code) => {
    setLanguagePickerVisible(false);
    if (code !== i18n.language) {
      await setLanguage(code);
    }
  };

  const currentLanguageLabel = t(`languages.${i18n.language}`, { defaultValue: i18n.language });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <SettingsGroup title={tu('settings.preferencesGroup')}>
          <ThemeSelector theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} t={t} />
          <SettingsRowDivider />
          <SettingsRow
            icon={soundEnabled ? '🔊' : '🔇'}
            label={t('settings.soundLabel')}
            sublabel={soundEnabled ? t('settings.on') : t('settings.off')}
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
            label={t('settings.notificationsLabel')}
            sublabel={notificationsEnabled ? t('settings.on') : t('settings.off')}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '88' }}
                thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.textMuted}
              />
            }
          />
          <SettingsRowDivider />
          <SettingsRow
            icon="🌐"
            label={t('settings.languageLabel')}
            sublabel={currentLanguageLabel}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => setLanguagePickerVisible(true)}
          />
        </SettingsGroup>

        <SettingsGroup title={tu('settings.appGroup')}>
          <SettingsRow
            icon="🎯"
            label={t('settings.howToPlay')}
            sublabel={t('settings.howToPlaySub')}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
          <SettingsRowDivider />
          <SettingsRow
            icon="⭐"
            label={t('settings.rateApp')}
            sublabel={t('settings.rateAppSub')}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={openReview}
          />
          <SettingsRowDivider />
          <SettingsRow
            icon="📣"
            label={t('settings.tellFriend')}
            sublabel={t('settings.tellFriendSub')}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title={tu('settings.supportGroup')}>
          <SettingsRow
            icon="✉️"
            label={t('settings.contact')}
            sublabel={t('settings.contactSub')}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
          <SettingsRowDivider />
          <SettingsRow
            icon="📄"
            label={t('settings.privacy')}
            right={<Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
            onPress={() => {}}
          />
        </SettingsGroup>

        {__DEV__ && fcmToken && (
          <View style={s.debugBox}>
            <Text style={s.debugLabel}>{t('settings.fcmTokenLabel')}</Text>
            <Text selectable style={s.debugValue}>{fcmToken}</Text>
            <Text style={s.debugHint}>
              {t('settings.fcmTokenHint')}
            </Text>
          </View>
        )}

        <Text style={s.version}>{t('settings.version', { version: '1.0.0' })}</Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      <LanguagePickerModal
        visible={languagePickerVisible}
        current={i18n.language}
        onClose={() => setLanguagePickerVisible(false)}
        onSelect={handleLanguageSelect}
        t={t}
        theme={theme}
      />
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
  debugBox: {
    marginTop: rs(20),
    marginBottom: rs(16),
    padding: rs(14),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
  },
  debugLabel: {
    fontSize: rf(11),
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: rs(8),
  },
  debugValue: {
    fontSize: rf(11),
    fontFamily: 'Courier',
    color: theme.colors.text,
    marginBottom: rs(8),
  },
  debugHint: {
    fontSize: rf(11),
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});

const makePickerStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,7,26,0.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: rs(22),
    borderTopRightRadius: rs(22),
    paddingHorizontal: rs(20),
    paddingTop: 0,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '60%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(16),
  },
  title: {
    fontSize: rf(17),
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  closeBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(14),
    paddingVertical: rs(14),
    borderRadius: rs(10),
    marginBottom: rs(2),
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  flag: {
    fontSize: rf(20),
  },
  rowText: {
    fontSize: rf(15),
  },
});
