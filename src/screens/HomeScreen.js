import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  TextInput,
  Keyboard,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { cards, categories, mods } from "../data";
import { useTheme } from "../ThemeContext";
import { useStats } from "../context/StatsContext";
import QuestionShareCard from "../components/QuestionShareCard";
import { shareQuestionCard } from "../utils/shareQuestionCard";
import { rs, rf, MODAL_MAX_WIDTH } from "../utils/responsive";

const { width } = Dimensions.get("window");
const FEATURED_CARD_WIDTH = width * 0.62;
const DAILY_QUESTION_RESET_HOUR = 6;

const getDailyQuestionKey = (date) => {
  const shiftedDate = new Date(date);
  shiftedDate.setHours(shiftedDate.getHours() - DAILY_QUESTION_RESET_HOUR);

  return [
    shiftedDate.getFullYear(),
    shiftedDate.getMonth() + 1,
    shiftedDate.getDate(),
  ].join("-");
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const getDailyQuestion = (allCards, date) => {
  const questionPool = Object.entries(allCards).flatMap(([modId, questions]) =>
    questions.map((question, index) => ({
      id: `${modId}-${index}`,
      modId,
      question,
    })),
  );

  if (questionPool.length === 0) return null;

  const dailyKey = getDailyQuestionKey(date);
  const index = hashString(dailyKey) % questionPool.length;
  return questionPool[index];
};

const getNextDailyQuestionReset = (date) => {
  const nextReset = new Date(date);
  nextReset.setHours(DAILY_QUESTION_RESET_HOUR, 0, 0, 0);

  if (date >= nextReset) {
    nextReset.setDate(nextReset.getDate() + 1);
  }

  return nextReset;
};

function CategoryPill({ label, isActive, onPress, theme, color }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.88,
        useNativeDriver: true,
        friction: 10,
        tension: 220,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          pillStyles.pill,
          {
            backgroundColor: isActive ? color + "22" : theme.colors.surface,
            borderColor: isActive ? color : theme.colors.border,
            shadowColor: isActive ? color : "transparent",
            shadowOpacity: isActive ? 0.35 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
          },
        ]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text
          style={[
            pillStyles.pillText,
            {
              color: isActive ? color : theme.colors.textSecondary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(9),
    borderRadius: rs(22),
    borderWidth: 1,
  },
  pillText: {
    fontSize: rf(14),
  },
});

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const {
    addStat,
    getCompletedModsCount,
    getTotalFavoriteCount,
    getRecommendedByCategory,
    getRecommendedByFavorites,
  } = useStats();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dailyModalVisible, setDailyModalVisible] = useState(false);
  const [dailyQuestionDate, setDailyQuestionDate] = useState(() => new Date());

  const clearOpacity = useRef(new Animated.Value(0)).current;
  const dailyQuestionCardRef = useRef(null);

  const isSearchActive = searchQuery.length > 0;
  const dailyQuestion = useMemo(
    () => getDailyQuestion(cards, dailyQuestionDate),
    [dailyQuestionDate],
  );

  const getCategory = (categoryId) =>
    categories.find((c) => c.id === categoryId);
  const getCategoryColor = (categoryId) =>
    getCategory(categoryId)?.color ?? theme.colors.primary;

  const displayedMods = useMemo(() => {
    if (isSearchActive) {
      const q = searchQuery.toLowerCase();
      return mods.filter((d) => {
        const cat = getCategory(d.categoryId);
        return (
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          cat?.name.toLowerCase().includes(q)
        );
      });
    }
    return selectedCategory
      ? mods.filter((d) => d.categoryId === selectedCategory)
      : mods;
  }, [searchQuery, selectedCategory]);

  const featuredMods = mods.filter((d) => !d.isPremium);

  const completedCount = getCompletedModsCount();
  const favoriteCount = getTotalFavoriteCount();
  const categoryRecs = useMemo(
    () => (completedCount >= 2 ? getRecommendedByCategory(6) : []),
    [completedCount],
  );
  const favoriteRecs = useMemo(
    () => (favoriteCount >= 5 ? getRecommendedByFavorites(6) : []),
    [favoriteCount],
  );

  // Stagger animation pool for deck list — dynamically sized
  const fadeAnims = useRef([]).current;
  const slideAnims = useRef([]).current;

  // Featured card anim pool — dynamically sized
  const featuredFade = useRef([]).current;
  const featuredSlide = useRef([]).current;

  // Ensure animation arrays match displayedMods length
  while (fadeAnims.length < displayedMods.length) {
    fadeAnims.push(new Animated.Value(0));
    slideAnims.push(new Animated.Value(14));
  }
  fadeAnims.length = displayedMods.length;
  slideAnims.length = displayedMods.length;

  // Ensure featured animation arrays match featuredMods length
  while (featuredFade.length < featuredMods.length) {
    featuredFade.push(new Animated.Value(0));
    featuredSlide.push(new Animated.Value(12));
  }
  featuredFade.length = featuredMods.length;
  featuredSlide.length = featuredMods.length;

  useEffect(() => {
    fadeAnims.forEach((a) => a.setValue(0));
    slideAnims.forEach((a) => a.setValue(14));

    const modAnims = displayedMods.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnims[i], {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
    );
    Animated.stagger(50, modAnims).start();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    featuredFade.forEach((a) => a.setValue(0));
    featuredSlide.forEach((a) => a.setValue(12));

    const featuredAnims = featuredMods.map((_, i) =>
      Animated.parallel([
        Animated.timing(featuredFade[i], {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.spring(featuredSlide[i], {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
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

  useEffect(() => {
    const now = new Date();
    const nextReset = getNextDailyQuestionReset(now);
    const delay = Math.min(nextReset.getTime() - now.getTime(), 2147483647);

    const timer = setTimeout(() => {
      setDailyQuestionDate(new Date());
    }, delay);

    return () => clearTimeout(timer);
  }, [dailyQuestionDate]);

  const clearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
    setSearchFocused(false);
  };

  const shareDailyQuestion = async () => {
    if (!dailyQuestion) return;

    const didShare = await shareQuestionCard({
      cardRef: dailyQuestionCardRef,
      message: `Günün Sorusu:\n\n"${dailyQuestion.question}"\n\nKartOyunu`,
      title: "KartOyunu - Günün Sorusu",
      filename: "kartoyunu-gunun-sorusu",
    });

    if (didShare) {
      addStat(dailyQuestion.id, dailyQuestion.modId, "share");
    }
  };

  const sectionTitle = () => {
    if (isSearchActive) return `${displayedMods.length} sonuç`;
    if (selectedCategory)
      return (
        categories.find((c) => c.id === selectedCategory)?.name + " Modları"
      );
    return "Tüm Modlar";
  };

  return (
    <SafeAreaView style={s.container}>
      {dailyQuestion && (
        <View style={s.shareCaptureHost} pointerEvents="none">
          <QuestionShareCard
            ref={dailyQuestionCardRef}
            question={dailyQuestion.question}
            label="GÜNÜN SORUSU"
            color={theme.colors.primary}
            minHeight={230}
          />
        </View>
      )}

      <Modal
        visible={dailyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDailyModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setDailyModalVisible(false)}
            activeOpacity={1}
          />
          <View style={s.dailyModalPanel}>
            <TouchableOpacity
              style={s.modalCloseBtn}
              onPress={() => setDailyModalVisible(false)}
              activeOpacity={0.75}
            >
              <Feather name="x" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={s.modalBadge}>
              <Feather name="star" size={14} color={theme.colors.primary} />
              <Text style={s.modalBadgeText}>Günün Sorusu</Text>
            </View>

            <View style={s.modalQuestionCard}>
              <View style={s.modalQuestionStripe} />
              <Text style={s.modalQuestionText}>
                {dailyQuestion?.question}
              </Text>
            </View>

            <TouchableOpacity onPress={shareDailyQuestion} activeOpacity={0.84}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.modalShareBtn}
              >
                <Feather name="share-2" size={18} color="#FFFFFF" />
                <Text style={s.modalShareBtnText}>Paylaş</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={
            isDark
              ? ["#131340", "#0D0D28", "#07071A"]
              : ["#EDE9FF", "#F0ECFF", "#F5F3FF"]
          }
          locations={[0, 0.55, 1]}
          style={s.headerGradient}
        >
          <View style={s.header}>
            <View>
              <View style={s.titleRow}>
                <Text style={[s.titleStar, { color: theme.colors.primary }]}>
                  ✦
                </Text>
                <Text style={s.appTitle}>KartOyunu</Text>
              </View>
              <Text style={s.tagline}>Sessizliği bitiren modlar</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View
            style={[
              s.searchBar,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.75)",
                borderColor: searchFocused
                  ? theme.colors.primary
                  : isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.1)",
              },
            ]}
          >
            <Feather
              name="search"
              size={16}
              color={
                searchFocused ? theme.colors.primary : theme.colors.textMuted
              }
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
                <View
                  style={[
                    s.clearBtn,
                    { backgroundColor: theme.colors.textMuted + "40" },
                  ]}
                >
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
            {categories.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={`${cat.icon} ${cat.name}`}
                isActive={selectedCategory === cat.id}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id,
                  )
                }
                theme={theme}
                color={cat.color}
              />
            ))}
          </ScrollView>
        )}

        {!isSearchActive && dailyQuestion && (
          <View style={s.dailySection}>
            <TouchableOpacity
              style={s.dailyCard}
              onPress={() => setDailyModalVisible(true)}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={isDark
                  ? [theme.colors.surface, theme.colors.surfaceElevated]
                  : [theme.colors.card, '#FFFFFF']
                }
                style={StyleSheet.absoluteFill}
              />
              <View style={s.dailyTopStripe} />
              <View style={s.dailyHeaderRow}>
                <View style={s.dailyBadge}>
                  <Feather name="star" size={13} color={theme.colors.primary} />
                  <Text style={s.dailyBadgeText}>Günün Sorusu</Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={theme.colors.primaryDark}
                />
              </View>
              <Text style={s.dailyQuestion} numberOfLines={3}>
                {dailyQuestion.question}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Senin kategorin — en az 2 oyun bittikten sonra gösterilir */}
        {!selectedCategory && !isSearchActive && categoryRecs.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Senin kategorin</Text>
              <View style={s.sectionLine} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.featuredScroll}
            >
              {categoryRecs.map((mod) => {
                const catColor = getCategoryColor(mod.categoryId);
                const cat = getCategory(mod.categoryId);
                return (
                  <TouchableOpacity
                    key={mod.id}
                    style={[s.featuredCard, { backgroundColor: catColor }]}
                    onPress={() => navigation.navigate("Mod", { mod })}
                    activeOpacity={0.86}
                  >
                    <LinearGradient
                      colors={["rgba(255,255,255,0.12)", "rgba(0,0,0,0.18)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    {mod.isPremium && (
                      <View style={[s.proBadge, s.featuredProBadge]}>
                        <Text style={s.proText}>PRO</Text>
                      </View>
                    )}
                    <View style={s.featuredCategoryChip}>
                      <Text style={s.featuredCategoryText}>
                        {cat?.icon} {cat?.name}
                      </Text>
                    </View>
                    <Text style={s.featuredEmoji}>{mod.emoji}</Text>
                    <Text style={s.featuredTitle}>{mod.title}</Text>
                    <Text style={s.featuredDesc} numberOfLines={2}>
                      {mod.description}
                    </Text>
                    <View style={s.featuredDivider} />
                    <View style={s.featuredStats}>
                      <Text style={s.featuredStat}>{mod.cardCount} kart</Text>
                      <Text style={s.featuredStatDot}>·</Text>
                      <Text style={s.featuredStat}>{mod.duration}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Favorilerine göre — en az 5 favori biriktikten sonra gösterilir */}
        {!selectedCategory && !isSearchActive && favoriteRecs.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Favorilerine göre</Text>
              <View style={s.sectionLine} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.featuredScroll}
            >
              {favoriteRecs.map((mod) => {
                const catColor = getCategoryColor(mod.categoryId);
                const cat = getCategory(mod.categoryId);
                return (
                  <TouchableOpacity
                    key={mod.id}
                    style={[s.featuredCard, { backgroundColor: catColor }]}
                    onPress={() => navigation.navigate("Mod", { mod })}
                    activeOpacity={0.86}
                  >
                    <LinearGradient
                      colors={["rgba(255,255,255,0.12)", "rgba(0,0,0,0.18)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    {mod.isPremium && (
                      <View style={[s.proBadge, s.featuredProBadge]}>
                        <Text style={s.proText}>PRO</Text>
                      </View>
                    )}
                    <View style={s.featuredCategoryChip}>
                      <Text style={s.featuredCategoryText}>
                        {cat?.icon} {cat?.name}
                      </Text>
                    </View>
                    <Text style={s.featuredEmoji}>{mod.emoji}</Text>
                    <Text style={s.featuredTitle}>{mod.title}</Text>
                    <Text style={s.featuredDesc} numberOfLines={2}>
                      {mod.description}
                    </Text>
                    <View style={s.featuredDivider} />
                    <View style={s.featuredStats}>
                      <Text style={s.featuredStat}>{mod.cardCount} kart</Text>
                      <Text style={s.featuredStatDot}>·</Text>
                      <Text style={s.featuredStat}>{mod.duration}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
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
                    style={{
                      opacity: featuredFade[i],
                      transform: [{ translateY: featuredSlide[i] }],
                    }}
                  >
                    <TouchableOpacity
                      style={[s.featuredCard, { backgroundColor: catColor }]}
                      onPress={() => navigation.navigate("Mod", { mod })}
                      activeOpacity={0.86}
                    >
                      <LinearGradient
                        colors={["rgba(255,255,255,0.12)", "rgba(0,0,0,0.18)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      {mod.isPremium && (
                        <View style={[s.proBadge, s.featuredProBadge]}>
                          <Text style={s.proText}>PRO</Text>
                        </View>
                      )}
                      <View style={s.featuredCategoryChip}>
                        <Text style={s.featuredCategoryText}>
                          {cat?.icon} {cat?.name}
                        </Text>
                      </View>
                      <Text style={s.featuredEmoji}>{mod.emoji}</Text>
                      <Text style={s.featuredTitle}>{mod.title}</Text>
                      <Text style={s.featuredDesc} numberOfLines={2}>
                        {mod.description}
                      </Text>
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
            <Feather
              name="search"
              size={40}
              color={theme.colors.textMuted}
              style={{ marginBottom: 14 }}
            />
            <Text style={s.emptySearchTitle}>Sonuç bulunamadı</Text>
            <Text style={s.emptySearchDesc}>
              "{searchQuery}" için eşleşen mod yok.{"\n"}Farklı bir kelime dene.
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
                  style={{
                    opacity: fadeAnims[i],
                    transform: [{ translateY: slideAnims[i] }],
                  }}
                >
                  <TouchableOpacity
                    style={s.deckItem}
                    onPress={() => navigation.navigate("Mod", { mod })}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[s.deckAccentBar, { backgroundColor: catColor }]}
                    />
                    <View
                      style={[
                        s.deckItemIcon,
                        { backgroundColor: catColor + "22" },
                      ]}
                    >
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
                      <Text style={s.deckItemDesc} numberOfLines={1}>
                        {mod.description}
                      </Text>
                      <View style={s.deckItemStats}>
                        <Text
                          style={[
                            s.deckItemStat,
                            { color: catColor, fontWeight: "600" },
                          ]}
                        >
                          {cat?.icon} {cat?.name}
                        </Text>
                        <Text style={s.deckItemStatDot}>·</Text>
                        <Text style={s.deckItemStat}>{mod.cardCount} kart</Text>
                        <Text style={s.deckItemStatDot}>·</Text>
                        <Text style={s.deckItemStat}>{mod.duration}</Text>
                      </View>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={theme.colors.textMuted}
                    />
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

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    shareCaptureHost: {
      position: "absolute",
      left: -10000,
      top: 0,
    },
    headerGradient: {
      paddingBottom: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: rs(20),
      paddingTop: rs(22),
      paddingBottom: rs(12),
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    titleStar: {
      fontSize: 18,
    },
    appTitle: {
      fontSize: rf(30),
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: -0.8,
    },
    tagline: {
      fontSize: rf(13),
      color: theme.colors.textSecondary,
      marginTop: 4,
      letterSpacing: 0.1,
      marginLeft: rs(26),
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: rs(16),
      paddingHorizontal: rs(14),
      paddingVertical: rs(11),
      borderRadius: rs(16),
      borderWidth: 1.5,
      gap: rs(10),
    },
    searchInput: {
      flex: 1,
      fontSize: rf(15),
      fontWeight: "500",
      padding: 0,
      margin: 0,
    },
    clearBtn: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    dailySection: {
      paddingHorizontal: rs(16),
      paddingBottom: rs(16),
    },
    dailyCard: {
      minHeight: rs(150),
      borderRadius: rs(24),
      padding: rs(20),
      paddingTop: rs(22),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.isDark
        ? "rgba(255,255,255,0.16)"
        : "rgba(18,16,58,0.08)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme.isDark ? 0.36 : 0.1,
      shadowRadius: 20,
      elevation: 8,
    },
    dailyTopStripe: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 7,
      backgroundColor: theme.colors.primary,
    },
    dailyHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    dailyBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      backgroundColor: theme.colors.primary + "1F",
      borderWidth: 1,
      borderColor: theme.colors.primary + "33",
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },
    dailyBadgeText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.colors.primaryDark,
    },
    dailyQuestion: {
      fontSize: rf(22),
      fontWeight: "600",
      lineHeight: rf(34),
      color: theme.colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(7,7,26,0.72)",
      justifyContent: "center",
      paddingHorizontal: rs(20),
    },
    dailyModalPanel: {
      backgroundColor: theme.colors.surface,
      borderRadius: rs(26),
      padding: rs(18),
      paddingTop: rs(72),
      alignSelf: "center",
      width: "100%",
      maxWidth: MODAL_MAX_WIDTH,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.35,
      shadowRadius: 30,
      elevation: 20,
    },
    modalCloseBtn: {
      position: "absolute",
      top: 14,
      right: 14,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 2,
    },
    modalBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 7,
      backgroundColor: theme.colors.primary + "1F",
      borderWidth: 1,
      borderColor: theme.colors.primary + "33",
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginBottom: 18,
    },
    modalBadgeText: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.primary,
    },
    modalQuestionCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 24,
      overflow: "hidden",
      minHeight: 230,
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme.isDark ? 0.34 : 0.12,
      shadowRadius: 20,
      elevation: 10,
    },
    modalQuestionStripe: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 7,
      backgroundColor: theme.colors.primary,
    },
    modalQuestionText: {
      paddingHorizontal: rs(26),
      paddingVertical: rs(34),
      fontSize: rf(22),
      fontWeight: "600",
      lineHeight: rf(34),
      color: "#1A1545",
      textAlign: "center",
    },
    modalShareBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
    },
    modalShareBtnText: {
      fontSize: 16,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    categoryScroll: {
      paddingHorizontal: rs(16),
      paddingVertical: rs(14),
      gap: rs(8),
      flexDirection: "row",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: rs(20),
      marginTop: rs(8),
      marginBottom: rs(14),
      gap: rs(12),
    },
    sectionTitle: {
      fontSize: rf(16),
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: -0.2,
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    featuredScroll: {
      paddingHorizontal: rs(16),
      paddingBottom: rs(16),
      gap: rs(12),
      flexDirection: "row",
    },
    featuredCard: {
      width: FEATURED_CARD_WIDTH,
      padding: rs(20),
      paddingTop: rs(22),
      borderRadius: rs(24),
      overflow: "hidden",
      position: "relative",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 18,
      elevation: 12,
    },
    featuredCategoryChip: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.22)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 14,
    },
    featuredCategoryText: {
      fontSize: 11,
      fontWeight: "700",
      color: "rgba(255,255,255,0.92)",
      letterSpacing: 0.2,
    },
    featuredEmoji: {
      fontSize: 40,
      marginBottom: 12,
    },
    featuredTitle: {
      fontSize: rf(19),
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.3,
      marginBottom: rs(6),
    },
    featuredDesc: {
      fontSize: rf(12),
      color: "rgba(255,255,255,0.78)",
      lineHeight: rf(17),
      marginBottom: rs(14),
    },
    featuredDivider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.22)",
      marginBottom: 10,
    },
    featuredStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    featuredStat: {
      fontSize: 12,
      color: "rgba(255,255,255,0.92)",
      fontWeight: "600",
    },
    featuredStatDot: {
      fontSize: 12,
      color: "rgba(255,255,255,0.4)",
    },
    deckList: {
      paddingHorizontal: rs(16),
      gap: rs(10),
    },
    deckItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: rs(18),
      padding: rs(14),
      paddingLeft: rs(20),
      gap: rs(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      position: "relative",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme.isDark ? 0.35 : 0.07,
      shadowRadius: 10,
      elevation: 4,
    },
    deckAccentBar: {
      position: "absolute",
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
      alignItems: "center",
      justifyContent: "center",
    },
    deckItemEmoji: {
      fontSize: 26,
    },
    deckItemContent: {
      flex: 1,
    },
    deckItemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 3,
    },
    deckItemTitle: {
      fontSize: rf(15),
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: -0.1,
    },
    proBadge: {
      backgroundColor: "#D4A843",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
    },
    featuredProBadge: {
      position: "absolute",
      top: rs(16),
      right: rs(16),
      zIndex: 2,
    },
    proText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#1A1000",
      letterSpacing: 0.5,
    },
    deckItemDesc: {
      fontSize: rf(12),
      color: theme.colors.textSecondary,
      marginBottom: rs(6),
      lineHeight: rf(17),
    },
    deckItemStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    deckItemStat: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: "500",
    },
    deckItemStatDot: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    emptySearch: {
      alignItems: "center",
      paddingTop: 40,
      paddingHorizontal: 40,
      paddingBottom: 20,
    },
    emptySearchTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptySearchDesc: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
  });
