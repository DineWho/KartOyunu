import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../ThemeContext';
import { useBadges } from '../context/BadgesContext';
import { useAudio } from '../context/AudioContext';

// 4 sparkle dots positioned N/E/S/W around the icon
const SPARKLE_ANGLES = [0, 90, 180, 270];
const SPARKLE_RADIUS = 60;

function SparkleParticle({ angle, color, anim }) {
  const rad = (angle * Math.PI) / 180;
  const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * SPARKLE_RADIUS] });
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * SPARKLE_RADIUS] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1.4, 0.6] });

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { backgroundColor: color, opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale }] },
      ]}
    />
  );
}

export default function BadgePopup() {
  const { theme } = useTheme();
  const { badgeQueue, dismissTopBadge } = useBadges();
  const { playSound } = useAudio();
  const badge = badgeQueue[0] ?? null;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(12)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(SPARKLE_ANGLES.map(() => new Animated.Value(0))).current;
  const dismissingRef = useRef(false);

  useEffect(() => {
    if (!badge) return;

    dismissingRef.current = false;
    scaleAnim.setValue(0);
    iconScaleAnim.setValue(0);
    opacityAnim.setValue(0);
    overlayAnim.setValue(0);
    textSlideAnim.setValue(12);
    textOpacityAnim.setValue(0);
    sparkleAnims.forEach(a => a.setValue(0));

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound('badge_earn');

    Animated.sequence([
      // 1. Backdrop
      Animated.timing(overlayAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      // 2. Panel overshoot spring
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
      // 3. Icon pop + sparkles + text (staggered)
      Animated.parallel([
        Animated.spring(iconScaleAnim, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true }),
        Animated.stagger(40, sparkleAnims.map(a =>
          Animated.timing(a, { toValue: 1, duration: 500, useNativeDriver: true })
        )),
        Animated.sequence([
          Animated.delay(80),
          Animated.parallel([
            Animated.timing(textSlideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            Animated.timing(textOpacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
          ]),
        ]),
      ]),
    ]).start();

    const timer = setTimeout(handleDismiss, 3500);
    return () => clearTimeout(timer);
  }, [badge?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = () => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;

    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      dismissTopBadge();
      dismissingRef.current = false;
    });
  };

  if (!badge) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleDismiss}>
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleDismiss} activeOpacity={1} />

        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Accent strip — flush to top, clipped by panel borderRadius */}
          <View style={[styles.strip, { backgroundColor: badge.color }]} />

          {/* Content with horizontal padding */}
          <View style={styles.panelContent}>
            {/* Icon + sparkles container */}
            <View style={styles.iconContainer}>
              {SPARKLE_ANGLES.map((angle, i) => (
                <SparkleParticle key={angle} angle={angle} color={badge.color} anim={sparkleAnims[i]} />
              ))}
              <Animated.View
                style={[
                  styles.iconCircle,
                  { backgroundColor: badge.color + '20', borderColor: badge.color + '55' },
                  { transform: [{ scale: iconScaleAnim }] },
                ]}
              >
                <Feather name={badge.icon} size={34} color={badge.color} />
              </Animated.View>
            </View>

            <Animated.View style={{ transform: [{ translateY: textSlideAnim }], opacity: textOpacityAnim }}>
              <Text style={[styles.label, { color: theme.colors.textMuted }]}>YENİ ROZET</Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>{badge.title}</Text>
              <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{badge.desc}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,7,26,0.74)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  panel: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 24,
  },
  strip: {
    height: 6,
    alignSelf: 'stretch',
    marginBottom: 26,
  },
  panelContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  iconContainer: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
