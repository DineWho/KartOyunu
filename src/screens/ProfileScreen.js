import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useStats } from '../context/StatsContext';
import Toast from '../components/Toast';

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { getTotalStats, clearStats } = useStats();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stats = getTotalStats();

  useEffect(() => {
    if (confirmVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 14, tension: 90, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      fadeAnim.setValue(0);
    }
  }, [confirmVisible]);

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
    setTimeout(() => setToastVisible(true), 250);
  };

  return (
    <SafeAreaView style={s.container}>
      <Modal
        visible={confirmVisible}
        transparent
        animationType="none"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Animated.View style={[s.confirmOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setConfirmVisible(false)}
          />
          <Animated.View style={[s.confirmPanel, { transform: [{ scale: scaleAnim }] }]}>
            {/* Danger top strip */}
            <View style={[s.confirmTopStrip, { backgroundColor: theme.colors.danger }]} />

            {/* Icon */}
            <View style={[s.confirmIconWrap, {
              backgroundColor: theme.colors.danger + '14',
              borderColor: theme.colors.danger + '38',
            }]}>
              <Feather name="trash-2" size={26} color={theme.colors.danger} />
            </View>

            <Text style={s.confirmTitle}>İstatistikleri Sıfırla</Text>
            <Text style={s.confirmDesc}>
              İstatistiklerinizin tamamı silinecek.{'\n\n'}Bu işlem geri alınamaz.
            </Text>

            {/* Danger action — on top */}
            <TouchableOpacity
              style={[s.confirmBtn, s.dangerBtn]}
              onPress={handleConfirmClear}
              activeOpacity={0.82}
            >
              <Feather name="trash-2" size={16} color="#FFFFFF" />
              <Text style={s.dangerBtnText}>Evet, Sıfırla</Text>
            </TouchableOpacity>

            {/* Cancel — below */}
            <TouchableOpacity
              style={[s.confirmBtn, s.cancelBtn, { borderColor: theme.colors.borderLight }]}
              onPress={() => setConfirmVisible(false)}
              activeOpacity={0.72}
            >
              <Text style={[s.cancelBtnText, { color: theme.colors.textSecondary }]}>Vazgeç</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
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

      <Toast
        visible={toastVisible}
        message="İstatistikler sıfırlandı"
        onHide={() => setToastVisible(false)}
      />
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
    backgroundColor: 'rgba(7,7,26,0.78)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  confirmPanel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: theme.isDark ? 0.45 : 0.18,
    shadowRadius: 36,
    elevation: 22,
  },
  confirmTopStrip: {
    height: 4,
    marginHorizontal: -22,
    marginBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  confirmIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 18,
  },
  confirmTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  confirmDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmBtn: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    marginBottom: 0,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dangerBtn: {
    backgroundColor: theme.colors.danger,
  },
  dangerBtnText: {
    fontSize: 15,
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
