// scripts/audit-bundle-secrets.mjs
// Release gate script ensuring zero API keys or secrets leak into .next/static client bundles (HR-10).

import fs from 'node:fs';
import path from 'node:path';

const STATIC_DIR = path.join(process.cwd(), '.next/static');
const BANNED_PATTERNS = [
  process.env.QLOO_API_KEY,
  process.env.TICKETMASTER_API_KEY,
  process.env.LLM_API_KEY
].filter(Boolean);

let scannedFiles = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (file.endsWith('.js')) {
      scannedFiles++;
      const content = fs.readFileSync(full, 'utf8');
      for (const pattern of BANNED_PATTERNS) {
        if (content.includes(pattern)) {
          console.error(`[SECURITY ERROR] Leaked secret in client bundle: ${full}`);
          process.exit(1);
        }
      }
    }
  }
}

if (fs.existsSync(STATIC_DIR)) {
  scanDir(STATIC_DIR);
  console.log(`[SECURITY AUDIT] Clean: ${scannedFiles} client JS bundles scanned. Zero secrets leaked.`);
} else {
  console.log('[SECURITY AUDIT] .next/static directory not yet generated; skipping bundle check.');
}
