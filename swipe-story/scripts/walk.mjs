// walk.mjs: screenshot every stop of a page and report console errors.
//   node walk.mjs <url> <out-dir> [width] [height]     env WAIT=ms after each stop (default 2600)
// Desktop runs with smooth scrolling on (the page sees a real mouse); a width
// under 600 runs as a phone (touch, mobile user agent).
import fs from 'node:fs';
import { launch } from './_browser.mjs';
const [url, out, w = '1440', h = '900'] = process.argv.slice(2);
if (!url || !out) { console.error('usage: node walk.mjs <url> <out-dir> [w] [h]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.unlinkSync(`${out}/${f}`);
const browser = await launch();
const mobile = +w < 600;
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
if (!mobile) await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2500);
const stops = await page.evaluate(() => window.__scrollStops || []);
console.log('stops', stops.length, JSON.stringify(stops));
let i = 0;
for (const y of stops) {
  await page.evaluate(y => window.__scrollTo ? window.__scrollTo(y) : scrollTo(0, y), y);
  await page.waitForTimeout(+process.env.WAIT || 2600);
  await page.screenshot({ path: `${out}/${String(i++).padStart(3, '0')}.png` });
}
// Close stops feel like nothing happened; very long gaps skip content.
const gaps = stops.slice(1).map((y, k) => y - stops[k]);
const close = gaps.map((g, k) => [k, g]).filter(([, g]) => g < +h * 0.2);
if (close.length) console.log('stops closer than 20% of a screen:', close.map(([k, g]) => `${k}->${k + 1} (${g}px)`).join(', '));
console.log(errs.length ? 'console errors:\n' + errs.join('\n') : 'no console errors');
await browser.close();
