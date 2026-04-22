import React, { useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, PanResponder,
} from 'react-native';
import { categories } from '../data';
import { useTheme } from '../ThemeContext';

export default function DeckScreen({ navigate, deck }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const category = categories.find(c => c.id === deck.categoryId);
  const catColor = category?.color || theme.colors.primary;

  // Left-edge swipe → navigate back
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

  // Show only the count/short form — strip trailing "kişi"
  const peopleVal = deck.people.replace(/\s*kişi$/i, '');

  const stats = [
    { value: String(deck.cardCount), label: 'KART' },
    { value: deck.duration, label: 'SÜRE' },
    { value: peopleVal, label: 'KİŞİ' },
    { value: deck.level, label: 'SEVİYE' },
  ];

  return (
    <SafeAreaView style={s.container} {...panResponder.panHandlers}>
      {/* Colored Header — no overlay */}
      <View style={[s.header, { backgroundColor: catColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigate('home')}>
          <Text style={s.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerEmoji}>{deck.emoji}</Text>
        <Text style={s.headerTitle}>{deck.title}</Text>
        <TouchableOpacity style={s.categoryPill} onPress={() => navigate('category', { category })}>
          <Text style={s.categoryPillText}>{category?.icon}  {category?.name}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>

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
              <View style={s.premiumIconWrap}>
                <Text style={s.premiumIconEmoji}>🔒</Text>
              </View>
              <Text style={s.premiumTitle}>Premium Deste</Text>
              <Text style={s.premiumDesc}>
                Bu desteye erişmek için Premium'a geç. Tüm premium destelere sınırsız erişim.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[
            s.startButton,
            deck.isPremium ? s.startButtonLocked : { backgroundColor: catColor },
          ]}
          onPress={handleStart}
          activeOpacity={deck.isPremium ? 1 : 0.86}
        >
          <Text style={deck.isPremium ? s.startButtonTextLocked : s.startButtonText}>
            {deck.isPremium ? '🔒   Premium Gerekli' : 'Başlat  →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryPillText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
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
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  premiumBox: {
    backgroundColor: theme.isDark ? '#181000' : '#FFFBEB',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D4A84340',
    alignItems: 'center',
  },
  premiumIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.isDark ? '#2A1C00' : '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  premiumIconEmoji: {
    fontSize: 28,
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
