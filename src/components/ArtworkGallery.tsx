"use client";
import { useEffect, useMemo, useState } from 'react';
import { ArtworkBrowse, filterArtworks } from './ArtworkBrowse';
import { ArtworkLightbox } from './ArtworkLightbox';
import { ArtworkStory } from './ArtworkStory';
import { SectionShell } from './SectionShell';
import { carrdFallbackArtworks, type ArtworkFilter, type SocialArtwork } from '@/content/artworks';
import { socialArtworks } from '@/content/socialArtworks';
import { discordUrl, instagramUrl, xUrl } from '@/content/socials';

const allItems: SocialArtwork[] = [...socialArtworks.filter((item) => item.isArt), ...carrdFallbackArtworks];

export function ArtworkGallery() {
  const [filter, setFilter] = useState<ArtworkFilter>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visibleItems = useMemo(() => filterArtworks(allItems, filter), [filter]);
  useEffect(() => { if (selectedId && !visibleItems.some((item) => item.id === selectedId)) setSelectedId(null); }, [selectedId, visibleItems]);
  const primarySocialCount = allItems.filter((item) => item.source === 'x' || item.source === 'instagram').length;
  return <SectionShell id="artworks" eyebrow="Social art feed" title="Artworks / Selected Portfolio" intro="A cinematic story-driven portfolio built from curated social artwork posts first, with Carrd sheets kept only as fallback/reference. Each media item is independent — no giant grouped collage navigation.">
    <div className="grid gap-4 rounded-[2rem] border border-white/12 bg-white/[.045] p-5 md:grid-cols-3">
      <div><p className="eyebrow">Primary source</p><p className="mt-2 font-display text-3xl">X social artwork feed</p><p className="mt-2 text-sm text-cream/62">{primarySocialCount} curated art-only items imported from @Rinnozuki24 posts.</p></div>
      <div><p className="eyebrow">Curation</p><p className="mt-2 font-display text-3xl">Art-only filtering</p><p className="mt-2 text-sm text-cream/62">Game/freebie/non-portfolio posts are rejected by keyword scoring + manual override for representative art.</p></div>
      <div><p className="eyebrow">Instagram</p><p className="mt-2 font-display text-3xl">CTA only</p><p className="mt-2 text-sm text-cream/62">Instagram page/embed was rate-limited/login-gated, so no fake IG media is shown.</p></div>
    </div>
    <ArtworkStory items={allItems.filter((item) => item.source !== 'carrd-fallback')} onSelect={setSelectedId} />
    <ArtworkBrowse items={allItems} filter={filter} setFilter={setFilter} onSelect={setSelectedId} />
    <div className="mt-8 flex flex-wrap gap-3"><a className="btn btn-primary" href={instagramUrl} target="_blank" rel="noreferrer">See more on Instagram</a><a className="btn btn-ghost" href={xUrl} target="_blank" rel="noreferrer">See more on X</a><a className="btn btn-ghost" href="#order">Order commission</a><a className="btn btn-ghost" href={discordUrl} target="_blank" rel="noreferrer">Join Discord</a></div>
    {selectedId && <ArtworkLightbox items={visibleItems.length ? visibleItems : allItems} selectedId={selectedId} onClose={() => setSelectedId(null)} onSelect={setSelectedId} />}
  </SectionShell>;
}
