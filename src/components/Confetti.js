import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const PARTICLE_COUNT = 22;
const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function Particle({ color, delay }) {
  const startX = randomBetween(width * 0.1, width * 0.9);
  const endX = startX + randomBetween(-width * 0.3, width * 0.3);
  const size = randomBetween(7, 14);
  const isCircle = Math.random() > 0.5;

  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: height * randomBetween(0.55, 0.85),
          duration: randomBetween(1800, 2800),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: endX,
          duration: randomBetween(1800, 2800),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: randomBetween(-6, 6),
          duration: randomBetween(1800, 2800),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(randomBetween(1200, 1800)),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const rotateStr = rotate.interpolate({
    inputRange: [-6, 6],
    outputRange: ['-1080deg', '1080deg'],
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: isCircle ? size : size * 0.6,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateStr },
            { scale },
          ],
        },
      ]}
    />
  );
}

export default function Confetti({ color }) {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      color: i % 3 === 0 ? color : COLORS[i % COLORS.length],
      delay: i * 40,
    }))
  ).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <Particle key={p.id} color={p.color} delay={p.delay} />
      ))}
    </View>
  );
}
