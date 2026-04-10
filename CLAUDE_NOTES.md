# Notes for Claude — Replit + Next.js Project Setup

This file captures issues we hit during development and deployment of NestGenie.
Share with Claude at the start of a new Replit Next.js project to avoid them.

---

## Do these on day one (before writing any features)

### 1. Add a root `package.json`
The Replit deployment system looks for `package.json` at the repo root. If the app
lives in a subdirectory (e.g. `web/`), create a minimal root file:

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "cd web && npm install && npm run build",
    "start": "cd web && npm start",
    "dev":   "cd web && npm run dev"
  }
}
```

Then set deployment config:
- build: `["npm", "run", "build"]`
- run:   `["npm", "start"]`

### 2. Create a workflow for every long-running process
Replit only auto-starts one workflow. If the project has a backend (e.g. FastAPI on
port 8000), add a second workflow immediately:

```
name: Backend API
command: cd api && uvicorn main:app --reload --host 0.0.0.0 --port 8000
outputType: console
waitForPort: 8000
```

Without this, every API call will get `ECONNREFUSED` but the frontend will still
compile — the error is silent until you check the logs.

### 3. Set the production `start` script to include port + host
The `npm start` script (Next.js) defaults to port 3000. Replit expects port 5000 for
webview apps. Update `package.json` in the frontend:

```json
"start": "next start -p 5000 -H 0.0.0.0"
```

### 4. Configure deployment target explicitly
Run `deployConfig()` to set `deploymentTarget`, `build`, and `run` — don't rely on
auto-detection. Verify the values appear in the `.replit` `[deployment]` section.

---

## Common build failures to fix before deploying

### Unescaped apostrophes in JSX text
ESLint's `react/no-unescaped-entities` rule will fail the build. In JSX text nodes,
replace `'` with `&apos;` (e.g. `your family&apos;s schedule`).

### Empty interface declarations
TypeScript ESLint flags `export interface Foo extends Bar {}`. Replace with:
`export type Foo = Bar;`

Run `npx next lint` from the frontend directory before every deployment.

---

## Replit-specific navigation quirks

### Server-side redirects break in the Replit proxy
The Replit preview is a proxied iframe using mTLS. `redirect()` from server
components and plain `<a href>` navigations can fail silently. For any programmatic
navigation (e.g. after login):

```ts
await fetch("/api/dev-login", { credentials: "same-origin" });
router.push("/app");   // Next.js client-side router
```

### `suppressHydrationWarning` on `<html>`
Required whenever the class on `<html>` is set client-side (e.g. `next-themes` dark
mode). Without it you get a React hydration mismatch warning on every page load.

```tsx
<html lang="en" suppressHydrationWarning>
```

---

## FastAPI CORS with the Next.js proxy

The Next.js rewrite (`/api/v1/* → http://localhost:8000`) means API calls go
server-to-server, so browser CORS is not technically needed. But if you want the
backend accessible directly:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # wildcard only works with credentials=False
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

`allow_origins=["*"]` + `allow_credentials=True` is rejected by all browsers.

---

## File encoding
If a TypeScript/TSX file starts causing a "cannot read file" webpack error at build
time even though the content looks correct, the file has invalid UTF-8 bytes (usually
from a copy-paste). Fix: **delete and recreate** — do not copy from the broken file.

```bash
rm web/middleware.ts
# then create it fresh in the editor
```

---

## Dark mode (next-themes)

Standard setup for Next.js + Tailwind:

1. `npm install next-themes`
2. `tailwind.config.ts`: add `darkMode: "class"`
3. Wrap the app in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`
4. Add `suppressHydrationWarning` to `<html>`
5. Use `useTheme()` → `resolvedTheme` (not `theme`) to get the actual active theme,
   since `theme` may be `"system"` instead of `"light"` or `"dark"`.
