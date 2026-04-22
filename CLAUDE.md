# KartOyunu — Proje Kılavuzu

Türkçe sohbet kartı oyunu. React Native / Expo ile yapılmış mobil uygulama.

## Stack

- React Native (Expo ~54) — `app.json` ile yapılandırılmış
- **React Navigation kurulu ama KULLANILMIYOR** — custom state-based navigation (App.js)
- `expo-linear-gradient` — kurulu, kullanılabilir
- `react-native-reanimated`, `react-native-gesture-handler` — kurulu
- Python 3 — script çalıştırılabilir
- No external state management — React useState/useRef yeterli

## Dosya Yapısı

```
App.js                          — Root: ThemeProvider + navigation state
src/
  ThemeContext.js               — Dark/light mod context, useTheme() hook
  theme.js                      — darkTheme ve lightTheme renk tokenları
  data/index.js                 — Tüm veri: categories, decks, cards (582 satır — okuma)
  screens/
    SplashScreen.js             — Açılış animasyonu (~2.4sn), her zaman dark
    HomeScreen.js               — Ana ekran: kategori filtreleri + deste listesi
    CategoryScreen.js           — Kategori detay: o kategorinin tüm desteleri
    DeckScreen.js               — Deste detay: istatistik, açıklama, başlat
    CardScreen.js               — Kart swipe ekranı + favoriler
```

## Navigation (App.js)

```javascript
const [screen, setScreen] = useState('home');       // aktif ekran
const [selectedDeck, setSelectedDeck] = useState(null);
const [selectedCategory, setSelectedCategory] = useState(null);

navigate(screenName, params)
// params.deck     → setSelectedDeck
// params.category → setSelectedCategory
```

**Ekranlar:** `'home'` | `'category'` | `'deck'` | `'cards'`  
**Akış:** SplashScreen → HomeScreen → CategoryScreen → DeckScreen → CardScreen  
**Geri:** DeckScreen "← Geri" → `'home'` | CardScreen "✕" → `'deck'`  
Her ekranda sol kenara swipe (pageX < 22) geri navigasyon yapar.

## Theme Sistemi

```javascript
const { theme, isDark, toggleTheme } = useTheme();
const s = useMemo(() => makeStyles(theme), [theme]);
// Her ekranda bu pattern — makeStyles(theme) factory
```

### Dark Theme (`isDark: true`)
```
background:       #0A0A18    surface:          #0F0F25
surfaceElevated:  #16162E    surfaceHigh:      #1E1E3F
primary:          #D4A843    primaryLight:     #E8C97A    primaryDark: #A67C2E
secondary:        #7C5EBB
text:             #EDE9FF    textSecondary:    #9490B8    textMuted:   #5C5880
border:           #2A2750    borderLight:      #3D3A6A
card:             #FFFFFF    cardText:         #1A1545
success:          #27AE60    danger:           #E74C3C
```

### Light Theme (`isDark: false`)
```
background:       #F5F3FF    surface:          #FFFFFF
surfaceElevated:  #EDE9FF    surfaceHigh:      #E4E0F5
primary:          #6B4FA8    primaryLight:     #8B70C8    primaryDark: #4A3280
secondary:        #D4A843
text:             #1A1545    textSecondary:    #4A4675    textMuted:   #8B87A8
border:           #D8D3EE    borderLight:      #EDE9FF
card:             #FFFFFF    cardText:         #1A1545
success:          #27AE60    danger:           #E74C3C
```

HomeScreen sağ üstte ☀/☽ toggle butonu var.

## Veri Modeli

### Kategoriler (5 adet)
| id | name | icon | color |
|----|------|------|-------|
| `ciftler` | Çiftler | 💑 | `#E94560` |
| `bulusma` | İlk Buluşma | 🌹 | `#FF6B35` |
| `arkadaslar` | Arkadaşlar | 🎉 | `#2ECC71` |
| `aile` | Aile | 🏠 | `#3498DB` |
| `grup` | Grup | 🎲 | `#9B59B6` |

### Desteler (20 adet)
| id | kategori | title | emoji | level | people | premium |
|----|----------|-------|-------|-------|--------|---------|
| `ciftler_hafif` | ciftler | Hafif Sohbet | 🥂 | Hafif | 2 kişi | ✗ |
| `ciftler_derin` | ciftler | Derin Sohbet | 💫 | Derin | 2 kişi | ✓ |
| `ciftler_eglenceli` | ciftler | Eğlenceli | 😄 | Eğlenceli | 2 kişi | ✗ |
| `ciftler_romantik` | ciftler | Romantik | 💕 | Romantik | 2 kişi | ✓ |
| `bulusma_rahat` | bulusma | Rahat Başlangıç | 🦋 | Hafif | 2 kişi | ✗ |
| `bulusma_sessizlik` | bulusma | Sessizlik Kurtarıcı | ✨ | Hafif | 2 kişi | ✗ |
| `bulusma_flortoz` | bulusma | Flörtöz | 😏 | Cesur | 2 kişi | ✓ |
| `bulusma_derin` | bulusma | Derine Geçiş | 🔥 | Derin | 2 kişi | ✓ |
| `arkadaslar_komik` | arkadaslar | Komik | 😂 | Eğlenceli | 3+ kişi | ✗ |
| `arkadaslar_kaos` | arkadaslar | Kaos | 🔥 | Cesur | 3+ kişi | ✗ |
| `arkadaslar_itiraf` | arkadaslar | İtiraf | 🙈 | Derin | 3+ kişi | ✓ |
| `arkadaslar_nostalji` | arkadaslar | Nostalji | 🎞️ | Sıcak | 3+ kişi | ✓ |
| `aile_aksam` | aile | Akşam Yemeği | 🍽️ | Sıcak | Aile | ✗ |
| `aile_cocuklar` | aile | Çocuklarla | 🧸 | Eğlenceli | Aile | ✗ |
| `aile_anilar` | aile | Anılar | 📷 | Derin | Aile | ✓ |
| `grup_tanisma` | grup | Tanışma Masası | 🤝 | Hafif | 4+ kişi | ✗ |
| `grup_buz` | grup | Buz Kırıcı | ❄️ | Hafif | 3+ kişi | ✗ |
| `grup_is` | grup | İş Arkadaşı Ortamı | 💼 | Profesyonel | 4+ kişi | ✓ |
| `grup_eglenceli` | grup | Eğlenceli Akşam | 🎭 | Cesur | 4+ kişi | ✓ |
| `grup_derin` | grup | Derin Masa | 🌌 | Derin | 4+ kişi | ✓ |

**Kart sayısı:** 12 per deste, toplam 240 soru
**Her kategoride:** 2 ücretsiz + 2-3 premium deste
`deck.people` → DeckScreen'de `.replace(/\s*kişi$/i, '')` ile "kişi" strip edilir

## Türkçe Büyük Harf

`textTransform: 'uppercase'` KULLANILMAZ — JS `i→I` yapar, `İ` yapmaz.  
`upperTR(str)` helper kullanılır (CardScreen'de tanımlı):
```javascript
const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();
```
Section label'lar hardcode yazılır: `KART`, `SÜRE`, `KİŞİ`, `SEVİYE`, `HAKKINDA`, `NE BEKLEMELİ?`

## Tasarım Sistemi

- **Kart (CardScreen):** Beyaz `#FFFFFF`, 26px border radius, üstte 6px category renk şeridi
- **Deck item:** Sol kenarda 4px colored accent bar, `catColor + '20'` opacity ikon bg
- **Back button:** Glass pill — `rgba(255,255,255,0.22)` bg, `rgba(255,255,255,0.3)` border, beyaz metin
- **PRO badge:** `#D4A843` zemin, `#1A1000` metin, `fontSize:10`, `fontWeight:'800'`
- **Category pill (DeckScreen header):** `rgba(255,255,255,0.2)` bg, TouchableOpacity → `navigate('category', { category })`
- **Swipe labels:** GEÇ `#E74C3C`, FAVORİ `#27AE60`

## CardScreen — Kritik Pattern

PanResponder stale closure sorunu çözülmüştür:

```javascript
const currentIndexRef = useRef(0);  // Her zaman güncel index
const swipeCardRef = useRef(null);  // Her render'da güncellenir
swipeCardRef.current = swipeCard;   // PanResponder hep bunu çağırır
// panResponder içinde: swipeCardRef.current('right'/'left')
```

Favoriler soru metni olarak saklanır (index değil):
```javascript
setFavorites(prev => [...prev, deckCards[idx]]);
```

PanResponder sol edge (pageX > LEFT_EDGE_ZONE = 22) ile iOS back gesture'a izin verir.

## Sol Kenar Swipe — DeckScreen / CategoryScreen Pattern

```javascript
onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
  evt.nativeEvent.pageX < 22 && gestureState.dx > 10 &&
  Math.abs(gestureState.dy) < Math.abs(gestureState.dx),
onPanResponderRelease: (_, gs) => { if (gs.dx > 60) navigate('home'); }
```

## Bilinen Kısıtlar

- iOS back gesture natif olarak çalışmaz (React Navigation kullanılmıyor)
  → Sol kenar PanResponder ile manuel implemente edilmiş (her ekranda)
