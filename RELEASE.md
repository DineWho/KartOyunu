# Sürüm Sonrası Kontroller

Yeni bir sürüm yayınlandıktan sonra Claude bu listeyi otomatik çalıştırır. Tetikleyici: kullanıcının "release yaptık" / "yeni sürüm çıktı" / "yayınladık" gibi ifadeleri. Ayrıca sormaya gerek yok.

---

## Sentry Kontrolü

**Hedef:** Son 7 gündeki yeni veya unresolved hataları yakala, kritik olanları öncelikle düzelt.

- MCP aracı: `mcp__claude_ai_Sentry__search_issues`
- Org: `erik-medya`
- Project: `cardwho`
- Region: `https://de.sentry.io`
- Filtre: `is:unresolved age:-7d`

**Akış:**
1. Yeni veya unresolved issue var mı çek.
2. Kritik (crash, çok kullanıcı etkileyen, frequency yüksek) → öncelikli düzelt, ayrı PR aç.
3. Küçük / non-crash → kullanıcıya raporla, sonraki sprint için not düş.
4. Crash-free rate'e bak (Sentry Insights → sessions/users). Hedef ≥ %99.5.
5. Hata yoksa kullanıcıya kısaca bildir: "Sentry temiz, sorun yok."

---

## (İleride) Build & Deploy Adımları

Bu bölüm henüz boş. EAS build, store submission veya OTA update prosedürü eklendiğinde burada belgelenecek.
