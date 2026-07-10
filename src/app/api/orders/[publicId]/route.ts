import { NextResponse } from 'next/server';
import { getPublicOrder } from '@/lib/cms-orders';

export async function GET(_: Request, { params }: { params: { publicId: string } }) {
  const order = await getPublicOrder(params.publicId);
  if (!order) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}
