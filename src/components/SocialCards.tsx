"use client";
import { socials } from '@/content/socials';
import { useI18n } from '@/i18n/useI18n';
import { BrandIcon } from './BrandIcon';
import { SectionShell } from './SectionShell';

export function SocialCards() {
  const { t } = useI18n();
  return (
    <SectionShell id="socials" eyebrow={t('socials.eyebrow')} title={t('socials.title')}>
      <div className="grid grid-cols-3 justify-items-center gap-5 sm:grid-cols-5 lg:grid-cols-9 lg:gap-6">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            title={s.label}
            className="group grid place-items-center rounded-[1.8rem] p-3 text-cream transition hover:-translate-y-1 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blush"
          >
            <BrandIcon name={s.label} className="h-12 w-12 drop-shadow-[0_0_18px_rgba(216,198,255,.26)] transition group-hover:drop-shadow-[0_0_24px_rgba(255,158,216,.55)] sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
          </a>
        ))}
      </div>
    </SectionShell>
  );
}
