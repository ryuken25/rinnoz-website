"use client";
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { SocialArtwork } from '@/content/artworks';
import { sourceLabel } from '@/content/artworks';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const chapterMeta = [
  { kicker:'01 / Signature Mood', title:'Soft anime portraits with a dreamy emotional tone.', body:'A featured artwork that sells Rinnozuki’s moody anime commission style.', tags:['Anime','Portrait','Mood'] },
  { kicker:'02 / Cute Chibi Energy', title:'Small proportions, big personality.', body:'Chibi samples that work for gifts, icons, panels, emotes, and profile use.', tags:['Chibi','Cute','Profile'] },
  { kicker:'03 / Mascot & Character Presence', title:'Readable designs that can carry a persona.', body:'Character work with clear silhouettes, soft color harmony, and commission-ready presentation.', tags:['Mascot','Vtuber','OC'] },
  { kicker:'04 / Scene & Story', title:'Illustrations that feel like a small memory.', body:'Atmospheric artwork with environment, lighting, and gift-style storytelling.', tags:['Scene','Illustration','Gift'] },
  { kicker:'05 / Shadow & Utility', title:'A range board that proves style and function.', body:'Sticker, emote, and mood samples that show how the art can be used beyond one illustration.', tags:['Sticker','Emote','Utility'] },
] as const;

function makeChapters(items: SocialArtwork[]) {
  return [
    items.find(i=>i.id.includes('206479')),
    items.find(i=>i.tags.includes('Chibi')),
    items.find(i=>i.tags.includes('Mascot / Vtuber')),
    items.find(i=>i.id.includes('202409')) || items.find(i=>i.id.includes('196204')),
    items.find(i=>i.id.includes('198489')),
  ].filter(Boolean) as SocialArtwork[];
}
function useIsDesktop(){ const [ok,setOk]=useState(false); useEffect(()=>{const mq=matchMedia('(min-width:1024px)'); const sync=()=>setOk(mq.matches); sync(); mq.addEventListener('change',sync); return()=>mq.removeEventListener('change',sync);},[]); return ok; }

function ArtworkStoryDesktop({chapters,onSelect}:{chapters:SocialArtwork[];onSelect:(id:string)=>void}){
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [activeIndex,setActiveIndex] = useState(0);

  useGSAP(() => {
    if (!pinRef.current) return;
    const cards = cardsRef.current.filter(Boolean);
    if (!cards.length) return;
    gsap.set(cards, { autoAlpha: 0, yPercent: 14, xPercent: 5, scale: .9, rotate: 3, filter: 'blur(6px)', transformOrigin:'50% 50%' });
    gsap.set(cards[0], { autoAlpha: 1, yPercent: 0, xPercent: 0, scale: 1, rotate: -1.5, filter: 'blur(0px)' });
    gsap.set(progressRef.current, { scaleX: 0, transformOrigin: '0% 50%' });
    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'rinnoz-artwork-story',
        trigger: pinRef.current,
        start: () => {
          const nav = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 88;
          return `top+=${nav + 18} top`;
        },
        end: () => `+=${Math.max(2200, window.innerHeight * Math.max(1, chapters.length - 1))}`,
        scrub: .65,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        markers: false,
        onUpdate: (self) => {
          const next = Math.min(chapters.length - 1, Math.max(0, Math.round(self.progress * (chapters.length - 1))));
          setActiveIndex(next);
          gsap.set(progressRef.current, { scaleX: self.progress });
        },
      }
    });
    triggerRef.current = tl.scrollTrigger || null;
    cards.forEach((card,index)=>{
      if(index===0) return;
      tl.to(cards[index-1], { autoAlpha:.14, yPercent:-10, xPercent:-8, scale:.84, rotate:-6, filter:'blur(4px)', duration:.42, ease:'power2.out' });
      tl.to(card, { autoAlpha:1, yPercent:0, xPercent:0, scale:1, rotate:index%2?1.5:-1.5, filter:'blur(0px)', duration:.52, ease:'power2.out' }, '<0.08');
    });
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => window.clearTimeout(refresh);
  }, { scope: rootRef, dependencies:[chapters.length], revertOnUpdate:true });

  function jumpTo(index:number){
    setActiveIndex(index);
    const st = triggerRef.current || ScrollTrigger.getById('rinnoz-artwork-story');
    if(st){ const target = st.start + (st.end - st.start) * (index / Math.max(1, chapters.length - 1)); window.scrollTo({ top: target, behavior: 'smooth' }); }
  }
  const active = chapters[activeIndex] || chapters[0]; const meta = chapterMeta[activeIndex] || chapterMeta[0]; if(!active) return null;
  return <div ref={rootRef} className="hidden lg:block">
    <div ref={pinRef} className="relative min-h-[calc(100svh-var(--nav-height,var(--navbar-height))-36px)] overflow-hidden bg-ink/20 py-[clamp(1rem,2vh,2rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,158,216,.16),transparent_28%),radial-gradient(circle_at_20%_70%,rgba(216,198,255,.13),transparent_34%)]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--nav-height,var(--navbar-height))-48px)] w-full max-w-[1360px] grid-cols-[.86fr_1.14fr] items-center gap-[clamp(1.5rem,3vw,3rem)] px-[clamp(1.25rem,3vw,3.5rem)]">
        <aside className="story-panel max-h-[calc(100svh-var(--nav-height,var(--navbar-height))-48px)] overflow-hidden rounded-[1.8rem] border border-white/12 bg-ink/66 p-[clamp(1.1rem,1.7vw,1.65rem)] shadow-glow backdrop-blur-2xl">
          <p className="text-[clamp(.68rem,.72vw,.8rem)] font-black uppercase tracking-[.18em] text-blush">Real scroll story</p>
          <motion.div key={active.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.24}}>
            <p className="mt-[clamp(.8rem,1.8vh,1.35rem)] text-[clamp(.72rem,.75vw,.85rem)] font-black uppercase tracking-[.08em] text-blush">{meta.kicker}</p>
            <h3 className="story-title mt-2 font-display text-[clamp(2.05rem,2.9vw,3.85rem)] leading-[.98] tracking-[-.045em]">{meta.title}</h3>
            <p className="story-body-long mt-[clamp(.75rem,1.5vh,1.15rem)] text-[clamp(.9rem,.9vw,1.05rem)] leading-[1.65] text-cream/68">{meta.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">{meta.tags.map(t=><span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[.72rem] font-bold">{t}</span>)}</div>
            <p className="mt-3 truncate text-[clamp(.78rem,.78vw,.92rem)] font-black text-lavender">{active.title} • {sourceLabel(active.source)}</p>
          </motion.div>
          <div className="story-steps mt-[clamp(.8rem,1.7vh,1.25rem)] space-y-2">{chapters.map((c,i)=><button type="button" onClick={()=>jumpTo(i)} key={c.id} className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-2.5 text-left transition ${activeIndex===i?'border-lavender/70 bg-lavender/12 shadow-[0_0_24px_rgba(216,198,255,.12)]':'border-white/10 bg-white/5 opacity-58 hover:opacity-100'}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${activeIndex===i?'animate-pulse bg-blush':'bg-white/25'}`}/><div className="min-w-0"><p className="text-[clamp(.68rem,.68vw,.78rem)] font-black uppercase tracking-[.08em] text-blush">{chapterMeta[i]?.kicker}</p><p className="truncate text-[clamp(.78rem,.8vw,.95rem)] font-bold leading-snug">{chapterMeta[i]?.title}</p></div></button>)}</div>
          <div className="mt-[clamp(.8rem,1.8vh,1.25rem)] h-1.5 overflow-hidden rounded-full bg-white/10"><div ref={progressRef} className="h-full w-full bg-gradient-to-r from-lavender to-blush" /></div>
        </aside>
        <div className="story-art-frame relative flex min-h-[calc(100svh-var(--nav-height,var(--navbar-height))-72px)] items-center justify-center overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-br from-white/[.09] to-white/[.03] p-[clamp(1rem,1.8vw,1.5rem)] shadow-atelier">
          {chapters.map((item,i)=><article ref={(el)=>{ if(el) cardsRef.current[i]=el; }} key={item.id} className="story-card absolute inset-[clamp(1rem,1.6vw,1.5rem)] grid place-items-center"><button type="button" onClick={()=>onSelect(item.id)} className="group relative flex h-full w-full items-center justify-center rounded-[1.6rem] bg-ink/42 p-[clamp(.7rem,1.2vw,1rem)]"><Image src={item.imageUrl} alt={item.title} width={item.width} height={item.height} sizes="(max-width:1024px) 70vw, 48vw" className="h-auto max-h-[min(58svh,620px)] w-auto max-w-[min(680px,48vw)] rounded-[1.25rem] object-contain shadow-atelier" priority={i<1}/><span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink/70 px-3 py-1 text-[.72rem] font-black text-lavender backdrop-blur">{sourceLabel(item.source)}</span><span className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/12 bg-ink/72 p-3 text-left opacity-0 backdrop-blur-xl transition group-hover:opacity-100"><b className="text-sm">{item.title}</b><br/><small className="text-cream/60">Click to open lightbox</small></span></button></article>)}
        </div>
      </div>
    </div>
  </div>
}

function ArtworkStoryMobile({chapters,onSelect}:{chapters:SocialArtwork[];onSelect:(id:string)=>void}){
  return <section id="artworks-mobile-story" className="space-y-5 lg:hidden">{chapters.map((item,i)=><motion.button type="button" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-60px'}} key={item.id} onClick={()=>onSelect(item.id)} className="card w-full overflow-hidden p-3 text-left"><div className="rounded-[1.5rem] bg-ink/38 p-2"><Image src={item.imageUrl} alt={item.title} width={item.width} height={item.height} sizes="(max-width:640px) 92vw, (max-width:1024px) 70vw, 48vw" className="h-auto max-h-[48svh] w-full rounded-[1.25rem] object-contain" priority={i===0}/></div><div className="p-3"><p className="text-[.72rem] font-black uppercase tracking-[.14em] text-blush">{chapterMeta[i]?.kicker}</p><h3 className="mt-2 font-display text-[clamp(1.65rem,8vw,2.35rem)] leading-[1.05] tracking-[-.035em]">{chapterMeta[i]?.title}</h3><p className="mt-2 text-[.95rem] leading-[1.65] text-cream/65">{chapterMeta[i]?.body}</p><div className="mt-3 flex flex-wrap gap-2">{chapterMeta[i]?.tags.map(t=><span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[.7rem] font-bold">{t}</span>)}</div></div></motion.button>)}</section>
}

export function ArtworkStory({items,onSelect}:{items:SocialArtwork[];onSelect:(id:string)=>void}){
  const chapters = useMemo(()=>makeChapters(items),[items]);
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion();
  return <div className="mt-8">{isDesktop && !reduceMotion ? <ArtworkStoryDesktop chapters={chapters} onSelect={onSelect}/> : <ArtworkStoryMobile chapters={chapters} onSelect={onSelect}/>}</div>
}
