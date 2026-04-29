import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// Firebase Console > Project Settings > General'dan alınan native config.
// JS SDK platform-agnostic. Auth JS SDK üzerinden, Messaging + Remote Config
// + Analytics @react-native-firebase üzerinden çalışıyor; aynı Firebase
// projesine bağlanırlar. Profil/oyun verisi backend'de (api.cardwho.com).
const firebaseConfig = {
  apiKey: 'AIzaSyCOVYPxo5UUL_-tiheR3ZZcBB2gLwmmmAw',
  authDomain: 'cardwho.firebaseapp.com',
  projectId: 'cardwho',
  storageBucket: 'cardwho.firebasestorage.app',
  messagingSenderId: '953093478907',
  appId: '1:953093478907:ios:f329e1a97606643897935e',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// React Native'de Auth persistence default'ta yok; AsyncStorage backend'i
// vermek zorunluyuz, yoksa cold-start sonrası user kaybolur.
export const jsAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
