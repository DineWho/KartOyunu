import React, { useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, PanResponder, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { categories } from '../data';
import { useTheme } from '../ThemeContext';

export default function DeckScreen({ navigate, deck }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const category = categories.find(c => c.id === deck.categoryId);
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

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
      return (
        evt.nativeEvent.pageX < 22 &&
        gestureState.dx > 10 &&
        Math.abs(gestureState.dy) < Math.abs(gestureState.dx)
      );
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 60) navigate('home');
    },
  })).current;

  const handleStart = () => {
    if (deck.isPremium) return;
    navigate('cards', { deck });
  };

  const peopleVal = deck.people.replace(/\s*kişi$/i, '');

  const stats = [
    { value: String(deck.cardCount), label: 'KART' },
    { value: deck.duration, label: 'SÜRE' },
    { value: peopleVal, label: 'KİŞİ' },
    { value: deck.level, label: 'SEVİYE' },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: catColor }]} {...panResponder.panHandlers}>

      {/* Header — solid catColor, no gradient */}
      <Animated.View style={[s.header, { opacity: headerAnim }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigate('home')} activeOpacity={0.8}>
          <Feather name="arrow-left" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={s.backBtnText}>Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerEmoji}>{deck.emoji}</Text>
        <Text style={s.headerTitle}>{deck.title}</Text>
        <TouchableOpacity
          style={s.categoryPill}
          onPress={() => navigate('category', { category })}
          activeOpacity={0.8}
        >
          <Text style={s.categoryPillText}>{category?.icon}  {category?.name}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Content Sheet — slides up from below, rounded top */}
      <Animated.View style={[s.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={s.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

          {/* Stats Row */}
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

          {/* Description */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>HAKKINDA</Text>
            <Text style={s.description}>{deck.description}</Text>
          </View>

          {/* Quote Preview */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>NE BEKLEMELİ?</Text>
            <View style={[s.quoteCard, { borderLeftColor: catColor }]}>
              <Text style={[s.quoteChar, { color: catColor }]}>"</Text>
              <Text style={s.quoteText}>
                Bu deste sizi gerçekten konuşturacak. Her soru bir sonrakini açar, sessizlik yok.
              </Text>
            </View>
          </View>

          {/* Premium Notice */}
          {deck.isPremium && (
            <View style={s.section}>
              <View style={s.premiumBox}>
                <LinearGradient
                  colors={['#2A1C00', '#1A1000']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.premiumIconWrap}>
                  <Feather name="lock" size={26} color="#D4A843" />
                </View>
                <Text style={s.premiumTitle}>Premium Deste</Text>
                <Text style={s.premiumDesc}>
                  Bu desteye erişmek için Premium'a geç. Tüm premium destelere sınırsız erişim.
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Footer CTA */}
        <View style={s.footer}>
          <TouchableOpacity onPress={handleStart} activeOpacity={deck.isPremium ? 1 : 0.84}>
            {deck.isPremium ? (
              <View style={[s.startButton, s.startButtonLocked]}>
                <Feather name="lock" size={17} color={theme.colors.textMuted} />
                <Text style={s.startButtonTextLocked}>Premium Gerekli</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[catColor, catColor + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.startButton}
              >
                <Text style={s.startButtonText}>Başlat  →</Text>
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
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    marginBottom: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '600',
  },
  headerEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 14,
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

  /* Sheet */
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

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
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
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },

  /* Sections */
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  quoteCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 18,
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
    fontSize: 40,
    lineHeight: 40,
    fontWeight: '800',
    marginBottom: 4,
  },
  quoteText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  /* Premium */
  premiumBox: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D4A84340',
    alignItems: 'center',
    overflow: 'hidden',
  },
  premiumIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212,168,67,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D4A843',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  premiumDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },

  /* Footer */
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  startButton: {
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  startButtonTextLocked: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
});
