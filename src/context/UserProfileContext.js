import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { getProfile, patchProfile, PROFILE_FIELDS } from '../lib/profileApi';

const STORAGE_PREFIX = '@cardwho_user_profile_';

const EMPTY_PROFILE = {
  firstName: null,
  birthDate: null,
  gender: null,
  city: null,
  countryCode: null,
  locale: null,
  displayName: null,
  email: null,
};

const UserProfileContext = createContext({
  profile: EMPTY_PROFILE,
  loading: true,
  updateProfile: async () => {},
  clearProfile: async () => {},
});

const storageKey = (uid) => `${STORAGE_PREFIX}${uid}`;

const PATCHABLE_FIELDS = [
  'firstName',
  'displayName',
  'birthDate',
  'gender',
  'city',
  'countryCode',
  'locale',
];

function pickPatchable(partial) {
  const out = {};
  for (const k of PATCHABLE_FIELDS) {
    if (k in partial) out[k] = partial[k];
  }
  return out;
}

function toCacheable(data) {
  if (!data) return null;
  const out = {};
  for (const k of PROFILE_FIELDS) {
    out[k] = data[k] ?? null;
  }
  return out;
}

export function UserProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid ?? null;
  // Anon→Apple gibi link akışlarında uid sabit kalır ama provider değişir;
  // backend'in provider'ı upgrade etmesi için yeniden GET tetiklemek lazım.
  const providerId = user?.providerData?.[0]?.providerId ?? null;

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

    AsyncStorage.getItem(storageKey(uid)).then((raw) => {
      if (cancelled || !raw) return;
      try {
        const parsed = JSON.parse(raw);
        setProfile({ ...EMPTY_PROFILE, ...parsed });
      } catch {
        // bozuk cache — yoksay
      }
    });

    getProfile()
      .then((data) => {
        if (cancelled) return;
        const next = data ? { ...EMPTY_PROFILE, ...toCacheable(data) } : EMPTY_PROFILE;
        setProfile(next);
        setLoading(false);
        AsyncStorage.setItem(storageKey(uid), JSON.stringify(next)).catch(() => {});
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid, providerId]);

  const updateProfile = useCallback(
    async (partial) => {
      if (!uid) return;
      const patchable = pickPatchable(partial);
      if (Object.keys(patchable).length === 0) return;
      setProfile((prev) => ({ ...prev, ...patchable }));
      const updated = await patchProfile(patchable);
      if (updated) {
        const reconciled = { ...EMPTY_PROFILE, ...toCacheable(updated) };
        setProfile(reconciled);
        AsyncStorage.setItem(storageKey(uid), JSON.stringify(reconciled)).catch(() => {});
      }
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
