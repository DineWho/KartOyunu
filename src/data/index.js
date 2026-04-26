// Re-exports for backward compatibility. Real data lives in:
//   src/data/categories.js
//   src/data/mods.js
//   src/data/cards/<category>.js (combined via cards/index.js)
//   src/data/localize.js (helper)
export { categories } from './categories.js';
export { mods } from './mods.js';
export { cards } from './cards/index.js';
export { localize, useLocalize } from './localize.js';
