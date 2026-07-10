import { listCmsOrders } from '@/lib/cms-orders';
import { envPresence, SITE_KEY } from '@/lib/server-env';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const env = envPresence();
  const orders = await listCmsOrders();
  return <main style={{fontFamily:'system-ui', padding:24, maxWidth:1100, margin:'0 auto'}}>
    <h1>RinnOZ Admin CMS</h1>
    <p>Site: <b>{SITE_KEY}</b></p>
    <h2>Health</h2>
    <ul>
      <li>Supabase URL: {String(env.supabaseUrl)}</li>
      <li>Supabase anon/publishable: {String(env.supabaseAnon)}</li>
      <li>Supabase secret/service: {String(env.supabaseSecret)}</li>
      <li>SMTP configured: {String(env.smtp)}</li>
      <li>Admin email configured: {String(env.adminEmail)}</li>
    </ul>
    <form action="/api/admin/email-test" method="post"><button type="submit">Send SMTP test</button></form>
    <h2>Recent Orders</h2>
    {!orders.ok ? <p>{orders.error}</p> : <table style={{width:'100%', borderCollapse:'collapse'}}><thead><tr><th align="left">Public ID</th><th align="left">Status</th><th align="left">Client</th><th align="left">Package</th><th align="left">Created</th></tr></thead><tbody>{orders.orders.map((o)=><tr key={o.id}><td>{o.public_id}</td><td>{o.status}</td><td>{o.client_name}</td><td>{o.package_slug}</td><td>{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table>}
  </main>;
}
