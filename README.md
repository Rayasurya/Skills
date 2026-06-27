# Skills

Reusable workflows an AI coding agent loads on demand. Each folder has a `SKILL.md` — instructions plus a description of when to use it — and any scripts it needs. Drop a folder into your agent's skills directory and it loads when the work matches.

## Skills

- **[delegated-engineering](delegated-engineering/)** — Run engineering work as a primary agent that plans and verifies, with delegate agents that execute. Covers the plan/delegate division of labor, writing self-contained delegation kickoffs, and verifying delegated work instead of trusting the report.

- **[feature-cleanup](feature-cleanup/)** — A post-feature maintainability sweep: find dead files, unused dependencies, and dead assets, then produce a safe, delegatable cleanup plan. Analyzes only; never deletes. Bundled scan scripts.

- **[workbench-staging](workbench-staging/)** — Iterate risky changes in a throwaway, git-ignored workbench, verify them there, and copy only the finished result into the real source before committing.

## Use

Copy a skill folder into your agent's skills directory:

```bash
cp -R feature-cleanup /path/to/project/.claude/skills/
```

## License

MIT
