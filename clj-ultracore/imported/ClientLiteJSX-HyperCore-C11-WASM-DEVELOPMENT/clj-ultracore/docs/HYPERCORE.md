# CLJ HyperCore 0.3 — Native C11 / Browser WebAssembly

HyperCore is an **additive performance expansion** of the standalone ClientLiteJSX (CLJ) 18-dialect compiler. It preserves all 18 dialect fixtures, five character encodings, three compact forms, 18 gameplay examples, styled UI examples, and the browser's opaque-origin preview.

> **Scope:** This is a working optimization development release, **not** an implementation of the complete prior HyperCore specification. It does not replace the original CLJ/OPEN backend and does not compile arbitrary JavaScript/TSX or whole CLJ apps into WASM. The `.wasm` module compiles supported CLJ syntax into browser JS. No Node.js is needed to use the browser compiler or build the compiler; the optional automated JavaScript tests use Node.js.

## Run on Ubuntu

```sh
sudo apt install build-essential clang lld python3
unzip ClientLiteJSX-HyperCore-C11-WASM-DEVELOPMENT.zip
cd clj-ultracore
sh scripts/build.sh
sh scripts/test.sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8000/browser/index.html` in Firefox or Chrome. CLJ Studio uses a Web Worker if supported, falling back to direct WASM compilation. Firefox/Chrome must load over HTTP or HTTPS, not `file://`.

## Main artifacts

- `src/dialects.c`, `src/rich.c`: real C11 dialect/typed CLJ code generator.
- `src/hypermem.c` / `src/hypermem.h`: C11 allocator, slab pools, reusable free lists, nonmoving generational collector, arena checkpoints, telemetry.
- `src/compiler-wasm.c`: C11 browser ABI, four-entry exact-source cache with digest+byte comparison, memory/benchmark counters.
- `src/freestanding/libc.c`: C11 browser WASM allocator shim; no WASI or third-party allocator.
- `browser/cjs18-compiler.wasm`: compiled from the above C sources.
- `browser/compiler-loader.mjs`: streaming WASM loading, growth-safe memory access and telemetry.
- `browser/compiler-worker.mjs` and `browser/compiler-client.mjs`: optional worker execution, async message protocol, error handling, disposal.
- `bin/cjs18`: native command-line compiler (prebuilt convenience binary; rebuild locally for your Linux distribution).
- `bin/clj-hyper-build`: native incremental multi-file build tool (Ubuntu/Linux POSIX host).
- `tests/hypermem-selftest.wasm`: WASM-compiled allocator/GC self-test.

## Hybrid allocator and memory policy

**CLJ HyperAllocator**, written from scratch in C, uses separate paths for small objects and large buffers. Small allocations use nine size classes (16 B to 4096 B) and page-based slab free lists. Larger buffers reuse free blocks, split excess capacity, and coalesce adjacent blocks only within a common backing region. `realloc` may reuse its original block when capacity permits or extend it into an adjacent free large block. Bump-based temporary `CljArena` allocations support marks, rewind and complete release.

For the browser, memory grows through wasm32 `memory.grow`; the compiler resets its short-lived allocations between compilations without reclaiming or reallocating the entire WASM module. The WebAssembly linker currently starts at 4 MiB; the maximum is selected by profile (32 MiB, 64 MiB or 128 MiB). Growth is controlled and checked for allocation failure. `clj_hyper_stats` reports allocation counts, reuse, live/peak bytes, raw reserved bytes and reusable blocks.

**HyperGC** is an opt-in collector for registered managed objects, *not* a collector for arbitrary raw C pointers. Managed objects use a nonmoving handle and up to four reference slots. Roots are explicitly registered using `clj_gc_root(&gc,obj)`. The collector supports mark/sweep, young/old age promotion, incremental `clj_gc_step`, old-to-young remembered edges, mutation barriers, full or young-only collections, and pressure-based triggering. Normal compiler temporary data uses arenas rather than this collector. This avoids moving pointers and leaves the browser's JavaScript GC unchanged.

```c
#include "hypermem.h"
CljGC gc;
clj_gc_init(&gc);
CljGCObject *a=clj_gc_new(&gc,128);
clj_gc_root(&gc,a);
/* Link a to other managed nodes via clj_gc_link(&gc,a,slot,child). */
clj_gc_collect(&gc,0); /* full collection */
clj_gc_unroot(a);
clj_gc_collect(&gc,0);
clj_gc_destroy(&gc);
```

Do not call `clj_hyper_reset()` while live arena chunks, GC objects or raw pointers are still needed; it invalidates the entire temporary allocation space. The compiler's `cjs18_begin()` resets only after the caller has copied the prior output. Do not use raw pointers as movable GC references. The current collector does not perform moving compaction.

## Optimized browser compilation

`loadCJS18()` can use `WebAssembly.instantiateStreaming()` when a server sends `application/wasm`, with `instantiate(arrayBuffer)` fallback. It always reacquires views after operations that may grow linear memory. It exposes:

```js
import {loadCJS18} from './browser/compiler-loader.mjs';
const compiler=await loadCJS18();
const code=compiler.compile(':"R-CJS:Canvas:\n    :"Render"""TXT HW"""');
console.log(code);
console.log(compiler.stats());
```

Or compile asynchronously in a module worker:

```js
import {createHyperCoreWorker} from './browser/compiler-client.mjs';
const worker=createHyperCoreWorker();
const {javascript,stats}=await worker.compile(source,{stats:true});
console.log(javascript,stats);
worker.dispose();
```

The compiler's four-entry exact-input C cache stores only inputs up to 32 KiB and outputs up to 128 KiB. The hash is verified against input bytes, so collisions cannot substitute another program. Larger programs compile normally. Cache entries stay valid only within the same loaded compiler instance. Worker messages transfer strings, not arbitrary privileged data.

## Native incremental project builder

```sh
sh scripts/build.sh
./bin/clj-hyper-build /path/to/project /path/to/dist
```

Scans `.clj` source files recursively, computes content fingerprints, reuses existing `.mjs` output when fingerprints match and skips unchanged modules. A manifest is saved under `dist/.hypercache.tsv`. The optional comment `// clj-dep: shared/state.clj` tells the incremental build which source dependencies affect the cache key. This is *dependency invalidation metadata*, not runtime import/bundling semantics. The builder checks paths, skips symlinks and blocked directories, stages changed outputs before publishing, keeps last-good output after failed compilation, and removes output of deleted `.clj` inputs. It does not replace the complete original CLJ package manager or JavaScript bundler.

## Generated browser runtime optimization

The C code generator now gives each compiled UI node a stable identity, reuses its DOM element, only updates text when changed, and only reattaches the component tree when conditional structural changes require it. Click handlers are installed once per button. This reduces DOM churn in the score/timer game and can improve smoothness, although it does not eliminate browser layout and paint costs. The test suite checks that ordinary timer ticks and score updates avoid recreating elements.

## Build profiles

Set these environment variables when calling `sh scripts/build.sh`:

| CLJ_PROFILE | C/WASM choices | Intended purpose |
|---|---|---|
| development | `-O0` native, `-O1` WASM | rapid debugging |
| balanced (default) | `-O2` | general use |
| compact | `-Os` native, `-Oz` WASM, 64 MiB max | binary size |
| max-runtime | `-O3`, 128 MiB max | more aggressive optimization |
| low-memory | `-Os/-Oz`, 32 MiB max | constrained systems |
| auto | equivalent to balanced | conservative compatibility |

Optional `CLJ_SIMD=1` enables Clang's `-msimd128` on WASM builds; it is not guaranteed faster and requires compatible browser engines. Optional `CLJ_WASM_OPT=1` uses an installed Binaryen `wasm-opt -O3` pass. Link-time optimization is enabled for WASM. Profiles must be benchmarked on the actual workload; these names are goals, not speed guarantees.

## Limits and remaining research

- Supported 18 dialect fixtures and typed UI/game subset retained; this is **not** a general-purpose JSX/TSX compiler.
- Source input is limited to 4 MiB; compiled JS output is limited to 2 MiB by the compiler and browser bridge. Individual instruction/line bounds still apply.
- No moving GC, precise write-barrier instrumentation across arbitrary C pointer graphs, concurrent GC or compacting heap.
- The GC is opt-in for persistent native/WASM objects; it does not manage JavaScript objects created by the browser runtime.
- No complete dependency-aware incremental *parser* or cross-file linker; the project builder caches whole files with declared dependency hints.
- No general PGO training workflow, adaptive GPU simulation, native 3D renderer, automatic partial hydration or full browser WasmGC backend.
- The native multi-file builder targets POSIX Linux/Ubuntu; the C compiler core and freestanding WASM build remain separate.

## Run validations

```sh
sh scripts/test.sh                         # native, WASM, 18 dialects, games, memory, cache, DOM
sh scripts/test-sanitizers.sh              # native AddressSanitizer + UndefinedBehaviorSanitizer
RUN_BROWSER=1 sh scripts/test.sh           # optional Chromium+Playwright in-memory browser test
node scripts/benchmark.mjs                 # optional, diagnostic warmed-cache benchmark
node scripts/compare-baseline.mjs OLD.wasm # optional, compare with prior release on same machine
```

No speedup or 80–90% feature-completion figure should be claimed without measured results and a feature-parity audit. See `docs/BENCHMARKS.md` and `docs/FEATURE_MATRIX.md`.
