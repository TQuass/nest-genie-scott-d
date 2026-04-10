/**
 * NestGenie — Figma Screen Uploader
 *
 * Reads the manifest produced by capture-screens.ts, uploads each PNG to
 * Figma, and sets it as the image fill on the matching frame.
 *
 * Usage:
 *   npx ts-node scripts/upload-to-figma.ts \
 *     --manifest ./screenshots/manifest.json \
 *     --token  YOUR_FIGMA_PERSONAL_ACCESS_TOKEN \
 *     --file   fswVkGFjuYaJ2nn14EzFLj
 *
 * Optional:
 *   --mobile-page   "📱 Mobile (375×812)"       (default, override if renamed)
 *   --desktop-page  "🖥 Desktop (1440×900)"
 *   --dry-run       Print what would be uploaded without making API calls
 *
 * Get a Figma Personal Access Token:
 *   Figma → Account Settings → Personal access tokens → Generate new token
 *   Scopes needed: files:read, files:write
 *
 * How it works:
 *   1. GET /v1/files/{key} — resolve page IDs + frame node IDs by name
 *   2. POST /v1/images/uploads — upload each PNG, get back an image hash
 *   3. PUT  /v1/files/{key}/nodes — set the image hash as an image fill on
 *      the target frame node
 */

import * as fs   from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ManifestEntry {
  screenId: string;
  screenName: string;
  route: string;
  viewport: string;           // 'mobile' | 'desktop'
  file: string;               // relative path to PNG
  figmaFrameName: string;     // e.g. "01 Landing"
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface FigmaPage extends FigmaNode {
  children: FigmaNode[];
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const MANIFEST_PATH  = getArg('--manifest') ?? './screenshots/manifest.json';
const FIGMA_TOKEN    = getArg('--token');
const FILE_KEY       = getArg('--file') ?? 'fswVkGFjuYaJ2nn14EzFLj';
const MOBILE_PAGE    = getArg('--mobile-page')  ?? '📱 Mobile (375×812)';
const DESKTOP_PAGE   = getArg('--desktop-page') ?? '🖥 Desktop (1440×900)';
const DRY_RUN        = process.argv.includes('--dry-run');

if (!FIGMA_TOKEN && !DRY_RUN) {
  console.error('Error: --token is required (or use --dry-run)');
  console.error('Get one at: Figma → Account Settings → Personal access tokens');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Figma REST helpers
// ---------------------------------------------------------------------------

const FIGMA_API = 'https://api.figma.com/v1';

async function figmaGet(endpoint: string): Promise<any> {
  const res = await fetch(`${FIGMA_API}${endpoint}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN! },
  });
  if (!res.ok) throw new Error(`Figma GET ${endpoint} → ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Upload a PNG buffer to Figma and return the image hash.
 * Uses the POST /v1/images/uploads endpoint (Figma API v1).
 */
async function uploadImage(pngBuffer: Buffer): Promise<string> {
  const base64 = pngBuffer.toString('base64');
  const res = await fetch(`${FIGMA_API}/images/uploads`, {
    method: 'POST',
    headers: {
      'X-Figma-Token': FIGMA_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_type: 'png',
      content: base64,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Image upload failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  // Response: { error: false, status: 200, meta: { images: { hash: url } } }
  const hash = Object.keys(data?.meta?.images ?? {})[0];
  if (!hash) throw new Error(`No image hash in upload response: ${JSON.stringify(data)}`);
  return hash;
}

/**
 * Set an image fill on a Figma frame node using the image hash.
 */
async function setImageFill(nodeId: string, imageHash: string): Promise<void> {
  const res = await fetch(`${FIGMA_API}/files/${FILE_KEY}/nodes`, {
    method: 'PUT',
    headers: {
      'X-Figma-Token': FIGMA_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nodes: {
        [nodeId]: {
          document: {
            fills: [{
              type: 'IMAGE',
              scaleMode: 'FILL',
              imageHash,
            }],
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Set fill failed: ${res.status} ${body}`);
  }
}

// ---------------------------------------------------------------------------
// Frame index builder
// ---------------------------------------------------------------------------

/**
 * Walk the Figma file and build a map of:
 *   `${pageName}::${frameName}` → nodeId
 */
async function buildFrameIndex(): Promise<Map<string, string>> {
  console.log('  Fetching Figma file structure...');
  const data = await figmaGet(`/files/${FILE_KEY}`);
  const index = new Map<string, string>();

  for (const page of (data.document?.children ?? []) as FigmaPage[]) {
    for (const node of (page.children ?? [])) {
      if (node.type === 'FRAME') {
        const key = `${page.name}::${node.name}`;
        index.set(key, node.id);
      }
    }
  }

  console.log(`  Found ${index.size} frames across ${data.document?.children?.length} pages`);
  return index;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🖼  NestGenie → Figma Uploader`);
  console.log(`   File     : ${FILE_KEY}`);
  console.log(`   Manifest : ${MANIFEST_PATH}`);
  console.log(`   Dry run  : ${DRY_RUN}\n`);

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found: ${MANIFEST_PATH}`);
    console.error('Run capture-screens.ts first.');
    process.exit(1);
  }

  const manifest: ManifestEntry[] = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`  Loaded ${manifest.length} entries from manifest`);

  // Map viewport name → Figma page name
  const PAGE_MAP: Record<string, string> = {
    mobile:  MOBILE_PAGE,
    desktop: DESKTOP_PAGE,
  };

  if (DRY_RUN) {
    console.log('\n── Dry run — would upload: ──');
    for (const entry of manifest) {
      const pageName = PAGE_MAP[entry.viewport] ?? entry.viewport;
      console.log(`  ${entry.viewport.padEnd(8)} ${entry.figmaFrameName.padEnd(30)} → page "${pageName}"`);
    }
    return;
  }

  // Build frame index
  const frameIndex = await buildFrameIndex();
  const uploaded: string[] = [];
  const skipped:  string[] = [];
  const failed:   string[] = [];

  for (const entry of manifest) {
    const pageName     = PAGE_MAP[entry.viewport] ?? entry.viewport;
    const lookupKey    = `${pageName}::${entry.figmaFrameName}`;
    const nodeId       = frameIndex.get(lookupKey);
    const pngPath      = path.resolve(process.cwd(), entry.file);

    process.stdout.write(`  ${entry.viewport.padEnd(8)} ${entry.figmaFrameName.padEnd(30)} `);

    if (!nodeId) {
      console.log(`⚠  frame not found (key: "${lookupKey}")`);
      skipped.push(entry.screenId);
      continue;
    }

    if (!fs.existsSync(pngPath)) {
      console.log(`⚠  PNG not found: ${pngPath}`);
      skipped.push(entry.screenId);
      continue;
    }

    try {
      const buf  = fs.readFileSync(pngPath);
      const hash = await uploadImage(buf);
      await setImageFill(nodeId, hash);
      console.log(`✓`);
      uploaded.push(entry.screenId);
    } catch (err: any) {
      console.log(`✗ ${err.message}`);
      failed.push(entry.screenId);
    }
  }

  console.log(`\n── Summary ──`);
  console.log(`  Uploaded : ${uploaded.length}`);
  console.log(`  Skipped  : ${skipped.length}${skipped.length ? ' (' + skipped.join(', ') + ')' : ''}`);
  console.log(`  Failed   : ${failed.length}${failed.length ? ' (' + failed.join(', ') + ')' : ''}`);
  console.log(`\n  View: https://www.figma.com/design/${FILE_KEY}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
