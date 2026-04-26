import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from './locales/tr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ru from './locales/ru.json';

const STORAGE_KEY = '@cardwho_locale';

export const SUPPORTED_LANGUAGES = ['tr', 'en', 'es', 'fr', 'de', 'ru'];

const RESOURCES = {
  tr: { translation: tr },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ru: { translation: ru },
};

function detectDeviceLanguage() {
  try {
    const locales = Localization.getLocales?.() || [];
    return locales[0]?.languageCode || 'en';
  } catch {
    return 'en';
  }
}

export async function initI18n() {
  let stored = null;
  try {
    stored = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {}

  const device = detectDeviceLanguage();
  const lng = stored && SUPPORTED_LANGUAGES.includes(stored)
    ? stored
    : (SUPPORTED_LANGUAGES.includes(device) ? device : 'en');

  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    resources: RESOURCES,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
    returnNull: false,
  });

  return i18n;
}

export async function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

export default i18n;
