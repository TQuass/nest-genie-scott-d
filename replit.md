# NestGenie — Project Overview

**App name:** NestGenie  
**Tagline:** AI family assistant — text it, it handles it  
**Stack:** Next.js 14 App Router + FastAPI (Python 3.12) monorepo  

---

## Project Structure

```
/
├── web/                    ← Next.js 14 frontend (port 5000)
│   ├── app/
│   │   ├── layout.tsx      ← Root layout with Providers (TanStack Query + Sonner)
│   │   ├── page.tsx        ← Landing page (/)
│   │   ├── (marketing)/    ← Public pages layout (centered, max-w-md)
│   │   │   ├── layout.tsx
│   │   │   └── sign-in/
│   │   │       ├── page.tsx        ← Phone entry (/sign-in)
│   │   │       └── verify/page.tsx ← OTP verify (/sign-in/verify)
│   │   └── (app)/          ← Authenticated pages layout (sidebar + mobile bottom nav)
│   │       ├── layout.tsx
│   │       ├── page.tsx            ← Dashboard (/app)
│   │       ├── settings/page.tsx   ← Settings hub
│   │       ├── onboarding/page.tsx ← Onboarding welcome
│   │       ├── briefings/page.tsx  ← Briefings list
│   │       ├── family/page.tsx     ← Family management
│   │       ├── calendar/page.tsx   ← Calendar (Google Calendar link)
│   │       └── outbound/page.tsx   ← Outbound message review
│   ├── components/
│   │   └── ui/             ← shadcn/ui-style components
│   │       ├── button.tsx, card.tsx, input.tsx, label.tsx
│   │       ├── badge.tsx, skeleton.tsx, alert.tsx
│   ├── lib/
│   │   ├── api.ts          ← apiClient (fetch wrapper with credentials)
│   │   ├── utils.ts        ← cn(), formatPhone(), maskPhone()
│   │   └── providers.tsx   ← QueryClientProvider + Toaster
│   ├── middleware.ts        ← Auth guard (redirects /app/* to /sign-in if no cookie)
│   ├── next.config.mjs     ← Rewrites /api/v1/* → localhost:8000
│   └── package.json        ← dev script: next dev -p 5000 -H 0.0.0.0
│
├── api/
│   └── main.py             ← FastAPI stub (port 8000) with health + auth routes
│
├── design-system/          ← Design tokens and component guidelines
├── docs/                   ← Pipeline docs
└── screen-specs/           ← Full screen spec (21 screens) in request.json
```

---

## Tech Stack (locked)

| Layer | Choice |
|-------|--------|
| **Frontend** | Next.js 14 App Router, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python 3.12), uvicorn |
| **Auth** | SMS OTP → JWT in httpOnly cookie |
| **AI** | AWS Bedrock (Claude Haiku/Sonnet/Opus) |
| **SMS** | Twilio A2P 10DLC |
| **Calendar** | Google Calendar OAuth v3 |
| **Components** | shadcn/ui primitives |
| **Forms** | react-hook-form + zod |
| **State** | TanStack Query |
| **Icons** | lucide-react |
| **Dates** | date-fns |
| **Toasts** | sonner |

---

## Running the App

- **Frontend workflow:** `cd web && npm run dev` (port 5000)
- **Backend (manual):** `cd api && uvicorn main:app --reload --port 8000`
- Frontend proxies `/api/v1/*` to `http://localhost:8000`

---

## Key Conventions

- Brand color: `#2E7D32` (green), light: `#C8E6C9`
- All API calls via `apiClient` in `lib/api.ts` with `credentials: 'include'`
- Phone numbers in E.164 format (`+15551234567`)
- Mobile-first, min-w-[360px]
- Medical flag: any briefing with `medical_flag: true` requires `<MedicalDisclaimerModal>`
- Outbound: always use confirm-before-send flow
- TCPA: verify `contact.tcpa_consent` before rendering send CTA

---

## Environment Variables

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend (`api/.env`):
```
DATABASE_URL=postgresql+asyncpg://...
AWS_REGION=us-east-1
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
JWT_SECRET=...
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
```

---

## What's Been Built (M0 scaffold)

- Landing page (/)
- Sign-in phone entry (/sign-in)
- OTP verify (/sign-in/verify)
- Dashboard shell (/app)
- Settings hub (/app/settings)
- Briefings list (/app/briefings)
- Family page (/app/family)
- Calendar page (/app/calendar)
- Outbound page (/app/outbound)
- Onboarding welcome (/app/onboarding)
- Auth middleware (cookie guard)
- FastAPI stub with health + auth endpoints
- All shadcn/ui primitive components
