import type { Metadata } from 'next';
import { Cormorant_Garamond, Nunito_Sans } from 'next/font/google';
import { I18nProvider } from '@/i18n/I18nProvider';
import './globals.css';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const sans = Nunito_Sans({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://rinnoz.vercel.app'),
  title: 'RinnOZ Art Commission | Anime & Chibi Illustration',
  description: 'Commission website for RinnOZ / Rinnozuki, Indonesian digital illustrator for anime, chibi, emotes, character art, and soft moody illustrations.',
  keywords: ['RinnOZ', 'Rinnozuki', 'anime commission', 'chibi commission', 'digital illustration', 'Indonesia artist', 'character art'],
  openGraph: {
    title: 'RinnOZ Art Commission',
    description: 'Anime & chibi commissions by RinnOZ / Rinnozuki',
    url: 'https://rinnoz.vercel.app',
    images: ['/rinnozuki/avatar/rinnozuki-avatar.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable}`}>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
