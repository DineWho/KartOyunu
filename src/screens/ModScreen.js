import React, { useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { categories, useLocalize } from '../data';
import { useTheme } from '../ThemeContext';
import { useUpperT } from '../i18n/upper';
import { rs, rf } from '../utils/responsive';

export default function ModScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mod } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const tu = useUpperT();
  const localize = useLocalize();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const category = categories.find(c => c.id === mod.categoryId);
  const catColor = category?.color || theme.colors.primary;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.spring(sheetAnim, {
        toValue: 0,
        friction: 10,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = () => {
    if (mod.isPremium) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Cards', { mod });
  };

  // Strip trailing unit (e.g. " kişi", " people", " Personen", " человек") so the stat box
  // shows just the numeric range with the localized "PEOPLE" label below.
  const peopleVal = String(localize(mod.people)).replace(/\s+\D+$/u, '').trim();
  const durationVal = String(localize(mod.duration)).replace(/\s+\D+$/u, '').trim();

  const stats = [
    { value: String(mod.cardCount), label: tu('mod.section.card') },
    { value: durationVal, label: tu('mod.section.duration') },
    { value: peopleVal, label: tu('mod.section.people') },
    { value: localize(mod.level), label: tu('mod.section.level') },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: catColor }]}>

      <Animated.View style={[s.header, { opacity: headerAnim }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={s.backBtnText}>{t('mod.back')}</Text>
        </TouchableOpacity>
        <Text style={s.headerEmoji}>{mod.emoji}</Text>
        <Text style={s.headerTitle}>{localize(mod.title)}</Text>
        <TouchableOpacity
          style={s.categoryPill}
          onPress={() => navigation.navigate('Category', { category })}
          activeOpacity={0.8}
        >
          <Text style={s.categoryPillText}>{category?.icon}  {localize(category?.name)}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[s.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={s.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

          <View style={s.statsRow}>
            {stats.map((stat, i) => (
              <React.Fragment key={i}>
                <View style={s.statItem}>
                  <Text style={[s.statValue, { color: catColor }]}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
                {i < stats.length - 1 && <View style={s.statDivider} />}
              </React.Fragment>
            ))}
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>{tu('mod.section.about')}</Text>
            <Text style={s.description}>{localize(mod.description)}</Text>
          </View>

          {!!localize(mod.expectation) && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>{tu('mod.section.expectation')}</Text>
              <View style={[s.quoteCard, { borderLeftColor: catColor }]}>
                <Text style={[s.quoteChar, { color: catColor }]}>"</Text>
                <Text style={s.quoteText}>{localize(mod.expectation)}</Text>
              </View>
            </View>
          )}

          {mod.isPremium && (
            <View style={s.section}>
              <View style={s.premiumBox}>
                <LinearGradient
                  colors={['#2A1C00', '#1A1000']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.premiumIconWrap}>
                  <Feather name="lock" size={26} color="#D4A843" />
                </View>
                <Text style={s.premiumTitle}>{t('mod.premiumTitle')}</Text>
                <Text style={s.premiumDesc}>{t('mod.premiumDesc')}</Text>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity onPress={handleStart} activeOpacity={mod.isPremium ? 1 : 0.84}>
            {mod.isPremium ? (
              <View style={[s.startButton, s.startButtonLocked]}>
                <Feather name="lock" size={17} color={theme.colors.textMuted} />
                <Text style={s.startButtonTextLocked}>{t('mod.premiumRequired')}</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[catColor, catColor + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.startButton}
              >
                <Text style={s.startButtonText}>{t('mod.start')}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: rs(20),
    paddingTop: rs(6),
    paddingBottom: rs(24),
  },
  backBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: rs(6),
    marginBottom: rs(22),
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: rs(20),
    paddingHorizontal: rs(14),
    paddingVertical: rs(9),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: rf(14),
    fontWeight: '600',
  },
  headerEmoji: {
    fontSize: rf(52),
    marginBottom: rs(10),
  },
  headerTitle: {
    fontSize: rf(32),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: rs(14),
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  categoryPillText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  sheet: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  scrollContent: {
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: rs(20),
    marginTop: rs(16),
    borderRadius: rs(20),
    padding: rs(18),
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.4 : 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: rf(16),
    fontWeight: '800',
    marginBottom: rs(4),
  },
  statLabel: {
    fontSize: rf(10),
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: rs(20),
    marginTop: rs(24),
  },
  sectionLabel: {
    fontSize: rf(10),
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1.8,
    marginBottom: rs(10),
  },
  description: {
    fontSize: rf(15),
    color: theme.colors.textSecondary,
    lineHeight: rf(24),
  },
  quoteCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: rs(18),
    padding: rs(18),
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteChar: {
    fontSize: rf(40),
    lineHeight: rf(40),
    fontWeight: '800',
    marginBottom: rs(4),
  },
  quoteText: {
    fontSize: rf(15),
    color: theme.colors.text,
    lineHeight: rf(24),
    fontStyle: 'italic',
  },
  premiumBox: {
    borderRadius: rs(20),
    padding: rs(24),
    borderWidth: 1,
    borderColor: '#D4A84340',
    alignItems: 'center',
    overflow: 'hidden',
  },
  premiumIconWrap: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    backgroundColor: 'rgba(212,168,67,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(14),
  },
  premiumTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: '#D4A843',
    marginBottom: rs(8),
    letterSpacing: -0.2,
  },
  premiumDesc: {
    fontSize: rf(14),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: rf(21),
  },
  footer: {
    padding: rs(20),
    paddingBottom: rs(32),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  startButton: {
    borderRadius: rs(18),
    padding: rs(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: rs(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonLocked: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  startButtonText: {
    fontSize: rf(17),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  startButtonTextLocked: {
    fontSize: rf(17),
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
});
