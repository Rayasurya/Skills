#!/bin/bash
# provenance.sh: before using a screen recording or screenshot, check that
# its distinctive on-screen labels exist in the owner's own code history.
# A label that never existed there means the footage is someone else's.
#   bash provenance.sh <git-repo> "Label one" "Label two" ...
set -e
REPO="$1"; shift
[ -d "$REPO/.git" ] || { echo "not a git repo: $REPO"; exit 1; }
miss=0
for L in "$@"; do
  hits=$(git -C "$REPO" log --all --oneline -S"$L" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$hits" -gt 0 ]; then echo "found    \"$L\" ($hits commits)"; else echo "MISSING  \"$L\""; miss=1; fi
done
[ $miss -eq 1 ] && echo "Some labels never existed in this code. Do not use that footage." || echo "All labels exist in the owner's history."
