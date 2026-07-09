export function getNavOffsetPx() {
  if (typeof window === 'undefined') return 88;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '88';
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 88;
}

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const cleanId = id.replace(/^#/, '');
  const target = document.getElementById(cleanId) || document.querySelector(`#${CSS.escape(cleanId)}`);
  if (!target) return;

  const navHeight = getNavOffsetPx();
  const extra = cleanId === 'artworks' ? 56 : 32;
  const y = target.getBoundingClientRect().top + window.scrollY - navHeight - extra;

  window.history.pushState(null, '', `#${cleanId}`);
  window.scrollTo({ top: Math.max(0, y), behavior });
}
