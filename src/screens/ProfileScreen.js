import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  useWindowDimensions, Alert, Platform, UIManager, LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useStats } from '../context/StatsContext';
import { useBadges } from '../context/BadgesContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import ConfirmPanel from '../components/ConfirmPanel';
import Greeting from '../components/Greeting';
import { useUserProfile } from '../context/UserProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { useUpperT } from '../i18n/upper';
import { rs, rf } from '../utils/responsive';
import { GROUP_ORDER, useBadgeLabels } from '../data/badges';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function providerInfo(user, t) {
  const id = user?.providerData?.[0]?.providerId;
  switch (id) {
    case 'google.com': return { label: t('profile.providerGoogle'), icon: 'G', color: '#4285F4' };
    case 'apple.com':  return { label: t('profile.providerApple'), icon: 'A', color: '#111111' };
    case 'password':   return { label: t('profile.providerEmail'), icon: '@', color: null };
    default:           return null;
  }
}

function formatJoinDate(creationTime, language) {
  if (!creationTime) return null;
  try {
    const d = new Date(creationTime);
    return d.toLocaleDateString(language || undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const tu = useUpperT();
  const { width } = useWindowDimensions();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { getTotalStats, clearStats } = useStats();
  const { earnedIds, allBadges, clearBadges } = useBadges();
  const getBadgeLabels = useBadgeLabels();
  const { clearFavorites } = useFavorites();
  const { user, isAnonymous, signOut, deleteAccount } = useAuth();
  const { profile: userProfile } = useUserProfile();
  const { unreadCount } = useNotifications();
  const navigation = useNavigation();

  const [clearStatsVisible, setClearStatsVisible] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [badgesExpanded, setBadgesExpanded] = useState(false);

  const stats = getTotalStats();
  const cellWidth = (width - 40) / 4;

  const provider = !isAnonymous ? providerInfo(user, t) : null;
  const joinDate = !isAnonymous ? formatJoinDate(user?.metadata?.creationTime, i18n.language) : null;
  const displayName = user?.displayName || user?.email || t('profile.fallbackName');

  const badgeGroups = useMemo(() => {
    const map = {};
    allBadges.forEach(badge => {
      const labels = getBadgeLabels(badge);
      const entry = { ...badge, title: labels.title, desc: labels.desc };
      if (!map[badge.groupKey]) map[badge.groupKey] = { name: labels.group, badges: [] };
      map[badge.groupKey].badges.push(entry);
    });
    return GROUP_ORDER.filter(g => map[g]).map(g => map[g]);
  }, [allBadges, getBadgeLabels]);

  const statItems = [
    { value: stats.totalGames, label: t('profile.stats.games') },
    { value: stats.totalFavorited, label: t('profile.stats.favorites') },
    { value: stats.categoriesPlayed, label: t('profile.stats.categories') },
    { value: stats.modsPlayed, label: t('profile.stats.mods') },
    { value: stats.levelsPlayed, label: t('profile.stats.levels') },
    { value: stats.questionsShared, label: t('profile.stats.shared') },
  ];
  const hasStats = stats.totalCards > 0 || stats.questionsShared > 0;

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleClearStats = () => {
    clearStats();
    setClearStatsVisible(false);
    setTimeout(() => showToast(t('profile.confirm.statsResetToast')), 250);
  };

  const handleSignOut = async () => {
    setSignOutVisible(false);
    try { await signOut(); } catch {}
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountVisible(false);
    try {
      await deleteAccount();
      // Kullanıcıya ait tüm lokal verileri temizle — onIdTokenChanged sonrası
      // anonim sign-in tetiklenir ve ProfileScreen yeni state ile render olur.
      clearFavorites();
      clearStats();
      clearBadges();
    } catch (e) {
      if (e?.code === 'auth/requires-recent-login') {
        Alert.alert(
          t('profile.reauthTitle'),
          t('profile.reauthDesc'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('profile.reauthLogin'), onPress: async () => {
                try { await signOut(); } catch {}
                navigation.navigate('Login', { mode: 'login' });
              } },
          ]
        );
      } else {
        Alert.alert(t('profile.deleteFailedTitle'), t('profile.deleteFailedDesc'));
      }
    }
  };

  const toggleBadges = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBadgesExpanded(v => !v);
  };

  const memberAvatarColors = isDark ? ['#1E4D3A', '#0E2A1F'] : ['#D9F2E5', '#B8E5CC'];
  const guestAvatarColors  = isDark ? ['#2A2758', '#131340'] : ['#EDE9FF', '#D8D3EE'];

  return (
    <SafeAreaView style={s.container}>
      <ConfirmPanel
        visible={clearStatsVisible}
        onClose={() => setClearStatsVisible(false)}
        iconName="trash-2"
        iconColor={theme.colors.danger}
        stripColor={theme.colors.danger}
        title={t('profile.confirm.clearStatsTitle')}
        description={t('profile.confirm.clearStatsDesc')}
        confirmLabel={t('profile.confirm.clearStatsBtn')}
        confirmDanger
        onConfirm={handleClearStats}
      />

      <ConfirmPanel
        visible={signOutVisible}
        onClose={() => setSignOutVisible(false)}
        iconName="log-out"
        iconColor={theme.colors.primary}
        stripColor={theme.colors.primary}
        title={t('profile.confirm.signOutTitle')}
        description={t('profile.confirm.signOutDesc')}
        confirmLabel={t('profile.confirm.signOutBtn')}
        confirmDanger={false}
        onConfirm={handleSignOut}
      />

      <ConfirmPanel
        visible={deleteAccountVisible}
        onClose={() => setDeleteAccountVisible(false)}
        iconName="trash-2"
        iconColor={theme.colors.danger}
        stripColor={theme.colors.danger}
        title={t('profile.confirm.deleteTitle')}
        description={t('profile.confirm.deleteDesc')}
        confirmLabel={t('profile.confirm.deleteBtn')}
        confirmDanger
        onConfirm={handleDeleteAccount}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar & Name */}
        <View style={s.profileTop}>
          {!isAnonymous && <Greeting name={userProfile?.firstName} />}
          <View style={s.avatarWrap}>
            <LinearGradient
              colors={isAnonymous ? guestAvatarColors : memberAvatarColors}
              style={[s.avatar, !isAnonymous && { borderColor: theme.colors.success }]}
            >
              <Feather
                name={isAnonymous ? 'user' : 'check'}
                size={38}
                color={isAnonymous ? theme.colors.textMuted : theme.colors.success}
              />
            </LinearGradient>
            {!isAnonymous && (
              <View style={[s.memberChip, { backgroundColor: theme.colors.success }]}>
                <Text style={s.memberChipText}>{t('profile.memberBadge')}</Text>
              </View>
            )}
          </View>
          <Text style={s.guestName}>
            {isAnonymous ? t('profile.guest') : displayName}
          </Text>

          {isAnonymous ? (
            <Text style={s.guestSub}>{t('profile.guestSub')}</Text>
          ) : (
            <View style={s.memberMeta}>
              {provider && (
                <View style={[s.providerChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={[s.providerIconWrap, provider.color && { backgroundColor: provider.color + '18' }]}>
                    <Text style={[s.providerIcon, provider.color && { color: provider.color }]}>{provider.icon}</Text>
                  </View>
                  <Text style={[s.providerLabel, { color: theme.colors.textSecondary }]}>{provider.label}</Text>
                </View>
              )}
              {joinDate && (
                <Text style={[s.joinDate, { color: theme.colors.textMuted }]}>
                  {t('profile.memberSince', { date: joinDate })}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Stats + Badges (anonim için bulanık + lock overlay) */}
        <View style={s.lockableWrap}>
          <View style={isAnonymous ? s.lockedContent : null} pointerEvents={isAnonymous ? 'none' : 'auto'}>
            {/* Stats */}
            <View style={s.statsSection}>
              <Text style={s.sectionTitle}>{tu('profile.statsTitle')}</Text>
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
              {hasStats && !isAnonymous && (
                <TouchableOpacity
                  style={s.clearStatsBtn}
                  onPress={() => setClearStatsVisible(true)}
                  activeOpacity={0.72}
                >
                  <Text style={s.clearStatsText}>{t('profile.clearStats')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Badges (collapsible w/ peek) */}
            <View style={s.badgesSection}>
              <View style={s.badgesHeader}>
                <Text style={s.sectionTitle}>{tu('profile.badgesTitle')}</Text>
                <Text style={[s.badgesCount, { color: theme.colors.textMuted }]}>
                  {earnedIds.size} / {allBadges.length}
                </Text>
              </View>

              {/* Peek: ilk grubun ilk satırı her zaman görünür */}
              {!badgesExpanded && badgeGroups[0] && (
                <View style={s.badgeGroup}>
                  <Text style={s.badgeGroupTitle}>{badgeGroups[0].name}</Text>
                  <View style={s.badgeGrid}>
                    {badgeGroups[0].badges.slice(0, 4).map(badge => {
                      const earned = earnedIds.has(badge.id);
                      return (
                        <View key={badge.id} style={[s.badgeCell, { width: cellWidth }]}>
                          <View
                            style={[
                              s.badgeCircle,
                              earned
                                ? { backgroundColor: badge.color + '22', borderColor: badge.color + '66' }
                                : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                            ]}
                          >
                            <Feather
                              name={badge.icon}
                              size={20}
                              color={earned ? badge.color : theme.colors.textMuted}
                              style={!earned && { opacity: 0.35 }}
                            />
                          </View>
                          <Text
                            style={[
                              s.badgeCellLabel,
                              { color: earned ? theme.colors.text : theme.colors.textMuted },
                              !earned && { opacity: 0.4 },
                            ]}
                            numberOfLines={2}
                          >
                            {badge.title}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {badgesExpanded && badgeGroups.map(group => (
                <View key={group.name} style={s.badgeGroup}>
                  <Text style={s.badgeGroupTitle}>{group.name}</Text>
                  <View style={s.badgeGrid}>
                    {group.badges.map(badge => {
                      const earned = earnedIds.has(badge.id);
                      return (
                        <View key={badge.id} style={[s.badgeCell, { width: cellWidth }]}>
                          <View
                            style={[
                              s.badgeCircle,
                              earned
                                ? { backgroundColor: badge.color + '22', borderColor: badge.color + '66' }
                                : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                            ]}
                          >
                            <Feather
                              name={badge.icon}
                              size={20}
                              color={earned ? badge.color : theme.colors.textMuted}
                              style={!earned && { opacity: 0.35 }}
                            />
                          </View>
                          <Text
                            style={[
                              s.badgeCellLabel,
                              { color: earned ? theme.colors.text : theme.colors.textMuted },
                              !earned && { opacity: 0.4 },
                            ]}
                            numberOfLines={2}
                          >
                            {badge.title}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* Belirgin toggle butonu — tasarım dili olarak "devamı var" */}
              <TouchableOpacity
                style={[s.badgesToggle, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={toggleBadges}
                activeOpacity={0.72}
                disabled={isAnonymous}
              >
                <Text style={[s.badgesToggleText, { color: theme.colors.primary }]}>
                  {badgesExpanded ? t('profile.badgesCollapse') : t('profile.badgesShowAll', { count: allBadges.length })}
                </Text>
                <Feather
                  name={badgesExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {isAnonymous && (
            <TouchableOpacity
              style={s.lockOverlay}
              onPress={() => navigation.navigate('Login', { mode: 'register' })}
              activeOpacity={0.92}
            >
              <View style={[s.lockBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={[s.lockIconWrap, { backgroundColor: theme.colors.primary + '14', borderColor: theme.colors.primary + '38' }]}>
                  <Feather name="lock" size={22} color={theme.colors.primary} />
                </View>
                <Text style={[s.lockTitle, { color: theme.colors.text }]}>{t('profile.lockTitle')}</Text>
                <Text style={[s.lockCta, { color: theme.colors.primary }]}>{t('profile.lockCta')}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Auth CTA — yalnızca misafir kullanıcılara göster */}
        {isAnonymous && (
          <View style={s.authCard}>
            <LinearGradient
              colors={isDark ? ['#1A1A52', '#0D0D28'] : ['#EDE9FF', '#F5F3FF']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={s.authTitle}>{t('profile.createAccountTitle')}</Text>
            <Text style={s.authDesc}>
              {t('profile.createAccountDesc')}
            </Text>

            <TouchableOpacity
              style={[s.authBtn, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.84}
              onPress={() => navigation.navigate('Login', { mode: 'register' })}
            >
              <Text style={s.authBtnText}>{t('profile.register')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.loginBtn}
              onPress={() => navigation.navigate('Login', { mode: 'login' })}
              activeOpacity={0.7}
            >
              <Text style={[s.loginBtnText, { color: theme.colors.primary }]}>
                {t('profile.haveAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Features list — sadece misafir */}
        {isAnonymous && (
          <View style={s.featureList}>
            {[
              { icon: '♥', text: t('profile.feature.favorites') },
              { icon: '📊', text: t('profile.feature.stats') },
              { icon: '🔄', text: t('profile.feature.save') },
              { icon: '🔓', text: t('profile.feature.premium') },
            ].map((f, i) => (
              <View key={i} style={s.featureRow}>
                <Text style={s.featureIcon}>{f.icon}</Text>
                <Text style={[s.featureText, { color: theme.colors.textSecondary }]}>{f.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* HESAP — sadece üye */}
        {!isAnonymous && (
          <View style={s.accountSection}>
            <Text style={s.sectionTitle}>{tu('profile.accountTitle')}</Text>
            <View style={[s.accountGroup, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={s.accountRow}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.72}
              >
                <Feather name="bell" size={18} color={theme.colors.textSecondary} />
                <Text style={[s.accountRowText, { color: theme.colors.text, flex: 1 }]}>{t('profile.notifications')}</Text>
                {unreadCount > 0 && (
                  <View style={[s.unreadBadge, { backgroundColor: theme.colors.danger }]}>
                    <Text style={s.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
              <View style={[s.accountDivider, { backgroundColor: theme.colors.border }]} />
              <TouchableOpacity
                style={s.accountRow}
                onPress={() => navigation.navigate('AccountInfo')}
                activeOpacity={0.72}
              >
                <Feather name="user" size={18} color={theme.colors.textSecondary} />
                <Text style={[s.accountRowText, { color: theme.colors.text, flex: 1 }]}>{t('profile.accountInfo')}</Text>
                <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
              <View style={[s.accountDivider, { backgroundColor: theme.colors.border }]} />
              {hasStats && (
                <>
                  <TouchableOpacity
                    style={s.accountRow}
                    onPress={() => setClearStatsVisible(true)}
                    activeOpacity={0.72}
                  >
                    <Feather name="rotate-ccw" size={18} color={theme.colors.textSecondary} />
                    <Text style={[s.accountRowText, { color: theme.colors.text }]}>{t('profile.clearStats')}</Text>
                  </TouchableOpacity>
                  <View style={[s.accountDivider, { backgroundColor: theme.colors.border }]} />
                </>
              )}
              <TouchableOpacity
                style={s.accountRow}
                onPress={() => setSignOutVisible(true)}
                activeOpacity={0.72}
              >
                <Feather name="log-out" size={18} color={theme.colors.textSecondary} />
                <Text style={[s.accountRowText, { color: theme.colors.text }]}>{t('profile.signOut')}</Text>
              </TouchableOpacity>
              <View style={[s.accountDivider, { backgroundColor: theme.colors.border }]} />
              <TouchableOpacity
                style={s.accountRow}
                onPress={() => setDeleteAccountVisible(true)}
                activeOpacity={0.72}
              >
                <Feather name="trash-2" size={18} color={theme.colors.danger} />
                <Text style={[s.accountRowText, { color: theme.colors.danger }]}>{t('profile.deleteAccount')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
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
    paddingHorizontal: rs(20),
    paddingTop: rs(16),
    alignItems: 'stretch',
  },
  profileTop: {
    alignItems: 'center',
    marginBottom: rs(24),
    paddingTop: rs(8),
  },
  avatarWrap: {
    marginBottom: rs(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
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
  memberChip: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    paddingHorizontal: rs(10),
    paddingVertical: rs(3),
    borderRadius: rs(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  memberChipText: {
    fontSize: rf(10),
    fontWeight: '800',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  guestName: {
    fontSize: rf(22),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: rs(6),
    textAlign: 'center',
  },
  guestSub: {
    fontSize: rf(13),
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  memberMeta: {
    alignItems: 'center',
    gap: rs(8),
    marginTop: rs(2),
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    paddingVertical: rs(6),
    paddingHorizontal: rs(12),
    borderRadius: rs(20),
    borderWidth: 1,
  },
  providerIconWrap: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerIcon: {
    fontSize: rf(13),
    fontWeight: '800',
    color: theme.colors.textSecondary,
  },
  providerLabel: {
    fontSize: rf(13),
    fontWeight: '600',
  },
  joinDate: {
    fontSize: rf(12),
    fontWeight: '500',
  },
  lockableWrap: {
    position: 'relative',
    marginBottom: rs(8),
  },
  lockedContent: {
    opacity: 0.22,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(20),
  },
  lockBadge: {
    alignItems: 'center',
    paddingVertical: rs(20),
    paddingHorizontal: rs(24),
    borderRadius: rs(20),
    borderWidth: 1,
    maxWidth: rs(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  lockIconWrap: {
    width: rs(52),
    height: rs(52),
    borderRadius: rs(26),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: rs(12),
  },
  lockTitle: {
    fontSize: rf(15),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: rs(6),
    letterSpacing: -0.2,
  },
  lockCta: {
    fontSize: rf(14),
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: rs(12),
  },
  sectionTitle: {
    fontSize: rf(11),
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: rs(8),
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
    minHeight: rs(86),
    paddingHorizontal: rs(12),
    paddingVertical: rs(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: rf(22),
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: rs(4),
  },
  statLabel: {
    fontSize: rf(11),
    color: theme.colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: rf(15),
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
    minHeight: rs(44),
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    marginTop: rs(12),
    backgroundColor: theme.colors.surface,
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearStatsText: {
    fontSize: rf(13),
    fontWeight: '600',
    color: theme.colors.danger,
  },
  authCard: {
    borderRadius: rs(22),
    padding: rs(22),
    marginTop: rs(12),
    marginBottom: rs(20),
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  authTitle: {
    fontSize: rf(20),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
    marginBottom: rs(8),
  },
  authDesc: {
    fontSize: rf(14),
    color: theme.colors.textSecondary,
    lineHeight: rf(21),
    marginBottom: rs(20),
  },
  authBtn: {
    padding: rs(16),
    borderRadius: rs(14),
    alignItems: 'center',
    marginBottom: rs(12),
  },
  authBtnText: {
    fontSize: rf(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginBtn: {
    alignItems: 'center',
    paddingVertical: rs(6),
  },
  loginBtnText: {
    fontSize: rf(14),
    fontWeight: '600',
  },
  featureList: {
    gap: rs(12),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingHorizontal: 4,
  },
  featureIcon: {
    fontSize: rf(18),
    width: rs(28),
    textAlign: 'center',
  },
  featureText: {
    fontSize: rf(14),
    fontWeight: '500',
  },
  badgesSection: {
    marginBottom: 20,
  },
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(8),
    paddingVertical: rs(4),
  },
  badgesCount: {
    fontSize: rf(12),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  badgesToggle: {
    marginTop: rs(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    paddingVertical: rs(12),
    paddingHorizontal: rs(16),
    borderRadius: rs(14),
    borderWidth: 1,
  },
  badgesToggleText: {
    fontSize: rf(13),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badgeGroup: {
    marginBottom: 16,
  },
  badgeGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeCell: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeCellLabel: {
    fontSize: rf(9),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: rf(13),
    maxWidth: rs(56),
  },
  accountSection: {
    marginTop: rs(16),
    marginBottom: rs(20),
  },
  accountGroup: {
    borderRadius: rs(18),
    borderWidth: 1,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingVertical: rs(16),
    paddingHorizontal: rs(16),
  },
  accountRowText: {
    fontSize: rf(15),
    fontWeight: '600',
  },
  accountDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: rs(46),
  },
  unreadBadge: {
    minWidth: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    paddingHorizontal: rs(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(2),
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: rf(11),
    fontWeight: '800',
  },
});
