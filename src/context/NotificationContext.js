import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const TOKEN_KEY = '@cardwho_fcm_token';
const ENABLED_KEY = '@cardwho_notifications_enabled';
const ONBOARDED_KEY = '@cardwho_notif_onboarded';
const HISTORY_KEY = '@cardwho_notifications';
const HISTORY_MAX = 100;

const NotificationContext = createContext({
  fcmToken: null,
  permissionGranted: false,
  notificationsEnabled: false,
  onboardingStatus: 'loading', // 'loading' | 'pending' | 'done'
  notifications: [],
  unreadCount: 0,
  requestPermission: async () => false,
  toggleNotifications: async () => false,
  setNotificationsEnabled: () => {},
  completeOnboarding: async () => {},
  refreshNotifications: async () => {},
  removeNotification: async () => {},
  clearNotifications: async () => {},
  markAllRead: async () => {},
});

function makeNotificationRecord(remoteMessage, source) {
  const id =
    remoteMessage?.messageId ||
    `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const title =
    remoteMessage?.notification?.title ||
    remoteMessage?.data?.title ||
    null;
  const body =
    remoteMessage?.notification?.body ||
    remoteMessage?.data?.body ||
    null;
  const data = remoteMessage?.data ? { ...remoteMessage.data } : {};
  return {
    id,
    title,
    body,
    data,
    receivedAt: Date.now(),
    read: source === 'opened' || source === 'cold-open',
    source: source || 'foreground',
  };
}

async function persistAppendNotification(record) {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Aynı id varsa güncelleme: mevcutu çıkar
    const filtered = Array.isArray(list) ? list.filter((n) => n.id !== record.id) : [];
    filtered.unshift(record);
    const capped = filtered.slice(0, HISTORY_MAX);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
    return capped;
  } catch {
    return null;
  }
}

export function NotificationProvider({ children }) {
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState('loading');
  const [notifications, setNotifications] = useState([]);
  const initRan = useRef(false);

  const loadNotifications = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (!raw) {
        setNotifications([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setNotifications(Array.isArray(parsed) ? parsed : []);
    } catch {
      setNotifications([]);
    }
  }, []);

  const addNotification = useCallback(async (remoteMessage, source) => {
    const record = makeNotificationRecord(remoteMessage, source);
    const next = await persistAppendNotification(record);
    if (next) setNotifications(next);
  }, []);

  const removeNotification = useCallback(async (id) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.read ? n : { ...n, read: true }));
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const persistEnabled = async (value) => {
    setNotificationsEnabledState(value);
    try {
      await AsyncStorage.setItem(ENABLED_KEY, value ? '1' : '0');
    } catch {}
  };

  const completeOnboarding = async () => {
    setOnboardingStatus('done');
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    } catch {}
  };

  const persistToken = async (token) => {
    if (!token) return;
    setFcmToken(token);
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch {}
  };

  const fetchAndStoreToken = async () => {
    try {
      const token = await messaging().getToken();
      await persistToken(token);
    } catch {
      // Sessizce geç
    }
  };

  const requestPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(false);
          return false;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      setPermissionGranted(enabled);
      if (enabled) await fetchAndStoreToken();
      return enabled;
    } catch {
      setPermissionGranted(false);
      return false;
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      await persistEnabled(false);
      return false;
    }
    if (!permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        await persistEnabled(false);
        return false;
      }
    }
    await persistEnabled(true);
    return true;
  };

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    (async () => {
      try {
        const cached = await AsyncStorage.getItem(TOKEN_KEY);
        if (cached) setFcmToken(cached);

        const storedEnabled = await AsyncStorage.getItem(ENABLED_KEY);
        const storedOnboarded = await AsyncStorage.getItem(ONBOARDED_KEY);

        const status = await messaging().hasPermission();
        const granted =
          status === messaging.AuthorizationStatus.AUTHORIZED ||
          status === messaging.AuthorizationStatus.PROVISIONAL;
        setPermissionGranted(granted);

        if (storedEnabled === null) {
          setNotificationsEnabledState(granted);
        } else {
          setNotificationsEnabledState(storedEnabled === '1' && granted);
        }

        if (granted) await fetchAndStoreToken();

        if (storedOnboarded === '1' || granted) {
          setOnboardingStatus('done');
        } else {
          setOnboardingStatus('pending');
        }
      } catch {
        setOnboardingStatus('done');
      }

      await loadNotifications();
    })();

    const unsubRefresh = messaging().onTokenRefresh(persistToken);

    const unsubForeground = messaging().onMessage(async (remoteMessage) => {
      addNotification(remoteMessage, 'foreground');
    });

    const unsubOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      addNotification(remoteMessage, 'opened');
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) addNotification(remoteMessage, 'cold-open');
      })
      .catch(() => {});

    // Arka planda gelen mesajlar index.js'teki setBackgroundMessageHandler ile
    // doğrudan AsyncStorage'a yazılır. Uygulama foreground'a geçtiğinde state
    // tazeleyebilmek için AppState dinleyicisi var.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadNotifications();
    });

    return () => {
      unsubRefresh();
      unsubForeground();
      unsubOpened();
      sub.remove();
    };
  }, [loadNotifications, addNotification]);

  const unreadCount = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);

  return (
    <NotificationContext.Provider
      value={{
        fcmToken,
        permissionGranted,
        notificationsEnabled,
        onboardingStatus,
        notifications,
        unreadCount,
        requestPermission,
        toggleNotifications,
        setNotificationsEnabled: persistEnabled,
        completeOnboarding,
        refreshNotifications: loadNotifications,
        removeNotification,
        clearNotifications,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
