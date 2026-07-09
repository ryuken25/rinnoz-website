import type { Metadata } from 'next';
import { Cormorant_Garamond, Nunito_Sans } from 'next/font/google';
import './globals.css';
const display = Cormorant_Garamond({ subsets:['latin'], weight:['600','700'], variable:'--font-display' });
const sans = Nunito_Sans({ subsets:['latin'], weight:['400','600','700','800'], variable:'--font-sans' });
export const metadata: Metadata = { title: 'RinnOZ Art Commission | Anime & Chibi Illustration', description: 'Open anime and chibi art commissions by RinnOZ. View pricing, terms, artworks, and submit an order form.', keywords: ['RinnOZ','Rinnozuki','anime commission','chibi commission','digital illustration','Indonesia artist','character art'], openGraph: { title:'RinnOZ Art Commission', description:'Anime & chibi commissions by RinnOZ', images:['/rinnozuki/avatar/rinnozuki-avatar.jpg'] } };
export default function RootLayout({children}:{children:React.ReactNode}){ return <html lang="en" className={`${display.variable} ${sans.variable}`}><body>{children}</body></html>; }
