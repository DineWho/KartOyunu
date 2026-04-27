# Mimari — CardWho

React Native / Expo, çok dilli (TR/EN/ES/FR/DE/RU), iOS + Android. Bu doküman uygulamanın canlı yapısını yansıtır; sayısal alanlar `<!-- AUTO -->` blok içinde otomatik üretilir.

---

## Stack

| Alan | Teknoloji |
|------|-----------|
| Çekirdek | Expo SDK ~54, React Native 0.81, React 19 |
| Navigasyon | `@react-navigation/native` 7.x + `native-stack` + `bottom-tabs` |
| State (yerel) | React Context — harici store yok |
| Persistence | `@react-native-async-storage/async-storage` |
| i18n | `i18next` + `react-i18next` + `expo-localization` |
| Backend / Auth | Firebase: `@react-native-firebase/{app,messaging,analytics,remote-config}` + `firebase` web SDK (Auth/Firestore) |
| Auth flow | `expo-apple-authentication`, `expo-auth-session` (Google), `expo-crypto` |
| Telemetri | `@sentry/react-native` |
| Animasyon & Gesture | `react-native-reanimated` 4, `react-native-gesture-handler` 2 |
| UI yardımcıları | `expo-linear-gradient`, `expo-haptics`, `@expo/vector-icons` (Feather), `react-native-safe-area-context`, `react-native-screens` |
| Paylaşım | `react-native-share`, `react-native-view-shot`, `expo-store-review` |
| Ses & medya | `expo-av` |
| Lokal araçlar | Node ESM scriptleri (`scripts/`) |

Bağımlılıkların kanıtı: [package.json](package.json).

---

## Navigasyon Sistemi

`App.js`'de kurulu. `NavigationContainer` `AppShell` içinde Splash/Onboarding tamamlandıktan sonra mount edilir.

```
GestureHandlerRootView
  └ Provider zinciri (aşağıdaki Context Yapısı)
       └ AppShell
            ├ SplashScreen          ← NavigationContainer DIŞINDA, conditional
            ├ NotificationOnboardingScreen ← NavigationContainer DIŞINDA, conditional
            └ NavigationContainer
                 └ RootStack (headerShown: false)
                      ├ "MainTabs"       → BottomTab Navigator
                      │     ├ "Home"      → HomeScreen
                      │     ├ "Favorites" → FavoritesScreen
                      │     ├ "Settings"  → SettingsScreen
                      │     └ "Profile"   → ProfileScreen
                      ├ "Category"       → CategoryScreen
                      ├ "Mod"            → ModScreen
                      ├ "Cards"          → CardScreen      (gestureEnabled: false)
                      ├ "Login"          → LoginScreen     (presentation: 'modal')
                      ├ "AccountInfo"    → AccountInfoScreen
                      └ "Notifications"  → NotificationsScreen
```

Ekranlar `useNavigation()` ve `useRoute()` hook'larıyla navigasyon yapar; prop ile `navigate` geçilmez.

### Cold-open push handling

`AppShell`, mount sırasında `messaging().getInitialNotification()` çağrısıyla soğuk açılışta push var mı diye bakar. Varsa `initialState` olarak `[MainTabs, Notifications]` stack'i kurulur — geri tuşu Home'a düşer. (`App.js:81-99, 110-112`)

### Akış

```
SplashScreen (i18n init + push check + min süre)
  └→ (varsa) NotificationOnboardingScreen
       └→ MainTabs/Home
            └→ CategoryScreen   (route.params.category)
                 └→ ModScreen   (route.params.mod)
                      └→ CardScreen (route.params.mod)

Profile → AccountInfo / Login (modal) / Notifications
```

### Geri navigasyon

- **Category, Mod, AccountInfo, Notifications:** iOS native back gesture otomatik (stack navigator).
- **CardScreen:** `gestureEnabled: false` — kart swipe PanResponder ile çakışmasın diye. Geri için sağ üstteki X butonu.
- **Login:** modal presentation — alt-sürükleme ile kapanır.

---

## Ekran Tablosu

<!-- AUTO:screen-table START -->
| Ekran | Konum | TabBar | Notlar |
|-------|-------|--------|--------|
| SplashScreen | NavigationContainer dışı | ✗ | i18n init + push check tamamlanana kadar |
| NotificationOnboardingScreen | NavigationContainer dışı | ✗ | Bildirim izni akışı (conditional) |
| HomeScreen | BottomTab | ✓ | Ana ekran: kategori filtreleri + mod listesi |
| FavoritesScreen | BottomTab | ✓ | Kaydedilen favoriler |
| SettingsScreen | BottomTab | ✓ | Ayarlar, tema/dil/ses, istatistikler |
| ProfileScreen | BottomTab | ✓ | Hesap özeti, rozetler |
| CategoryScreen | RootStack | ✗ | Kategori detay: o kategorinin modları |
| ModScreen | RootStack | ✗ | Mod detay: açıklama, başlat |
| CardScreen | RootStack | ✗ | Kart swipe — gesture devre dışı |
| LoginScreen | RootStack (modal) | ✗ | Apple/Google ile giriş |
| AccountInfoScreen | RootStack | ✗ | Hesap bilgileri, oturum yönetimi |
| NotificationsScreen | RootStack | ✗ | Push/inbox mesaj listesi |
<!-- AUTO:screen-table END -->

---

## Context Yapısı

`App.js`'de provider sırası (dıştan içe). Her sıra altındakine bağımlıdır.

```javascript
<GestureHandlerRootView>
  <ThemeProvider>            // src/ThemeContext.js
    <AuthProvider>           // src/context/AuthContext.js
      <UserProfileProvider>  // src/context/UserProfileContext.js — Auth'a bağımlı
        <RemoteConfigProvider>     // src/context/RemoteConfigContext.js
          <NotificationProvider>   // src/context/NotificationContext.js — FCM, in-app
            <AudioProvider>        // src/context/AudioContext.js
              <StatsProvider>      // src/context/StatsContext.js
                <FavoritesProvider>// src/context/FavoritesContext.js
                  <BadgesProvider> // src/context/BadgesContext.js — Stats+Favorites'a bağımlı
                    <AppShell />
```

### Ana hook'lar

| Hook | Sağladığı |
|------|-----------|
| `useTheme()` | `{ theme, isDark, themeMode, setThemeMode }` (`'system' \| 'dark' \| 'light'`) |
| `useAuth()` | mevcut kullanıcı, login/logout aksiyonları |
| `useUserProfile()` | profil verileri (Firestore senkronu), `@cardwho_user_profile_<uid>` lokalde |
| `useRemoteConfig()` | feature flag'ler (örn. `paywall_enabled`) |
| `useNotifications()` | inbox listesi, push handler'lar, `onboardingStatus` |
| `useAudio()` | ses açık/kapalı, efekt çalma |
| `useStats()` | `addStat(cardId, modId, action)`, `getTotalStats()`, `getStatsByMod(modId)`, `clearStats()` |
| `useFavorites()` | `{ favorites, addFavorite, removeFavorite }` |
| `useBadges()` | kazanılan rozetler, popup tetikleyici |

> **Not:** `src/context/NetworkContext.js` dosyası mevcut; App.js'e henüz bağlanmamış. Aktif edildiğinde provider zincirine ve bu tabloya eklenecek.

---

## i18n & Localization

İki ayrı katman vardır: **UI string'leri** ve **içerik (mod/kart/kategori) field'ları**.

### UI string'leri

`src/i18n/index.js` — `i18next` + `react-i18next` + `expo-localization`.

- 6 dil: `tr`, `en`, `es`, `fr`, `de`, `ru` (`SUPPORTED_LANGUAGES`)
- Resource'lar: `src/i18n/locales/{tr,en,es,fr,de,ru}.json`
- Cihaz dili `expo-localization`'dan okunur; AsyncStorage `@cardwho_locale` öncelikli
- `fallbackLng: 'en'`
- Dil değişimi: `setLanguage(lang)` — değer kayıtlı olur ve i18n.changeLanguage çağrılır
- Bayrak/dil isimleri: `LANGUAGE_META[lang] = { native, flags }`

Kullanım:
```javascript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
t('home.title');
```

### Türkçe büyük harf

`src/i18n/upper.js`:
- `upperTR(str)` — saf fonksiyon, `i → İ` dönüşümü
- `useUpperT()` — i18n.language'i de okur, locale-aware uppercase

`textTransform: 'uppercase'` kullanma — Türkçe `i → I` yanlışı yapar.

### İçerik (multilingual A-shape)

Mod/kart/kategori field'ları nesne yapısında:
```javascript
{ tr: '...', en: '...', es: '...', fr: '...', de: '...', ru: '...' }
```

`src/data/localize.js`:
- `localize(field, lang)` — istenen dil yoksa fallback sırası: `lang → en → tr → ilk non-null → ''`
- `useLocalize()` — hook varyantı, `i18n.language`'i otomatik okur

Detay yapı: [DATA_MODEL.md](DATA_MODEL.md#multilingual-a-shape).

---

## Auth & Firebase

### SDK kullanımı

İki Firebase SDK paralel kullanılıyor:
- **`@react-native-firebase/*`** (native modüller): Messaging, Analytics, Remote Config — push, telemetri, feature flag
- **`firebase` (web SDK)**: Auth ve Firestore — JS tarafında çalışan modüller

Init: `src/lib/firebase.js`, Firestore yardımcıları: `src/lib/firestore.js`.

### Auth akışı

`AuthContext` (`src/context/AuthContext.js`) Firebase Auth state'ini yansıtır.

- **Apple ile giriş:** `expo-apple-authentication` (iOS) — `expo-crypto` ile nonce üretimi
- **Google ile giriş:** `expo-auth-session` (Google provider)
- **Anonim kullanıcı:** İlk açılışta otomatik (gerekirse)

Login akışı: ProfileScreen / SettingsScreen → `LoginScreen` (modal). Başarılı login sonrası modal kapanır, `UserProfileContext` Firestore'dan profili çeker.

### Push (FCM)

`NotificationContext` (`src/context/NotificationContext.js`):
- FCM token AsyncStorage `@cardwho_fcm_token`'da
- Foreground/background/cold-open mesajları handle eder
- In-app inbox: AsyncStorage `@cardwho_notifications`
- İzin onboarding state: `@cardwho_notif_onboarded`, `@cardwho_notifications_enabled`

Cold-open push App.js:81-99'da yakalanır, NavigationContainer `initialState`'e enjekte edilir.

### Remote Config

`RemoteConfigContext` (`src/context/RemoteConfigContext.js`):
- `paywall_enabled` ve benzeri feature flag'ler
- Default değerler dosya içinde fallback olarak tanımlı

---

## Persistence (AsyncStorage)

Tüm yerel state `@react-native-async-storage/async-storage` üzerinden persist edilir. Anahtar prefix'i: `@cardwho_`.

<!-- AUTO:storage-keys START -->
| Anahtar | Sahibi | İçerik |
|---------|--------|--------|
| `@cardwho_theme` | ThemeContext | `'system' \| 'dark' \| 'light'` |
| `@cardwho_locale` | i18n/index.js | Aktif dil kodu (`tr`, `en`, ...) |
| `@cardwho_favorites` | FavoritesContext | Favori kart listesi (JSON) |
| `@cardwho_stats` | StatsContext | Oyun istatistikleri (JSON array) |
| `@cardwho_badges` | BadgesContext | Kazanılan rozet ID'leri |
| `@cardwho_sound_enabled` | AudioContext | Ses açık/kapalı boolean |
| `@cardwho_notifications` | NotificationContext | In-app inbox mesajları |
| `@cardwho_notifications_enabled` | NotificationContext | Push izin durumu |
| `@cardwho_notif_onboarded` | NotificationContext | Onboarding tamamlandı mı |
| `@cardwho_fcm_token` | NotificationContext | FCM token cache |
| `@cardwho_review` | utils/reviewManager | Store review tetikleyici state |
| `@cardwho_user_profile_<uid>` | UserProfileContext | Kullanıcı bazında profil cache |
<!-- AUTO:storage-keys END -->

> Yeni bir AsyncStorage anahtarı eklenirken bu tabloyu güncelle (CLAUDE.md Doc-Update Kuralı).

---

## Theme Sistemi

`src/ThemeContext.js` + `src/theme.js` (token nesneleri).

```javascript
const { theme, isDark, themeMode, setThemeMode } = useTheme();
const s = useMemo(() => makeStyles(theme), [theme]);
```

- `themeMode`: `'system' | 'dark' | 'light'` — varsayılan `'system'`
- `setThemeMode(mode)` AsyncStorage `@cardwho_theme`'ya yazar
- `isDark` — `themeMode === 'system'` ise cihazın `useColorScheme()`'ine bağlı
- `theme.colors.*` — token'lar için tek kaynak: [design-system/cardwho/MASTER.md](design-system/cardwho/MASTER.md)

Her ekranda makeStyles factory'si tanımlı; tema değiştiğinde useMemo yeniden hesaplar.

---

## Dosya Yapısı

```
App.js                          — Root: provider zinciri + AppShell + Sentry.wrap
index.js                        — Expo entry point
app.json / package.json         — Expo & dependency config
RELEASE.md                      — Sürüm sonrası kontroller (Sentry vb.)

src/
  ThemeContext.js               — useTheme (themeMode/setThemeMode)
  theme.js                      — darkTheme + lightTheme

  context/                      — Provider'lar (App.js sırasıyla mount edilir)
    AuthContext.js              — Firebase Auth state
    UserProfileContext.js       — Firestore profil senkronu
    RemoteConfigContext.js      — Firebase Remote Config flags
    NotificationContext.js      — FCM, in-app inbox
    AudioContext.js             — Ses ayarı
    StatsContext.js             — Oyun istatistikleri
    FavoritesContext.js         — Favori kartlar
    BadgesContext.js            — Rozet sistemi
    NetworkContext.js           — (henüz aktif değil)

  i18n/
    index.js                    — i18next setup, setLanguage, LANGUAGE_META
    upper.js                    — upperTR / useUpperT
    locales/                    — tr/en/es/fr/de/ru.json

  data/
    index.js                    — re-export: categories, mods, cards
    categories.js               — multilingual kategori tanımları
    mods.js                     — multilingual mod tanımları
    cards/                      — kategori başına kart dosyaları
    localize.js                 — localize, useLocalize
    badges.js                   — STATIC_BADGES + buildCategory/Level Badges
    countries.js                — ülke listesi (UserProfile için)

  lib/
    firebase.js                 — Firebase init
    firestore.js                — Firestore yardımcıları
    navigationRef.js            — root nav ref + flushPendingNavigation

  components/                   — Yeniden kullanılabilir UI
    BadgePopup, Confetti, ConfirmPanel, Greeting, QuestionShareCard,
    ScreenHeader, SettingsGroup, SettingsRow, TabBar, Toast

  screens/                      — 12 ekran (Ekran Tablosu)
  utils/                        — responsive, reviewManager, shareQuestionCard

scripts/
  validate-content.mjs          — npm run validate:content (12 soru, tekrar, i18n completeness)
  sync-docs.mjs                 — npm run sync:docs (AUTO blokları kaynak veriden günceller)

# Pre-commit hook (simple-git-hooks): sync:docs + validate:content
# Config: package.json "simple-git-hooks" alanında
# npm install sonrası "prepare" script'i hook'u kurar

design-system/cardwho/
  MASTER.md                     — UI/tema/bileşen kalıpları
```

---

## Telemetri (Sentry)

`Sentry.init` `App.js:35-38`'de DSN ile yapılandırılır. `Sentry.wrap(App)` (`App.js:174`) component tree'yi sarar — uncaught error'lar otomatik raporlanır.

Sürüm sonrası kontrol prosedürü: [RELEASE.md](RELEASE.md).
