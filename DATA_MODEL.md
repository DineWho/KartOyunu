# Veri Modeli — CardWho

İçerik yapısı, ID konvansiyonları ve multilingual veri biçimi. Sayısal alanlar `<!-- AUTO -->` blok içinde otomatik üretilir — `npm run sync:docs` ile güncellenir.

---

## Oyun Hiyerarşisi

```
Paket → Kategori → Mod → Seviye → Sorular
```

| Katman | Tanım |
|--------|-------|
| **Kategori** | Ana bağlam, hedef kitle, konu |
| **Mod** | Konuşma yaklaşımı, deneyim biçimi, soru açısı |
| **Seviye** | Duygusal yoğunluk, ton, derinlik |
| **Paket** | Kategori + Mod + Seviye kombinasyonu — oynanabilir en küçük içerik birimi |

**Paket kuralları:**
- Her paket tam olarak **12 benzersiz soru** içerir
- **1 soru → yalnızca 1 paket** (kesin kural, istisnasız)
- Aynı (Kategori + Mod + Seviye) kombinasyonu farklı paketlerde tekrar edebilir (örn. Free ve Pro aynı temayı farklı sorularla sunar)
- Paket ID'leri UI'da **gösterilmez** — sadece backend referansı

---

## ID Konvansiyonları

Her katmanın kararlı bir ID formatı vardır. ID'ler değişmez — içerik büyüse de stabil kalır. Bu sayede favoriler, istatistikler ve rozet referansları kırılmaz.

| Katman | Format | Örnek |
|--------|--------|-------|
| Kategori | Turkish slug | `arkadaslar`, `bulusma`, `ciftler`, `aile`, `grup` |
| Mod | `<kategori>_<slug>` | `arkadaslar_komik`, `bulusma_rahat_baslangic` |
| Seviye | Turkish slug | `hafif`, `derin`, `cesur`, `eglenceli`, `flortoz` |
| Paket | `PKG_FREE_NNN` / `PKG_PRO_NNN` | `PKG_FREE_001`, `PKG_PRO_008` |
| Kart | `CARD_NNNNNN` | `CARD_000001`, `CARD_000240` |

**Kurallar:**
- Turkish slug: küçük harf, boşluk → `_`, ASCII (`ç→c`, `ş→s`, `ö→o`, `ü→u`, `ğ→g`, `ı→i`)
- Kategori, Mod ve Seviye ID'leri değişmez
- ID'ler UI'da kullanıcıya **gösterilmez**

---

## Multilingual A-shape

i18n Aşama 4 (2026-04-27) sonrası tüm içerik field'ları **A-shape** nesnesi:

```javascript
{
  tr: '...',  // canonical
  en: '...',
  es: '...',
  fr: '...',
  de: '...',
  ru: '...',
}
```

**Kurallar:**
- **TR canonical** — Türkçe orijinal kaynak; içerik ekleyen önce TR yazar.
- **6 dil zorunlu** — Yeni metin eklenirken 6 dil de eksiksiz olmalı. `npm run validate:content` 6 dil completeness'i kontrol eder.
- **Çeviri akışı:** TR yazılır → `validate:content` eksikleri raporlar → Claude oturumda diğer 5 dile çevirir (kültürel referans politikasına göre) → commit.

### Fallback ve okuma

`src/data/localize.js`:
- `localize(field, lang)` — `field[lang] → field['en'] → field['tr'] → ilk non-null → ''`
- `useLocalize()` — hook varyantı, `useTranslation().i18n.language`'i otomatik kullanır

```javascript
import { useLocalize } from '../data/localize';
const localize = useLocalize();
const title = localize(mod.title);  // aktif dile göre döner
```

### Hangi field'lar multilingual

- **Kategori:** `name`
- **Mod:** `title`, `description`, `expectation`, `level`, `duration`, `people`
- **Kart:** `text` (saf string yerine `{tr,en,...}` objesi)
- **Badge:** statik rozetler `i18n key` (`badges.static.<id>.title|desc`) ile çözülür; dinamik kategori/seviye rozetleri kategorinin `name` veya mod'un `level` field'ından gelir

---

## Veri Yapısı (Uygulanmış)

`src/data/index.js` üç export'u re-export eder:

```javascript
import { categories, mods, cards } from './src/data';
```

```javascript
// categories — { id, name (multilingual), icon, color }
{
  id: 'arkadaslar',
  name: { tr: 'Arkadaşlar', en: 'Friends', ... },
  icon: '🎉',
  color: '#2ECC71',
}

// mods — { id, categoryId, title, description, expectation,
//          level, duration, people, emoji, cardCount, isPremium }
{
  id: 'arkadaslar_komik',
  categoryId: 'arkadaslar',
  title:       { tr: 'Komik', en: 'Funny', ... },
  description: { tr: '...',   en: '...',   ... },
  expectation: { tr: '...',   en: '...',   ... },
  level:       { tr: 'Eğlenceli', en: 'Fun', ... },
  duration:    { tr: '15-20 dk', en: '15-20 min', ... },
  people:      { tr: '2-6 kişi', en: '2-6 people', ... },
  emoji: '😂',
  cardCount: 12,
  isPremium: false,
}

// cards — { [modId]: [{tr, en, es, fr, de, ru}, ...] }
{
  arkadaslar_komik: [
    { tr: '...', en: '...', es: '...', fr: '...', de: '...', ru: '...' },
    // ... 12 kart
  ],
}
```

### Sayı Özeti

<!-- AUTO:content-stats START -->
**Kategoriler:** 19
**Modlar:** 114 (53 ücretsiz / 61 premium)
**Kartlar:** 1368 (her mod tam 12 soru)
<!-- AUTO:content-stats END -->

Tam liste için kaynak: [src/data/mods.js](src/data/mods.js), [src/data/categories.js](src/data/categories.js), [src/data/cards/](src/data/cards/).

### Kategori Listesi

<!-- AUTO:category-list START -->
| id | name (TR) | icon | color |
|----|-----------|------|-------|
| `arkadaslar` | Arkadaşlar | 🎉 | `#2ECC71` |
| `bulusma` | İlk Buluşma | 🌹 | `#FF6B35` |
| `ciftler` | Çiftler | 💑 | `#E94560` |
| `aile` | Aile | 🏠 | `#3498DB` |
| `grup` | Grup | 🎲 | `#9B59B6` |
| `burclar` | Burçlar | 🔮 | `#8E44AD` |
| `yemek` | Yemek | 🍽️ | `#E67E22` |
| `seyahat` | Seyahat | ✈️ | `#1ABC9C` |
| `evcil` | Evcil Hayvanlar | 🐾 | `#27AE60` |
| `is` | İş Hayatı | 💼 | `#2C3E50` |
| `nostalji` | Nostalji | 📼 | `#F39C12` |
| `psikoloji` | Psikoloji | 🧠 | `#16A085` |
| `viral` | Viral | 🔥 | `#E74C3C` |
| `siyaset` | Siyaset | 🏛️ | `#7F8C8D` |
| `kaos` | Kaos | ⚡ | `#D35400` |
| `ogretici` | Öğretici | 🎓 | `#3F88C5` |
| `matematik` | Matematik | 🧮 | `#2F80ED` |
| `bilim` | Bilim | 🔬 | `#00A896` |
| `dogruluk_cesaret` | Doğruluk Cesaret | 🎭 | `#D7263D` |
<!-- AUTO:category-list END -->

### Mod Örnekleri

```
arkadaslar_komik              | arkadaslar | 😂 | level: Eğlenceli | 2-6 kişi | free
bulusma_rahat_baslangic       | bulusma    | ☕ | level: Hafif      | 2 kişi    | free
ciftler_gece_yarisi           | ciftler    | 🌊 | level: Yoğun      | 2 kişi    | premium
aile_aksam_yemegi             | aile       | 🏡 | level: Sıcak      | 2-8 kişi | free
```

Tam mod listesi: [src/data/mods.js](src/data/mods.js).

### `mod.people` notu

ModScreen'de `localize(mod.people)` ile multilingual değer alınır. UI gösterimi öncesinde TR formatında gelirse (`'2 kişi'`, `'3+ kişi'`) ekran tarafı `replace(/\s*kişi$/i, '')` ile suffix'i strip eder; sadece sayı/etiket görünür.

---

## Badge Sistemi

`src/data/badges.js` rozet tanımlarını içerir.

### Statik rozetler

`STATIC_BADGES` — 25 önceden tanımlı rozet:
- **progress** (6): Toplam kart sayısı (10/50/150/300/500/1000)
- **favorites** (4): Toplam favori (1/15/50/100)
- **share** (3): Paylaşılan soru (1/10/50)
- **explore** (7): Kategori (3/8/15) + mod sayısı (5/15/30/60)
- **games** (3): Oyun seansı (1/10/30)
- **variety** (2): Seviye sayısı (5) + ilk premium

Her rozet için:
```javascript
{ id, groupKey, icon, color, check: (stats) => boolean }
```

Başlık/açıklama i18n key'inden çözülür: `badges.static.<id>.title|desc`.

### Dinamik rozetler

- **Kategori rozetleri** (`buildCategoryBadges`): her kategori için "ilk oyun" rozeti (19 adet)
- **Seviye rozetleri** (`buildLevelBadges`): TR canonical seviye adıyla 10 önceden tanımlanmış seviyeden (`Mahrem`, `Yoğun`, `İddialı`, `Filtresiz`, `Kışkırtıcı`, `Kaotik`, `Flörtöz`, `Katmanlı`, `Cesur`, `Düşündüren`)

`getAllBadges()` üçünü birleştirir ve cache'ler. Toplam: 25 statik + 19 kategori + 10 seviye = 54 rozet.

### Etiket çözümü

```javascript
import { useBadgeLabels } from '../data/badges';
const getLabels = useBadgeLabels();
const { title, desc, group } = getLabels(badge);
```

`useBadgeLabels()` i18n'e dayalı, dinamik rozetler için `useLocalize()`'ı çağırır.

---

## Geçiş Notları

**Airtable taşıması:** İleride değerlendirilecek. Bugün için tüm veri `src/data/` altında JS dosyası halinde — offline çalışır, build'a gömülür.
