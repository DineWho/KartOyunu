import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kartoyunu_sound_enabled';

const SOUNDS = {
  swipe_right: require('../../assets/sounds/swipe_right.mp3'),
  swipe_left: require('../../assets/sounds/swipe_left.wav'),
  badge_earn: require('../../assets/sounds/badge_earn.mp3'),
  game_end: require('../../assets/sounds/game_end.wav'),
};

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundObjects = useRef({});
  const loadedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val !== null) setSoundEnabled(val === 'true');
    });
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
    });
    preloadSounds();
    return () => unloadSounds();
  }, []);

  const preloadSounds = async () => {
    try {
      const entries = await Promise.all(
        Object.entries(SOUNDS).map(async ([key, src]) => {
          const { sound } = await Audio.Sound.createAsync(src, { shouldPlay: false });
          return [key, sound];
        })
      );
      soundObjects.current = Object.fromEntries(entries);
      loadedRef.current = true;
    } catch {
      // Sound files not yet added — silent fallback
    }
  };

  const unloadSounds = async () => {
    for (const sound of Object.values(soundObjects.current)) {
      try { await sound.unloadAsync(); } catch {}
    }
  };

  const playSound = async (name) => {
    if (!soundEnabled || !loadedRef.current) return;
    try {
      const sound = soundObjects.current[name];
      if (!sound) return;
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {}
  };

  const toggleSound = async (val) => {
    const next = val ?? !soundEnabled;
    setSoundEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <AudioContext.Provider value={{ soundEnabled, playSound, toggleSound }}>
      {children}
    </AudioContext.Provider>
  );
}

const NOOP = () => {};
const FALLBACK = { soundEnabled: false, playSound: NOOP, toggleSound: NOOP };

export function useAudio() {
  return useContext(AudioContext) ?? FALLBACK;
}
