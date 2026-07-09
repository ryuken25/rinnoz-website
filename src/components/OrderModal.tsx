"use client";
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pricing, type StyleKey } from '@/content/pricing';
import { socialArtworks } from '@/content/socialArtworks';
import { discordUrl, instagramUrl, xUrl } from '@/content/socials';
import { buildMailtoUrl, buildOrderEmailBody, buildOrderSubject, getOrderEmailTo } from '@/lib/mailto';
import { validateOrder } from '@/lib/orderValidation';
import type { OrderForm, OrderLang, PreferredContact } from '@/types/order';
import { ChoiceCard, ChoiceChip } from './ChoiceCard';
import { OrderStatusBanner } from './OrderStatusBanner';

type SubmitState = 'idle' | 'mailto-opened' | 'error';

const stepLabels = {
  en: ['Contact', 'Commission', 'References', 'Review'],
  id: ['Kontak', 'Komisi', 'Referensi', 'Review'],
} as const;

const initialForm: OrderForm = {
  name: '',
  email: '',
  preferredContact: 'Instagram',
  contactLink: '',
  paymentMethod: 'Mandiri',
  commissionStyle: 'Chibi',
  type: 'Headshot',
  characterCount: '1',
  background: 'None/simple',
  usage: 'Personal',
  deadline: 'Flexible',
  characterDescription: '',
  lore: '',
  design: '',
  references: '',
  notes: '',
  language: 'en',
  source: '',
  tos: false,
  website: '',
};

function estimate(form: OrderForm) {
  const style = (form.commissionStyle === 'Anime' ? 'Anime' : 'Chibi') as StyleKey;
  const item = pricing[style].find((p) => p.type === form.type) || pricing[style][0];
  const chars = Math.max(1, Number(form.characterCount) || 1);
  const extra = form.background === 'Complex' ? { usd: 10, idr: 50000 } : { usd: 0, idr: 0 };
  const usd = item.usd * chars + extra.usd;
  const idr = item.idr * chars + extra.idr;
  return { usd, idr, label: `$${usd}+ / IDR ${Math.round(idr / 1000)}k+` };
}

function contactPlaceholder(preferred: PreferredContact) {
  if (preferred === 'Instagram') return '@yourusername or instagram.com/yourusername';
  if (preferred === 'Discord') return 'yourname#0000 or Discord username';
  if (preferred === 'X') return '@yourhandle or x.com/yourhandle';
  if (preferred === 'Email') return 'email@example.com';
  return 'username / link / handle';
}

function Badge({ required }: { required?: boolean }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] ${required ? 'border-pink-300/30 bg-pink-300/10 text-pink-200' : 'border-white/10 bg-white/[0.04] text-white/45'}`}>
      {required ? 'Required' : 'Optional'}
    </span>
  );
}

function Field({
  label,
  required,
  children,
  help,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  help?: string;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="flex flex-wrap items-center gap-2">
        <span>{label}</span>
        <Badge required={required} />
      </span>
      {children}
      {help ? <small className="helper block">{help}</small> : null}
      {error ? <small className="block text-sm font-bold text-rose">{error}</small> : null}
    </label>
  );
}

function SummaryGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[.035] p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-lavender">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, required }: { label: string; value: string; required?: boolean }) {
  const empty = !value.trim();
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-cream/55">{label}</span>
      {empty && required ? (
        <span className="rounded-full bg-rose/15 px-2 py-0.5 text-[.68rem] font-black uppercase tracking-[.08em] text-rose">Missing required</span>
      ) : (
        <span className="summary-value max-w-[65%] text-right font-semibold text-cream/90">{empty ? 'Not provided' : value}</span>
      )}
    </div>
  );
}

export function OrderModal() {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<OrderLang>('en');
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const est = estimate(form);
  const validation = useMemo(() => validateOrder({ ...form, language: lang }, [], form.tos), [form, lang]);
  const samples = useMemo(
    () => socialArtworks.filter((a) => (form.commissionStyle === 'Chibi' ? a.tags.includes('Chibi') : a.tags.includes('Anime') || a.tags.includes('Scene / Illustration'))).slice(0, 4),
    [form.commissionStyle],
  );
  const chibiSample = socialArtworks.find((a) => a.tags.includes('Chibi')) || socialArtworks[1];
  const animeSample = socialArtworks.find((a) => a.tags.includes('Anime')) || socialArtworks[0];
  const subject = useMemo(() => buildOrderSubject({ ...form, language: lang }), [form, lang]);
  const body = useMemo(
    () => buildOrderEmailBody({ ...form, language: lang, source: form.source || (typeof location !== 'undefined' ? location.href : 'website') }, est.label),
    [form, lang, est.label],
  );
  const mailtoUrl = useMemo(() => buildMailtoUrl(getOrderEmailTo(), subject, body), [subject, body]);
  const emailRequired = form.preferredContact === 'Email';

  function update<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    setDirty(true);
    setTouched((x) => ({ ...x, [String(key)]: true }));
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function fieldError(field: string) {
    if (!touched[field] && step !== 3) return '';
    return validation.errors.find((e) => e.field === field)?.message || '';
  }

  function stepStatus(index: number): 'current' | 'complete' | 'incomplete' | 'idle' {
    if (index === step) return 'current';
    const stepNo = (index + 1) as 1 | 2 | 3 | 4;
    if (validation.missingByStep[stepNo].length) return 'incomplete';
    if (index < step) return 'complete';
    return 'idle';
  }

  function goNext() {
    const stepNo = (step + 1) as 1 | 2 | 3 | 4;
    const missing = validation.missingByStep[stepNo];
    if (missing.length) {
      setTouched((x) => ({ ...x, ...Object.fromEntries(missing.map((m) => [m.field, true])) }));
      setStatus(missing.map((m) => m.message).join(' '));
      return;
    }
    setStatus('');
    setStep((s) => Math.min(3, s + 1));
  }

  function jumpToFirstInvalid() {
    if (!validation.firstInvalidStep) return;
    setTouched((x) => ({ ...x, ...Object.fromEntries(validation.errors.map((e) => [e.field, true])) }));
    setStep(validation.firstInvalidStep - 1);
    setStatus('Please complete required details first.');
  }

  const requestClose = useCallback(() => {
    if (dirty && !confirm('Close the order form? Your draft is not submitted yet.')) return;
    setOpen(false);
    if (location.hash === '#order') history.replaceState(null, '', location.pathname + location.search);
  }, [dirty]);

  useEffect(() => {
    function click(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a[href="#order"]') as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setOpen(true);
      history.replaceState(null, '', '#order');
    }
    document.addEventListener('click', click);
    if (location.hash === '#order') setTimeout(() => setOpen(true), 100);
    function hash() {
      if (location.hash === '#order') setOpen(true);
    }
    window.addEventListener('hashchange', hash);
    return () => {
      document.removeEventListener('click', click);
      window.removeEventListener('hashchange', hash);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setForm((prev) => ({ ...prev, source: location.href, language: lang }));
    setTimeout(() => closeRef.current?.focus(), 80);
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') requestClose();
    }
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener('keydown', key);
    };
  }, [open, requestClose, lang]);

  // TODO: Re-enable reference file uploads after SMTP or Resend is configured.
  function submitOrder() {
    const result = validateOrder({ ...form, language: lang, source: location.href }, [], form.tos);
    if (!result.valid) {
      setTouched((x) => ({ ...x, ...Object.fromEntries(result.errors.map((e) => [e.field, true])) }));
      if (result.firstInvalidStep) setStep(result.firstInvalidStep - 1);
      setStatus(result.errors.map((e) => e.message).join(' '));
      setSubmitState('error');
      return;
    }

    window.location.href = mailtoUrl;
    setSubmitState('mailto-opened');
    setStatus('Email draft opened with your order summary.');
    setDirty(false);
  }

  const missingReview = [
    ...validation.missingByStep[1],
    ...validation.missingByStep[2],
    ...validation.missingByStep[3],
    ...validation.missingByStep[4],
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-ink/54 p-0 backdrop-blur-sm md:p-4 md:backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={requestClose}
          role="dialog"
          aria-modal="true"
          aria-label="RinnOZ commission order studio"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="order-modal-content mx-auto flex h-dvh max-w-7xl flex-col overflow-hidden border-white/15 bg-midnight shadow-atelier md:h-[min(88dvh,860px)] md:rounded-[2.2rem] md:border"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="eyebrow">Commission order studio</p>
                <h2 className="font-display text-2xl">Start your commission</h2>
              </div>
              <button ref={closeRef} type="button" className="btn btn-ghost" onClick={requestClose}>
                Close
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(280px,.82fr)_minmax(0,1.18fr)]">
              <aside className="order-column hidden min-h-0 overflow-y-auto border-r border-white/10 bg-white/[.035] p-5 lg:block">
                <p className="eyebrow">Live preview</p>
                <h3 className="mt-2 font-display text-4xl">Let’s plan your artwork</h3>
                <div className="mt-5 rounded-3xl border border-lavender/25 bg-lavender/10 p-4">
                  <p className="text-sm text-cream/62">Selected style</p>
                  <p className="font-display text-3xl">{form.commissionStyle} / {form.type}</p>
                  <p className="mt-1 text-sm text-cream/60">{form.characterCount} character(s) • {form.background}</p>
                </div>
                <div className="mt-4 rounded-3xl border border-blush/25 bg-blush/10 p-4">
                  <p className="text-sm text-cream/62">Rough estimate</p>
                  <p className="font-display text-4xl">{est.label}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {samples.map((s) => (
                    <Image key={s.id} src={s.imageUrl} alt={s.title} width={s.width} height={s.height} className="aspect-square rounded-2xl object-cover" />
                  ))}
                </div>
              </aside>

              <section className="order-column flex min-h-0 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                  <div className="flex gap-2">
                    {stepLabels[lang].map((label, i) => {
                      const state = stepStatus(i);
                      return (
                        <button
                          type="button"
                          key={label}
                          onClick={() => setStep(i)}
                          className={`step-dot ${state === 'current' ? 'active' : ''} ${state === 'incomplete' ? '!border-rose/50 !bg-rose/15 !text-rose' : ''} ${state === 'complete' ? '!border-mint/40 !bg-mint/15 !text-mint' : ''}`}
                          title={label}
                        >
                          {state === 'complete' ? '✓' : i + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                    <button type="button" className={`rounded-full px-4 py-2 font-black ${lang === 'en' ? 'bg-lavender text-ink' : ''}`} onClick={() => { setLang('en'); update('language', 'en'); }}>EN</button>
                    <button type="button" className={`rounded-full px-4 py-2 font-black ${lang === 'id' ? 'bg-lavender text-ink' : ''}`} onClick={() => { setLang('id'); update('language', 'id'); }}>ID</button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-28">
                  <input name="website" value={form.website || ''} onChange={(e) => update('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                  {step === 0 && (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Name / Handle" required error={fieldError('name')}>
                          <input required value={form.name} onBlur={() => setTouched((x) => ({ ...x, name: true }))} onChange={(e) => update('name', e.target.value)} />
                        </Field>
                        <Field label="Email" required={emailRequired} error={fieldError('email')} help={emailRequired ? 'Required because preferred contact is Email.' : 'Optional unless preferred contact is Email.'}>
                          <input type="email" value={form.email} onBlur={() => setTouched((x) => ({ ...x, email: true }))} onChange={(e) => update('email', e.target.value)} />
                        </Field>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">Preferred Contact <Badge required /></div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {(['Instagram', 'Discord', 'X', 'Email'] as PreferredContact[]).map((item) => (
                            <ChoiceCard key={item} selected={form.preferredContact === item} title={item} description={item === 'Email' ? 'Order updates via email' : `Chat on ${item}`} onClick={() => update('preferredContact', item)} />
                          ))}
                        </div>
                      </div>
                      <Field label="Contact Username / Link" required error={fieldError('contactLink')} help={contactPlaceholder(form.preferredContact)}>
                        <input required placeholder={contactPlaceholder(form.preferredContact)} value={form.contactLink} onBlur={() => setTouched((x) => ({ ...x, contactLink: true }))} onChange={(e) => update('contactLink', e.target.value)} />
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">Style <Badge required /></div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <ChoiceCard
                            selected={form.commissionStyle === 'Chibi'}
                            title="Chibi"
                            description="Cute icons, stickers, small mascots"
                            meta="Starts $5 / IDR 25k"
                            imageUrl={chibiSample?.imageUrl}
                            imageWidth={chibiSample?.width}
                            imageHeight={chibiSample?.height}
                            onClick={() => update('commissionStyle', 'Chibi')}
                          />
                          <ChoiceCard
                            selected={form.commissionStyle === 'Anime'}
                            title="Anime"
                            description="Portraits, half body, full illustrations"
                            meta="Starts $15 / IDR 75k"
                            imageUrl={animeSample?.imageUrl}
                            imageWidth={animeSample?.width}
                            imageHeight={animeSample?.height}
                            onClick={() => update('commissionStyle', 'Anime')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">Type / Crop <Badge required /></div>
                        <div className="flex flex-wrap gap-2">
                          {['Headshot', 'Bust Up', 'Half Body', 'Full Body', 'Emote', 'Character Sheet', 'Other'].map((item) => (
                            <ChoiceChip key={item} selected={form.type === item} title={item} onClick={() => update('type', item)} />
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Character Count" required error={fieldError('characterCount')}>
                          <input type="number" min="1" value={form.characterCount} onBlur={() => setTouched((x) => ({ ...x, characterCount: true }))} onChange={(e) => update('characterCount', e.target.value)} />
                        </Field>
                        <Field label="Deadline / Rush">
                          <select value={form.deadline} onChange={(e) => update('deadline', e.target.value)}>
                            <option>Flexible</option>
                            <option>Specific date</option>
                            <option>Rush</option>
                          </select>
                        </Field>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">Background <Badge required /></div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <ChoiceCard selected={form.background === 'None/simple'} title="None / simple" description="Clean soft backdrop" onClick={() => update('background', 'None/simple')} />
                          <ChoiceCard selected={form.background === 'Complex'} title="Complex" description="Detailed scene background" meta="From $10 / IDR 50k" onClick={() => update('background', 'Complex')} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">Usage <Badge required /></div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <ChoiceCard selected={form.usage === 'Personal'} title="Personal" description="Private / personal use" onClick={() => update('usage', 'Personal')} />
                          <ChoiceCard selected={form.usage === 'Commercial discussion needed'} title="Commercial discussion" description="Talk first for commercial use" onClick={() => update('usage', 'Commercial discussion needed')} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">Payment Method <Badge required /></div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          <ChoiceCard selected={form.paymentMethod === 'Mandiri'} title="Mandiri" description="Bank transfer" onClick={() => update('paymentMethod', 'Mandiri')} />
                          <ChoiceCard selected={form.paymentMethod === 'Dana'} title="Dana" description="Local ID payment" onClick={() => update('paymentMethod', 'Dana')} />
                          <ChoiceCard selected={form.paymentMethod === 'PayPal'} title="PayPal" description="International payment" onClick={() => update('paymentMethod', 'PayPal')} />
                          <ChoiceCard selected={form.paymentMethod === 'Other'} title="Other" description="Discuss with RinnOZ" onClick={() => update('paymentMethod', 'Other')} />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Character Description" required error={fieldError('characterDescription')} help="Describe the character, pose idea, expression, outfit, or what you want RinnOZ to draw.">
                        <textarea required value={form.characterDescription} onBlur={() => setTouched((x) => ({ ...x, characterDescription: true }))} onChange={(e) => update('characterDescription', e.target.value)} />
                      </Field>
                      <Field label="Personality / Lore / Story">
                        <textarea value={form.lore} onChange={(e) => update('lore', e.target.value)} />
                      </Field>
                      <Field label="Design / Accessories">
                        <textarea value={form.design} onChange={(e) => update('design', e.target.value)} />
                      </Field>
                      <Field
                        label="Reference Links"
                        help="File upload is temporarily disabled. For now, attach files manually in your email app or paste reference links here."
                      >
                        <textarea
                          placeholder="Paste Google Drive, Toyhouse, Pinterest board, Instagram/X post, image links, or any reference URLs here."
                          value={form.references}
                          onChange={(e) => update('references', e.target.value)}
                        />
                      </Field>
                      <Field label="Additional Notes">
                        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} />
                      </Field>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                      <div className="space-y-4">
                        {!validation.valid ? (
                          <div className="rounded-3xl border border-rose/30 bg-rose/10 p-4">
                            <p className="font-black text-rose">Please complete required details first.</p>
                            <p className="mt-2 text-sm text-cream/75">
                              {missingReview.length} required field{missingReview.length === 1 ? '' : 's'} {missingReview.length === 1 ? 'is' : 'are'} missing:
                            </p>
                            <ul className="mt-3 space-y-2">
                              {missingReview.map((err) => (
                                <li key={`${err.field}-${err.message}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                                  <span>{err.label}</span>
                                  <button type="button" className="btn btn-ghost px-3 py-1 text-xs" onClick={() => setStep(err.step - 1)}>
                                    Go to Step {err.step}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <SummaryGroup title="Client">
                              <SummaryRow label="Name / Handle" value={form.name} required />
                              <SummaryRow label="Preferred Contact" value={form.preferredContact} required />
                              <SummaryRow label="Contact" value={form.contactLink} required />
                              <SummaryRow label="Email" value={form.email || 'Not provided'} />
                            </SummaryGroup>
                            <SummaryGroup title="Commission">
                              <SummaryRow label="Style" value={form.commissionStyle} required />
                              <SummaryRow label="Type / Crop" value={form.type} required />
                              <SummaryRow label="Character Count" value={form.characterCount} required />
                              <SummaryRow label="Background" value={form.background} required />
                              <SummaryRow label="Usage" value={form.usage} required />
                              <SummaryRow label="Payment" value={form.paymentMethod} required />
                              <SummaryRow label="Deadline" value={form.deadline || 'Flexible'} />
                            </SummaryGroup>
                            <SummaryGroup title="Details">
                              <SummaryRow label="Character Description" value={form.characterDescription} required />
                              <SummaryRow label="Personality / Lore" value={form.lore || 'Not provided'} />
                              <SummaryRow label="Design / Accessories" value={form.design || 'Not provided'} />
                              <SummaryRow label="Additional Notes" value={form.notes || 'Not provided'} />
                            </SummaryGroup>
                            <SummaryGroup title="References">
                              <SummaryRow label="Reference Links" value={form.references || 'Not provided'} />
                              <SummaryRow label="Manual Files" value="Attach manually in your email app if needed." />
                            </SummaryGroup>
                            <SummaryGroup title="Estimate">
                              <SummaryRow label="Estimated Base" value={est.label} />
                            </SummaryGroup>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {submitState === 'mailto-opened' ? (
                          <OrderStatusBanner title="Email draft opened with your order summary." detail="Attach image files manually in your email app if needed." />
                        ) : null}

                        <label className="flex gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-cream/80">
                          <input
                            className="mt-1 w-auto"
                            type="checkbox"
                            checked={form.tos}
                            onChange={(e) => {
                              setTouched((x) => ({ ...x, terms: true }));
                              update('tos', e.target.checked);
                            }}
                          />
                          <span className="space-y-2">
                            <span className="block">
                              I agree to RinnOZ <a href="#terms" className="text-lavender underline">Terms of Service</a>.
                            </span>
                            <Badge required />
                          </span>
                        </label>
                        {fieldError('terms') ? <p className="text-sm font-bold text-rose">{fieldError('terms')}</p> : null}

                        {!validation.valid ? (
                          <button type="button" className="btn btn-primary w-full" onClick={jumpToFirstInvalid}>
                            Complete Required Fields
                          </button>
                        ) : (
                          <button type="button" className="btn btn-primary w-full" onClick={submitOrder}>
                            Open Email Draft to RinnOZ
                          </button>
                        )}

                        <button type="button" className="btn btn-ghost w-full" onClick={() => navigator.clipboard.writeText(`${subject}\n\n${body}`)}>
                          Copy Summary
                        </button>
                        <a className="btn btn-ghost w-full" href={mailtoUrl}>
                          Email Manually
                        </a>
                        <div className="grid grid-cols-3 gap-2">
                          <a className="btn btn-ghost" href={instagramUrl} target="_blank" rel="noreferrer">IG</a>
                          <a className="btn btn-ghost" href={discordUrl} target="_blank" rel="noreferrer">Discord</a>
                          <a className="btn btn-ghost" href={xUrl} target="_blank" rel="noreferrer">X</a>
                        </div>
                      </div>
                    </div>
                  )}

                  {status && step !== 3 ? <p className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-cream/75">{status}</p> : null}
                  {status && step === 3 && submitState !== 'mailto-opened' ? <p className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-cream/75">{status}</p> : null}
                </div>

                <div className="sticky bottom-0 flex items-center justify-between border-t border-white/10 bg-[#0b0618]/92 px-5 py-4 backdrop-blur-xl">
                  <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                    ← Back
                  </button>
                  {step < 3 ? (
                    <button type="button" className="btn btn-primary" onClick={goNext}>
                      Next →
                    </button>
                  ) : (
                    <span className="text-sm text-cream/45">Review & open email draft</span>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
