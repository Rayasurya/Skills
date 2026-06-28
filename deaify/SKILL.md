---
name: deaify
description: Make UI not look AI-generated or templated. A living rulebook of UI patterns the user has banned for reading as "AI-like" or off-brand, each paired with the approved alternative. Use when building, restyling, or reviewing any UI component, and add a new rule every time the user flags something as looking AI-generated.
---

# DeAIfy

A rulebook of UI patterns that read as AI-generated or templated and must not be used. Apply every rule when building or reviewing UI. The list is the source of truth for taste — when the user says "this looks AI" or "don't use this again," that pattern becomes a new rule here.

## How to read a rule
**Banned:** the pattern. **Instead:** the approved alternative. *(why / where it was flagged)*

## Rules — banned, absolute
- **A single-side colored border / bar / line / side-rail on a component** — a colored stripe on the left (or any one edge) of a card, input, row, button, callout, or list item. Anything.
  **Instead:** a text badge or label, a full even border, or a subtle background tint. Never a one-sided accent stripe.
  *(Off-brand. Flagged repeatedly: an amber left-bar on "User Needed" rows, then again on marketplace/blog cards. "We never use this single line on one side of a component. Never.")*
- **Idle text color left unchanged when a button's background changes on click/active state** — e.g. black text sitting on a bright green "Copied!" background, where it's barely readable.
  **Instead:** set the state's text color for contrast — a bright/full-color background gets **white** text; a light/whitish background gets a dark text with enough contrast. The label must stay clearly legible in *every* state.
  *(The copy button's clicked state turned the background green but the text stayed black/dark.)*
- **An abrupt, flat swap between UI states** — a control snapping instantly to a new solid state (e.g. a button flipping straight to solid green "Copied!").
  **Instead:** a smooth morph/transition between states.
  *(The flat instant "Copied!" swap read cheap.)*
- **Gratuitous drop shadows on icons and panels.**
  **Instead:** keep it flat — no shadow, or one so subtle it's clearly intentional.
  *(The monitor-icon drop shadow on the mobile notice was flagged as bad.)*
- **A raw, plain screenshot used as a card thumbnail.**
  **Instead:** a brighter, mockup-framed visual (e.g. a device frame), not a flat screen grab.
  *(Plain dashboard screenshots read weak next to mockup visuals.)*

## How this grows
Every time the user flags a pattern as AI-like or off-brand, add it under **Rules** with: the banned pattern, the approved alternative, and where it was flagged. Keep entries concrete enough to act on without re-asking. Before building UI, read this list and conform to it.
