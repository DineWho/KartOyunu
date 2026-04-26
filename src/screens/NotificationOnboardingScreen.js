import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { rs, rf } from '../utils/responsive';

export default function NotificationOnboardingScreen({ onFinish }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { requestPermission, setNotificationsEnabled, completeOnboarding } = useNotifications();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const handleAllow = async () => {
    const granted = await requestPermission();
    await setNotificationsEnabled(granted);
    await completeOnboarding();
    onFinish();
  };

  const handleSkip = async () => {
    await setNotificationsEnabled(false);
    await completeOnboarding();
    onFinish();
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.iconWrap}>
          <Text style={s.icon}>🔔</Text>
        </View>

        <Text style={s.title}>{t('notifOnboard.title')}</Text>

        <Text style={s.subtitle}>{t('notifOnboard.subtitle')}</Text>

        <View style={s.bullets}>
          <Bullet theme={theme} icon="✨" text={t('notifOnboard.bullet1')} />
          <Bullet theme={theme} icon="🎯" text={t('notifOnboard.bullet2')} />
          <Bullet theme={theme} icon="🔒" text={t('notifOnboard.bullet3')} />
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.primaryBtn} onPress={handleAllow} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>{t('notifOnboard.allow')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={s.secondaryBtnText}>{t('notifOnboard.later')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Bullet({ theme, icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(12), marginBottom: rs(14) }}>
      <View style={{
        width: rs(34), height: rs(34), borderRadius: rs(10),
        backgroundColor: theme.colors.surfaceElevated,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: rf(16) }}>{icon}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: rf(14), color: theme.colors.text, lineHeight: rf(20) }}>
        {text}
      </Text>
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: rs(24),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  iconWrap: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(22),
    backgroundColor: theme.colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(24),
  },
  icon: { fontSize: rf(38) },
  title: {
    fontSize: rf(28),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.6,
    marginBottom: rs(12),
  },
  subtitle: {
    fontSize: rf(15),
    color: theme.colors.textMuted,
    lineHeight: rf(22),
    marginBottom: rs(28),
  },
  bullets: {
    marginTop: rs(8),
  },
  actions: {
    paddingBottom: rs(20),
    gap: rs(10),
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: rs(14),
    paddingVertical: rs(16),
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: rf(16),
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: rs(14),
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.textMuted,
    fontSize: rf(15),
    fontWeight: '600',
  },
});
