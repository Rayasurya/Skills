// Shared: find Playwright and a Chrome binary, without assuming a project.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
export function playwright() {
  const tries = [process.cwd() + '/package.json', path.join(path.dirname(new URL(import.meta.url).pathname), 'package.json')];
  for (const t of tries) for (const name of ['playwright-core', 'playwright']) {
    try { return createRequire(t)(name); } catch {}
  }
  console.error('Playwright not found. Run this from a folder with playwright-core installed (npm i -D playwright-core), or set NODE_PATH.');
  process.exit(1);
}
export function chrome() {
  const c = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  return c.find(p => fs.existsSync(p));
}
export async function launch() {
  const { chromium } = playwright();
  return chromium.launch({ executablePath: chrome() });
}
