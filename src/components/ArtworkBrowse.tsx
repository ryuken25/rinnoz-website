"use client";
import Image from 'next/image';
import { artworkFilters, sourceLabel, type ArtworkFilter, type SocialArtwork } from '@/content/artworks';
import { useI18n } from '@/i18n/useI18n';

export function filterArtworks(items: SocialArtwork[], filter: ArtworkFilter) {
  if (filter === 'All') return items;
  if (filter === 'Recent') return items.filter((i) => i.source !== 'carrd-fallback').slice(0, 8);
  if (filter === 'Instagram') return items.filter((i) => i.source === 'instagram');
  if (filter === 'X') return items.filter((i) => i.source === 'x');
  return items.filter((i) => i.tags.includes(filter));
}

export function ArtworkBrowse({
  items,
  filter,
  setFilter,
  onSelect,
}: {
  items: SocialArtwork[];
  filter: ArtworkFilter;
  setFilter: (f: ArtworkFilter) => void;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  const visible = filterArtworks(items, filter);

  return (
    <div className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t('artworks.browseEyebrow')}</p>
          <h3 className="font-display text-4xl">{t('artworks.browseTitle')}</h3>
        </div>
        <p className="hidden text-sm text-cream/55 md:block">{t('artworks.browseCount', { count: visible.length })}</p>
      </div>
      <div className="sticky top-24 z-10 -mx-1 flex gap-2 overflow-x-auto px-1 pb-3 no-scrollbar">
        {artworkFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
              filter === f ? 'border-lavender bg-lavender text-ink' : 'border-white/12 bg-ink/70 text-cream/70 hover:text-cream'
            }`}
          >
            {t(`artworks.filters.${f}`)} <span className="opacity-60">{filterArtworks(items, f).length}</span>
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="card p-6 text-cream/70">{t('artworks.emptyFilter')}</div>
      ) : (
        <div className="gallery-masonry mt-4">
          {visible.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="gallery-card group relative border border-white/12 bg-white/[.045] text-left shadow-atelier"
            >
              <div className="relative bg-ink/35">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={item.width}
                  height={item.height}
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1536px) 33vw, 25vw"
                  className="h-auto w-full object-contain"
                  loading={item.featured ? 'eager' : 'lazy'}
                />
                <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-ink/70 px-3 py-1 text-xs font-black text-lavender backdrop-blur">
                  {sourceLabel(item.source)}
                </span>
              </div>
              <div className="p-4 md:absolute md:inset-x-3 md:bottom-3 md:translate-y-2 md:rounded-2xl md:border md:border-white/12 md:bg-ink/76 md:opacity-0 md:backdrop-blur-xl md:transition md:group-hover:translate-y-0 md:group-hover:opacity-100">
                <b className="text-sm">{item.title}</b>
                <p className="mt-1 line-clamp-2 text-xs text-cream/60">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
