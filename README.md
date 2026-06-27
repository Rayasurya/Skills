# Claude Code Skills

Original [Claude Code](https://claude.com/claude-code) skills by **Raya Surya**.

Skills are reusable, model-invokable workflows. Each lives in its own folder with a `SKILL.md` (instructions + trigger description) and any bundled scripts. Drop a skill folder into your `.claude/skills/` directory and Claude will load it when the work matches its description.

## Skills

### [`feature-cleanup`](feature-cleanup/)
A post-feature codebase cleanup review. Runs a senior-engineer maintainability sweep — finds dead/orphaned files, unused dependencies, dead assets, duplicate logic, and tech debt — then produces a safe, **delegatable** cleanup plan. It analyzes only; it never deletes (execution is handed to another agent, gated by a green build + typecheck + tests after every change).

**Use it when** you finish a feature, add something new, or before merging a branch.

Bundled deterministic scans:
- `scripts/scan-orphans.sh` — source files referenced nowhere (with cascade re-scan).
- `scripts/scan-deps.sh` — declared-but-unused dependencies (filters build-plugin false positives).
- `scripts/scan-assets.sh` — assets imported nowhere, biggest first.

See [`feature-cleanup/EXAMPLE.md`](feature-cleanup/EXAMPLE.md) for a real worked run.

### [`delegated-engineering`](delegated-engineering/)
An operating model for running engineering work as a strong **primary** agent that plans + verifies, with **delegate** agents that execute. Three parts: the plan-and-delegate division of labor, how to write a self-contained delegation kickoff, and how to independently verify a delegate's work — never trusting the "all green" self-report.

**Use it when** deciding who does what, handing a task to a sub-agent, or checking a result before you trust or merge it.

## Install

```bash
# clone, then symlink or copy a skill into your project (or ~/.claude/skills for global use)
cp -R feature-cleanup /path/to/your-project/.claude/skills/
```

## License

[MIT](LICENSE) © Raya Surya
