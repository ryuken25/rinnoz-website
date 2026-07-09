"use client";
import { useLayoutEffect } from 'react';

export function useNavHeight() {
  useLayoutEffect(() => {
    const nav = document.querySelector('[data-site-navbar]') as HTMLElement | null;
    if (!nav) return;

    const update = () => {
      const height = Math.ceil(nav.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      document.documentElement.style.setProperty('--nav-height', `${height}px`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);
}
