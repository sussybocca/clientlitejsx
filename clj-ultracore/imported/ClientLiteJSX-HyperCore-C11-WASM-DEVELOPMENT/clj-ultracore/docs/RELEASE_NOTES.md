# CLJ HyperCore v0.3 Development Release

- New original C11 hybrid allocator (`hypermem.c/.h`) with small-object slabs, nine size classes, large-block free list, split/coalesce, capacity-preserving `realloc`, reusable arenas, telemetry and GC.
- New opt-in managed GC: explicit roots, cycles, young/old generations, remembered references, nonmoving incremental tracing/sweeping, mutation barriers, pressure trigger.
- Both allocator and collector compile into browser WebAssembly and have native and WASM self-tests.
- Browser compiler now uses a four-entry C exact-source cache (digest verified against bytes) and exposes memory/cache statistics.
- WASM loader now supports streaming instantiation with fallback, growth-safe views and memoized instances by URL.
- Optional module Worker compiler and async client keep the UI responsive to editing operations.
- Native POSIX `clj-hyper-build` introduces content-addressed incremental compilation of `.clj` modules and safe declared dependency invalidation.
- Native C lexer batches ordinary source slices; generated UI reuses nodes and event listeners rather than rebuilding all elements on every state update.
- Build supports development, balanced, compact, max-runtime, low-memory and auto profiles, optional SIMD and optional Binaryen wasm-opt.
- Preserved all 18 dialects, five keyword encodings, three compact variants, all existing examples and no-Node browser compiler.
- Upgraded example compiled JavaScript for all 16 CLJ UI themes; fixed a prior stack-lifetime bug found during sanitizer validation.
- Extended test suite covers 50,000 randomized allocations, GC, 18 dialect game parity, UI state, memory growth, incremental project builds and browser WASM.

Not complete: moving/compacting GC, buddy allocator, fine-grained AST incremental parser, PGO training, comprehensive UI dependency scheduler, full TypeScript/JS support, full original CLJ backend replacement. See `FEATURE_MATRIX.md`. Nothing in this package has been pushed to GitHub by this build.
