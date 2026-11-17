#!/usr/bin/env sh
# CLJ HyperCore — native C11 + freestanding wasm32 reproducible compilation.
# CLJ_PROFILE: development, balanced, compact, max-runtime, low-memory, auto.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$ROOT/bin" "$ROOT/browser"
: "${CC:=cc}"; : "${CLJ_PROFILE:=balanced}"; : "${CLJ_SIMD:=0}"; : "${CLJ_WASM_OPT:=0}"
case "$CLJ_PROFILE" in
  development) NATIVE_OPT=-O0;WASM_OPT=-O1;MAX_MEM=134217728;;
  balanced|auto) NATIVE_OPT=-O2;WASM_OPT=-O2;MAX_MEM=134217728;;
  compact) NATIVE_OPT=-Os;WASM_OPT=-Oz;MAX_MEM=67108864;;
  max-runtime) NATIVE_OPT=-O3;WASM_OPT=-O3;MAX_MEM=134217728;;
  low-memory) NATIVE_OPT=-Os;WASM_OPT=-Oz;MAX_MEM=33554432;;
  *) echo "Unsupported CLJ_PROFILE: $CLJ_PROFILE" >&2;exit 2;;
esac
SIMD_FLAG=
if [ "$CLJ_SIMD" = 1 ]; then SIMD_FLAG=-msimd128;
elif [ "$CLJ_SIMD" != 0 ]; then echo 'CLJ_SIMD must be 0 or 1' >&2; exit 2;fi
"$CC" -std=c11 "$NATIVE_OPT" -Wall -Wextra -Werror -pedantic -DCLJ_HYPER_NATIVE \
  "$ROOT/src/dialects.c" "$ROOT/src/hypermem.c" "$ROOT/src/cli.c" -o "$ROOT/bin/cjs18.tmp"
"$CC" -std=c11 "$NATIVE_OPT" -Wall -Wextra -Werror -pedantic -DCLJ_HYPER_NATIVE \
  "$ROOT/src/dialects.c" "$ROOT/src/hypermem.c" "$ROOT/src/hyperproject.c" -o "$ROOT/bin/clj-hyper-build.tmp"
if ! command -v clang >/dev/null 2>&1; then
  rm -f "$ROOT/bin/cjs18.tmp"
  echo 'clang required to rebuild WebAssembly. Existing compiled WASM remains available.' >&2;exit 1
fi
if ! clang --target=wasm32 -std=c11 "$WASM_OPT" $SIMD_FLAG \
  -fno-builtin -fvisibility=hidden -nostdlib -DCLJ_WASM -flto \
  -I"$ROOT/src/freestanding/include" \
  "$ROOT/src/dialects.c" "$ROOT/src/hypermem.c" \
  "$ROOT/src/freestanding/libc.c" "$ROOT/src/compiler-wasm.c" \
  -Wl,--no-entry -Wl,--export-memory -Wl,--initial-memory=4194304 -Wl,--max-memory="$MAX_MEM" \
  -Wl,--export=cjs18_begin -Wl,--export=cjs18_alloc -Wl,--export=cjs18_run \
  -Wl,--export=cjs18_result -Wl,--export=cjs18_length -Wl,--export=cjs18_error \
  -Wl,--export=cjs18_cache_hits -Wl,--export=cjs18_memory_peak -Wl,--export=cjs18_memory_reuses -Wl,--export=cjs18_memory_reusable \
  -o "$ROOT/browser/cjs18-compiler.wasm.tmp"; then
  rm -f "$ROOT/bin/cjs18.tmp" "$ROOT/browser/cjs18-compiler.wasm.tmp";exit 1
fi
if [ "$CLJ_WASM_OPT" = 1 ]; then
  if ! command -v wasm-opt >/dev/null 2>&1; then
    rm -f "$ROOT/bin/cjs18.tmp" "$ROOT/browser/cjs18-compiler.wasm.tmp"
    echo 'CLJ_WASM_OPT=1 requires the optional Binaryen wasm-opt utility' >&2;exit 1
  fi
  wasm-opt -O3 "$ROOT/browser/cjs18-compiler.wasm.tmp" -o "$ROOT/browser/cjs18-compiler.wasm.opt"
  mv "$ROOT/browser/cjs18-compiler.wasm.opt" "$ROOT/browser/cjs18-compiler.wasm.tmp"
elif [ "$CLJ_WASM_OPT" != 0 ]; then
  echo 'CLJ_WASM_OPT must be 0 or 1' >&2;exit 2
fi
# Standalone WASM memory-manager self-test (runs the same C allocator + GC).
clang --target=wasm32 -std=c11 -O2 -fno-builtin -nostdlib -DCLJ_WASM -flto \
  -I"$ROOT/src/freestanding/include" \
  "$ROOT/src/hypermem.c" "$ROOT/src/freestanding/libc.c" "$ROOT/src/hypermem-selftest-wasm.c" \
  -Wl,--no-entry -Wl,--export-memory -Wl,--initial-memory=4194304 -Wl,--max-memory=33554432 \
  -Wl,--export=clj_hyper_selftest -o "$ROOT/tests/hypermem-selftest.wasm.tmp"
mv "$ROOT/tests/hypermem-selftest.wasm.tmp" "$ROOT/tests/hypermem-selftest.wasm"
mv "$ROOT/bin/cjs18.tmp" "$ROOT/bin/cjs18"
mv "$ROOT/bin/clj-hyper-build.tmp" "$ROOT/bin/clj-hyper-build"
mv "$ROOT/browser/cjs18-compiler.wasm.tmp" "$ROOT/browser/cjs18-compiler.wasm"
cp "$ROOT/browser/cjs18-compiler.wasm" "$ROOT/cjs18-compiler.wasm"
echo "CLJ HyperCore profile: $CLJ_PROFILE; SIMD: $CLJ_SIMD; wasm-opt: $CLJ_WASM_OPT"
echo "Native binary: $ROOT/bin/cjs18"
echo "WebAssembly binary: $ROOT/browser/cjs18-compiler.wasm"
