import React, { useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mods } from '../data';
import { useTheme } from '../ThemeContext';

export default function CategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const catColor = category.color;
  const categoryMods = mods.filter(d => d.categoryId === category.id);
  const freeCount = categoryMods.filter(d => !d.isPremium).length;

  const fadeAnims = useRef(categoryMods.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(categoryMods.map(() => new Animated.Value(14))).current;

  useEffect(() => {
    const anims = categoryMods.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadeAnims[i], { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.spring(slideAnims[i], { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }),
      ])
    );
    Animated.stagger(60, anims).start();
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <LinearGradient
        colors={[catColor, catColor + 'EE', catColor + 'BB', catColor + '66', catColor + '00']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={s.header}
      >
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerIcon}>{category.icon}</Text>
        <Text style={s.headerTitle}>{category.name}</Text>
        <Text style={s.headerSub}>
          {categoryMods.length} mod  ·  {freeCount} ücretsiz
        </Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.deckList}>
          {categoryMods.map((mod, i) => (
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
                  <Text style={s.deckItemDesc} numberOfLines={2}>{mod.description}</Text>
                  <View style={s.deckItemStats}>
                    <Text style={s.deckItemStat}>{mod.cardCount} kart</Text>
                    <Text style={s.deckItemStatDot}>·</Text>
                    <Text style={s.deckItemStat}>{mod.duration}</Text>
                    <Text style={s.deckItemStatDot}>·</Text>
                    <Text style={s.deckItemStat}>{mod.level}</Text>
                  </View>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            </Animated.View>
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
    paddingBottom: 32,
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
    fontSize: 46,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
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
  chevron: {
    fontSize: 22,
    color: theme.colors.textMuted,
    marginRight: 2,
  },
});
