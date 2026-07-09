"use client";
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { SectionShell } from './SectionShell';

function BoardCard({ kind, items, title }: { kind: 'do' | 'dont'; items: string[]; title: string }) {
  const good = kind === 'do';
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      whileHover={{ y: -6, rotate: good ? -0.4 : 0.4 }}
      className={`card paper-card relative overflow-hidden p-6 ${good ? 'hover:shadow-[0_0_48px_rgba(159,255,210,.16)]' : 'hover:shadow-[0_0_48px_rgba(255,120,189,.16)]'}`}
    >
      <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl ${good ? 'bg-mint/18' : 'bg-rose/18'}`} />
      <h3 className={`mb-5 text-2xl font-black ${good ? 'text-mint' : 'text-rose'}`}>{title}</h3>
      <div className="space-y-3">
        {items.map((x, i) => (
          <motion.p
            initial={{ opacity: 0, x: good ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            key={x}
            className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3 text-cream/82"
          >
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${good ? 'bg-mint/15 text-mint' : 'bg-rose/15 text-rose'}`}>{good ? '✓' : '✕'}</span>
            {x}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

export function TermsSection() {
  const { t, ta } = useI18n();
  const [open, setOpen] = useState(1);
  const doItems = ta<string>('terms.do');
  const dontItems = ta<string>('terms.dont');
  const policies = ta<{ title: string; body: string }>('terms.policies');

  return (
    <SectionShell id="terms" eyebrow={t('terms.eyebrow')} title={t('terms.title')} intro={t('terms.intro')}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_20%_0%,rgba(216,198,255,.12),transparent_35%),radial-gradient(circle_at_90%_30%,rgba(255,158,216,.1),transparent_30%)]" />
        <div className="grid gap-5 md:grid-cols-2">
          <BoardCard kind="do" items={doItems} title={t('terms.doTitle')} />
          <BoardCard kind="dont" items={dontItems} title={t('terms.dontTitle')} />
        </div>
      </div>
      <div className="mt-7 grid gap-3">
        {policies.map((p, i) => (
          <div key={p.title} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
              <span className="text-xl font-black text-lavender">{p.title}</span>
              <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-2xl">+</motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0, y: -8 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <div className="border-t border-white/10 px-5 pb-5 pt-4 leading-7 text-cream/72">{p.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
