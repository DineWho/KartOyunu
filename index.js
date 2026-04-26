import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

import App from './App';

const HISTORY_KEY = '@cardwho_notifications';
const HISTORY_MAX = 100;

// Arka planda gelen data-only mesajlar burada işlenir. Uygulama foreground'a
// geçince NotificationContext, AppState 'active' tetiklenince history'i yeniden
// okur — bu sayede arka planda yazılanlar listede görünür.
//
// Not: notification payload'ı içeren FCM mesajları OS tarafından gösterilir,
// JS uyandırılmaz; bunlar yalnızca kullanıcı bildirime tıklarsa
// onNotificationOpenedApp / getInitialNotification ile yakalanır.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  try {
    const id =
      remoteMessage?.messageId ||
      `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id,
      title:
        remoteMessage?.notification?.title ||
        remoteMessage?.data?.title ||
        null,
      body:
        remoteMessage?.notification?.body ||
        remoteMessage?.data?.body ||
        null,
      data: remoteMessage?.data ? { ...remoteMessage.data } : {},
      receivedAt: Date.now(),
      read: false,
      source: 'background-data',
    };
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = Array.isArray(list) ? list.filter((n) => n.id !== id) : [];
    filtered.unshift(record);
    const capped = filtered.slice(0, HISTORY_MAX);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
  } catch {
    // Sessizce geç — background handler asla throw etmemeli
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
