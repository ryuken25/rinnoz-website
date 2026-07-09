import fs from 'node:fs';
const curated = JSON.parse(fs.readFileSync(new URL('../data/social-artworks.curated.json', import.meta.url), 'utf8'));
const art = curated.filter((item) => item.isArt && item.artScore >= 25);
console.log(JSON.stringify({ total: curated.length, art: art.length, rejected: curated.length - art.length }, null, 2));
