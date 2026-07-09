"use client";
import Image from 'next/image';
import { socialArtworks } from '@/content/socialArtworks';
import { useI18n } from '@/i18n/useI18n';
import { SectionShell } from './SectionShell';

export function OrderWizard() {
  const { t, ta } = useI18n();
  const samples = socialArtworks.slice(0, 3);
  const bullets = ta<string>('orderSection.bullets');

  return (
    <SectionShell id="order" eyebrow={t('orderSection.eyebrow')} title={t('orderSection.title')} intro={t('orderSection.intro')}>
      <div className="card grid gap-6 overflow-hidden p-5 md:grid-cols-[.9fr_1.1fr] md:p-8">
        <div>
          <p className="eyebrow">{t('orderSection.studio')}</p>
          <h3 className="mt-2 font-display text-4xl">{t('orderSection.heading')}</h3>
          <p className="mt-4 leading-7 text-cream/70">
            {t('orderSection.body')} <b>takayuki.rinnozuki@gmail.com</b>.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {samples.map((s) => (
              <Image key={s.id} src={s.imageUrl} alt={s.title} width={s.width} height={s.height} className="aspect-square rounded-2xl object-cover" />
            ))}
          </div>
        </div>
        <div className="rounded-[1.8rem] border border-white/12 bg-white/[.045] p-5">
          <p className="font-black text-lavender">{t('orderSection.whatOpens')}</p>
          <ul className="mt-4 space-y-3 text-cream/72">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <a href="#order" className="btn btn-primary mt-6 w-full">{t('orderSection.openForm')}</a>
        </div>
      </div>
    </SectionShell>
  );
}
