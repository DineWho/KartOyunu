# Bilinen Sorunlar ve Kritik Pattern'lar

> **Not:** i18n Aşama 4 (2026-04-27) tamamlandı. Tüm içerik çok dilli A-shape'te — okuma için `useLocalize()` kullan, detay → [DATA_MODEL.md](DATA_MODEL.md#multilingual-a-shape).

---

## Offline Modu & İstatistik Takibi

**Durum (çözüldü):** Uygulama tamamen offline'da çalışıyor:
- Tüm modlar ve sorular cihazda hardcoded → internet olmasa da oynanabilir
- Favoriler `AsyncStorage`'da saklanıyor → offline'da persist
- Oyun istatistikleri `AsyncStorage`'da `@cardwho_stats` key'inde saklanıyor

**StatsContext (`src/context/StatsContext.js`):**
```javascript
// Her swiped'da kaydedilir
addStat(cardId, modId, action) // action: 'skip' | 'favorite'

// Sorgu
getTotalStats() → { totalCards, totalFavorited, modsPlayed }
getStatsByMod(modId) → { attempted, favorited }

// Sıfırla
clearStats()
```

**SettingsScreen'de görüntülenir:**
- Toplam kartlar oynanmış
- Toplam favori
- Modlar oynanmış
- Sıfırla butonu

---

## iOS Geri Navigasyonu

React Navigation stack navigator sayesinde `CategoryScreen` ve `ModScreen` için iOS native back gesture (sol kenar swipe) otomatik çalışır. Ayrıca Android back button da stack'i otomatik yönetir.

**CardScreen istisnası:** `gestureEnabled: false` ayarlı — kart swipe PanResponder ile çakışmasın diye. Geri dönmek için sağ üstteki X butonu kullanılır.

---

## CardScreen — PanResponder Stale Closure

**Sorun:** PanResponder `useRef` ile oluşturulur ve mount sırasında closure'a bağlanır. `swipeCard` fonksiyonu her render'da yeniden oluşsa da PanResponder eski versiyonu yakalar — bu da currentIndex'in hiç artmamasına yol açar.

**Çözüm:** `swipeCardRef` pattern'i:

```javascript
const currentIndexRef = useRef(0);   // Her zaman güncel index — state'i beklemez
const swipeCardRef = useRef(null);

// Her render'da güncellenir — PanResponder hep güncel versiyona ulaşır
swipeCardRef.current = swipeCard;

// panResponder onPanResponderRelease içinde:
swipeCardRef.current('right');  // veya 'left'
```

**Uyarı:** `currentIndexRef.current` doğrudan güncellenir (`currentIndexRef.current = next`). State (`setCurrentIndex`) UI re-render için ayrıca çağrılır.

---

## Favoriler — Global Context

**Eski durum (değiştirildi):** Favoriler CardScreen içinde local state olarak tutuluyordu, ekrandan çıkınca kayboluyordu.

**Mevcut durum:** `FavoritesContext` üzerinden global state'e kaydediliyor.

```javascript
// CardScreen — sağ swipe'ta
addFavorite(modCards[idx], mod, catColor);
// { card, mod, catColor } formatında FavoritesContext'e gönderilir
```

`FavoritesScreen` bu listeyi okur.

---

## Türkçe Büyük Harf

**Sorun:** `textTransform: 'uppercase'` CSS/RN kuralı JavaScript'in `.toUpperCase()` kullanır. Bu `i → I` yapar, doğrusu `i → İ`'dir.

**Çözüm:**

```javascript
const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();
```

`src/i18n/upper.js`'de tanımlı (`upperTR`, `useUpperT`). Section label'lar i18n'den geçer (`KART`, `SÜRE`, `KİŞİ`, `SEVİYE`, `HAKKINDA`, `NE BEKLEMELİ?`).

---

## `mod.people` — "kişi" Strip

ModScreen'de `mod.people` değeri `'2 kişi'`, `'3+ kişi'` gibi geliyor. Gösterimde sadece sayı/etiket kısmı kullanılır:

```javascript
mod.people.replace(/\s*kişi$/i, '')
// '2 kişi' → '2'
// '4+ kişi' → '4+'
// 'Aile' → 'Aile'  (değişmez)
```

---

## Favoriler — Kalıcılık

**Mevcut durum (çözüldü):** `FavoritesContext` artık `@react-native-async-storage/async-storage` kullanıyor. Favoriler cihazda kalıcı — uygulama kapatılıp açılsa da korunur.

```javascript
// Mount'ta yükle
AsyncStorage.getItem('@cardwho_favorites').then(raw => {
  if (raw) setFavorites(JSON.parse(raw));
});

// Her değişiklikte kaydet
AsyncStorage.setItem('@cardwho_favorites', JSON.stringify(favorites));
```

`loaded` ref'i ile ilk render'daki boş state storage'ın üzerine yazılmaz.

**Uzun vadeli:** Auth sistemi gelirse `AsyncStorage` → sunucu senkronizasyonuna geçilebilir. Mevcut implementasyon buna engel değil; `addFavorite` / `removeFavorite` API'si değişmez, yalnızca persistence katmanı değişir.

---

## İçerik Doğrulama

Yeni içerik ekledikten sonra çalıştır:

```bash
npm run validate:content
```

Kontrol ettikleri: 12 soru zorunluluğu, boş/çok kısa/çok uzun soru, mod içi tekrar, paketler arası çapraz tekrar, geçersiz categoryId, `isPremium` tipi, orphan kart dizisi, **6 dil completeness** (her metin için tr/en/es/fr/de/ru eksiksiz).

Script: [scripts/validate-content.mjs](scripts/validate-content.mjs)

---

## Expo `useNativeDriver` Kısıtı

CardScreen'de kart swipe animasyonu `position.x` ve `position.y` değerlerini değiştirdiği için `useNativeDriver: false` kullanılmak zorunda. (Native driver ile `left`/`top` değiştirilemiyor.)

Giriş animasyonu (`cardAnim`) ise `opacity`/`scale` değiştiğinden `useNativeDriver: true` kullanıyor.
