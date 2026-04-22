import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Cards fan in
      Animated.parallel([
        Animated.spring(cardsScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(cardsOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(120),
      // Title slides up + fades in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(logoTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(240),
      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(1000),
      // Everything fades out
      Animated.parallel([
        Animated.timing(cardsOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>

      {/* Fanned cards visual */}
      <Animated.View style={[
        styles.cardsArea,
        { opacity: cardsOpacity, transform: [{ scale: cardsScale }] },
      ]}>
        <View style={[styles.card, styles.cardLeft, { backgroundColor: '#E94560' }]} />
        <View style={[styles.card, styles.cardRight, { backgroundColor: '#3498DB' }]} />
        <View style={[styles.card, styles.cardCenter]}>
          <Text style={styles.cardCenterMark}>✦</Text>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[
        styles.title,
        { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] },
      ]}>
        KartOyunu
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Sessizliği bitiren desteler
      </Animated.Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsArea: {
    width: 140,
    height: 148,
    position: 'relative',
    marginBottom: 36,
  },
  card: {
    position: 'absolute',
    width: 84,
    height: 116,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  cardLeft: {
    left: 0,
    top: 18,
    transform: [{ rotate: '-13deg' }],
    opacity: 0.75,
  },
  cardRight: {
    right: 0,
    top: 18,
    transform: [{ rotate: '13deg' }],
    opacity: 0.75,
  },
  cardCenter: {
    left: 28,
    top: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenterMark: {
    fontSize: 32,
    color: '#D4A843',
    fontWeight: '700',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#EDE9FF',
    letterSpacing: -1,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#9490B8',
    letterSpacing: 0.4,
  },
});
