# Mechanics: how the kit works and how to use it

The kit is three files plus Lenis:

| File | Job |
|---|---|
| `kit/stage.js` | The engine. Pinned acts with a progress value; reveals. |
| `kit/story.js` | The controller. Stops, scenes, rails, the chapter bar and index, lightbox, "+" tiles, recordings, arrival diagrams, nudge, reduced motion. |
| `kit/story.css` | Base styles and tokens. A build overrides tokens in its own `page.css`. |
| `kit/lenis.min.js` | Smooth scrolling (MIT). The controller hooks its wheel input to step between stops. |

Load order: `lenis.min.js`, `stage.js`, `story.js`, then the build's
`scenes.js`, which registers everything and ends with `Story.start()`.

## Markup

| Attribute / class | Meaning |
|---|---|
| `data-act="pin"` + `data-span="2.5"` | A pinned act, 2.5 screens tall. Its `[data-stage]` child sticks while it scrolls. |
| `data-act="flow"` | A plain act that only reports when it is near the screen. |
| `data-stage` | The sticky stage inside a pinned act. Add `class="stagegrid"` on the act to centre the stage's content under the bar. |
| `data-in` | Rises into place once, on first view. |
| `data-stagger="70"` | Its children rise one after another, 70 ms apart (put it with `data-in`). |
| `data-block` | One stop unit for the stop builder; marked children inside are not separate stops. |
| `data-arrive="0.5"` | Gets class `on` once when half of it is on screen. Diagrams that play on a clock hang their CSS transitions off `.on`. A scene can set `el._onArrive = fn`. |
| `data-chapter="03"` + `data-chapter-title` | A chapter in the index and the bar. |
| `data-dark` | The bar turns dark over this section. |
| `data-no-nudge` | No "Keep scrolling" nudge inside this act (a bench of screens, for example). |
| `data-more` | A "+" tile: `.more__btn` toggles `.more__panel`. The page re-measures after it opens. |
| `data-full="src"` + `data-cap` | Opens the image full size in the lightbox. |
| `.rec[data-autoplay]` | A recording plate: `<video data-src muted loop playsinline>` plus a `.rec__pp` pause button. Loops while half on screen. |
| `.swap` > `[data-st="k"]` | State text that cross-fades: `Story.swapTo(box, k)`. |
| `.head` | A section heading block (the stop builder knows it). |
| `.solo` | A short flow section that fills the screen. |
| `.gapbig` | A second group in a section, pushed far enough down to get its own stop. |

## Scenes

```js
Story.scene('ch-02', (function () {
  var el, stage = -1;
  function apply(k) {
    if (k === stage) return; stage = k; el.dataset.stage = k;
    Story.swapTo(el.querySelector('.swap'), k);
    // Start the change after the glide settles; CSS transitions do the rest.
    Story.after('lit', function () { /* add classes */ }, 350);
  }
  return {
    init: function (e) { el = e; apply(0); },
    update: function (p, time) { apply(Story.stageOf(p, 3)); return false; },  // return true to keep animating
    still: function (e) { /* reduced motion: show the final state */ },
    resize: function () { /* re-measure if needed */ }
  };
})());
Story.stops(function () { return { stops: Story.actY(document.getElementById('ch-02'), [0, 0.5, 1]) }; });
```

- `Story.stageOf(p, n)`: which of n evenly spaced stops the progress points at.
- `Story.tl(st, target, time, secs, back)`: a value that moves toward a stage
  on a clock, for continuous animation (start with `st = { v: 0 }`).
- `Story.after(key, fn, ms)` / `Story.cancel(key)`: named timeouts that replace
  each other, for sequences.
- `Story.arrived(el, 0.3)`: the section's top is above 30% of the screen. Use it
  to hold a scene in its "not yet" state until it has arrived.
- `Story.rail('id')`: makes a pinned `.rail` section's `.rail__track` move one
  card per swipe. It sets its own `data-span` and stops.
- `Story.scrollToAct(el, f)`: jump to fraction f of an act (for tabs or
  buttons that pick a stage).

## Patterns that worked

**Bench of screens.** A pinned act with one stop per screen. The new screen
fades in whole; 0.7 s later the camera eases (transform, 1.15 s) to a focus box
given as fractions of the capture. The caption is a bubble under the window
that fades out, changes, and fades back in. Tabs above jump to each stop.
Stills and recordings can share a bench; only the visible recording plays,
and the pause button hides on stills.

**A recurring diagram.** One drawing of the product's core object (a floor
plan, a pipeline, a journey curve) opens the page, comes back in the middle
chapters in different states, and closes the page. Build it as a small
component with methods for each state, so every chapter uses the same drawing.

**Computed diagrams.** Copy the product's own logic or data into the build
(unchanged) and compute every number the diagram shows at load. Name the
source files in the build README.

**Ripples.** When a whole grid changes state, change each cell with a delay
proportional to its distance from the cell the story is about (about 120 to
220 ms per step). The eye follows the change outward instead of seeing a flash.

**Signature moment.** One or two scenes per page carry the core idea as a
diagram that changes on a clock over two or three stops. Everything else
supports them.

**Phone layouts.** Stack columns; hide secondary paragraphs inside pinned
stages instead of shrinking type; give each tall group its own stop with
`.gapbig` spacing; replace tabs' long labels with short ones.

**Reduced motion.** `story.js` turns every act into flow and calls each
scene's `still()`. Lists of screens become a column of screens with captions;
diagrams show their final state; recordings show controls.

## Capturing a product

- Drive the running product with Playwright at 1440x900, `deviceScaleFactor: 2`,
  in any capture mode it has (no guides or hotspots). Save as WebP (quality
  about 84; a 2880x1800 screen is usually 100 to 300 KB).
- If the product's data feed is down, serve its own saved data at the URL it
  requests (`context.route`), and answer calls that hang as unavailable so the
  product's own error handling runs. Never change the product's code. Note
  this under the screens.
- Recordings: cut with ffmpeg to the part the caption describes (H.264, CRF
  about 27 to 30, no audio, `+faststart`), with a WebP poster from the first
  frame.

## Shipping a story page into a site

- Copy the build's runtime files (not notes, plans or scripts) into the site's
  static folder for the page's URL, add `<base href="/that/path/">` so
  relative assets resolve without a trailing slash, and a canonical link.
- If the site is a single-page app that also has a route at that URL, replace
  the route with a component that does a full page load to the static page,
  and leave the route out of any prerender step so it never overwrites it.
- Check every file against the host's size limit; keep heavy video on a CDN.
- Keep the third-party notice for Lenis with the page.
