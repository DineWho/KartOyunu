import React, { useMemo, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, Animated, Dimensions, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useStats } from '../context/StatsContext';
import QuestionShareCard from '../components/QuestionShareCard';
import { shareQuestionCard } from '../utils/shareQuestionCard';

const { width, height } = Dimensions.get('window');

const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();

function CardModal({ visible, fav, onClose, onRemove, theme }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardRef = useRef(null);
  const { addStat } = useStats();

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 10,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleShare = async () => {
    if (!fav) return;

    const didShare = await shareQuestionCard({
      cardRef,
      message: `"${fav.question}"\n\n— KartOyunu ile oynuyoruz 🎴`,
      title: 'KartOyunu',
      filename: 'kartoyunu-favori-soru',
    });

    if (didShare) {
      addStat(`${fav.modId}-${fav.question}`, fav.modId, 'share');
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Favoriden Kaldır',
      'Bu soruyu favorilerinden kaldırmak istediğine emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => {
            onRemove(fav.question, fav.modId);
            onClose();
          },
        },
      ]
    );
  };

  if (!fav) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        {/* Close button — sağ üst */}
        <TouchableOpacity
          style={[styles.closeBtn, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }]}
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.75}
        >
          <Feather name="x" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Card */}
        <View style={[styles.card, {
            shadowColor: fav.catColor,
            shadowOpacity: 0.25,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 16,
          }]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FAFAFE']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.cardStripe, { backgroundColor: fav.catColor }]} />
          <View style={styles.cardInner}>
            <Text style={[styles.cardDeckLabel, { color: fav.catColor }]}>
              {fav.modEmoji}  {upperTR(fav.modTitle)}
            </Text>
            <Text style={styles.cardQuestion}>{fav.question}</Text>
          </View>
        </View>

        <View style={styles.shareCaptureHost} pointerEvents="none">
          <QuestionShareCard
            ref={cardRef}
            question={fav.question}
            label={`${fav.modEmoji}  ${upperTR(fav.modTitle)}`}
            color={fav.catColor}
            minHeight={height * 0.34}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }]}
            onPress={handleRemove}
            activeOpacity={0.75}
          >
            <Feather name="trash-2" size={18} color={theme.colors.danger} />
            <Text style={[styles.actionBtnText, { color: theme.colors.danger }]}>Kaldır</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.84}
            style={styles.shareBtn}
          >
            <LinearGradient
              colors={[fav.catColor, fav.catColor + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shareBtnGradient}
            >
              <Feather name="share-2" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Paylaş</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  shareCaptureHost: {
    position: 'absolute',
    left: -10000,
    top: 0,
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 16,
    backgroundColor: 'transparent',
    alignItems: 'stretch',
  },
  dragHandleRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: height * 0.34,
    marginBottom: 16,
  },
  cardStripe: {
    height: 7,
    width: '100%',
  },
  cardInner: {
    padding: 30,
    justifyContent: 'center',
    minHeight: height * 0.27,
  },
  cardDeckLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 22,
  },
  cardQuestion: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1545',
    lineHeight: 34,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  shareBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { favorites, removeFavorite } = useFavorites();
  const [selectedFav, setSelectedFav] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const grouped = useMemo(() => {
    const map = {};
    favorites.forEach(fav => {
      if (!map[fav.modId]) {
        map[fav.modId] = {
          modId: fav.modId,
          modTitle: fav.modTitle,
          modEmoji: fav.modEmoji,
          catColor: fav.catColor,
          items: [],
        };
      }
      map[fav.modId].items.push(fav);
    });
    return Object.values(map);
  }, [favorites]);

  const openCard = (fav) => {
    setSelectedFav(fav);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Favoriler</Text>
          <Text style={s.headerSub}>Beğendiğin soruları burada bul</Text>
        </View>
        <View style={s.emptyState}>
          <Feather name="heart" size={52} color={theme.colors.primary} style={{ marginBottom: 20 }} />
          <Text style={s.emptyTitle}>Henüz favori yok</Text>
          <Text style={s.emptyDesc}>
            Kart oynarken sağa kaydır — soru bu ekranda görünür.
          </Text>
          <TouchableOpacity
            style={[s.emptyBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.84}
          >
            <Text style={s.emptyBtnText}>Oynamaya Başla</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Favoriler</Text>
        <Text style={s.headerSub}>{favorites.length} favori soru</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {grouped.map(group => (
          <View key={group.modId} style={s.group}>
            <View style={s.groupHeader}>
              <View style={[s.groupIconWrap, { backgroundColor: group.catColor + '22' }]}>
                <Text style={s.groupIcon}>{group.modEmoji}</Text>
              </View>
              <View style={s.groupMeta}>
                <Text style={s.groupTitle}>{group.modTitle}</Text>
                <Text style={s.groupCount}>{group.items.length} soru</Text>
              </View>
            </View>

            {group.items.map((fav, i) => (
              <TouchableOpacity
                key={i}
                style={[s.favItem, { borderLeftColor: group.catColor }]}
                onPress={() => openCard(fav)}
                activeOpacity={0.7}
              >
                <Text style={s.favQuestion}>{fav.question}</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      <CardModal
        visible={modalVisible}
        fav={selectedFav}
        onClose={closeModal}
        onRemove={removeFavorite}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  headerSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  group: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  groupIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIcon: {
    fontSize: 22,
  },
  groupMeta: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.1,
  },
  groupCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderLeftWidth: 3,
    gap: 12,
  },
  favQuestion: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 21,
  },
});
