# CardWho — Claude Talimatları

Çok dilli sohbet kartı oyunu. Mobil uygulama (iOS & Android), React Native / Expo. TR/EN/ES/FR/DE/RU desteklenir; yeni dil sonradan eklenebilir.

---

## Çalışmadan Önce Oku

| Görev | Oku |
|-------|-----|
| Navigasyon, ekranlar, context, i18n, auth, persistence, theme | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Veri modeli, paket/kategori/mod/seviye, multilingual yapı, badge, localize | [DATA_MODEL.md](DATA_MODEL.md) |
| İçerik kuralları, soru yazımı, Free/Pro dengesi, çok dilli soru yazımı | [CONTENT_GUIDE.md](CONTENT_GUIDE.md) |
| UI, tema, bileşen kalıpları, renk tokenları | [design-system/cardwho/MASTER.md](design-system/cardwho/MASTER.md) |
| Bilinen bug'lar, geçici çözümler, kritik pattern'lar | [KNOWN_ISSUES.md](KNOWN_ISSUES.md) |
| Sürüm sonrası kontroller (Sentry vb.) | [RELEASE.md](RELEASE.md) |

---

## Hedef Platformlar

Uygulama **hem telefon hem tablet** için eş zamanlı geliştirilmektedir. Her değişiklik varsayılan olarak her iki platform için geçerlidir. Kullanıcı açıkça "yalnızca telefonda" veya "yalnızca tablette" demediği sürece ayrıca sorma — iki taraf için de uygula.

---

## Mutlak Kurallar

1. **Mevcut export'lar:** `src/data/index.js` → `categories`, `mods`, `cards`. (`mods` adı kanonik; eski `decks` rename tamamlandı.)
2. **React Navigation aktif** — `useNavigation()` ve `useRoute()` hook'larını kullan; ekranlara `navigate` prop'u geçme.
3. **`textTransform: 'uppercase'` kullanma** — Türkçe `i→İ` için yanlış sonuç verir. `src/i18n/upper.js`'deki `upperTR()` veya `useUpperT()` helper'ını kullan.
4. **CardScreen gesture** — `gestureEnabled: false`, kart swipe PanResponder tek hâkimdir. Geri için X butonu var, ayrı back gesture ekleme.
5. **Her paket tam olarak 12 soru içerir** — istisna yok.
6. **1 soru → yalnızca 1 paket** — Aynı veya çok benzer soru başka pakette tekrar edemez.
7. **Yeni içerik sık gelecek** — Paket, kategori, mod, seviye ve sorular sürekli artacak. Kod buna dayanıklı olmalı.
8. **Çok dilli (i18n) yapı** — UI string'leri için `t()` (react-i18next), içerik için `localize()` / `useLocalize()` helper'ları (`src/data/localize.js`). TR canonical kalır; EN/ES/FR/DE/RU paralel field'larda. Hardcode TR yazma. Yeni içerik metni eklerken 6 dil eksiksiz olmalı (`npm run validate:content` ile kontrol).

---

## Doc-Update Kuralı

Bir PR/commit aşağıdakilerden birini içeriyorsa, ilgili .md dosyaları aynı PR'da güncellenmelidir. Sayısal alanlar (mod/kategori sayısı vb.) `<!-- AUTO -->` blok içinde — `npm run sync:docs` ile güncellenir, elle düzenleme.

| Değişiklik | Güncellenecek dosya |
|------------|---------------------|
| Yeni library / dependency | ARCHITECTURE.md (Stack) |
| Yeni context / provider | ARCHITECTURE.md (Context Yapısı) |
| Yeni screen / route | ARCHITECTURE.md (Ekran Tablosu + nav ağacı) |
| Yeni AsyncStorage anahtarı | ARCHITECTURE.md (Persistence) |
| Yeni i18n string | 6 dil eksiksiz olmalı (`npm run validate:content`) |
| Yeni kritik pattern / workaround | KNOWN_ISSUES.md |
| Yeni release prosedür adımı | RELEASE.md |
| Yeni veri alanı (mod/kategori/badge field'ı) | DATA_MODEL.md |

**Pre-commit hook:** `simple-git-hooks` ile `npm run sync:docs` + `npm run validate:content` her commit öncesi çalışır — AUTO bloklar otomatik güncellenir, eksik i18n çevirisi commit'i durdurur. Acil bypass: `git commit --no-verify`.

---

## Türkçe Büyük Harf

```javascript
import { upperTR, useUpperT } from '../i18n/upper';
```

Section label'lar (`KART`, `SÜRE`, `KİŞİ`, `SEVİYE`, `HAKKINDA`, `NE BEKLEMELİ?`) i18n'den geçer. Yeni label eklerken `useUpperT()` hook'u tercih edilir.

---

## Claude Commit Formatı

Kullanıcı commit istediğinde:

```text
claude: YYYY-MM-DD HH:mm +03 <kısa açıklama>

Claude-assisted change.

<değişiklik özeti — ne yapıldı ve neden>
```

Tarih/saat: commit anının yerel saati (`+03`). Codex'in attığı commit'leri görmek için `git log` geçmişinde `codex:` ile başlayanlara bak.
