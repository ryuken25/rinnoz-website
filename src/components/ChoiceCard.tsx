"use client";
import Image from 'next/image';

type ChoiceCardProps = {
  selected?: boolean;
  title: string;
  description?: string;
  meta?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  onClick: () => void;
  className?: string;
};

export function ChoiceCard({
  selected,
  title,
  description,
  meta,
  imageUrl,
  imageWidth = 640,
  imageHeight = 640,
  onClick,
  className = '',
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group overflow-hidden rounded-[1.35rem] border text-left transition ${
        selected
          ? 'border-lavender/70 bg-lavender/12 shadow-[0_0_28px_rgba(216,198,255,.18)]'
          : 'border-white/12 bg-white/[.04] hover:border-white/25 hover:bg-white/[.07]'
      } ${className}`}
    >
      {imageUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-ink/40">
          <Image
            src={imageUrl}
            alt={title}
            width={imageWidth}
            height={imageHeight}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="space-y-1 p-3.5">
        <p className="font-black text-cream">{title}</p>
        {description ? <p className="text-sm leading-5 text-cream/62">{description}</p> : null}
        {meta ? <p className="text-xs font-bold uppercase tracking-[.08em] text-lavender">{meta}</p> : null}
      </div>
    </button>
  );
}

export function ChoiceChip({
  selected,
  title,
  onClick,
}: {
  selected?: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
        selected
          ? 'border-blush/50 bg-blush/15 text-blush shadow-[0_0_18px_rgba(255,158,216,.18)]'
          : 'border-white/12 bg-white/[.04] text-cream/75 hover:border-white/25 hover:text-cream'
      }`}
    >
      {title}
    </button>
  );
}
