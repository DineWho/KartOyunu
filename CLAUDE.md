# KartOyunu — Claude Talimatları

Türkçe sohbet kartı oyunu. React Native / Expo ile yapılmış mobil uygulama (iOS & Android).

---

## Çalışmadan Önce Oku

| Görev | Oku |
|-------|-----|
| Navigasyon, ekranlar, stack, dosya yapısı | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Veri modeli, paket/kategori/mod/seviye, mod tablosu | [DATA_MODEL.md](DATA_MODEL.md) |
| İçerik kuralları, soru yazımı, Free/Pro dengesi | [CONTENT_GUIDE.md](CONTENT_GUIDE.md) |
| UI, tema, bileşen kalıpları, renk tokenları | [design-system/kartoyunu/MASTER.md](design-system/kartoyunu/MASTER.md) |
| Bilinen bug'lar, geçici çözümler, kritik pattern'lar | [KNOWN_ISSUES.md](KNOWN_ISSUES.md) |

---

## Mutlak Kurallar

1. **Mevcut export'lar:** `src/data/index.js` → `categories`, `mods`, `cards`. "Deste" kavramı "Mod" olarak rename tamamlandı.
2. **React Navigation aktif** — `NavigationContainer` + `createNativeStackNavigator` + `createBottomTabNavigator`. Ekranlara `navigate` prop geçme; `useNavigation()` ve `useRoute()` hook'larını kullan.
3. **`textTransform: 'uppercase'` kullanma** — Türkçe `i→İ` için yanlış sonuç verir. `upperTR()` helper kullan.
4. **CardScreen gesture** — `gestureEnabled: false`, kart swipe PanResponder tek hakimdir. Geri için X butonu var, ayrı back gesture ekleme.
5. **Her paket tam olarak 12 soru içerir** — İstisna yok.
6. **1 soru → yalnızca 1 paket** — Aynı veya çok benzer soru başka pakette tekrar edemez.
7. **Yeni içerik sık gelecek** — Paket, kategori, mod, seviye ve sorular sürekli artacak. Kod buna dayanıklı olmalı.

---

## Navigasyon

React Navigation kullanılıyor. Ekranlar arası geçiş için `useNavigation()` hook'u:

```javascript
import { useNavigation, useRoute } from '@react-navigation/native';

const navigation = useNavigation();
const route = useRoute();

navigation.navigate('Mod', { mod })       // stack'e ekle
navigation.navigate('Category', { category })
navigation.navigate('Cards', { mod })
navigation.goBack()                        // bir önceki ekrana dön
navigation.navigate('MainTabs', { screen: 'Home' })  // tab'a dön
```

**Tab ekranları** (`'Home'`, `'Favorites'`, `'Settings'`, `'Profile'`) — TabBar görünür  
**Stack ekranları** (`'Category'`, `'Mod'`, `'Cards'`) — TabBar gizli  
**Akış:** SplashScreen → HomeScreen → ModScreen → CardScreen  
**Geri:** Category ve Mod için iOS native swipe otomatik. Cards için X butonu.

---

## Türkçe Büyük Harf

```javascript
const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();
```

Section label'lar hardcode: `KART`, `SÜRE`, `KİŞİ`, `SEVİYE`, `HAKKINDA`, `NE BEKLEMELİ?`

---

## Theme Kullanımı

```javascript
const { theme, isDark, toggleTheme } = useTheme();
const s = useMemo(() => makeStyles(theme), [theme]);
```

Renk token'ları için `theme.colors.*` kullan — hardcode renk yazma.  
Tam token listesi ve dark/light değerleri → [design-system/kartoyunu/MASTER.md](design-system/kartoyunu/MASTER.md)

---

## CardScreen Kritik Pattern

PanResponder stale closure çözümü — bozma:

```javascript
const currentIndexRef = useRef(0);
const swipeCardRef = useRef(null);
swipeCardRef.current = swipeCard;  // Her render'da güncellenir
// panResponder içinde: swipeCardRef.current('right'/'left')
```

Favoriler `FavoritesContext` üzerinden global state'e kaydedilir:

```javascript
addFavorite(modCards[idx], mod, catColor);
```

Oyun istatistikleri `StatsContext` üzerinden kaydedilir:

```javascript
const { addStat } = useStats();
addStat(cardId, modId, 'favorite'); // veya 'skip'
```

---

## Offline Modu & İstatistik Takibi

**Offline çalışma:**
- Tüm veriler cihazda hardcoded → internet olmasa da oynanabilir
- Favoriler AsyncStorage'da → offline'da kalıcı
- İstatistikler AsyncStorage'da → offline'da kaydedilir

**Oyun istatistikleri** (CardScreen'de, her swipe'da kaydedilir):
```javascript
import { useStats } from '../context/StatsContext';

const { addStat, getTotalStats, clearStats } = useStats();

// Her swiped'da
addStat(cardId, modId, direction === 'right' ? 'favorite' : 'skip');

// SettingsScreen'de gösterilir
const { totalCards, totalFavorited, modsPlayed } = getTotalStats();
```

**Storage keys:**
- `@kartoyunu_favorites` — Favoriler
- `@kartoyunu_stats` — İstatistikler (JSON array)

