// Frames of a timed sequence, so you can see it play.
// Usage: node timelapse.mjs <url> <outDir> <width> <height> <selector> "<offset>:<ms>,<ms>;<offset>:<ms>,..."
//   offset: pixels from the element's top to scroll to (negative = above it). Each group scrolls there,
//   then screenshots at each ms after arriving. Example: "#forge" "0:400,900,1600;900:400,1200,2400,3600"
// Env: CHROME=/path/to/chrome. Uses window.__scrollTo if the page publishes it.
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
const [url, out, w, h, sel, plan] = process.argv.slice(2);
if (!plan) { console.error('usage: node timelapse.mjs <url> <outDir> <w> <h> <selector> "<offset>:<ms,...>;..."'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const browser = await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', e => console.log('PAGE ERROR', e.message));
await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(1500);
let n = 0;
for (const group of plan.split(';')) {
  const [off, times] = group.split(':');
  const y = await page.evaluate(([sel, off]) => document.querySelector(sel).getBoundingClientRect().top + scrollY + off, [sel, +off]);
  await page.evaluate(y => { if (window.__scrollTo) window.__scrollTo(y); else { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); } }, y);
  let last = 0;
  for (const t of times.split(',').map(Number)) {
    await page.waitForTimeout(t - last); last = t;
    await page.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}_${off}_${t}ms.png` });
  }
}
console.log(`${n} frames -> ${out}`);
await browser.close();
