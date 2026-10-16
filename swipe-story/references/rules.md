# The rules

Every rule here came from a real review of a real page. Each has the reason,
so it can be applied with judgement instead of by rote. Where a rule conflicts
with a habit or a default somewhere else, the rule wins.

---

## A. Pacing: what one swipe does

1. **One gesture, one step.** A wheel gesture moves exactly one stop, however
   far the wheel turned; a long, hard swing may pass several. Free scrolling
   must never leave a heading or paragraph hanging halfway up the screen.
   *Why:* readers lost their place when one flick ran through a whole section.

2. **Stops rest with air, near the centre.** Never park content against the
   top bar. Group a section's blocks into screenfuls and centre each group; a
   lone heading that leads into something tall rests about 10% from the top.
   A page that reads as one continuous article (not separate scenes) uses
   top-aligned stops with the same air, so nothing is cut at the top edge.
   *Why:* content stuck to the bar looks like a scrolling accident.

3. **Inside a section, quick. Between sections, one swipe.** A section's inner
   changes play on a clock after one swipe. Aim for two or three stops per
   pinned section; one stop per screen or card is fine where the content is a
   list of screens or cards.
   *Why:* seven-stop scenes felt endless, and scrubbed changes felt too fast.
   The fix for both is the same: fewer stops, timed change.

4. **Visible change runs on a timer, never inside a glide.** Scroll picks the
   state; the change plays at its own pace: 0.7 to 1.1 s per small change, at
   most about 3.5 s for a multi-step sequence.
   *Why:* a change scrubbed inside a stop-to-stop glide happens in its first
   15% and reads as a snap.

5. **Hold text long enough to read it.** Anything with words gets a hold.

6. **Card rows move with the page scroll.** A row wider than the screen is a
   pinned rail: each swipe slides one card (timed, about 0.7 s) until the last,
   then the page carries on. A sideways trackpad swipe does the same. The arrow
   buttons scroll the page to the matching stop.
   *Why:* rows that only scroll on their own were skipped entirely.

7. **Never scrub video with scroll.** Recordings loop, muted, while at least
   half on screen, with a pause button (WCAG 2.2.2).
   *Why:* nobody knows they must scroll to play a video, and a paused frame
   looks like a static picture.

8. **The first screen says what to do.** A visible "Scroll to begin" cue.

9. **Decorative loops wait for hover; content plays on its own.** Product
   recordings and story sequences play without asking. Ornament does not.

## B. Show, do not make them read

10. **Use a diagram wherever one can replace reading.** Before writing a
    paragraph or a card grid, ask whether a map, flow, timeline, unit chart or
    animated diagram can carry it. Comparisons become maps; pipelines become
    swimlanes; processes become flows; percentages become dot charts.
    *Why:* reading is harder than looking. Text-and-card pages were judged a
    downgrade from pages with diagrams.

11. **Complex flows: show the whole, then follow it.** Open on the whole
    system, then step through each hand-off with the detail beside it.

12. **Side content stays short.** Secondary detail goes behind a "+" tile, and
    the tile's first line says exactly what is inside.
    *Why:* a tile that does not say what it holds looks like a placeholder.

13. **Make long text scannable.** A big number or a bold first sentence per
    point, so a reader can skim 1, 2, 3 and move on.

14. **Lines that converge join cleanly**: one line, one dot, not overlapping
    strokes.

15. **Noise-to-signal visuals put colour on the signal only.**

## C. Truth to the product

16. **Product screens are the real product.** Capture them from the running
    product with a browser script. Never redraw, simplify or invent product UI.
    Take colours and type from the product's own code, not from comments or a
    guess.

17. **Devices and frames are exact.** Use an accurate device outline and
    realistic browser chrome; fit screenshots so nothing spills out and there
    are no letterbox bands.

18. **Signature objects are physical, not cute.** If a moment rests on a real
    object (a ring, a device), render it properly (a real 3D material and
    lighting), not as CSS gradients.

19. **Numbers in diagrams are computed.** If the product has an engine, a
    formula or a dataset, the diagram imports or reproduces it and says which
    file it came from. Example values are labelled as examples.

20. **Show only the owner's own work. Prove where every recording and
    screenshot came from.** A file in the project folder can be a recording of
    someone else's product. Check each screen's distinctive labels against the
    owner's code history (`scripts/provenance.sh`). If a label never existed
    there, do not use the footage. Write the provenance in the build notes.
    *Why:* a page once showed another team's product as the owner's.

21. **Honest claims.** Never claim research that did not happen, speed for a
    mock, or a result without a source. Label simulated or projected numbers
    as such. Timelines match the history (commit dates), not a round number.
    List every claim removed or changed in the build notes.

22. **A live product that cannot be captured is not linked.** Use recordings
    of it working, say so, and leave the live link out until it works.

## D. Make it noticeable

23. **Put key information where the eye already is.** A caption in a corner or
    a side column gets missed. Put it under the subject or on it, as a bubble
    pointing at what it describes.

24. **Show where to interact.** If the reader has to click or tap, mark the
    spot with a large, bright pulsing dot.

25. **Motion cues must be visible.** Thin strokes and faint pulses go unseen.

26. **Controls look like what they are.** A toggle looks like a toggle, tabs
    look like tabs, a comparison slider starts at 50%. A back link is a button
    at the left of the bar, styled like its neighbours, not bare text beside a
    pill.

27. **Every control works.** No dead clicks, no placeholder buttons.

## E. Layout craft (check every screen)

28. Spacing that should be equal looks equal, measured visually.
29. Nothing cut off, nothing overlapping, no text leaving its box, readable
    contrast on every background.
30. No orphan line breaks in short labels.
31. Text is large enough to read at a glance.
32. Decorations never break the text flow.
33. Short flow sections fill the screen (`.solo`), and a second group in a
    section starts far down (`.gapbig`) or gets its own section, so a centred
    stop never shows a sliver of its neighbour.
34. A button that wraps an image gets `width: 100%`. Buttons shrink to their
    content, so a lazy image inside starts at 0 px and the page grows after
    the stops were measured.
35. Elements waiting for their arrival animation are hidden, not dimmed.
    Dimmed text fails contrast checks and reads as broken.
36. Uppercase is for short labels only. A sentence is never set in capitals.
37. No coloured glow shadows and no gradient text; neutral elevation only.

## F. Words on the page

38. Plain, short, human. No em dashes, no stock AI vocabulary, no "not X, it's
    Y" rhythm, no florid lines.
39. Story order: the problem first, the crux early, side material later or
    behind a tile.
40. Headings are plain statements of what the section shows.

## G. How to work

41. **Review it yourself before saying it is done, and be harsh.** Screenshot
    every stop at 1440x900 and 390x844, time-lapse every timed sequence (frames
    every 0.3 to 0.5 s), run the accessibility check, and look at all of it.
42. **Write the decisions down.** Each build has a README listing the sources
    of truth, the calls made while building and the claims removed.
43. **Nothing ships without the owner's yes**, and every change ships the same
    way: build, test, then publish.

---

## Pre-delivery checklist

- [ ] Every wheel gesture lands on a stop; no text hangs mid-screen.
- [ ] Stops rest with air; groups are centred; no slivers of neighbours.
- [ ] Pinned sections have two or three stops (or one per screen or card).
- [ ] No change a reader must see is scrubbed by scroll.
- [ ] Card rows longer than the screen move with the scroll.
- [ ] No video is scrubbed; recordings loop with a pause button.
- [ ] Every chapter that can be a diagram is one; its numbers are computed.
- [ ] Product screens were captured from the running product.
- [ ] Every recording's provenance was checked against the owner's code.
- [ ] Claims match the code, the data and the history; removals are listed.
- [ ] Captions sit where the eye is; interactive spots are marked.
- [ ] Every control works, including the back button and the index.
- [ ] Spacing, overlap, cut-off and contrast pass on desktop and phone.
- [ ] Reduced motion: no pinning, every final state visible.
- [ ] Every stop screenshotted at desktop and phone; every timed sequence
      time-lapsed and looked at; accessibility check at 0.
