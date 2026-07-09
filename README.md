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
- Visual choice cards for contact / style / crop / background / payment
- Submit opens a prefilled email draft using `mailto:`
- `mailto:` can fill recipient, subject, and body

### Reference file upload status

Reference file upload is temporarily disabled.

The order form currently opens a prefilled email draft using `mailto:`. `mailto:` can fill recipient, subject, and body, but cannot attach files uploaded in the browser.

For now, clients should paste reference links in the form or attach files manually in their email app.

To re-enable direct attachment sending later, configure Resend or SMTP in Vercel environment variables.

## Deploy to Vercel
```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --yes --prod --prebuilt
```

## Legacy anchors
`#termsofservice`, `#form`, and `#pricelist` redirect to `#terms`, `#order`, and `#pricing`.
