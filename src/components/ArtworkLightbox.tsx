"use client";
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { SocialArtwork } from '@/content/artworks';
import { sourceLabel } from '@/content/artworks';

type Props = { items: SocialArtwork[]; selectedId: string; onClose: () => void; onSelect: (id: string) => void };
function nextIndex(index: number, total: number) { return total <= 0 ? -1 : (index + 1) % total; }
function prevIndex(index: number, total: number) { return total <= 0 ? -1 : (index - 1 + total) % total; }

export function ArtworkLightbox({ items, selectedId, onClose, onSelect }: Props) {
  const activeIndex = items.findIndex((item) => item.id === selectedId);
  const art = items[activeIndex] || items[0];
  const startX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const goNext = () => { const i = nextIndex(activeIndex, items.length); if (i >= 0) onSelect(items[i].id); };
  const goPrev = () => { const i = prevIndex(activeIndex, items.length); if (i >= 0) onSelect(items[i].id); };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    function key(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') goNext(); if (e.key === 'ArrowLeft') goPrev(); if (e.key === 'Tab') { /* basic focus containment stays inside dialog naturally via controls */ } }
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = prevOverflow; window.removeEventListener('keydown', key); };
  });
  if (!art) return null;
  const prev = items[prevIndex(activeIndex, items.length)];
  const next = items[nextIndex(activeIndex, items.length)];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-3 backdrop-blur-2xl" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label="Artwork lightbox">
    <div className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-midnight shadow-atelier" onMouseDown={(e)=>e.stopPropagation()} onTouchStart={(e)=>{startX.current=e.touches[0].clientX}} onTouchEnd={(e)=>{ if(startX.current===null) return; const dx=e.changedTouches[0].clientX-startX.current; if(Math.abs(dx)>45) (dx<0?goNext:goPrev)(); startX.current=null; }}>
      {prev && <Image src={prev.originalUrl || prev.imageUrl} alt="" width={32} height={32} className="hidden" priority />}
      {next && <Image src={next.originalUrl || next.imageUrl} alt="" width={32} height={32} className="hidden" priority />}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
        <button ref={closeRef} className="btn btn-ghost" onClick={onClose}>Close</button>
        <div className="min-w-0 text-center"><p className="truncate font-black">{art.title}</p><p className="text-xs text-cream/58">{activeIndex + 1} / {items.length} • {sourceLabel(art.source)} • {art.width}×{art.height}</p></div>
        <div className="flex gap-2"><button className="btn btn-ghost" aria-label="Previous artwork" onClick={goPrev}>←</button><button className="btn btn-ghost" aria-label="Next artwork" onClick={goNext}>→</button></div>
      </div>
      <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[1fr_360px]">
        <div className="flex min-h-0 items-center justify-center overflow-auto bg-ink/55 p-3"><Image src={art.originalUrl || art.imageUrl} alt={art.title} width={art.width} height={art.height} className="max-h-[74vh] w-auto rounded-3xl object-contain" priority /></div>
        <aside className="border-t border-white/10 p-5 lg:border-l lg:border-t-0"><span className="rounded-full border border-lavender/30 bg-lavender/10 px-3 py-1 text-xs font-black text-lavender">{sourceLabel(art.source)}</span><h3 className="mt-4 font-display text-3xl">{art.title}</h3><p className="mt-3 text-sm leading-6 text-cream/68">{art.description || art.caption}</p><div className="mt-4 flex flex-wrap gap-2">{art.tags.map(t=><span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold">{t}</span>)}</div><a className="btn btn-primary mt-6 w-full" href={art.postUrl} target="_blank" rel="noreferrer">View original post</a><p className="mt-4 text-xs text-cream/45">Swipe on mobile or use ArrowLeft / ArrowRight. ESC closes preview.</p></aside>
      </div>
    </div>
  </div>;
}
