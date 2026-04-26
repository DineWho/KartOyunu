import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const TOKEN_KEY = '@cardwho_fcm_token';
const ENABLED_KEY = '@cardwho_notifications_enabled';
const ONBOARDED_KEY = '@cardwho_notif_onboarded';

const NotificationContext = createContext({
  fcmToken: null,
  permissionGranted: false,
  notificationsEnabled: false,
  onboardingStatus: 'loading', // 'loading' | 'pending' | 'done'
  requestPermission: async () => false,
  toggleNotifications: async () => false,
  setNotificationsEnabled: () => {},
  completeOnboarding: async () => {},
});

export function NotificationProvider({ children }) {
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState('loading');
  const initRan = useRef(false);

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
    })();

    const unsubRefresh = messaging().onTokenRefresh(persistToken);

    const unsubForeground = messaging().onMessage(async () => {
      // Foreground'da gelen mesaj — şimdilik no-op,
      // gelecekte in-app banner gösterimi için.
    });

    const unsubOpened = messaging().onNotificationOpenedApp(() => {
      // Arka planda açılmış uygulamaya bildirimle dönüş — deep link burada.
    });

    messaging()
      .getInitialNotification()
      .then(() => {
        // Uygulama tamamen kapalıyken bildirimden açıldı.
      })
      .catch(() => {});

    return () => {
      unsubRefresh();
      unsubForeground();
      unsubOpened();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        fcmToken,
        permissionGranted,
        notificationsEnabled,
        onboardingStatus,
        requestPermission,
        toggleNotifications,
        setNotificationsEnabled: persistEnabled,
        completeOnboarding,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
