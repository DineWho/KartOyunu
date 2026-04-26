import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import ScreenHeader from '../components/ScreenHeader';
import ConfirmPanel from '../components/ConfirmPanel';
import { rs, rf } from '../utils/responsive';

function relativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'şimdi';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} dk önce`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} sa önce`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} gün önce`;
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const {
    notifications, refreshNotifications, removeNotification, clearNotifications, markAllRead,
  } = useNotifications();

  const [clearVisible, setClearVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

  // Ekran açıldığında okundu olarak işaretle
  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      markAllRead();
    }
    // Sadece mount sonrası bir kez tetiklensin diye dependency boş
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id) => {
    removeNotification(id);
  };

  const handleClearAll = async () => {
    setClearVisible(false);
    await clearNotifications();
  };

  const isEmpty = notifications.length === 0;

  return (
    <SafeAreaView style={s.container}>
      <ScreenHeader
        title="Bildirimler"
        right={
          isEmpty ? null : (
            <TouchableOpacity
              hitSlop={10}
              onPress={() => setClearVisible(true)}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          )
        }
      />

      {isEmpty ? (
        <View style={s.emptyWrap}>
          <View style={[s.emptyIconWrap, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Feather name="bell" size={36} color={theme.colors.textMuted} />
          </View>
          <Text style={s.emptyTitle}>Henüz bildirim yok</Text>
          <Text style={s.emptyDesc}>
            Yeni içerikler ve duyurular burada görünecek.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.divider} />}
          renderItem={({ item }) => (
            <NotificationItem item={item} onDelete={handleDelete} />
          )}
        />
      )}

      <ConfirmPanel
        visible={clearVisible}
        onClose={() => setClearVisible(false)}
        iconName="trash-2"
        iconColor={theme.colors.danger}
        stripColor={theme.colors.danger}
        title="Tüm bildirimleri sil"
        description={'Tüm bildirim geçmişin silinecek.\n\nBu işlem geri alınamaz.'}
        confirmLabel="Evet, Tümünü Sil"
        confirmDanger
        onConfirm={handleClearAll}
      />
    </SafeAreaView>
  );
}

function NotificationItem({ item, onDelete }) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const onPressDelete = () => {
    Alert.alert(
      'Bildirimi sil',
      'Bu bildirimi silmek istediğine emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  return (
    <View style={s.itemRow}>
      <View
        style={[
          s.itemAccent,
          { backgroundColor: item.read ? 'transparent' : theme.colors.primary },
        ]}
      />
      <View style={s.itemContent}>
        <View style={s.itemTopLine}>
          <Text style={s.itemTitle} numberOfLines={1}>
            {item.title || 'Bildirim'}
          </Text>
          <Text style={s.itemTime}>{relativeTime(item.receivedAt)}</Text>
        </View>
        {item.body ? (
          <Text style={s.itemBody} numberOfLines={3}>
            {item.body}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={onPressDelete}
        hitSlop={10}
        activeOpacity={0.6}
        style={s.itemDelete}
      >
        <Feather name="x" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    list: {
      paddingVertical: rs(8),
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: rs(20),
    },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: rs(16),
      paddingVertical: rs(14),
      gap: rs(10),
    },
    itemAccent: {
      width: 4,
      height: rs(36),
      borderRadius: 2,
      marginTop: rs(2),
    },
    itemContent: {
      flex: 1,
    },
    itemTopLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: rs(8),
      marginBottom: rs(2),
    },
    itemTitle: {
      flex: 1,
      fontSize: rf(15),
      fontWeight: '700',
      color: theme.colors.text,
    },
    itemTime: {
      fontSize: rf(11),
      color: theme.colors.textMuted,
      fontWeight: '500',
    },
    itemBody: {
      fontSize: rf(13),
      color: theme.colors.textSecondary,
      lineHeight: rf(19),
    },
    itemDelete: {
      width: rs(32),
      height: rs(32),
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: rs(40),
      paddingBottom: rs(60),
    },
    emptyIconWrap: {
      width: rs(80),
      height: rs(80),
      borderRadius: rs(24),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs(20),
    },
    emptyTitle: {
      fontSize: rf(17),
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: rs(6),
    },
    emptyDesc: {
      fontSize: rf(14),
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: rf(20),
    },
  });
