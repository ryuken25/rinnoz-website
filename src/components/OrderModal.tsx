"use client";
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pricing, type StyleKey } from '@/content/pricing';
import { socialArtworks } from '@/content/socialArtworks';
import { discordUrl, instagramUrl, xUrl } from '@/content/socials';
import { formatFileSize } from '@/lib/formatFileSize';
import { buildMailtoUrl, buildOrderEmailBody, buildOrderSubject, getOrderEmailTo } from '@/lib/mailto';
import { ALLOWED_TYPES, MAX_FILE_SIZE, MAX_FILES, validateOrder } from '@/lib/orderValidation';
import type { OrderForm, OrderLang, PreferredContact } from '@/types/order';

type AttachmentItem = { id: string; file: File; previewUrl?: string };
type SubmitState = 'idle' | 'sending' | 'success' | 'mailto-opened' | 'mailto-fallback' | 'error';

const stepLabels = { en: ['Contact', 'Commission', 'References', 'Review'], id: ['Kontak', 'Komisi', 'Referensi', 'Review'] } as const;

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
      {help && <small className="helper block">{help}</small>}
      {error && <small className="block text-sm font-bold text-rose">{error}</small>}
    </label>
  );
}

function SummaryLine({ label, value, required }: { label: string; value: string; required?: boolean }) {
  const empty = !value.trim();
  if (!required && empty) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/8 py-2 text-sm">
      <span className="text-cream/55">{label}</span>
      {empty ? (
        <span className="rounded-full bg-rose/15 px-2 py-0.5 text-xs font-black uppercase tracking-[0.08em] text-rose">Missing required</span>
      ) : (
        <span className="max-w-[62%] text-right font-semibold text-cream/90">{value}</span>
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
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const est = estimate(form);
  const attachmentMeta = useMemo(() => attachments.map((a) => ({ name: a.file.name, size: a.file.size, type: a.file.type })), [attachments]);
  const validation = useMemo(() => validateOrder({ ...form, language: lang }, attachmentMeta, form.tos), [form, attachmentMeta, lang]);
  const samples = useMemo(
    () => socialArtworks.filter((a) => (form.commissionStyle === 'Chibi' ? a.tags.includes('Chibi') : a.tags.includes('Anime'))).slice(0, 4),
    [form.commissionStyle],
  );
  const subject = useMemo(() => buildOrderSubject({ ...form, language: lang }), [form, lang]);
  const body = useMemo(
    () => buildOrderEmailBody({ ...form, language: lang, source: form.source || (typeof location !== 'undefined' ? location.href : 'website') }, attachmentMeta, est.label),
    [form, lang, attachmentMeta, est.label],
  );
  const mailtoUrl = useMemo(() => buildMailtoUrl(getOrderEmailTo(), subject, body), [subject, body]);
  const emailRequired = form.preferredContact === 'Email';
  const hasAttachments = attachments.length > 0;

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
    const errs = validation.missingByStep[stepNo];
    if (errs.length) return 'incomplete';
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

  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
    };
  }, [attachments]);

  function onPickFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next: AttachmentItem[] = [];
    const errors: string[] = [];
    const combined = [...attachments.map((a) => a.file), ...Array.from(fileList)];
    if (combined.length > MAX_FILES) errors.push(`Max ${MAX_FILES} files.`);
    Array.from(fileList).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) errors.push(`${file.name}: unsupported type.`);
      if (file.size > MAX_FILE_SIZE) errors.push(`${file.name}: max 8 MB.`);
      else if (ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        });
      }
    });
    if (errors.length) {
      setStatus(errors.join(' '));
      setTouched((x) => ({ ...x, attachments: true }));
    }
    setDirty(true);
    setAttachments((prev) => [...prev, ...next].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
    setDirty(true);
  }

  async function submitOrder() {
    const result = validateOrder({ ...form, language: lang, source: location.href }, attachmentMeta, form.tos);
    if (!result.valid) {
      setTouched((x) => ({ ...x, ...Object.fromEntries(result.errors.map((e) => [e.field, true])) }));
      if (result.firstInvalidStep) setStep(result.firstInvalidStep - 1);
      setStatus(result.errors.map((e) => e.message).join(' '));
      setSubmitState('error');
      return;
    }

    setFallbackMessage('');
    if (!hasAttachments) {
      window.location.href = mailtoUrl;
      setSubmitState('mailto-opened');
      setStatus('Email draft opened with your order subject and body filled in.');
      setDirty(false);
      return;
    }

    setSubmitState('sending');
    setStatus('Sending order with attachments...');
    try {
      const payload = {
        ...form,
        language: lang,
        source: location.href,
        subject,
        body,
        mailtoUrl,
        tos: form.tos ? 'yes' : '',
        contactPlatform: form.preferredContact,
        contactHandle: form.contactLink,
        description: form.characterDescription,
      };
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      attachments.forEach((item) => formData.append('attachments', item.file, item.file.name));
      const res = await fetch('/api/order', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSubmitState('success');
        setStatus('Order sent successfully with attachments.');
        setDirty(false);
        return;
      }
      if (data.fallback === 'mailto' || data.mailtoUrl || data.mailto) {
        setFallbackMessage(data.reason || 'Your email app will open with the order summary. Please attach your uploaded reference files manually before sending.');
        window.location.href = data.mailtoUrl || data.mailto || mailtoUrl;
        setSubmitState('mailto-fallback');
        setStatus('Opened email draft fallback. Attach your files manually before sending.');
        return;
      }
      throw new Error(data.error || data.message || 'Submit failed');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Could not send attachments automatically.';
      setFallbackMessage(`${msg} Your email app will open with the order summary. Please attach your files manually.`);
      window.location.href = mailtoUrl;
      setSubmitState('mailto-fallback');
      setStatus('Opened email draft fallback. Attach your files manually before sending.');
    }
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
          className="fixed inset-0 z-[70] bg-ink/54 p-0 backdrop-blur-sm md:p-5 md:backdrop-blur-xl"
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
            className="mx-auto flex h-dvh max-w-7xl flex-col overflow-hidden border-white/15 bg-midnight shadow-atelier md:h-[92vh] md:rounded-[2.2rem] md:border"
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

            <div className="grid min-h-0 flex-1 overflow-auto lg:grid-cols-[390px_1fr]">
              <aside className="border-b border-white/10 bg-white/[.035] p-5 lg:border-b-0 lg:border-r">
                <p className="eyebrow">Live preview</p>
                <h3 className="mt-2 font-display text-4xl">Let’s plan your artwork</h3>
                <div className="mt-5 rounded-3xl border border-lavender/25 bg-lavender/10 p-4">
                  <p className="text-sm text-cream/62">Selected style</p>
                  <p className="font-display text-3xl">
                    {form.commissionStyle} / {form.type}
                  </p>
                  <p className="mt-1 text-sm text-cream/60">
                    {form.characterCount} character(s) • {form.background} background
                  </p>
                </div>
                <div className="mt-4 rounded-3xl border border-blush/25 bg-blush/10 p-4">
                  <p className="text-sm text-cream/62">Rough estimate</p>
                  <p className="font-display text-4xl">{est.label}</p>
                  <p className="text-xs text-cream/55">Final price confirmed by RinnOZ after review.</p>
                </div>
                <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="font-black text-lavender">Timeline</p>
                  <p className="text-sm text-cream/65">Typical timeline: 5–30 days. Rush request may add fee.</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {samples.map((s) => (
                    <Image key={s.id} src={s.imageUrl} alt={s.title} width={s.width} height={s.height} className="aspect-square rounded-2xl object-cover" />
                  ))}
                </div>
              </aside>

              <section className="flex min-h-0 flex-col p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {stepLabels[lang].map((label, i) => {
                      const state = stepStatus(i);
                      return (
                        <button
                          type="button"
                          key={label}
                          onClick={() => setStep(i)}
                          className={`step-dot ${state === 'current' ? 'active' : ''} ${state === 'incomplete' ? '!border-rose/50 !bg-rose/15 !text-rose' : ''} ${state === 'complete' ? '!border-mint/40 !bg-mint/15 !text-mint' : ''}`}
                          aria-label={label}
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

                <input name="website" value={form.website || ''} onChange={(e) => update('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                <div className="min-h-0 flex-1">
                  {step === 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Name / Handle" required error={fieldError('name')}>
                        <input required value={form.name} onBlur={() => setTouched((x) => ({ ...x, name: true }))} onChange={(e) => update('name', e.target.value)} />
                      </Field>
                      <Field label="Preferred Contact" required error={fieldError('preferredContact')}>
                        <select value={form.preferredContact} onChange={(e) => update('preferredContact', e.target.value as PreferredContact)}>
                          <option>Instagram</option>
                          <option>Discord</option>
                          <option>X</option>
                          <option>Email</option>
                          <option>Other</option>
                        </select>
                      </Field>
                      <Field label="Contact Username / Link" required error={fieldError('contactLink')} help={contactPlaceholder(form.preferredContact)}>
                        <input required placeholder={contactPlaceholder(form.preferredContact)} value={form.contactLink} onBlur={() => setTouched((x) => ({ ...x, contactLink: true }))} onChange={(e) => update('contactLink', e.target.value)} />
                      </Field>
                      <Field label="Email" required={emailRequired} error={fieldError('email')} help={emailRequired ? 'Required because preferred contact is Email.' : 'Optional unless preferred contact is Email.'}>
                        <input type="email" value={form.email} onBlur={() => setTouched((x) => ({ ...x, email: true }))} onChange={(e) => update('email', e.target.value)} />
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Style" required>
                        <select value={form.commissionStyle} onChange={(e) => update('commissionStyle', e.target.value)}>
                          <option>Chibi</option>
                          <option>Anime</option>
                          <option>Other</option>
                          <option>Discuss first</option>
                        </select>
                      </Field>
                      <Field label="Type / Crop" required>
                        <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                          <option>Headshot</option>
                          <option>Bust Up</option>
                          <option>Half Body</option>
                          <option>Full Body</option>
                          <option>Emote</option>
                          <option>Character Sheet</option>
                          <option>Other</option>
                        </select>
                      </Field>
                      <Field label="Character Count" required error={fieldError('characterCount')}>
                        <input type="number" min="1" value={form.characterCount} onBlur={() => setTouched((x) => ({ ...x, characterCount: true }))} onChange={(e) => update('characterCount', e.target.value)} />
                      </Field>
                      <Field label="Background" required>
                        <select value={form.background} onChange={(e) => update('background', e.target.value)}>
                          <option>None/simple</option>
                          <option>Complex</option>
                        </select>
                      </Field>
                      <Field label="Usage" required>
                        <select value={form.usage} onChange={(e) => update('usage', e.target.value)}>
                          <option>Personal</option>
                          <option>Commercial discussion needed</option>
                        </select>
                      </Field>
                      <Field label="Payment Method" required>
                        <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)}>
                          <option>Mandiri</option>
                          <option>Dana</option>
                          <option>PayPal</option>
                        </select>
                      </Field>
                      <Field label="Deadline / Rush">
                        <select value={form.deadline} onChange={(e) => update('deadline', e.target.value)}>
                          <option>Flexible</option>
                          <option>Specific date</option>
                          <option>Rush</option>
                        </select>
                      </Field>
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
                      <Field label="Design Enhancements / Accessories">
                        <textarea value={form.design} onChange={(e) => update('design', e.target.value)} />
                      </Field>
                      <Field label="Reference Links" help="Google Drive, Imgur, Toyhouse, Pinterest, direct links, or DM refs.">
                        <textarea value={form.references} onChange={(e) => update('references', e.target.value)} />
                      </Field>
                      <Field label="Reference image / file" help="Upload character references, moodboard, pose sketch, or sample images. Max 5 files. Note: email drafts can auto-fill subject/message, but browsers cannot attach files through mailto automatically." error={fieldError('attachments')}>
                        <input ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" onChange={(e) => onPickFiles(e.target.files)} className="block w-full rounded-2xl border border-white/12 bg-white/5 p-3 text-sm" />
                      </Field>
                      <Field label="Additional Notes">
                        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} />
                      </Field>
                      {attachments.length > 0 && (
                        <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
                          {attachments.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                              {item.previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.previewUrl} alt={item.file.name} className="h-14 w-14 rounded-xl object-cover" />
                              ) : (
                                <div className="grid h-14 w-14 place-items-center rounded-xl bg-ink/50 text-xs font-black text-lavender">PDF</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">{item.file.name}</p>
                                <p className="text-xs text-cream/55">{formatFileSize(item.file.size)}</p>
                              </div>
                              <button type="button" className="btn btn-ghost px-3 py-2 text-sm" onClick={() => removeAttachment(item.id)}>
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                      <div className="rounded-3xl border border-white/10 bg-ink/45 p-5">
                        {!validation.valid ? (
                          <div className="space-y-4">
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
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="mb-3 font-black text-lavender">Final summary</p>
                            <SummaryLine label="Name / Handle" value={form.name} required />
                            <SummaryLine label="Preferred Contact" value={form.preferredContact} required />
                            <SummaryLine label="Contact Username / Link" value={form.contactLink} required />
                            <SummaryLine label="Email" value={form.email || 'Not provided'} />
                            <SummaryLine label="Style" value={form.commissionStyle} required />
                            <SummaryLine label="Type / Crop" value={form.type} required />
                            <SummaryLine label="Character Count" value={form.characterCount} required />
                            <SummaryLine label="Background" value={form.background} required />
                            <SummaryLine label="Usage" value={form.usage} required />
                            <SummaryLine label="Payment Method" value={form.paymentMethod} required />
                            <SummaryLine label="Deadline / Rush" value={form.deadline || 'Not provided'} />
                            <SummaryLine label="Character Description" value={form.characterDescription} required />
                            <SummaryLine label="Personality / Lore / Story" value={form.lore || 'Not provided'} />
                            <SummaryLine label="Design / Accessories" value={form.design || 'Not provided'} />
                            <SummaryLine label="Reference Links" value={form.references || 'Not provided'} />
                            <SummaryLine label="Uploaded Files" value={attachments.length ? attachments.map((a) => a.file.name).join(', ') : 'No uploaded files'} />
                            <SummaryLine label="Estimate" value={est.label} />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
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
                          <span>
                            I agree to RinnOZ <a href="#terms" className="text-lavender underline">Terms of Service</a>.
                            <Badge required />
                          </span>
                        </label>
                        {fieldError('terms') && <p className="text-sm font-bold text-rose">{fieldError('terms')}</p>}

                        {!validation.valid ? (
                          <button type="button" className="btn btn-primary w-full" onClick={jumpToFirstInvalid}>
                            Complete Required Fields
                          </button>
                        ) : (
                          <button type="button" className="btn btn-primary w-full" onClick={submitOrder} disabled={submitState === 'sending'}>
                            {submitState === 'sending' ? 'Sending…' : hasAttachments ? 'Send Order with Attachments' : 'Open Email Draft'}
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
                </div>

                {(status || fallbackMessage) && (
                  <p className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-cream/75">
                    {status}
                    {fallbackMessage ? ` ${fallbackMessage}` : ''}
                  </p>
                )}

                <div className="mt-5 flex justify-between border-t border-white/10 pt-4">
                  <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                    ← Back
                  </button>
                  {step < 3 && (
                    <button type="button" className="btn btn-primary" onClick={goNext}>
                      Next →
                    </button>
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
