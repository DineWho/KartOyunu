import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const GLOW_SIZE = screenWidth * 0.75;
const CARD_SCALE = Math.min(screenWidth / 390, 1.45);

export default function SplashScreen({ onFinish }) {
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsScale = useRef(new Animated.Value(0.65)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(22)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.4)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 0.28, duration: 700, useNativeDriver: true }),
        Animated.spring(glowScale, { toValue: 1, friction: 4, tension: 28, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardsScale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
        Animated.timing(cardsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(logoTranslateY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
      ]),
      Animated.delay(220),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(screenOpacity, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={['#07071A', '#0C0C26', '#07071A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[
        styles.glow,
        { opacity: glowOpacity, transform: [{ scale: glowScale }] },
      ]} />

      <Animated.View style={[
        styles.cardsArea,
        { opacity: cardsOpacity, transform: [{ scale: cardsScale }] },
      ]}>
        <View style={[styles.card, styles.cardLeft]} />
        <View style={[styles.card, styles.cardRight]} />
        <View style={[styles.card, styles.cardCenter]}>
          <Text style={styles.cardCenterMark}>✦</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[
        styles.title,
        { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] },
      ]}>
        CardWho
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Sessizliği bitiren modlar
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07071A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: '#D4A843',
    shadowColor: '#D4A843',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 90,
    elevation: 0,
  },
  cardsArea: {
    width: Math.round(150 * CARD_SCALE),
    height: Math.round(158 * CARD_SCALE),
    position: 'relative',
    marginBottom: Math.round(44 * CARD_SCALE),
  },
  card: {
    position: 'absolute',
    width: Math.round(88 * CARD_SCALE),
    height: Math.round(122 * CARD_SCALE),
    borderRadius: Math.round(18 * CARD_SCALE),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.7,
    shadowRadius: 22,
    elevation: 16,
  },
  cardLeft: {
    left: 0,
    top: Math.round(20 * CARD_SCALE),
    backgroundColor: '#E94560',
    transform: [{ rotate: '-14deg' }],
    opacity: 0.85,
  },
  cardRight: {
    right: 0,
    top: Math.round(20 * CARD_SCALE),
    backgroundColor: '#3498DB',
    transform: [{ rotate: '14deg' }],
    opacity: 0.85,
  },
  cardCenter: {
    left: Math.round(31 * CARD_SCALE),
    top: Math.round(4 * CARD_SCALE),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenterMark: {
    fontSize: Math.round(34 * CARD_SCALE),
    color: '#D4A843',
    fontWeight: '700',
  },
  title: {
    fontSize: Math.round(40 * CARD_SCALE),
    fontWeight: '800',
    color: '#F0ECFF',
    letterSpacing: -1.2,
    marginBottom: Math.round(10 * CARD_SCALE),
  },
  tagline: {
    fontSize: Math.round(14 * CARD_SCALE),
    color: '#9490B8',
    letterSpacing: 0.6,
  },
});
