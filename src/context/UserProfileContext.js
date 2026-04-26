import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { subscribeUserProfile, writeUserProfile, PROFILE_FIELDS } from '../lib/firestore';

const STORAGE_PREFIX = '@cardwho_user_profile_';

// Firestore tarafında da aynı şema:
//   { firstName, birthDate ('YYYY-MM-DD'), gender, city, countryCode,
//     locale, createdAt, updatedAt, schemaVersion }
const EMPTY_PROFILE = {
  firstName: null,
  birthDate: null,
  gender: null,
  city: null,
  countryCode: null,
  locale: null,
};

const UserProfileContext = createContext({
  profile: EMPTY_PROFILE,
  loading: true,
  updateProfile: async () => {},
  clearProfile: async () => {},
});

const storageKey = (uid) => `${STORAGE_PREFIX}${uid}`;

// Sadece beyaz listedeki alanları client'tan Firestore'a yaz; security rules
// de aynı listeyi enforce ediyor.
function pickWhitelist(partial) {
  const out = {};
  for (const k of PROFILE_FIELDS) {
    if (k in partial) out[k] = partial[k];
  }
  return out;
}

// AsyncStorage cache'ine yazılan plain JSON; Firestore Timestamp'leri
// epoch millis'e indirgenir (cache yalnızca offline-first hızlı render için).
function toCacheable(data) {
  if (!data) return null;
  const out = {};
  for (const k of PROFILE_FIELDS) {
    out[k] = data[k] ?? null;
  }
  return out;
}

export function UserProfileProvider({ children }) {
  const { user, isAnonymous } = useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  const uid = !isAnonymous && user?.uid ? user.uid : null;

  useEffect(() => {
    let cancelled = false;

    if (!uid) {
      setProfile(EMPTY_PROFILE);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    // 1) Cache'ten hızlı render — offline-first.
    AsyncStorage.getItem(storageKey(uid)).then((raw) => {
      if (cancelled || !raw) return;
      try {
        const parsed = JSON.parse(raw);
        setProfile({ ...EMPTY_PROFILE, ...parsed });
      } catch {
        // bozuk cache — yoksay
      }
    });

    // 2) Firestore listener — source of truth.
    const unsubscribe = subscribeUserProfile(
      uid,
      (data) => {
        if (cancelled) return;
        const next = data ? { ...EMPTY_PROFILE, ...toCacheable(data) } : EMPTY_PROFILE;
        setProfile(next);
        setLoading(false);
        AsyncStorage.setItem(storageKey(uid), JSON.stringify(next)).catch(() => {});
      },
      () => {
        if (cancelled) return;
        // Hata durumunda cache'le devam et, loading'i bitir.
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      try {
        unsubscribe();
      } catch {}
    };
  }, [uid]);

  const updateProfile = useCallback(
    async (partial) => {
      if (!uid) return;
      const whitelisted = pickWhitelist(partial);
      // Optimistic update: UI hemen güncel hissetsin.
      setProfile((prev) => ({ ...prev, ...whitelisted }));
      // writeUserProfile içinde getDoc + setDoc/merge ile createdAt'ı bir kez
      // yazıyor. Hata Firestore offline mutation queue dışındaki gerçek
      // ihlallerde (rules vb.) çağırana fırlar.
      await writeUserProfile(uid, whitelisted);
    },
    [uid]
  );

  const clearProfile = useCallback(async () => {
    if (!uid) return;
    setProfile(EMPTY_PROFILE);
    try {
      await AsyncStorage.removeItem(storageKey(uid));
    } catch {}
  }, [uid]);

  return (
    <UserProfileContext.Provider value={{ profile, loading, updateProfile, clearProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserProfileContext);
