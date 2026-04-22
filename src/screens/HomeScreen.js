import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions,
} from 'react-native';
import { categories, decks } from '../data';
import { useTheme } from '../ThemeContext';

const { width } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = width * 0.58;

export default function HomeScreen({ navigate }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredDecks = selectedCategory
    ? decks.filter(d => d.categoryId === selectedCategory)
    : decks;

  const featuredDecks = decks.filter(d => !d.isPremium);

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : theme.colors.primary;
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.appTitle}>KartOyunu</Text>
            <Text style={s.tagline}>Sessizliği bitiren desteler</Text>
          </View>
          <TouchableOpacity style={s.themeToggle} onPress={toggleTheme}>
            <Text style={s.themeToggleIcon}>{isDark ? '☀' : '☽'}</Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryScroll}
        >
          <TouchableOpacity
            style={[s.pill, !selectedCategory && s.pillActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[s.pillText, !selectedCategory && s.pillTextActive]}>Tümü</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                s.pill,
                selectedCategory === cat.id && {
                  backgroundColor: cat.color + '20',
                  borderColor: cat.color,
                },
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <Text style={[
                s.pillText,
                selectedCategory === cat.id && { color: cat.color, fontWeight: '600' },
              ]}>
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        {!selectedCategory && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Öne Çıkanlar</Text>
              <View style={s.sectionLine} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.featuredScroll}
            >
              {featuredDecks.map(deck => {
                const catColor = getCategoryColor(deck.categoryId);
                return (
                  <TouchableOpacity
                    key={deck.id}
                    style={[s.featuredCard, { backgroundColor: catColor }]}
                    onPress={() => navigate('deck', { deck })}
                    activeOpacity={0.88}
                  >
                    <Text style={s.featuredEmoji}>{deck.emoji}</Text>
                    <Text style={s.featuredTitle}>{deck.title}</Text>
                    <Text style={s.featuredDesc} numberOfLines={2}>{deck.description}</Text>
                    <View style={s.featuredDivider} />
                    <View style={s.featuredStats}>
                      <Text style={s.featuredStat}>{deck.cardCount} kart</Text>
                      <Text style={s.featuredStatDot}>·</Text>
                      <Text style={s.featuredStat}>{deck.duration}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* All Decks */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            {selectedCategory
              ? (categories.find(c => c.id === selectedCategory)?.name + ' Desteleri')
              : 'Tüm Desteler'}
          </Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.deckList}>
          {filteredDecks.map(deck => {
            const catColor = getCategoryColor(deck.categoryId);
            return (
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
                  <Text style={s.deckItemDesc} numberOfLines={1}>{deck.description}</Text>
                  <View style={s.deckItemStats}>
                    <Text style={s.deckItemStat}>{deck.cardCount} kart</Text>
                    <Text style={s.deckItemStatDot}>·</Text>
                    <Text style={s.deckItemStat}>{deck.duration}</Text>
                    <Text style={s.deckItemStatDot}>·</Text>
                    <Text style={s.deckItemStat}>{deck.people}</Text>
                  </View>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  themeToggle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  themeToggleIcon: {
    fontSize: 19,
    color: theme.colors.text,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  pillActive: {
    backgroundColor: theme.colors.primary + '1A',
    borderColor: theme.colors.primary,
  },
  pillText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  featuredScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    flexDirection: 'row',
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    padding: 20,
    paddingTop: 22,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredEmoji: {
    fontSize: 38,
    marginBottom: 10,
  },
  featuredTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  featuredDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 17,
    marginBottom: 14,
  },
  featuredDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredStat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
  },
  featuredStatDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  deckList: {
    paddingHorizontal: 16,
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
