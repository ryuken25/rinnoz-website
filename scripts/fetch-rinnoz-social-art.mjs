import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = 'public/rinnozuki/social/x';
const RAW_PATH = 'data/social-artworks.raw.json';
const CURATED_PATH = 'data/social-artworks.curated.json';
const TWEET_IDS = [
  '2064794850671968291',
  '2055285412109918290',
  '2024098733991039299',
  '2017652733084635532',
  '2003998581175603589',
  '1984891587219112059',
  '1962047085425139989',
  '1949451538193416264',
];
const rejectKeywords = ['game','gaming','stream','clip','play','rank','match','live','meme','giveaway','discord invite','freebies'];
const artKeywords = ['commission','art','illustration','chibi','anime','fanart','drawing','draw','oc','vtuber','mascot','emote','sticker','render','character','wip','cover'];
const titleById = {
  '2064794850671968291': 'Dry Flower Cover Illustration',
  '2024098733991039299': 'Night Song Scenic Illustration',
  '2017652733084635532': 'IRIS OUT Cover Art',
  '2003998581175603589': 'Winter Present Illustration Assets',
  '1984891587219112059': 'Halloween Shadow Cover Illustration',
  '1962047085425139989': 'Moonlit Forest Cover Illustration',
  '1949451538193416264': 'Soft Catgirl Original Artwork',
};
function scorePost(text) { const lower = text.toLowerCase(); const positive = artKeywords.filter(k => lower.includes(k)).length; const negative = rejectKeywords.filter(k => lower.includes(k)).length; return Math.max(0, positive * 18 - negative * 35 + (lower.includes('#artcommission') ? 25 : 0)); }
function tagsFor(text, id) { const l=text.toLowerCase(); const tags = new Set(['Anime']); if(l.includes('chibi')) tags.add('Chibi'); if(l.includes('vtuber')||l.includes('mascot')) tags.add('Mascot / Vtuber'); if(l.includes('sticker')||l.includes('emote')) tags.add('Emotes / Stickers'); if(l.includes('background')||l.includes('cover')||l.includes('illustration')) tags.add('Scene / Illustration'); if(id==='1949451538193416264') tags.add('Chibi'); return [...tags]; }
await fs.mkdir(OUT_DIR,{recursive:true}); await fs.mkdir('data',{recursive:true});
const raw=[]; const curated=[];
for (const id of TWEET_IDS) {
  const res = await fetch(`https://api.fxtwitter.com/Rinnozuki24/status/${id}`);
  const json = await res.json(); const tweet = json.tweet || {}; raw.push(tweet);
  const text = tweet.text || ''; const photos = tweet.media?.photos || []; const artScore = scorePost(text) + (id === '1949451538193416264' ? 35 : 0); const isArt = artScore >= 25;
  for (let i=0;i<photos.length;i++) {
    const p=photos[i]; const ext = (p.url.match(/\.([a-zA-Z0-9]+)\?/)?.[1] || 'jpg').toLowerCase(); const file = `x-${id}-${i+1}.${ext}`; const imgRes = await fetch(p.url); const buf = Buffer.from(await imgRes.arrayBuffer()); await fs.writeFile(path.join(OUT_DIR,file),buf);
    const item = { id:`x-${id}-${i+1}`, source:'x', postUrl:tweet.url || `https://x.com/Rinnozuki24/status/${id}`, createdAt:tweet.created_at, caption:text, imageUrl:`/rinnozuki/social/x/${file}`, originalUrl:`/rinnozuki/social/x/${file}`, width:p.width, height:p.height, aspectRatio: Number((p.width/p.height).toFixed(3)), tags:tagsFor(text,id), title:titleById[id] || 'Rinnozuki Social Artwork', description:text.split('\n').filter(Boolean).slice(0,2).join(' '), isCarousel:photos.length>1, carouselGroupId:photos.length>1 ? `x-${id}` : undefined, carouselIndex:i, artScore, isArt, featured:['2064794850671968291','1962047085425139989','1949451538193416264','2024098733991039299','2017652733084635532'].includes(id) };
    if(isArt) curated.push(item);
  }
}
await fs.writeFile(RAW_PATH, JSON.stringify(raw,null,2));
await fs.writeFile(CURATED_PATH, JSON.stringify(curated,null,2));
console.log(`raw tweets=${raw.length} curated art=${curated.length}`);
