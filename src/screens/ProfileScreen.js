import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

export default function ProfileScreen({ navigate }) {
  const { theme, isDark } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { favorites } = useFavorites();

  const stats = [
    { value: favorites.length, label: 'Favori' },
    { value: '—', label: 'Oynanan' },
    { value: '—', label: 'Tamamlanan' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar & Name Placeholder */}
        <View style={s.profileTop}>
          <View style={s.avatarWrap}>
            <LinearGradient
              colors={isDark ? ['#2A2758', '#131340'] : ['#EDE9FF', '#D8D3EE']}
              style={s.avatar}
            >
              <Text style={s.avatarIcon}>◎</Text>
            </LinearGradient>
          </View>
          <Text style={s.guestName}>Misafir</Text>
          <Text style={s.guestSub}>Hesap oluşturarak ilerlemeni kaydet</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {stats.map((stat, i) => (
            <React.Fragment key={i}>
              <View style={s.statItem}>
                <Text style={[s.statValue, { color: theme.colors.primary }]}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
              {i < stats.length - 1 && <View style={s.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Auth CTA */}
        <View style={s.authCard}>
          <LinearGradient
            colors={isDark ? ['#1A1A52', '#0D0D28'] : ['#EDE9FF', '#F5F3FF']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={s.authTitle}>Hesabını Oluştur</Text>
          <Text style={s.authDesc}>
            Favorilerini ve istatistiklerini tüm cihazlarında sakla. Üyelik tamamen ücretsiz.
          </Text>

          <TouchableOpacity
            style={[s.authBtn, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.84}
            onPress={() => {}}
          >
            <Text style={s.authBtnText}>Üye Ol</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.loginBtn} onPress={() => {}} activeOpacity={0.7}>
            <Text style={[s.loginBtnText, { color: theme.colors.primary }]}>
              Zaten hesabım var → Giriş Yap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features list */}
        <View style={s.featureList}>
          {[
            { icon: '♥', text: 'Favori sorularını kaybet' },
            { icon: '📊', text: 'İstatistikleri takip et' },
            { icon: '🔄', text: 'Tüm cihazlarda senkronize' },
            { icon: '🔓', text: 'Premium destelere erişim' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={[s.featureText, { color: theme.colors.textSecondary }]}>{f.text}</Text>
            </View>
          ))}
        </View>

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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'stretch',
  },
  profileTop: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  avatarWrap: {
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  avatarIcon: {
    fontSize: 38,
    color: theme.colors.textMuted,
  },
  guestName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  guestSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  authCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  authDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  authBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  authBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
