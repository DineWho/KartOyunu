import React, { useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, PanResponder,
} from 'react-native';
import { decks } from '../data';
import { useTheme } from '../ThemeContext';

export default function CategoryScreen({ navigate, category }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const catColor = category.color;
  const categoryDecks = decks.filter(d => d.categoryId === category.id);
  const freeCount = categoryDecks.filter(d => !d.isPremium).length;

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

  return (
    <SafeAreaView style={s.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: catColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigate('home')}>
          <Text style={s.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerIcon}>{category.icon}</Text>
        <Text style={s.headerTitle}>{category.name}</Text>
        <Text style={s.headerSub}>
          {categoryDecks.length} deste  ·  {freeCount} ücretsiz
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.deckList}>
          {categoryDecks.map(deck => (
            <TouchableOpacity
              key={deck.id}
              style={s.deckItem}
              onPress={() => navigate('deck', { deck })}
              activeOpacity={0.72}
            >
              <View style={[s.deckAccentBar, { backgroundColor: catColor }]} />
              <View style={[s.deckItemIcon, { backgroundColor: catColor + '20' }]}>
                <Text style={s.deckItemEmoji}>{deck.emoji}</Text>
              </View>
              <View style={s.deckItemContent}>
                <View style={s.deckItemRow}>
                  <Text style={s.deckItemTitle}>{deck.title}</Text>
                  {deck.isPremium && (
                    <View style={s.proBadge}>
                      <Text style={s.proText}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={s.deckItemDesc} numberOfLines={2}>{deck.description}</Text>
                <View style={s.deckItemStats}>
                  <Text style={s.deckItemStat}>{deck.cardCount} kart</Text>
                  <Text style={s.deckItemStatDot}>·</Text>
                  <Text style={s.deckItemStat}>{deck.duration}</Text>
                  <Text style={s.deckItemStatDot}>·</Text>
                  <Text style={s.deckItemStat}>{deck.level}</Text>
                </View>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
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
  headerIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  deckList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  deckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    paddingLeft: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  deckAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  deckItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckItemEmoji: {
    fontSize: 24,
  },
  deckItemContent: {
    flex: 1,
  },
  deckItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  deckItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.1,
  },
  proBadge: {
    backgroundColor: '#D4A843',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  proText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1000',
    letterSpacing: 0.5,
  },
  deckItemDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    lineHeight: 17,
  },
  deckItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deckItemStat: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  deckItemStatDot: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.textMuted,
    marginRight: 2,
  },
});
