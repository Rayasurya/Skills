---
name: feature-cleanup
description: Post-feature codebase cleanup review. Runs a senior-engineer maintainability sweep — finds dead/orphaned files, unused dependencies, dead assets, duplicate logic, and tech debt — then produces a safe, delegatable cleanup kickoff (analysis only; it never deletes). Use when finishing a feature, after adding or creating something new, before merging a branch, or when the user asks to clean up dead code, remove unused code/deps/assets, reduce technical debt, or simplify the codebase.
---

# Feature Cleanup

A post-feature dead-code/maintainability sweep. **Division of labor: this skill ANALYZES and produces a cleanup plan. It does NOT delete anything — a delegated agent executes the cleanup.** Be aggressive but safe: the goal is to remove anything that doesn't provide value, with the build/typecheck/test suite as the safety net.

## Quick start
From the repo root:
```
bash scripts/scan-orphans.sh        # dead/orphaned source files
bash scripts/scan-deps.sh           # declared-but-unused dependencies
bash scripts/scan-assets.sh         # imported-nowhere assets (biggest first)
```
(Pass a custom source dir as `$1`, e.g. `bash scripts/scan-orphans.sh app`.)

## Workflow
1. **Scan** — run the three scripts. They are heuristics that surface candidates.
2. **Triage / verify (critical — this is the "safe" in "aggressive but safe"):**
   - **Orphans cascade.** Deleting a file can expose new orphans (its now-unreferenced imports). The cleanup must RE-RUN the orphan scan after each deletion round until it prints nothing.
   - **Filter dependency false positives.** A dep with 0 `src/` imports may still be used in `vite.config`/build scripts (vite plugins like `@mdx-js/rollup`, image tools like `sharp`, MDX `rehype-*`/`remark-*` plugins). `scan-deps.sh` shows config/script ref counts — anything >0 is verify-before-removing, not a clean delete.
   - **Watch dynamic/config references** — files loaded by string path, framework convention, or config won't show in a basename scan. Spot-check the large/important-looking candidates by reading them.
3. **Report** — for EACH finding give: **why unnecessary**, **impact of removing**, **risk before deletion**. Group: dead files · unused deps · dead assets · duplicate logic · tech-debt flags (heavy single-use deps, etc.).
4. **Produce the cleanup kickoff** — a delegatable, sliced plan (one commit per slice). Mandatory safety rule baked into every slice: after EACH deletion `build + typecheck + tests (+ lint + bundle-size guard)` must ALL stay green; if a deletion turns any gate red, restore that file and flag it.

## Findings format (per item)
- **What:** the file/dep/asset.
- **Why unnecessary:** evidence (referenced nowhere / only in dead config / superseded).
- **Impact:** LOC or MB reclaimed, fewer deps, simpler graph.
- **Risk:** LOW/MED/HIGH + the verification that de-risks it.

## Safety rules (non-negotiable)
- Analysis only — never delete; hand execution to a delegate.
- Every deletion slice is gated by a green build + typecheck + test run. The test/build suite is what makes aggressive deletion safe.
- Delete in rounds, re-scanning for cascade until dry.
- Never delete entry points, config-referenced files, or anything you haven't confirmed is unreferenced.

## Reference
A worked example of the full output (findings + sliced cleanup kickoff) is in [EXAMPLE.md](EXAMPLE.md).
