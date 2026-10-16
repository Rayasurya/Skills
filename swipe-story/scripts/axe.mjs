// axe.mjs: WCAG A/AA check of a page with axe-core.
//   node axe.mjs <url> [width] [height]
// Needs axe-core installed where you run it (npm i -D axe-core), or AXE=/path/axe.min.js.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { launch } from './_browser.mjs';
const [url, w = '1440', h = '900'] = process.argv.slice(2);
let file = process.env.AXE;
if (!file) { try { file = createRequire(process.cwd() + '/package.json').resolve('axe-core/axe.min.js'); } catch {} }
if (!file || !fs.existsSync(file)) { console.error('axe-core not found: npm i -D axe-core, or set AXE=/path/to/axe.min.js'); process.exit(1); }
const browser = await launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.addScriptTag({ content: fs.readFileSync(file, 'utf8') });
const v = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }, resultTypes: ['violations'] })).violations.map(x => ({ id: x.id, nodes: x.nodes.slice(0, 20).map(n => n.target.join(' ') + ' ' + (n.any[0]?.data?.contrastRatio ? JSON.stringify([n.any[0].data.contrastRatio, n.any[0].data.fgColor, n.any[0].data.bgColor]) : '')) })));
if (!v.length) console.log('axe: 0 violations');
for (const x of v) { console.log('##', x.id, x.nodes.length); x.nodes.forEach(n => console.log('  ', n)); }
await browser.close();
