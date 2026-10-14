# Patterns

Plain JavaScript for the mechanics behind the rules. No framework assumed. Adapt the names; keep the behaviour.

## 1. One gesture, one stop (rule 1)

Keep a sorted list of scroll positions where the page may rest (`stops`). A new wheel gesture (no wheel event for 220 ms, or a change of direction) glides to the next stop, whatever the wheel delta. The gesture's total distance unlocks more stops, so a long swing passes through.

With [Lenis](https://github.com/darkroomengineering/lenis), hook `virtualScroll` (return `false` to swallow the event):

```js
const SWING = [0, 800, 1700, 2700, 3900, 5300]; // px of one gesture that unlock 1, 2, 3... stops
let stops = [], gest = null;
const earned = acc => { let n = 1; while (n < SWING.length && acc > SWING[n]) n++; return n; };
const next = (y, dir) => dir > 0 ? stops.find(s => s > y + 3) : [...stops].reverse().find(s => s < y - 3);
const ease = t => 1 - Math.pow(1 - t, 3.2); // ease-out: answers the wheel on the next frame

function glide(y) {
  gest.to = y;
  const d = Math.abs(y - lenis.animatedScroll);
  lenis.scrollTo(y, { duration: Math.min(1.05, 0.62 + d / innerHeight * 0.25), easing: ease, force: true });
}
function stepWheel({ event: ev, deltaY: dy }) {
  if (!ev || ev.type !== 'wheel' || ev.ctrlKey || !dy) return true;
  if (ev.target.closest('[data-lenis-prevent]')) return true;      // panels that scroll on their own
  const dir = Math.sign(dy), now = performance.now();
  if (gest && gest.dir === dir && now - gest.t < 220) {            // same gesture, still spinning
    gest.t = now; gest.acc += Math.abs(dy);
    const want = earned(gest.acc);
    while (gest.n < want) { const nx = next(gest.to, dir); if (nx == null) break; gest.n++; glide(nx); }
    ev.preventDefault(); return false;
  }
  gest = { dir, t: now, acc: Math.abs(dy), n: 1, to: lenis.targetScroll };   // new gesture
  const nx = next(lenis.targetScroll, dir);
  if (nx == null) return true;
  ev.preventDefault(); glide(nx); return false;
}
const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, virtualScroll: stepWheel });
```

Arrow keys, Page keys and Space should step too. Leave touch on native scroll. Start Lenis after any pinning library has measured the page, or it clamps the scroll.

A sideways trackpad swipe over a rail (§4) can step it: treat `deltaX` as `deltaY` when the target is inside the rail.

## 2. Where stops go (rule 2)

Two sources of stops:

- **Pinned sections** register their own: `stopsOf(section, [0, 0.5, 1])` maps fractions of the pinned travel to scroll positions (`top + (height - innerHeight) * f`).
- **Plain content** gets stops computed from its blocks (headings, figures, cards, devices). Mark visuals that are not text with an attribute such as `data-block`, or they get no stop.

Group, then centre:

```js
const bar = 52, avail = innerHeight - bar, pad = Math.max(40, avail * 0.1), fit = avail - 2 * pad;
for (let i = 0; i < blocks.length;) {
  const b0 = blocks[i]; let g1 = b0.bottom, j = i + 1;
  while (j < blocks.length && blocks[j].section === b0.section && blocks[j].bottom - b0.top <= fit) g1 = Math.max(g1, blocks[j++].bottom);
  const h = g1 - b0.top;
  const loneHeading = j === i + 1 && b0.isHeading && (b0.leadsIntoPinned || blocks[j]?.section === b0.section);
  let y = h <= fit && !loneHeading ? b0.top - bar - (avail - h) / 2 : b0.top - bar - pad;
  const s = b0.section;                                            // whole section fits: centre it
  if (s.height <= avail) y = s.top - bar - (avail - s.height) / 2;
  else y = Math.min(y, s.bottom - innerHeight);                    // never past the section's last screen
  stops.push(Math.round(y)); i = j;
}
```

Then merge stops closer than about 12% of a screen, add filler stops in any plain stretch longer than about 1.3 screens, and never merge two stops that belong to the same pinned section.

Let a section's last block stand for everything after it in that section (a device, a call to action), so unmarked content is not left off a stop.

## 3. Timed stages (rules 3 and 4)

Scroll picks a whole-number stage; the scene moves toward it on a clock.

```js
// st = { v: 0 }   (start at 0: an empty object would snap to the target on the first frame)
function tl(st, target, time, secs, back = 0.4) {
  const dt = st.t ? Math.min(0.05, (time - st.t) / 1000) : 0; st.t = time;
  if (st.v === target) return st.v;
  const dir = Math.sign(target - st.v);
  const k = dir > 0 ? Math.floor(st.v + 1e-6) : Math.ceil(st.v - 1e-6) - 1;   // the stage being left
  const d = Array.isArray(secs) ? secs[Math.max(0, Math.min(secs.length - 1, k))] : secs;
  st.v += dir * dt / (d * (dir < 0 ? back : 1));
  if (dir > 0 ? st.v > target : st.v < target) st.v = target;
  return st.v;
}

// in the render loop, for a pinned section with stops at p = 0, 0.5, 1:
const v = tl(state, Math.round(progress * 2), now, [2.0, 3.4]);   // 2 s to heat, 3.4 s to cool
const heat = smoothstep(0.05, 0.75, v) * (1 - smoothstep(1.0, 1.2, v));
```

Describe every visual property as a function of `v` (0 to N), with each phase on its own slice of the stage. Keep the scene animating while `v !== target`. Anything that depends on the stage (a bar that turns dark over a dark stage) must read `v`, not scroll progress.

Timing guide: 0.7 to 1.1 s for one change; a card slide 0.7 s; a counter or bar compress about 2 s; a multi-phase sequence up to 3.5 s. Text holds until the next swipe.

## 4. Pinned rail (rule 6)

```js
// measure card offsets: one rest position per card until the track's end is visible
function railStops(stage, track) {
  const kids = [...track.children], over = Math.max(0, track.scrollWidth - stage.clientWidth), pad = kids[0].offsetLeft;
  const xs = [0];
  for (const k of kids.slice(1)) { const x = -Math.min(over, k.offsetLeft - pad); if (x < xs.at(-1) - 4) xs.push(x); }
  return xs;
}
// pin length: 1 screen + 0.7 screen per step. Register one stop per position.
// each frame: target = round(progress * (n - 1)); v = tl(st, target, now, 0.7, 0.8);
// x = lerp(xs[floor(v)], xs[floor(v) + 1], easeInOut(v - floor(v)));  track.style.transform = `translate3d(${x}px,0,0)`
```

CSS that matters: the pinned stage `overflow: hidden`; the stage's grid column `minmax(0, 1fr)` and the gallery `min-width: 0` (an `auto` column grows to the track's full width and pushes the heading off to the right); the track `overflow: visible; will-change: transform`. Under reduced motion, drop the pin and let the track scroll natively.

## 5. Recordings (rule 7)

```js
new IntersectionObserver(([e]) => {
  if (e.intersectionRatio >= 0.5) { if (!v.src) v.src = v.dataset.src; if (!paused) v.play().catch(() => {}); }
  else v.pause();
}, { threshold: [0, 0.5] }).observe(plate);
```

`<video muted loop playsinline preload="none" poster=…>`, a 44 px pause/play button with `aria-pressed`, and under reduced motion no autoplay plus native controls. Heavy files belong on a CDN, not in the page bundle.

## 6. Pulsing dot (rule 21)

```css
.tapdot { position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #2563eb; translate: -50% -50%; }
.tapdot::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: inherit; animation: tap 1.4s ease-out infinite; }
@keyframes tap { from { transform: scale(1); opacity: 0.6; } to { transform: scale(3); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tapdot::after { animation: none; } }
```

Place it on the exact control the section talks about, and remove it once tapped.

## 7. Expose stops for review

Make the review scripts work on any build: publish the final, sorted stop list on `window`.

```js
window.__scrollStops = stops;            // after every rebuild (load, resize, fonts ready, panels opening)
window.__scrollTo = y => lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
```

`scripts/stopwalk.mjs` uses these, and falls back to one stop per screen height if they are missing.

## 8. Diagrams that replaced paragraphs

- **Comparison → positioning map.** Two axes taken from the comparison's own rows (for example "built for this domain" and "reasoning you can see"). Place each option honestly and say so in a caption ("placement is my reading of public materials as of …"). Animate on arrival: axes, then the others, then yours lands in the empty corner.
- **Pipeline with a human in the loop → swimlane.** Steps across, lanes for "automated", "automated, human-gated" and "human only", one line through the nodes. On desktop the line leaves and enters each node sideways so it never runs through a label; on a phone the lanes become columns and labels sit on solid pills. Details (why, what breaks) on hover or tap; the full table behind a "+" tile.
- **Many agents passing work → zoom-and-follow.** Overview first, then a camera that frames each hand-off with a moving packet and the matching log row beside it.
- **A number that shrinks → same-scale bar.** Both states on one scale, the bar halving step by step with a counter, on a clock after one swipe.

## 9. Gotchas

- A global `canvas { max-width: 100% }` squeezes an oversized WebGL canvas (drawn larger than its box for glow room); set `max-width: none` on it.
- Start pinning/smooth-scroll libraries in the right order, or the scroll is clamped.
- Never set `height` on an element the pin library sizes itself.
- A scene must redraw when its section's progress changes, not only when `scrollY` changes.
- A colour fade from dark to light passes through grey; wipe or draw over instead.
- Delayed reveals need overlapping fades, or a card is empty between them.
- Invisible tooltips still take layout space; check `document.documentElement.scrollWidth` at 320 to 430 px.
