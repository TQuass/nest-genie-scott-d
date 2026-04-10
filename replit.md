# NestGenie — Replit Agent Rules

> Paste this file into Replit Agent as the first message, or commit it to the repo root before starting any Agent session.

---

## Project identity

- **App name:** NestGenie
- **Tagline:** AI family assistant — text it, it handles it
- **Primary use:** Parents interact over **SMS**. The web app is a thin companion (onboarding, calendar link, briefing history, outbound audit, privacy controls). It is **not** the primary UX surface.
- **Client:** Scott DeSimone (sole stakeholder)
- **Prepared by:** AppsTango

---

## Tech stack (locked — do not change without discussion)

| Layer | Choice |
|-------|--------|
| **API** | FastAPI (Python 3.12), async, ECS Fargate |
| **Web** | Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| **Database** | PostgreSQL (Aurora Serverless v2 + pgvector) |
| **Auth** | SMS OTP → JWT in httpOnly cookie — **no NextAuth, no passwords, no magic links** |
| **AI** | AWS Bedrock cascade: Haiku (classify) → Sonnet (reason) → Opus (high-stakes) |
| **Embeddings** | AWS Titan Embeddings via Bedrock |
| **SMS** | Twilio (A2P 10DLC) |
| **Email** | AWS SES (transactional only) |
| **Calendar** | Google Calendar OAuth v3 (read + write, primary calendar only) |
| **Infra** | AWS CDK, ECR, ECS Fargate, Secrets Manager, CloudWatch |
| **Component library** | shadcn/ui — import components from `@/components/ui/*` |
| **Form library** | react-hook-form + zod for all forms |
| **State / fetching** | TanStack Query (`@tanstack/react-query`) — **no Redux, no Zustand** |
| **Date handling** | date-fns (no Moment, no Day.js) |
| **Icons** | lucide-react |

---

## Route conventions (Next.js App Router)

```
app/
  (marketing)/              ← public, unauthenticated pages
    page.tsx                → / (landing)
    sign-in/
      page.tsx              → /sign-in (phone entry)
      verify/
        page.tsx            → /sign-in/verify (OTP entry)
  (app)/                    ← authenticated parent pages (middleware guards)
    layout.tsx              ← authenticated shell: sidebar nav + topbar
    page.tsx                → /app (dashboard)
    settings/
      page.tsx              → /app/settings
      connection/page.tsx
      privacy/page.tsx
      notifications/page.tsx
      philosophy/page.tsx
    onboarding/
      page.tsx              → /app/onboarding
      philosophy/page.tsx
      family/page.tsx
      consent/page.tsx
    family/
      page.tsx              → /app/family
      child/[childId]/page.tsx
      contact/[contactId]/page.tsx
    briefings/
      page.tsx              → /app/briefings
      [briefingId]/page.tsx
    calendar/page.tsx       → /app/calendar
    outbound/
      page.tsx              → /app/outbound
      [actionId]/page.tsx
    billing/                ← CB add-on only
      page.tsx
      plans/page.tsx
      cancel/page.tsx
```

---

## API base URL and client

- Dev: `http://localhost:8000`
- All API calls go through a TanStack Query wrapper in `lib/api.ts`
- Auth header: JWT is in an httpOnly cookie — the browser sends it automatically. Do **not** put the JWT in localStorage or Authorization header.
- All API routes are prefixed `/api/v1/`

```typescript
// lib/api.ts — do not break this pattern
export const apiClient = {
  get: <T>(path: string) => fetch(`/api/v1${path}`, { credentials: 'include' }).then(r => r.json() as T),
  post: <T>(path: string, body: unknown) =>
    fetch(`/api/v1${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) }).then(r => r.json() as T),
  patch: <T>(path: string, body: unknown) =>
    fetch(`/api/v1${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) }).then(r => r.json() as T),
  delete: (path: string) => fetch(`/api/v1${path}`, { method: 'DELETE', credentials: 'include' }),
};
```

---

## Auth flow rules

1. `/sign-in` — collect phone in E.164 format → `POST /api/v1/auth/request-otp`
2. `/sign-in/verify` — collect 6-digit code → `POST /api/v1/auth/verify-otp` → server sets httpOnly cookie
3. Middleware at `middleware.ts` checks the cookie on every `(app)/*` route. Unauthenticated → redirect to `/sign-in`
4. First-time users (no family record) → redirect to `/app/onboarding`
5. Logout: `POST /api/v1/auth/logout` → clears cookie

---

## Component and styling rules

- Use **shadcn/ui** primitives: `Button`, `Card`, `Input`, `Label`, `Dialog`, `Select`, `Checkbox`, `Badge`, `Separator`, `Skeleton`, `Toast/Sonner`
- Use **Tailwind** utility classes only — no CSS modules, no styled-components
- Mobile-first: every screen must render cleanly at `min-w-[360px]`
- Tap targets minimum 48px height/width
- Empty states: every list page has `<EmptyState>` with SMS nudge copy ("Text NestGenie at +1 555 555 5555 to get started")
- Loading states: use `<Skeleton>` from shadcn/ui — never a raw spinner
- Error states: use `<Alert variant="destructive">` from shadcn/ui
- Toast notifications: use sonner (`import { toast } from 'sonner'`) — success/error/info only; no custom toast implementations

---

## Data / form conventions

- All forms: react-hook-form + zod schema
- Phone numbers: always store and display in E.164 (`+15551234567`); use a formatting helper for display
- Dates: UTC ISO strings from API; convert to local timezone for display using date-fns `formatInTimeZone`
- Pagination: cursor-based (`?cursor=<id>&limit=20`) — no offset pagination
- Optimistic updates: use TanStack Query `useMutation` with `onMutate` + `onError` rollback for all write operations

---

## Medical / compliance rules (NEVER remove or bypass these)

- Any briefing or message that contains `medical_flag: true` from the API **must** render the `<MedicalDisclaimerModal>` component before showing the full content
- The confirm-before-send outbound flow is **mandatory** — every AI-drafted message to a third-party contact must go through `POST /api/v1/outbound/confirm/{actionId}` before `POST /api/v1/outbound/send/{actionId}`
- TCPA contact consent check: before rendering the "Send to contact" CTA, verify `contact.tcpa_consent === true`. If false, render the contact consent flow (redirect to `/app/family/contact/{contactId}?tcpa=1`)
- Privacy consent must be verified on every `(app)` page: if `family.consent_given !== true`, redirect to `/app/onboarding/consent`

---

## Environment variables (never hardcode these)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=<not used — we use custom JWT>
```

Backend `.env` (FastAPI):
```
DATABASE_URL=postgresql+asyncpg://...
AWS_REGION=us-east-1
BEDROCK_MODEL_HAIKU=anthropic.claude-haiku-...
BEDROCK_MODEL_SONNET=anthropic.claude-sonnet-...
BEDROCK_MODEL_OPUS=anthropic.claude-3-opus-...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
SES_FROM_EMAIL=noreply@nestgenie.com
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
JWT_SECRET=...
```

---

## What to build first (suggested order)

1. Repo scaffold: Next.js 14 app + FastAPI app in monorepo (`/web`, `/api`)
2. Shared: `middleware.ts` (auth guard), `lib/api.ts` (API client), `components/ui/` (shadcn setup)
3. M0 screens: Landing (`/`), Sign-in phone (`/sign-in`), Sign-in verify (`/sign-in/verify`), Dashboard shell (`/app`), Settings shell (`/app/settings`)
4. API stubs: `GET /api/v1/health`, `POST /api/v1/auth/request-otp`, `POST /api/v1/auth/verify-otp`, `POST /api/v1/auth/logout`
5. DB schema: Alembic migrations for `families`, `parents`, `children`, `contacts`, `conversations`, `messages`
6. Then proceed milestone-by-milestone per the TaskCrafter storyboard (`nestgenie-taskcrafter-phase4.xlsx`)

---

## Do not build (MVP out-of-scope)

- Native iOS or Android apps
- Push notifications (FCM/APNS)
- Admin console UI
- Voice channel (Alexa, Google Home)
- Apple Calendar or Outlook Calendar
- Multi-parent family access
- Dark mode
- Consumer billing UI (separate CB add-on sprint)
- Corpus management UI
