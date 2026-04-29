import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  OAuthProvider,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as jsSignOut,
} from 'firebase/auth';
import { jsAuth } from '../lib/firebase';
import { deleteProfile } from '../lib/profileApi';

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
  // Manuel auth akışı (Apple/Google/email register) önce anon'u silip ardından
  // signInWithCredential çağırıyor; arada onIdTokenChanged(null) tetikleniyor.
  // Bu pencerede otomatik signInAnonymously başlatılırsa Apple sign-in ile
  // yarışıp ekranı misafir bırakıyor. Bayrak ile yarışı önle.
  const manualAuthRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(jsAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(snapshotUser(firebaseUser));
        setAuthReady(true);
      } else {
        setAuthReady(true);
        if (manualAuthRef.current) return;
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

  // Anon kullanıcı varsa, provider hesabına geçmeden önce anon'u sil.
  // linkWithCredential Apple için Firebase JS SDK'da nonce iletim bug'ıyla
  // patlıyor (auth/missing-or-invalid-nonce); ayrıca Yol 2 (anon profil
  // taşıma) backend ile gelene kadar ertelendiği için link kaybedilen bir
  // şey değil — kullanıcının anon'da yaptığı henüz hiçbir şey provider
  // hesabına taşınmıyordu. manualAuthRef flag'i deleteUser ile
  // signInWithCredential arasında otomatik anon login'i bloklar.
  const linkOrSignIn = async (credential) => {
    manualAuthRef.current = true;
    try {
      const current = jsAuth.currentUser;
      if (current?.isAnonymous) {
        try { await deleteUser(current); } catch {}
      }
      return await signInWithCredential(jsAuth, credential);
    } finally {
      manualAuthRef.current = false;
    }
  };

  const signInWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(jsAuth, email, password);
    refreshUser();
    return result;
  };

  const registerWithEmail = async (email, password) => {
    manualAuthRef.current = true;
    try {
      const current = jsAuth.currentUser;
      if (current?.isAnonymous) {
        try { await deleteUser(current); } catch {}
      }
      const result = await createUserWithEmailAndPassword(jsAuth, email, password);
      refreshUser();
      return result;
    } finally {
      manualAuthRef.current = false;
    }
  };

  const signInWithGoogleIdToken = async (idToken) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await linkOrSignIn(credential);
    refreshUser();
    return result;
  };

  const signInWithApple = async () => {
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
      { encoding: Crypto.CryptoEncoding.HEX }
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

    const result = await linkOrSignIn(credential);
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
    // Backend kaydını önce sil — token hâlâ geçerli. 204 idempotent, anon dahil.
    try {
      await deleteProfile();
    } catch {
      // Sunucu kaydı yoksa veya offline'sa Firebase silmeye devam et.
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
