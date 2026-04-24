import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useStats } from '../context/StatsContext';

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { getTotalStats, clearStats } = useStats();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const stats = getTotalStats();

  const statItems = [
    { value: stats.totalGames, label: 'Oyun Oynanmış' },
    { value: stats.totalFavorited, label: 'Favori' },
    { value: stats.categoriesPlayed, label: 'Kategori Oynanmış' },
    { value: stats.modsPlayed, label: 'Mod Oynanmış' },
    { value: stats.levelsPlayed, label: 'Seviye Oynanmış' },
    { value: stats.questionsShared, label: 'Soru Paylaşılmış' },
  ];
  const hasStats = stats.totalCards > 0 || stats.questionsShared > 0;

  const handleConfirmClear = () => {
    clearStats();
    setConfirmVisible(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={s.confirmOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setConfirmVisible(false)}
          />
          <View style={s.confirmPanel}>
            <View style={s.confirmIconWrap}>
              <Feather name="alert-triangle" size={22} color={theme.colors.danger} />
            </View>
            <Text style={s.confirmTitle}>İstatistikler sıfırlansın mı?</Text>
            <Text style={s.confirmDesc}>
              Bu işlem oyun, favori ve paylaşım istatistiklerini temizler. Geri alınamaz.
            </Text>
            <View style={s.confirmActions}>
              <TouchableOpacity
                style={[s.confirmBtn, s.cancelBtn]}
                onPress={() => setConfirmVisible(false)}
                activeOpacity={0.75}
              >
                <Text style={s.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, s.dangerBtn]}
                onPress={handleConfirmClear}
                activeOpacity={0.82}
              >
                <Feather name="trash-2" size={16} color="#FFFFFF" />
                <Text style={s.dangerBtnText}>Sıfırla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
        <View style={s.statsSection}>
          <Text style={s.sectionTitle}>İSTATİSTİKLER</Text>
          <View style={s.statsGrid}>
            {statItems.map((stat, i) => (
              <View
                key={stat.label}
                style={[
                  s.statCell,
                  i % 2 === 1 && s.statCellLeftBorder,
                  i > 1 && s.statCellTopBorder,
                ]}
              >
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          {hasStats && (
            <TouchableOpacity
              style={s.clearStatsBtn}
              onPress={() => setConfirmVisible(true)}
              activeOpacity={0.72}
            >
              <Text style={s.clearStatsText}>İstatistikleri Sıfırla</Text>
            </TouchableOpacity>
          )}
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
            { icon: '♥', text: 'Favori sorularını kaydet' },
            { icon: '📊', text: 'İstatistikleri takip et' },
            { icon: '🔄', text: 'Tüm cihazlarda senkronize' },
            { icon: '🔓', text: 'Premium modlara erişim' },
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7,7,26,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confirmPanel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: theme.isDark ? 0.38 : 0.16,
    shadowRadius: 28,
    elevation: 18,
  },
  confirmIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.danger + '18',
    borderWidth: 1,
    borderColor: theme.colors.danger + '33',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  cancelBtn: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dangerBtn: {
    backgroundColor: theme.colors.danger,
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCell: {
    width: '50%',
    minHeight: 86,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  statCellLeftBorder: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  statCellTopBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  clearStatsBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearStatsText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.danger,
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
