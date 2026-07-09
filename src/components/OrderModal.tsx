"use client";
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pricing, type StyleKey } from '@/content/pricing';
import { socialArtworks } from '@/content/socialArtworks';
import { discordUrl, instagramUrl, xUrl } from '@/content/socials';
import { useI18n } from '@/i18n/useI18n';
import { buildMailtoUrl, buildOrderEmailBody, buildOrderSubject, getOrderEmailTo } from '@/lib/mailto';
import { validateOrder } from '@/lib/orderValidation';
import type { OrderForm, PreferredContact } from '@/types/order';
import { ChoiceCard, ChoiceChip } from './ChoiceCard';
import { LanguageToggle } from './LanguageToggle';
import { OrderStatusBanner } from './OrderStatusBanner';

type SubmitState = 'idle' | 'mailto-opened' | 'error';

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
  language: 'id',
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

function Badge({ required, requiredLabel, optionalLabel }: { required?: boolean; requiredLabel: string; optionalLabel: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] ${required ? 'border-pink-300/30 bg-pink-300/10 text-pink-200' : 'border-white/10 bg-white/[0.04] text-white/45'}`}>
      {required ? requiredLabel : optionalLabel}
    </span>
  );
}

function Field({
  label,
  required,
  children,
  help,
  error,
  requiredLabel,
  optionalLabel,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  help?: string;
  error?: string;
  requiredLabel: string;
  optionalLabel: string;
}) {
  return (
    <label className="space-y-2">
      <span className="flex flex-wrap items-center gap-2">
        <span>{label}</span>
        <Badge required={required} requiredLabel={requiredLabel} optionalLabel={optionalLabel} />
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

function SummaryRow({ label, value, required, missingLabel, notProvided }: { label: string; value: string; required?: boolean; missingLabel: string; notProvided: string }) {
  const empty = !value.trim();
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-cream/55">{label}</span>
      {empty && required ? (
        <span className="rounded-full bg-rose/15 px-2 py-0.5 text-[.68rem] font-black uppercase tracking-[.08em] text-rose">{missingLabel}</span>
      ) : (
        <span className="summary-value max-w-[65%] text-right font-semibold text-cream/90">{empty ? notProvided : value}</span>
      )}
    </div>
  );
}

export function OrderModal() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OrderForm>({ ...initialForm, language: locale });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setForm((prev) => ({ ...prev, language: locale }));
  }, [locale]);

  const est = estimate(form);
  const validation = useMemo(() => validateOrder({ ...form, language: locale }, [], form.tos, locale), [form, locale]);
  const samples = useMemo(
    () => socialArtworks.filter((a) => (form.commissionStyle === 'Chibi' ? a.tags.includes('Chibi') : a.tags.includes('Anime') || a.tags.includes('Scene / Illustration'))).slice(0, 4),
    [form.commissionStyle],
  );
  const chibiSample = socialArtworks.find((a) => a.tags.includes('Chibi')) || socialArtworks[1];
  const animeSample = socialArtworks.find((a) => a.tags.includes('Anime')) || socialArtworks[0];
  const subject = useMemo(() => buildOrderSubject({ ...form, language: locale }, locale), [form, locale]);
  const body = useMemo(
    () => buildOrderEmailBody({ ...form, language: locale, source: form.source || (typeof location !== 'undefined' ? location.href : 'website') }, est.label, locale),
    [form, locale, est.label],
  );
  const mailtoUrl = useMemo(() => buildMailtoUrl(getOrderEmailTo(), subject, body), [subject, body]);
  const emailRequired = form.preferredContact === 'Email';
  const requiredLabel = t('common.required');
  const optionalLabel = t('common.optional');
  const stepLabels = [t('order.steps.0'), t('order.steps.1'), t('order.steps.2'), t('order.steps.3')];
  // steps are array in dict - use ta via t fallback: order.steps is array so use index keys carefully
  // We'll use fixed indices via ta in component - re-get below

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
    setStatus(t('order.errors.incomplete'));
  }

  const requestClose = useCallback(() => {
    if (dirty && !confirm(locale === 'id' ? 'Tutup form order? Draft kamu belum terkirim.' : 'Close the order form? Your draft is not submitted yet.')) return;
    setOpen(false);
    if (location.hash === '#order') history.replaceState(null, '', location.pathname + location.search);
  }, [dirty, locale]);

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
    setForm((prev) => ({ ...prev, source: location.href, language: locale }));
    setTimeout(() => closeRef.current?.focus(), 80);
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') requestClose();
    }
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener('keydown', key);
    };
  }, [open, requestClose, locale]);

  // TODO: Re-enable reference file uploads after SMTP or Resend is configured.
  function submitOrder() {
    const result = validateOrder({ ...form, language: locale, source: location.href }, [], form.tos, locale);
    if (!result.valid) {
      setTouched((x) => ({ ...x, ...Object.fromEntries(result.errors.map((e) => [e.field, true])) }));
      if (result.firstInvalidStep) setStep(result.firstInvalidStep - 1);
      setStatus(result.errors.map((e) => e.message).join(' '));
      setSubmitState('error');
      return;
    }

    window.location.href = mailtoUrl;
    setSubmitState('mailto-opened');
    setStatus(t('order.review.draftOpened'));
    setDirty(false);
  }

  const missingReview = [
    ...validation.missingByStep[1],
    ...validation.missingByStep[2],
    ...validation.missingByStep[3],
    ...validation.missingByStep[4],
  ];

  const steps = useMemo(() => {
    // order.steps is array - access via dictionary through t won't work for arrays; hardcode from locale via known keys
    return locale === 'id' ? ['Kontak', 'Komisi', 'Detail', 'Review'] : ['Contact', 'Commission', 'Details', 'Review'];
  }, [locale]);

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
          aria-label={t('order.studioTitle')}
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
                <p className="eyebrow">{t('order.studioEyebrow')}</p>
                <h2 className="font-display text-2xl">{t('order.studioTitle')}</h2>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle compact />
                <button ref={closeRef} type="button" className="btn btn-ghost" onClick={requestClose}>
                  {t('common.close')}
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(280px,.82fr)_minmax(0,1.18fr)]">
              <aside className="order-column hidden min-h-0 overflow-y-auto border-r border-white/10 bg-white/[.035] p-5 lg:block">
                <p className="eyebrow">{t('order.livePreview')}</p>
                <h3 className="mt-2 font-display text-4xl">{t('order.planTitle')}</h3>
                <div className="mt-5 rounded-3xl border border-lavender/25 bg-lavender/10 p-4">
                  <p className="text-sm text-cream/62">{t('order.selectedStyle')}</p>
                  <p className="font-display text-3xl">{form.commissionStyle} / {form.type}</p>
                  <p className="mt-1 text-sm text-cream/60">{form.characterCount} • {form.background}</p>
                </div>
                <div className="mt-4 rounded-3xl border border-blush/25 bg-blush/10 p-4">
                  <p className="text-sm text-cream/62">{t('order.roughEstimate')}</p>
                  <p className="font-display text-4xl">{est.label}</p>
                </div>
                <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="font-black text-lavender">{t('order.timeline')}</p>
                  <p className="text-sm text-cream/65">{t('order.timelineBody')}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {samples.map((s) => (
                    <Image key={s.id} src={s.imageUrl} alt={s.title} width={s.width} height={s.height} className="aspect-square rounded-2xl object-cover" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-cream/55">{t('order.tip')}</p>
              </aside>

              <section className="order-column flex min-h-0 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                  <div className="flex gap-2">
                    {steps.map((label, i) => {
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
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-28">
                  <input name="website" value={form.website || ''} onChange={(e) => update('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                  {step === 0 && (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label={t('order.fields.name')} required error={fieldError('name')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                          <input required value={form.name} onBlur={() => setTouched((x) => ({ ...x, name: true }))} onChange={(e) => update('name', e.target.value)} />
                        </Field>
                        <Field label={t('order.fields.email')} required={emailRequired} error={fieldError('email')} help={emailRequired ? t('order.helpers.emailRequired') : t('order.helpers.emailOptional')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                          <input type="email" value={form.email} onBlur={() => setTouched((x) => ({ ...x, email: true }))} onChange={(e) => update('email', e.target.value)} />
                        </Field>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">{t('order.fields.preferredContact')} <Badge required requiredLabel={requiredLabel} optionalLabel={optionalLabel} /></div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {(['Instagram', 'Discord', 'X', 'Email'] as PreferredContact[]).map((item) => (
                            <ChoiceCard key={item} selected={form.preferredContact === item} title={item} description={t(`order.contacts.${item}`)} onClick={() => update('preferredContact', item)} />
                          ))}
                        </div>
                      </div>
                      <Field label={t('order.fields.contactLink')} required error={fieldError('contactLink')} help={contactPlaceholder(form.preferredContact)} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                        <input required placeholder={contactPlaceholder(form.preferredContact)} value={form.contactLink} onBlur={() => setTouched((x) => ({ ...x, contactLink: true }))} onChange={(e) => update('contactLink', e.target.value)} />
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">{t('order.fields.style')} <Badge required requiredLabel={requiredLabel} optionalLabel={optionalLabel} /></div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <ChoiceCard selected={form.commissionStyle === 'Chibi'} title="Chibi" description={t('order.styles.Chibi.desc')} meta={t('order.styles.Chibi.meta')} imageUrl={chibiSample?.imageUrl} imageWidth={chibiSample?.width} imageHeight={chibiSample?.height} onClick={() => update('commissionStyle', 'Chibi')} />
                          <ChoiceCard selected={form.commissionStyle === 'Anime'} title="Anime" description={t('order.styles.Anime.desc')} meta={t('order.styles.Anime.meta')} imageUrl={animeSample?.imageUrl} imageWidth={animeSample?.width} imageHeight={animeSample?.height} onClick={() => update('commissionStyle', 'Anime')} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">{t('order.fields.type')} <Badge required requiredLabel={requiredLabel} optionalLabel={optionalLabel} /></div>
                        <div className="flex flex-wrap gap-2">
                          {['Headshot', 'Bust Up', 'Half Body', 'Full Body', 'Emote', 'Character Sheet', 'Other'].map((item) => (
                            <ChoiceChip key={item} selected={form.type === item} title={item} onClick={() => update('type', item)} />
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label={t('order.fields.characterCount')} required error={fieldError('characterCount')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                          <input type="number" min="1" value={form.characterCount} onBlur={() => setTouched((x) => ({ ...x, characterCount: true }))} onChange={(e) => update('characterCount', e.target.value)} />
                        </Field>
                        <Field label={t('order.fields.deadline')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                          <select value={form.deadline} onChange={(e) => update('deadline', e.target.value)}>
                            <option value="Flexible">{t('order.deadlines.Flexible')}</option>
                            <option value="Specific date">{t('order.deadlines.Specific date')}</option>
                            <option value="Rush">{t('order.deadlines.Rush')}</option>
                          </select>
                        </Field>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">{t('order.fields.background')} <Badge required requiredLabel={requiredLabel} optionalLabel={optionalLabel} /></div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <ChoiceCard selected={form.background === 'None/simple'} title={t('order.backgrounds.simple')} description={t('order.backgrounds.simpleDesc')} onClick={() => update('background', 'None/simple')} />
                          <ChoiceCard selected={form.background === 'Complex'} title={t('order.backgrounds.complex')} description={t('order.backgrounds.complexDesc')} meta={t('order.backgrounds.complexMeta')} onClick={() => update('background', 'Complex')} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">{t('order.fields.usage')} <Badge required requiredLabel={requiredLabel} optionalLabel={optionalLabel} /></div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <ChoiceCard selected={form.usage === 'Personal'} title={t('order.usages.personal')} description={t('order.usages.personalDesc')} onClick={() => update('usage', 'Personal')} />
                          <ChoiceCard selected={form.usage === 'Commercial discussion needed'} title={t('order.usages.commercial')} description={t('order.usages.commercialDesc')} onClick={() => update('usage', 'Commercial discussion needed')} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-black text-lavender">{t('order.fields.paymentMethod')} <Badge required requiredLabel={requiredLabel} optionalLabel={optionalLabel} /></div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {(['Mandiri', 'Dana', 'PayPal', 'Other'] as const).map((item) => (
                            <ChoiceCard key={item} selected={form.paymentMethod === item} title={item} description={t(`order.payments.${item}`)} onClick={() => update('paymentMethod', item)} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={t('order.fields.characterDescription')} required error={fieldError('characterDescription')} help={t('order.helpers.description')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                        <textarea required value={form.characterDescription} onBlur={() => setTouched((x) => ({ ...x, characterDescription: true }))} onChange={(e) => update('characterDescription', e.target.value)} />
                      </Field>
                      <Field label={t('order.fields.lore')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                        <textarea value={form.lore} onChange={(e) => update('lore', e.target.value)} />
                      </Field>
                      <Field label={t('order.fields.design')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                        <textarea value={form.design} onChange={(e) => update('design', e.target.value)} />
                      </Field>
                      <Field label={t('order.fields.references')} help={t('order.helpers.references')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                        <textarea placeholder={t('order.helpers.referencesPlaceholder')} value={form.references} onChange={(e) => update('references', e.target.value)} />
                      </Field>
                      <Field label={t('order.fields.notes')} requiredLabel={requiredLabel} optionalLabel={optionalLabel}>
                        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} />
                      </Field>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                      <div className="space-y-4">
                        {!validation.valid ? (
                          <div className="rounded-3xl border border-rose/30 bg-rose/10 p-4">
                            <p className="font-black text-rose">{t('order.review.incompleteTitle')}</p>
                            <p className="mt-2 text-sm text-cream/75">{t('order.review.incompleteCount', { count: missingReview.length })}</p>
                            <ul className="mt-3 space-y-2">
                              {missingReview.map((err) => (
                                <li key={`${err.field}-${err.message}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                                  <span>{err.label}</span>
                                  <button type="button" className="btn btn-ghost px-3 py-1 text-xs" onClick={() => setStep(err.step - 1)}>
                                    {t('order.review.goToStep', { step: err.step })}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <SummaryGroup title={t('order.review.groups.client')}>
                              <SummaryRow label={t('order.fields.name')} value={form.name} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.fields.preferredContact')} value={form.preferredContact} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.review.rows.contact')} value={form.contactLink} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.fields.email')} value={form.email || t('common.notProvided')} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                            </SummaryGroup>
                            <SummaryGroup title={t('order.review.groups.commission')}>
                              <SummaryRow label={t('order.fields.style')} value={form.commissionStyle} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.fields.type')} value={form.type} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.fields.characterCount')} value={form.characterCount} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.fields.background')} value={form.background} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.fields.usage')} value={form.usage} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.review.rows.payment')} value={form.paymentMethod} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.review.rows.deadline')} value={form.deadline || t('common.flexible')} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                            </SummaryGroup>
                            <SummaryGroup title={t('order.review.groups.details')}>
                              <SummaryRow label={t('order.fields.characterDescription')} value={form.characterDescription} required missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.review.rows.personality')} value={form.lore || t('common.notProvided')} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.review.rows.design')} value={form.design || t('common.notProvided')} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.review.rows.notes')} value={form.notes || t('common.notProvided')} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                            </SummaryGroup>
                            <SummaryGroup title={t('order.review.groups.references')}>
                              <SummaryRow label={t('order.review.rows.referenceLinks')} value={form.references || t('common.notProvided')} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                              <SummaryRow label={t('order.review.rows.manualFiles')} value={t('order.review.rows.manualFilesValue')} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                            </SummaryGroup>
                            <SummaryGroup title={t('order.review.groups.estimate')}>
                              <SummaryRow label={t('order.review.rows.estimatedBase')} value={est.label} missingLabel={t('common.missingRequired')} notProvided={t('common.notProvided')} />
                            </SummaryGroup>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {submitState === 'mailto-opened' ? (
                          <OrderStatusBanner title={t('order.review.draftOpened')} detail={t('order.review.attachManual')} />
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
                              {t('order.review.agree')} <a href="#terms" className="text-lavender underline">{t('order.review.termsLink')}</a>.
                            </span>
                            <Badge required requiredLabel={requiredLabel} optionalLabel={optionalLabel} />
                          </span>
                        </label>
                        {fieldError('terms') ? <p className="text-sm font-bold text-rose">{fieldError('terms')}</p> : null}

                        {!validation.valid ? (
                          <button type="button" className="btn btn-primary w-full" onClick={jumpToFirstInvalid}>
                            {t('order.review.completeRequired')}
                          </button>
                        ) : (
                          <button type="button" className="btn btn-primary w-full" onClick={submitOrder}>
                            {t('order.review.openDraft')}
                          </button>
                        )}

                        <button type="button" className="btn btn-ghost w-full" onClick={() => navigator.clipboard.writeText(`${subject}\n\n${body}`)}>
                          {t('order.review.copySummary')}
                        </button>
                        <a className="btn btn-ghost w-full" href={mailtoUrl}>
                          {t('order.review.emailManually')}
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
                    {t('common.back')}
                  </button>
                  {step < 3 ? (
                    <button type="button" className="btn btn-primary" onClick={goNext}>
                      {t('common.next')}
                    </button>
                  ) : (
                    <span className="text-sm text-cream/45">{t('order.review.footerHint')}</span>
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
