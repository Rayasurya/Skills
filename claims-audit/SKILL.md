---
name: claims-audit
description: Audit case-study or portfolio copy for hallucinated, unsupported, or overclaimed statements before shipping. Builds a claim-by-claim truth table against the actual product code/screens, flags overclaims, validates UX-law citations, and proposes honest rewrites. Use before publishing any case study, portfolio page, resume bullet set, or outreach copy that makes claims about a product, process, or outcome.
---

# Claims-Audit (Case Studies & Portfolio Copy)

Protects recruiter-facing credibility: one probed overclaim in an interview costs more than ten honest sentences. Run BEFORE shipping any claim-bearing copy. This is an audit — output findings and rewrites; **never edit the copy directly** — hand results back for review.

## Process

### 1. Gather both sides
- Open the copy under audit (case study / page / bullets).
- Open the actual product: code, screens, data files. Claims are checked against what EXISTS, not what was intended.

### 2. Build the truth table
Extract every factual claim, one row each:

| Claim | Evidence (file/screen/data) | Verdict |
|---|---|---|
| "Multi-agent orchestration" | 4 agents + 15 sub-agents in product code | ✓ Real |
| "Reduces review time by 50%" | No timing data, no user test | ✗ Overclaim |
| "Integrated FAERS/EudraVigilance" | Mocked endpoints, not live APIs | ⚠ Synthetic — label it |

Verdicts: **✓ Real** (evidence exists) · **⚠ Synthetic/Simulated** (exists but mocked — must be labeled, not removed) · **✗ Overclaim** (no support — rewrite) · **✗ Fabricated** (never happened — remove).

### 3. Probe the classic overclaim shapes
- **"We [did action]"** — did it actually happen, or is it aspirational/mocked?
- **"The product [does feature]"** — does a screen actually show it?
- **"[N] users / reports / % improvement"** — real data, or synthetic? Synthetic numbers are allowed ONLY with an explicit "simulated" label.
- **"We discovered / users told us"** — documented research, or inference? Never assert research that didn't happen.
- **"Fast / scales / production-ready"** — banned without proof; prototypes "provide the experience of," they don't "perform."
- **"Built"** vs **"Prototyped/Designed"** — claim only the verb that's true.

### 4. Validate every citation
UX principles/laws must cite recognized sources only: Nielsen Norman Group, Don Norman / Jakob Nielsen books, peer-reviewed HCI work (e.g. ACM CHI). Invented or unverifiable law names → remove.

### 5. Output
1. The full truth table.
2. A rewrite list for every ✗/⚠ row, preserving persuasive force while staying true:
   - "Reduces review time by 50%" → "Streamlines review into a single adjudication flow (simulated workload: 5h → 22min)"
   - "We discovered users want X" → "The design prioritizes X"
   - "Built in 6 weeks" → "Prototyped in 6 weeks"
   - "Scales to millions" → "Designed for enterprise-scale scenarios"
3. A one-line shipping verdict: SAFE TO SHIP / SHIP AFTER REWRITES / DO NOT SHIP.

## Standing honesty rules (apply even outside audits)
- A concept/portfolio product is presented as "designed to production standards," never as shipped software.
- Simulated metrics are fine — always explicitly labeled.
- The colophon states what's real: sole author, prototype, mock data.
