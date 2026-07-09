export type ArtworkTag = 'Chibi' | 'Anime' | 'Emotes/Stickers' | 'Character Sheet' | 'Background / Scene' | 'Gift / Birthday' | 'Vtuber / Mascot';
export type Artwork = { id:string; src:string; originalSrc:string; title:string; alt:string; tags:ArtworkTag[]; width:number; height:number; aspect:number; featured?:boolean };
export const artworkFilters = ['All','Chibi','Anime','Emotes/Stickers','Character Sheet','Background / Scene','Gift / Birthday','Vtuber / Mascot'] as const;
export const artworks: Artwork[] = [
  { id:'rinn-commission-collage-01', src:'/rinnozuki/portfolio/artwork-01.jpg', originalSrc:'/rinnozuki/originals/artwork-01.jpg', title:'Anime Character Commission Collage', alt:'Anime artwork collage by RinnOZ', tags:['Anime','Character Sheet'], width:2159, height:1841, aspect:1.173, featured:true },
  { id:'rinn-commission-collage-02', src:'/rinnozuki/portfolio/artwork-02.jpg', originalSrc:'/rinnozuki/originals/artwork-02.jpg', title:'Chibi & Anime Samples', alt:'Anime and chibi commission collage by RinnOZ', tags:['Chibi','Anime'], width:2160, height:2160, aspect:1, featured:true },
  { id:'rinn-commission-collage-03', src:'/rinnozuki/portfolio/artwork-03.jpg', originalSrc:'/rinnozuki/originals/artwork-03.jpg', title:'Mascot Character Showcase', alt:'Character commission artwork collage by RinnOZ', tags:['Anime','Vtuber / Mascot'], width:2160, height:2160, aspect:1 },
  { id:'rinn-commission-collage-04', src:'/rinnozuki/portfolio/artwork-04.jpg', originalSrc:'/rinnozuki/originals/artwork-04.jpg', title:'Illustration & Scene Samples', alt:'Illustration and scene artwork collage by RinnOZ', tags:['Background / Scene','Gift / Birthday'], width:2160, height:2160, aspect:1 },
  { id:'rinn-sticker-samples-05', src:'/rinnozuki/portfolio/artwork-05.jpg', originalSrc:'/rinnozuki/originals/artwork-05.jpg', title:'Sticker & Emote Samples', alt:'Sticker and character sample artwork by RinnOZ', tags:['Emotes/Stickers','Chibi'], width:815, height:815, aspect:1 },
];
