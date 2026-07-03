---
name: delegated-engineering
description: An operating model for running engineering work as a strong primary agent that thinks + delegates, with execution agents that do the work. Three parts — plan-and-delegate division of labor, writing self-contained delegation kickoffs, and independently verifying delegated work. Use when starting a non-trivial body of work and deciding who does what, when handing a task to a sub-agent or delegate, or when an agent reports a task finished and you need to verify it before trusting or merging.
---

# Delegated Engineering

How to run engineering work with one **primary** agent (the strongest model — thinks, plans, verifies) and **delegate** agents (execute). The loop: **plan → write a kickoff → delegate → verify → (corrective kickoff for gaps) → repeat.** The three sections below are the three moves in that loop.

---

## 1. Plan and delegate (the operating model)
- **The primary agent thinks; it does not execute.** Its job is understanding, planning, slicing work, making decisions, and verifying. It holds context and continuity across the whole effort.
- **Every execution task is delegated.** Mechanical or predetermined work (renames, CLI runs, writing decided content, find-and-replace) → a cheap model. Judgment and synthesis → stay with the primary.
- **Rule of thumb:** if a change is more than a quick edit, or it's reversible mechanical work, *write the instructions, don't do the work.*
- **Authorization gate:** the planner never edits product/app code without explicit per-task permission. "Audit this" / "answer a question" is NOT permission to code.
- Delegates start **cold** — they have none of the primary's conversation. That constraint shapes Section 2.

## 2. Write the delegation kickoff
A kickoff is a **self-contained** prompt a cold agent can run top-to-bottom. Include file paths and enough context to act without your conversation.

Structure:
- **Cold-start context** — branch, repo, and where the detailed specs live (reference docs instead of re-pasting them; keep the prompt small).
- **Standing rules (apply to every slice):**
  - Commit each slice separately; never pile up uncommitted work.
  - **Verify at RUNTIME, not just build** — load the real app/site and check behavior. Build/exit-0/grep passing is NOT enough; that's how bugs ship.
  - Keep all gates green: lint, typecheck, bundle/size limits, tests.
  - Never touch the `main`/release branch. Never commit local planning artifacts.
- **Ordered slices/phases**, each with a **Definition of Done** (demoable + gates green).
- **A BLOCKED section** — anything gated on a missing asset or a human decision: explicitly "do NOT start."
- **STOP before merge/deploy** — report and wait for approval on irreversible or outward-facing steps.
- **Implement-only:** if a design/label/target isn't specified, the delegate STOPS and asks — it never invents product decisions.

**Delivery rules (hard-won; violations cost sessions):**
- **Kickoff → chat only. Plan → file only. NEVER both / never mixed.** A kickoff pasted into a plan file confuses the executing agent; duplicated output wastes tokens.
- **Produce the kickoff proactively** the moment delegation is decided — never wait to be asked.
- **One combined kickoff for a multi-task plan** (not one per task), unless the user asks otherwise.
- **Batch parallelizable work:** when slices are independent (e.g. per-file migrations), write one kickoff with per-batch sections and say "fire a separate agent per batch — no ordering required."
- **Require a durable state file:** every kickoff instructs the delegate to maintain a `task.md` with checkboxes + a progress log, so a killed session can resume from the last unchecked item (real losses have happened without this).

**Skeleton (adapt, don't worship):**
```
# KICKOFF — [Task]
Role: [builder|reviewer|executor] in [repo] at [path].
Read first: [plan/spec files — reference, don't re-paste].
Scope: [exact deliverable]. Out of scope: [explicit].
Hard rules: [gates, bans, commit/attribution rules, STOP conditions].
Tasks (ordered): 1… 2… 3… each with DoD.
Blocked (do NOT start): […]
Maintain task.md with checkboxes + progress log.
When done: [report format]; STOP before merge/deploy.
```

## 3. Verify delegated work
**Never trust the "all done / all green" self-report.** Re-run everything yourself.
- **Re-run every gate independently:** build, lint, typecheck, size guard, tests — AND verify at **runtime** (load the app, exercise the actual behavior). A green build ≠ a working feature.
- **Reconcile each claimed item against the real code** — read the diff/files. A passing test suite doesn't prove the feature is correct or the spec was met.
- **Report honestly:** separate what's truly green, what's not-done, and what's done-wrong. Don't soften a "done" that isn't.
- **For gaps, produce a corrective kickoff** (loops back to Section 2) — include the exact gap, a before/after example, and a "WHY THIS EXISTS (do not repeat)" note so the delegate doesn't re-derive.
- **Common traps to catch:** a gate that's secretly a no-op (e.g. a `typecheck` that's `echo skip`); a self-report that quietly redefined the task; "cleanup done" that only half-happened; a fix applied backwards; **a regression test that passes on broken code** (prove red-green: revert the fix → test must FAIL → restore); **a claimed push that never reached the remote** (`git log origin/main -1` yourself); commit messages using a different issue-numbering than the tracker.

**Standard verify checklist (run all six):**
1. **Diff vs kickoff scope** — list every claimed task; diff actual code per claim; flag skipped or out-of-scope changes.
2. **Gates re-run yourself** — build, typecheck, lint, tests, size guards; plus RUNTIME behavior.
3. **Live spot-checks** — open the modified screens; verify each claim visibly; screenshot for the record.
4. **Consistency** — no banned UI patterns (AGENTS.md / deaify), no attribution trailers, no committed local-only dirs (`.claude/`), matches project style.
5. **Repo state** — remotes actually updated (all repos that should sync), no stray tracked files, clean status.
6. **State file** — delegate's `task.md` exists, all claimed boxes checked, log shows no silent gaps.

Output verdict: "✓ Verified, ready to ship" or "✗ [gap list] → corrective kickoff issued." Nothing ships on a failed check.

---
*Battle-tested in practice — this verification pass has caught a fake TypeScript migration, a polish fix applied backwards, and incomplete cleanup that a "all green" report claimed was finished.*
