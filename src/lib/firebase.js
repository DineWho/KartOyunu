import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Console > Project Settings > General'dan alınan native config.
// JS SDK platform-agnostic; aynı projeye bağlanır, RNFB Auth ile uid'leri
// paylaşır (aynı credential ile login olduğunda).
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

export const db = getFirestore(app);
export default app;
