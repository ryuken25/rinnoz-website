"use client";
import { useI18n } from '@/i18n/useI18n';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="px-4 pb-28 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 rounded-[2rem] border border-white/15 bg-white/5 p-6 md:flex-row md:items-center">
        <div>
          <b className="font-display text-3xl">☾ RinnOZ</b>
          <p className="text-mint">{t('footer.status')}</p>
          <p className="text-sm text-cream/55">{t('footer.credit')}</p>
        </div>
        <a href="#order" className="btn btn-primary">{t('footer.cta')}</a>
      </div>
    </footer>
  );
}
