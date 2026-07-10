import { NextResponse } from 'next/server';
import { createCmsOrder, listCmsOrders } from '@/lib/cms-orders';
import { sendTransactionalEmail, orderEmailText } from '@/lib/mailer';
import { ADMIN_EMAIL } from '@/lib/server-env';

export async function GET() {
  const data = await listCmsOrders();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload || payload.website || payload.trap) return NextResponse.json({ ok: true });
  const result = await createCmsOrder(payload);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  if (result.persisted && result.order) {
    const text = orderEmailText(result.order.public_id);
    if (ADMIN_EMAIL) await sendTransactionalEmail({ orderId: result.order.id, type: 'order_created_creator', to: ADMIN_EMAIL, subject: `New order — ${result.order.public_id}`, text });
  }
  return NextResponse.json(result, { status: result.persisted ? 201 : 202 });
}
