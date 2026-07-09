'use client';

import { useEffect } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { getNavOffsetPx, scrollExtraForId } from '@/lib/scrollToSection';

export function useHashScrollOffset() {
  const { locale } = useI18n();

  useEffect(() => {
    const correct = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const target = document.getElementById(hash);
      if (!target) return;

      const navHeight = getNavOffsetPx();
      const extra = scrollExtraForId(hash);
      const y = target.getBoundingClientRect().top + window.scrollY - navHeight - extra;

      window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
    };

    // Native hash can fire before nav height / fonts / locale hydrate.
    const timers = [50, 180, 420, 800, 1200].map((ms) => window.setTimeout(correct, ms));

    window.addEventListener('hashchange', correct);
    window.addEventListener('load', correct);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('hashchange', correct);
      window.removeEventListener('load', correct);
    };
  }, [locale]);
}
