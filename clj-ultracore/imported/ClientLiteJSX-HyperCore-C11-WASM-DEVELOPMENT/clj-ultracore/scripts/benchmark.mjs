/** Diagnostic benchmark, not an implied performance guarantee. */
import {performance} from 'node:perf_hooks';
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const {instance}=await WebAssembly.instantiate(fs.readFileSync(path.join(root,'browser/cjs18-compiler.wasm')),{});
const ex=instance.exports,encoder=new TextEncoder();
const game=encoder.encode(fs.readFileSync(path.join(root,'examples/games/11-dotpulse.clj'),'utf8'));
function run(){ex.cjs18_begin();const p=ex.cjs18_alloc(game.length);new Uint8Array(ex.memory.buffer,p,game.length).set(game);if(ex.cjs18_run(p,game.length))throw Error('Benchmark compilation failed');}
run();const n=500;let start=performance.now();for(let i=0;i<n;i++)run();let ms=performance.now()-start;
console.log(JSON.stringify({test:'identical warmed game compilation',iterations:n,totalMilliseconds:Number(ms.toFixed(2)),millisecondsPerCompile:Number((ms/n).toFixed(4)),cacheHits:ex.cjs18_cache_hits(),memoryPeak:ex.cjs18_memory_peak(),memoryReuses:ex.cjs18_memory_reuses(),binaryBytes:fs.statSync(path.join(root,'browser/cjs18-compiler.wasm')).size},null,2));
