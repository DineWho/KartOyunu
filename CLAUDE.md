# CardWho — Claude Talimatları

Türkçe sohbet kartı oyunu. React Native / Expo ile yapılmış mobil uygulama (iOS & Android).

---

## Çalışmadan Önce Oku

| Görev | Oku |
|-------|-----|
| Navigasyon, ekranlar, stack, dosya yapısı | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Veri modeli, paket/kategori/mod/seviye, mod tablosu | [DATA_MODEL.md](DATA_MODEL.md) |
| İçerik kuralları, soru yazımı, Free/Pro dengesi | [CONTENT_GUIDE.md](CONTENT_GUIDE.md) |
| UI, tema, bileşen kalıpları, renk tokenları | [design-system/cardwho/MASTER.md](design-system/cardwho/MASTER.md) |
| Bilinen bug'lar, geçici çözümler, kritik pattern'lar | [KNOWN_ISSUES.md](KNOWN_ISSUES.md) |

---

## Hedef Platformlar

Uygulama **hem telefon hem tablet** için eş zamanlı geliştirilmektedir. Her değişiklik varsayılan olarak her iki platform için geçerlidir. Kullanıcı açıkça "yalnızca telefonda" veya "yalnızca tablette" demediği sürece ayrıca sorma — iki taraf için de uygula.

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

## Claude ↔ Codex Geçiş Notu

### Codex commit formatı

```text
codex: YYYY-MM-DD HH:mm +03 <kısa açıklama>
```

Commit mesajı gövdesinde `Codex-assisted change.` notu, değişiklik özeti ve çalıştırılan kontroller bulunur.

### Claude commit formatı

**Claude, kullanıcı commit istediğinde her zaman şu formatı kullanır:**

```text
claude: YYYY-MM-DD HH:mm +03 <kısa açıklama>

Claude-assisted change.

<değişiklik özeti — ne yapıldı ve neden>
```

- Tarih/saat: commit anının yerel saati (`+03` timezone)
- Özet satırı kısa ve açıklayıcı olmalı
- Gövde: yapılan işin kısa açıklaması

Claude tarafında devam ederken Codex'in yaptığı işleri görmek için `git log` geçmişinde `codex:` ile başlayan commit'lere bak. Codex tarafında ise `claude:` ile başlayanlara.

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
Tam token listesi ve dark/light değerleri → [design-system/cardwho/MASTER.md](design-system/cardwho/MASTER.md)

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
- `@cardwho_favorites` — Favoriler
- `@cardwho_stats` — İstatistikler (JSON array)

---

## Release Sonrası Kontrol Listesi

**Her yeni sürüm yayınlandıktan sonra Claude otomatik olarak şunları yapar:**

1. **Sentry kontrolü** — `mcp__claude_ai_Sentry__search_issues` ile son 7 gündeki yeni/unresolved hataları çek
   - Org: `erik-medya`, Project: `cardwho`, Region: `https://de.sentry.io`
   - Kritik hata varsa → öncelikli düzelt
   - Küçük hatalar varsa → raporla, sonraki sprint'e ekle
2. **Crash-free rate** — Sentry Insights'ta sessions/users oranına bak
3. Hata yoksa kullanıcıya kısaca bildir: "Sentry temiz, sorun yok"

> Bu adım kullanıcı "release yaptık" veya "yeni sürüm çıktı" dediğinde otomatik devreye girer. Ayrıca sormaya gerek yok.
