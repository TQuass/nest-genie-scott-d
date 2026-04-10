# NestGenie — Design System Guide

**For:** Replit Agent / developer reference
**Framework:** Next.js 14 + Tailwind CSS + shadcn/ui

---

## Brand identity

NestGenie is a **trusted household assistant** — warm, capable, and calm. Parents use it in moments of chaos (sick kid at 3am, forgotten permission slip, day-of schedule change). The UI should feel like a reliable, organized friend: never overwhelming, never alarming, always clear.

**Not:** flashy, playful, corporate, medical/clinical, or gamified.

---

## Color palette

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| `--brand` | `#2E7D32` | `text-green-800` / `bg-green-800` | Primary action buttons, active nav, links |
| `--brand-light` | `#C8E6C9` | `bg-green-100` | Backgrounds, chips, badges |
| `--brand-dark` | `#1B5E20` | `text-green-900` | Hover states, focus rings |
| `--surface` | `#FFFFFF` | `bg-white` | Card backgrounds |
| `--surface-muted` | `#F8F9FA` | `bg-gray-50` | Page background, alternating rows |
| `--border` | `#E0E0E0` | `border-gray-200` | Card borders, dividers |
| `--text-primary` | `#1A1A1A` | `text-gray-900` | Body text, headings |
| `--text-secondary` | `#5F6368` | `text-gray-500` | Captions, metadata, placeholder text |
| `--success` | `#2E7D32` | `text-green-700` | Confirmation toasts, sent indicators |
| `--warning` | `#F59E0B` | `text-amber-500` | Pending approvals, queue states |
| `--error` | `#DC2626` | `text-red-600` | Validation errors, destructive actions |
| `--medical` | `#7C3AED` | `text-violet-700` | Medical-flagged content indicator |

### Usage rules
- Primary buttons: `bg-green-800 text-white hover:bg-green-900`
- Secondary buttons: `border border-green-800 text-green-800 hover:bg-green-50`
- Destructive buttons: `bg-red-600 text-white hover:bg-red-700`
- Ghost/link buttons: `text-green-800 underline-offset-4 hover:underline`
- Medical flag: always use violet (`text-violet-700`) to distinguish from brand green

---

## Typography

| Role | Font | Tailwind | Notes |
|------|------|----------|-------|
| Display / hero | Geist Sans (Next.js default) | `text-3xl font-bold` | Landing page only |
| Page heading | Geist Sans | `text-2xl font-semibold` | `<h1>` per page |
| Section heading | Geist Sans | `text-lg font-medium` | Card titles, section headers |
| Body | Geist Sans | `text-sm` (14px) | Default paragraph, list items |
| Caption / metadata | Geist Sans | `text-xs text-gray-500` | Timestamps, sub-labels |
| Monospace / code | Geist Mono | `font-mono text-sm` | Phone numbers, JWT debug, OTP display |

**Line heights:** `leading-relaxed` for body paragraphs; `leading-tight` for headings and chips.

---

## Spacing

Use the Tailwind 4px grid throughout:
- `gap-2` (8px) between inline items
- `gap-4` (16px) between form fields
- `gap-6` (24px) between sections within a card
- `gap-8` (32px) between cards on a page
- Card padding: `p-6`
- Page padding: `px-4 py-6 md:px-6 md:py-8`

---

## Layout

### (marketing) layout — public pages

```
<body class="min-h-screen bg-gray-50">
  <header class="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
    <!-- NestGenie logo + "Sign in" link -->
  </header>
  <main class="max-w-md mx-auto px-4 py-12">
    {children}
  </main>
</body>
```

Single centered column, max-width 448px — mobile form factor.

### (app) layout — authenticated pages

```
<body class="min-h-screen bg-gray-50">
  <aside class="hidden md:flex w-56 flex-col bg-white border-r border-gray-200">
    <!-- Desktop sidebar nav -->
  </aside>
  <div class="flex flex-col flex-1">
    <header class="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center">
      <!-- Mobile hamburger + "NestGenie" wordmark + avatar -->
    </header>
    <main class="flex-1 px-4 py-6 md:px-6 md:py-8 max-w-3xl mx-auto w-full">
      {children}
    </main>
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex items-center justify-around h-14">
      <!-- Mobile bottom nav: Home, Family, Briefings, Calendar, Settings -->
    </nav>
  </div>
</body>
```

---

## Navigation items (app)

| Label | Icon (lucide) | Route | Active when |
|-------|---------------|-------|-------------|
| Home | `Home` | `/app` | `/app` exact |
| Family | `Users` | `/app/family` | `/app/family*` |
| Briefings | `FileText` | `/app/briefings` | `/app/briefings*` |
| Calendar | `Calendar` | `/app/calendar` | `/app/calendar*` |
| Settings | `Settings` | `/app/settings` | `/app/settings*` |

Active state: `bg-green-50 text-green-800 font-medium` on sidebar item; `text-green-800` on bottom nav icon.

---

## Component patterns

### Card

```tsx
<Card className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
  <CardHeader className="pb-4">
    <CardTitle className="text-lg font-medium">Title</CardTitle>
    <CardDescription className="text-sm text-gray-500">Subtitle</CardDescription>
  </CardHeader>
  <CardContent>{children}</CardContent>
</Card>
```

### Status badge

| State | Tailwind | Usage |
|-------|----------|-------|
| Sent | `bg-green-100 text-green-800` | Outbound sent |
| Pending | `bg-amber-100 text-amber-800` | Awaiting confirm |
| Declined | `bg-gray-100 text-gray-500` | Parent declined send |
| Error | `bg-red-100 text-red-700` | Failed send |
| Medical | `bg-violet-100 text-violet-700` | Medical-flagged briefing |

```tsx
<Badge className="bg-green-100 text-green-800 text-xs font-medium rounded-full px-2.5 py-0.5">
  Sent
</Badge>
```

### Empty state

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center gap-4">
  <div className="rounded-full bg-green-50 p-4">
    <Icon className="h-8 w-8 text-green-600" />
  </div>
  <div>
    <p className="text-sm font-medium text-gray-900">No {items} yet</p>
    <p className="text-sm text-gray-500 mt-1">
      Text NestGenie at <span className="font-mono">+1 555 555 5555</span> to get started.
    </p>
  </div>
</div>
```

### Loading skeleton

```tsx
<div className="flex flex-col gap-3">
  <Skeleton className="h-5 w-full rounded" />
  <Skeleton className="h-5 w-3/4 rounded" />
  <Skeleton className="h-5 w-1/2 rounded" />
</div>
```

### Toast usage

```typescript
import { toast } from 'sonner';
toast.success('Message sent to caregiver');
toast.error('Could not send — please try again');
toast('Waiting for your confirmation…', { icon: '⏳' });
```

---

## Medical flag indicator

Whenever `briefing.medical_flag === true` or `message.intent_label === 'medical'`:

```tsx
<div className="flex items-center gap-1.5 text-xs text-violet-700 font-medium">
  <AlertTriangle className="h-3.5 w-3.5" />
  Medical guardrail applied
</div>
```

And show `<MedicalDisclaimerModal>` before displaying full content.

---

## Tone (copy rules)

- **Address the parent as "you"** — never "the parent" or "the user"
- **Confirm actions positively** — "Message sent to Dr. Chen" not "Action completed"
- **SMS nudge copy** — always mention the phone number in monospace: `Text NestGenie at +1 555 555 5555`
- **Error messages** — blame the system, not the user: "We couldn't send that message" not "You entered an invalid number"
- **Compliance copy** — plain English: "NestGenie stores your family info and uses it to answer your questions" — not legal boilerplate
- **Medical copy** — warm, non-alarming: "For medical questions, I'll always suggest you check with your pediatrician" — not "I am not a medical professional and cannot provide medical advice"
