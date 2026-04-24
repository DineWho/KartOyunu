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

### Kategoriler (15 adet)
| id | name | icon | color |
|----|------|------|-------|
| `arkadaslar` | Arkadaşlar | 🎉 | `#2ECC71` |
| `bulusma` | İlk Buluşma | 🌹 | `#FF6B35` |
| `ciftler` | Çiftler | 💑 | `#E94560` |
| `aile` | Aile | 🏠 | `#3498DB` |
| `grup` | Grup | 🎲 | `#9B59B6` |
| `burclar` | Burçlar | 🔮 | `#8E44AD` |
| `yemek` | Yemek | 🍽️ | `#E67E22` |
| `seyahat` | Seyahat | ✈️ | `#1ABC9C` |
| `evcil` | Evcil Hayvanlar | 🐾 | `#27AE60` |
| `is` | İş Hayatı | 💼 | `#2C3E50` |
| `nostalji` | Nostalji | 📼 | `#F39C12` |
| `psikoloji` | Psikoloji | 🧠 | `#16A085` |
| `viral` | Viral | 🔥 | `#E74C3C` |
| `siyaset` | Siyaset | 🏛️ | `#7F8C8D` |
| `kaos` | Kaos | ⚡ | `#D35400` |

### Modlar (86 adet)
| id | kategori | title | emoji | level | people | premium |
|----|----------|-------|-------|-------|--------|---------|
| `arkadaslar_komik` | arkadaslar | Komik | 😂 | Eğlenceli | 2–6 kişi | ✗ |
| `arkadaslar_nostalji` | arkadaslar | Nostalji | 📸 | Sıcak | 2–6 kişi | ✗ |
| `arkadaslar_maskesiz` | arkadaslar | Maskesiz | 🪞 | Filtresiz | 2–4 kişi | ✓ |
| `arkadaslar_eski_defterler` | arkadaslar | Eski Defterler | 📖 | Katmanlı | 2–4 kişi | ✓ |
| `arkadaslar_dostluk_siniri` | arkadaslar | Dostluk Sınırı | 🔥 | İddialı | 2–4 kişi | ✓ |
| `bulusma_rahat_baslangic` | bulusma | Rahat Başlangıç | ☕ | Hafif | 2 kişi | ✗ |
| `bulusma_ilk_adim` | bulusma | İlk Adım | 👀 | Hafif | 2 kişi | ✗ |
| `bulusma_merak_uyandiran` | bulusma | Merak Uyandıran | 🌸 | Rahat | 2 kişi | ✗ |
| `bulusma_kimyayi_test_et` | bulusma | Kimyayı Test Et | 💘 | Flörtöz | 2 kişi | ✓ |
| `bulusma_ince_sinyaller` | bulusma | İnce Sinyaller | 🔍 | Sezgisel | 2 kişi | ✓ |
| `bulusma_kirmizi_cizgiler` | bulusma | Kırmızı Çizgiler | 🚩 | Keskin | 2 kişi | ✓ |
| `ciftler_hafif_sohbet` | ciftler | Hafif Sohbet | 😄 | Hafif | 2 kişi | ✗ |
| `ciftler_gunluk_hayat` | ciftler | Günlük Hayat | 🏡 | Rahat | 2 kişi | ✗ |
| `ciftler_gizli_gercekler` | ciftler | Gizli Gerçekler | 🔐 | Mahrem | 2 kişi | ✓ |
| `ciftler_aramizda_kalsin` | ciftler | Aramızda Kalsın | 💫 | Özel | 2 kişi | ✓ |
| `ciftler_gece_yarisi` | ciftler | Gece Yarısı | 🌊 | Yoğun | 2 kişi | ✓ |
| `aile_aksam_yemegi` | aile | Akşam Yemeği | 🏡 | Sıcak | 2–8 kişi | ✗ |
| `aile_cocuklarla` | aile | Çocuklarla | 🌈 | Eğlenceli | 2–8 kişi | ✗ |
| `aile_biz_bize` | aile | Biz Bize | 💕 | Özel | 2–8 kişi | ✓ |
| `aile_kokler` | aile | Kökler | 🌳 | Düşündüren | 2–8 kişi | ✓ |
| `aile_aile_arasinda` | aile | Aile Arasında | 🌊 | Mahrem | 2–6 kişi | ✓ |
| `grup_buz_kirici` | grup | Buz Kırıcı | ❄️ | Hafif | 3+ kişi | ✗ |
| `grup_tanisma_masasi` | grup | Tanışma Masası | 🥳 | Rahat | 3+ kişi | ✗ |
| `grup_oda_dinamigi` | grup | Oda Dinamiği | 🔍 | Katmanlı | 3–8 kişi | ✓ |
| `grup_son_hamle` | grup | Son Hamle | 🎯 | Kışkırtıcı | 3–8 kişi | ✓ |
| `grup_kararsizlik_plus` | grup | Kararsızlık Plus | 🧩 | İddialı | 3–8 kişi | ✓ |
| `burclar_ask_burc` | burclar | Aşk & Burç | 💘 | Meraklı | 2–6 kişi | ✗ |
| `burclar_burc_savasi` | burclar | Burç Savaşı | ⚔️ | Eğlenceli | 2–6 kişi | ✗ |
| `burclar_red_flag_burclar` | burclar | Red Flag Burçlar | 🚩 | Cesur | 2–6 kişi | ✗ |
| `burclar_gizli_uyum` | burclar | Gizli Uyum | ✨ | Sezgisel | 2–4 kişi | ✓ |
| `burclar_astro_itiraflar` | burclar | Astro İtiraflar | 🌑 | Mahrem | 2–4 kişi | ✓ |
| `burclar_kader_cizgisi` | burclar | Kader Çizgisi | 🔮 | İddialı | 2–4 kişi | ✓ |
| `yemek_damak_zevki` | yemek | Damak Zevki | 🍴 | Rahat | 2–6 kişi | ✗ |
| `yemek_asla_yemem` | yemek | Asla Yemem | 🤢 | Eğlenceli | 2–6 kişi | ✗ |
| `yemek_sofra_muhabbeti` | yemek | Sofra Muhabbeti | 🫕 | Sıcak | 2–6 kişi | ✗ |
| `yemek_damak_siniri` | yemek | Damak Sınırı | 🍽️ | Keskin | 2–4 kişi | ✓ |
| `yemek_sofra_sirlari` | yemek | Sofra Sırları | 🌙 | Özel | 2–4 kişi | ✓ |
| `yemek_yasak_eslesmeler` | yemek | Yasak Eşleşmeler | 🔥 | Kışkırtıcı | 2–6 kişi | ✓ |
| `seyahat_tatil_kafasi` | seyahat | Tatil Kafası | 🧳 | Rahat | 2–6 kişi | ✗ |
| `seyahat_sehir_mi_doga_mi` | seyahat | Şehir mi Doğa mı | 🏕️ | Eğlenceli | 2–6 kişi | ✗ |
| `seyahat_birlikte_tatile_gider_miyiz` | seyahat | Birlikte Tatile Gider miyiz | 🤝 | Samimi | 2–4 kişi | ✗ |
| `seyahat_bavulda_kalanlar` | seyahat | Bavulda Kalanlar | 🌊 | Mahrem | 2–4 kişi | ✓ |
| `seyahat_kacis_plani` | seyahat | Kaçış Planı | 🚀 | Yoğun | 2–4 kişi | ✓ |
| `seyahat_uzak_ihtimaller` | seyahat | Uzak İhtimaller | 🌍 | Katmanlı | 2–4 kişi | ✓ |
| `evcil_kedi_mi_kopek_mi` | evcil | Kedi mi Köpek mi | 🐱 | Eğlenceli | 2–6 kişi | ✗ |
| `evcil_pet_parent` | evcil | Pet Parent | 🐾 | Sıcak | 2–4 kişi | ✗ |
| `evcil_evcil_dostlar` | evcil | Evcil Dostlar | 💕 | Samimi | 2–4 kişi | ✗ |
| `evcil_patili_sirlar` | evcil | Patili Sırlar | 🔮 | Sezgisel | 2–4 kişi | ✓ |
| `evcil_dostluk_esigi` | evcil | Dostluk Eşiği | 🌟 | Özel | 2–4 kişi | ✓ |
| `evcil_evin_gercek_sahibi` | evcil | Evin Gerçek Sahibi | 👑 | İddialı | 2–4 kişi | ✓ |
| `is_ofis_muhabbeti` | is | Ofis Muhabbeti | 😄 | Rahat | 2–6 kişi | ✗ |
| `is_kurumsal_kaos` | is | Kurumsal Kaos | 🤦 | Kaotik | 2–6 kişi | ✗ |
| `is_is_arkadasi_testi` | is | İş Arkadaşı Testi | 🤝 | Profesyonel | 2–6 kişi | ✗ |
| `is_ofis_alt_metni` | is | Ofis Alt Metni | 🔍 | Keskin | 2–4 kişi | ✓ |
| `is_guc_dengesi` | is | Güç Dengesi | ♟️ | Kışkırtıcı | 2–4 kişi | ✓ |
| `is_kariyer_kirilmasi` | is | Kariyer Kırılması | 🗺️ | Profesyonel | 2–4 kişi | ✓ |
| `nostalji_cocukluk` | nostalji | Çocukluk | 🌟 | Sıcak | 2–6 kişi | ✗ |
| `nostalji_eski_internet` | nostalji | Eski İnternet | 💾 | Eğlenceli | 2–6 kişi | ✗ |
| `nostalji_okul_gunleri` | nostalji | Okul Günleri | 📚 | Samimi | 2–6 kişi | ✗ |
| `nostalji_kapanmamis_defterler` | nostalji | Kapanmamış Defterler | 📖 | Mahrem | 2–4 kişi | ✓ |
| `nostalji_eski_sen` | nostalji | Eski Sen | 🪞 | Sezgisel | 2–4 kişi | ✓ |
| `nostalji_nostalji` | nostalji | Nostalji | 🌙 | Özel | 2–4 kişi | ✓ |
| `psikoloji_kendini_tani_30` | psikoloji | Kendini Tanı | 🌱 | Düşündüren | 2–4 kişi | ✗ |
| `psikoloji_overthinker_31` | psikoloji | Overthinker | 🧠 | Samimi | 2–4 kişi | ✗ |
| `psikoloji_icine_atanlar` | psikoloji | İçine Atanlar | 🫙 | Samimi | 2–4 kişi | ✗ |
| `psikoloji_kendini_tani_19` | psikoloji | Kendini Tanı | 🔍 | Katmanlı | 2–4 kişi | ✓ |
| `psikoloji_overthinker_20` | psikoloji | Overthinker | 🌀 | Keskin | 2–4 kişi | ✓ |
| `viral_herkes_cevaplasin_33` | viral | Herkes Cevaplasın | 🎯 | Eğlenceli | 2–6 kişi | ✗ |
| `viral_gundemlik_34` | viral | Gündemlik | 📱 | Meraklı | 2–6 kişi | ✗ |
| `viral_cok_tartisilir` | viral | Çok Tartışılır | 🔥 | Tartışmalı | 2–6 kişi | ✗ |
| `viral_herkes_cevaplasin_21` | viral | Herkes Cevaplasın | 🪞 | Özel | 2–4 kişi | ✓ |
| `viral_gundemlik_22` | viral | Gündemlik | 💭 | İddialı | 2–4 kişi | ✓ |
| `viral_nostalji` | viral | Nostalji | 📼 | Kışkırtıcı | 2–4 kişi | ✓ |
| `viral_gundemlik_30` | viral | Gündemlik | 🕵️ | Keskin | 2–4 kişi | ✓ |
| `siyaset_gundem_masasi_36` | siyaset | Gündem Masası | 🗳️ | Tartışmalı | 2–6 kişi | ✗ |
| `siyaset_karsit_gorusler_37` | siyaset | Karşıt Görüşler | 🤝 | Cesur | 2–6 kişi | ✗ |
| `siyaset_politika_ve_hayat_38` | siyaset | Politika ve Hayat | 🏛️ | Düşündüren | 2–6 kişi | ✗ |
| `siyaset_gundem_masasi_24` | siyaset | Gündem Masası | ⚖️ | Tartışmalı | 2–4 kişi | ✓ |
| `siyaset_karsit_gorusler_25` | siyaset | Karşıt Görüşler | 💬 | İddialı | 2–4 kişi | ✓ |
| `siyaset_politika_ve_hayat_26` | siyaset | Politika ve Hayat | 🌊 | Keskin | 2–4 kişi | ✓ |
| `kaos_kararsizlik_plus_39` | kaos | Kararsızlık Plus | ⚡ | Eğlenceli | 2–8 kişi | ✗ |
| `kaos_fikir_ayriligi_40` | kaos | Fikir Ayrılığı | 🔥 | Kaotik | 2–8 kişi | ✗ |
| `kaos_olay_cikarir_41` | kaos | Olay Çıkarır | 💥 | Cesur | 2–8 kişi | ✗ |
| `kaos_kararsizlik_plus_27` | kaos | Kararsızlık Plus | 🎲 | Kışkırtıcı | 2–4 kişi | ✓ |
| `kaos_fikir_ayriligi_28` | kaos | Fikir Ayrılığı | 🦁 | İddialı | 2–4 kişi | ✓ |
| `kaos_olay_cikarir_29` | kaos | Olay Çıkarır | 💣 | Yoğun | 2–4 kişi | ✓ |

**Toplam:** 86 mod, 1032 soru
**Free / Pro:** 41 ücretsiz mod, 45 premium mod

### `mod.people` Notu

ModScreen'de `.replace(/\s*kişi$/i, '')` ile "kişi" suffix'i strip edilir — sadece sayı/etiket gösterilir.

---

## Geçiş Notları

- `mods` export'u aktif (eski `decks` rename tamamlandı)
- Her mod şu an `categoryId` kullanıyor; `modeId` ve `levelId` ayrı alanlar olarak eklenecek
- Sorular şu an `cards[modId]` map'inde — hedef model `packageId` referanslı düz array
- İçerik ölçeklendikçe `src/data/index.js` → ayrı JSON dosyalar (`content/`) taşınması düşünülüyor
