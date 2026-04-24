# Veri Modeli — KartOyunu

> **Dikkat:** Mevcut kod (`src/data/index.js`) hâlâ **eski modelle** çalışıyor.
> Hedef model bu dosyada tanımlı — kod henüz güncellenmedi.

---

## Oyun Hiyerarşisi

```
Paket → Kategori → Mod → Seviye → Sorular
```

| Katman | Tanım |
|--------|-------|
| **Kategori** | Ana bağlam, hedef kitle, konu |
| **Mod** | Konuşma yaklaşımı, deneyim biçimi, soru açısı |
| **Seviye** | Duygusal yoğunluk, ton, derinlik |
| **Paket** | Kategori + Mod + Seviye kombinasyonu — oynanabilir en küçük içerik birimi |

**Paket kuralları:**
- Her paket tam olarak **12 benzersiz soru** içerir
- **1 soru → yalnızca 1 paket** (kesin kural, istisnasız)
- Aynı (Kategori + Mod + Seviye) kombinasyonu farklı paketlerde tekrar edebilir (örn. Free ve PRO aynı temayı farklı sorularla sunar)
- Paket adları UI'da **gösterilmez**; Airtable'da `PKG_FREE_001` / `PKG_PRO_001` formatında tutulur

---

## ID Konvansiyonları

Her katmanın kararlı bir ID formatı vardır. Bu formatlar içerik büyüdükçe, Airtable entegrasyonunda ve JSON dosyalara geçişte referans bütünlüğünü korur.

| Katman | Format | Örnekler |
|--------|--------|----------|
| Kategori | Turkish slug | `ciftler`, `bulusma`, `arkadaslar`, `aile`, `grup` |
| Mod | Turkish slug | `hafif_sohbet`, `buz_kirici`, `nostalji`, `gizli_gercekler` |
| Seviye | Turkish slug | `hafif`, `derin`, `cesur`, `eglenceli`, `flortoz` |
| Paket (Free) | `PKG_FREE_NNN` | `PKG_FREE_001`, `PKG_FREE_012` |
| Paket (Pro) | `PKG_PRO_NNN` | `PKG_PRO_001`, `PKG_PRO_008` |
| Kart | `CARD_NNNNNN` | `CARD_000001`, `CARD_000240` |

**Kurallar:**
- Kategori, Mod ve Seviye ID'leri değişmez — içerik büyüse de bu ID'ler sabit kalır
- Paket ID'leri sıralı ve benzersizdir; aynı (Kategori + Mod + Seviye) kombinasyonu Free ve Pro olarak ayrı ID alabilir
- Turkish slug: küçük harf, boşluk yerine `_`, ASCII (`ç→c`, `ş→s`, `ö→o`, `ü→u`, `ğ→g`, `ı→i`)
- ID'ler UI'da kullanıcıya **gösterilmez**

**Neden bu sistem?**
- **Airtable:** İçerik Airtable'da yönetildiğinde foreign key ilişkileri bu ID'lerle kurulur
- **Favoriler & analitik:** Kart/paket favorilendiğinde veya oynatıldığında stabil ID gerekir
- **Tekrar kontrolü:** Aynı `packageId`'ye ait sorular kolay sorgulanır
- **Ölçeklenme:** `src/data/index.js` → ayrı JSON dosyalara geçişte referanslar bozulmaz

---

## Hedef Veri Yapısı (Planlanıyor)

```javascript
// Referans tablolar — birbirinden bağımsız
categories: { id, name, icon, color }
modes:      { id, name }
levels:     { id, name }

// Paket — erişim kontrolü buradan, UI'da adı görünmez
packages: {
  id,           // PKG_FREE_001 / PKG_PRO_001
  premium: boolean,
  categoryId,
  modeId,
  levelId,
  status,       // 'draft' | 'published' | 'archived'
  createdAt,    // ISO date — "Yeni" badge ve sıralama için
}

// Sorular — bir pakete bağlı, hiçbir soru iki pakette olamaz
cards: {
  id,           // CARD_000001 — metin değişse de ID stabil kalır
  packageId,
  text,
}

// Favoriler (AsyncStorage / backend) — cardId ile bağlanır, metne değil
favorites: {
  cardId,       // CARD_000001
  packageId,    // PKG_FREE_001 — kategori rengi ve başlık için
  createdAt,    // ISO date — sıralama için
}
```

---

## Mevcut Kod Yapısı (Eski Model — `src/data/index.js`)

### Kategoriler (5 adet)

| id | name | icon | color |
|----|------|------|-------|
| `ciftler` | Çiftler | 💑 | `#E94560` |
| `bulusma` | İlk Buluşma | 🌹 | `#FF6B35` |
| `arkadaslar` | Arkadaşlar | 🎉 | `#2ECC71` |
| `aile` | Aile | 🏠 | `#3498DB` |
| `grup` | Grup | 🎲 | `#9B59B6` |

### Modlar (20 adet)

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

**Toplam:** 12 soru × 20 mod = 240 soru  
**Her kategoride:** 2 ücretsiz + 2–3 premium mod

### `mod.people` Notu

ModScreen'de `.replace(/\s*kişi$/i, '')` ile "kişi" suffix'i strip edilir — sadece sayı/etiket gösterilir.

---

## Geçiş Notları

- `mods` export'u aktif (eski `decks` rename tamamlandı)
- Her mod şu an `categoryId` kullanıyor; `modeId` ve `levelId` ayrı alanlar olarak eklenecek
- Sorular şu an `cards[modId]` map'inde — hedef model `packageId` referanslı düz array
- İçerik ölçeklendikçe `src/data/index.js` → ayrı JSON dosyalar (`content/`) taşınması düşünülüyor
