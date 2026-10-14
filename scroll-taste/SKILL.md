---
name: scroll-taste
description: Rules for scroll-driven pages, scrollytelling case studies and animated product stories that people can actually read. Covers pacing (one swipe, one stop; timed changes instead of scroll scrubbing), stops that rest centred, horizontal card rails, diagrams over paragraphs, truth to the real product, noticeable captions and affordances, layout checks, and a self-review pass with screenshots of every stop. Use when building, reviewing or fixing any scroll-driven or Apple-style page, a pinned/sticky scroll section, a scroll animation, or a case study with motion. Pairs with any build skill (scroll-craft, GSAP, Framer Motion, plain CSS).
---

# Scroll taste

A scroll page fails in two opposite ways. Changes fly past in one wheel tick and nobody sees them, or the reader has to swipe ten times to get through one idea. Both come from the same mistake: letting scroll distance drive things the reader is supposed to watch. These rules fix that, and the rest of the ways a scroll page stops being readable.

Every rule here came from a real review of a real build. Each says what to do, then why. Apply all of them; where they conflict with a build skill's defaults, these win.

Code for the mechanics is in [references/patterns.md](references/patterns.md). Review scripts are in `scripts/`.

## A. Pacing: what one swipe does

1. **One gesture, one step.** A wheel gesture moves exactly one stop, however far the wheel turned. A long, hard swing may pass several. No free-scroll stretch may leave a heading or a paragraph hanging halfway up the screen.
   *Why:* raw wheel distance makes the page travel as far as the finger did, so readers overshoot what they meant to read.

2. **Stops rest with air, near the centre.** Never park content against the top bar. Group a section's blocks into screenfuls and centre each group in the space under the bar. A lone heading that leads into something tall rests about 10% down.
   *Why:* content pinned under the bar looks stuck, not placed.

3. **Inside a section: quick. Between sections: one swipe.** Two or three stops per pinned section is normal; seven is a chore. The section's inner steps play on a clock after one swipe.
   *Why:* a seven-stop sequence and a four-stop counter both read as "too much scrolling", while the same content scrubbed by scroll read as "too fast". Fewer stops plus timed change fixes both.

4. **Visible change runs on a timer, never inside a glide.** Scroll picks the state; the change plays at its own pace: 0.7 to 1.1 s for one small change, up to about 3.5 s for a multi-phase sequence. Going back can run faster (about 2.5x).
   *Why:* a change scrubbed by scroll inside a stop-to-stop glide happens in the first 15% of the glide and reads as a snap, however long the glide is.

5. **Hold words long enough to read.** Anything with text gets a hold. Text arrives once and stays; never fade text out on scroll.

6. **Card rows move with the page scroll.** A row of cards wider than the screen is a pinned rail: each swipe slides one card (timed, about 0.7 s) until the last card, then the page carries on. A sideways trackpad swipe does the same. Arrow buttons scroll the page to the matching stop, so wheel, keys and arrows agree.
   *Why:* swipe-only galleries get scrolled straight past; readers never see the last cards.

7. **Never scrub video with scroll.** Recordings autoplay muted on a loop while at least half on screen, with a visible pause button (WCAG 2.2.2).
   *Why:* nobody knows to scroll a video forward. A scrubbed clip sitting still looks like a broken image.

8. **The first screen says what to do.** A visible "Scroll to begin" cue, and a "Keep scrolling" nudge after a few idle seconds inside an unfinished pinned section.

9. **Decorative loops play on hover; content plays on its own.** Ambient icon animations stay still until hovered. Product recordings and story sequences play without asking.

## B. Show, don't make them read

10. **Use a diagram wherever one can replace reading.** Before writing a paragraph or a card grid, ask whether a map, flow, swimlane, unit chart or animated diagram can carry it. Comparisons become positioning maps; pipelines become swimlanes; processes become flows.
    *Why:* reading is harder than looking. A page of cards and text is a downgrade from the same story told in pictures.

11. **Complex flows: zoom out, then follow.** Open on the whole system, then zoom to each hand-off in order, with the matching detail beside it.

12. **Side content stays short.** Secondary detail goes behind a "+" tile, and the tile's visible line says what is inside. A tile that only says what it is when clicked looks like a placeholder.

13. **Make long text scannable.** Big numbers or a bold first sentence per point, so a reader can skim 1, 2, 3 and move on.

14. **Converging lines join cleanly.** When dots or lines meet, they become one seamless stroke, not separate pieces overlapping.

15. **Signal-from-noise visuals put colour on the signal.** Dense looping text with the key terms highlighted reads instantly as "finding signal in noise".

## C. Truth to the product

16. **Product screens are the real product.** Capture them by driving the running app (Playwright or similar). Never redraw, simplify or invent product UI for the page.
    *Why:* reviewers who know the product spot invented components immediately, and it undermines everything else on the page.

17. **Devices and frames are exact.** Use the real device drawing and realistic browser chrome. Fit screenshots so nothing spills out of the frame and there are no letterbox bands on video.

18. **Signature objects are realistic, not cute.** If a moment rests on a physical object, render it physically (for example three.js with physically based materials and a studio environment map), not CSS gradients that look like a child's drawing.

19. **Claim only what is true.** Never rename the product's features, never claim research that did not happen, never claim speed for a prototype. Simulated numbers are labelled simulated.

## D. Make it noticeable

20. **Put key information where the eye already is.** Captions in a corner or a side column get missed. Put them under the subject, or on the screen as an info bubble pointing at what they describe.

21. **Show where to interact.** If the reader has to click or tap, mark the spot with a pulsing dot that is clearly visible: big enough, bright enough.

22. **Motion cues must be visible.** Subtle pulses and hairline strokes go unseen. Use a thicker, brighter line than feels necessary, then check it at a glance.

23. **Controls look like what they are.** A toggle looks like a toggle, tabs look like tabs, a comparison slider starts at 50% so it reads as a comparison.

24. **Every control works.** No dead clicks, no placeholder buttons. Sweep every tappable thing before delivery.

## E. Layout craft (check every screen)

25. Spacing that should be equal looks equal, judged by eye, not just by CSS values.
26. Nothing cut off, nothing overlapping, no text leaving its box, readable contrast on every background, including over images and on dark stages.
27. No orphan breaks in short labels: a two-word label stays on one line.
28. Text is large enough to read at a glance, especially inside large 3D or video scenes.
29. Decorations never break the text flow (icon pills that make a heading re-wrap are out).

## F. Words on the page

30. Plain, short, human. No em dashes, no AI vocabulary ("seamless", "leverage", "delve"), no "not X, it's Y" rhythm, nothing florid. Professional, not poetic.
31. Story order: the problem first, the crux early, side material later or behind a tile.
32. One structure and design language across a set of case studies; a new one matches the others.

## G. How to work

33. **Review it yourself before saying done, and be harsh.** Screenshot every resting stop at desktop (1440x900) and phone (390x844). Capture a time-lapse of every timed sequence (a frame every 0.4 to 0.5 s). Look at the frames, not a summary. See [Review](#review).
34. Map the information architecture and the flow before building UI.
35. Iterate somewhere throwaway; ship only on an explicit yes.
36. Borrow Apple's mechanics where they help (stops, holds, rails), but these rules beat any Apple default.

## Review

```bash
# every resting stop, one PNG each (page must expose its stops, see patterns.md §7)
node scripts/stopwalk.mjs http://localhost:3000 out/desktop 1440 900
node scripts/stopwalk.mjs http://localhost:3000 out/phone 390 844
python3 scripts/sheet.py out/desktop out/desktop/sheets     # contact sheets to read

# a timed sequence, frame by frame: selector, then "offset:ms,ms;offset:ms,..."
node scripts/timelapse.mjs http://localhost:3000 out/forge 1440 900 "#forge" "0:400,900,1600;900:400,800,1200,2000,3600"
```

Needs Node with `playwright` or `playwright-core`, and Python with Pillow for the sheets. Set `CHROME=/path/to/chrome` to use an installed browser.

## Pre-delivery checklist

- [ ] Every wheel gesture lands on a stop; no text hangs mid-screen.
- [ ] Stops rest with air above them; groups are centred.
- [ ] Pinned sections have two or three stops; inner changes run on a clock.
- [ ] No change a reader must see is scrubbed by scroll.
- [ ] Card rows wider than the screen move with the scroll.
- [ ] No video is scrubbed; recordings autoplay with a pause button.
- [ ] Every chapter that can be a diagram is one.
- [ ] Product screens were captured from the running product.
- [ ] Devices, frames and signature objects look real.
- [ ] Captions sit where the eye is; interactive spots are marked.
- [ ] Every control works.
- [ ] Spacing, overlap, cut-off and contrast pass on desktop and phone.
- [ ] Copy is plain, with no em dashes.
- [ ] Every stop screenshotted at desktop and phone; every timed sequence time-lapsed and looked at.

## How this grows

When a review flags something new about a scroll page (too fast, too slow, missed, unreadable, fake), add it here as a rule: what to do, then why. Keep each rule concrete enough to act on without asking again.
