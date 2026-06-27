---
name: workbench-staging
description: Iterate risky or exploratory changes in a throwaway, git-ignored workbench, verify them there, then copy only the finished result into the real source. Use when a change needs trial-and-error, when you want to keep the working tree clean while experimenting, or before applying a large or generated edit to production code.
---

# Workbench Staging

Keep experiments out of the real source until they're proven.

## The rule
Do the messy work in a git-ignored workbench (`workbench/` or `.agents/workbench/`). Iterate and verify there. Only when the result is correct do you copy the specific finished files into the real `src/` — then commit. The workbench is never committed and never deleted.

## Why
- The working tree stays clean — no half-done experiments tangled into real diffs.
- A bad attempt is thrown away with zero cleanup.
- The commit holds only the finished change, not the trial-and-error that produced it.

## Workflow
1. Add the workbench directory to `.gitignore` once.
2. Reproduce the relevant file(s) in the workbench and iterate there.
3. Verify in the workbench — run it, test it — until it's correct.
4. Copy the finished file(s) surgically into `src/` — only what actually changed.
5. Run the project's gates against `src`, then commit.
6. Leave the workbench in place for the next experiment.

## Notes
- Copy the *result*, not the whole workbench — keep the real diff minimal and intentional.
- Never delete the workbench; it is scratch space, not deliverable.
