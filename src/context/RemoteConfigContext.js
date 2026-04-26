import React, { createContext, useContext, useEffect, useState } from 'react';
import remoteConfig from '@react-native-firebase/remote-config';

const DEFAULTS = {
  paywall_enabled: true,
  pro_yearly_price_text: '',
  pro_lifetime_price_text: '',
  featured_mod_id: '',
  min_supported_version: '1.0.0',
  show_review_prompt: true,
  free_card_limit: 12,
};

const RemoteConfigContext = createContext({
  values: DEFAULTS,
  ready: false,
  refresh: async () => {},
});

export function RemoteConfigProvider({ children }) {
  const [values, setValues] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);

  const readAll = () => {
    const all = remoteConfig().getAll();
    const next = { ...DEFAULTS };
    Object.keys(all).forEach((key) => {
      const entry = all[key];
      const v = entry.asString();
      if (typeof DEFAULTS[key] === 'boolean') next[key] = entry.asBoolean();
      else if (typeof DEFAULTS[key] === 'number') next[key] = entry.asNumber();
      else next[key] = v;
    });
    setValues(next);
  };

  const refresh = async () => {
    try {
      await remoteConfig().fetchAndActivate();
      readAll();
    } catch {
      // Offline ise sessizce geç, defaults kullanılır
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await remoteConfig().setDefaults(DEFAULTS);
        await remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis: __DEV__ ? 0 : 3600 * 1000,
        });
        await remoteConfig().fetchAndActivate();
        if (!cancelled) readAll();
      } catch {
        // Defaults kullanılmaya devam eder
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RemoteConfigContext.Provider value={{ values, ready, refresh }}>
      {children}
    </RemoteConfigContext.Provider>
  );
}

export const useRemoteConfig = () => useContext(RemoteConfigContext);
