// ISO 3166-1 country list, multilingual.
// Source: `world-countries` package — already ships tr/en/es/fr/de/ru common names.
// Shape: { code: 'TR', flag: '🇹🇷', name: { tr, en, es, fr, de, ru } }

import worldCountries from 'world-countries';

// Override map: world-countries' `tur` translations occasionally start with a
// lowercase letter ("çekya"). Surface a properly-cased Turkish name instead.
const TR_OVERRIDES = {
  CL: 'Şili',
  CN: 'Çin',
  CZ: 'Çekya',
  JO: 'Ürdün',
  TD: 'Çad',
  UZ: 'Özbekistan',
};

function pick(country, lang) {
  return country.translations?.[lang]?.common || country.name.common;
}

export const COUNTRIES = worldCountries.map((c) => ({
  code: c.cca2,
  flag: c.flag,
  name: {
    tr: TR_OVERRIDES[c.cca2] || pick(c, 'tur'),
    en: c.name.common,
    es: pick(c, 'spa'),
    fr: pick(c, 'fra'),
    de: pick(c, 'deu'),
    ru: pick(c, 'rus'),
  },
}));

export function findCountry(code) {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) || null;
}
