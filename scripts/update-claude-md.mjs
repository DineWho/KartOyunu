// Runs after data/index.js changes — regenerates the current data tables in DATA_MODEL.md.
// CLAUDE.md links to DATA_MODEL.md as the source of truth for content structure.
import { readFileSync, writeFileSync } from 'fs';
import { categories, mods, cards } from '../src/data/index.js';

const DATA_MODEL_MD = new URL('../DATA_MODEL.md', import.meta.url).pathname;
const content = readFileSync(DATA_MODEL_MD, 'utf8');

const totalCards = Object.values(cards).reduce((sum, group) => sum + group.length, 0);
const freeCount = mods.filter(mod => !mod.isPremium).length;
const premiumCount = mods.filter(mod => mod.isPremium).length;

const catTable = [
  '### Kategoriler (' + categories.length + ' adet)',
  '| id | name | icon | color |',
  '|----|------|------|-------|',
  ...categories.map(c => `| \`${c.id}\` | ${c.name} | ${c.icon} | \`${c.color}\` |`),
].join('\n');

const modTable = [
  '### Modlar (' + mods.length + ' adet)',
  '| id | kategori | title | emoji | level | people | premium |',
  '|----|----------|-------|-------|-------|--------|---------|',
  ...mods.map(mod =>
    `| \`${mod.id}\` | ${mod.categoryId} | ${mod.title} | ${mod.emoji} | ${mod.level} | ${mod.people} | ${mod.isPremium ? '✓' : '✗'} |`
  ),
].join('\n');

const cardStats = [
  `**Toplam:** ${mods.length} mod, ${totalCards} soru`,
  `**Free / Pro:** ${freeCount} ücretsiz mod, ${premiumCount} premium mod`,
].join('\n');

const newBlock = `${catTable}\n\n${modTable}\n\n${cardStats}\n\n`;

const START_MARKER = '### Kategoriler (';
const END_MARKER = '### `mod.people` Notu';

const startIdx = content.indexOf(START_MARKER);
const endIdx = content.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('Marker bulunamadı — DATA_MODEL.md yapısı değişmiş olabilir.');
  process.exit(1);
}

const updated = content.slice(0, startIdx) + newBlock + content.slice(endIdx);
writeFileSync(DATA_MODEL_MD, updated);
console.log(`✓ DATA_MODEL.md güncellendi: ${categories.length} kategori, ${mods.length} mod, ${totalCards} soru`);
