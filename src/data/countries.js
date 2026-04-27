// Curated country list — multilingual.
// `code`: ISO 3166-1 alpha-2. `name`: { tr, en, es, fr, de, ru }.
// Order: TR canonical (Turkish-speaking user familiarity), but rendered via localize().
export const COUNTRIES = [
  { code: 'TR', name: { tr: 'Türkiye',                     en: 'Türkiye',               es: 'Turquía',                 fr: 'Turquie',                de: 'Türkei',                  ru: 'Турция' } },
  { code: 'DE', name: { tr: 'Almanya',                     en: 'Germany',               es: 'Alemania',                fr: 'Allemagne',              de: 'Deutschland',             ru: 'Германия' } },
  { code: 'NL', name: { tr: 'Hollanda',                    en: 'Netherlands',           es: 'Países Bajos',            fr: 'Pays-Bas',               de: 'Niederlande',             ru: 'Нидерланды' } },
  { code: 'AT', name: { tr: 'Avusturya',                   en: 'Austria',               es: 'Austria',                 fr: 'Autriche',               de: 'Österreich',              ru: 'Австрия' } },
  { code: 'BE', name: { tr: 'Belçika',                     en: 'Belgium',               es: 'Bélgica',                 fr: 'Belgique',               de: 'Belgien',                 ru: 'Бельгия' } },
  { code: 'CH', name: { tr: 'İsviçre',                     en: 'Switzerland',           es: 'Suiza',                   fr: 'Suisse',                 de: 'Schweiz',                 ru: 'Швейцария' } },
  { code: 'FR', name: { tr: 'Fransa',                      en: 'France',                es: 'Francia',                 fr: 'France',                 de: 'Frankreich',              ru: 'Франция' } },
  { code: 'GB', name: { tr: 'Birleşik Krallık',            en: 'United Kingdom',        es: 'Reino Unido',             fr: 'Royaume-Uni',            de: 'Vereinigtes Königreich',  ru: 'Великобритания' } },
  { code: 'IE', name: { tr: 'İrlanda',                     en: 'Ireland',               es: 'Irlanda',                 fr: 'Irlande',                de: 'Irland',                  ru: 'Ирландия' } },
  { code: 'IT', name: { tr: 'İtalya',                      en: 'Italy',                 es: 'Italia',                  fr: 'Italie',                 de: 'Italien',                 ru: 'Италия' } },
  { code: 'ES', name: { tr: 'İspanya',                     en: 'Spain',                 es: 'España',                  fr: 'Espagne',                de: 'Spanien',                 ru: 'Испания' } },
  { code: 'PT', name: { tr: 'Portekiz',                    en: 'Portugal',              es: 'Portugal',                fr: 'Portugal',               de: 'Portugal',                ru: 'Португалия' } },
  { code: 'SE', name: { tr: 'İsveç',                       en: 'Sweden',                es: 'Suecia',                  fr: 'Suède',                  de: 'Schweden',                ru: 'Швеция' } },
  { code: 'NO', name: { tr: 'Norveç',                      en: 'Norway',                es: 'Noruega',                 fr: 'Norvège',                de: 'Norwegen',                ru: 'Норвегия' } },
  { code: 'DK', name: { tr: 'Danimarka',                   en: 'Denmark',               es: 'Dinamarca',               fr: 'Danemark',               de: 'Dänemark',                ru: 'Дания' } },
  { code: 'FI', name: { tr: 'Finlandiya',                  en: 'Finland',               es: 'Finlandia',               fr: 'Finlande',               de: 'Finnland',                ru: 'Финляндия' } },
  { code: 'PL', name: { tr: 'Polonya',                     en: 'Poland',                es: 'Polonia',                 fr: 'Pologne',                de: 'Polen',                   ru: 'Польша' } },
  { code: 'CZ', name: { tr: 'Çekya',                       en: 'Czechia',               es: 'Chequia',                 fr: 'Tchéquie',               de: 'Tschechien',              ru: 'Чехия' } },
  { code: 'GR', name: { tr: 'Yunanistan',                  en: 'Greece',                es: 'Grecia',                  fr: 'Grèce',                  de: 'Griechenland',            ru: 'Греция' } },
  { code: 'RO', name: { tr: 'Romanya',                     en: 'Romania',               es: 'Rumania',                 fr: 'Roumanie',               de: 'Rumänien',                ru: 'Румыния' } },
  { code: 'BG', name: { tr: 'Bulgaristan',                 en: 'Bulgaria',              es: 'Bulgaria',                fr: 'Bulgarie',               de: 'Bulgarien',               ru: 'Болгария' } },
  { code: 'US', name: { tr: 'Amerika Birleşik Devletleri', en: 'United States',         es: 'Estados Unidos',          fr: 'États-Unis',             de: 'Vereinigte Staaten',      ru: 'США' } },
  { code: 'CA', name: { tr: 'Kanada',                      en: 'Canada',                es: 'Canadá',                  fr: 'Canada',                 de: 'Kanada',                  ru: 'Канада' } },
  { code: 'AU', name: { tr: 'Avustralya',                  en: 'Australia',             es: 'Australia',               fr: 'Australie',              de: 'Australien',              ru: 'Австралия' } },
  { code: 'NZ', name: { tr: 'Yeni Zelanda',                en: 'New Zealand',           es: 'Nueva Zelanda',           fr: 'Nouvelle-Zélande',       de: 'Neuseeland',              ru: 'Новая Зеландия' } },
  { code: 'AE', name: { tr: 'Birleşik Arap Emirlikleri',   en: 'United Arab Emirates',  es: 'Emiratos Árabes Unidos',  fr: 'Émirats arabes unis',    de: 'Vereinigte Arabische Emirate', ru: 'ОАЭ' } },
  { code: 'SA', name: { tr: 'Suudi Arabistan',             en: 'Saudi Arabia',          es: 'Arabia Saudí',            fr: 'Arabie saoudite',        de: 'Saudi-Arabien',           ru: 'Саудовская Аравия' } },
  { code: 'QA', name: { tr: 'Katar',                       en: 'Qatar',                 es: 'Catar',                   fr: 'Qatar',                  de: 'Katar',                   ru: 'Катар' } },
  { code: 'AZ', name: { tr: 'Azerbaycan',                  en: 'Azerbaijan',            es: 'Azerbaiyán',              fr: 'Azerbaïdjan',            de: 'Aserbaidschan',           ru: 'Азербайджан' } },
  { code: 'KZ', name: { tr: 'Kazakistan',                  en: 'Kazakhstan',            es: 'Kazajistán',              fr: 'Kazakhstan',             de: 'Kasachstan',              ru: 'Казахстан' } },
];

export function findCountry(code) {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) || null;
}
