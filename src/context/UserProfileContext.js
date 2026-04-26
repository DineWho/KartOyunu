import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

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
    AsyncStorage.getItem(storageKey(uid))
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setProfile({ ...EMPTY_PROFILE, ...parsed });
          } catch {
            setProfile(EMPTY_PROFILE);
          }
        } else {
          setProfile(EMPTY_PROFILE);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const updateProfile = useCallback(
    async (partial) => {
      if (!uid) return;
      const next = {
        ...EMPTY_PROFILE,
        ...profile,
        ...partial,
        updatedAt: Date.now(),
      };
      setProfile(next);
      try {
        await AsyncStorage.setItem(storageKey(uid), JSON.stringify(next));
      } catch {
        // Sessizce geç — UI optimistic update zaten yapıldı
      }
    },
    [uid, profile]
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
