#!/usr/bin/env sh
# Diagnostic memory-safety verification; requires GCC or Clang sanitizer support.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT HUP INT TERM
: "${CC:=cc}"
"$CC" -std=c11 -g -O1 -fno-omit-frame-pointer -fsanitize=address,undefined \
 "$ROOT/src/hypermem.c" "$ROOT/tests/test_hypermem.c" -o "$TMP/memory"
ASAN_OPTIONS=detect_leaks=1 "$TMP/memory"
"$CC" -std=c11 -g -O1 -fno-omit-frame-pointer -fsanitize=address,undefined -DCLJ_HYPER_NATIVE \
 "$ROOT/src/dialects.c" "$ROOT/src/hypermem.c" "$ROOT/src/cli.c" -o "$TMP/cjs18"
for file in "$ROOT"/examples/games/*.clj "$ROOT"/examples/ui/*.clj;do
 ASAN_OPTIONS=detect_leaks=1 "$TMP/cjs18" check "$file" >/dev/null
done
echo 'PASS HyperCore sanitizer suite: memory allocator/GC and all game/UI compiler fixtures'
