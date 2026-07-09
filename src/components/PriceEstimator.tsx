"use client";
import { useMemo, useState } from 'react';
import { pricing, type StyleKey } from '@/content/pricing';
import { useI18n } from '@/i18n/useI18n';

export function PriceEstimator() {
  const { t } = useI18n();
  const [style, setStyle] = useState<StyleKey>('Chibi');
  const [type, setType] = useState<string>(pricing.Chibi[0].type);
  const [chars, setChars] = useState(1);
  const [bg, setBg] = useState('None/simple');
  const current = pricing[style].find((p) => p.type === type) || pricing[style][0];
  const estimate = useMemo(
    () => ({ usd: current.usd * chars + (bg === 'Complex' ? 10 : 0), idr: current.idr * chars + (bg === 'Complex' ? 50000 : 0) }),
    [current, chars, bg],
  );

  return (
    <div className="card p-6">
      <p className="eyebrow">{t('estimator.eyebrow')}</p>
      <h3 className="mt-2 font-display text-3xl">{t('estimator.title')}</h3>
      <p className="helper mt-2">{t('estimator.helper')}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label>
          {t('estimator.style')}
          <select
            value={style}
            onChange={(e) => {
              const s = e.target.value as StyleKey;
              setStyle(s);
              setType(pricing[s][0].type);
            }}
          >
            <option>Chibi</option>
            <option>Anime</option>
          </select>
        </label>
        <label>
          {t('estimator.type')}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {pricing[style].map((p) => (
              <option key={p.type}>{p.type}</option>
            ))}
          </select>
        </label>
        <label>
          {t('estimator.characters')}
          <input type="number" min={1} max={10} value={chars} onChange={(e) => setChars(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <label>
          {t('estimator.background')}
          <select value={bg} onChange={(e) => setBg(e.target.value)}>
            <option>None/simple</option>
            <option>Complex</option>
          </select>
        </label>
      </div>
      <div className="mt-5 rounded-3xl border border-lavender/25 bg-lavender/10 p-4">
        <p className="text-sm text-cream/65">{t('estimator.estimated')}</p>
        <p className="font-display text-4xl">${estimate.usd} / IDR {Math.round(estimate.idr / 1000)}k+</p>
        <p className="mt-1 text-sm text-cream/60">{t('estimator.commercialNote')}</p>
      </div>
    </div>
  );
}
