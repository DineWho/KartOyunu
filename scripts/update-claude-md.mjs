// Runs after data/index.js changes — regenerates the category/deck tables in CLAUDE.md
import { readFileSync, writeFileSync } from 'fs';
import { categories, decks } from '../src/data/index.js';

const CLAUDE_MD = new URL('../CLAUDE.md', import.meta.url).pathname;
const content = readFileSync(CLAUDE_MD, 'utf8');

const catTable = [
  '### Kategoriler (' + categories.length + ' adet)',
  '| id | name | icon | color |',
  '|----|------|------|-------|',
  ...categories.map(c => `| \`${c.id}\` | ${c.name} | ${c.icon} | \`${c.color}\` |`),
].join('\n');

const deckTable = [
  '### Desteler (' + decks.length + ' adet)',
  '| id | kategori | title | emoji | level | people | premium |',
  '|----|----------|-------|-------|-------|--------|---------|',
  ...decks.map(d =>
    `| \`${d.id}\` | ${d.categoryId} | ${d.title} | ${d.emoji} | ${d.level} | ${d.people} | ${d.isPremium ? '✓' : '✗'} |`
  ),
].join('\n');

const cardStats = [
  `**Kart sayısı:** 12 per deste, toplam ${decks.length * 12} soru`,
  '**Her kategoride:** 2 ücretsiz + 2-3 premium deste',
  '`deck.people` → DeckScreen\'de `.replace(/\\s*kişi$/i, \'\')` ile "kişi" strip edilir',
].join('\n');

const newBlock = `${catTable}\n\n${deckTable}\n\n${cardStats}`;

const START_MARKER = '### Kategoriler (';
const END_MARKER = '\n\n## Türkçe Büyük Harf';

const startIdx = content.indexOf(START_MARKER);
const endIdx = content.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('Marker bulunamadı — CLAUDE.md yapısı değişmiş olabilir.');
  process.exit(1);
}

const updated = content.slice(0, startIdx) + newBlock + content.slice(endIdx);
writeFileSync(CLAUDE_MD, updated);
console.log(`✓ CLAUDE.md güncellendi: ${categories.length} kategori, ${decks.length} deste, ${decks.length * 12} soru`);
