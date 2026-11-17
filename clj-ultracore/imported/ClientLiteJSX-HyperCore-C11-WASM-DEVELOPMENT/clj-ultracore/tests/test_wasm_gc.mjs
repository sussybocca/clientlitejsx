import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const wasm=fs.readFileSync(path.join(import.meta.dirname,'hypermem-selftest.wasm'));
const {instance}=await WebAssembly.instantiate(wasm,{});
assert.equal(instance.exports.clj_hyper_selftest(),0,'native C allocator and GC must pass as WASM');
console.log('PASS HyperCore WebAssembly GC: pooled C allocator, root tracing, incremental sweeping, pressure-triggered collection');
