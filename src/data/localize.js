// Localization helper for multilingual data fields.
// Field shape: { tr: '...', en: '...', es: '...', fr: '...', de: '...', ru: '...' }
// Falls back to EN, then TR, then any non-null value, then ''.

const FALLBACK_ORDER = ['en', 'tr'];

export function localize(field, lang) {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  if (typeof field !== 'object') return String(field);
  if (lang && field[lang]) return field[lang];
  for (const f of FALLBACK_ORDER) {
    if (field[f]) return field[f];
  }
  for (const v of Object.values(field)) {
    if (v) return v;
  }
  return '';
}

// React hook variant — reads i18n.language automatically.
import { useTranslation } from 'react-i18next';
export function useLocalize() {
  const { i18n } = useTranslation();
  return (field) => localize(field, i18n.language);
}
