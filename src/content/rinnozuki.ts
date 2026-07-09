export const socials = [
  ['Commission Carrd','https://rinnoz.carrd.co/'], ['VGen','https://vgen.co/Rinnozuki24'], ['Fiverr','https://www.fiverr.com/rinnoz?public_mode=true'], ['Discord','https://discord.com/invite/TZMYNr9bDh'], ['X / Twitter','https://x.com/Rinnozuki24'], ['Instagram','https://www.instagram.com/rinnozuki24/?hl=id'], ['YouTube','https://www.youtube.com/'], ['TikTok','https://www.tiktok.com/'], ['Twitch','https://www.twitch.tv/']
] as const;
export const pricing = { chibi: [ ['Headshot','$5','IDR 25k','Profile icon / sticker'], ['Half Body','$8','IDR 45k','Stream panel / cute gift'], ['Full Body','$12','IDR 60k','Full mascot pose'] ], anime: [ ['Bust Up','$15','IDR 75k','Profile / character portrait'], ['Half Body','$25','IDR 110k','Character showcase'], ['Full Body','$40','IDR 160k','Complete illustration concept'] ] } as const;
export const portfolio = [
  {src:'/rinnozuki/portfolio/artwork-01.jpg', alt:'Anime artwork collage from RinnOZ Carrd', tags:['Anime','Character Sheet']},
  {src:'/rinnozuki/portfolio/artwork-02.jpg', alt:'Anime and chibi commission collage from RinnOZ Carrd', tags:['Chibi','Anime']},
  {src:'/rinnozuki/portfolio/artwork-03.jpg', alt:'Character commission artwork collage from RinnOZ Carrd', tags:['Anime','Vtuber / Mascot']},
  {src:'/rinnozuki/portfolio/artwork-04.jpg', alt:'Illustration and scene artwork collage from RinnOZ Carrd', tags:['Background / Scene','Gift / Birthday']},
  {src:'/rinnozuki/portfolio/artwork-05.jpg', alt:'Sticker and character sample artwork from RinnOZ Carrd', tags:['Emotes/Stickers','Chibi']},
];
export const doItems = ['Original characters','Ships / pairings','Slight NSFW if accepted by artist','Kemonomimi','Simple background'];
export const dontItems = ['Mecha, heavy armor, or guns','Harmful content','Gore','Furry','Very detailed background'];
export const policies = [
 ['Artist approval','Rinn may decline an order, including for personal reasons. Commercial characters such as Vtuber, mascot, or project characters should be discussed first via DM.'],
 ['Usage & posting','Commissions are for personal use by default. Commercial use can be discussed via DM before ordering. Clients may post final work with proper credit. Results may be used as samples and posted by the artist unless the client asks not to share them.'],
 ['Payment & refunds','Full payment is made after sketch approval. No refund/cancellation unless the artist cannot continue the order and initiates or approves the refund case. Local payment: Mandiri and Dana. International payment: PayPal.'],
 ['References & revisions','Provide multiple references before ordering. Minor revisions are accepted. Major revisions are limited to 2 rounds; extra major revisions require extra charge.'],
 ['Timeline','Estimated completion time is 5–30 days depending on queue and complexity. Artist will inform the client if the expected timeframe cannot be met. Rush deadlines require an additional fee.']
] as const;
