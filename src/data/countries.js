// Kürate ülke listesi — ileride genişler.
// `code`: ISO 3166-1 alpha-2. `name`: TR display.
export const COUNTRIES = [
  { code: 'TR', name: 'Türkiye' },
  { code: 'DE', name: 'Almanya' },
  { code: 'NL', name: 'Hollanda' },
  { code: 'AT', name: 'Avusturya' },
  { code: 'BE', name: 'Belçika' },
  { code: 'CH', name: 'İsviçre' },
  { code: 'FR', name: 'Fransa' },
  { code: 'GB', name: 'Birleşik Krallık' },
  { code: 'IE', name: 'İrlanda' },
  { code: 'IT', name: 'İtalya' },
  { code: 'ES', name: 'İspanya' },
  { code: 'PT', name: 'Portekiz' },
  { code: 'SE', name: 'İsveç' },
  { code: 'NO', name: 'Norveç' },
  { code: 'DK', name: 'Danimarka' },
  { code: 'FI', name: 'Finlandiya' },
  { code: 'PL', name: 'Polonya' },
  { code: 'CZ', name: 'Çekya' },
  { code: 'GR', name: 'Yunanistan' },
  { code: 'RO', name: 'Romanya' },
  { code: 'BG', name: 'Bulgaristan' },
  { code: 'US', name: 'Amerika Birleşik Devletleri' },
  { code: 'CA', name: 'Kanada' },
  { code: 'AU', name: 'Avustralya' },
  { code: 'NZ', name: 'Yeni Zelanda' },
  { code: 'AE', name: 'Birleşik Arap Emirlikleri' },
  { code: 'SA', name: 'Suudi Arabistan' },
  { code: 'QA', name: 'Katar' },
  { code: 'AZ', name: 'Azerbaycan' },
  { code: 'KZ', name: 'Kazakistan' },
];

export function findCountry(code) {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) || null;
}
