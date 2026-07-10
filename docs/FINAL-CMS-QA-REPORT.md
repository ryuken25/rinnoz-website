# Rinnoz CMS + SMTP + Mobile QA Final Report

## Production
- URL: https://rinnoz.vercel.app
- Git commit: `9039d24`
- Vercel project: `rinnoz`

## Implemented
- Supabase-backed CMS/order persistence.
- Admin dashboard at `/admin`.
- Health endpoint at `/api/health`.
- Orders API at `/api/orders` and public lookup at `/api/orders/[publicId]`.
- Legacy/public order route wired to CMS persistence.
- SMTP transactional mailer with email event logging.
- Password reset email endpoint at `/api/auth/reset-password`.
- Mobile/story/image overflow hardening.

## Verified
| Check | Result |
|---|---:|
| Local build | PASS |
| Vercel prebuilt production deploy | PASS |
| Production `/` | 200 |
| Production `/admin` | 200 |
| Production `/api/health` | 200 |
| Production `/api/orders` | 200 |
| Production health env | Supabase true, SMTP true, adminEmail true |
| Production viewport matrix | 45/45 PASS |
| Production order smoke | persisted true |
| Production creator email | `email_events.status = sent` |

## Production Smoke Evidence
- Health gitSha: `9039d241bb134e372f73a5f317cafe317f2ccfe2`
- Prod smoke order: `rinnoz-03cbc230d5`
- Email type: `order_created_creator`
- Email status: `sent`

## Notes
- Supabase URL secret contains `/rest/v1/`; code normalizes it before using Supabase JS.
- Vercel env variables synced for production.
- Security grep found env variable names only, no literal secrets committed.
