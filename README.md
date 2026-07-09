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
RESEND_API_KEY=your_key_here
# or SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
```

The `/api/order` route validates the form, rate-limits submissions, uses a honeypot field, sends through Resend or SMTP when configured, and falls back to FormSubmit/mailto if provider config is unavailable.

## Deploy to Vercel
```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --yes --prod --prebuilt
```

## Legacy anchors
`#termsofservice`, `#form`, and `#pricelist` redirect to `#terms`, `#order`, and `#pricing`.
