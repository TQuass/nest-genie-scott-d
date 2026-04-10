# NestGenie — Component Inventory

**For:** Replit Agent / developer reference
All components use shadcn/ui unless noted. Install with `npx shadcn-ui@latest add <component>`.

---

## shadcn/ui components required (install all at setup)

```bash
npx shadcn-ui@latest add button card input label dialog select checkbox badge separator skeleton alert toast sonner form sheet tabs avatar dropdown-menu
```

---

## Custom components (build these)

### `<PhoneInput>`
- E.164-aware phone number input
- Props: `value: string, onChange: (e164: string) => void, error?: string`
- Auto-formats as user types (e.g. `(555) 555-5555` for display, stores `+15555555555`)
- Renders with `<Input>` from shadcn + inline E.164 validation error

### `<OtpInput>`
- 6-digit OTP entry
- Props: `value: string, onChange: (v: string) => void, onComplete?: (v: string) => void`
- Auto-advances focus between digit inputs
- Supports paste of full 6-digit code
- `inputmode="numeric"` + `autocomplete="one-time-code"`

### `<EmptyState>`
- Props: `icon: LucideIcon, title: string, subtitle?: string, smsNudge?: boolean`
- Renders icon in green circle + title + optional SMS nudge copy
- Used on every list screen when data array is empty

### `<MedicalDisclaimerModal>`
- Dialog that blocks reading a medical-flagged briefing until parent acknowledges
- Props: `open: boolean, onAcknowledge: () => void, pediatricianName?: string`
- Renders: explanation of three-level guardrail + "Draft a message to {pediatricianName}" CTA + "I understand" button
- CTA fires `POST /api/v1/outbound/draft` with `{ type: "pediatrician_referral" }`

### `<ConfirmSendSheet>`
- Bottom sheet (mobile) / dialog (desktop) for confirm-before-send outbound
- Props: `actionId: string, draft: string, recipientName: string, onConfirm: () => void, onDecline: () => void`
- Shows draft text + recipient + "Send" / "Edit" / "Don't send" buttons
- Fires `POST /api/v1/outbound/confirm/{actionId}` on confirm

### `<ConsentBanner>`
- Full-screen consent gate rendered inside onboarding consent step
- Shows privacy policy summary + MHMDA acknowledgment checkbox + "I understand" CTA
- Blocks navigation until `family.consent_given === true`
- On submit: `PATCH /api/v1/families/{familyId}` with `{ consent_given: true, consent_at: new Date().toISOString() }`

### `<ContactConsentFlow>`
- Step flow for capturing TCPA consent for a third-party contact before sending
- Props: `contactId: string, onComplete: () => void`
- Step 1: explain what consent means
- Step 2: "Do you have permission from [name] to send them messages from NestGenie?"
- On yes: `PATCH /api/v1/contacts/{contactId}` with `{ tcpa_consent: true, consent_at: ... }`

### `<BriefingCard>`
- Card for briefings list view
- Props: `briefing: Briefing`
- Shows: date, first 120 chars of content, medical_flag badge if true, delivery channel chip

### `<OutboundActionRow>`
- Row for outbound audit log
- Props: `action: OutboundAction`
- Shows: status badge, recipient name, draft preview (40 chars), timestamps (queued → confirmed → sent)
- Click → navigate to `/app/outbound/{action.id}`

### `<FamilyMemberCard>`
- Card for family list
- Props: `child?: Child, contact?: Contact`
- Child card: name, age (computed from DOB), allergies badges
- Contact card: name, relationship, phone, TCPA consent indicator

### `<ChildProfileForm>`
- Form for child create/edit
- Fields: name (text), DOB (date), notes (textarea), allergies (tag input), school (text), routines (textarea)
- Zod schema validates: name required, DOB valid past date

### `<CalendarConnectionCard>`
- Shows Google Calendar connection status
- States: disconnected (Connect button), connecting (loading), connected (last sync time + Disconnect CTA)
- Connect: redirect to `GET /api/v1/calendar/auth` which returns Google OAuth URL

---

## Shared layouts

### `<PageHeader>`
- Props: `title: string, description?: string, action?: ReactNode`
- Renders `<h1>` + optional subtitle + optional right-side action button
- Used at top of every `(app)` page

```tsx
<PageHeader
  title="Family"
  description="Manage your household members and contacts"
  action={<Button size="sm">Add child</Button>}
/>
```

### `<LoadingPage>`
- Full-page skeleton for route-level loading
- Shows `<PageHeader>` skeleton + 3× card skeletons

### `<ErrorPage>`
- Props: `message?: string, retry?: () => void`
- Shows `<Alert variant="destructive">` + optional retry button

---

## Form field patterns (react-hook-form + zod)

```tsx
// Standard field pattern
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input placeholder="..." {...field} />
      </FormControl>
      <FormMessage /> {/* shows zod error */}
    </FormItem>
  )}
/>
```

All forms: `<Form>` wrapper, `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })`.

---

## Page-level data fetching pattern

```tsx
// In any (app) page component
const { data, isLoading, error } = useQuery({
  queryKey: ['briefings', familyId],
  queryFn: () => apiClient.get<Briefing[]>(`/families/${familyId}/briefings`),
});

if (isLoading) return <LoadingPage />;
if (error) return <ErrorPage message="Couldn't load briefings" />;
if (!data?.length) return <EmptyState icon={FileText} title="No briefings yet" smsNudge />;

return <BriefingsList briefings={data} />;
```

---

## Accessibility checklist (per screen)

- [ ] All `<Input>` have associated `<Label>` (via `htmlFor` or `<FormLabel>`)
- [ ] All `<Dialog>` / `<Sheet>` trap focus and close on ESC
- [ ] Error messages use `role="alert"` (shadcn `<FormMessage>` handles this)
- [ ] Icon-only buttons have `aria-label`
- [ ] Color is not the only indicator (badges have text, not just color)
- [ ] OTP input has `autocomplete="one-time-code"`
- [ ] WCAG AA contrast: `text-gray-900` on `bg-white` and `bg-gray-50` ✓
