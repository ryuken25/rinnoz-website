'use client';

import { useEffect } from 'react';
import { getNavOffsetPx } from '@/lib/scrollToSection';

export function useHashScrollOffset() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return;

      const target = document.querySelector(hash);
      if (!target) return;

      const navHeight = getNavOffsetPx();
      const extra = hash === '#artworks' ? 56 : 32;
      const y = target.getBoundingClientRect().top + window.scrollY - navHeight - extra;

      window.scrollTo({
        top: Math.max(0, y),
        behavior: 'auto',
      });
    };

    // Native hash can fire before nav height is measured.
    const t1 = window.setTimeout(scrollToHash, 50);
    const t2 = window.setTimeout(scrollToHash, 250);
    const t3 = window.setTimeout(scrollToHash, 600);

    window.addEventListener('hashchange', scrollToHash);
    window.addEventListener('load', scrollToHash);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('hashchange', scrollToHash);
      window.removeEventListener('load', scrollToHash);
    };
  }, []);
}
