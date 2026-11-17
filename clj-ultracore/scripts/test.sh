#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
sh "$ROOT/scripts/build.sh"
python3 "$ROOT/tests/test_release.py"
if command -v node >/dev/null 2>&1; then
  node "$ROOT/tests/typed_parity.mjs"
  node "$ROOT/tests/styled_game_runtime.mjs" "$ROOT/examples/ui/compiled/neon-score-arena.mjs"
else
  echo 'Node.js not installed: optional JavaScript runtime parity tests skipped; compiler and browser do not need Node.js.'
fi
