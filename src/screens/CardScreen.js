import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Animated, PanResponder, Dimensions, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useNavigation, useRoute } from '@react-navigation/native';
import { cards, categories } from '../data';
import { useTheme } from '../ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useStats } from '../context/StatsContext';
import { useAudio } from '../context/AudioContext';
import QuestionShareCard from '../components/QuestionShareCard';
import { shareQuestionCard } from '../utils/shareQuestionCard';
import Confetti from '../components/Confetti';
import { rs, rf, isTablet, CARD_MAX_WIDTH } from '../utils/responsive';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const LEFT_EDGE_ZONE = 22;

const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();

export default function CardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mod } = route.params;
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { addFavorite } = useFavorites();
  const { addStat } = useStats();
  const { playSound } = useAudio();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFavorites, setSessionFavorites] = useState([]);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  // Back card animated scale — reacts to drag progress
  const backCardScale = useRef(new Animated.Value(0.94)).current;
  // Glow pulse for when threshold is crossed
  const glowPulse = useRef(new Animated.Value(0)).current;
  const glowLoopRef = useRef(null);
  const thresholdCrossedRef = useRef(false);

  const currentIndexRef = useRef(0);
  const shareCardRef = useRef(null);

  const modCards = cards[mod.id] || [];
  const category = categories.find(c => c.id === mod.categoryId);
  const catColor = category?.color || theme.colors.primary;
  const totalCards = modCards.length;

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
      if (glowLoopRef.current) {
        glowLoopRef.current.stop();
        glowLoopRef.current = null;
      }
    };
  }, []);

  // Entrance animation
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const swipeCardRef = useRef(null);

  const stopGlowLoop = () => {
    if (glowLoopRef.current) {
      glowLoopRef.current.stop();
      glowLoopRef.current = null;
    }
    glowPulse.setValue(0);
    thresholdCrossedRef.current = false;
  };

  const startGlowLoop = () => {
    if (glowLoopRef.current) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ])
    );
    glowLoopRef.current = loop;
    loop.start();
  };

  const swipeCard = (direction) => {
    stopGlowLoop();
    const idx = currentIndexRef.current;
    const toX = direction === 'right' ? width * 1.5 : -width * 1.5;
    const toY = direction === 'right' ? -30 : 20;
    const cardId = `${mod.id}-${idx}`;

    if (direction === 'right') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('swipe_right');
      setSessionFavorites(prev => [...prev, modCards[idx]]);
      addFavorite(modCards[idx], mod, catColor);
      addStat(cardId, mod.id, 'favorite');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound('swipe_left');
      addStat(cardId, mod.id, 'skip');
    }

    // Reset back card scale
    Animated.spring(backCardScale, { toValue: 0.94, friction: 8, useNativeDriver: true }).start();

    Animated.timing(position, {
      toValue: { x: toX, y: toY },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      backCardScale.setValue(0.94);
      const next = idx + 1;
      if (next >= totalCards) {
        setFinished(true);
        setShowConfetti(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSound('game_end');
      } else {
        currentIndexRef.current = next;
        setCurrentIndex(next);
      }
    });
  };

  swipeCardRef.current = swipeCard;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      return evt.nativeEvent.pageX > LEFT_EDGE_ZONE;
    },
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy * 0.15 });

      // Drive back card scale based on drag progress
      const progress = Math.min(Math.abs(gesture.dx) / SWIPE_THRESHOLD, 1);
      backCardScale.setValue(0.94 + progress * 0.06);

      // Trigger glow + haptic once when threshold is first crossed
      const overThreshold = Math.abs(gesture.dx) > SWIPE_THRESHOLD;
      if (overThreshold && !thresholdCrossedRef.current) {
        thresholdCrossedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        startGlowLoop();
      } else if (!overThreshold && thresholdCrossedRef.current) {
        thresholdCrossedRef.current = false;
        stopGlowLoop();
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeCardRef.current('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeCardRef.current('left');
      } else {
        stopGlowLoop();
        Animated.spring(backCardScale, { toValue: 0.94, friction: 8, useNativeDriver: true }).start();
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 6,
          tension: 80,
        }).start();
      }
    },
  })).current;

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const rotateY = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['8deg', '0deg', '-8deg'],
  });

  const skipOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -30],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const favoriteOpacity = position.x.interpolate({
    inputRange: [30, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const skipBgOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [0.12, 0],
    extrapolate: 'clamp',
  });

  const favBgOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 0.12],
    extrapolate: 'clamp',
  });

  // Glow overlay opacity driven by glowPulse + whether threshold is crossed
  const skipGlowOpacity = Animated.multiply(
    position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD - 10, -SWIPE_THRESHOLD],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
    glowPulse
  );

  const favGlowOpacity = Animated.multiply(
    position.x.interpolate({
      inputRange: [SWIPE_THRESHOLD, SWIPE_THRESHOLD + 10],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    glowPulse
  );

  const handleShare = async () => {
    const idx = currentIndexRef.current;
    const question = modCards[idx];

    const didShare = await shareQuestionCard({
      cardRef: shareCardRef,
      message: `"${question}"\n\n— KartOyunu ile oynuyoruz 🎴`,
      title: 'KartOyunu',
      filename: 'kartoyunu-soru',
    });

    if (didShare) {
      addStat(`${mod.id}-${idx}`, mod.id, 'share');
    }
  };

  const restartGame = () => {
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setSessionFavorites([]);
    setFinished(false);
    setShowConfetti(false);
    position.setValue({ x: 0, y: 0 });
    backCardScale.setValue(0.94);
  };

  if (finished) {
    return (
      <SafeAreaView style={s.container}>
        {showConfetti && <Confetti color={catColor} />}
        <ScrollView
          contentContainerStyle={s.finishedScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.finishedTop}>
            <View style={[s.finishedBadge, { borderColor: catColor + '50' }]}>
              <LinearGradient
                colors={[catColor + '30', catColor + '15']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={s.finishedBadgeEmoji}>🎉</Text>
            </View>
            <Text style={s.finishedTitle}>Mod Tamamlandı</Text>
            <Text style={s.finishedSub}>
              {sessionFavorites.length > 0
                ? `${sessionFavorites.length} soruyu favorilediniz`
                : 'Tüm kartları tamamladınız'}
            </Text>
          </View>

          {sessionFavorites.length > 0 && (
            <View style={s.favSection}>
              <View style={s.favSectionHeader}>
                <Text style={s.favSectionTitle}>Favorilenen Sorular</Text>
                <View style={[s.favCount, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
                  <Text style={[s.favCountText, { color: catColor }]}>{sessionFavorites.length}</Text>
                </View>
              </View>
              {sessionFavorites.map((question, i) => (
                <View key={i} style={[s.favItem, { borderLeftColor: catColor }]}>
                  <Text style={s.favItemNumber}>{i + 1}</Text>
                  <Text style={s.favItemQuestion}>{question}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={s.finishedActions}>
            <TouchableOpacity onPress={restartGame} activeOpacity={0.84}>
              <LinearGradient
                colors={[catColor, catColor + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.finishedBtn}
              >
                <Text style={s.finishedBtnText}>Tekrar Oyna</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.finishedBtn, s.finishedBtnSecondary]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              activeOpacity={0.75}
            >
              <Text style={[s.finishedBtnText, { color: theme.colors.text }]}>Ana Sayfa</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentCard = modCards[currentIndex];
  const nextCard = modCards[currentIndex + 1];
  const progress = (currentIndex + 1) / totalCards;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.shareCaptureHost} pointerEvents="none">
        <QuestionShareCard
          ref={shareCardRef}
          question={currentCard}
          label={`${mod.emoji}  ${upperTR(mod.title)}`}
          color={catColor}
        />
      </View>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Feather name="x" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.categoryName}>{category?.icon} {category?.name}</Text>
          <Text style={s.deckSubtitle}>{mod.level} · {currentIndex + 1}/{totalCards}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress Bar */}
      <View style={s.progressTrack}>
        <Animated.View
          style={[s.progressFill, { width: `${progress * 100}%`, backgroundColor: catColor }]}
        />
      </View>

      {/* Confetti layer — rendered above everything */}
      {showConfetti && <Confetti color={catColor} />}

      {/* Cards Area */}
      <View style={s.cardArea}>
        {nextCard && (
          <Animated.View
            style={[
              s.card,
              s.cardBack,
              { backgroundColor: theme.colors.surface, transform: [{ scale: backCardScale }, { translateY: 16 }] },
            ]}
          >
            <View style={[s.cardTopStripe, { backgroundColor: catColor, opacity: 0.5 }]} />
          </Animated.View>
        )}

        <Animated.View
          style={[
            s.card,
            {
              shadowColor: theme.isDark ? catColor : '#000',
              shadowOpacity: theme.isDark ? 0.45 : 0.28,
              transform: [
                { perspective: 1000 },
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
                { rotateY },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FAFAFE']}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#E74C3C', opacity: skipBgOpacity }]} />
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#27AE60', opacity: favBgOpacity }]} />
          {/* Threshold glow pulses */}
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#E74C3C', opacity: skipGlowOpacity }]} />
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#27AE60', opacity: favGlowOpacity }]} />

          <View style={[s.cardTopStripe, { backgroundColor: catColor }]} />

          <Animated.View style={[s.swipeLabel, s.skipLabel, { opacity: skipOpacity }]}>
            <View style={[s.swipeLabelBg, { backgroundColor: '#E74C3C18', borderColor: '#E74C3C' }]} />
            <Text style={[s.swipeLabelText, { color: '#E74C3C' }]}>GEÇ</Text>
          </Animated.View>

          <Animated.View style={[s.swipeLabel, s.favLabel, { opacity: favoriteOpacity }]}>
            <View style={[s.swipeLabelBg, { backgroundColor: '#27AE6018', borderColor: '#27AE60' }]} />
            <Text style={[s.swipeLabelText, { color: '#27AE60' }]}>FAVORİ</Text>
          </Animated.View>

          <View style={s.cardInner}>
            <Text style={[s.cardCategory, { color: catColor }]}>
              {mod.emoji}  {upperTR(mod.title)}
            </Text>
            <Text style={s.cardQuestion}>{currentCard}</Text>
            <View style={s.hintRow}>
              <View style={s.hintPill}>
                <Feather name="arrow-left" size={12} color="#E74C3C" />
                <Text style={[s.hintPillText, { color: '#E74C3C' }]}>Geç</Text>
              </View>
              <View style={s.hintDot} />
              <View style={s.hintPill}>
                <Text style={[s.hintPillText, { color: '#27AE60' }]}>Favorile</Text>
                <Feather name="arrow-right" size={12} color="#27AE60" />
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={[s.actions, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={() => swipeCard('left')} activeOpacity={0.82}>
          <LinearGradient colors={['#FF4757', '#C0392B']} style={s.actionBtn}>
            <Feather name="x" size={26} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={s.centerActions}>
          <View style={[s.progressBadge, { backgroundColor: catColor + '1A', borderColor: catColor + '44' }]}>
            <Text style={[s.progressBadgeText, { color: catColor }]}>{currentIndex + 1}/{totalCards}</Text>
          </View>
          <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.75}>
            <Feather name="share-2" size={15} color={theme.colors.textSecondary} />
            <Text style={s.shareBtnText}>Paylaş</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => swipeCard('right')} activeOpacity={0.82}>
          <LinearGradient colors={['#2ECC71', '#27AE60']} style={s.actionBtn}>
            <Feather name="heart" size={24} color="#FFFFFF" />
          </LinearGradient>
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
  shareCaptureHost: {
    position: 'absolute',
    left: -10000,
    top: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeBtnText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.1,
  },
  deckSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: CARD_MAX_WIDTH ? Math.min(width - 40, CARD_MAX_WIDTH) : width - 40,
    minHeight: height * 0.44,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 20,
  },
  cardBack: {
    opacity: 0.4,
  },
  cardTopStripe: {
    height: 7,
    width: '100%',
  },
  cardInner: {
    flex: 1,
    padding: rs(30),
    justifyContent: 'center',
  },
  swipeLabel: {
    position: 'absolute',
    top: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 10,
    overflow: 'hidden',
  },
  swipeLabelBg: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2.5,
    borderRadius: 12,
  },
  skipLabel: {
    left: 20,
    transform: [{ rotate: '-14deg' }],
  },
  favLabel: {
    right: 20,
    transform: [{ rotate: '14deg' }],
  },
  swipeLabelText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 22,
    textAlign: 'center',
  },
  cardQuestion: {
    fontSize: rf(22),
    fontWeight: '600',
    color: '#1A1545',
    lineHeight: rf(34),
    textAlign: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    gap: 12,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hintPillText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hintDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C0BBDB',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: rs(20),
    paddingBottom: rs(36),
    paddingTop: rs(14),
  },
  actionBtn: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionBtnIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerActions: {
    alignItems: 'center',
    gap: 8,
  },
  progressBadge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.25 : 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  shareFooter: {
    marginTop: 22,
    alignItems: 'center',
    gap: 6,
  },
  shareFooterDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#DDD8F0',
    marginBottom: 4,
  },
  shareFooterText: {
    fontSize: 12,
    color: '#7C78A0',
    fontWeight: '500',
  },
  shareFooterUrl: {
    fontSize: 12,
    color: '#A67C2E',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Finished screen
  finishedScroll: {
    paddingHorizontal: rs(24),
    paddingTop: rs(48),
    paddingBottom: rs(48),
  },
  finishedTop: {
    alignItems: 'center',
    marginBottom: 32,
  },
  finishedBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  finishedBadgeEmoji: {
    fontSize: 48,
  },
  finishedTitle: {
    fontSize: rf(26),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: rs(8),
  },
  finishedSub: {
    fontSize: rf(15),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: rf(22),
  },
  favSection: {
    marginBottom: 28,
  },
  favSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  favSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  favCount: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  favCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  favItemNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginTop: 2,
    minWidth: 16,
  },
  favItemQuestion: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 21,
  },
  finishedActions: {
    gap: 10,
  },
  finishedBtn: {
    width: '100%',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  finishedBtnSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  finishedBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
