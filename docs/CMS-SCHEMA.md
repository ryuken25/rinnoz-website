# RinnOZ CMS Schema

Migration: `supabase/migrations/20260710_admin_cms_orders_v1.sql`

Tables:
- `site_settings`
- `packages`
- `story_steps`
- `images`
- `order_requests`
- `order_events`
- `email_events`

Security model:
- RLS enabled on all tables.
- No anonymous direct table policies.
- Browser uses Next.js API routes only.
- Service role/secret key stays server-side.
- Public order endpoint returns sanitized status only.
