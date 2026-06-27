# feature-cleanup — worked example (portfolio-flair, 2026-06-27)

A real run of this skill. Shows the expected shape: evidence-backed findings → a sliced, delegatable cleanup kickoff. (Planner produced this; a delegate executed it.)

## Findings (abridged)
- **F1 — ~25 orphaned component files** (`scan-orphans.sh`): e.g. `AnalyticsDashboard.jsx` (433 LOC), `CircuitBoard.tsx` (677), `MotionDemos.jsx` (398), `ComponentsGrid.jsx` (382), `social-links.jsx`, `ShinyText.jsx`. ~4,000+ LOC.
  - *Why:* referenced by no import path. *Impact:* big LOC drop, simpler graph. *Risk:* LOW (build+typecheck+smoke catch breakage; cascade-rescan).
  - *Gotcha caught:* a file that had just been `@ts-nocheck`'d was itself dead — delete it, don't suppress it.
- **F2 — Unused deps** (`scan-deps.sh`): `matter-js`, `pptxgenjs`, `jszip` (UNUSED — only in dead `manualChunks` lines). `@mdx-js/react`, `sharp` flagged VERIFY.
  - *False positives correctly filtered:* `@mdx-js/rollup`, `@react-three/drei`, `recharts`, `@visx`, `rehype-slug`, `remark-gfm` show 0 `src/` imports but ARE used (MDX/3D/charts via config) → kept.
- **F3 — Dead assets** (`scan-assets.sh`): two unused thumbnail SVGs (10.5 MB + 7.7 MB) + ~13 smaller images + `.DS_Store`. ~18 MB.
- **F4/F5 — Duplicate copy-contact logic** (extract a `useCopyToClipboard` hook); `@solana/web3.js` heavy for one playground demo (flag, not delete).

## Cleanup kickoff handed to the delegate
> Branch `restructure`. After EVERY slice: `build + typecheck + tests + lint + bundle-size guard` all green; if a deletion turns a gate red, restore that file and flag it. Never touch `main`.
> - **Slice 1:** delete the orphan list → re-run `scan-orphans.sh` → delete new orphans → repeat until empty. Commit per round.
> - **Slice 2:** remove `matter-js`/`pptxgenjs`/`jszip` + their dead `manualChunks` lines; `npm install`.
> - **Slice 3:** verify-then-remove `@mdx-js/react` (MDX still renders) and `sharp` (full build passes).
> - **Slice 4:** delete dead assets; add `.DS_Store` to `.gitignore`.
> Report LOC/MB reclaimed. No merge/deploy without approval.
