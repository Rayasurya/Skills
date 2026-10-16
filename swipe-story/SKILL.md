---
name: swipe-story
description: Build scroll-driven story pages (case studies, product stories, launch pages) where one swipe moves to one stop, changes play on a timer instead of being scrubbed by scroll, diagrams carry the argument, and every screen and number comes from the real product. Ships its own scroll engine, page controller, starter template, rules from real reviews, and review scripts that screenshot every stop. Use for "scroll story", "scrollytelling", "case study with motion", "Apple-style scroll page", "pinned scroll section", "turn this case study into a scroll experience", or when reviewing or fixing a scroll-driven page.
---

# swipe-story

A way to build scroll pages people can read: the page moves one stop per
swipe, rests with the content centred, plays each change at a readable pace,
shows diagrams instead of paragraphs, and shows only the real product.

Everything needed is in this folder:

| Path | What it is |
|---|---|
| `kit/` | The scroll engine (`stage.js`), the page controller (`story.js`), base styles (`story.css`), Lenis and its notice. |
| `template/` | A working starter page: hero, facts, a signature scene, a rail, an arrival diagram with a "+" tile, a bench of screens, a close. |
| `scripts/` | `new.sh` (start a build), `serve.py`, `walk.mjs` (every stop), `timelapse.mjs`, `sheet.py`, `axe.mjs`, `provenance.sh`. |
| `references/rules.md` | The rules, each with its reason, and the pre-delivery checklist. **Read it before building or reviewing.** |
| `references/mechanics.md` | Markup, scene API and the patterns that worked. |
| `references/review.md` | The review pass, step by step. |

## Workflow

### 1. Gather the truth first

- The words: every heading, paragraph, number and link from the current page
  or brief, copied as is (a cheap sub-agent can do this extraction).
- The product: its running build or deployed URL, its code, its data. Find
  the product's own colours, typeface and any engine or formula behind its
  numbers.
- Provenance: for every recording or screenshot you plan to use, check its
  on-screen labels against the owner's code history
  (`scripts/provenance.sh <repo> "label" ...`). Drop anything that is not
  theirs.
- Claims: mark every number and claim as sourced, simulated, projected or
  unsupported. Unsupported claims are removed and listed.

### 2. Plan the chapters

One line per chapter: its plain-statement heading, the diagram or screen that
carries it, pinned or flow, and how many stops. Pick one or two signature
moments where the core idea changes on screen over two or three stops. If the
product has a core object (a map, a pipeline, a journey), make it the page's
recurring drawing. Write the plan into the build README (or show it, if the
owner wants to approve plans before building).

### 3. Build

```bash
bash scripts/new.sh path/to/build      # kit + template + README skeleton
python3 path/to/build/serve.py 4700
```

- Set the product's tokens and type in `page.css`.
- Replace the template's sections with the plan's chapters; keep the patterns
  (`.solo`, `.gapbig`, `data-block`, bubbles, rails, the bench).
- Write each pinned scene in `scenes.js`: scroll picks the stage, the change
  plays on a clock, `still()` shows the final state.
- Compute diagram numbers from the product's own code or data.
- Capture screens from the running product (see `references/mechanics.md`).

### 4. Review it yourself, harshly

Follow `references/review.md`: every stop at desktop and phone, time-lapses of
every timed sequence, accessibility at 0, reduced motion, provenance and
claims. Fix and repeat until the contact sheets have nothing to fix.

### 5. Hand over

Show the page and summarise: what it shows, what was checked, which claims were
removed and why, and anything the owner must decide. Publish only with the
owner's yes; after publishing, load the live URL in a real browser and check it.

## Hard rules (the short version of `references/rules.md`)

- One swipe, one stop. Stops rest centred with air. No text hanging mid-screen.
- Two or three stops per pinned scene. Visible change on a timer, never scrubbed.
- Card rows wider than the screen move sideways with the scroll.
- Recordings loop with a pause button; never scrub video.
- A diagram wherever one can replace reading; its numbers are computed.
- Only the real product, and only the owner's own work.
- Captions sit on the subject as bubbles; tappable spots are marked.
- Plain words; no em dashes; uppercase only for short labels.
- Review every stop yourself before anyone else sees it.

## Adding to this skill

When a reviewer flags something new, add a rule to `references/rules.md` with
its reason, and fix the kit or template if the problem came from them, so the
next page starts without it.
