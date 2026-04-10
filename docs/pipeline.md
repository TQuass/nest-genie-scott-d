# NestGenie — Build + Design Pipeline

**Scope:** AppsTango scope output → GitHub → Replit Agent → GitHub → Figma → GitHub → Developer
**Figma mode:** Export-first (screenshots → frames), then Code Connect sync (Phase 7)
**End developer:** Cursor AI first pass, human reviews and merges PRs

---

## Pipeline overview

```
AppsTango scope output
        ↓
  [Stage 1] GitHub repo setup
        ↓
  [Stage 2] GitHub → Replit Agent (build screens)
        ↓
  [Stage 3] Replit → GitHub (code PR)
        ↓
  [Stage 4] Screenshot capture → Figma import
        ↓
  [Stage 5] Designer polishes in Figma
        ↓
  [Stage 6] Figma → Cursor (Figma MCP) → GitHub PR
        ↓
  [Stage 7] Human reviews + merges → deployed app
        ↓
  [Phase 7 follow-on] Figma Code Connect sync
```

---

## Stage 1 — GitHub repo setup

**Goal:** Create the NestGenie monorepo on GitHub with the handoff files already in place so Replit can see them immediately on connect.

**Repo structure:**
```
nestgenie/
  replit.md                         ← Agent rules (from phase-6/)
  design-system/
    guide.md                        ← Palette, typography, layout
    components.md                   ← Component inventory
  screen-specs/
    request.json                    ← 21 screens, API routes, export specs
  web/                              ← Next.js 14 App (created by Replit Agent)
  api/                              ← FastAPI (created by Replit Agent)
  scripts/
    capture-screens.ts              ← Playwright screenshot script (we build)
    upload-to-figma.ts              ← Figma REST upload script (we build)
  .github/
    CODEOWNERS                      ← Protect main; require review
    pull_request_template.md
  .gitignore
  README.md
```

**Branch model:**
| Branch | Purpose | Protection |
|--------|---------|-----------|
| `main` | Production-ready, deployed | Require PR + review; no direct push |
| `develop` | Integration branch | Require PR |
| `replit/screens` | Replit Agent output | Open PR → develop when screens are done |
| `cursor/design-{N}` | Cursor AI design updates from Figma | Open PR → develop |
| `feature/*` | Human developer feature work | Open PR → develop |

**Do now:**
1. Create GitHub repo: `appstango/nestgenie` (private)
2. Push `phase-6/` files to repo root
3. Set branch protection on `main` (require 1 review, no force push)
4. Add `CODEOWNERS`: AppsTango account owns `/api`, `/web`, `/scripts`

---

## Stage 2 — GitHub → Replit Agent

**Goal:** Connect Replit to the GitHub repo so Agent can read the handoff files and start building.

**Steps:**
1. Create a new Replit project — "Import from GitHub" → point to `appstango/nestgenie`
2. Replit will clone the repo; `replit.md` is now visible in the project root
3. Open Replit Agent chat
4. Paste the `agent_kickoff_message` from `screen-specs/request.json` (the last key in the JSON)
5. Agent reads `replit.md` → `design-system/guide.md` → `design-system/components.md` → `screen-specs/request.json`
6. Agent builds milestone-by-milestone; we watch M0 screens first (Landing, Sign-in, Dashboard)

**What Replit Agent produces:**
- `web/` — Next.js 14 scaffold with all 21 screens stubbed out
- `api/` — FastAPI stub with health endpoint + auth endpoints
- Alembic migrations for core tables
- Tailwind + shadcn/ui installed and configured
- Per-screen components and routes matching `screen-specs/request.json`

**Replit provides:** a live preview URL, e.g. `https://nestgenie-abc123.replit.app`

**Tip:** Break the Agent session into milestone sprints. Ask for M0 screens, review, then continue to M1, etc. Replit Agent context degrades on very long sessions.

---

## Stage 3 — Replit → GitHub

**Goal:** Get Replit's built code committed to a GitHub branch for the rest of the pipeline to use.

**Option A (preferred): Replit native GitHub sync**
- Replit has a "Git" tab → "Connect to GitHub" → branch: `replit/screens`
- Agent can commit and push directly; or you use the Replit Git UI
- Opens a PR from `replit/screens` → `develop` when screens are complete

**Option B: Export + push**
- Replit menu → "Download as zip"
- Unzip, init git, push to `replit/screens`
- Use when Replit GitHub sync is unreliable

**Gate:** Before moving to Stage 4, verify the built app runs locally (`npm run dev` in `/web` returns 200 on all 21 routes defined in `request.json`).

---

## Stage 4 — Code → Figma (Export path)

**Goal:** Capture every screen as a pixel-accurate PNG and import into Figma as editable frames.

### Step 4a — Playwright screenshot script

We build `scripts/capture-screens.ts` — reads from `screen-specs/request.json`, visits each route in the running Replit preview, captures at the correct viewport, saves as the defined filename.

```
screen-specs/request.json
  → each screen has: route, export.size (e.g. "375x812"), export.filename (e.g. "NestGenie_Dashboard.png")

scripts/capture-screens.ts
  → loads BASE_URL from env (Replit preview URL)
  → for each screen in request.json:
       1. Open Playwright browser
       2. Set viewport to export.size
       3. Navigate to route
       4. Wait for network idle (no loading skeletons)
       5. Screenshot → save as export.filename to ./screenshots/
  → output: 21 PNGs in ./screenshots/
```

**Output:** `screenshots/` folder — 21 files (mobile 375×812 for all screens; add 1440×900 desktop pass if needed).

### Step 4b — Import to Figma

**Recommended method: html.to.design Figma plugin (URL-based)**
- Install [html.to.design](https://www.figma.com/community/plugin/1159123024924461424/html.to.design) in Figma (free tier covers this use case)
- For each screen: provide the live Replit URL + route (e.g. `https://nestgenie-abc123.replit.app/sign-in`)
- Plugin captures the rendered DOM → creates editable Figma layers (not a flat image)
- Groups components, preserves text layers and colors

**Alternative: Figma REST API image upload**
- We build `scripts/upload-to-figma.ts`
- Uses `PUT /v1/files/{fileId}/images` to create frames with the PNG screenshots
- Names each frame from `export.filename`
- Faster but produces rasterized frames (not editable vector layers)
- Use this as a fallback if html.to.design produces poor output

**Figma file structure after import:**
```
NestGenie — Screens
  ├── 📱 Mobile (375×812)
  │     ├── 01 Landing
  │     ├── 02 Sign-in — Phone
  │     ├── 03 Sign-in — OTP
  │     ├── 04 Dashboard
  │     ├── 05 Settings
  │     ├── 06 Connection
  │     ├── 07 Onboarding — Welcome
  │     ├── 08 Onboarding — Philosophy
  │     ├── 09 Onboarding — Family
  │     ├── 10 Onboarding — Consent
  │     ├── 11 Family — List
  │     ├── 12 Family — Child
  │     ├── 13 Family — Contact
  │     ├── 14 Privacy
  │     ├── 15 Briefings
  │     ├── 16 Briefing Detail
  │     ├── 17 Calendar
  │     ├── 18 Outbound List
  │     ├── 19 Outbound Detail
  │     ├── 20 Philosophy Settings
  │     └── 21 Notifications
  └── 🖥 Desktop (1440×900)
        └── (optional second pass)
```

---

## Stage 5 — Designer polishes in Figma

**Goal:** Designer refines the imported screens, creates a component library, applies brand polish.

**What the designer does:**
1. Organizes imported frames into the structure above
2. Extracts repeated elements into Figma components (buttons, cards, nav, empty states)
3. Applies exact brand tokens: `#2E7D32` green, Geist font, spacing grid from `design-system/guide.md`
4. Adds missing states: hover, focus, error, empty, loading skeleton variants
5. Annotates any layout changes (e.g. "this card should be 2-col on desktop")
6. Uses **Figma Dev Mode** to mark frames "ready for development"

**Medical/compliance elements to flag:**
- `MedicalDisclaimerModal` — ensure violet (`#7C3AED`) indicator is visually distinct
- `ConfirmSendSheet` — confirm-before-send must be clearly a blocking step, not subtle
- `ConsentBanner` on onboarding consent screen — must look like a consent gate, not an opt-in checkbox

---

## Stage 6 — Figma → GitHub (Cursor + Figma MCP)

**Goal:** Cursor AI reads the polished Figma frames, updates the web/ components to match, opens a GitHub PR.

**Tool:** Figma MCP Server (already documented in Scope Master at `docs/figma-mcp-setup.md`)

**Setup:**
1. In Cursor Settings → MCP → add Figma remote MCP URL (from `docs/figma-mcp-setup.md`)
2. Complete OAuth to link your Figma account
3. Cursor can now call Figma tools: read frames, variables, components, Code Connect

**How Cursor uses it:**
```
Cursor Agent prompt:
"Read the NestGenie Figma file [URL]. For each frame in the 'Mobile' page, compare 
the Figma design to the current implementation in web/app/(app)/ and web/app/(marketing)/. 
List any visual differences. Then update the Tailwind classes, shadcn component props, 
and layout to match Figma. Open a PR from branch cursor/design-01 → develop."
```

**What Cursor can change:**
- Tailwind class adjustments (spacing, color, typography)
- shadcn/ui component props and variants
- Layout structure (flex/grid direction, padding, max-width)
- Component-level changes (add/remove elements per Figma annotation)

**What Cursor cannot change automatically:**
- Business logic in API routes
- FastAPI backend changes
- New features not in the original scope
- Compliance logic (MedicalDisclaimerModal behavior, confirm-before-send flow)

**PR template (Cursor should include):**
```markdown
## Design sync — [screen names changed]
Figma frame: [link]
Changes: [list of Tailwind/component changes]
Reviewer notes: [flag anything that needed interpretation]
Medical/compliance components changed: yes/no (if yes, flag for human review)
```

---

## Stage 7 — Human reviews + merges

**Goal:** Human reviews Cursor's PR, catches any misinterpretations, merges to develop, deploys.

**Review checklist:**
- [ ] Medical/compliance components unchanged in behavior (only visual)
- [ ] Confirm-before-send flow still blocks as expected
- [ ] Consent gate still blocks navigation
- [ ] TCPA contact check still present before "Send" CTA
- [ ] No new npm packages added without discussion
- [ ] Mobile 360px breakpoint still clean (test in browser DevTools)

**After merge:**
- `develop` branch auto-deploys to staging (AWS ECS via CDK pipeline)
- Scott reviews staging
- PR from `develop` → `main` opens the production deploy

---

## Phase 7 follow-on — Figma Code Connect (living sync)

**Goal:** After the initial export-and-polish cycle, establish a persistent link between Figma components and React components so future design changes are easier to propagate.

**What Code Connect does:**
- Links a Figma component (e.g. `Button/Primary`) to the actual React component (`components/ui/button.tsx`)
- Developer opens Figma Dev Mode → clicks a component → sees the exact React import and usage snippet
- No more copy-pasting Tailwind classes — just copy the JSX

**Setup steps (Phase 7):**
1. Install `@figma/code-connect` in the `web/` project
2. Write `.figma.tsx` connection files for each shadcn/ui component (Button, Card, Badge, etc.)
3. Run `npx figma connect publish` → links appear in Figma Dev Mode
4. When designer changes a component variant in Figma, the `.figma.tsx` connection updates → Cursor can read the diff

**Components worth connecting (highest value):**
- `Button` (primary, secondary, destructive, ghost variants)
- `Card` with `CardHeader`, `CardContent`
- `Badge` (all status variants: sent, pending, declined, error, medical)
- `EmptyState` (custom)
- `MedicalDisclaimerModal` (custom — high-value for compliance verification)
- `ConfirmSendSheet` (custom — high-value for compliance)

---

## Scripts we need to build

| Script | Purpose | When |
|--------|---------|------|
| `scripts/capture-screens.ts` | Playwright: visit each route → screenshot → save as `export.filename` | Stage 4a |
| `scripts/upload-to-figma.ts` | Figma REST API: upload PNGs as frames to a Figma file | Stage 4b (fallback) |
| `.figma/button.figma.tsx` etc. | Code Connect stubs for shadcn components | Phase 7 |

---

## Tools summary

| Stage | Tool | Cost | Notes |
|-------|------|------|-------|
| GitHub hosting | GitHub | Free (private repo) | `appstango/nestgenie` |
| Build environment | Replit Agent | Replit subscription | Import from GitHub |
| Screenshot capture | Playwright (`@playwright/test`) | Free | We write `capture-screens.ts` |
| Code → Figma import | html.to.design (Figma plugin) | Free tier | URL-based capture, editable layers |
| Code → Figma fallback | Figma REST API | Free | Rasterized frames (PNG upload) |
| Design platform | Figma | Figma subscription | Designer works here |
| Figma → Code | Figma MCP + Cursor | Cursor subscription | Already in Scope Master docs |
| Living sync | Figma Code Connect | Free (OSS package) | Phase 7 follow-on |

---

## What we build next (execution order)

1. **`scripts/capture-screens.ts`** — Playwright screenshot script (reads `request.json`, captures all 21 screens)
2. **GitHub repo scaffold** — `.gitignore`, `README.md`, branch protection config, PR template
3. **`scripts/upload-to-figma.ts`** — Figma REST upload (fallback if html.to.design is insufficient)
4. Optionally: **Code Connect stubs** for the 6 highest-value components (Phase 7 prep)
