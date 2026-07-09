"use client";
import { useEffect, useMemo, useState } from 'react';
import { ArtworkBrowse, filterArtworks } from './ArtworkBrowse';
import { ArtworkLightbox } from './ArtworkLightbox';
import { ArtworkStory } from './ArtworkStory';
import { SectionShell } from './SectionShell';
import { BrandIcon } from './BrandIcon';
import { carrdFallbackArtworks, type ArtworkFilter, type SocialArtwork } from '@/content/artworks';
import { socialArtworks } from '@/content/socialArtworks';
import { discordUrl, instagramUrl, xUrl } from '@/content/socials';
import { useI18n } from '@/i18n/useI18n';

const allItems: SocialArtwork[] = [...socialArtworks.filter((item) => item.isArt), ...carrdFallbackArtworks];

export function ArtworkGallery() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<ArtworkFilter>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visibleItems = useMemo(() => filterArtworks(allItems, filter), [filter]);
  useEffect(() => {
    if (selectedId && !visibleItems.some((item) => item.id === selectedId)) setSelectedId(null);
  }, [selectedId, visibleItems]);
  const primarySocialCount = allItems.filter((item) => item.source === 'x' || item.source === 'instagram').length;

  return (
    <SectionShell id="artworks" eyebrow={t('artworks.eyebrow')} title={t('artworks.title')} intro={t('artworks.intro')}>
      <div className="grid gap-4 rounded-[2rem] border border-white/12 bg-white/[.045] p-5 md:grid-cols-3">
        <div>
          <p className="eyebrow">{t('artworks.primaryEyebrow')}</p>
          <p className="mt-2 font-display text-3xl">{t('artworks.primaryTitle')}</p>
          <p className="mt-2 text-sm text-cream/62">{t('artworks.primaryBody', { count: primarySocialCount })}</p>
        </div>
        <div>
          <p className="eyebrow">{t('artworks.curationEyebrow')}</p>
          <p className="mt-2 font-display text-3xl">{t('artworks.curationTitle')}</p>
          <p className="mt-2 text-sm text-cream/62">{t('artworks.curationBody')}</p>
        </div>
        <div>
          <p className="eyebrow">{t('artworks.igEyebrow')}</p>
          <p className="mt-2 font-display text-3xl">{t('artworks.igTitle')}</p>
          <p className="mt-2 text-sm text-cream/62">{t('artworks.igBody')}</p>
        </div>
      </div>
      <ArtworkStory items={allItems.filter((item) => item.source !== 'carrd-fallback')} onSelect={setSelectedId} />
      <ArtworkBrowse items={allItems} filter={filter} setFilter={setFilter} onSelect={setSelectedId} />
      <div className="mt-8 flex flex-wrap gap-3">
        <a className="btn btn-primary" href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
          <BrandIcon name="instagram" />
          <span>Instagram</span>
        </a>
        <a className="btn btn-ghost" href={xUrl} target="_blank" rel="noreferrer" aria-label="X">
          <BrandIcon name="x" />
          <span>X</span>
        </a>
        <a className="btn btn-ghost" href="#order" aria-label={t('artworks.order')}>
          <BrandIcon name="order" />
          <span>{t('artworks.order')}</span>
        </a>
        <a className="btn btn-ghost" href={discordUrl} target="_blank" rel="noreferrer" aria-label="Discord">
          <BrandIcon name="discord" />
          <span>Discord</span>
        </a>
      </div>
      {selectedId && (
        <ArtworkLightbox
          items={visibleItems.length ? visibleItems : allItems}
          selectedId={selectedId}
          onClose={() => setSelectedId(null)}
          onSelect={setSelectedId}
        />
      )}
    </SectionShell>
  );
}
