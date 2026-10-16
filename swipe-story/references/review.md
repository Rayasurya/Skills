# Review: how to check a page before anyone else sees it

Run these from a folder where `playwright-core` is installed (any Node project
with it as a dependency), with the build served (`python3 serve.py 4700`).
`$K` is this skill's `scripts/` folder.

## 1. Every stop, desktop and phone

```bash
node $K/walk.mjs http://127.0.0.1:4700/ /tmp/walk-d 1440 900
node $K/walk.mjs http://127.0.0.1:4700/ /tmp/walk-m 390 844
python3 $K/sheet.py /tmp/walk-d /tmp/walk-d-sheets 3 12 480
python3 $K/sheet.py /tmp/walk-m /tmp/walk-m-sheets 8 24 260
```

`walk.mjs` prints the stop list, warns about stops closer than 20% of a screen
(a swipe that seems to do nothing) and prints console errors. Open every
contact sheet and look at every frame for:

- text hanging mid-screen, content stuck to the bar, slivers of the next or
  previous section at a stop;
- anything cut off, overlapping, or leaving its box; captions covering the
  subject; tags breaking words;
- a stop that looks the same as the one before it;
- a pinned scene still in its "not yet" state at its first stop;
- the bar's chapter name matching the content.

## 2. Every timed sequence

```bash
node $K/timelapse.mjs http://127.0.0.1:4700/ /tmp/tl ch-02 0 0.5
```

Check the pace: a small change should take 0.7 to 1.1 s, a sequence at most
about 3.5 s, and words should hold long enough to read.

## 3. Accessibility

```bash
AXE=/path/to/axe.min.js node $K/axe.mjs http://127.0.0.1:4700/
```

Target: 0 violations. Common causes: text dimmed before an arrival animation
(hide it instead), muted greys on tinted grounds, white text on a light accent.

## 4. Reduced motion

Load the page with `reducedMotion: 'reduce'` (Playwright context option) and
check: no pinning, every scene's final state visible, nothing left at opacity
0, recordings with controls, no console errors.

## 5. Truth

- Every product screen: captured from the running product, and its labels
  checked against the owner's code:
  `bash $K/provenance.sh <repo> "A label on the screen" "Another label"`.
- Every number: traced to the code, data or source that produces it; examples
  labelled as examples; simulated or projected numbers labelled.
- Timelines checked against the history (`git log --format='%ad' --date=short`).
- The build README lists what was removed or changed, and why.

## 6. After publishing

Load the live URL in a real browser (some hosts block command-line clients),
check the title, the stop count and the console, and spot-check one stop.
