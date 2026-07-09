"use client";
import Image from 'next/image'; import { motion } from 'framer-motion'; import { StatusPill } from './StatusPill'; import { discordUrl, instagramUrl } from '@/content/socials'; import { artworks } from '@/content/artworks';
export function Hero(){ const minis=artworks.slice(1,4); return <header id="home" className="relative flex min-h-screen items-center px-4 pb-16 pt-32">
  <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
    <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.65}}>
      <StatusPill/><p className="eyebrow mt-7">Moonlit Atelier</p><h1 className="mt-3 font-display text-5xl font-bold leading-[.95] md:text-7xl xl:text-8xl">Moonlit anime & chibi commissions by <span className="text-lavender">RinnOZ</span></h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-cream/72 md:text-xl">Indonesian digital illustrator/designer for character-focused anime art, chibi, emotes/stickers, mascot-style work, and soft moody illustrations.</p>
      <div className="mt-8 flex flex-wrap gap-3"><a className="btn btn-primary" href="#order">Order Commission</a><a className="btn btn-ghost" href="#pricing">View Price List</a><a className="btn btn-ghost" href="#artworks">See Artworks</a><a className="btn btn-ghost" href={instagramUrl} target="_blank" rel="noreferrer">DM Instagram</a><a className="btn btn-ghost" href={discordUrl} target="_blank" rel="noreferrer">Join Discord</a></div>
      <div className="mt-7 flex flex-wrap gap-2 text-sm font-bold text-cream/72">{['Chibi','Anime Style','Character Art','Emotes','Vtuber / Mascot'].map(x=><span key={x} className="rounded-full border border-white/10 bg-white/5 px-3 py-2">✦ {x}</span>)}</div>
    </motion.div>
    <motion.div className="relative mx-auto w-full max-w-[620px]" animate={{y:[0,-10,0]}} transition={{repeat:Infinity,duration:7,ease:'easeInOut'}}>
      <div className="moon-orb absolute -right-8 -top-10 opacity-75"/><div className="absolute -left-7 top-12 rotate-[-9deg] rounded-3xl border border-white/15 bg-white/8 p-2 shadow-glow backdrop-blur-xl"><Image src={minis[0].src} alt={minis[0].alt} width={minis[0].width} height={minis[0].height} className="h-28 w-28 rounded-2xl object-cover md:h-36 md:w-36"/></div>
      <div className="card paper-card relative p-4 shadow-glow"><Image src="/rinnozuki/avatar/rinnozuki-avatar.jpg" alt="RinnOZ avatar/profile art" width={411} height={411} priority className="w-full rounded-[1.4rem]"/><div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/15 bg-ink/65 p-4 backdrop-blur-xl"><p className="eyebrow">Open for orders</p><p className="font-display text-3xl">Soft, cute, character-focused art</p></div></div>
      <div className="absolute -bottom-8 right-4 rotate-6 rounded-3xl border border-white/15 bg-white/8 p-2 shadow-blush backdrop-blur-xl"><Image src={minis[1].src} alt={minis[1].alt} width={minis[1].width} height={minis[1].height} className="h-32 w-32 rounded-2xl object-cover md:h-44 md:w-44"/></div>
    </motion.div>
  </div></header> }
