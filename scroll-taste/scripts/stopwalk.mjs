// Screenshot every resting stop of a scroll page.
// Usage: node stopwalk.mjs <url> <outDir> [width=1440] [height=900]
// Env: WAIT=ms to wait at each stop (default 1300, enough for timed changes), CHROME=/path/to/chrome
// Uses window.__scrollStops / window.__scrollTo if the page publishes them (see references/patterns.md §7),
// otherwise one stop per screen height.
import fs from 'node:fs';
import { createRequire } from 'node:module';
// Playwright from next to this script, else from the project you run it in.
async function loadPw() {
  for (const n of ['playwright', 'playwright-core']) { try { return await import(n); } catch {} }
  const req = createRequire(process.cwd() + '/');
  for (const n of ['playwright', 'playwright-core']) { try { return req(n); } catch {} }
  console.error('Needs playwright: npm i -D playwright (then npx playwright install chromium), or set CHROME and install playwright-core.'); process.exit(1);
}
const pw = await loadPw();
const [url, out, w = '1440', h = '900'] = process.argv.slice(2);
if (!url || !out) { console.error('usage: node stopwalk.mjs <url> <outDir> [width] [height]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const browser = await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', e => console.log('PAGE ERROR', e.message));
await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(1500);
const stops = await page.evaluate(() => {
  if (Array.isArray(window.__scrollStops) && window.__scrollStops.length) return window.__scrollStops.slice();
  const max = document.documentElement.scrollHeight - innerHeight, s = [];
  for (let y = 0; y < max; y += innerHeight) s.push(y);
  s.push(max); return s;
});
let i = 0;
for (const y of stops) {
  await page.evaluate(y => { if (window.__scrollTo) window.__scrollTo(y); else { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); } }, y);
  await page.waitForTimeout(+(process.env.WAIT || 1300));
  await page.screenshot({ path: `${out}/${String(i++).padStart(3, '0')}.png` });
}
console.log(`${stops.length} stops -> ${out}`);
await browser.close();
