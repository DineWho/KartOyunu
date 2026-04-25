# Mimari — CardWho

---

## Stack

| Teknoloji | Durum |
|-----------|-------|
| React Native / Expo ~54 | Aktif — `app.json` ile yapılandırılmış |
| `expo-linear-gradient` | Kurulu, kullanılıyor |
| `expo-haptics` | Kurulu, CardScreen'de kullanılıyor |
| `@expo/vector-icons` (Feather) | Kurulu, UI aksiyonları için kullanılıyor |
| `react-native-reanimated` | Kurulu |
| `react-native-gesture-handler` | Kurulu |
| React Navigation | **Aktif** — `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` |
| External state management | **Yok** — React useState/useRef yeterli |
| Python 3 | Script çalıştırılabilir (`scripts/`) |

---

## Navigasyon Sistemi

React Navigation kullanılıyor. `App.js` içinde `NavigationContainer` → `RootStack` → `BottomTab` yapısı kurulu.

```
NavigationContainer
  └── RootStack (headerShown: false)
        ├── "MainTabs"  → BottomTab Navigator
        │     ├── "Home"      → HomeScreen
        │     ├── "Favorites" → FavoritesScreen
        │     ├── "Settings"  → SettingsScreen
        │     └── "Profile"   → ProfileScreen
        ├── "Category"  → CategoryScreen
        ├── "Mod"       → ModScreen
        └── "Cards"     → CardScreen  (gestureEnabled: false)
```

Her ekran `useNavigation()` ve `useRoute()` hook'ları ile navigasyon yapar.  
Ekranlara prop olarak `navigate` geçilmez.

### Ekranlar

| Ekran | Navigatör | TabBar | Açıklama |
|-------|-----------|--------|----------|
| HomeScreen | BottomTab | ✓ | Ana ekran: kategori filtreleri + mod listesi |
| FavoritesScreen | BottomTab | ✓ | Kaydedilen favoriler |
| SettingsScreen | BottomTab | ✓ | Ayarlar |
| ProfileScreen | BottomTab | ✓ | Profil |
| CategoryScreen | RootStack | ✗ | Kategori detay: o kategorinin modları |
| ModScreen | RootStack | ✗ | Mod detay: istatistik, açıklama, başlat |
| CardScreen | RootStack | ✗ | Kart swipe ekranı — gesture devre dışı |

### Akış

```
SplashScreen (her zaman dark, ~2.4sn)  ← NavigationContainer DIŞINDA
  └→ HomeScreen
       └→ ModScreen  (route.params.mod)
            ├→ CategoryScreen  (route.params.category)
            │    └→ ModScreen
            └→ CardScreen  (route.params.mod)
```

### Geri Navigasyon

- **Category / Mod ekranları:** iOS native back gesture otomatik çalışır (stack navigator). PanResponder yok.
- **CardScreen:** `gestureEnabled: false` — kart swipe gesture'ıyla çakışmaması için. Geri dönmek için sağ üstteki X butonu kullanılır.

### TabBar

`src/components/TabBar.js` — Bottom Tab Navigator'ın `tabBar` prop'una verilir.  
Props: `{ state, navigation }` — `state.index` aktif sekme, `navigation.navigate(routeName)` sekme değiştirir.

---

## Dosya Yapısı

```
App.js                          — Root: ThemeProvider + FavoritesProvider + navigation state
app.json                        — Expo yapılandırması
index.js                        — Expo entry point

assets/                         — Görseller, fontlar, ikonlar

src/
  ThemeContext.js               — Dark/light mod context, useTheme() hook
  theme.js                      — darkTheme ve lightTheme renk token nesneleri

  context/
    FavoritesContext.js         — Global favoriler state'i (FavoritesProvider)

  data/
    index.js                    — Tüm içerik verisi: categories, mods, cards

  components/
    TabBar.js                   — Alt tab bar bileşeni (home/favorites/settings/profile)

  screens/
    SplashScreen.js             — Açılış animasyonu, her zaman dark tema
    HomeScreen.js               — Ana ekran: kategori filtreleri + mod listesi
    CategoryScreen.js           — Kategori detay ekranı
    ModScreen.js                — Mod detay: istatistik, açıklama, başlat butonu
    CardScreen.js               — Kart swipe ekranı, favori kaydetme
    FavoritesScreen.js          — Kayıtlı favoriler listesi
    SettingsScreen.js           — Ayarlar ekranı
    ProfileScreen.js            — Profil ekranı

scripts/
  update-claude-md.mjs          — CLAUDE.md otomatik güncelleme scripti
```

---

## Context Yapısı

```javascript
// App.js sarmalama sırası
<ThemeProvider>        // src/ThemeContext.js — useTheme()
  <FavoritesProvider>  // src/context/FavoritesContext.js — useFavorites()
    <AppContent />
  </FavoritesProvider>
</ThemeProvider>
```

`useFavorites()` hook'u: `{ favorites, addFavorite, removeFavorite }` — CardScreen ve FavoritesScreen kullanır.

---

## Theme Sistemi

```javascript
const { theme, isDark, toggleTheme } = useTheme();
const s = useMemo(() => makeStyles(theme), [theme]);
```

Her ekranın altında `makeStyles(theme)` factory'si tanımlı. Renkler `theme.colors.*` üzerinden alınır.  
Renk token tablosu → [design-system/cardwho/MASTER.md](design-system/cardwho/MASTER.md)

HomeScreen sağ üstte ☀/☽ toggle butonu var.
