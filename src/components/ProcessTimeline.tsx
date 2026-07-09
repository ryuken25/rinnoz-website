"use client";
import { useI18n } from '@/i18n/useI18n';
import { SectionShell } from './SectionShell';

export function ProcessTimeline() {
  const { t, ta } = useI18n();
  const steps = ta<string>('process.steps');
  return (
    <SectionShell id="process" eyebrow={t('process.eyebrow')} title={t('process.title')}>
      <div className="grid gap-3 md:grid-cols-7">
        {steps.map((s, i) => (
          <div key={s} className="card p-4">
            <p className="font-display text-3xl text-lavender">{String(i + 1).padStart(2, '0')}</p>
            <p className="mt-2 font-bold">{s}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 text-cream/72">{t('process.note')}</p>
    </SectionShell>
  );
}
