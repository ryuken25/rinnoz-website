export type SocialSource = 'instagram' | 'x' | 'carrd-fallback';
export type ArtworkFilter = 'All' | 'Anime' | 'Chibi' | 'Mascot / Vtuber' | 'Emotes / Stickers' | 'Scene / Illustration' | 'Recent' | 'Instagram' | 'X';
export type SocialArtwork = {
  id: string;
  source: SocialSource;
  postUrl: string;
  createdAt?: string;
  caption?: string;
  imageUrl: string;
  originalUrl?: string;
  width: number;
  height: number;
  aspectRatio: number;
  tags: string[];
  title: string;
  description?: string;
  isCarousel?: boolean;
  carouselGroupId?: string;
  carouselIndex?: number;
  artScore?: number;
  isArt: boolean;
  featured?: boolean;
};
export const artworkFilters: ArtworkFilter[] = ['All','Anime','Chibi','Mascot / Vtuber','Emotes / Stickers','Scene / Illustration','Recent','Instagram','X'];
export const carrdFallbackArtworks: SocialArtwork[] = [
  { id:'carrd-fallback-01', source:'carrd-fallback', postUrl:'https://rinnoz.carrd.co/#artworks', imageUrl:'/rinnozuki/portfolio/artwork-01.jpg', originalUrl:'/rinnozuki/originals/artwork-01.jpg', title:'Carrd Commission Sheet Backup 01', caption:'Fallback selected commission sheet from Carrd.', description:'Fallback selected commission sheet from Carrd.', tags:['Anime','Scene / Illustration'], width:2159, height:1841, aspectRatio:1.173, isArt:true },
  { id:'carrd-fallback-02', source:'carrd-fallback', postUrl:'https://rinnoz.carrd.co/#artworks', imageUrl:'/rinnozuki/portfolio/artwork-02.jpg', originalUrl:'/rinnozuki/originals/artwork-02.jpg', title:'Carrd Chibi & Anime Backup', caption:'Fallback chibi/anime sheet from Carrd.', description:'Fallback chibi/anime sheet from Carrd.', tags:['Anime','Chibi'], width:2160, height:2160, aspectRatio:1, isArt:true },
  { id:'carrd-fallback-03', source:'carrd-fallback', postUrl:'https://rinnoz.carrd.co/#artworks', imageUrl:'/rinnozuki/portfolio/artwork-05.jpg', originalUrl:'/rinnozuki/originals/artwork-05.jpg', title:'Carrd Sticker Backup', caption:'Fallback sticker/emote sample from Carrd.', description:'Fallback sticker/emote sample from Carrd.', tags:['Emotes / Stickers','Chibi'], width:815, height:815, aspectRatio:1, isArt:true },
];
export function sourceLabel(source: SocialSource) { if (source === 'x') return 'X Art'; if (source === 'instagram') return 'Instagram Art'; return 'Carrd fallback'; }
