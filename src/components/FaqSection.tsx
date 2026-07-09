"use client";
import { useI18n } from '@/i18n/useI18n';
import { SectionShell } from './SectionShell';

export function FaqSection() {
  const { t, ta } = useI18n();
  const faqs = ta<[string, string]>('faq.items');
  return (
    <SectionShell id="faq" eyebrow={t('faq.eyebrow')} title={t('faq.title')}>
      <div className="grid gap-3 md:grid-cols-2">
        {faqs.map(([q, a]) => (
          <details className="card p-5" key={q}>
            <summary className="cursor-pointer font-black text-lavender">{q}</summary>
            <p className="mt-3 leading-7 text-cream/72">{a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
