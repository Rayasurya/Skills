#!/bin/bash
# new.sh: start a build folder from the swipe-story kit and template.
#   bash new.sh <build-dir>
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$1"; [ -z "$DEST" ] && { echo "usage: bash new.sh <build-dir>"; exit 1; }
[ -e "$DEST/index.html" ] && { echo "$DEST already has an index.html"; exit 1; }
mkdir -p "$DEST/assets"
cp "$SKILL"/kit/{stage.js,story.js,story.css,lenis.min.js} "$DEST"/
cp "$SKILL"/template/{index.html,scenes.js,page.css} "$DEST"/
cp "$SKILL"/kit/THIRD-PARTY-NOTICES.txt "$DEST"/
cp "$SKILL"/scripts/serve.py "$DEST"/
cat > "$DEST/README.md" <<'MD'
# [Product] story page

Run: `python3 serve.py 4700`

## Sources of truth
- Copy: [where the words came from]
- Screens: [captured from what, when, how]
- Numbers: [which code or data computes them]

## Decisions made while building
1. ...

## Claims removed or changed
- ...
MD
echo "New build in $DEST. Next: python3 $DEST/serve.py 4700"
