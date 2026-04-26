import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { rs, rf, MODAL_MAX_WIDTH } from '../utils/responsive';

export default function ConfirmPanel({
  visible,
  onClose,
  iconName,
  iconColor,
  stripColor,
  title,
  description,
  confirmLabel,
  confirmDanger,
  onConfirm,
  cancelLabel = 'Vazgeç',
}) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  const resolvedIconColor = iconColor || theme.colors.primary;
  const resolvedStripColor = stripColor || resolvedIconColor;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[s.panel, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[s.topStrip, { backgroundColor: resolvedStripColor }]} />

          <View
            style={[
              s.iconWrap,
              {
                backgroundColor: resolvedIconColor + '14',
                borderColor: resolvedIconColor + '38',
              },
            ]}
          >
            <Feather name={iconName} size={26} color={resolvedIconColor} />
          </View>

          <Text style={s.title}>{title}</Text>
          {description ? <Text style={s.desc}>{description}</Text> : null}

          <TouchableOpacity
            style={[s.btn, confirmDanger ? s.dangerBtn : { backgroundColor: theme.colors.primary }]}
            onPress={onConfirm}
            activeOpacity={0.82}
          >
            <Feather name={iconName} size={16} color="#FFFFFF" />
            <Text style={s.dangerBtnText}>{confirmLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, s.cancelBtn, { borderColor: theme.colors.borderLight }]}
            onPress={onClose}
            activeOpacity={0.72}
          >
            <Text style={[s.cancelBtnText, { color: theme.colors.textSecondary }]}>{cancelLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,7,26,0.78)',
    justifyContent: 'center',
    paddingHorizontal: rs(28),
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: rs(24),
    paddingHorizontal: rs(22),
    paddingBottom: rs(22),
    alignSelf: 'center',
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: theme.isDark ? 0.45 : 0.18,
    shadowRadius: 36,
    elevation: 22,
  },
  topStrip: {
    height: 4,
    marginHorizontal: -rs(22),
    marginBottom: rs(24),
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
  },
  iconWrap: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: rs(18),
  },
  title: {
    fontSize: rf(21),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: rs(10),
  },
  desc: {
    fontSize: rf(14),
    color: theme.colors.textSecondary,
    lineHeight: rf(22),
    marginBottom: rs(24),
  },
  btn: {
    minHeight: rs(52),
    borderRadius: rs(14),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: rs(8),
    marginBottom: rs(10),
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    marginBottom: 0,
  },
  cancelBtnText: {
    fontSize: rf(15),
    fontWeight: '600',
  },
  dangerBtn: {
    backgroundColor: theme.colors.danger,
  },
  dangerBtnText: {
    fontSize: rf(15),
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
