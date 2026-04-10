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

## Lessons Learned — Replit + Next.js Deployment Gotchas

> Keep this section for future Claude sessions on this project.

### 1. Backend workflow must be explicitly configured
Replit only runs ONE workflow by default. The FastAPI backend on port 8000 was never started, causing `ECONNREFUSED` on every API call. **Fix on day one:** add a second workflow (`cd api && uvicorn main:app --reload --host 0.0.0.0 --port 8000`, outputType `console`, waitForPort 8000).

### 2. Root `package.json` is required for deployment
When the frontend lives in a subdirectory (`web/`), the Replit deployment system looks for `package.json` at the repo root before running any custom build command. Without a root `package.json`, the build fails with "npm cannot find package.json". **Fix:** create a minimal root `package.json` whose `build` and `start` scripts delegate to the subdirectory (`cd web && npm ...`).

### 3. Deployment build/run commands must be set explicitly
Even when `.replit` has `[deployment]` values, the UI may show "No build command configured" on a fresh deploy. Always verify the commands are set with `deployConfig()` and confirm them in the `.replit` file before deploying.

### 4. ESLint blocks the production build
`next build` runs ESLint and TypeScript checks. Two patterns reliably fail:
- **Unescaped apostrophes in JSX text** — use `&apos;` (e.g. `family&apos;s`)
- **Empty interface declarations** — convert `interface Foo extends Bar {}` to `type Foo = Bar`
Run `npx next lint` locally before every deploy attempt.

### 5. `middleware.ts` encoding corruption
The middleware file developed invisible invalid UTF-8 bytes (likely from a copy-paste or prior edit tool issue). The symptom is a webpack "cannot read file" error at build time even though the file looks normal. **Fix:** delete the file and recreate it from scratch — do not copy-paste from the broken version.

### 6. Dev bypass must use `fetch` + `router.push`, not `<a href>` or server redirects
The Replit proxy (mTLS iframe) breaks server-side `redirect()` and standard `<a href>` navigation for auth flows. The dev OTP bypass must call `fetch("/api/dev-login")` and then use Next.js `router.push()` client-side.

### 7. `suppressHydrationWarning` is required on `<html>` with `next-themes`
Without it, the server renders without a theme class while the client adds `class="dark"`, causing a hydration mismatch warning. Always add `suppressHydrationWarning` to the root `<html>` tag when using `next-themes`.

### 8. CORS wildcard + `allow_credentials=False`
FastAPI CORS with `allow_origins=["*"]` **must** also set `allow_credentials=False` — using wildcard origins with credentials enabled is rejected by the browser. Since the Next.js proxy forwards API requests server-side, credentials on the backend CORS are unnecessary anyway.

---

## What's Been Built (all 21 screens + extras)

**Public / Marketing**
- Landing (/)
- Sign-in phone entry (/sign-in) — with dev bypass shortcuts panel
- OTP verify (/sign-in/verify)
- Privacy Policy (/privacy)
- Terms of Service (/terms) — covers ToS + EULA (no separate EULA needed for SaaS)
- SMS Terms (/sms-terms)

**Authenticated App**
- Dashboard (/app)
- Onboarding welcome (/app/onboarding) — Step 1 of 4
- Onboarding philosophy chips (/app/onboarding/philosophy) — Step 2 of 4
- Onboarding family profile (/app/onboarding/family) — Step 3 of 4
- Onboarding consent gate (/app/onboarding/consent) — Step 4 of 4
- Family list (/app/family) with Add child / Add contact CTAs
- Child profile form (/app/family/child/[childId]) — create & edit
- Contact form (/app/family/contact/[contactId]) — create & edit + TCPA toggle
- Briefings list (/app/briefings) with empty state
- Briefing detail (/app/briefings/[briefingId]) with MedicalDisclaimerModal
- Calendar (/app/calendar) with Google OAuth connect state
- Outbound list (/app/outbound) with status filter tabs
- Outbound detail (/app/outbound/[actionId]) with confirm/decline flow + timeline
- Settings hub (/app/settings)
- Settings → Connection (/app/settings/connection)
- Settings → Privacy & Data (/app/settings/privacy) — export + delete account
- Settings → Notifications (/app/settings/notifications) — SMS/email toggles
- Settings → Philosophy (/app/settings/philosophy) — chip editor

**Dev tools**
- `/api/dev-login?redirect=/app` — sets auth cookie, skips OTP, goes to dashboard
- `/api/dev-login?redirect=/app/onboarding` — sets auth cookie, skips OTP, goes to onboarding

**CRUD coverage**
- Children: List, Create (/family/child/new), View+Edit (/family/child/[id]), Delete with confirm
- Contacts: List, Create (/family/contact/new), View+Edit (/family/contact/[id]), Delete with confirm
- Briefings: List, View (/briefings/[id]), Delete with inline confirm (AI-generated, no create/edit by design)
- Outbound: List, View (/outbound/[id]), Approve + Decline (AI-generated, no create/edit by design)

**Infrastructure**
- Auth middleware (cookie guard on all /app/* routes)
- FastAPI stub (all routes stubbed for development)
- All shadcn/ui primitive components (Button, Card, Input, Label, Badge, Skeleton, Alert)
