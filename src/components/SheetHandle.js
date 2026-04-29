import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Animated, PanResponder, View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import { rs } from '../utils/responsive';

const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.5;
const OPEN_DURATION = 240;
const CLOSE_DURATION = 200;

const { height: SCREEN_H } = Dimensions.get('window');
const HIDE_TRANSLATE = SCREEN_H;

// Drives a bottom-sheet's open/close animation AND swipe-to-dismiss gesture.
// Returns:
//  - mounted: whether to render the underlying RN <Modal> (true while animating closed)
//  - panHandlers: spread on <SheetHandle />
//  - animatedStyle: spread on the outer Animated.View (sheet)
//  - overlayStyle: spread on the dimming overlay (Animated.View) — fades in/out
//  - requestClose: call to start the close animation; onClose runs after it finishes
export function useDismissibleSheet(visible, onClose) {
  const translateY = useRef(new Animated.Value(HIDE_TRANSLATE)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const animateClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: HIDE_TRANSLATE, duration: CLOSE_DURATION, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: CLOSE_DURATION, useNativeDriver: true }),
    ]).start(() => {
      setMounted(false);
    });
  }, [translateY, overlayOpacity]);

  const requestClose = useCallback(() => {
    onCloseRef.current?.();
  }, []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(HIDE_TRANSLATE);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: OPEN_DURATION, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: OPEN_DURATION, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      animateClose();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const panHandlers = useMemo(() => {
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) {
          requestClose();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    });
    return responder.panHandlers;
  }, [translateY, requestClose]);

  return {
    mounted,
    panHandlers,
    animatedStyle: { transform: [{ translateY }] },
    overlayStyle: { opacity: overlayOpacity },
    requestClose,
  };
}

export default function SheetHandle({ panHandlers }) {
  const { theme } = useTheme();
  return (
    <View {...panHandlers} style={styles.hitArea}>
      <View style={[styles.bar, { backgroundColor: theme.colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: rs(8),
    paddingBottom: rs(12),
  },
  bar: {
    width: rs(40),
    height: 4,
    borderRadius: 2,
  },
});
