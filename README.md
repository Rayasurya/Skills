# Skills

Reusable workflows an AI coding agent loads on demand. Each folder has a `SKILL.md` — instructions plus a description of when to use it — and any scripts it needs. Drop a folder into your agent's skills directory and it loads when the work matches.

## Skills

- **[delegated-engineering](delegated-engineering/)** — Run engineering work as a primary agent that plans and verifies, with delegate agents that execute. Covers the plan/delegate division of labor, writing self-contained delegation kickoffs, and verifying delegated work instead of trusting the report.

- **[feature-cleanup](feature-cleanup/)** — A post-feature maintainability sweep: find dead files, unused dependencies, and dead assets, then produce a safe, delegatable cleanup plan. Analyzes only; never deletes. Bundled scan scripts.

- **[workbench-staging](workbench-staging/)** — Iterate risky changes in a throwaway, git-ignored workbench, verify them there, and copy only the finished result into the real source before committing.

- **[deaify](deaify/)** — A living rulebook of UI patterns that read as AI-generated or templated, each paired with the approved alternative. Apply when building or reviewing UI; it grows as new patterns get flagged.

- **[scroll-taste](scroll-taste/)**: Rules for scroll-driven pages and animated case studies that people can actually read. One swipe, one stop; changes that play on a timer instead of flying past with the scroll; card rails, diagrams over paragraphs, real product screens, captions where the eye is, and a self-review pass that screenshots every stop. Includes the code patterns and review scripts.

- **[swipe-story](swipe-story/)**: Build scroll-driven story pages people can read. One swipe moves to one stop, changes play on a timer instead of being scrubbed by scroll, diagrams carry the argument, and every screen and number comes from the real product. Ships its own scroll engine, page controller, starter template, rules with their reasons, and review scripts that screenshot every stop and check provenance and accessibility.

## Use

Copy a skill folder into your agent's skills directory:

```bash
cp -R feature-cleanup /path/to/project/.claude/skills/
```

## License

MIT
