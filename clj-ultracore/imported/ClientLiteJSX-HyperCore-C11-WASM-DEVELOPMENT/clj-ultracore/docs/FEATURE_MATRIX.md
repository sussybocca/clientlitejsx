# CLJ HyperCore — Implementation & Acceptance Matrix

These statuses reflect tested source changes in this ZIP, not planned features treated as completed.

| Research expansion | Status in development ZIP | Verification / limitation |
|---|---|---|
| C11 pooled size-class / slab allocator | Implemented | native randomized allocation test + WASM selftest |
| C11 segregated free lists | Implemented | nine small classes + large reusable list |
| Large-block split, coalesce and in-place `realloc` | Implemented | native 50,000-operation memory test |
| Reusable arenas with checkpoints | Implemented | native arena mark/rewind test |
| Native thread-local arena scheduler | Not implemented | separate `CljArena` objects are usable per thread, but no TLS policy |
| Buddy allocator | Not implemented | large-block split/coalesce is not full buddy allocation |
| Allocation telemetry/fragmentation visibility | Partial | reusable bytes, free blocks, high-water marks; no detailed per-page fragmentation map |
| Explicit-root precise GC | Implemented for managed objects | native and WASM GC tests |
| Incremental mark/sweep | Implemented | bounded `clj_gc_step` test |
| Young/old collection and remembered edges | Implemented for managed objects | age promotion + old-to-young handling |
| Write barrier | Implemented for `clj_gc_link` | applies to managed references, not arbitrary C pointers |
| Adaptive pressure-triggered collections | Basic | budget and young-object thresholds, no policy self-tuning |
| Moving/compacting GC | Not implemented | would require stable indirection to preserve C pointer safety |
| Browser WasmGC object backend | Not implemented | ordinary linear memory remains in use |
| Zero-copy lexical span batching | Implemented | 18-dialect parity tests |
| String interning | Not implemented | future compiler IR optimization |
| Shared 18-dialect semantics | Preserved | 18 native/WASM + runtime games |
| Exact-input compiled output cache in C WASM | Implemented | collision-safe 4-entry cache, 32 KiB input threshold |
| Native content-addressed multi-file build cache | Implemented | `clj-hyper-build`, declared dependency hints |
| Incremental AST reparse | Not implemented | file-level rebuilds, not partial AST reparse |
| Full module linker and general JS optimizations | Not implemented | bounded CLJ language subset |
| WASM streaming load and fallback | Implemented | loader code, browser integration tests |
| Compiled WASM instance reuse | Implemented | loader memoizes by URL |
| Worker compilation | Implemented optional | asynchronous browser module-worker path, fallback |
| SIMD WASM optimization | Optional build flag | capability flag, no demonstrated universal speed gain |
| LTO + configurable optimization levels | Implemented | Clang LTO / 5 profiles |
| Binaryen wasm-opt | Optional external optimization | only if installed and selected |
| Profile-guided optimization training | Not implemented | no stored real-world traces |
| Reactive DOM node reuse | Implemented for typed UI | node/listener reuse tests + game |
| Fine-grained state subscription | Partial | node reuse on render; no full dependency scheduler |
| Delegated events and lazy hydration | Not implemented | listeners still per button, installed once |
| GPU adaptive quality / 3D render engine | Not implemented in this compiler-only package | not claimed |
| Memory safety validation | Implemented tests | ASAN/UBSAN, native/WASM and failure behavior |
| Complete Node.js-free original CLJ/OPEN backend | Not implemented | portable compiler does not replace server features |

**Release classification:** verified development expansion, not certified as the user's full 80–90% acceptance build. Prior functions and examples are retained. This ZIP is not a complete implementation of every concept in the HyperCore research plan.
