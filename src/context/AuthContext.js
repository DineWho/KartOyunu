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

  // Firebase user objesi linkWithCredential sonrası referansı korur,
  // bu yüzden React'i yeniden render ettirmek için yeni bir snapshot üretiyoruz.
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
          linkWithCredential: firebaseUser.linkWithCredential?.bind(firebaseUser),
          reload: firebaseUser.reload?.bind(firebaseUser),
        }
      : null;

  useEffect(() => {
    // onIdTokenChanged hem sign-in/sign-out hem de linkWithCredential gibi
    // credential değişikliklerinde tetiklenir. onAuthStateChanged tek başına
    // linkleme sonrası fire etmez → React state stale kalırdı.
    const unsubscribe = auth().onIdTokenChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(snapshotUser(firebaseUser));
        setAuthReady(true);
      } else {
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

  const refreshUser = () => {
    const current = auth().currentUser;
    if (current) setUser(snapshotUser(current));
  };

  const signInWithEmail = async (email, password) => {
    const result = await auth().signInWithEmailAndPassword(email, password);
    refreshUser();
    return result;
  };

  const registerWithEmail = async (email, password) => {
    const credential = auth.EmailAuthProvider.credential(email, password);
    const current = auth().currentUser;
    const result = current?.isAnonymous
      ? await current.linkWithCredential(credential)
      : await auth().createUserWithEmailAndPassword(email, password);
    refreshUser();
    return result;
  };

  // LoginScreen'den expo-auth-session ile alınan Google id_token buraya gelir
  const signInWithGoogleIdToken = async (idToken) => {
    const credential = auth.GoogleAuthProvider.credential(idToken);
    const current = auth().currentUser;
    const result = current?.isAnonymous
      ? await current.linkWithCredential(credential)
      : await auth().signInWithCredential(credential);
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

    const appleProvider = auth.AppleAuthProvider;
    const credential = appleProvider.credential(identityToken, rawNonce);

    const current = auth().currentUser;
    const result = current?.isAnonymous
      ? await current.linkWithCredential(credential)
      : await auth().signInWithCredential(credential);
    refreshUser();
    return result;
  };

  const signOut = () => auth().signOut();

  const sendPasswordReset = (email) => auth().sendPasswordResetEmail(email);

  // 'auth/requires-recent-login' fırlatabilir → çağıran tarafı yakalayıp
  // kullanıcıyı yeniden giriş yapmaya yönlendirir.
  const deleteAccount = async () => {
    const current = auth().currentUser;
    if (!current) throw new Error('No current user');
    await current.delete();
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
      {/* authReady olmasa da children render et — uygulama bloke olmaz */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
