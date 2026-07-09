"use client";
import { useEffect, useState } from 'react';
const links = ['home','terms','pricing','artworks','process','faq','order','socials'];
export function Navbar(){ const [open,setOpen]=useState(false); const [active,setActive]=useState('home');
  useEffect(()=>{ const obs=new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting) setActive(e.target.id); }); },{rootMargin:'-30% 0px -58% 0px'}); links.forEach(id=>{const el=document.getElementById(id); if(el) obs.observe(el)}); return()=>obs.disconnect();},[]);
  return <nav className="fixed inset-x-2 top-2 z-40 rounded-[1.55rem] border border-white/15 bg-ink/72 px-3 py-2.5 shadow-atelier backdrop-blur-2xl sm:inset-x-3 sm:top-3 sm:rounded-[1.8rem] sm:px-4 sm:py-3">
    <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
      <a href="#home" className="whitespace-nowrap font-display text-xl font-bold text-cream sm:text-2xl">☾ RinnOZ</a>
      <div className="hidden min-w-0 items-center justify-center gap-1 lg:flex">{links.map(l=><a key={l} href={`#${l}`} className={`rounded-full px-3 py-2 text-sm font-bold capitalize transition ${active===l?'bg-white/12 text-lavender':'text-cream/65 hover:text-cream'}`}>{l}</a>)}</div>
      <div className="flex items-center justify-end gap-2"><a href="#order" className="btn btn-primary px-3 text-sm sm:inline-flex sm:px-4">Order</a><button type="button" aria-label="Toggle menu" onClick={()=>setOpen(v=>!v)} className="btn btn-ghost px-3 text-sm lg:hidden">Menu</button></div>
    </div>
    {open && <div className="mx-auto mt-3 grid max-w-7xl gap-2 rounded-3xl border border-white/10 bg-midnight/95 p-3 lg:hidden">{links.map(l=><a onClick={()=>setOpen(false)} key={l} href={`#${l}`} className="rounded-2xl px-4 py-3 text-lg font-bold capitalize text-cream/85 hover:bg-white/10">{l}</a>)}</div>}
  </nav>;
}
