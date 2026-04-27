# İçerik Kılavuzu — CardWho

Soru yazımı, paket tasarımı, Free/Pro dengesi ve çok dilli içerik yazımına dair kurallar.

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

ID formatları ve konvansiyonlar → [DATA_MODEL.md](DATA_MODEL.md)

---

## Çok Dilli Soru Yazımı (i18n A-shape)

i18n Aşama 4 sonrası tüm sorular **6 dilde paralel** tutulur. TR canonical (yazım kaynağı), EN/ES/FR/DE/RU paralel field'larda.

```javascript
{
  tr: 'Birlikte yaşadığınız o hikâyenin "resmi versiyonu" ile gerçeği arasındaki fark ne?',
  en: 'What\'s the gap between the "official version" of that story you went through together and what really happened?',
  es: '¿Cuál es la diferencia entre la "versión oficial" de aquella historia que vivisteis juntos y lo que realmente pasó?',
  fr: 'Quel est l\'écart entre la « version officielle » de cette histoire que vous avez vécue ensemble et la vérité ?',
  de: 'Wo klaffen die „offizielle Version" jener Geschichte, die ihr zusammen erlebt habt, und die Wahrheit auseinander?',
  ru: 'В чём разница между «официальной версией» той истории, что вы пережили вместе, и тем, как было на самом деле?',
}
```

**Yazım sırası:**
1. TR'yi yaz — yukarıdaki tüm soru kriterlerine uy.
2. `npm run validate:content` çalıştır — eksik dilleri raporlar.
3. Claude oturumda eksikleri çevir (Max plan altında, ek ücret yok). Aşağıdaki çeviri politikasına uyulur.
4. Tekrar `validate:content` → ✓.
5. Commit.

### Çeviri Politikası

- **Register (üslup):** Her dilde içerik kaydı kategoriye uygun olmalı — Çiftler/İlk Buluşma `sen` (samimi), Aile/Grup `siz`, İş Hayatı resmi.
- **Kültürel referanslar:** Türkçe deyim, atasözü veya popüler kültür referansı varsa hedef dilin **doğal karşılığı** kullanılır — birebir çeviri değil. Örnek: "ipte cambaz" → EN: "walking on a tightrope".
- **Tipografi:** Her dilin kendi tırnak/noktalama kuralı: TR `"..."` ve `'`, FR `« ... »` (etrafında nbsp), DE `„..."`, RU `«...»`.
- **Argo / küfür:** TR'de "lan", "ya" gibi pekiştiriciler hedef dile çevrilmez — onun yerine ton equivalent'i seçilir.
- **Sabitlenmiş seviye çevirileri:** Aşama 4'te belirlendi (`Mahrem`, `Yoğun`, `İddialı` vb. için 6 dilde sabit karşılıklar). Yeni mod eklerken mevcut seviyelerden birini kullan, yenilerini eklerken çeviri tutarlılığı için listeyi genişlet.
- **Soru uzunluğu:** Hedef dilde okunabilirlik korunmalı — diğer dillerde aynı soru çok uzar/kısalırsa yeniden yapılandır. (Validation max 200 karakter uyarır.)

### Yeni Paket Üretim Formatı (multilingual)

```
Paket ID  : PKG_FREE_XXX / PKG_PRO_XXX
Premium   : true / false
Kategori  : <ad>  (id: <kategori_id>)
Mod       : <ad>  (id: <mod_id>)
Seviye    : <ad>  (id: <seviye_id>)

Sorular (her biri 6 dilde):
 1. tr: ...
    en: ...
    es: ...
    fr: ...
    de: ...
    ru: ...
 ...
12. ...
```

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
- **`upperTR()` kullanımı**: Section label'lar (`KART`, `SÜRE`, `KİŞİ` vb.) için Türkçe `i → İ` dönüşümü. `src/i18n/upper.js`'de tanımlı (`upperTR`, `useUpperT`). CSS `text-transform: uppercase` kullanma.
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
- `npm run validate:content` çalıştır — script tekrar, eksik alan, geçersiz categoryId, çapraz tekrar ve **6 dil completeness'i** kontrol eder.
- Detay: [scripts/validate-content.mjs](scripts/validate-content.mjs)

---

## Notlar

- Yukarıdaki örnekler yalnızca örnektir; farklı Kategori, Mod ve Seviyeler de olabilir
- Paket adları UI'da kullanıcıya gösterilmez; Airtable'da `PKG_FREE_001` / `PKG_PRO_001` formatında tutulur
