"use client";
import { useI18n } from '@/i18n/useI18n';

export function StatusPill() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-sm font-black text-mint">
      <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_14px_var(--mint)]" />
      {t('hero.status')}
    </span>
  );
}
