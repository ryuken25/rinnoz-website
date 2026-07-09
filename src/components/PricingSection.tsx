"use client";
import Image from 'next/image';
import { pricing } from '@/content/pricing';
import { useI18n } from '@/i18n/useI18n';
import { PriceEstimator } from './PriceEstimator';
import { SectionShell } from './SectionShell';

export function PricingSection() {
  const { t, ta } = useI18n();
  const notes = ta<string>('pricing.notes');

  return (
    <SectionShell id="pricing" eyebrow={t('pricing.eyebrow')} title={t('pricing.title')} intro={t('pricing.intro')}>
      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(pricing).map(([style, items]) => (
          <div className="card paper-card p-6" key={style}>
            <p className="eyebrow">{style}</p>
            <h3 className="font-display text-4xl">{style} {t('pricing.styleSuffix')}</h3>
            <div className="mt-5 grid gap-3">
              {items.map((item) => (
                <a href="#order" key={item.type} className="group rounded-3xl border border-white/10 bg-white/[.045] p-4 transition hover:-translate-y-1 hover:border-blush/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <b className="text-lg">{item.type}</b>
                      <p className="text-sm text-cream/58">{t(`pricing.uses.${item.type}:${style}`)}</p>
                    </div>
                    <div className="text-right font-black text-lavender">
                      <p>{item.usdLabel}</p>
                      <p className="text-sm text-cream/70">{item.idrLabel}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="card p-6">
          <p className="eyebrow">{t('pricing.notesEyebrow')}</p>
          {notes.map((n) => (
            <p key={n} className="mt-3 text-cream/72">✦ {n}</p>
          ))}
          <details className="mt-5">
            <summary className="cursor-pointer font-black text-lavender">{t('pricing.originalSheet')}</summary>
            <Image src="/rinnozuki/pricing/rinnozuki-price-list.jpg" alt="Original RinnOZ price sheet" width={1440} height={1080} className="mt-4 rounded-3xl" />
          </details>
        </div>
        <PriceEstimator />
      </div>
    </SectionShell>
  );
}
