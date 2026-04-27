import { categories, mods, cards } from '../src/data/index.js';

const MIN_Q_LENGTH = 15;
const MAX_Q_LENGTH = 200;
const REQUIRED_COUNT = 12;
const REQUIRED_LANGS = ['tr', 'en', 'es', 'fr', 'de', 'ru'];

let errors = 0;
let warnings = 0;

// Returns array of missing/empty langs for a multilingual field, or [] if complete.
// Accepts plain strings as legacy (treated as TR-only → all other langs missing).
function missingLangs(field) {
  if (field == null) return REQUIRED_LANGS;
  if (typeof field === 'string') {
    const trEmpty = !field.trim();
    return trEmpty ? REQUIRED_LANGS : REQUIRED_LANGS.filter(l => l !== 'tr');
  }
  if (typeof field !== 'object') return REQUIRED_LANGS;
  return REQUIRED_LANGS.filter(l => {
    const v = field[l];
    return v == null || (typeof v === 'string' && !v.trim());
  });
}

const err  = (scope, msg) => { console.error(`  ✗ [${scope}] ${msg}`); errors++; };
const warn = (scope, msg) => { console.warn (`  ⚠ [${scope}] ${msg}`); warnings++; };

const totalCards = Object.values(cards).reduce((s, a) => s + a.length, 0);
console.log(`\nKartOyunu — İçerik Doğrulama`);
console.log('─'.repeat(48));
console.log(`Kategoriler: ${categories.length}  |  Modlar: ${mods.length}  |  Toplam soru: ${totalCards}\n`);

// ── 1. Mod + soru kontrolleri ────────────────────────────────────────────
console.log('[1] Mod ve soru kontrolleri...');

const categoryIds = new Set(categories.map(c => c.id));
const allQuestions = new Map(); // normalized text → modId[]

const MOD_MULTILINGUAL_FIELDS = ['title', 'description', 'expectation', 'level', 'duration', 'people'];

for (const mod of mods) {
  const modCards = cards[mod.id];

  // Kart dizisi var mı?
  if (!modCards) {
    err(mod.id, `cards["${mod.id}"] bulunamadı`);
    continue;
  }

  // Tam 12 soru var mı?
  if (modCards.length !== REQUIRED_COUNT) {
    err(mod.id, `${modCards.length} soru var, ${REQUIRED_COUNT} olmalı`);
  }

  // cardCount alanı gerçek sayıyla uyuşuyor mu?
  if (mod.cardCount !== modCards.length) {
    warn(mod.id, `cardCount=${mod.cardCount} ama gerçek=${modCards.length}`);
  }

  // isPremium boolean mı?
  if (typeof mod.isPremium !== 'boolean') {
    err(mod.id, `isPremium değeri "${mod.isPremium}" — boolean olmalı`);
  }

  // Geçerli categoryId var mı?
  if (!categoryIds.has(mod.categoryId)) {
    err(mod.id, `geçersiz categoryId: "${mod.categoryId}"`);
  }

  // Mod multilingual field'ları 6 dil tam mı?
  for (const f of MOD_MULTILINGUAL_FIELDS) {
    const missing = missingLangs(mod[f]);
    if (missing.length > 0) {
      err(mod.id, `mod.${f} eksik diller: ${missing.join(', ')}`);
    }
  }

  // Soru bazlı kontroller
  const seenInMod = new Set();

  for (let i = 0; i < modCards.length; i++) {
    const raw = modCards[i];
    // Çok dilli kart obj. {tr, en, ...} ya da legacy string.
    const q = typeof raw === 'string' ? raw : raw?.tr;
    const label = `soru[${i + 1}]`;

    // Boş soru?
    if (!q || !q.trim()) {
      err(mod.id, `${label}: boş veya sadece boşluk (TR)`);
      continue;
    }

    // 6 dil tam mı?
    const missing = missingLangs(raw);
    if (missing.length > 0) {
      err(mod.id, `${label} eksik diller: ${missing.join(', ')}`);
    }

    const trimmed = q.trim();

    // Çok kısa?
    if (trimmed.length < MIN_Q_LENGTH) {
      warn(mod.id, `${label} çok kısa (${trimmed.length} kar): "${trimmed}"`);
    }

    // Çok uzun?
    if (trimmed.length > MAX_Q_LENGTH) {
      warn(mod.id, `${label} çok uzun (${trimmed.length} kar): "${trimmed.slice(0, 60)}..."`);
    }

    const normalized = trimmed.toLowerCase();

    // Mod içinde tekrar?
    if (seenInMod.has(normalized)) {
      err(mod.id, `${label} mod içinde tekrar: "${trimmed}"`);
    }
    seenInMod.add(normalized);

    // Global tekrar kaydı
    if (!allQuestions.has(normalized)) allQuestions.set(normalized, []);
    allQuestions.get(normalized).push(mod.id);
  }
}

const modErrors   = errors;
const modWarnings = warnings;
const modCount    = mods.length;
console.log(`  → ${modCount} mod kontrol edildi: ${modErrors} hata, ${modWarnings} uyarı`);

// ── 1b. Kategori multilingual kontrolü ───────────────────────────────────
console.log('\n[1b] Kategori i18n completeness...');
let catLangErr = 0;
for (const cat of categories) {
  const missing = missingLangs(cat.name);
  if (missing.length > 0) {
    err(cat.id, `cat.name eksik diller: ${missing.join(', ')}`);
    catLangErr++;
  }
}
if (catLangErr === 0) console.log(`  ✓ ${categories.length} kategori 6 dil tam`);

// ── 2. Sahipsiz kart dizileri ────────────────────────────────────────────
console.log('\n[2] Sahipsiz kart dizileri...');
const modIds = new Set(mods.map(m => m.id));
let orphanCount = 0;
for (const key of Object.keys(cards)) {
  if (!modIds.has(key)) {
    err(key, `cards["${key}"] var ama eşleşen mod yok`);
    orphanCount++;
  }
}
if (orphanCount === 0) console.log('  ✓ Sahipsiz kart yok');

// ── 3. Paketler arası tekrar ─────────────────────────────────────────────
console.log('\n[3] Paketler arası tekrar...');
let crossDupCount = 0;
for (const [question, modIdList] of allQuestions) {
  if (modIdList.length > 1) {
    console.error(`  ✗ Tekrar (${modIdList.join(', ')}): "${question}"`);
    errors++;
    crossDupCount++;
  }
}
if (crossDupCount === 0) console.log('  ✓ Çapraz tekrar yok');

// ── Özet ─────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(48));
if (errors === 0 && warnings === 0) {
  console.log(`✅  Tüm kontroller geçti. ${mods.length * REQUIRED_COUNT} soru temiz.\n`);
} else {
  if (errors   > 0) console.error(`❌  ${errors} hata`);
  if (warnings > 0) console.warn (`⚠   ${warnings} uyarı`);
  console.log('');
}

process.exit(errors > 0 ? 1 : 0);
