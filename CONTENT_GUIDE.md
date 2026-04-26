# İçerik Kılavuzu — CardWho

Soru yazımı, paket tasarımı ve Free/Pro dengesine dair kurallar.

## Katman Tanımları

### Kategori
Ana bağlam, hedef kitle veya konu.

> "Bu içerik hangi alanı, ilişkiyi veya konuyu temsil ediyor?"

Örnekler: Çiftler, İlk Buluşma, Arkadaşlar, Aile, Grup, Burçlar, Yemek, Seyahat, Evcil Hayvanlar, İş Hayatı, Nostalji, Psikoloji, Viral, Siyaset, Kaos

Kurallar:
- Bir kategori altında birden fazla paket olabilir
- Bir kategori birden fazla farklı mod içerebilir
- Kategori genel çerçeveyi tanımlar; tonu belirlemez

### Mod
Konuşma yaklaşımı, deneyim biçimi, soru açısı.

> "Bu konuşma nasıl ilerliyor?" / "Sorular hangi açıdan geliyor?" / "Bu paket nasıl bir deneyim hissettiriyor?"

Örnekler: Hafif Sohbet, Buz Kırıcı, Nostalji, Gizli Gerçekler, Kimyayı Test Et, Red Flag Burçlar, Sofra Sırları, Ofis Alt Metni, Herkes Cevaplasın, Çatışma Odası

Kurallar:
- Mod, kategori ile aynı şey değildir
- Mod, seviye ile aynı şey değildir
- Aynı mod farklı kategorilerde kullanılabilir
- Bir kategori altında birden fazla mod olabilir

### Seviye
Duygusal yoğunluk, ton, derinlik.

> "Bu paketin duygusal veya konuşma yoğunluğu nasıl bir his veriyor?"

Örnekler: Hafif, Sıcak, Eğlenceli, Rahat, Derin, Cesur, Flörtöz, Mahrem, Katmanlı, Kışkırtıcı, Düşündüren, Keskin, Filtresiz

Kurallar:
- Seviye konu değil; ton ve yoğunluk bilgisidir
- Kategorinin rolünü tekrar etmemelidir
- Mod'un rolünü birebir tekrar etmemelidir

### Paket
Kategori + Mod + Seviye kombinasyonundan oluşan, 12 soruyu kapsayan oynanabilir içerik birimi.

---

## Soru Yazım Kuralları

1. Her paket tam olarak **12 soru** içerir
2. Her soru **yalnızca bir pakete** aittir — asla başka pakette tekrar edilmez
3. Birebir veya çok benzer sorular farklı paketlerde yer alamaz
4. Aynı (Kategori + Mod + Seviye) kombinasyonu farklı paketlerde tekrar edebilir — örn. Free ve PRO aynı temayı farklı sorularla sunabilir
5. Her soru, ait olduğu Kategori + Mod + Seviye kombinasyonuna doğal biçimde uymalıdır
6. Her yere uyabilecek genel sorular yazılmaz — her paketin kendine özgü bir kimliği olmalıdır
7. Free ve Pro paketler arasında belirgin kalite ve deneyim farkı olmalıdır

---

## Free ve Pro Mantığı

### Free Paketler
- Erişilebilir, kaliteli ve keyifli olmalı
- Boş, sıradan veya özensiz hissettirmemeli
- Kullanıcıda Pro merakı uyandırmalı

Hedef his: **"Ücretsiz paketler böyleyse, Pro kim bilir nasıldır?"**

### Pro Paketler
- Belirgin biçimde daha premium hissettirmeli
- Daha özgün, duygusal olarak daha isabetli olmalı
- Daha şaşırtıcı, akılda kalıcı veya cesur olmalı
- Free soruların hafif değiştirilmiş hali gibi durmamalı

Hedef his: **"Tam da bu yüzden para verdim."**

---

## Yeni Paket Tasarım Sırası

Bir paket için soru üretirken bu sırayı takip et:

1. **Kategori** ne? → bağlamı netleştir
2. **Mod** ne? → yaklaşımı netleştir
3. **Seviye** ne? → tonu netleştir
4. Bu özgün kombinasyona yaraşan, başka pakete uymayacak **12 soruyu** yaz

---

## Yeni Paket Üretim Formatı

Claude'dan paket istenirken veya yeni paket üretilirken bu çıktı formatı kullanılır:

```
Paket ID  : PKG_FREE_XXX / PKG_PRO_XXX
Premium   : true / false
Kategori  : <ad>  (id: <kategori_id>)
Mod       : <ad>  (id: <mod_id>)
Seviye    : <ad>  (id: <seviye_id>)

Sorular:
 1.
 2.
 3.
 4.
 5.
 6.
 7.
 8.
 9.
10.
11.
12.
```

ID formatları ve konvansiyonlar → [DATA_MODEL.md — ID Konvansiyonları](DATA_MODEL.md)

---

## İyi Soru Kriterleri

Soru eklemeden önce bu kriterleri kontrol et:

- Evet/hayır ile kapanmıyor — ya açık uçlu ya da doğal devam sorusu doğuruyor
- Genel değil — bu pakete özgü hissettiriyor, başka pakete de uysaydı bu pakette yeri yok
- Kısa ve net — gereksiz uzun değil, okunduğunda anında anlaşılıyor
- Soyut değil — somut, cevaplanabilir, insanı düşündürüyor
- Paketin Kategori + Mod + Seviye kombinasyonuyla örtüşüyor

---

## Türkçe Yazım Kuralları

Aşama 3 sonunda standardize edilen kurallar. Yeni soru/metin yazarken bunlara uy:

- **Vurgu için tırnak**: Türkçe akıllı çift tırnak `"..."` (`U+201C`/`U+201D`). ASCII düz `"..."` ya da kıvrık tek `'...'` kullanma.
- **Türkçe ek için kesme işareti**: `'` (`U+2019`). Örn: `red flag'i`, `Venüs'ünde`, `2000'lerin`.
- **Soru cümlesi**: `?` ile biter. Tarama soruları (Doğruluk Cesaret pack'lerindeki gibi) emir kipiyle de bitebilir.
- **İki nokta üst üste sonrası**: Büyük harfle başlar. Örn: `"Mutfakla aran nasıl: Hiç girmez misin..."`. Liste de olsa kural geçerli.
- **`upperTR()` kullanımı**: Section label'lar (`KART`, `SÜRE`, `KİŞİ` vb.) için Türkçe `i → İ` dönüşümü. CSS `text-transform: uppercase` kullanma.
- **"sen / siz" hitabı**: Kategori bağlamına göre kullanılır — Çiftler ve İlk Buluşma "sen", Aile/Grup "siz" ağırlıklı, Arkadaşlar karışık (kart bireysel ya da grup yöneliyorsa).
- **Evet/hayır kapanışı**: Soru evet/hayır ile kapanmıyor — ya açık uçlu ya da doğal devam soru üretir. Tartışma pack'lerinde alternatif (`mı / yoksa mı?`) yapısı doğal devam sayılır.

---

## Yasak ve Riskli Soru Tipleri

Aşağıdaki soru tiplerini **kesinlikle yazma:**

- Travma, istismar, kendine zarar verme veya intiharı oyunlaştıran sorular
- Aile kategorisinde cinsel içerik veya aşırı mahrem sorular
- Küfür, hakaret, ırkçılık, cinsiyetçilik, cinsel yönelime saygısızlık
- Gerçek kişileri veya markaları hedef alan sorular
- Siyasi propaganda niteliğinde sorular

Dikkatli yaklaş:

- Cesur/Kışkırtıcı seviyede bile kişiyi küçük düşüren değil, düşündüren sorular yaz
- Aile kategorisinde çocuklar da ortamda olabileceğini unutma
- Grup kategorisinde katılımcılar birbirini tanımıyor olabilir — aşırı kişisel sorulardan kaç

---

## Tekrar Kontrolü

Yeni soru eklemeden önce:

1. Birebir aynı soru var mı kontrol et
2. Çok benzer anlamlı soru var mı kontrol et (farklı kelimeler, aynı fikir)
3. Aynı soru farklı kelimelerle yeniden yazılmaz
4. Şüphe durumunda soruyu daha özgün hale getir ya da sil

Kontrol yöntemi:
- `src/data/index.js` içinde aynı paketteki sorular arasında metin araması yap
- İleride `scripts/check-duplicates.js` ile otomatik kontrol yapılacak (henüz yazılmadı)

---

## Notlar

- Yukarıdaki örnekler yalnızca örnektir; farklı Kategori, Mod ve Seviyeler de olabilir
- Paket adları UI'da kullanıcıya gösterilmez; Airtable'da `PKG_FREE_001` / `PKG_PRO_001` formatında tutulur
