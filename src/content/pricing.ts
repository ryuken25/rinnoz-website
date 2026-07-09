export type StyleKey = 'Chibi' | 'Anime';
export const pricing = {
  Chibi: [
    { type: 'Headshot', usd: 5, idr: 25000, usdLabel: '$5', idrLabel: 'IDR 25k', use: 'Profile icon / sticker' },
    { type: 'Half Body', usd: 8, idr: 45000, usdLabel: '$8', idrLabel: 'IDR 45k', use: 'Stream panel / cute gift' },
    { type: 'Full Body', usd: 12, idr: 60000, usdLabel: '$12', idrLabel: 'IDR 60k', use: 'Full mascot pose' },
  ],
  Anime: [
    { type: 'Bust Up', usd: 15, idr: 75000, usdLabel: '$15', idrLabel: 'IDR 75k', use: 'Profile / character portrait' },
    { type: 'Half Body', usd: 25, idr: 110000, usdLabel: '$25', idrLabel: 'IDR 110k', use: 'Character showcase' },
    { type: 'Full Body', usd: 40, idr: 160000, usdLabel: '$40', idrLabel: 'IDR 160k', use: 'Complete illustration concept' },
  ],
} as const;
export const priceNotes = ['Base price per character.', 'Complex background starts from $10 / IDR 50k.', 'Price may increase for complex designs, weapons, pets, accessories, detailed items, or additional characters.'];
