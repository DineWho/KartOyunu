import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Animated, PanResponder, Dimensions, TouchableOpacity,
} from 'react-native';
import { cards, categories } from '../data';
import { useTheme } from '../ThemeContext';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const LEFT_EDGE_ZONE = 22;

// JS'in toUpperCase() fonksiyonu Türkçe'de i → I yapıyor, İ yapmıyor
const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();

export default function CardScreen({ navigate, deck }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [finished, setFinished] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  // Ref to always hold the latest currentIndex — avoids stale closures in PanResponder
  const currentIndexRef = useRef(0);

  const deckCards = cards[deck.id] || [];
  const category = categories.find(c => c.id === deck.categoryId);
  const catColor = category?.color || theme.colors.primary;
  const totalCards = deckCards.length;

  // Keep ref updated so PanResponder always calls the latest swipeCard
  const swipeCardRef = useRef(null);

  const swipeCard = (direction) => {
    const idx = currentIndexRef.current;
    const toX = direction === 'right' ? width * 1.5 : -width * 1.5;

    if (direction === 'right') {
      setFavorites(prev => [...prev, deckCards[idx]]);
    }

    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 260,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      const next = idx + 1;
      if (next >= totalCards) {
        setFinished(true);
      } else {
        currentIndexRef.current = next;
        setCurrentIndex(next);
      }
    });
  };

  swipeCardRef.current = swipeCard;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Allow iOS native back gesture from left edge
      return evt.nativeEvent.pageX > LEFT_EDGE_ZONE;
    },
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy * 0.15 });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeCardRef.current('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeCardRef.current('left');
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
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

  const skipOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const favoriteOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const restartGame = () => {
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setFavorites([]);
    setFinished(false);
    position.setValue({ x: 0, y: 0 });
  };

  if (finished) {
    return (
      <SafeAreaView style={s.container}>
        <ScrollView
          contentContainerStyle={s.finishedScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.finishedTop}>
            <View style={[s.finishedBadge, { backgroundColor: catColor + '20', borderColor: catColor + '40' }]}>
              <Text style={s.finishedBadgeEmoji}>🎉</Text>
            </View>
            <Text style={s.finishedTitle}>Deste Tamamlandı</Text>
            <Text style={s.finishedSub}>
              {favorites.length > 0
                ? `${favorites.length} soruyu favorilediniz`
                : 'Tüm kartları tamamladınız'}
            </Text>
          </View>

          {/* Favorites List */}
          {favorites.length > 0 && (
            <View style={s.favSection}>
              <View style={s.favSectionHeader}>
                <Text style={s.favSectionTitle}>Favorilenen Sorular</Text>
                <View style={[s.favCount, { backgroundColor: catColor + '20', borderColor: catColor + '40' }]}>
                  <Text style={[s.favCountText, { color: catColor }]}>{favorites.length}</Text>
                </View>
              </View>
              {favorites.map((question, i) => (
                <View key={i} style={[s.favItem, { borderLeftColor: catColor }]}>
                  <Text style={s.favItemNumber}>{i + 1}</Text>
                  <Text style={s.favItemQuestion}>{question}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={s.finishedActions}>
            <TouchableOpacity
              style={[s.finishedBtn, { backgroundColor: catColor }]}
              onPress={restartGame}
            >
              <Text style={s.finishedBtnText}>Tekrar Oyna</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.finishedBtn, s.finishedBtnSecondary]}
              onPress={() => navigate('home')}
            >
              <Text style={[s.finishedBtnText, { color: theme.colors.text }]}>Ana Sayfa</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentCard = deckCards[currentIndex];
  const nextCard = deckCards[currentIndex + 1];
  const progress = (currentIndex + 1) / totalCards;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigate('deck', { deck })}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.deckName}>{deck.title}</Text>
          <Text style={s.cardCounter}>{currentIndex + 1} / {totalCards}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={s.progressTrack}>
        <Animated.View
          style={[s.progressFill, { width: `${progress * 100}%`, backgroundColor: catColor }]}
        />
      </View>

      {/* Cards Area */}
      <View style={s.cardArea}>
        {nextCard && (
          <View style={[s.card, s.cardBack]}>
            <View style={[s.cardTopStripe, { backgroundColor: catColor }]} />
            <View style={s.cardInner}>
              <Text style={s.cardQuestion}>{nextCard}</Text>
            </View>
          </View>
        )}

        <Animated.View
          style={[
            s.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[s.cardTopStripe, { backgroundColor: catColor }]} />

          <Animated.View style={[s.swipeLabel, s.skipLabel, { opacity: skipOpacity }]}>
            <Text style={[s.swipeLabelText, { color: '#E74C3C' }]}>GEÇ</Text>
          </Animated.View>

          <Animated.View style={[s.swipeLabel, s.favLabel, { opacity: favoriteOpacity }]}>
            <Text style={[s.swipeLabelText, { color: '#27AE60' }]}>FAVORİ</Text>
          </Animated.View>

          <View style={s.cardInner}>
            <Text style={[s.cardCategory, { color: catColor }]}>
              {deck.emoji}  {upperTR(deck.title)}
            </Text>
            <Text style={s.cardQuestion}>{currentCard}</Text>
            <Text style={s.swipeHint}>← geç   ·   favorile →</Text>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.roundBtn, { borderColor: '#E74C3C30' }]}
          onPress={() => swipeCard('left')}
        >
          <Text style={[s.roundBtnIcon, { color: '#E74C3C' }]}>✕</Text>
        </TouchableOpacity>

        <View style={[s.progressBadge, { backgroundColor: catColor + '1A', borderColor: catColor + '40' }]}>
          <Text style={[s.progressBadgeText, { color: catColor }]}>{currentIndex + 1}/{totalCards}</Text>
        </View>

        <TouchableOpacity
          style={[s.roundBtn, { borderColor: '#27AE6030' }]}
          onPress={() => swipeCard('right')}
        >
          <Text style={[s.roundBtnIcon, { color: '#27AE60' }]}>♥</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
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
  deckName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cardCounter: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
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
    width: width - 40,
    minHeight: height * 0.44,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 16,
  },
  cardBack: {
    transform: [{ scale: 0.94 }, { translateY: 14 }],
    opacity: 0.45,
  },
  cardTopStripe: {
    height: 6,
    width: '100%',
  },
  cardInner: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  swipeLabel: {
    position: 'absolute',
    top: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2.5,
    zIndex: 10,
  },
  skipLabel: {
    left: 20,
    borderColor: '#E74C3C',
    transform: [{ rotate: '-12deg' }],
  },
  favLabel: {
    right: 20,
    borderColor: '#27AE60',
    transform: [{ rotate: '12deg' }],
  },
  swipeLabelText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  cardQuestion: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1545',
    lineHeight: 33,
    textAlign: 'center',
  },
  swipeHint: {
    fontSize: 11,
    color: '#B8B4CC',
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  roundBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  roundBtnIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  progressBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Finished screen
  finishedScroll: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  finishedTop: {
    alignItems: 'center',
    marginBottom: 32,
  },
  finishedBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  finishedBadgeEmoji: {
    fontSize: 46,
  },
  finishedTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  finishedSub: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
    padding: 17,
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
