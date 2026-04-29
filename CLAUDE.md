# CardWho — Claude Talimatları

Çok dilli sohbet kartı oyunu. Mobil uygulama (iOS & Android), React Native / Expo. TR/EN/ES/FR/DE/RU desteklenir; yeni dil sonradan eklenebilir.

**Çalışma modeli:** Claude maximizer — git/terminal/SSH/MCP işleri Claude'a aittir, kullanıcıdan elle iş istemek yalnızca cihaz/web UI/2FA gerektiren durumlarda. Detay: memory `feedback_claude_maximizer.md`.

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
8. **Çok dilli (i18n) yapı** — UI string'leri için `t()` (react-i18next), içerik için `localize()` / `useLocalize()` helper'ları (`src/data/localize.js`). TR canonical kalır; EN/ES/FR/DE/RU paralel field'larda. Hardcode TR yazma. **Her metin eklemesi/değişikliği aynı commit'te 6 dilde tam olmalı** — istisnasız: (a) yeni paket yüklenirken tüm sorular 6 dilde, (b) yeni ekran/feature/component'in tüm UI string'leri 6 dilde, (c) mevcut bir metin değiştirilirken aynı anahtar tüm `src/i18n/locales/*.json` dosyalarında güncellenir. Tek bir dilde "sonra çeviririz" notu bırakma. `npm run validate:content` paket/mod/kategori tamlığını, locale JSON'larındaki anahtar paritesi de pre-commit'te kontrol edilir.

---

## Aktif Mimari Kararlar

Bu kararlar **henüz uygulanmadı** ama gelecek tüm veri/sync/backend tartışmalarının temelidir. Her karar uygulandığında bu listeden silinir; arka plan ve tartışma geçmişi için memory dosyalarına bak.

1. **Yol 2 (oyun verisi sync) OVH ile beraber gelecek.** Şu an favori/stat/badge **lokal** (AsyncStorage). UI copy'sinde "yedekleme", "cihaz değişimine dayanıklı kayıt" tarzı vaatler **kullanılmaz**. RevenueCat ve OVH backend kurulup Yol 2 hayata geçince copy güçlendirilir.

2. **Sync mimarisi: backend-agnostic, REST/polling.** Profil için OVH REST entegrasyonu Faz 3'te yapıldı (`src/lib/apiClient.js` + `profileApi.js`, `UserProfileContext` mount-time fetch + optimistic PATCH). FavoritesContext, StatsContext, BadgesContext de Yol 2'de aynı pattern'i kullanacak: **realtime listener (`onSnapshot`) kullanma** — basit `pull` + manuel `push`. Backend response'ları context sınırında düz JSON olarak alınır.

3. **Acelesi yok.** Yayın baskısı yok; "doğru yapılsın" önceliği var. Yarım yamalak Yol 2 yazılıp 3 ay sonra rewrite edilmesin diye OVH backend hazır olana kadar ertelenir.

**Detaylı yol haritası**: `~/.claude/plans/github-da-cardwho-cloud-repo-su-olu-tur-stateful-meadow.md` — sunucu envanteri, faz faz takvim, dashboard kapsamı, teknoloji seçimleri, SSH ops protokolü. Backend/dashboard/landing/OVH konularında bu dosyayı **mutlaka oku**, gelecek konuşmalarda 0'dan başlama.

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
