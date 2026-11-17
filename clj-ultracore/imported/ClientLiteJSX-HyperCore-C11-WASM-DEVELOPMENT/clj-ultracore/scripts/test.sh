#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
sh "$ROOT/scripts/build.sh"
python3 "$ROOT/tests/test_release.py"
"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -pedantic "$ROOT/src/hypermem.c" "$ROOT/tests/test_hypermem.c" -o "$ROOT/bin/test_hypermem"
"$ROOT/bin/test_hypermem"
python3 "$ROOT/tests/test_project.py"
if command -v node >/dev/null 2>&1;then
 node "$ROOT/tests/test_wasm_gc.mjs"
 node "$ROOT/tests/test_hyper_wasm.mjs"
 node "$ROOT/tests/typed_parity.mjs"
 node "$ROOT/tests/styled_game_runtime.mjs" "$ROOT/examples/ui/compiled/neon-score-arena.mjs"
 TMP=$(mktemp "${TMPDIR:-/tmp}/clj-hyper-dom-XXXXXXXX.mjs")
 trap 'rm -f "$TMP"' EXIT HUP INT TERM
 "$ROOT/bin/cjs18" compile "$ROOT/examples/ui/neon-score-arena.clj" "$TMP" >/dev/null
 node "$ROOT/tests/test_dom_reuse.mjs" "$TMP"
 rm -f "$TMP"
 trap - EXIT HUP INT TERM
else
 echo 'Node.js unavailable: optional JS behavioral tests skipped; CLJ native/WASM compilers do not require Node.js to operate.'
fi
if [ "${RUN_BROWSER:-0}" = 1 ];then
 python3 "$ROOT/tests/browser_in_memory.py"
fi
