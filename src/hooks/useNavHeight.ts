'use client';

import { useLayoutEffect } from 'react';

export function useNavHeight() {
  useLayoutEffect(() => {
    const nav = document.querySelector('[data-site-navbar]') as HTMLElement | null;
    if (!nav) return;

    const update = () => {
      // Use bottom edge so fixed top offset (top-2/top-3) is included.
      const occupied = Math.ceil(nav.getBoundingClientRect().bottom);
      const height = Math.max(occupied, Math.ceil(nav.getBoundingClientRect().height));
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      document.documentElement.style.setProperty('--nav-height', `${height}px`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
}
