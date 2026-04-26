import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_IOS_CLIENT_ID =
  '953093478907-8851vo8vkt2mfdvmh6fate6kcu4bn691.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID =
  '953093478907-0rcm7no4djkundi1npbb0lu88gtjcs75.apps.googleusercontent.com';
export const GOOGLE_WEB_CLIENT_ID =
  '953093478907-r82poh07p24a9s9o9ltupdvok5e7brr4.apps.googleusercontent.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // authReady: Firebase bağlantısı kuruldu mu (true olunca uygulama açılır)
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthReady(true);
      } else {
        // Anonim giriş başlat, ama uygulamanın açılmasını bekleme
        setAuthReady(true);
        try {
          await auth().signInAnonymously();
        } catch {
          // Offline ise sorun değil, uygulama çalışmaya devam eder
        }
      }
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = (email, password) =>
    auth().signInWithEmailAndPassword(email, password);

  const registerWithEmail = async (email, password) => {
    const credential = auth.EmailAuthProvider.credential(email, password);
    if (user?.isAnonymous) {
      return user.linkWithCredential(credential);
    }
    return auth().createUserWithEmailAndPassword(email, password);
  };

  // LoginScreen'den expo-auth-session ile alınan Google id_token buraya gelir
  const signInWithGoogleIdToken = async (idToken) => {
    const credential = auth.GoogleAuthProvider.credential(idToken);
    if (user?.isAnonymous) {
      return user.linkWithCredential(credential);
    }
    return auth().signInWithCredential(credential);
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

    const appleProvider = auth.AppleAuthProvider;
    const credential = appleProvider.credential(identityToken, rawNonce);

    if (user?.isAnonymous) {
      return user.linkWithCredential(credential);
    }
    return auth().signInWithCredential(credential);
  };

  const signOut = () => auth().signOut();

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
        GOOGLE_WEB_CLIENT_ID,
      }}
    >
      {/* authReady olmasa da children render et — uygulama bloke olmaz */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
