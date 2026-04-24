import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions, Animated, TextInput, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { categories, mods } from '../data';
import { useTheme } from '../ThemeContext';

const { width } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = width * 0.62;
const POOL_SIZE = 30;

function CategoryPill({ label, isActive, onPress, theme, color }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, friction: 10, tension: 220 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 100 }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          pillStyles.pill,
          {
            backgroundColor: isActive ? color + '22' : theme.colors.surface,
            borderColor: isActive ? color : theme.colors.border,
            shadowColor: isActive ? color : 'transparent',
            shadowOpacity: isActive ? 0.35 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
          },
        ]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text style={[
          pillStyles.pillText,
          {
            color: isActive ? color : theme.colors.textSecondary,
            fontWeight: isActive ? '700' : '500',
          },
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
  },
});

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const clearOpacity = useRef(new Animated.Value(0)).current;

  const isSearchActive = searchQuery.length > 0;

  const getCategory = (categoryId) => categories.find(c => c.id === categoryId);
  const getCategoryColor = (categoryId) => getCategory(categoryId)?.color ?? theme.colors.primary;

  const displayedMods = useMemo(() => {
    if (isSearchActive) {
      const q = searchQuery.toLowerCase();
      return mods.filter(d => {
        const cat = getCategory(d.categoryId);
        return (
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          cat?.name.toLowerCase().includes(q)
        );
      });
    }
    return selectedCategory
      ? mods.filter(d => d.categoryId === selectedCategory)
      : mods;
  }, [searchQuery, selectedCategory]);

  const featuredMods = mods.filter(d => !d.isPremium);

  // Stagger animation pool for deck list
  const fadeAnims = useRef(Array.from({ length: POOL_SIZE }, () => new Animated.Value(0))).current;
  const slideAnims = useRef(Array.from({ length: POOL_SIZE }, () => new Animated.Value(14))).current;

  // Featured card anim pool
  const featuredFade = useRef(Array.from({ length: POOL_SIZE }, () => new Animated.Value(0))).current;
  const featuredSlide = useRef(Array.from({ length: POOL_SIZE }, () => new Animated.Value(12))).current;

  useEffect(() => {
    fadeAnims.forEach(a => a.setValue(0));
    slideAnims.forEach(a => a.setValue(14));

    const modAnims = displayedMods.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadeAnims[i], { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.spring(slideAnims[i], { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }),
      ])
    );
    Animated.stagger(50, modAnims).start();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    featuredFade.forEach(a => a.setValue(0));
    featuredSlide.forEach(a => a.setValue(12));

    const featuredAnims = featuredMods.map((_, i) =>
      Animated.parallel([
        Animated.timing(featuredFade[i], { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.spring(featuredSlide[i], { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }),
      ])
    );
    Animated.stagger(65, featuredAnims).start();
  }, []);

  useEffect(() => {
    Animated.timing(clearOpacity, {
      toValue: isSearchActive ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isSearchActive]);

  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
    setSearchFocused(false);
  };

  const sectionTitle = () => {
    if (isSearchActive) return `${displayedMods.length} sonuç`;
    if (selectedCategory) return categories.find(c => c.id === selectedCategory)?.name + ' Modları';
    return 'Tüm Modlar';
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <LinearGradient
          colors={isDark
            ? ['#131340', '#0D0D28', '#07071A']
            : ['#EDE9FF', '#F0ECFF', '#F5F3FF']}
          locations={[0, 0.55, 1]}
          style={s.headerGradient}
        >
          <View style={s.header}>
            <View>
              <View style={s.titleRow}>
                <Text style={[s.titleStar, { color: theme.colors.primary }]}>✦</Text>
                <Text style={s.appTitle}>KartOyunu</Text>
              </View>
              <Text style={s.tagline}>Sessizliği bitiren modlar</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[
            s.searchBar,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)',
              borderColor: searchFocused
                ? theme.colors.primary
                : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'),
            },
          ]}>
            <Feather
              name="search"
              size={16}
              color={searchFocused ? theme.colors.primary : theme.colors.textMuted}
            />
            <TextInput
              style={[s.searchInput, { color: theme.colors.text }]}
              placeholder="Mod veya kategori ara..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Animated.View style={{ opacity: clearOpacity }}>
              <TouchableOpacity
                onPress={clearSearch}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={[s.clearBtn, { backgroundColor: theme.colors.textMuted + '40' }]}>
                  <Feather name="x" size={11} color={theme.colors.textMuted} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>

        {/* Category Pills — hidden during search */}
        {!isSearchActive && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.categoryScroll}
          >
            <CategoryPill
              label="Tümü"
              isActive={!selectedCategory}
              onPress={() => setSelectedCategory(null)}
              theme={theme}
              color={theme.colors.primary}
            />
            {categories.map(cat => (
              <CategoryPill
                key={cat.id}
                label={`${cat.icon} ${cat.name}`}
                isActive={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                theme={theme}
                color={cat.color}
              />
            ))}
          </ScrollView>
        )}

        {/* Featured Section — hidden during search or category filter */}
        {!selectedCategory && !isSearchActive && (
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
              {featuredMods.map((mod, i) => {
                const catColor = getCategoryColor(mod.categoryId);
                const cat = getCategory(mod.categoryId);
                return (
                  <Animated.View
                    key={mod.id}
                    style={{ opacity: featuredFade[i], transform: [{ translateY: featuredSlide[i] }] }}
                  >
                    <TouchableOpacity
                      style={[s.featuredCard, { backgroundColor: catColor }]}
                      onPress={() => navigation.navigate('Mod', { mod })}
                      activeOpacity={0.86}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.18)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={s.featuredCategoryChip}>
                        <Text style={s.featuredCategoryText}>{cat?.icon} {cat?.name}</Text>
                      </View>
                      <Text style={s.featuredEmoji}>{mod.emoji}</Text>
                      <Text style={s.featuredTitle}>{mod.title}</Text>
                      <Text style={s.featuredDesc} numberOfLines={2}>{mod.description}</Text>
                      <View style={s.featuredDivider} />
                      <View style={s.featuredStats}>
                        <Text style={s.featuredStat}>{mod.cardCount} kart</Text>
                        <Text style={s.featuredStatDot}>·</Text>
                        <Text style={s.featuredStat}>{mod.duration}</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Section Header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{sectionTitle()}</Text>
          <View style={s.sectionLine} />
        </View>

        {/* Empty search state */}
        {isSearchActive && displayedMods.length === 0 ? (
          <View style={s.emptySearch}>
            <Feather name="search" size={40} color={theme.colors.textMuted} style={{ marginBottom: 14 }} />
            <Text style={s.emptySearchTitle}>Sonuç bulunamadı</Text>
            <Text style={s.emptySearchDesc}>
              "{searchQuery}" için eşleşen mod yok.{'\n'}Farklı bir kelime dene.
            </Text>
          </View>
        ) : (
          <View style={s.deckList}>
            {displayedMods.map((mod, i) => {
              const catColor = getCategoryColor(mod.categoryId);
              const cat = getCategory(mod.categoryId);
              return (
                <Animated.View
                  key={mod.id}
                  style={{ opacity: fadeAnims[i], transform: [{ translateY: slideAnims[i] }] }}
                >
                  <TouchableOpacity
                    style={s.deckItem}
                    onPress={() => navigation.navigate('Mod', { mod })}
                    activeOpacity={0.75}
                  >
                    <View style={[s.deckAccentBar, { backgroundColor: catColor }]} />
                    <View style={[s.deckItemIcon, { backgroundColor: catColor + '22' }]}>
                      <Text style={s.deckItemEmoji}>{mod.emoji}</Text>
                    </View>
                    <View style={s.deckItemContent}>
                      <View style={s.deckItemRow}>
                        <Text style={s.deckItemTitle}>{mod.title}</Text>
                        {mod.isPremium && (
                          <View style={s.proBadge}>
                            <Text style={s.proText}>PRO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.deckItemDesc} numberOfLines={1}>{mod.description}</Text>
                      <View style={s.deckItemStats}>
                        <Text style={[s.deckItemStat, { color: catColor, fontWeight: '600' }]}>{cat?.icon} {cat?.name}</Text>
                        <Text style={s.deckItemStatDot}>·</Text>
                        <Text style={s.deckItemStat}>{mod.cardCount} kart</Text>
                        <Text style={s.deckItemStatDot}>·</Text>
                        <Text style={s.deckItemStat}>{mod.duration}</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

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
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleStar: {
    fontSize: 18,
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
    marginTop: 4,
    letterSpacing: 0.1,
    marginLeft: 26,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    flexDirection: 'row',
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
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 12,
  },
  featuredCategoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  featuredCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.2,
  },
  featuredEmoji: {
    fontSize: 40,
    marginBottom: 12,
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
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 17,
    marginBottom: 14,
  },
  featuredDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
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
    borderRadius: 18,
    padding: 14,
    paddingLeft: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: theme.isDark ? 0.35 : 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  deckAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  deckItemIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckItemEmoji: {
    fontSize: 26,
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
  emptySearch: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySearchDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
