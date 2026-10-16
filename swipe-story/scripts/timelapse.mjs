// timelapse.mjs: frames of a timed change, to check its pace.
//   node timelapse.mjs <url> <out-dir> <section-id> <from> <to> [ms,ms,...]
// Jumps to fraction <from> of the pinned section, waits, jumps to <to>, then
// takes a frame at each listed time (default 100..2400 ms).
import fs from 'node:fs';
import { launch } from './_browser.mjs';
const [url, out, id, from, to, times = '100,400,700,1000,1400,1900,2400'] = process.argv.slice(2);
if (!id) { console.error('usage: node timelapse.mjs <url> <out-dir> <section-id> <from> <to> [ms,...]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: +(process.env.W || 1440), height: +(process.env.H || 900) } });
await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(2000);
const go = (f) => page.evaluate(([id, f]) => { const y = Story.actY(document.getElementById(id), [+f])[0]; window.__scrollTo(y); }, [id, f]);
await go(from); await page.waitForTimeout(2500); await go(to);
let last = 0;
for (const t of times.split(',').map(Number)) { await page.waitForTimeout(t - last); last = t; await page.screenshot({ path: `${out}/${id}-${from}-${to}-${String(t).padStart(5, '0')}.png` }); }
console.log('frames in', out);
await browser.close();
