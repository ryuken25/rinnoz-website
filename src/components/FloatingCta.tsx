"use client";
import { useI18n } from '@/i18n/useI18n';

export function FloatingCta() {
  const { t } = useI18n();
  return (
    <a href="#order" className="btn btn-primary fixed bottom-4 left-4 right-4 z-40 shadow-glow md:hidden">
      {t('floating.cta')}
    </a>
  );
}
