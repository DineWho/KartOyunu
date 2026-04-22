# KartOyunu — Proje Kılavuzu

Türkçe sohbet kartı oyunu. React Native / Expo ile yapılmış mobil uygulama.

## Stack

- React Native (Expo) — `app.json` ile yapılandırılmış
- **React Navigation YOK** — custom state-based navigation (App.js içinde)
- No external state management — React useState/useRef yeterli
- No LinearGradient — solid renkler kullanılıyor

## Dosya Yapısı

```
App.js                          — Root, ThemeProvider + navigation state
src/
  ThemeContext.js               — Dark/light mod context, useTheme() hook
  theme.js                      — darkTheme ve lightTheme renk tokenları
  data/index.js                 — Tüm veri: categories, decks, cards
  screens/
    SplashScreen.js             — Açılış animasyonu (~2.4sn), her zaman dark
    HomeScreen.js               — Ana ekran: kategori filtreleri + deste listesi
    CategoryScreen.js           — Kategori detay: o kategorinin tüm desteleri
    DeckScreen.js               — Deste detay: istatistik, açıklama, başlat
    CardScreen.js               — Kart swipe ekranı + favoriler
```

## Navigation

App.js'de `screen` state ile yönetiliyor:

```javascript
navigate(screenName, params)
// params.deck  → setSelectedDeck
// params.category → setSelectedCategory
```

**Akış:** SplashScreen → HomeScreen → CategoryScreen → DeckScreen → CardScreen

DeckScreen'de "← Geri" → HomeScreen'e döner  
CardScreen'de "✕" → DeckScreen'e döner

Her ekranda sol kenara swipe (pageX < 22) geri navigasyon yapar.

## Theme Sistemi

```javascript
const { theme, isDark, toggleTheme } = useTheme();
const s = useMemo(() => makeStyles(theme), [theme]);
```

Her ekran `makeStyles(theme)` factory'sini kullanır.  
`theme.colors.*` ile tüm renkler erişilir.

**Dark:** bg `#0A0A18`, primary `#D4A843` (altın), secondary `#7C5EBB`  
**Light:** bg `#F5F3FF`, primary `#6B4FA8` (mor), secondary `#D4A843`

HomeScreen sağ üstte ☀/☽ toggle butonu var.

## Veri Modeli (src/data/index.js)

```javascript
categories[5]   // id, name, icon, color
decks[20]       // id, categoryId, title, description, cardCount,
                // duration, people, level, isPremium, emoji
cards{}         // deck.id → string[] (12 soru per deste)
```

**5 kategori:** Çiftler, İlk Buluşma, Arkadaşlar, Aile, Grup  
**20 deste:** Her kategoride 2 ücretsiz + premium desteler  
**240 soru:** 20 deste × 12 soru

`deck.people` değerleri: `'2 kişi'`, `'3+ kişi'`, `'Aile'`  
DeckScreen'de stats gösteriminde `.replace(/\s*kişi$/i, '')` ile strip ediliyor.

## Türkçe Büyük Harf

`textTransform: 'uppercase'` KULLANILMAZ — JS `i→I` yapar, `İ` yapmaz.  
`upperTR(str)` helper kullanılır:
```javascript
const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();
```

## Tasarım Sistemi

- **Kart (CardScreen):** Beyaz, 26px border radius, üstte 6px category renk şeridi
- **Deck item:** Sol kenarda 4px colored accent bar, category rengi + 20% opacity ikon bg
- **Back button:** Glass pill — `rgba(255,255,255,0.22)` bg, `rgba(255,255,255,0.3)` border
- **PRO badge:** `#D4A843` altın zemin, `#1A1000` koyu metin
- **Section labels:** Hardcode Turkish uppercase (KART, SÜRE, KİŞİ, SEVİYE vb.)

## CardScreen — Kritik Pattern

PanResponder stale closure sorunu çözülmüştür:

```javascript
const currentIndexRef = useRef(0);  // Her zaman güncel index
const swipeCardRef = useRef(null);  // Her render'da güncellenir
swipeCardRef.current = swipeCard;   // PanResponder hep bunu çağırır
```

Favoriler soru metni olarak saklanır (index değil):
```javascript
setFavorites(prev => [...prev, deckCards[idx]]);
```

## Bilinen Kısıtlar

- `expo-linear-gradient` yüklü değil, gradient yok
- React Navigation yok, iOS back gesture natif olarak çalışmaz
  → Sol kenar PanResponder ile manuel implemente edilmiş (her ekranda)
- Python/script çalıştırılamıyor (Xcode lisans sorunu)
