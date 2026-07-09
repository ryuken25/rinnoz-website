"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { discordUrl, instagramUrl } from '@/content/socials';
import { socialArtworks } from '@/content/socialArtworks';
import { useI18n } from '@/i18n/useI18n';
import { StatusPill } from './StatusPill';

export function Hero() {
  const { t, locale } = useI18n();
  const minis = socialArtworks.slice(0, 3);
  const pills = [
    t('hero.pills.chibi'),
    t('hero.pills.anime'),
    t('hero.pills.character'),
    t('hero.pills.emotes'),
    t('hero.pills.vtuber'),
  ];

  const titleClass =
    locale === 'id'
      ? 'text-[clamp(2.35rem,6.2vw,6.2rem)] md:text-[clamp(2.85rem,5.6vw,6.1rem)]'
      : 'text-[clamp(2.55rem,6.8vw,6.8rem)] md:text-[clamp(3.1rem,6.4vw,6.8rem)]';

  return (
    <header
      id="home"
      className="hero-section relative flex min-h-[calc(100svh-var(--nav-height,88px))] items-center px-4 pb-[clamp(2.5rem,6vh,4.5rem)] pt-[calc(var(--nav-height,88px)+clamp(1.25rem,3vh,2.5rem))]"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <StatusPill />
          <p className="eyebrow mt-5">{t('hero.eyebrow')}</p>
          <h1 className={`mt-2 font-display font-bold leading-[0.92] tracking-[-0.055em] ${titleClass}`}>
            {t('hero.titleBefore')} <span className="text-lavender">RinnOZ</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[clamp(.98rem,1.15vw,1.15rem)] leading-7 text-cream/72 md:leading-8">{t('hero.body')}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a className="btn btn-primary px-5 py-3 text-sm md:px-6 md:py-3.5" href="#order">
              {t('hero.ctaOrder')}
            </a>
            <a className="btn btn-ghost px-5 py-3 text-sm md:px-6 md:py-3.5" href="#pricing">
              {t('hero.ctaPricing')}
            </a>
            <a className="btn btn-ghost px-5 py-3 text-sm md:px-6 md:py-3.5" href="#artworks">
              {t('hero.ctaArtworks')}
            </a>
            <a className="btn btn-ghost px-5 py-3 text-sm md:px-6 md:py-3.5" href={instagramUrl} target="_blank" rel="noreferrer">
              {t('hero.ctaIg')}
            </a>
            <a className="btn btn-ghost px-5 py-3 text-sm md:px-6 md:py-3.5" href={discordUrl} target="_blank" rel="noreferrer">
              {t('hero.ctaDiscord')}
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-cream/72">
            {pills.map((x) => (
              <span key={x} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                ✦ {x}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[min(560px,92vw)] lg:max-w-[min(560px,44vw)]"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        >
          <div className="moon-orb absolute -right-6 -top-8 scale-90 opacity-70" />
          {minis[0] && (
            <div className="absolute -left-4 top-10 max-w-[180px] rotate-[-8deg] rounded-3xl border border-white/15 bg-white/8 p-1.5 shadow-glow backdrop-blur-xl md:max-w-[220px] lg:max-w-[240px]">
              <Image
                src={minis[0].imageUrl}
                alt={minis[0].title}
                width={minis[0].width}
                height={minis[0].height}
                className="h-24 w-24 rounded-2xl object-cover md:h-28 md:w-28"
              />
            </div>
          )}
          <div className="card paper-card relative p-3 shadow-glow sm:p-4">
            <Image
              src="/rinnozuki/avatar/rinnozuki-avatar.jpg"
              alt="RinnOZ avatar/profile art"
              width={411}
              height={411}
              priority
              className="max-h-[min(58svh,560px)] w-full rounded-[1.25rem] object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-ink/65 p-3 backdrop-blur-xl sm:bottom-5 sm:left-5 sm:right-5 sm:p-4">
              <p className="eyebrow">{t('hero.cardEyebrow')}</p>
              <p className="font-display text-2xl sm:text-3xl">{t('hero.cardTitle')}</p>
            </div>
          </div>
          {minis[1] && (
            <div className="absolute -bottom-6 right-2 max-w-[180px] rotate-6 rounded-3xl border border-white/15 bg-white/8 p-1.5 shadow-blush backdrop-blur-xl md:max-w-[220px] lg:max-w-[260px]">
              <Image
                src={minis[1].imageUrl}
                alt={minis[1].title}
                width={minis[1].width}
                height={minis[1].height}
                className="h-28 w-28 rounded-2xl object-cover md:h-32 md:w-32"
              />
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}
