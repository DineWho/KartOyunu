// Updates AUTO blocks in markdown docs from canonical source (src/data/*).
// Each AUTO block is delimited by:
//   <!-- AUTO:<name> START -->
//   ...generated content...
//   <!-- AUTO:<name> END -->
// The content between the markers is replaced wholesale; everything else is preserved.
//
// Usage:
//   npm run sync:docs          → write changes in place
//   npm run sync:docs:check    → exit 1 if any block is out of date (CI)

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { categories, mods, cards } from '../src/data/index.js';
import { localize } from '../src/data/localize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const checkOnly = process.argv.includes('--check');

// ─── Generators ──────────────────────────────────────────────────────────────

function trOf(field) {
  // For docs, prefer TR canonical; localize() falls back if missing.
  return localize(field, 'tr');
}

function genContentStats() {
  const totalCards = Object.values(cards).reduce((s, a) => s + a.length, 0);
  const free = mods.filter(m => !m.isPremium).length;
  const premium = mods.filter(m => m.isPremium).length;
  return [
    `**Kategoriler:** ${categories.length}`,
    `**Modlar:** ${mods.length} (${free} ücretsiz / ${premium} premium)`,
    `**Kartlar:** ${totalCards} (her mod tam 12 soru)`,
  ].join('\n');
}

function genCategoryList() {
  const lines = [
    '| id | name (TR) | icon | color |',
    '|----|-----------|------|-------|',
  ];
  for (const c of categories) {
    lines.push(`| \`${c.id}\` | ${trOf(c.name)} | ${c.icon} | \`${c.color}\` |`);
  }
  return lines.join('\n');
}

function genScreenTable() {
  // Static table — kept here so doc and reality stay in sync via this script
  // even if the format changes. Source of truth: App.js navigation tree.
  return [
    '| Ekran | Konum | TabBar | Notlar |',
    '|-------|-------|--------|--------|',
    '| SplashScreen | NavigationContainer dışı | ✗ | i18n init + push check tamamlanana kadar |',
    '| NotificationOnboardingScreen | NavigationContainer dışı | ✗ | Bildirim izni akışı (conditional) |',
    '| HomeScreen | BottomTab | ✓ | Ana ekran: kategori filtreleri + mod listesi |',
    '| FavoritesScreen | BottomTab | ✓ | Kaydedilen favoriler |',
    '| SettingsScreen | BottomTab | ✓ | Ayarlar, tema/dil/ses, istatistikler |',
    '| ProfileScreen | BottomTab | ✓ | Hesap özeti, rozetler |',
    '| CategoryScreen | RootStack | ✗ | Kategori detay: o kategorinin modları |',
    '| ModScreen | RootStack | ✗ | Mod detay: açıklama, başlat |',
    '| CardScreen | RootStack | ✗ | Kart swipe — gesture devre dışı |',
    '| LoginScreen | RootStack (modal) | ✗ | Apple/Google ile giriş |',
    '| AccountInfoScreen | RootStack | ✗ | Hesap bilgileri, oturum yönetimi |',
    '| NotificationsScreen | RootStack | ✗ | Push/inbox mesaj listesi |',
  ].join('\n');
}

function genStorageKeys() {
  return [
    '| Anahtar | Sahibi | İçerik |',
    '|---------|--------|--------|',
    '| `@cardwho_theme` | ThemeContext | `\'system\' \\| \'dark\' \\| \'light\'` |',
    '| `@cardwho_locale` | i18n/index.js | Aktif dil kodu (`tr`, `en`, ...) |',
    '| `@cardwho_favorites` | FavoritesContext | Favori kart listesi (JSON) |',
    '| `@cardwho_stats` | StatsContext | Oyun istatistikleri (JSON array) |',
    '| `@cardwho_badges` | BadgesContext | Kazanılan rozet ID\'leri |',
    '| `@cardwho_sound_enabled` | AudioContext | Ses açık/kapalı boolean |',
    '| `@cardwho_notifications` | NotificationContext | In-app inbox mesajları |',
    '| `@cardwho_notifications_enabled` | NotificationContext | Push izin durumu |',
    '| `@cardwho_notif_onboarded` | NotificationContext | Onboarding tamamlandı mı |',
    '| `@cardwho_fcm_token` | NotificationContext | FCM token cache |',
    '| `@cardwho_review` | utils/reviewManager | Store review tetikleyici state |',
    '| `@cardwho_user_profile_<uid>` | UserProfileContext | Kullanıcı bazında profil cache |',
  ].join('\n');
}

// Map of block name → (content generator, target file relative to repo root)
const BLOCKS = [
  { name: 'content-stats',  file: 'DATA_MODEL.md',     gen: genContentStats },
  { name: 'category-list',  file: 'DATA_MODEL.md',     gen: genCategoryList },
  { name: 'screen-table',   file: 'ARCHITECTURE.md',   gen: genScreenTable },
  { name: 'storage-keys',   file: 'ARCHITECTURE.md',   gen: genStorageKeys },
];

// ─── Block replacement ───────────────────────────────────────────────────────

function replaceBlock(content, name, body) {
  const startMarker = `<!-- AUTO:${name} START -->`;
  const endMarker = `<!-- AUTO:${name} END -->`;

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    return { ok: false, reason: `marker bulunamadı (${name})` };
  }
  if (startIdx > endIdx) {
    return { ok: false, reason: `START marker END'den sonra (${name})` };
  }

  const before = content.slice(0, startIdx + startMarker.length);
  const after = content.slice(endIdx);
  const updated = `${before}\n${body}\n${after}`;

  return { ok: true, content: updated, changed: updated !== content };
}

// ─── Main ────────────────────────────────────────────────────────────────────

let totalChanges = 0;
let totalErrors = 0;

// Group blocks by file so we read/write each file only once.
const fileGroups = {};
for (const block of BLOCKS) {
  if (!fileGroups[block.file]) fileGroups[block.file] = [];
  fileGroups[block.file].push(block);
}

for (const [relativePath, blocks] of Object.entries(fileGroups)) {
  const fullPath = join(REPO_ROOT, relativePath);
  let content;
  try {
    content = readFileSync(fullPath, 'utf8');
  } catch (e) {
    console.error(`✗ ${relativePath}: okunamadı (${e.message})`);
    totalErrors++;
    continue;
  }

  let updated = content;
  for (const block of blocks) {
    const body = block.gen();
    const result = replaceBlock(updated, block.name, body);
    if (!result.ok) {
      console.error(`✗ ${relativePath} [${block.name}]: ${result.reason}`);
      totalErrors++;
      continue;
    }
    if (result.changed) {
      console.log(`  ${checkOnly ? '⚠' : '✓'} ${relativePath} [${block.name}] güncellendi`);
      totalChanges++;
    }
    updated = result.content;
  }

  if (!checkOnly && updated !== content) {
    writeFileSync(fullPath, updated);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

if (totalErrors > 0) {
  console.error(`\n❌ ${totalErrors} hata`);
  process.exit(1);
}

if (checkOnly) {
  if (totalChanges > 0) {
    console.error(`\n❌ ${totalChanges} blok güncel değil. \`npm run sync:docs\` çalıştır.`);
    process.exit(1);
  }
  console.log('\n✅ Tüm AUTO bloklar güncel.');
} else {
  if (totalChanges === 0) {
    console.log('\n✅ Tüm AUTO bloklar zaten güncel.');
  } else {
    console.log(`\n✅ ${totalChanges} blok güncellendi.`);
  }
}
