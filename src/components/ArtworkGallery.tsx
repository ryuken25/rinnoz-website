"use client";
import { useEffect, useMemo, useState } from 'react';
import { ArtworkBrowse, filterArtworks } from './ArtworkBrowse';
import { ArtworkLandingIntro } from './ArtworkLandingIntro';
import { ArtworkLightbox } from './ArtworkLightbox';
import { ArtworkStory } from './ArtworkStory';
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
  const storyItems = allItems.filter((item) => item.source !== 'carrd-fallback');
  const thumbs = storyItems.slice(0, 6);

  return (
    <div className="relative">
      {/* PRIORITY: #artworks is a SAFE landing intro, not the pinned stage */}
      <ArtworkLandingIntro xCount={primarySocialCount} visibleCount={allItems.length} thumbnails={thumbs} />

      {/* Pinned / scroll story lives on its own section id */}
      <ArtworkStory items={storyItems} onSelect={setSelectedId} />

      {/* Browse grid after story */}
      <section id="artworks-browse" className="relative isolate scroll-mt-[calc(var(--nav-height)+40px)] px-4 pb-8 pt-6">
        <div className="mx-auto max-w-7xl">
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
        </div>
      </section>

      {selectedId && (
        <ArtworkLightbox
          items={visibleItems.length ? visibleItems : allItems}
          selectedId={selectedId}
          onClose={() => setSelectedId(null)}
          onSelect={setSelectedId}
        />
      )}
    </div>
  );
}
