/**
 * NestGenie — Playwright Screen Capture Script
 *
 * Visits all 21 routes at both mobile (375×812) and desktop (1440×900)
 * viewports and saves PNGs to ./screenshots/.
 *
 * Usage:
 *   npx ts-node scripts/capture-screens.ts --url https://YOUR_APP.replit.app
 *
 * Optional flags:
 *   --mobile-only     Only capture mobile viewport
 *   --desktop-only    Only capture desktop viewport
 *   --screens S01,S04 Comma-separated screen IDs to capture (default: all)
 *   --auth-token JWT  Skip the OTP flow — inject this JWT as the auth cookie
 *   --out ./shots     Output directory (default: ./screenshots)
 *
 * After capture, run upload-to-figma.ts to push PNGs into Figma frames.
 *
 * Install deps once:
 *   npm install --save-dev playwright ts-node typescript @types/node
 *   npx playwright install chromium
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface Screen {
  id: string;
  name: string;
  route: string;
  layout: 'marketing' | 'app';
  requiresAuth: boolean;
}

const SCREENS: Screen[] = [
  { id: 'S01', name: 'Landing',                    route: '/',                                   layout: 'marketing', requiresAuth: false },
  { id: 'S02', name: 'Sign-in — Phone',             route: '/sign-in',                            layout: 'marketing', requiresAuth: false },
  { id: 'S03', name: 'Sign-in — OTP',               route: '/sign-in/verify',                     layout: 'marketing', requiresAuth: false },
  { id: 'S04', name: 'Dashboard',                   route: '/app',                                layout: 'app',       requiresAuth: true  },
  { id: 'S05', name: 'Settings',                    route: '/app/settings',                       layout: 'app',       requiresAuth: true  },
  { id: 'S06', name: 'Connection Status',           route: '/app/settings/connection',            layout: 'app',       requiresAuth: true  },
  { id: 'S07', name: 'Onboarding — Welcome',        route: '/app/onboarding',                     layout: 'app',       requiresAuth: true  },
  { id: 'S08', name: 'Onboarding — Philosophy',     route: '/app/onboarding/philosophy',          layout: 'app',       requiresAuth: true  },
  { id: 'S09', name: 'Onboarding — Family',         route: '/app/onboarding/family',              layout: 'app',       requiresAuth: true  },
  { id: 'S10', name: 'Onboarding — Consent',        route: '/app/onboarding/consent',             layout: 'app',       requiresAuth: true  },
  { id: 'S11', name: 'Family — List',               route: '/app/family',                         layout: 'app',       requiresAuth: true  },
  { id: 'S12', name: 'Family — Child',              route: '/app/family/child/demo-child-id',     layout: 'app',       requiresAuth: true  },
  { id: 'S13', name: 'Family — Contact',            route: '/app/family/contact/demo-contact-id', layout: 'app',       requiresAuth: true  },
  { id: 'S14', name: 'Privacy',                     route: '/app/settings/privacy',               layout: 'app',       requiresAuth: true  },
  { id: 'S15', name: 'Briefings',                   route: '/app/briefings',                      layout: 'app',       requiresAuth: true  },
  { id: 'S16', name: 'Briefing Detail',             route: '/app/briefings/demo-briefing-id',     layout: 'app',       requiresAuth: true  },
  { id: 'S17', name: 'Calendar',                    route: '/app/calendar',                       layout: 'app',       requiresAuth: true  },
  { id: 'S18', name: 'Outbound List',               route: '/app/outbound',                       layout: 'app',       requiresAuth: true  },
  { id: 'S19', name: 'Outbound Detail',             route: '/app/outbound/demo-action-id',        layout: 'app',       requiresAuth: true  },
  { id: 'S20', name: 'Philosophy Settings',         route: '/app/settings/philosophy',            layout: 'app',       requiresAuth: true  },
  { id: 'S21', name: 'Notifications',               route: '/app/settings/notifications',         layout: 'app',       requiresAuth: true  },
];

const VIEWPORTS = [
  { name: 'mobile',   width: 375,  height: 812  },
  { name: 'desktop',  width: 1440, height: 900  },
];

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

const BASE_URL    = (getArg('--url') ?? 'http://localhost:3000').replace(/\/$/, '');
const AUTH_TOKEN  = getArg('--auth-token');
const OUT_DIR     = getArg('--out') ?? path.join(process.cwd(), 'screenshots');
const MOBILE_ONLY = hasFlag('--mobile-only');
const DESKTOP_ONLY = hasFlag('--desktop-only');
const SCREEN_FILTER = getArg('--screens')?.split(',').map(s => s.trim().toUpperCase());

const activeViewports = VIEWPORTS.filter(v => {
  if (MOBILE_ONLY)  return v.name === 'mobile';
  if (DESKTOP_ONLY) return v.name === 'desktop';
  return true;
});

const activeScreens = SCREEN_FILTER
  ? SCREENS.filter(s => SCREEN_FILTER.includes(s.id))
  : SCREENS;

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Inject a JWT into the httpOnly auth cookie so we skip the OTP flow.
 * Cookie name must match what your FastAPI backend sets (adjust if needed).
 */
async function injectAuthCookie(context: BrowserContext, token: string): Promise<void> {
  const domain = new URL(BASE_URL).hostname;
  await context.addCookies([{
    name: 'auth_token',
    value: token,
    domain,
    path: '/',
    httpOnly: true,
    secure: BASE_URL.startsWith('https'),
    sameSite: 'Lax',
  }]);
  console.log(`  ✓ Auth cookie injected for domain ${domain}`);
}

/**
 * Perform a real OTP sign-in in the browser.
 * Only usable in dev/test environments where you control the OTP.
 */
async function signInWithOTP(page: Page, phone: string, otp: string): Promise<void> {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="tel"]', phone);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/sign-in/verify`);
  await page.fill('input[inputmode="numeric"]', otp);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/app`);
  console.log('  ✓ OTP sign-in complete');
}

// ---------------------------------------------------------------------------
// Capture
// ---------------------------------------------------------------------------

function screenshotFileName(screen: Screen, viewport: typeof VIEWPORTS[0]): string {
  const slug = screen.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${screen.id}-${slug}-${viewport.name}.png`;
}

async function captureScreen(
  page: Page,
  screen: Screen,
  viewport: typeof VIEWPORTS[0],
): Promise<string> {
  const url   = `${BASE_URL}${screen.route}`;
  const file  = path.join(OUT_DIR, viewport.name, screenshotFileName(screen, viewport));

  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

  // Wait for any skeleton loaders to resolve
  try {
    await page.waitForSelector('[data-loading="true"]', { state: 'detached', timeout: 5_000 });
  } catch { /* no skeleton present — fine */ }

  // Small buffer for CSS animations
  await page.waitForTimeout(500);

  await page.screenshot({ path: file, fullPage: false });
  return file;
}

// ---------------------------------------------------------------------------
// Manifest (used by upload-to-figma.ts)
// ---------------------------------------------------------------------------

interface ManifestEntry {
  screenId: string;
  screenName: string;
  route: string;
  viewport: string;
  file: string;
  figmaFrameName: string;  // matches the name in Figma (e.g. "01 Landing")
}

function buildFigmaFrameName(screen: Screen): string {
  // Matches the naming convention used when we created the Figma frames:
  // "01 Landing", "04 Dashboard", etc. (zero-padded, no "S" prefix)
  const num = screen.id.replace('S', '').padStart(2, '0');
  return `${num} ${screen.name}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🎬 NestGenie Screen Capture`);
  console.log(`   Base URL : ${BASE_URL}`);
  console.log(`   Screens  : ${activeScreens.length} of ${SCREENS.length}`);
  console.log(`   Viewports: ${activeViewports.map(v => v.name).join(', ')}`);
  console.log(`   Output   : ${OUT_DIR}\n`);

  // Create output dirs
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const vp of activeViewports) {
    fs.mkdirSync(path.join(OUT_DIR, vp.name), { recursive: true });
  }

  const browser: Browser = await chromium.launch({ headless: true });
  const manifest: ManifestEntry[] = [];
  const failed: string[] = [];

  for (const viewport of activeViewports) {
    console.log(`\n── ${viewport.name.toUpperCase()} (${viewport.width}×${viewport.height}) ──`);

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2, // retina screenshots
    });

    // Inject auth cookie if provided
    if (AUTH_TOKEN) {
      await injectAuthCookie(context, AUTH_TOKEN);
    }

    const page = await context.newPage();

    for (const screen of activeScreens) {
      // Skip auth-required screens only if we have no token AND --no-auth not set
      if (screen.requiresAuth && !AUTH_TOKEN && !hasFlag('--no-auth')) {
        console.log(`  ⚠  ${screen.id} ${screen.name} — SKIPPED (no --auth-token; use --no-auth if SCREENSHOT_MODE=true in Replit)`);
        continue;
      }

      try {
        process.stdout.write(`  → ${screen.id} ${screen.name.padEnd(30)} `);
        const file = await captureScreen(page, screen, viewport);
        const rel  = path.relative(process.cwd(), file);
        console.log(`✓ ${rel}`);

        manifest.push({
          screenId:       screen.id,
          screenName:     screen.name,
          route:          screen.route,
          viewport:       viewport.name,
          file:           rel,
          figmaFrameName: buildFigmaFrameName(screen),
        });
      } catch (err: any) {
        console.log(`✗ ${err.message}`);
        failed.push(`${viewport.name}/${screen.id}`);
      }
    }

    await context.close();
  }

  await browser.close();

  // Write manifest
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Summary
  console.log(`\n── Summary ──`);
  console.log(`  Captured : ${manifest.length}`);
  console.log(`  Failed   : ${failed.length}${failed.length ? ' (' + failed.join(', ') + ')' : ''}`);
  console.log(`  Manifest : ${manifestPath}`);
  console.log(`\nNext: npx ts-node scripts/upload-to-figma.ts --manifest ${manifestPath}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
