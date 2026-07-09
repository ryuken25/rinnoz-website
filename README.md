# RinnOZ Art Commission Website

Premium one-page Next.js rebuild for Rinnozuki / RinnOZ commission website.

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Email environment
```env
ORDER_EMAIL_TO=takayuki.rinnozuki@gmail.com
ORDER_EMAIL_FROM=commissions@yourdomain.com
RESEND_API_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Order flow
- Step form with clear **Required / Optional** badges
- No attachments → frontend opens `mailto:` draft with subject + body filled
- With attachments → `POST /api/order` as `multipart/form-data`
- If Resend/SMTP is not configured, API returns mailto fallback and asks client to attach files manually
- Validation + rate-limit + honeypot on `/api/order`

## Deploy to Vercel
```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --yes --prod --prebuilt
```

## Legacy anchors
`#termsofservice`, `#form`, and `#pricelist` redirect to `#terms`, `#order`, and `#pricing`.
