#!/usr/bin/env bash
# Orphaned assets: files in the assets dir imported nowhere in src/. Biggest first (bytes).
# Run from repo root. Usage: scan-assets.sh [src_dir] [assets_dir]
# Run this AFTER deleting dead source files — some assets are only used by dead components (cascade).
# NOTE: no `set -e`/`pipefail` — rg exits non-zero on zero matches (the case we want).
SRC="${1:-src}"
ASSETS="${2:-src/assets}"
find "$ASSETS" -type f 2>/dev/null | while IFS= read -r f; do
  b="$(basename "$f")"
  hits="$(rg -l "$b" "$SRC" -g '*.{jsx,tsx,js,ts}' 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$hits" = "0" ]; then
    sz="$(wc -c < "$f" | tr -d ' ')"
    printf '%s\t%s\n' "$sz" "$f"
  fi
done | sort -rn
echo "--- bytes are shown first; the big ones are the win. .DS_Store and stray exports are usually safe."
