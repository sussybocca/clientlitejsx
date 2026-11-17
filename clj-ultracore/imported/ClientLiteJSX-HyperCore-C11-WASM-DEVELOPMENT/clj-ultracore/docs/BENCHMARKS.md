# CLJ HyperCore performance baseline — measured, not projected

**Test system:** development container, Linux x86-64, Node.js 22.16, Clang 17, GCC, 2026-11-17. These results do **not** describe the user's Ubuntu PC or actual GPU frame rate. Timings vary significantly between runs due to JIT warmup and scheduling. Run on your own system to compare.

The comparison uses the immediately previous published `cjs18-compiler.wasm` (52,991 bytes) and the newly built HyperCore compiler under identical input cases. The output runtime has also changed (DOM reuse), so byte-for-byte output with the old release is not expected; native C and HyperCore WASM still match each other.

Example measurements in this environment:

| Metric | Previous CLJ WASM | HyperCore (balanced) | Interpretation |
|---|---:|---:|---|
| WASM binary size | 52,991 B | ~69 KB | HyperCore includes allocator, GC, cache, and telemetry |
| 18 distinct game compilations | ~3.7–3.8 ms observed | ~3.3–4.2 ms observed | similar; variation means no reliable cold-speedup claim |
| Repeated identical warmed compile | ~0.095–0.097 ms | ~0.002–0.004 ms | major repeated-source cache benefit, not cold compile throughput |
| UI update churn | whole tree replaced every render | node identity retained when structure unchanged | demonstrated in DOM behavior test, not a measured FPS claim |

In other development runs, first-pass 18-input compilation was slower for HyperCore; the result depends on optimizer profile and JIT state. **Do not interpret this table as a universal 10× or 100× compiler speedup.** A warmed exact-input cache directly reuses prior output and therefore measures a different workload than compiling new source.

## Benchmark yourself

```sh
node scripts/benchmark.mjs
node scripts/compare-baseline.mjs /path/to/previous/cjs18-compiler.wasm
```

`CLJ_PROFILE=compact sh src/build.sh` prioritizes size; `CLJ_PROFILE=max-runtime sh src/build.sh` prioritizes optimization. `CLJ_SIMD=1` enables optional SIMD. Always rerun `sh scripts/test.sh` after changing profiles. Test cold build, warm build, memory, browser input responsiveness, 1% low FPS, and p95/p99 frame time on actual projects before choosing a profile.

**Known scope gap:** 3D Stress Lab, GPU frame pacing, Open/CLJ backend APIs, full application WASM code generation, and performance of large general-purpose projects have not been re-benchmarked with this standalone compiler release.
