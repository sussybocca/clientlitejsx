import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const bytes=fs.readFileSync(path.join(root,'browser/cjs18-compiler.wasm'));
assert.equal(bytes.subarray(0,4).toString('hex'),'0061736d');
const {instance}=await WebAssembly.instantiate(bytes,{});
const e=instance.exports,enc=new TextEncoder(),dec=new TextDecoder();
const compile=(text)=>{
 const data=enc.encode(text);e.cjs18_begin();const p=e.cjs18_alloc(data.length);assert.ok(p);
 new Uint8Array(e.memory.buffer,p,data.length).set(data);
 assert.equal(e.cjs18_run(p,data.length),0);
 const o=e.cjs18_result(),n=e.cjs18_length();
 return dec.decode(new Uint8Array(e.memory.buffer,o,n));
};
let initial=compile(fs.readFileSync(path.join(root,'examples/games/11-dotpulse.clj'),'utf8'));
assert.ok(initial.includes('mountCJS18'));
const before=e.cjs18_cache_hits();
assert.equal(compile(fs.readFileSync(path.join(root,'examples/games/11-dotpulse.clj'),'utf8')),initial);
assert.equal(e.cjs18_cache_hits(),before+1);
for(let i=1;i<=18;i++){
 const slug=String(i).padStart(2,'0');
 const f=fs.readdirSync(path.join(root,'examples/games')).find(n=>n.startsWith(slug+'-'));
 assert.ok(f);
 const src=fs.readFileSync(path.join(root,'examples/games',f),'utf8');
 assert.ok(compile(src).includes('mountCJS18'));
}
// Extended bounded allocations and a stale linear-memory view regression.
e.cjs18_begin();let start=e.memory.buffer.byteLength;
for(let i=0;i<3;i++){const p=e.cjs18_alloc(3800000);assert.ok(p);const view=new Uint8Array(e.memory.buffer,p,16);view[0]=i+1;}
assert.ok(e.memory.buffer.byteLength>=start);
assert.ok(e.cjs18_memory_peak()>=3800000);
e.cjs18_begin();
assert.equal(compile(fs.readFileSync(path.join(root,'examples/01.clj'),'utf8')).includes('OPEN.LiveSource'),true);
console.log('PASS HyperCore WASM: 18 dialect games, persistent exact-input C cache, expanded linear memory, repeated resets');
