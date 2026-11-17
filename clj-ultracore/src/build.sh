#!/usr/bin/env sh
# Rebuild both native C11 and browser WASM compiler from included source.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$ROOT/bin" "$ROOT/browser"
: "${CC:=cc}"
"$CC" -std=c11 -O2 -Wall -Wextra -Werror -pedantic "$ROOT/src/dialects.c" "$ROOT/src/cli.c" -o "$ROOT/bin/cjs18"
if ! command -v clang >/dev/null 2>&1; then
  echo 'clang required to rebuild WebAssembly. Existing prebuilt .wasm can still run.' >&2; exit 1
fi
clang --target=wasm32 -std=c11 -O2 -fno-builtin -fvisibility=hidden -nostdlib \
  -I"$ROOT/src/freestanding/include" \
  "$ROOT/src/dialects.c" "$ROOT/src/freestanding/libc.c" "$ROOT/src/compiler-wasm.c" \
  -Wl,--no-entry -Wl,--export-memory -Wl,--initial-memory=4194304 -Wl,--max-memory=67108864 \
  -Wl,--export=cjs18_begin -Wl,--export=cjs18_alloc -Wl,--export=cjs18_run \
  -Wl,--export=cjs18_result -Wl,--export=cjs18_length -Wl,--export=cjs18_error \
  -o "$ROOT/browser/cjs18-compiler.wasm"
cp "$ROOT/browser/cjs18-compiler.wasm" "$ROOT/cjs18-compiler.wasm"
echo "Native binary: $ROOT/bin/cjs18"
echo "WebAssembly binary: $ROOT/browser/cjs18-compiler.wasm"
