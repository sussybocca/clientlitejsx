/** Benchmark original and HyperCore on identical inputs.
 * Run with path to original release WASM; measurements vary by machine. */
import fs from 'node:fs';import path from 'node:path';import {performance} from 'node:perf_hooks';
const root=path.resolve(import.meta.dirname,'..');
const baseline=process.argv[2],current=path.join(root,'browser/cjs18-compiler.wasm');
if(!baseline)throw Error('Usage: node scripts/compare-baseline.mjs /path/to/old.wasm');
const sources=Array.from({length:18},(_,i)=>{
 const prefix=String(i+1).padStart(2,'0')+'-';
 const match=fs.readdirSync(path.join(root,'examples/games')).find(f=>f.startsWith(prefix));
 if(!match)throw Error('Missing game '+prefix);
 return new TextEncoder().encode(fs.readFileSync(path.join(root,'examples/games',match),'utf8'));
});
async function bench(file){
 const b=fs.readFileSync(file),{instance}=await WebAssembly.instantiate(b,{}),e=instance.exports;
 function compile(input){e.cjs18_begin();const p=e.cjs18_alloc(input.length);
  if(!p)throw Error('Allocation failure');new Uint8Array(e.memory.buffer,p,input.length).set(input);
  if(e.cjs18_run(p,input.length))throw Error('Compile failure');return e.cjs18_length();}
 let t0=performance.now();for(const input of sources)compile(input);const cold=performance.now()-t0;
 // Warmup both compilers under the same workload.
 for(let i=0;i<80;i++)compile(sources[0]);
 const n=2000,times=[];
 for(let k=0;k<5;k++){const start=performance.now();for(let i=0;i<n;i++)compile(sources[0]);times.push((performance.now()-start)/n);}
 times.sort((a,b)=>a-b);return {wasmBytes:b.length,distinct18Milliseconds:+cold.toFixed(3),medianWarmMillisecondsPerBuild:+times[2].toFixed(5),cacheHits:e.cjs18_cache_hits?.()??0};
}
console.log(JSON.stringify({baseline:await bench(baseline),hypercore:await bench(current),note:'One-machine measurements. Warm-cache benefit is not equivalent to first-time compilation performance.'},null,2));
