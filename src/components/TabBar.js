import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 32;
const TAB_COUNT = 4;
const INDICATOR_WIDTH = TAB_BAR_WIDTH / TAB_COUNT - 8;

const TABS = [
  { key: 'Home',      label: 'Ana Sayfa', icon: 'home' },
  { key: 'Favorites', label: 'Favoriler', icon: 'heart' },
  { key: 'Settings',  label: 'Ayarlar',   icon: 'settings' },
  { key: 'Profile',   label: 'Profil',    icon: 'user' },
];

export default function TabBar({ state, navigation }) {
  const { theme, isDark } = useTheme();
  const { favorites } = useFavorites();
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;

  const activeIndex = state.index;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeIndex,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  const handlePress = (tab, index) => {
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.85, useNativeDriver: true, friction: 12, tension: 200 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: true, friction: 6, tension: 100 }),
    ]).start();
    navigation.navigate(tab.key);
  };

  const indicatorX = indicatorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [4, TAB_BAR_WIDTH / 4 + 4, (TAB_BAR_WIDTH / 4) * 2 + 4, (TAB_BAR_WIDTH / 4) * 3 + 4],
  });

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, {
        backgroundColor: isDark ? 'rgba(13,13,40,0.96)' : 'rgba(255,255,255,0.96)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      }]}>
        {/* Sliding indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: INDICATOR_WIDTH,
              backgroundColor: isDark ? 'rgba(212,168,67,0.15)' : 'rgba(107,79,168,0.1)',
              borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(107,79,168,0.2)',
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />

        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          const activeColor = isDark ? '#D4A843' : '#6B4FA8';
          const inactiveColor = isDark ? '#5C5880' : '#8B87A8';
          const hasBadge = tab.key === 'Favorites' && favorites.length > 0;

          return (
            <Animated.View
              key={tab.key}
              style={[styles.tabWrapper, { transform: [{ scale: scaleAnims[index] }] }]}
            >
              <TouchableOpacity
                style={styles.tab}
                onPress={() => handlePress(tab, index)}
                activeOpacity={1}
              >
                <View style={styles.iconWrapper}>
                  <Feather
                    name={tab.icon}
                    size={isActive ? 22 : 21}
                    color={isActive ? activeColor : inactiveColor}
                  />
                  {hasBadge && (
                    <View style={[styles.badge, { backgroundColor: activeColor }]}>
                      <Text style={styles.badgeText}>
                        {favorites.length > 99 ? '99+' : favorites.length}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.tabLabel,
                  { color: isActive ? activeColor : inactiveColor },
                  isActive && styles.tabLabelActive,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  container: {
    width: TAB_BAR_WIDTH,
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 6,
    height: 48,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
