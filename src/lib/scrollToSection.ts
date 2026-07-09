export function getNavOffsetPx() {
  if (typeof window === 'undefined') return 76;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '76';
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 76;
}

export function scrollExtraForId(id: string) {
  if (id === 'artworks') return 48;
  if (id === 'artworks-story-stage') return 56;
  if (id === 'artworks-browse') return 40;
  return 32;
}

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const cleanId = id.replace(/^#/, '');
  const target = document.getElementById(cleanId) || document.querySelector(`#${CSS.escape(cleanId)}`);
  if (!target) return;

  const navHeight = getNavOffsetPx();
  const extra = scrollExtraForId(cleanId);
  const y = target.getBoundingClientRect().top + window.scrollY - navHeight - extra;

  window.history.pushState(null, '', `#${cleanId}`);
  window.scrollTo({ top: Math.max(0, y), behavior });
}
