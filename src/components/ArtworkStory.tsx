"use client";
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
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

function ArtworkStoryDesktop({chapters,onSelect}:{chapters:SocialArtwork[];onSelect:(id:string)=>void}){
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const reduceMotion = useReducedMotion();
  const [activeIndex,setActiveIndex] = useState(0);

  useGSAP(() => {
    if (reduceMotion || !pinRef.current) return;
    const cards = cardsRef.current.filter(Boolean);
    if (!cards.length) return;
    gsap.set(cards, { autoAlpha: 0, yPercent: 18, xPercent: 8, scale: .88, rotate: 4, filter: 'blur(8px)', transformOrigin:'50% 50%' });
    gsap.set(cards[0], { autoAlpha: 1, yPercent: 0, xPercent: 0, scale: 1, rotate: -2, filter: 'blur(0px)' });
    gsap.set(progressRef.current, { scaleX: 0, transformOrigin: '0% 50%' });

    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'rinnoz-artwork-story',
        trigger: pinRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * Math.max(1, chapters.length - 1)}`,
        scrub: .8,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
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
      tl.to(cards[index-1], { autoAlpha:.16, yPercent:-14, xPercent:-12, scale:.82, rotate:-8, filter:'blur(5px)', duration:.48, ease:'power2.out' });
      tl.to(card, { autoAlpha:1, yPercent:0, xPercent:0, scale:1, rotate:index%2?2:-2, filter:'blur(0px)', duration:.58, ease:'power2.out' }, '<0.08');
    });
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => window.clearTimeout(refresh);
  }, { scope: rootRef, dependencies:[chapters.length, reduceMotion], revertOnUpdate:true });

  function jumpTo(index:number){
    setActiveIndex(index);
    const st = triggerRef.current || ScrollTrigger.getById('rinnoz-artwork-story');
    if(st){ const target = st.start + (st.end - st.start) * (index / Math.max(1, chapters.length - 1)); window.scrollTo({ top: target, behavior: 'smooth' }); }
  }

  const active = chapters[activeIndex] || chapters[0];
  const meta = chapterMeta[activeIndex] || chapterMeta[0];
  if(!active) return null;
  return <div ref={rootRef} className="hidden lg:block">
    <div ref={pinRef} className="relative h-screen overflow-hidden bg-ink/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,158,216,.18),transparent_28%),radial-gradient(circle_at_20%_70%,rgba(216,198,255,.15),transparent_34%)]" />
      <div className="relative z-10 mx-auto grid h-full max-w-7xl grid-cols-[.84fr_1.16fr] items-center gap-10 px-8 py-12">
        <aside className="rounded-[2rem] border border-white/12 bg-ink/66 p-6 shadow-glow backdrop-blur-2xl">
          <p className="eyebrow">Real scroll story</p>
          <motion.div key={active.id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.28}}>
            <p className="mt-7 text-sm font-black text-blush">{meta.kicker}</p>
            <h3 className="mt-2 font-display text-5xl leading-none">{meta.title}</h3>
            <p className="mt-5 leading-7 text-cream/68">{meta.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">{meta.tags.map(t=><span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold">{t}</span>)}</div>
            <p className="mt-5 text-sm font-black text-lavender">{active.title} • {sourceLabel(active.source)}</p>
          </motion.div>
          <div className="mt-8 space-y-3">{chapters.map((c,i)=><button onClick={()=>jumpTo(i)} key={c.id} className={`flex w-full items-center gap-3 rounded-3xl border p-3 text-left transition ${activeIndex===i?'border-lavender bg-lavender/12':'border-white/10 bg-white/5 opacity-70 hover:opacity-100'}`}><span className={`h-3 w-3 rounded-full ${activeIndex===i?'animate-pulse bg-blush':'bg-white/25'}`}/><div><p className="text-xs font-black text-blush">{chapterMeta[i]?.kicker}</p><p className="font-bold">{chapterMeta[i]?.title}</p></div></button>)}</div>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"><div ref={progressRef} className="h-full w-full bg-gradient-to-r from-lavender to-blush" /></div>
        </aside>
        <div className="story-art-stage relative h-[76vh] overflow-hidden rounded-[2.4rem] border border-white/12 bg-gradient-to-br from-white/[.09] to-white/[.03] p-6 shadow-atelier">
          {chapters.map((item,i)=><article ref={(el)=>{ if(el) cardsRef.current[i]=el; }} key={item.id} className="story-card absolute inset-6 grid place-items-center"><button onClick={()=>onSelect(item.id)} className="group relative flex h-full w-full items-center justify-center rounded-[1.8rem] bg-ink/42 p-4"><Image src={item.imageUrl} alt={item.title} width={item.width} height={item.height} sizes="58vw" className="max-h-[66vh] w-auto rounded-[1.4rem] object-contain shadow-atelier" priority={i<2}/><span className="absolute left-5 top-5 rounded-full border border-white/15 bg-ink/70 px-3 py-1 text-xs font-black text-lavender backdrop-blur">{sourceLabel(item.source)}</span><span className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/12 bg-ink/72 p-4 text-left opacity-0 backdrop-blur-xl transition group-hover:opacity-100"><b>{item.title}</b><br/><small className="text-cream/60">Click to open lightbox</small></span></button></article>)}
        </div>
      </div>
    </div>
  </div>
}

function ArtworkStoryMobile({chapters,onSelect}:{chapters:SocialArtwork[];onSelect:(id:string)=>void}){
  return <div className="grid gap-4 lg:hidden">{chapters.map((item,i)=><motion.button initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-60px'}} key={item.id} onClick={()=>onSelect(item.id)} className="card overflow-hidden text-left"><Image src={item.imageUrl} alt={item.title} width={item.width} height={item.height} className="h-auto w-full"/><div className="p-5"><p className="eyebrow">{chapterMeta[i]?.kicker}</p><h3 className="font-display text-3xl">{chapterMeta[i]?.title}</h3><p className="mt-2 text-cream/65">{item.title}</p></div></motion.button>)}</div>
}

export function ArtworkStory({items,onSelect}:{items:SocialArtwork[];onSelect:(id:string)=>void}){
  const chapters = useMemo(()=>makeChapters(items),[items]);
  return <div className="mt-8"><ArtworkStoryDesktop chapters={chapters} onSelect={onSelect}/><ArtworkStoryMobile chapters={chapters} onSelect={onSelect}/></div>
}
