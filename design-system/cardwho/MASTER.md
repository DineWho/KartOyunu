# Design System — CardWho (React Native)

> **Kural:** Belirli bir ekran için `design-system/cardwho/pages/[ekran-adi].md` varsa, o dosya bu Master'ı override eder.

**Platform:** React Native / Expo (mobil uygulama — iOS & Android)
**Stil yaklaşımı:** `StyleSheet.create()` + inline style nesneleri. CSS class, selector veya CSS variable KULLANILMAZ.

---

## Renkler

Renkler `src/theme.js` içindeki `darkTheme` ve `lightTheme` nesnelerinden gelir. Genel UI'da hardcode renk yazma — her zaman `theme.colors.*` kullan.

**İstisnalar (tema dışı, her zaman sabit):**
- Oyun kartı yüzeyi: `#FFFFFF` — kart fiziksel beyaz kağıt hissini temsil eder, tema değişince değişmemeli
- Oyun kartı metni: `#1A1545`
- CTA buton metni: `#1A1000` — koyu altın zemin üzerinde okunabilirlik için sabit
- PRO badge zemin: `#D4A843`, PRO badge metni: `#1A1000`
- Glass pill metni: `#FFFFFF`
- Kategori renkleri (`catColor`): veri modelinden gelir, tema token'ı değildir

### Dark Theme

| Token | Hex | Kullanım |
|-------|-----|---------|
| `background` | `#07071A` | Ana ekran arkaplanı |
| `surface` | `#0D0D28` | Kart, modal yüzeyleri |
| `surfaceElevated` | `#131340` | Yükseltilmiş yüzeyler |
| `surfaceHigh` | `#1A1A52` | En üst katman yüzeyler |
| `primary` | `#D4A843` | CTA buton, vurgu, PRO badge |
| `primaryLight` | `#E8C97A` | Hover/pressed primary |
| `primaryDark` | `#A67C2E` | Primary gölge tonu |
| `secondary` | `#7C5EBB` | İkincil vurgu |
| `text` | `#F0ECFF` | Ana metin |
| `textSecondary` | `#9490B8` | İkincil metin |
| `textMuted` | `#5C5880` | Soluk metin, placeholder |
| `border` | `#1C1A3E` | Kenarlık |
| `borderLight` | `#2A2758` | Hafif kenarlık |
| `card` | `#FFFFFF` | Oyun kartı yüzeyi |
| `cardText` | `#1A1545` | Oyun kartı metni |
| `success` | `#27AE60` | FAVORİ swipe, onay |
| `danger` | `#E74C3C` | GEÇ swipe, hata |

### Light Theme

| Token | Hex | Kullanım |
|-------|-----|---------|
| `background` | `#F5F3FF` | Ana ekran arkaplanı |
| `surface` | `#FFFFFF` | Kart, modal yüzeyleri |
| `surfaceElevated` | `#EDE9FF` | Yükseltilmiş yüzeyler |
| `surfaceHigh` | `#E4E0F5` | En üst katman yüzeyler |
| `primary` | `#6B4FA8` | CTA buton, vurgu |
| `primaryLight` | `#8B70C8` | Pressed primary |
| `primaryDark` | `#4A3280` | Primary gölge tonu |
| `secondary` | `#D4A843` | İkincil vurgu |
| `text` | `#12103A` | Ana metin |
| `textSecondary` | `#4A4675` | İkincil metin |
| `textMuted` | `#8B87A8` | Soluk metin |
| `border` | `#E0DAF0` | Kenarlık |
| `borderLight` | `#EDE9FF` | Hafif kenarlık |
| `card` | `#FFFFFF` | Oyun kartı yüzeyi |
| `cardText` | `#1A1545` | Oyun kartı metni |
| `success` | `#27AE60` | Onay |
| `danger` | `#E74C3C` | Hata |

---

## Tipografi

React Native'de Google Fonts CSS import çalışmaz. Font yükleme Expo font API'siyle yapılır.

Şu an sistem fontları kullanılıyor:

```javascript
// Başlık
fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
fontWeight: '700',
fontSize: 24,

// Gövde
fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
fontWeight: '400',
fontSize: 16,
```

Türkçe büyük harf: `textTransform: 'uppercase'` KULLANMA — `i→I` yapar, `İ` yapmaz.
`upperTR(str)` helper'ı kullan (CardScreen'de tanımlı):
```javascript
const upperTR = (str) => str.replace(/i/g, 'İ').toUpperCase();
```

---

## Boşluk ve Boyutlar

Sabit spacing token kullanılmıyor; her bileşende tutarlı sayılar kullan:

| Kullanım | Değer |
|----------|-------|
| Tight gap (ikon, inline) | `4–8` |
| Standart padding | `16` |
| Bölüm padding | `20–24` |
| Büyük boşluk | `32` |
| Kart border radius | `26` |
| Buton border radius | `12–14` |
| Pill border radius | `999` |

---

## Bileşen Kalıpları

### Dokunulabilir Alan

```javascript
// Tüm tıklanabilir öğeler TouchableOpacity veya Pressable kullanır
// cursor:pointer KULLANILMAZ — mobilde anlamsız
// :hover KULLANILMAZ — temel etkileşim pattern'i değil
<TouchableOpacity
  onPress={handler}
  activeOpacity={0.75}
>
  {/* içerik */}
</TouchableOpacity>
```

### CTA Butonu

```javascript
{
  backgroundColor: theme.colors.primary,
  paddingVertical: 16,
  paddingHorizontal: 32,
  borderRadius: 14,
  alignItems: 'center',
}
// Metin: fontWeight:'700', color: '#1A1000', fontSize: 16
```

### Glass Pill (Geri Butonu)

```javascript
{
  backgroundColor: 'rgba(255,255,255,0.22)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
  borderRadius: 999,
  paddingVertical: 8,
  paddingHorizontal: 16,
}
// Metin: color: '#FFFFFF'
```

### Deste Öğesi (Deck Item)

```javascript
// Sol kenarda 4px renkli accent bar
// Ikon arkaplanı: catColor + '20' (opacity)
{
  borderLeftWidth: 4,
  borderLeftColor: catColor,
  backgroundColor: theme.colors.surface,
  borderRadius: 16,
}
```

### Oyun Kartı (CardScreen)

```javascript
{
  backgroundColor: '#FFFFFF',        // Her zaman beyaz — theme değil
  borderRadius: 26,
  // Üstte 6px kategori renk şeridi (View ile ayrı)
}
// Metin: color: '#1A1545'
```

### PRO Badge

```javascript
{
  backgroundColor: '#D4A843',
  borderRadius: 4,
  paddingHorizontal: 6,
  paddingVertical: 2,
}
// Metin: color: '#1A1000', fontSize: 10, fontWeight: '800'
```

---

## İkonlar

Mevcut uygulamada iki yaklaşım birlikte kullanılıyor:

- **Emoji:** Kategori ikonları için (`💑`, `🌹`, `🎉`, `🏠`, `🎲`) — bu veri modelinde tanımlı, değiştirme
- **Feather Icons:** `@expo/vector-icons` paketi yüklü — UI aksiyonları için (✕, ←, paylaş vb.)

```javascript
import { Feather } from '@expo/vector-icons';
<Feather name="x" size={24} color={theme.colors.text} />
```

SVG icon kütüphanesi şu an entegre edilmemiş. Yeni UI öğeleri için Feather kullan.

---

## Animasyon

`react-native-reanimated` ve `Animated` API yüklü:

```javascript
// Giriş animasyonu için spring tercih et
Animated.spring(value, {
  toValue: 1,
  friction: 8,
  tension: 60,
  useNativeDriver: true,
}).start();

// Swipe animasyonu (useNativeDriver: false — konum değişiyor)
Animated.timing(position, {
  toValue: { x: targetX, y: 0 },
  duration: 260,
  useNativeDriver: false,
}).start();
```

Hızlı/kaba animasyon kullanma. Minimum 200ms, spring için friction 6–10 arası.

---

## Haptics

`expo-haptics` yüklü ve kullanılıyor:

```javascript
import * as Haptics from 'expo-haptics';

// Favori (sağ swipe)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Geç (sol swipe)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

---

## Swipe Etiketleri (CardScreen)

| Yön | Metin | Renk |
|-----|-------|------|
| Sağ (favori) | `FAVORİ` | `#27AE60` |
| Sol (geç) | `GEÇ` | `#E74C3C` |

---

## Her Ekranda Standart Pattern

```javascript
// ThemeContext'ten renkleri al
const { theme, isDark } = useTheme();

// Stil factory — her render'da tema değişirse güncellenir
const s = useMemo(() => makeStyles(theme), [theme]);

// makeStyles her ekranın altında tanımlı
const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // ...
});
```

---

## Yasak Kalıplar

- ❌ CSS class selector (`.btn-primary`, `.card` vb.) — React Native'de çalışmaz
- ❌ `cursor: pointer` — mobilde anlamsız
- ❌ `:hover` pseudo-class — React Native'de yok
- ❌ `@import url(...)` Google Fonts — RN'de bu şekilde çalışmaz
- ❌ `backdrop-filter` — web CSS özelliği, RN'de farklı çalışır
- ❌ CSS variable (`--color-primary`) — RN'de desteklenmiyor
- ❌ `textTransform: 'uppercase'` — Türkçe `i→İ` için yanlış sonuç verir
- ❌ Genel UI'da hardcode renk — `theme.colors.*` kullan (istisnalar: oyun kartı, PRO badge, CTA metin, glass pill — üstte belgelenmiş)
