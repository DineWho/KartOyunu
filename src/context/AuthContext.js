import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  OAuthProvider,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as jsSignOut,
} from 'firebase/auth';
import { jsAuth } from '../lib/firebase';
import { deleteUserProfile } from '../lib/firestore';

const PROFILE_CACHE_PREFIX = '@cardwho_user_profile_';

// signOut/deleteAccount sonrası başka bir kullanıcı login olduğunda eski
// profilin bir frame için görünmesini engellemek için tüm cache key'leri sil.
async function clearAllProfileCaches() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter((k) => k.startsWith(PROFILE_CACHE_PREFIX));
    if (profileKeys.length) await AsyncStorage.multiRemove(profileKeys);
  } catch {
    // Sessizce geç — signOut akışı asla bunun yüzünden bloke olmasın.
  }
}

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_IOS_CLIENT_ID =
  '953093478907-8851vo8vkt2mfdvmh6fate6kcu4bn691.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID =
  '953093478907-0rcm7no4djkundi1npbb0lu88gtjcs75.apps.googleusercontent.com';
export const GOOGLE_WEB_CLIENT_ID =
  '953093478907-r82poh07p24a9s9o9ltupdvok5e7brr4.apps.googleusercontent.com';

const AuthContext = createContext(null);

// Firebase Auth user'ını React state'e koymak için sade bir snapshot.
// linkWithCredential gibi mutasyonlardan sonra yeniden oluşturmak referans
// karşılaştırmalarını çalıştırıyor.
const snapshotUser = (firebaseUser) =>
  firebaseUser
    ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAnonymous: firebaseUser.isAnonymous,
        providerData: firebaseUser.providerData,
        metadata: {
          creationTime: firebaseUser.metadata?.creationTime,
          lastSignInTime: firebaseUser.metadata?.lastSignInTime,
        },
      }
    : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(jsAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(snapshotUser(firebaseUser));
        setAuthReady(true);
      } else {
        setAuthReady(true);
        try {
          await signInAnonymously(jsAuth);
        } catch {
          // Offline ise sorun değil, uygulama çalışmaya devam eder
        }
      }
    });
    return unsubscribe;
  }, []);

  const refreshUser = () => {
    if (jsAuth.currentUser) setUser(snapshotUser(jsAuth.currentUser));
  };

  const signInWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(jsAuth, email, password);
    refreshUser();
    return result;
  };

  const registerWithEmail = async (email, password) => {
    const credential = EmailAuthProvider.credential(email, password);
    const current = jsAuth.currentUser;
    const result = current?.isAnonymous
      ? await linkWithCredential(current, credential)
      : await createUserWithEmailAndPassword(jsAuth, email, password);
    refreshUser();
    return result;
  };

  const signInWithGoogleIdToken = async (idToken) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const current = jsAuth.currentUser;
    const result = current?.isAnonymous
      ? await linkWithCredential(current, credential)
      : await signInWithCredential(jsAuth, credential);
    refreshUser();
    return result;
  };

  const signInWithApple = async () => {
    const rawNonce = Math.random().toString(36).substring(2, 18);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );

    const appleResult = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const { identityToken } = appleResult;
    if (!identityToken) throw new Error('Apple sign-in: no identity token');

    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce,
    });

    const current = jsAuth.currentUser;
    const result = current?.isAnonymous
      ? await linkWithCredential(current, credential)
      : await signInWithCredential(jsAuth, credential);
    refreshUser();
    return result;
  };

  const signOut = async () => {
    await clearAllProfileCaches();
    await jsSignOut(jsAuth);
  };

  const sendPasswordReset = (email) => sendPasswordResetEmail(jsAuth, email);

  // 'auth/requires-recent-login' fırlatabilir → çağıran tarafı yakalayıp
  // kullanıcıyı yeniden giriş yapmaya yönlendirir.
  const deleteAccount = async () => {
    const current = jsAuth.currentUser;
    if (!current) throw new Error('No current user');
    const uid = current.uid;
    const wasAnonymous = current.isAnonymous;
    // Önce Firestore doc'u sil; auth user silinince request.auth.uid null
    // olacak ve security rules yazımı reddedecek. Anonim user'ın doc'u
    // zaten yok (rules engelliyor), o yüzden anonim için atla.
    if (!wasAnonymous) {
      try {
        await deleteUserProfile(uid);
      } catch {
        // Doc yoksa veya offline'sa sessizce geç; auth silme işlemi devam etsin.
      }
    }
    await clearAllProfileCaches();
    await deleteUser(current);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAnonymous: user?.isAnonymous ?? true,
        signInWithEmail,
        registerWithEmail,
        signInWithGoogleIdToken,
        signInWithApple,
        signOut,
        sendPasswordReset,
        deleteAccount,
        GOOGLE_WEB_CLIENT_ID,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
