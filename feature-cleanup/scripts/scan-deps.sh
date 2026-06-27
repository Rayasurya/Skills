#!/usr/bin/env bash
# Unused dependencies: declared in package.json but not imported in src/.
# For each, also count refs in vite.config/*.config/scripts — a count >0 means it is
# likely a build plugin (e.g. @mdx-js/rollup, sharp, rehype-*/remark-*) → VERIFY, don't blind-delete.
# Run from repo root. Usage: scan-deps.sh [src_dir]
# NOTE: no `set -e`/`pipefail` — rg exits non-zero on zero matches, which is the case we want.
SRC="${1:-src}"
for dep in $(node -e "const p=require('./package.json'); console.log(Object.keys(p.dependencies||{}).join(' '))"); do
  src_hits="$(rg -l "from ['\"]${dep}|import\(['\"]${dep}|require\(['\"]${dep}" "$SRC" 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$src_hits" = "0" ]; then
    cfg_hits="$(rg -l "${dep}" vite.config.* *.config.* scripts/ 2>/dev/null | wc -l | tr -d ' ')"
    if [ "$cfg_hits" = "0" ]; then
      echo "UNUSED: ${dep}   (0 src imports, 0 config refs — safe to remove)"
    else
      echo "VERIFY: ${dep}   (0 src imports, ${cfg_hits} config/script ref(s) — likely a build plugin; confirm before removing)"
    fi
  fi
done
echo "--- also: if a removed dep is named in vite.config manualChunks, delete that dead chunk line too."
