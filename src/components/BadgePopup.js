import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useBadges } from '../context/BadgesContext';

export default function BadgePopup() {
  const { theme } = useTheme();
  const { badgeQueue, dismissTopBadge } = useBadges();
  const badge = badgeQueue[0] ?? null;

  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const dismissingRef = useRef(false);

  useEffect(() => {
    if (!badge) return;

    // Reset on each new badge
    dismissingRef.current = false;
    scaleAnim.setValue(0.82);
    opacityAnim.setValue(0);
    overlayAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 13, tension: 80, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
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
          {/* Accent strip */}
          <View style={[styles.strip, { backgroundColor: badge.color }]} />

          {/* Badge icon circle */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: badge.color + '20', borderColor: badge.color + '55' },
            ]}
          >
            <Feather name={badge.icon} size={34} color={badge.color} />
          </View>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>YENİ ROZET</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{badge.title}</Text>
          <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{badge.desc}</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 24,
  },
  strip: {
    height: 4,
    alignSelf: 'stretch',
    marginHorizontal: -24,
    marginBottom: 26,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 10,
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
