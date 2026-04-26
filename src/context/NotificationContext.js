import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const TOKEN_KEY = '@cardwho_fcm_token';

const NotificationContext = createContext({
  fcmToken: null,
  permissionGranted: false,
  requestPermission: async () => false,
});

export function NotificationProvider({ children }) {
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const initRan = useRef(false);

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

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    (async () => {
      try {
        const cached = await AsyncStorage.getItem(TOKEN_KEY);
        if (cached) setFcmToken(cached);

        const status = await messaging().hasPermission();
        const granted =
          status === messaging.AuthorizationStatus.AUTHORIZED ||
          status === messaging.AuthorizationStatus.PROVISIONAL;
        setPermissionGranted(granted);

        if (granted) await fetchAndStoreToken();
      } catch {}
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
    <NotificationContext.Provider value={{ fcmToken, permissionGranted, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
