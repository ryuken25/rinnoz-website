"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { useId, useState } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { SectionShell } from './SectionShell';

export function FaqSection() {
  const { t, ta } = useI18n();
  const faqs = ta<[string, string]>('faq.items');
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <SectionShell id="faq" eyebrow={t('faq.eyebrow')} title={t('faq.title')}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_15%_0%,rgba(216,198,255,.14),transparent_32%),radial-gradient(circle_at_90%_40%,rgba(255,158,216,.12),transparent_28%)]" />

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-btn-${i}`;

            return (
              <motion.div
                key={q}
                layout
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.04, duration: 0.28 }}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-[1.5rem] border transition duration-300 ${
                  isOpen
                    ? 'border-lavender/55 bg-gradient-to-br from-lavender/14 via-white/[.06] to-blush/10 shadow-[0_0_40px_rgba(216,198,255,.18)]'
                    : 'border-white/12 bg-white/[.04] hover:border-lavender/35 hover:bg-white/[.07] hover:shadow-[0_12px_40px_rgba(159,122,234,.14)]'
                }`}
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition ${
                    isOpen ? 'bg-blush/25' : 'bg-lavender/0 group-hover:bg-lavender/18'
                  }`}
                />

                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="relative flex w-full items-start gap-3 p-4 text-left sm:items-center sm:gap-4 sm:p-5"
                >
                  <span
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-black transition sm:mt-0 ${
                      isOpen
                        ? 'border-blush/40 bg-blush/15 text-blush shadow-[0_0_18px_rgba(255,158,216,.25)]'
                        : 'border-white/12 bg-white/5 text-lavender group-hover:border-lavender/30 group-hover:text-cream'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-display text-[clamp(1.05rem,1.4vw,1.25rem)] leading-snug tracking-[-0.02em] transition ${
                        isOpen ? 'text-cream' : 'text-lavender group-hover:text-cream'
                      }`}
                    >
                      {q}
                    </span>
                    {!isOpen ? (
                      <span className="mt-1 block text-xs font-semibold text-cream/40 group-hover:text-cream/55">
                        {t('faq.tapHint')}
                      </span>
                    ) : null}
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xl font-black transition ${
                      isOpen
                        ? 'border-lavender/50 bg-lavender/20 text-cream'
                        : 'border-white/12 bg-white/5 text-lavender group-hover:border-lavender/35 group-hover:bg-lavender/10'
                    }`}
                    aria-hidden
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/10 px-4 pb-5 pt-0 sm:px-5">
                        <motion.p
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.05, duration: 0.22 }}
                          className="pl-0 pt-4 text-[0.98rem] leading-7 text-cream/75 sm:pl-[3.25rem]"
                        >
                          {a}
                        </motion.p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
