import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Türkçe i→İ özel dönüşümü (toUpperCase tek başına 'i' → 'I' yapar, yanlış).
export function upperTR(str) {
  return String(str ?? '').replace(/i/g, 'İ').toUpperCase();
}

// Locale-aware uppercase.
export function upperLocale(value, language) {
  const s = String(value ?? '');
  if (language && language.toLowerCase().startsWith('tr')) return upperTR(s);
  return s.toUpperCase();
}

// useTranslation ile birlikte kullanılan helper:
//   const tu = useUpperT();
//   <Text>{tu('mod.section.card')}</Text>
export function useUpperT() {
  const { t, i18n } = useTranslation();
  return useCallback(
    (key, options) => upperLocale(t(key, options), i18n.language),
    [t, i18n.language]
  );
}
