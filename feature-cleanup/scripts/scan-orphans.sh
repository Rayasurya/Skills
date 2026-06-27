#!/usr/bin/env bash
# Orphaned source files: a file whose import-able basename is referenced by NO other
# source file. Run from the repo root. Usage: scan-orphans.sh [src_dir]
# Heuristic — verify candidates, and RE-RUN after each deletion round (orphans cascade).
# NOTE: no `set -e`/`pipefail` — rg/grep exit non-zero on zero matches (the case we want).
SRC="${1:-src}"
find "$SRC" -type f \( -name '*.jsx' -o -name '*.tsx' -o -name '*.js' -o -name '*.ts' \) \
  | grep -vE '/main\.(jsx|tsx|js|ts)$' \
  | while IFS= read -r f; do
      b="$(basename "$f" | sed -E 's/\.(jsx|tsx|js|ts)$//')"
      # index.* files are referenced by their directory name — skip (report separately if needed)
      [ "$b" = "index" ] && continue
      hits="$(rg -l "\b${b}\b" "$SRC" -g '*.{jsx,tsx,js,ts}' 2>/dev/null | grep -vF "$f" | wc -l | tr -d ' ')"
      [ "$hits" = "0" ] && echo "ORPHAN: $f"
    done
echo "--- done. NOTE: deleting orphans can expose new ones — re-run until this prints no ORPHAN lines."
