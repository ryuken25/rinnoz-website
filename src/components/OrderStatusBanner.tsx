export function OrderStatusBanner({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="order-status-banner rounded-2xl border border-pink-200/20 bg-pink-200/10 px-4 py-3 text-sm leading-6 text-pink-50">
      <p className="font-black">{title}</p>
      {detail ? <p className="mt-1 text-pink-50/75">{detail}</p> : null}
    </div>
  );
}
